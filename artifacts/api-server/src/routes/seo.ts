import { Router } from "express";
import { db } from "@workspace/db";
import { projectsTable, articlesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

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

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

router.get("/robots.txt", (_req, res) => {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.set("Cache-Control", "no-cache");
  res.send(`User-agent: *
Allow: /
Allow: /api/
Disallow: /admin
Disallow: /api/admin

Sitemap: ${BASE_URL}/sitemap.xml
`);
});

router.get("/sitemap.xml", async (_req, res) => {
  try {
    const [allProjects, allArticles] = await Promise.all([
      db.select({
        id: projectsTable.id,
        slug: projectsTable.slug,
        title: projectsTable.title,
        published: projectsTable.published,
        noIndex: projectsTable.noIndex,
        createdAt: projectsTable.createdAt,
        updatedAt: projectsTable.updatedAt,
      }).from(projectsTable),
      db.select({
        id: articlesTable.id,
        slug: articlesTable.slug,
        createdAt: articlesTable.createdAt,
        updatedAt: articlesTable.updatedAt,
      })
        .from(articlesTable)
        .where(eq(articlesTable.published, true)),
    ]);

    const indexableProjects = allProjects.filter(
      (p) => p.published !== false && p.noIndex !== true,
    );

    const latestProjectMod = indexableProjects.reduce<string | undefined>((latest, p) => {
      const d = p.updatedAt || p.createdAt;
      if (!d) return latest;
      const iso = new Date(d).toISOString().split("T")[0];
      return !latest || iso > latest ? iso : latest;
    }, undefined);

    const staticUrls: { loc: string; priority: string; changefreq: string; lastmod?: string }[] = [
      { loc: `${BASE_URL}/`, priority: "1.0", changefreq: "weekly", lastmod: latestProjectMod },
      { loc: `${BASE_URL}/a-propos`, priority: "0.8", changefreq: "monthly" },
      { loc: `${BASE_URL}/nos-marques`, priority: "0.9", changefreq: "monthly" },
      { loc: `${BASE_URL}/nos-projets`, priority: "0.9", changefreq: "weekly", lastmod: latestProjectMod },
      { loc: `${BASE_URL}/opportunites`, priority: "0.8", changefreq: "weekly", lastmod: latestProjectMod },
      { loc: `${BASE_URL}/carrieres`, priority: "0.6", changefreq: "weekly" },
      { loc: `${BASE_URL}/contact`, priority: "0.7", changefreq: "monthly" },
    ];

    const projectUrls = indexableProjects.map((p) => {
      const slug = slugifyProjectTitle(p.slug) || slugifyProjectTitle(p.title) || p.id.toString();
      const modDate = p.updatedAt || p.createdAt;
      return {
        loc: `${BASE_URL}/nos-projets/${slug}`,
        priority: "0.8",
        changefreq: "monthly",
        lastmod: modDate ? new Date(modDate).toISOString().split("T")[0] : undefined,
      };
    });

    const articleUrls = allArticles.map((a) => {
      const slug = slugifyProjectTitle(a.slug) || a.id.toString();
      const modDate = a.updatedAt || a.createdAt;
      return {
        loc: `${BASE_URL}/actualites/${slug}`,
        priority: "0.7",
        changefreq: "monthly",
        lastmod: modDate ? new Date(modDate).toISOString().split("T")[0] : undefined,
      };
    });

    const seen = new Set<string>();
    const allUrls = [...staticUrls, ...projectUrls, ...articleUrls].filter((u) => {
      if (seen.has(u.loc)) return false;
      seen.add(u.loc);
      return true;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>` : ""}
    <changefreq>${escapeXml(u.changefreq)}</changefreq>
    <priority>${escapeXml(u.priority)}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "no-cache");
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
