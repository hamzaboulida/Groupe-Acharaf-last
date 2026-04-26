import { Router } from "express";
import { db } from "@workspace/db";
import { projectsTable, articlesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

const BASE_URL = "https://groupeacharaf.ma";

router.get("/robots.txt", (_req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`);
});

router.get("/sitemap.xml", async (_req, res) => {
  try {
    const [allProjects, allArticles] = await Promise.all([
      db.select({ id: projectsTable.id, updatedAt: projectsTable.updatedAt }).from(projectsTable),
      db.select({ id: articlesTable.id, slug: articlesTable.slug, updatedAt: articlesTable.updatedAt })
        .from(articlesTable)
        .where(eq(articlesTable.published, true)),
    ]);

    const staticUrls: { loc: string; priority: string; changefreq: string; lastmod?: string }[] = [
      { loc: `${BASE_URL}/`, priority: "1.0", changefreq: "weekly" },
      { loc: `${BASE_URL}/a-propos`, priority: "0.8", changefreq: "monthly" },
      { loc: `${BASE_URL}/nos-marques`, priority: "0.9", changefreq: "monthly" },
      { loc: `${BASE_URL}/nos-projets`, priority: "0.9", changefreq: "weekly" },
      { loc: `${BASE_URL}/actualites`, priority: "0.8", changefreq: "weekly" },
      { loc: `${BASE_URL}/carrieres`, priority: "0.6", changefreq: "weekly" },
      { loc: `${BASE_URL}/contact`, priority: "0.7", changefreq: "monthly" },
    ];

    const projectUrls = allProjects.map((p) => ({
      loc: `${BASE_URL}/nos-projets/${p.id}`,
      priority: "0.8",
      changefreq: "monthly",
      lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : undefined,
    }));

    const articleUrls = allArticles.map((a) => ({
      loc: `${BASE_URL}/actualites/${a.id}`,
      priority: "0.7",
      changefreq: "monthly",
      lastmod: a.updatedAt ? new Date(a.updatedAt).toISOString().split("T")[0] : undefined,
    }));

    const allUrls = [...staticUrls, ...projectUrls, ...articleUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.type("application/xml");
    res.send(xml);
  } catch (err) {
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
