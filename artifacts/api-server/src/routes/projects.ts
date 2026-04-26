import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
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

router.get("/projects", async (req, res): Promise<void> => {
  const queryParams = ListProjectsQueryParams.safeParse(req.query);
  const projects = await db
    .select({
      id: projectsTable.id,
      brandId: projectsTable.brandId,
      title: projectsTable.title,
      slug: projectsTable.slug,
      description: projectsTable.description,
      location: projectsTable.location,
      city: projectsTable.city,
      status: projectsTable.status,
      priceMin: projectsTable.priceMin,
      priceMax: projectsTable.priceMax,
      surfaceMin: projectsTable.surfaceMin,
      surfaceMax: projectsTable.surfaceMax,
      deliveryDate: projectsTable.deliveryDate,
      featured: projectsTable.featured,
      coverImageUrl: projectsTable.coverImageUrl,
      images: projectsTable.images,
      tagline: projectsTable.tagline,
      shortDescription: projectsTable.shortDescription,
      storyTitle: projectsTable.storyTitle,
      storyText: projectsTable.storyText,
      lifestyleTitle: projectsTable.lifestyleTitle,
      lifestyleText: projectsTable.lifestyleText,
      locationAdvantages: projectsTable.locationAdvantages,
      mapLocation: projectsTable.mapLocation,
      financingDetails: projectsTable.financingDetails,
      ctaText: projectsTable.ctaText,
      seoTitle: projectsTable.seoTitle,
      seoDescription: projectsTable.seoDescription,
      amenities: projectsTable.amenities,
      createdAt: projectsTable.createdAt,
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
    })
    .from(projectsTable)
    .leftJoin(brandsTable, eq(projectsTable.brandId, brandsTable.id))
    .orderBy(projectsTable.createdAt);

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
  const [project] = await db.insert(projectsTable).values(parsed.data).returning();

  const [full] = await db
    .select({
      id: projectsTable.id,
      brandId: projectsTable.brandId,
      title: projectsTable.title,
      slug: projectsTable.slug,
      description: projectsTable.description,
      location: projectsTable.location,
      city: projectsTable.city,
      status: projectsTable.status,
      priceMin: projectsTable.priceMin,
      priceMax: projectsTable.priceMax,
      surfaceMin: projectsTable.surfaceMin,
      surfaceMax: projectsTable.surfaceMax,
      deliveryDate: projectsTable.deliveryDate,
      featured: projectsTable.featured,
      coverImageUrl: projectsTable.coverImageUrl,
      images: projectsTable.images,
      amenities: projectsTable.amenities,
      createdAt: projectsTable.createdAt,
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
    })
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
    .select({
      id: projectsTable.id,
      brandId: projectsTable.brandId,
      title: projectsTable.title,
      slug: projectsTable.slug,
      description: projectsTable.description,
      location: projectsTable.location,
      city: projectsTable.city,
      status: projectsTable.status,
      priceMin: projectsTable.priceMin,
      priceMax: projectsTable.priceMax,
      surfaceMin: projectsTable.surfaceMin,
      surfaceMax: projectsTable.surfaceMax,
      deliveryDate: projectsTable.deliveryDate,
      featured: projectsTable.featured,
      coverImageUrl: projectsTable.coverImageUrl,
      images: projectsTable.images,
      amenities: projectsTable.amenities,
      createdAt: projectsTable.createdAt,
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
    })
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
  await db.update(projectsTable).set(parsed.data).where(eq(projectsTable.id, params.data.id));

  const [full] = await db
    .select({
      id: projectsTable.id,
      brandId: projectsTable.brandId,
      title: projectsTable.title,
      slug: projectsTable.slug,
      description: projectsTable.description,
      location: projectsTable.location,
      city: projectsTable.city,
      status: projectsTable.status,
      priceMin: projectsTable.priceMin,
      priceMax: projectsTable.priceMax,
      surfaceMin: projectsTable.surfaceMin,
      surfaceMax: projectsTable.surfaceMax,
      deliveryDate: projectsTable.deliveryDate,
      featured: projectsTable.featured,
      coverImageUrl: projectsTable.coverImageUrl,
      images: projectsTable.images,
      amenities: projectsTable.amenities,
      createdAt: projectsTable.createdAt,
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
    })
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
