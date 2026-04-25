import { Router, type IRouter } from "express";
import { db, subscribersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

const CreateSubscriberBody = z.object({
  email: z.string().email(),
});

router.get("/subscribers", async (_req, res): Promise<void> => {
  const all = await db.select().from(subscribersTable).orderBy(subscribersTable.createdAt);
  res.json(all);
});

router.post("/subscribers", async (req, res): Promise<void> => {
  const parsed = CreateSubscriberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Email invalide." });
    return;
  }

  const existing = await db.select().from(subscribersTable).where(eq(subscribersTable.email, parsed.data.email));
  if (existing.length > 0) {
    res.status(200).json({ message: "already_subscribed" });
    return;
  }

  const [subscriber] = await db.insert(subscribersTable).values({ email: parsed.data.email }).returning();
  res.status(201).json(subscriber);
});

router.delete("/subscribers/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(subscribersTable).where(eq(subscribersTable.id, id));
  res.sendStatus(204);
});

export default router;
