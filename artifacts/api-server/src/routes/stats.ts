import { Router, type IRouter } from "express";
import { db, projectsTable } from "@workspace/db";
import { count, eq, countDistinct } from "drizzle-orm";
import { GetStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [totalResult] = await db.select({ count: count() }).from(projectsTable);
  const total = totalResult?.count ?? 0;

  const [deliveredResult] = await db
    .select({ count: count() })
    .from(projectsTable)
    .where(eq(projectsTable.status, "completed"));
  const delivered = deliveredResult?.count ?? 0;

  const [citiesResult] = await db
    .select({ count: countDistinct(projectsTable.city) })
    .from(projectsTable);
  const cities = citiesResult?.count ?? 5;

  const stats = {
    totalProjects: total,
    deliveredProjects: delivered,
    yearsExperience: 20,
    totalUnits: total > 0 ? total * 120 : 0,
    satisfiedClients: delivered > 0 ? delivered * 95 : 0,
    cities: cities || 5,
  };

  res.json(GetStatsResponse.parse(stats));
});

export default router;
