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
  isOpportunity?: boolean;
  opportunityType?: string;
}) {
  if (!payload.isOpportunity) return null;
  const category = payload.opportunityType?.trim();
  if (!category) {
    return "Opportunity category is required when isOpportunity is true.";
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

router.get("/projects", async (req, res): Promise<void> => {
  const queryParams = ListProjectsQueryParams.safeParse(req.query);
  const projects = await db
    .select(projectSelection)
    .from(projectsTable)
    .leftJoin(brandsTable, eq(projectsTable.brandId, brandsTable.id))
    .orderBy(asc(projectsTable.displayOrder), desc(projectsTable.createdAt));

  let filtered = projects;
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

  res.json(ListProjectsResponse.parse(filtered));
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
  const resolvedSlug = await ensureUniqueSlug(parsed.data.title);
  const [project] = await db
    .insert(projectsTable)
    .values({ ...parsed.data, slug: resolvedSlug })
    .returning();

  const [full] = await db
    .select(projectSelection)
    .from(projectsTable)
    .leftJoin(brandsTable, eq(projectsTable.brandId, brandsTable.id))
    .where(eq(projectsTable.id, project.id));

  res.status(201).json(GetProjectResponse.parse(full));
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [project] = await db
    .select(projectSelection)
    .from(projectsTable)
    .leftJoin(brandsTable, eq(projectsTable.brandId, brandsTable.id))
    .where(eq(projectsTable.id, params.data.id));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(GetProjectResponse.parse(project));
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
    .select({ id: projectsTable.id, slug: projectsTable.slug, title: projectsTable.title })
    .from(projectsTable)
    .where(eq(projectsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const resolvedSlug = cleanSlug(existing.slug)
    ? existing.slug
    : await ensureUniqueSlug(parsed.data.title || existing.title, { excludeId: existing.id });

  await db
    .update(projectsTable)
    .set({ ...parsed.data, slug: resolvedSlug, updatedAt: new Date() })
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
  res.json(UpdateProjectResponse.parse(full));
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
