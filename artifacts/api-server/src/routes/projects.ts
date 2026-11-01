import { Router, type IRouter } from "express";
import { asc, desc, eq } from "drizzle-orm";
import { db, projectsTable, brandsTable } from "@workspace/db";
import {
  CreateProjectBody,
  UpdateProjectBody,
  GetProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
  ListProjectsQueryParams,
  ListProjectsResponse,
  GetProjectResponse,
  UpdateProjectResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const OPPORTUNITY_TYPES = new Set(["lots_r1", "lots_r2", "lots_r3", "creche"]);

function slugifyTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ensureUniqueSlug(baseTitle: string, options?: { excludeId?: number }) {
  const baseSlug = slugifyTitle(baseTitle) || "projet";
  const all = await db.select({ id: projectsTable.id, slug: projectsTable.slug }).from(projectsTable);
  const used = new Set(
    all
      .filter((p) => (options?.excludeId ? p.id !== options.excludeId : true))
      .map((p) => p.slug.toLowerCase()),
  );
  if (!used.has(baseSlug)) return baseSlug;
  let suffix = 2;
  while (used.has(`${baseSlug}-${suffix}`)) suffix += 1;
  return `${baseSlug}-${suffix}`;
}

function validateOpportunityCategory(payload: {
  displayType?: string;
  opportunityType?: string;
}) {
  if (payload.displayType !== "opportunity") return null;
  const category = payload.opportunityType?.trim();
  if (!category) {
    return "Opportunity category is required when displayType is opportunity.";
  }
  if (!OPPORTUNITY_TYPES.has(category)) {
    return "Invalid opportunity category.";
  }
  return null;
}

const projectSelection = {
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

function isAdminRequest(req: { query?: Record<string, unknown>; headers?: Record<string, unknown> }) {
  if (req.query?.includeUnpublished === "true") return true;
  const referer = typeof req.headers?.referer === "string" ? req.headers.referer : "";
  if (referer.includes("/admin")) return true;
  return false;
}

function sanitizeProjectRow<T extends Record<string, any>>(row: T): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    if (k === "brand") {
      out[k] = v && v.id ? v : undefined;
    } else {
      out[k] = v === null ? undefined : v;
    }
  }
  return out as T;
}

router.get("/projects", async (req, res): Promise<void> => {
  const queryParams = ListProjectsQueryParams.safeParse(req.query);
  const projects = await db
    .select(projectSelection)
    .from(projectsTable)
    .leftJoin(brandsTable, eq(projectsTable.brandId, brandsTable.id))
    .orderBy(asc(projectsTable.displayOrder), desc(projectsTable.createdAt));

  let filtered = projects;
  if (!isAdminRequest(req)) {
    filtered = filtered.filter((p) => p.published !== false);
  }
  if (queryParams.success) {
    if (queryParams.data.brandId !== undefined) {
      filtered = filtered.filter((p) => p.brandId === queryParams.data.brandId);
    }
    if (queryParams.data.featured !== undefined) {
      filtered = filtered.filter((p) => p.featured === queryParams.data.featured);
    }
    if (queryParams.data.status !== undefined) {
      filtered = filtered.filter((p) => p.status === queryParams.data.status);
    }
  }

  res.json(ListProjectsResponse.parse(filtered.map(sanitizeProjectRow)));
});

router.post("/projects", async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const opportunityValidationError = validateOpportunityCategory(parsed.data);
  if (opportunityValidationError) {
    res.status(400).json({ error: opportunityValidationError });
    return;
  }
  const slugSource = parsed.data.slug?.trim() ? parsed.data.slug.trim() : parsed.data.title;
  const resolvedSlug = await ensureUniqueSlug(slugSource);

  // Map brandId and isOpportunity based on displayType
  const displayType = parsed.data.displayType;
  const brandId = displayType === "estya" ? 1 : (displayType === "acharaf" ? 2 : parsed.data.brandId);
  const isOpportunity = displayType === "opportunity";

  const [project] = await db
    .insert(projectsTable)
    .values({
      ...parsed.data,
      brandId,
      isOpportunity,
      slug: resolvedSlug,
      description: parsed.data.description ?? "",
      location: parsed.data.location ?? "",
      city: parsed.data.city ?? "",
      deliveryDate: parsed.data.deliveryDate ?? "",
      coverImageUrl: parsed.data.coverImageUrl ?? "",
      images: parsed.data.images ?? [],
      amenities: parsed.data.amenities ?? [],
      priceMin: parsed.data.priceMin ?? 0,
      priceMax: parsed.data.priceMax ?? 0,
      surfaceMin: parsed.data.surfaceMin ?? 0,
      surfaceMax: parsed.data.surfaceMax ?? 0,
      published: parsed.data.published ?? true,
      noIndex: parsed.data.noIndex ?? false,
      previousSlugs: parsed.data.previousSlugs ?? [],
    })
    .returning();

  const [full] = await db
    .select(projectSelection)
    .from(projectsTable)
    .leftJoin(brandsTable, eq(projectsTable.brandId, brandsTable.id))
    .where(eq(projectsTable.id, project.id));

  res.status(201).json(GetProjectResponse.parse(sanitizeProjectRow(full)));
});

router.get("/projects/by-slug/:slug", async (req, res): Promise<void> => {
  const rawSlug = decodeURIComponent(req.params.slug || "").trim().toLowerCase();
  if (!rawSlug) {
    res.status(400).json({ error: "Invalid slug" });
    return;
  }
  const allProjects = await db
    .select(projectSelection)
    .from(projectsTable)
    .leftJoin(brandsTable, eq(projectsTable.brandId, brandsTable.id));

  const project =
    allProjects.find((p) => p.slug.toLowerCase() === rawSlug) ??
    allProjects.find((p) =>
      Array.isArray(p.previousSlugs) &&
      p.previousSlugs.some((oldSlug) => oldSlug.toLowerCase() === rawSlug),
    );

  if (!project || (!isAdminRequest(req) && project.published === false)) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(GetProjectResponse.parse(sanitizeProjectRow(project)));
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    // Allow fallback lookup by slug if :id is a non-numeric slug
    const rawSlug = decodeURIComponent(req.params.id || "").trim().toLowerCase();
    const allProjects = await db
      .select(projectSelection)
      .from(projectsTable)
      .leftJoin(brandsTable, eq(projectsTable.brandId, brandsTable.id));
    const bySlug =
      allProjects.find((p) => p.slug.toLowerCase() === rawSlug) ??
      allProjects.find((p) =>
        Array.isArray(p.previousSlugs) &&
        p.previousSlugs.some((oldSlug) => oldSlug.toLowerCase() === rawSlug),
      );
    if (!bySlug || (!isAdminRequest(req) && bySlug.published === false)) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(GetProjectResponse.parse(sanitizeProjectRow(bySlug)));
    return;
  }
  const [project] = await db
    .select(projectSelection)
    .from(projectsTable)
    .leftJoin(brandsTable, eq(projectsTable.brandId, brandsTable.id))
    .where(eq(projectsTable.id, params.data.id));

  if (!project || (!isAdminRequest(req) && project.published === false)) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(GetProjectResponse.parse(sanitizeProjectRow(project)));
});

router.put("/projects/:id", async (req, res): Promise<void> => {
  const params = UpdateProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const opportunityValidationError = validateOpportunityCategory(parsed.data);
  if (opportunityValidationError) {
    res.status(400).json({ error: opportunityValidationError });
    return;
  }
  const [existing] = await db
    .select({
      id: projectsTable.id,
      slug: projectsTable.slug,
      title: projectsTable.title,
      previousSlugs: projectsTable.previousSlugs,
    })
    .from(projectsTable)
    .where(eq(projectsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  let resolvedSlug = slugifyTitle(existing.slug) || existing.slug;
  if (parsed.data.slug && slugifyTitle(parsed.data.slug) !== resolvedSlug) {
    resolvedSlug = await ensureUniqueSlug(parsed.data.slug, { excludeId: existing.id });
  } else if (!cleanSlug(existing.slug)) {
    resolvedSlug = await ensureUniqueSlug(parsed.data.title || existing.title, { excludeId: existing.id });
  }

  const prevSet = new Set<string>(Array.isArray(existing.previousSlugs) ? existing.previousSlugs : []);
  if (existing.slug && existing.slug !== resolvedSlug) {
    prevSet.add(existing.slug);
    prevSet.add(existing.slug.toLowerCase());
  }
  prevSet.delete(resolvedSlug);
  const updatedPreviousSlugs = Array.from(prevSet);

  // Map brandId and isOpportunity based on displayType
  const displayType = parsed.data.displayType;
  const brandId = displayType === "estya" ? 1 : (displayType === "acharaf" ? 2 : parsed.data.brandId);
  const isOpportunity = displayType === "opportunity";

  await db
    .update(projectsTable)
    .set({
      ...parsed.data,
      brandId,
      isOpportunity,
      slug: resolvedSlug,
      previousSlugs: updatedPreviousSlugs,
      updatedAt: new Date(),
    })
    .where(eq(projectsTable.id, params.data.id));

  const [full] = await db
    .select(projectSelection)
    .from(projectsTable)
    .leftJoin(brandsTable, eq(projectsTable.brandId, brandsTable.id))
    .where(eq(projectsTable.id, params.data.id));

  if (!full) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(UpdateProjectResponse.parse(sanitizeProjectRow(full)));
});

router.delete("/projects/:id", async (req, res): Promise<void> => {
  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(projectsTable).where(eq(projectsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;

function cleanSlug(value: string | null | undefined) {
  return value?.trim() ?? "";
}
