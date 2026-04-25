import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, articlesTable } from "@workspace/db";
import {
  CreateArticleBody,
  UpdateArticleBody,
  GetArticleParams,
  UpdateArticleParams,
  DeleteArticleParams,
  ListArticlesQueryParams,
  ListArticlesResponse,
  GetArticleResponse,
  UpdateArticleResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/articles", async (req, res): Promise<void> => {
  const queryParams = ListArticlesQueryParams.safeParse(req.query);
  const query = db.select().from(articlesTable);
  const all = await query.orderBy(articlesTable.createdAt);
  let filtered = all;
  if (queryParams.success && queryParams.data.published !== undefined) {
    filtered = all.filter((a) => a.published === queryParams.data.published);
  }
  res.json(ListArticlesResponse.parse(filtered));
});

router.post("/articles", async (req, res): Promise<void> => {
  const parsed = CreateArticleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [article] = await db.insert(articlesTable).values(parsed.data).returning();
  res.status(201).json(GetArticleResponse.parse(article));
});

router.get("/articles/:id", async (req, res): Promise<void> => {
  const params = GetArticleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [article] = await db.select().from(articlesTable).where(eq(articlesTable.id, params.data.id));
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(GetArticleResponse.parse(article));
});

router.put("/articles/:id", async (req, res): Promise<void> => {
  const params = UpdateArticleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateArticleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [article] = await db
    .update(articlesTable)
    .set(parsed.data)
    .where(eq(articlesTable.id, params.data.id))
    .returning();
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(UpdateArticleResponse.parse(article));
});

router.delete("/articles/:id", async (req, res): Promise<void> => {
  const params = DeleteArticleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(articlesTable).where(eq(articlesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
