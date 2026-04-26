import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, careersTable, applicationsTable } from "@workspace/db";
import {
  CreateCareerBody,
  UpdateCareerBody,
  GetCareerParams,
  UpdateCareerParams,
  DeleteCareerParams,
  ListCareersQueryParams,
  ApplyForCareerParams,
  ApplyForCareerBody,
  ListCareersResponse,
  GetCareerResponse,
  UpdateCareerResponse,
  ListApplicationsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/careers", async (req, res): Promise<void> => {
  const queryParams = ListCareersQueryParams.safeParse(req.query);
  const all = await db.select().from(careersTable).orderBy(careersTable.createdAt);
  let filtered = all;
  if (queryParams.success && queryParams.data.active !== undefined) {
    filtered = all.filter((c) => c.active === queryParams.data.active);
  }
  res.json(ListCareersResponse.parse(filtered));
});

router.post("/careers", async (req, res): Promise<void> => {
  const parsed = CreateCareerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [career] = await db.insert(careersTable).values(parsed.data).returning();
  res.status(201).json(GetCareerResponse.parse(career));
});

router.get("/careers/:id", async (req, res): Promise<void> => {
  const params = GetCareerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [career] = await db.select().from(careersTable).where(eq(careersTable.id, params.data.id));
  if (!career) {
    res.status(404).json({ error: "Career not found" });
    return;
  }
  res.json(GetCareerResponse.parse(career));
});

router.put("/careers/:id", async (req, res): Promise<void> => {
  const params = UpdateCareerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCareerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [career] = await db
    .update(careersTable)
    .set(parsed.data)
    .where(eq(careersTable.id, params.data.id))
    .returning();
  if (!career) {
    res.status(404).json({ error: "Career not found" });
    return;
  }
  res.json(UpdateCareerResponse.parse(career));
});

router.delete("/careers/:id", async (req, res): Promise<void> => {
  const params = DeleteCareerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(careersTable).where(eq(careersTable.id, params.data.id));
  res.sendStatus(204);
});

router.post("/careers/:id/apply", async (req, res): Promise<void> => {
  const params = ApplyForCareerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = ApplyForCareerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [career] = await db.select().from(careersTable).where(eq(careersTable.id, params.data.id));
  if (!career) {
    res.status(404).json({ error: "Career not found" });
    return;
  }
  const [application] = await db
    .insert(applicationsTable)
    .values({ ...parsed.data, careerId: params.data.id })
    .returning();
  res.status(201).json(application);
});

router.get("/applications", async (_req, res): Promise<void> => {
  const apps = await db
    .select({
      id: applicationsTable.id,
      careerId: applicationsTable.careerId,
      firstName: applicationsTable.firstName,
      lastName: applicationsTable.lastName,
      email: applicationsTable.email,
      phone: applicationsTable.phone,
      message: applicationsTable.message,
      createdAt: applicationsTable.createdAt,
      career: {
        id: careersTable.id,
        title: careersTable.title,
        slug: careersTable.slug,
        department: careersTable.department,
        location: careersTable.location,
        type: careersTable.type,
        description: careersTable.description,
        requirements: careersTable.requirements,
        coverImageUrl: careersTable.coverImageUrl,
        active: careersTable.active,
        metaTitle: careersTable.metaTitle,
        metaDescription: careersTable.metaDescription,
        createdAt: careersTable.createdAt,
      },
    })
    .from(applicationsTable)
    .leftJoin(careersTable, eq(applicationsTable.careerId, careersTable.id))
    .orderBy(applicationsTable.createdAt);
  res.json(ListApplicationsResponse.parse(apps));
});

export default router;
