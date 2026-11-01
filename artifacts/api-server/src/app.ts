import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { asc, desc, eq } from "drizzle-orm";
import router from "./routes";
import seoRouter from "./routes/seo";
import { logger } from "./lib/logger";
import { db, projectsTable, brandsTable, articlesTable } from "@workspace/db";
import {
  uploadDir,
  uploadUrlPath,
  isGcsEnabled,
  readGcsObjectStream,
} from "./lib/upload-storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "https://groupeacharaf.ma";

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

function escapeHtml(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toAbsoluteUrl(url: string | null | undefined): string {
  const trimmed = (url ?? "").trim();
  if (!trimmed) return `${BASE_URL}/opengraph.jpg`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${BASE_URL}${trimmed}`;
  return `${BASE_URL}/${trimmed}`;
}

function safeJsonForScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function buildSmartProjectTitle(project: {
  title: string;
  metaTitle?: string | null;
  projectType?: string | null;
  displayType?: string | null;
  city?: string | null;
  location?: string | null;
}): string {
  if (project.metaTitle?.trim()) {
    return project.metaTitle.trim();
  }
  const cityOrLoc = (project.city || project.location || "").trim();
  const typeLabel = (
    project.projectType ||
    (project.displayType === "opportunity" ? "Opportunité Immobilière" : "Projet Immobilier")
  ).trim();
  return cityOrLoc
    ? `${project.title} | ${typeLabel} à ${cityOrLoc} | Groupe Acharaf`
    : `${project.title} | ${typeLabel} | Groupe Acharaf`;
}

export function buildSmartProjectDescription(project: {
  title: string;
  metaDescription?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  longDescription?: string | null;
  opportunityDescription?: string | null;
  projectType?: string | null;
  displayType?: string | null;
  city?: string | null;
  location?: string | null;
  surfaceMin?: number | null;
  surfaceMax?: number | null;
  brandId?: number | null;
}): string {
  if (project.metaDescription?.trim()) {
    return project.metaDescription.trim();
  }
  const cityOrLoc = (project.city || project.location || "").trim();
  const typeLabel = (
    project.projectType ||
    (project.displayType === "opportunity" ? "Opportunité immobilière" : "Projet immobilier de haut standing")
  ).trim();
  const rawBody = (
    project.shortDescription ||
    project.description ||
    project.opportunityDescription ||
    project.longDescription ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();

  const surfaceText =
    project.surfaceMin && project.surfaceMax
      ? ` Surfaces de ${project.surfaceMin} à ${project.surfaceMax} m².`
      : project.surfaceMin
        ? ` Surfaces dès ${project.surfaceMin} m².`
        : "";

  if (rawBody.length >= 50) {
    const prefix = cityOrLoc ? `${project.title} (${cityOrLoc}) : ` : `${project.title} : `;
    const combined = rawBody.toLowerCase().includes(project.title.toLowerCase())
      ? `${rawBody}${surfaceText}`
      : `${prefix}${rawBody}${surfaceText}`;
    return combined.length > 160 ? `${combined.slice(0, 157).trim()}...` : combined;
  }

  const brandLabel = project.brandId === 1 ? "Estya (Groupe Acharaf)" : "Groupe Acharaf";
  const locPart = cityOrLoc ? ` à ${cityOrLoc}` : " au Maroc";
  const detailPart = rawBody ? ` ${rawBody}` : "";
  const fallback = `Découvrez ${project.title}, ${typeLabel.toLowerCase()}${locPart} signé ${brandLabel}.${surfaceText}${detailPart} Architecture, prestations et localisation d'exception.`;
  return fallback.length > 160 ? `${fallback.slice(0, 157).trim()}...` : fallback;
}

function applyHeadMeta(
  html: string,
  opts: {
    title: string;
    description: string;
    canonicalUrl: string;
    ogImage?: string;
    ogType?: string;
    robots?: string;
  },
): string {
  const escTitle = escapeHtml(opts.title);
  const escDesc = escapeHtml(opts.description);
  const escUrl = escapeHtml(opts.canonicalUrl);
  const escImg = escapeHtml(toAbsoluteUrl(opts.ogImage));
  const escType = escapeHtml(opts.ogType || "website");
  const escRobots = escapeHtml(
    opts.robots || "index, follow, max-image-preview:large, max-snippet:-1",
  );

  let out = html
    .replace(/<title>.*?<\/title>/s, `<title>${escTitle}</title>`)
    .replace(
      /<meta name="description" content=".*?"\s*\/?>/g,
      `<meta name="description" content="${escDesc}" />`,
    )
    .replace(
      /<meta property="og:type" content=".*?"\s*\/?>/g,
      `<meta property="og:type" content="${escType}" />`,
    )
    .replace(
      /<meta property="og:title" content=".*?"\s*\/?>/g,
      `<meta property="og:title" content="${escTitle}" />`,
    )
    .replace(
      /<meta name="twitter:title" content=".*?"\s*\/?>/g,
      `<meta name="twitter:title" content="${escTitle}" />`,
    )
    .replace(
      /<meta property="og:description" content=".*?"\s*\/?>/g,
      `<meta property="og:description" content="${escDesc}" />`,
    )
    .replace(
      /<meta name="twitter:description" content=".*?"\s*\/?>/g,
      `<meta name="twitter:description" content="${escDesc}" />`,
    )
    .replace(
      /<meta property="og:url" content=".*?"\s*\/?>/g,
      `<meta property="og:url" content="${escUrl}" />`,
    )
    .replace(
      /<meta property="og:image" content=".*?"\s*\/?>/g,
      `<meta property="og:image" content="${escImg}" />`,
    )
    .replace(
      /<meta name="twitter:image" content=".*?"\s*\/?>/g,
      `<meta name="twitter:image" content="${escImg}" />`,
    )
    .replace(
      /<link rel="canonical" href=".*?"\s*\/?>/g,
      `<link rel="canonical" href="${escUrl}" />`,
    )
    .replace(
      /<link rel="alternate" hreflang="fr" href=".*?"\s*\/?>/g,
      `<link rel="alternate" hreflang="fr" href="${escUrl}" />`,
    )
    .replace(
      /<link rel="alternate" hreflang="x-default" href=".*?"\s*\/?>/g,
      `<link rel="alternate" hreflang="x-default" href="${escUrl}" />`,
    );

  if (/<meta name="robots" content=".*?"\s*\/?>/.test(out)) {
    out = out.replace(
      /<meta name="robots" content=".*?"\s*\/?>/g,
      `<meta name="robots" content="${escRobots}" />`,
    );
  } else {
    out = out.replace(
      "</title>",
      `</title>\n    <meta name="robots" content="${escRobots}" />`,
    );
  }

  return out;
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

  // Server-side 301 redirects for legacy listing routes
  app.get(/^\/projets\/?$/, (_req, res) => {
    res.redirect(301, "/nos-projets");
  });

  app.get(/^\/actualites\/?$/, (_req, res) => {
    res.redirect(301, "/opportunites");
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

  const projectFullSelection = {
    id: projectsTable.id,
    brandId: projectsTable.brandId,
    title: projectsTable.title,
    slug: projectsTable.slug,
    projectType: projectsTable.projectType,
    tagline: projectsTable.tagline,
    shortDescription: projectsTable.shortDescription,
    description: projectsTable.description,
    longDescription: projectsTable.longDescription,
    location: projectsTable.location,
    city: projectsTable.city,
    addressText: projectsTable.addressText,
    status: projectsTable.status,
    heroTitle: projectsTable.heroTitle,
    heroSubtitle: projectsTable.heroSubtitle,
    heroLocationText: projectsTable.heroLocationText,
    primaryCtaLabel: projectsTable.primaryCtaLabel,
    secondaryCtaLabel: projectsTable.secondaryCtaLabel,
    priceMin: projectsTable.priceMin,
    priceMax: projectsTable.priceMax,
    showPrice: projectsTable.showPrice,
    priceLabel: projectsTable.priceLabel,
    priceNote: projectsTable.priceNote,
    availabilityNote: projectsTable.availabilityNote,
    surfaceMin: projectsTable.surfaceMin,
    surfaceMax: projectsTable.surfaceMax,
    deliveryDate: projectsTable.deliveryDate,
    featured: projectsTable.featured,
    displayOrder: projectsTable.displayOrder,
    displayType: projectsTable.displayType,
    isOpportunity: projectsTable.isOpportunity,
    opportunityType: projectsTable.opportunityType,
    opportunityTitle: projectsTable.opportunityTitle,
    opportunityDescription: projectsTable.opportunityDescription,
    opportunityHighlight: projectsTable.opportunityHighlight,
    opportunityValidUntil: projectsTable.opportunityValidUntil,
    opportunityCtaLabel: projectsTable.opportunityCtaLabel,
    coverImageUrl: projectsTable.coverImageUrl,
    secondaryImageUrl: projectsTable.secondaryImageUrl,
    lifestyleImageUrl: projectsTable.lifestyleImageUrl,
    images: projectsTable.images,
    amenities: projectsTable.amenities,
    galleryTitle: projectsTable.galleryTitle,
    featuresTitle: projectsTable.featuresTitle,
    projectSectionTitle: projectsTable.projectSectionTitle,
    projectSectionDescription: projectsTable.projectSectionDescription,
    lifestyleTitle: projectsTable.lifestyleTitle,
    lifestyleDescription: projectsTable.lifestyleDescription,
    locationSectionTitle: projectsTable.locationSectionTitle,
    locationDescription: projectsTable.locationDescription,
    locationAdvantages: projectsTable.locationAdvantages,
    mapEmbedUrl: projectsTable.mapEmbedUrl,
    mapIframeCode: projectsTable.mapIframeCode,
    mapShareUrl: projectsTable.mapShareUrl,
    virtualTourUrl: projectsTable.virtualTourUrl,
    contactTitle: projectsTable.contactTitle,
    contactSubtitle: projectsTable.contactSubtitle,
    metaTitle: projectsTable.metaTitle,
    metaDescription: projectsTable.metaDescription,
    ogImageUrl: projectsTable.ogImageUrl,
    published: projectsTable.published,
    noIndex: projectsTable.noIndex,
    previousSlugs: projectsTable.previousSlugs,
    createdAt: projectsTable.createdAt,
    updatedAt: projectsTable.updatedAt,
    brand: {
      id: brandsTable.id,
      name: brandsTable.name,
      slug: brandsTable.slug,
      tagline: brandsTable.tagline,
      description: brandsTable.description,
      segment: brandsTable.segment,
      logoUrl: brandsTable.logoUrl,
      coverImageUrl: brandsTable.coverImageUrl,
      accentColor: brandsTable.accentColor,
      createdAt: brandsTable.createdAt,
    },
  };

  function send404Html(res: express.Response, reqPath: string, message = "Page introuvable") {
    let html404 = applyHeadMeta(indexHtml, {
      title: `${message} (404) | Groupe Acharaf`,
      description: "La page que vous recherchez n'existe pas ou n'est plus disponible sur le site officiel du Groupe Acharaf.",
      canonicalUrl: `${BASE_URL}${reqPath}`,
      robots: "noindex, nofollow",
    });
    const body404 = `<div id="root"><main style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem 1.5rem;text-align:center;font-family:sans-serif;background:#FBF9F6;color:#081B26;"><p style="letter-spacing:0.25em;text-transform:uppercase;font-size:0.75rem;color:#C9A86A;margin-bottom:1rem;">Erreur 404</p><h1 style="font-size:2rem;font-weight:400;margin-bottom:1rem;">${escapeHtml(message)}</h1><p style="max-width:32rem;color:#4C6470;margin-bottom:2rem;">Ce contenu est introuvable ou n'est plus publié. Découvrez l'ensemble de nos réalisations immobilières de haut standing.</p><nav aria-label="Navigation principale" style="display:flex;gap:1.5rem;flex-wrap:wrap;justify-content:center;"><a href="/">Accueil</a><a href="/nos-projets">Nos Projets</a><a href="/opportunites">Opportunités</a><a href="/a-propos">À propos</a><a href="/contact">Contact</a></nav></main></div>`;
    html404 = html404.replace('<div id="root"></div>', body404);
    res.set("X-Robots-Tag", "noindex, nofollow");
    res.status(404).send(html404);
  }

  // SPA & SSR Route Handler
  app.get(/.*/, async (req, res) => {
    const rawPath = req.path;
    const normalizedPath = rawPath.length > 1 ? rawPath.replace(/\/+$/, "") : rawPath;
    let html = indexHtml;

    try {
      // 1. Project Detail Page (/nos-projets/:slug or /projets/:slug)
      const projectMatch = rawPath.match(/^\/(nos-projets|projets)\/([^/]+)(\/?)$/);
      if (projectMatch) {
        const routePrefix = projectMatch[1];
        const rawSlugParam = decodeURIComponent(projectMatch[2]);
        const hasTrailingSlash = projectMatch[3] === "/";

        const allProjects = await db
          .select(projectFullSelection)
          .from(projectsTable)
          .leftJoin(brandsTable, eq(projectsTable.brandId, brandsTable.id))
          .orderBy(asc(projectsTable.displayOrder), desc(projectsTable.createdAt));

        const normalizedTarget = slugifyProjectTitle(rawSlugParam);
        const isNumericParam = /^\d+$/.test(rawSlugParam);

        // Match by exact slug, numeric ID, slugified title, or previousSlugs
        let matched = allProjects.find((p) => {
          const canonical = slugifyProjectTitle(p.slug) || slugifyProjectTitle(p.title) || String(p.id);
          return canonical === rawSlugParam.toLowerCase() || canonical === normalizedTarget;
        });

        if (!matched && isNumericParam) {
          const numId = Number(rawSlugParam);
          matched = allProjects.find((p) => p.id === numId);
        }

        if (!matched) {
          matched = allProjects.find((p) => {
            if (!Array.isArray(p.previousSlugs)) return false;
            return p.previousSlugs.some(
              (oldSlug) =>
                oldSlug.toLowerCase() === rawSlugParam.toLowerCase() ||
                slugifyProjectTitle(oldSlug) === normalizedTarget,
            );
          });
        }

        // Unpublished or unknown project -> HTTP 404
        if (!matched || matched.published === false) {
          send404Html(res, normalizedPath, "Projet immobilier introuvable");
          return;
        }

        const canonicalSlug =
          slugifyProjectTitle(matched.slug) ||
          slugifyProjectTitle(matched.title) ||
          String(matched.id);

        // 301 Redirect if accessed via /projets/:slug, numeric ID, old slug, uppercase/non-canonical slug, or trailing slash
        if (
          routePrefix === "projets" ||
          hasTrailingSlash ||
          rawSlugParam !== canonicalSlug
        ) {
          res.redirect(301, `/nos-projets/${canonicalSlug}`);
          return;
        }

        const canonicalUrl = `${BASE_URL}/nos-projets/${canonicalSlug}`;
        const seoTitle = buildSmartProjectTitle(matched);
        const seoDescription = buildSmartProjectDescription(matched);
        const coverAbsolute = toAbsoluteUrl(matched.ogImageUrl || matched.coverImageUrl);
        const robotsDirective = matched.noIndex
          ? "noindex, follow"
          : "index, follow, max-image-preview:large, max-snippet:-1";

        if (matched.noIndex) {
          res.set("X-Robots-Tag", "noindex, follow");
        }

        html = applyHeadMeta(html, {
          title: seoTitle,
          description: seoDescription,
          canonicalUrl,
          ogImage: coverAbsolute,
          ogType: "website",
          robots: robotsDirective,
        });

        const brandName =
          matched.brand?.name ||
          (matched.brandId === 1 ? "Estya" : "Acharaf Immobilier");
        const cityOrLoc = matched.city || matched.location || "Maroc";
        const statusLabel =
          matched.status === "completed"
            ? "Projet livré"
            : matched.status === "ongoing"
              ? "En cours de réalisation"
              : "Prochainement";

        const galleryImages = Array.from(
          new Set(
            [
              matched.ogImageUrl,
              matched.coverImageUrl,
              matched.secondaryImageUrl,
              matched.lifestyleImageUrl,
              ...(Array.isArray(matched.images) ? matched.images : []),
            ]
              .filter((img): img is string => Boolean(img && img.trim()))
              .map((img) => toAbsoluteUrl(img)),
          ),
        );

        const projectSchema: Record<string, unknown> = {
          "@context": "https://schema.org",
          "@type": matched.displayType === "opportunity" ? "RealEstateListing" : "Residence",
          "@id": `${canonicalUrl}#project`,
          name: matched.title,
          url: canonicalUrl,
          description: seoDescription,
          image: galleryImages.length > 0 ? galleryImages : [coverAbsolute],
          address: {
            "@type": "PostalAddress",
            addressLocality: matched.city || matched.location || "Maroc",
            addressRegion: matched.location || matched.city || undefined,
            streetAddress: matched.addressText || undefined,
            addressCountry: "MA",
          },
          brand: {
            "@type": "Brand",
            name: brandName,
          },
          provider: {
            "@type": "RealEstateAgent",
            name: "Groupe Acharaf",
            url: BASE_URL,
          },
        };

        if (matched.surfaceMin || matched.surfaceMax) {
          projectSchema.floorSize = {
            "@type": "QuantitativeValue",
            minValue: matched.surfaceMin || undefined,
            maxValue: matched.surfaceMax || undefined,
            unitCode: "MTK",
          };
        }

        if (Array.isArray(matched.amenities) && matched.amenities.length > 0) {
          projectSchema.amenityFeature = matched.amenities
            .filter(Boolean)
            .map((amenity) => ({
              "@type": "LocationFeatureSpecification",
              name: amenity,
              value: true,
            }));
        }

        if (matched.status !== "completed" && matched.showPrice && matched.priceMin) {
          projectSchema.offers = {
            "@type": "Offer",
            priceCurrency: "MAD",
            price: matched.priceMin,
            availability: "https://schema.org/InStock",
            url: canonicalUrl,
          };
        }

        const breadcrumb = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: `${BASE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Nos Projets", item: `${BASE_URL}/nos-projets` },
            { "@type": "ListItem", position: 3, name: matched.title, item: canonicalUrl },
          ],
        };

        const schemaScript = `
    <script type="application/ld+json" id="ga-project-schema">${JSON.stringify(projectSchema)}</script>
    <script type="application/ld+json" id="ga-breadcrumb-project">${JSON.stringify(breadcrumb)}</script>
  </head>`;
        html = html.replace("</head>", schemaScript);

        // Build rich server-rendered semantic HTML inside <div id="root">
        const otherPublished = allProjects.filter(
          (p) => p.published !== false && p.noIndex !== true && p.id !== matched.id,
        );

        const paragraphs = [
          matched.shortDescription,
          matched.description,
          matched.longDescription,
          matched.projectSectionDescription,
          matched.opportunityDescription,
        ]
          .filter((txt): txt is string => Boolean(txt && txt.trim()))
          .filter((txt, idx, arr) => arr.indexOf(txt) === idx);

        const amenitiesListHtml =
          Array.isArray(matched.amenities) && matched.amenities.length > 0
            ? `<section><h2>${escapeHtml(matched.featuresTitle || "Prestations et Équipements")}</h2><ul>${matched.amenities
                .filter(Boolean)
                .map((a) => `<li>${escapeHtml(a)}</li>`)
                .join("")}</ul></section>`
            : "";

        const locationAdvantagesHtml =
          Array.isArray(matched.locationAdvantages) && matched.locationAdvantages.length > 0
            ? `<ul>${matched.locationAdvantages
                .filter(Boolean)
                .map((adv) => `<li>${escapeHtml(adv)}</li>`)
                .join("")}</ul>`
            : "";

        const surfaceSpec =
          matched.surfaceMin && matched.surfaceMax
            ? `${matched.surfaceMin} – ${matched.surfaceMax} m²`
            : matched.surfaceMin
              ? `À partir de ${matched.surfaceMin} m²`
              : matched.surfaceMax
                ? `Jusqu'à ${matched.surfaceMax} m²`
                : "";

        const priceSpec =
          matched.status !== "completed" && matched.showPrice && matched.priceMin
            ? `<li><strong>Prix :</strong> À partir de ${matched.priceMin.toLocaleString("fr-MA")} MAD</li>`
            : "";

        const ssrProjectContent = `<div id="root"><div data-ssr-project="${escapeHtml(canonicalSlug)}" style="background:#FBF9F6;color:#081B26;min-height:100vh;font-family:Roboto,sans-serif;">
  <header style="padding:1.5rem 2rem;background:#081B26;color:#FFFFFF;">
    <nav aria-label="Navigation principale" style="display:flex;gap:1.5rem;flex-wrap:wrap;align-items:center;">
      <a href="/" style="color:#FFFFFF;text-decoration:none;font-weight:500;">Groupe Acharaf</a>
      <a href="/a-propos" style="color:#D7D2C8;text-decoration:none;">À propos</a>
      <a href="/nos-marques" style="color:#D7D2C8;text-decoration:none;">Nos Marques</a>
      <a href="/nos-projets" style="color:#D7D2C8;text-decoration:none;">Nos Projets</a>
      <a href="/opportunites" style="color:#D7D2C8;text-decoration:none;">Opportunités</a>
      <a href="/carrieres" style="color:#D7D2C8;text-decoration:none;">Carrières</a>
      <a href="/contact" style="color:#D7D2C8;text-decoration:none;">Contact</a>
    </nav>
  </header>
  <main style="max-width:1200px;margin:0 auto;padding:3rem 1.5rem;">
    <nav aria-label="Fil d'Ariane" style="margin-bottom:1.5rem;font-size:0.85rem;color:#4C6470;">
      <a href="/">Accueil</a> &rsaquo; <a href="/nos-projets">Nos Projets</a> &rsaquo; <span>${escapeHtml(matched.title)}</span>
    </nav>
    <article>
      <header style="margin-bottom:2rem;">
        <p style="text-transform:uppercase;letter-spacing:0.2em;font-size:0.75rem;color:#C9A86A;margin-bottom:0.5rem;">${escapeHtml(brandName)} &middot; ${escapeHtml(statusLabel)}</p>
        <h1 style="font-family:'Playfair Display',serif;font-size:2.5rem;margin:0 0 0.75rem 0;">${escapeHtml(matched.heroTitle || matched.title)}</h1>
        <p style="font-size:1.15rem;color:#233B48;margin:0 0 1rem 0;">${escapeHtml(matched.heroSubtitle || matched.tagline || `${matched.projectType || "Projet immobilier"} à ${cityOrLoc}`)}</p>
        <p style="font-size:0.95rem;color:#4C6470;"><strong>Localisation :</strong> ${escapeHtml(matched.heroLocationText || [matched.location, matched.city].filter(Boolean).join(", ") || cityOrLoc)}</p>
      </header>
      <figure style="margin:0 0 2.5rem 0;">
        <img src="${escapeHtml(coverAbsolute)}" alt="${escapeHtml(`${matched.title} - ${matched.projectType || "Projet immobilier"} à ${cityOrLoc}`)}" style="width:100%;max-height:540px;object-fit:cover;" />
      </figure>
      <section aria-label="Caractéristiques clés" style="margin-bottom:2.5rem;">
        <h2>Caractéristiques du projet ${escapeHtml(matched.title)}</h2>
        <ul>
          <li><strong>Projet :</strong> ${escapeHtml(matched.title)}</li>
          <li><strong>Marque :</strong> ${escapeHtml(brandName)}</li>
          ${matched.projectType ? `<li><strong>Catégorie :</strong> ${escapeHtml(matched.projectType)}</li>` : ""}
          <li><strong>Ville :</strong> ${escapeHtml(matched.city || matched.location || "Maroc")}</li>
          ${matched.location ? `<li><strong>Quartier / Emplacement :</strong> ${escapeHtml(matched.location)}</li>` : ""}
          ${matched.addressText ? `<li><strong>Adresse :</strong> ${escapeHtml(matched.addressText)}</li>` : ""}
          <li><strong>Statut :</strong> ${escapeHtml(statusLabel)}</li>
          ${surfaceSpec ? `<li><strong>Surfaces :</strong> ${escapeHtml(surfaceSpec)}</li>` : ""}
          ${matched.deliveryDate ? `<li><strong>Livraison :</strong> ${escapeHtml(matched.deliveryDate)}</li>` : ""}
          ${priceSpec}
        </ul>
      </section>
      <section aria-label="Présentation du projet" style="margin-bottom:2.5rem;">
        <h2>${escapeHtml(matched.projectSectionTitle || `Présentation de ${matched.title}`)}</h2>
        ${
          paragraphs.length > 0
            ? paragraphs.map((p) => `<p style="line-height:1.8;margin-bottom:1rem;">${escapeHtml(p)}</p>`).join("")
            : `<p style="line-height:1.8;">${escapeHtml(seoDescription)}</p>`
        }
      </section>
      ${
        matched.lifestyleTitle || matched.lifestyleDescription
          ? `<section aria-label="Cadre de vie" style="margin-bottom:2.5rem;">
              <h2>${escapeHtml(matched.lifestyleTitle || "Cadre de vie et architecture")}</h2>
              ${matched.lifestyleDescription ? `<p style="line-height:1.8;">${escapeHtml(matched.lifestyleDescription)}</p>` : ""}
            </section>`
          : ""
      }
      ${amenitiesListHtml}
      <section aria-label="Localisation et environnement" style="margin-bottom:2.5rem;">
        <h2>${escapeHtml(matched.locationSectionTitle || `Localisation à ${cityOrLoc}`)}</h2>
        ${matched.locationDescription ? `<p style="line-height:1.8;">${escapeHtml(matched.locationDescription)}</p>` : `<p style="line-height:1.8;">Le projet ${escapeHtml(matched.title)} bénéficie d'un emplacement privilégié à ${escapeHtml(cityOrLoc)}.</p>`}
        ${matched.addressText ? `<p><strong>Adresse :</strong> ${escapeHtml(matched.addressText)}</p>` : ""}
        ${locationAdvantagesHtml}
      </section>
      <section aria-label="Contact et informations" style="margin-bottom:2.5rem;">
        <h2>${escapeHtml(matched.contactTitle || `Intéressé par ${matched.title} ?`)}</h2>
        <p>${escapeHtml(matched.contactSubtitle || "Contactez nos conseillers du Groupe Acharaf pour recevoir la brochure complète ou planifier une visite.")}</p>
        <p><a href="/contact">Contacter le Groupe Acharaf</a> &middot; <a href="/nos-projets">Voir tous nos projets immobiliers</a> &middot; <a href="/opportunites">Découvrir nos opportunités foncières</a></p>
      </section>
    </article>
    <nav aria-label="Autres projets immobiliers du Groupe Acharaf" style="margin-top:3rem;padding-top:2rem;border-top:1px solid #E5DFD3;">
      <h2>Découvrir nos autres réalisations et opportunités</h2>
      <ul style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:0.75rem;list-style:none;padding:0;">
        ${otherPublished
          .map((other) => {
            const oSlug =
              slugifyProjectTitle(other.slug) ||
              slugifyProjectTitle(other.title) ||
              String(other.id);
            const oCity = other.city || other.location || "Maroc";
            return `<li><a href="/nos-projets/${escapeHtml(oSlug)}">${escapeHtml(other.title)} — ${escapeHtml(oCity)}</a></li>`;
          })
          .join("")}
      </ul>
    </nav>
  </main>
</div></div>`;

        html = html.replace('<div id="root"></div>', ssrProjectContent);
        html = html.replace(
          "</body>",
          `<script>window.__INITIAL_PROJECT__ = ${safeJsonForScript(matched)};</script>\n  </body>`,
        );

        res.status(200).send(html);
        return;
      }

      // 2. Article Detail Page (/actualites/:slug)
      const articleMatch = normalizedPath.match(/^\/actualites\/([^/]+)$/);
      if (articleMatch) {
        const slugParam = decodeURIComponent(articleMatch[1]);
        const articles = await db
          .select()
          .from(articlesTable)
          .where(eq(articlesTable.published, true));
        const article = articles.find(
          (a) =>
            slugifyProjectTitle(a.slug) === slugifyProjectTitle(slugParam) ||
            String(a.id) === slugParam,
        );
        if (!article) {
          send404Html(res, normalizedPath, "Article introuvable");
          return;
        }
        const canonicalArticleUrl = `${BASE_URL}/actualites/${slugifyProjectTitle(article.slug) || article.id}`;
        html = applyHeadMeta(html, {
          title: article.metaTitle || `${article.title} | Groupe Acharaf`,
          description: article.metaDescription || article.excerpt || article.title,
          canonicalUrl: canonicalArticleUrl,
          ogImage: article.coverImageUrl || undefined,
          ogType: "article",
        });
        res.status(200).send(html);
        return;
      }

      // 3. Static & Listing Pages
      const validStaticRoutes = new Set([
        "/",
        "/a-propos",
        "/nos-marques",
        "/nos-projets",
        "/opportunites",
        "/carrieres",
        "/contact",
        "/admin",
        "/admin/login",
      ]);

      if (!validStaticRoutes.has(normalizedPath)) {
        send404Html(res, normalizedPath, "Page introuvable");
        return;
      }

      if (normalizedPath === "/admin" || normalizedPath === "/admin/login") {
        html = applyHeadMeta(html, {
          title: "Administration | Groupe Acharaf",
          description: "Espace d'administration du Groupe Acharaf.",
          canonicalUrl: `${BASE_URL}${normalizedPath}`,
          robots: "noindex, nofollow",
        });
        res.set("X-Robots-Tag", "noindex, nofollow");
        res.status(200).send(html);
        return;
      }

      // Fetch published projects for crawlable internal links on /, /nos-projets, and /opportunites
      const allPublishedProjects = await db
        .select({
          id: projectsTable.id,
          title: projectsTable.title,
          slug: projectsTable.slug,
          projectType: projectsTable.projectType,
          displayType: projectsTable.displayType,
          isOpportunity: projectsTable.isOpportunity,
          city: projectsTable.city,
          location: projectsTable.location,
          shortDescription: projectsTable.shortDescription,
          description: projectsTable.description,
          published: projectsTable.published,
          noIndex: projectsTable.noIndex,
          displayOrder: projectsTable.displayOrder,
          createdAt: projectsTable.createdAt,
        })
        .from(projectsTable)
        .orderBy(asc(projectsTable.displayOrder), desc(projectsTable.createdAt));

      const crawlableProjects = allPublishedProjects.filter(
        (p) => p.published !== false && p.noIndex !== true,
      );

      const renderProjectLinksHtml = (list: typeof crawlableProjects) =>
        `<ul style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem;list-style:none;padding:0;">${list
          .map((p) => {
            const pSlug =
              slugifyProjectTitle(p.slug) ||
              slugifyProjectTitle(p.title) ||
              String(p.id);
            const pCity = p.city || p.location || "Maroc";
            const pDesc = (p.shortDescription || p.description || "").slice(0, 140);
            return `<li><article><h3><a href="/nos-projets/${escapeHtml(pSlug)}">${escapeHtml(p.title)}</a></h3><p>${escapeHtml(p.projectType || "Projet immobilier")} — ${escapeHtml(pCity)}</p>${pDesc ? `<p>${escapeHtml(pDesc)}</p>` : ""}</article></li>`;
          })
          .join("")}</ul>`;

      if (normalizedPath === "/") {
        html = applyHeadMeta(html, {
          title: "Groupe Acharaf | Promoteur Immobilier d'Exception au Maroc",
          description:
            "Groupe Acharaf, promoteur immobilier marocain d'excellence. Découvrez nos projets de luxe et de haut standing à Casablanca, Marrakech, Agadir et Meknès.",
          canonicalUrl: `${BASE_URL}/`,
        });
        const homeSsr = `<div id="root"><main style="max-width:1200px;margin:0 auto;padding:3rem 1.5rem;font-family:Roboto,sans-serif;"><h1>Groupe Acharaf — Promoteur Immobilier d'Exception au Maroc</h1><p>Depuis plus de 40 ans, le Groupe Acharaf conçoit et réalise des projets immobiliers de luxe (Estya) et de haut standing (Acharaf Immobilier) à Casablanca, Marrakech, Agadir et à travers le Maroc.</p><nav aria-label="Navigation principale"><a href="/a-propos">À propos</a> &middot; <a href="/nos-marques">Nos Marques</a> &middot; <a href="/nos-projets">Nos Projets</a> &middot; <a href="/opportunites">Opportunités</a> &middot; <a href="/carrieres">Carrières</a> &middot; <a href="/contact">Contact</a></nav><section><h2>Nos Projets et Réalisations Immobilières</h2>${renderProjectLinksHtml(crawlableProjects)}</section></main></div>`;
        html = html.replace('<div id="root"></div>', homeSsr);
      } else if (normalizedPath === "/nos-projets") {
        html = applyHeadMeta(html, {
          title: "Projets Immobiliers de Haut Standing au Maroc | Groupe Acharaf",
          description:
            "Découvrez les projets immobiliers de haut standing et de luxe du Groupe Acharaf à Agadir, Marrakech, Casablanca et Meknès. Résidences neuves et lotissements d'exception.",
          canonicalUrl: `${BASE_URL}/nos-projets`,
        });
        const nosProjetsSsr = `<div id="root"><main style="max-width:1200px;margin:0 auto;padding:3rem 1.5rem;font-family:Roboto,sans-serif;"><h1>Nos Projets Immobiliers au Maroc — Estya &amp; Acharaf Immobilier</h1><p>Explorez l'ensemble des projets résidentiels, villas de luxe, appartements de haut standing, locaux commerciaux et lotissements développés par le Groupe Acharaf.</p><nav aria-label="Navigation"><a href="/">Accueil</a> &middot; <a href="/opportunites">Opportunités foncières</a> &middot; <a href="/nos-marques">Nos Marques</a> &middot; <a href="/contact">Contact</a></nav><section><h2>Catalogue complet des projets</h2>${renderProjectLinksHtml(crawlableProjects)}</section></main></div>`;
        html = html.replace('<div id="root"></div>', nosProjetsSsr);
      } else if (normalizedPath === "/opportunites") {
        html = applyHeadMeta(html, {
          title: "Opportunités d'Investissement Immobilier au Maroc | Groupe Acharaf",
          description:
            "Découvrez nos opportunités d'investissement immobilier au Maroc : terrains, lots R+1, R+2, R+3, équipements et locaux commerciaux de haut standing.",
          canonicalUrl: `${BASE_URL}/opportunites`,
        });
        const oppProjects = crawlableProjects.filter(
          (p) => p.displayType === "opportunity" || p.isOpportunity,
        );
        const oppSsr = `<div id="root"><main style="max-width:1200px;margin:0 auto;padding:3rem 1.5rem;font-family:Roboto,sans-serif;"><h1>Opportunités d'Investissement Immobilier &amp; Foncier — Groupe Acharaf</h1><p>Découvrez nos lots de terrains R+1, R+2, R+3, lots pour équipements privés et opportunités d'investissement foncier à fort potentiel au Maroc.</p><nav aria-label="Navigation"><a href="/">Accueil</a> &middot; <a href="/nos-projets">Tous nos projets</a> &middot; <a href="/contact">Contact</a></nav><section><h2>Opportunités disponibles</h2>${renderProjectLinksHtml(oppProjects.length > 0 ? oppProjects : crawlableProjects)}</section></main></div>`;
        html = html.replace('<div id="root"></div>', oppSsr);
      } else if (normalizedPath === "/a-propos") {
        html = applyHeadMeta(html, {
          title: "À propos du Groupe Acharaf | Promoteur Immobilier Maroc",
          description:
            "Découvrez l’histoire, la vision et l’exigence de Groupe Acharaf, promoteur immobilier marocain d'excellence de haut standing. Plus de 40 ans de savoir-faire.",
          canonicalUrl: `${BASE_URL}/a-propos`,
        });
        const aproposSsr = `<div id="root"><main style="max-width:1200px;margin:0 auto;padding:3rem 1.5rem;font-family:Roboto,sans-serif;"><h1>À propos du Groupe Acharaf</h1><p>Fort de plus de quatre décennies d'expérience, le Groupe Acharaf façonne un immobilier d'exception au Maroc, alliant rigueur architecturale, emplacements stratégiques et pérennité patrimoniale.</p><p><a href="/nos-projets">Découvrir nos projets</a> &middot; <a href="/nos-marques">Nos marques Estya et Acharaf Immobilier</a> &middot; <a href="/contact">Nous contacter</a></p></main></div>`;
        html = html.replace('<div id="root"></div>', aproposSsr);
      } else if (normalizedPath === "/nos-marques") {
        html = applyHeadMeta(html, {
          title: "Nos Marques : Estya & Acharaf | Immobilier de Luxe & Premium Maroc",
          description:
            "Découvrez Estya (immobilier de luxe au Maroc) et Acharaf Immobilier (résidences premium de haut standing), les deux signatures de prestige du Groupe Acharaf.",
          canonicalUrl: `${BASE_URL}/nos-marques`,
        });
        const marquesSsr = `<div id="root"><main style="max-width:1200px;margin:0 auto;padding:3rem 1.5rem;font-family:Roboto,sans-serif;"><h1>Nos Marques : Estya &amp; Acharaf Immobilier</h1><p>Deux signatures complémentaires au service de l'excellence immobilière au Maroc : Estya pour les résidences et villas d'ultra-luxe, et Acharaf Immobilier pour les projets résidentiels et fonciers de haut standing.</p><p><a href="/nos-projets">Voir nos réalisations</a> &middot; <a href="/opportunites">Nos opportunités</a> &middot; <a href="/contact">Contact</a></p></main></div>`;
        html = html.replace('<div id="root"></div>', marquesSsr);
      } else if (normalizedPath === "/carrieres") {
        html = applyHeadMeta(html, {
          title: "Carrières & Recrutement | Rejoindre le Groupe Acharaf",
          description:
            "Rejoignez Groupe Acharaf, promoteur immobilier marocain d'excellence. Consultez nos offres d'emploi ou déposez une candidature spontanée.",
          canonicalUrl: `${BASE_URL}/carrieres`,
        });
        const carrieresSsr = `<div id="root"><main style="max-width:1200px;margin:0 auto;padding:3rem 1.5rem;font-family:Roboto,sans-serif;"><h1>Carrières &amp; Recrutement — Groupe Acharaf</h1><p>Bâtissez votre avenir au sein d'un groupe immobilier marocain de référence. Découvrez nos opportunités de carrière ou envoyez une candidature spontanée.</p><p><a href="/a-propos">Découvrir le Groupe</a> &middot; <a href="/nos-projets">Nos projets</a> &middot; <a href="/contact">Contact</a></p></main></div>`;
        html = html.replace('<div id="root"></div>', carrieresSsr);
      } else if (normalizedPath === "/contact") {
        html = applyHeadMeta(html, {
          title: "Contact & Bureaux de Vente | Groupe Acharaf Maroc",
          description:
            "Contactez le Groupe Acharaf, promoteur immobilier au Maroc. Nos coordonnées, adresse de notre siège à Casablanca et formulaires de contact.",
          canonicalUrl: `${BASE_URL}/contact`,
        });
        const contactSsr = `<div id="root"><main style="max-width:1200px;margin:0 auto;padding:3rem 1.5rem;font-family:Roboto,sans-serif;"><h1>Contactez le Groupe Acharaf</h1><p>Siège social : 465, Avenue Ambassadeur Ben Aïcha, Roches Noires, Casablanca, Maroc. Téléphone : +212 5 22 40 68 48 — Email : infos@groupeacharaf.ma.</p><p><a href="/nos-projets">Découvrir nos projets</a> &middot; <a href="/opportunites">Opportunités</a></p></main></div>`;
        html = html.replace('<div id="root"></div>', contactSsr);
      }
    } catch (err) {
      logger.error(err, "Prerender meta replacement failed");
    }

    res.status(200).send(html);
  });
}

export default app;
