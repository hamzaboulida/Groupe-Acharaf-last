import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { eq } from "drizzle-orm";
import router from "./routes";
import seoRouter from "./routes/seo";
import { logger } from "./lib/logger";
import { db, projectsTable } from "@workspace/db";
import {
  uploadDir,
  uploadUrlPath,
  isGcsEnabled,
  readGcsObjectStream,
} from "./lib/upload-storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function slugifyProjectTitle(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isReadOnlyMode = process.env["READ_ONLY_MODE"] === "true";
if (isReadOnlyMode) {
  app.use("/api", (req, res, next) => {
    const method = req.method.toUpperCase();
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
      next();
      return;
    }

    res.status(503).json({
      message:
        "API locale en mode lecture seule. Les modifications sont désactivées pour protéger les données de production.",
    });
  });
}

app.use(
  uploadUrlPath,
  express.static(uploadDir, {
    immutable: true,
    maxAge: "30d",
  }),
);

const uploadsUpstreamBaseUrl = process.env["UPLOADS_UPSTREAM_BASE_URL"]?.replace(/\/+$/, "");

if (isGcsEnabled) {
  const escapedUploadPath = uploadUrlPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\/+$/, "");
  const uploadPathRegex = new RegExp(`^${escapedUploadPath}/(.+)$`);

  app.get(uploadPathRegex, async (req, res) => {
    const objectPath = req.params[0];
    if (!objectPath) {
      res.status(404).send("File not found");
      return;
    }

    try {
      const rangeHeader = req.headers.range;

      if (rangeHeader) {
        // Query metadata first to get total size
        const streamPayload = await readGcsObjectStream(objectPath);
        if (!streamPayload) {
          res.status(404).send("File not found");
          return;
        }

        const totalSize = Number(streamPayload.metadata.size || 0);
        const parts = rangeHeader.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

        if (start >= totalSize || end >= totalSize) {
          res.status(416).setHeader("Content-Range", `bytes */${totalSize}`);
          res.end();
          return;
        }

        const chunksize = (end - start) + 1;

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${totalSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": streamPayload.metadata.contentType || "video/mp4",
          "Cache-Control": streamPayload.metadata.cacheControl || "public, max-age=31536000",
        });

        // Request partial stream
        const partialPayload = await readGcsObjectStream(objectPath, { start, end });
        if (!partialPayload) {
          res.status(404).send("File not found");
          return;
        }

        partialPayload.stream.on("error", (err: any) => {
          logger.error({ err, objectPath }, "Error streaming partial media from GCS");
          if (!res.headersSent) {
            res.status(500).send("Storage read error");
          }
        });
        partialPayload.stream.pipe(res);
        return;
      }

      // Standard non-range request fallback
      const streamPayload = await readGcsObjectStream(objectPath);
      if (!streamPayload) {
        res.status(404).send("File not found");
        return;
      }

      if (streamPayload.metadata.contentType) {
        res.setHeader("Content-Type", streamPayload.metadata.contentType);
      }
      if (streamPayload.metadata.cacheControl) {
        res.setHeader("Cache-Control", streamPayload.metadata.cacheControl);
      }
      res.setHeader("Accept-Ranges", "bytes");

      streamPayload.stream.on("error", (err: any) => {
        logger.error({ err, objectPath }, "Error streaming media from GCS");
        if (!res.headersSent) {
          res.status(500).send("Storage read error");
        }
      });
      streamPayload.stream.pipe(res);
    } catch (err: any) {
      logger.error({ err, objectPath }, "GCS media proxy failure");
      res.status(500).send("Storage service error");
    }
  });
}

if (uploadsUpstreamBaseUrl) {
  const escapedUploadPath = uploadUrlPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\/+$/, "");
  const uploadPathRegex = new RegExp(`^${escapedUploadPath}/(.+)$`);

  app.get(uploadPathRegex, (req, res) => {
    const objectPath = req.params[0];
    if (!objectPath) {
      res.status(404).send("File not found");
      return;
    }

    const upstreamUrl = `${uploadsUpstreamBaseUrl}/${objectPath}`;
    res.redirect(302, upstreamUrl);
  });
}

app.use(seoRouter);
app.use("/api", router);

// Serve the Vite-built frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.resolve(
    __dirname,
    "..",
    "..",
    "groupe-acharaf",
    "dist",
    "public",
  );

  // www to non-www 301 redirection
  app.use((req, res, next) => {
    const host = req.headers.host || "";
    if (host.startsWith("www.")) {
      const nonWwwHost = host.slice(4);
      return res.redirect(301, `https://${nonWwwHost}${req.originalUrl}`);
    }
    next();
  });

  // Server-side 301 redirect for /projets
  app.get("/projets", (_req, res) => {
    res.redirect(301, "/nos-projets");
  });

  app.get(/^\/(?:nos-projets|projets)\/(\d+)\/?$/, async (req, res, next) => {
    try {
      const projectId = Number(req.params[0]);
      if (!Number.isFinite(projectId)) {
        next();
        return;
      }

      const [project] = await db
        .select({ slug: projectsTable.slug, title: projectsTable.title })
        .from(projectsTable)
        .where(eq(projectsTable.id, projectId));

      if (!project) {
        next();
        return;
      }

      const cleanSlug = slugifyProjectTitle(project.slug) || slugifyProjectTitle(project.title) || projectId.toString();
      res.redirect(301, `/nos-projets/${cleanSlug}`);
    } catch {
      next();
    }
  });

  app.use(express.static(frontendDist));

  // Load index.html in memory for dynamic prerendering
  const indexPath = path.join(frontendDist, "index.html");
  let indexHtml = "";
  try {
    indexHtml = fs.readFileSync(indexPath, "utf-8");
  } catch (err) {
    logger.error(err, "Failed to read index.html");
  }

  // SPA fallback — serve dynamically populated HTML for bots and crawlers
  app.get(/.*/, async (req, res) => {
    const urlPath = req.path;
    let html = indexHtml;

    try {
      // 1. Project Detail Page
      const projectMatch = urlPath.match(/^\/nos-projets\/([^/]+)\/?$/);
      if (projectMatch) {
        const slug = projectMatch[1];
        
        let project;
        if (!isNaN(Number(slug))) {
          [project] = await db
            .select({
              title: projectsTable.title,
              metaTitle: projectsTable.metaTitle,
              metaDescription: projectsTable.metaDescription,
              shortDescription: projectsTable.shortDescription,
              description: projectsTable.description,
              coverImageUrl: projectsTable.coverImageUrl,
              ogImageUrl: projectsTable.ogImageUrl,
              city: projectsTable.city,
              location: projectsTable.location,
              addressText: projectsTable.addressText,
              brandId: projectsTable.brandId,
              status: projectsTable.status,
              priceMin: projectsTable.priceMin,
              showPrice: projectsTable.showPrice,
            })
            .from(projectsTable)
            .where(eq(projectsTable.id, Number(slug)));
        } else {
          // Fetch id, slug, title of all projects to match case-insensitively/slugified
          const allProjects = await db
            .select({
              id: projectsTable.id,
              slug: projectsTable.slug,
              title: projectsTable.title,
            })
            .from(projectsTable);

          const targetSlug = slugifyProjectTitle(slug);
          const matched = allProjects.find((p) => {
            const pSlug = slugifyProjectTitle(p.slug) || slugifyProjectTitle(p.title) || p.id.toString();
            return pSlug === targetSlug;
          });

          if (matched) {
            [project] = await db
              .select({
                title: projectsTable.title,
                metaTitle: projectsTable.metaTitle,
                metaDescription: projectsTable.metaDescription,
                shortDescription: projectsTable.shortDescription,
                description: projectsTable.description,
                coverImageUrl: projectsTable.coverImageUrl,
                ogImageUrl: projectsTable.ogImageUrl,
                city: projectsTable.city,
                location: projectsTable.location,
                addressText: projectsTable.addressText,
                brandId: projectsTable.brandId,
                status: projectsTable.status,
                priceMin: projectsTable.priceMin,
                showPrice: projectsTable.showPrice,
              })
              .from(projectsTable)
              .where(eq(projectsTable.id, matched.id));
          }
        }

        if (project) {
          const title = (project.metaTitle || `${project.title} | Immobilier à ${project.city ?? project.location} | Groupe Acharaf`).trim();
          let description = (project.metaDescription || project.shortDescription || project.description || "").trim();
          if (!description) {
            const cityPart = project.city || project.location ? ` à ${project.city || project.location}` : "";
            description = `Découvrez ${project.title}, un projet immobilier d'exception réalisé par le Groupe Acharaf${cityPart}. Retrouvez toutes les informations, caractéristiques et prestations de haut standing.`;
          }
          const cover = project.ogImageUrl || project.coverImageUrl || "https://groupeacharaf.ma/opengraph.jpg";
          const ogUrl = `https://groupeacharaf.ma/nos-projets/${slug}`;

          html = html
            .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
            .replace(/<meta property="og:title" content=".*?"\s*\/?>/g, `<meta property="og:title" content="${title}" />`)
            .replace(/<meta name="twitter:title" content=".*?"\s*\/?>/g, `<meta name="twitter:title" content="${title}" />`)
            .replace(/<meta name="description" content=".*?"\s*\/?>/g, `<meta name="description" content="${description}" />`)
            .replace(/<meta property="og:description" content=".*?"\s*\/?>/g, `<meta property="og:description" content="${description}" />`)
            .replace(/<meta name="twitter:description" content=".*?"\s*\/?>/g, `<meta name="twitter:description" content="${description}" />`)
            .replace(/<meta property="og:url" content=".*?"\s*\/?>/g, `<meta property="og:url" content="${ogUrl}" />`)
            .replace(/<meta property="og:image" content=".*?"\s*\/?>/g, `<meta property="og:image" content="${cover}" />`)
            .replace(/<meta name="twitter:image" content=".*?"\s*\/?>/g, `<meta name="twitter:image" content="${cover}" />`)
            .replace(/<link rel="canonical" href=".*?"\s*\/?>/g, `<link rel="canonical" href="${ogUrl}" />`);

          const brandName = project.brandId === 1 ? "Estya" : "Acharaf Immobilier";
          const projectSchema = {
            "@context": "https://schema.org",
            "@type": "Residence",
            name: project.title,
            url: ogUrl,
            description: description,
            image: cover,
            address: {
              "@type": "PostalAddress",
              addressLocality: project.city || project.location || "",
              addressCountry: "MA",
              streetAddress: project.addressText || "",
            },
            brand: {
              "@type": "Brand",
              name: brandName,
            },
            offers: {
              "@type": "Offer",
              priceCurrency: "MAD",
              availability: project.status === "completed" ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
              price: (project.showPrice && project.priceMin) ? project.priceMin : undefined,
            }
          };

          const breadcrumb = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://groupeacharaf.ma/" },
              { "@type": "ListItem", position: 2, name: "Nos Projets", item: "https://groupeacharaf.ma/nos-projets" },
              { "@type": "ListItem", position: 3, name: project.title, item: ogUrl }
            ]
          };

          const schemaScript = `
            <script type="application/ld+json" id="ga-project-schema">${JSON.stringify(projectSchema)}</script>
            <script type="application/ld+json" id="ga-breadcrumb-project">${JSON.stringify(breadcrumb)}</script>
          </head>`;
          html = html.replace("</head>", schemaScript);
        }
      }

      // 2. Static Pages
      if (urlPath === "/a-propos") {
        html = html
          .replace(/<title>.*?<\/title>/, "<title>À propos du Groupe Acharaf | Promoteur Immobilier Maroc</title>")
          .replace(/<meta name="description" content=".*?"\s*\/?>/g, '<meta name="description" content="Découvrez l’histoire, la vision et l’exigence de Groupe Acharaf, promoteur immobilier marocain d\'excellence de haut standing. Plus de 40 ans de savoir-faire." />')
          .replace(/<link rel="canonical" href=".*?"\s*\/?>/g, '<link rel="canonical" href="https://groupeacharaf.ma/a-propos" />');
      } else if (urlPath === "/nos-marques") {
        html = html
          .replace(/<title>.*?<\/title>/, "<title>Nos Marques : Estya & Acharaf | Immobilier de Luxe & Premium Maroc</title>")
          .replace(/<meta name="description" content=".*?"\s*\/?>/g, '<meta name="description" content="Découvrez Estya (immobilier de luxe au Maroc) et Acharaf Immobilier (résidences premium de haut standing), les deux signatures de prestige du Groupe Acharaf." />')
          .replace(/<link rel="canonical" href=".*?"\s*\/?>/g, '<link rel="canonical" href="https://groupeacharaf.ma/nos-marques" />');
      } else if (urlPath === "/nos-projets") {
        html = html
          .replace(/<title>.*?<\/title>/, "<title>Projets Immobiliers de Haut Standing au Maroc | Groupe Acharaf</title>")
          .replace(/<meta name="description" content=".*?"\s*\/?>/g, '<meta name="description" content="Découvrez les projets immobiliers de haut standing et de luxe du Groupe Acharaf à Agadir, Marrakech et Meknès. Résidences neuves d\'exception." />')
          .replace(/<link rel="canonical" href=".*?"\s*\/?>/g, '<link rel="canonical" href="https://groupeacharaf.ma/nos-projets" />');
      } else if (urlPath === "/opportunites") {
        html = html
          .replace(/<title>.*?<\/title>/, "<title>Opportunités d'Investissement Immobilier au Maroc | Groupe Acharaf</title>")
          .replace(/<meta name="description" content=".*?"\s*\/?>/g, '<meta name="description" content="Découvrez nos opportunités d\'investissement immobilier au Maroc : terrains et lots R+1, R+2, R+3 et locaux commerciaux de haut standing." />')
          .replace(/<link rel="canonical" href=".*?"\s*\/?>/g, '<link rel="canonical" href="https://groupeacharaf.ma/opportunites" />');
      } else if (urlPath === "/carrieres") {
        html = html
          .replace(/<title>.*?<\/title>/, "<title>Carrières & Recrutement | Rejoindre le Groupe Acharaf</title>")
          .replace(/<meta name="description" content=".*?"\s*\/?>/g, '<meta name="description" content="Rejoignez Groupe Acharaf, promoteur immobilier marocain d\'excellence. Consultez nos offres d\'emploi ou déposez une candidature spontanée." />')
          .replace(/<link rel="canonical" href=".*?"\s*\/?>/g, '<link rel="canonical" href="https://groupeacharaf.ma/carrieres" />');
      } else if (urlPath === "/contact") {
        html = html
          .replace(/<title>.*?<\/title>/, "<title>Contact & Bureaux de Vente | Groupe Acharaf Maroc</title>")
          .replace(/<meta name="description" content=".*?"\s*\/?>/g, '<meta name="description" content="Contactez le Groupe Acharaf, promoteur immobilier au Maroc. Nos coordonnées, adresse de notre siège à Casablanca et formulaires de contact." />')
          .replace(/<link rel="canonical" href=".*?"\s*\/?>/g, '<link rel="canonical" href="https://groupeacharaf.ma/contact" />');
      }
    } catch (err) {
      logger.error(err, "Prerender meta replacement failed");
    }

    res.send(html);
  });
}

export default app;
