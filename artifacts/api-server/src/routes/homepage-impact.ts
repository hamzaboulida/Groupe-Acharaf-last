import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, homepageImpactSettingsTable, type StatItem } from "@workspace/db";

const router: IRouter = Router();

const DEFAULT_ITEMS: StatItem[] = [
  { id: "stat-1", value: 41, label: "Projets livrés", suffix: "", isVisible: true },
  { id: "stat-2", value: 46, label: "Années d'expérience", suffix: "", isVisible: true },
  { id: "stat-3", value: 9720, label: "Unités livrées", suffix: "", isVisible: true },
  { id: "stat-4", value: 7, label: "Villes présentes", suffix: "", isVisible: true },
];

const DEFAULT_TITLE = "NOTRE IMPACT · EN CHIFFRES";

const statItemSchema = z.object({
  id: z.string(),
  value: z.number(),
  label: z.string(),
  suffix: z.string().optional().default(""),
  isVisible: z.boolean().default(true),
});

const payloadSchema = z.object({
  isVisible: z.boolean().default(true),
  title: z.string().default(DEFAULT_TITLE),
  items: z.array(statItemSchema).default([]),
});

router.get("/homepage-impact", async (_req, res): Promise<void> => {
  const [settings] = await db
    .select()
    .from(homepageImpactSettingsTable)
    .where(eq(homepageImpactSettingsTable.id, 1));

  if (!settings) {
    res.json({
      id: 1,
      isVisible: true,
      title: DEFAULT_TITLE,
      items: DEFAULT_ITEMS,
    });
    return;
  }

  res.json({
    id: settings.id,
    isVisible: settings.isVisible ?? true,
    title: settings.title ?? DEFAULT_TITLE,
    items: settings.items && settings.items.length > 0 ? settings.items : DEFAULT_ITEMS,
    updatedAt: settings.updatedAt,
  });
});

router.put("/homepage-impact", async (req, res): Promise<void> => {
  const parsed = payloadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const normalized = {
    isVisible: parsed.data.isVisible,
    title: parsed.data.title.trim() || DEFAULT_TITLE,
    items: parsed.data.items.map((item, index) => ({
      id: item.id || `stat-${Date.now()}-${index}`,
      value: Number(item.value) || 0,
      label: item.label.trim(),
      suffix: (item.suffix || "").trim(),
      isVisible: item.isVisible ?? true,
    })),
    updatedAt: new Date(),
  };

  const [existing] = await db
    .select({ id: homepageImpactSettingsTable.id })
    .from(homepageImpactSettingsTable)
    .where(eq(homepageImpactSettingsTable.id, 1));

  if (existing) {
    await db
      .update(homepageImpactSettingsTable)
      .set(normalized)
      .where(eq(homepageImpactSettingsTable.id, 1));
  } else {
    await db.insert(homepageImpactSettingsTable).values({
      id: 1,
      ...normalized,
    });
  }

  const [saved] = await db
    .select()
    .from(homepageImpactSettingsTable)
    .where(eq(homepageImpactSettingsTable.id, 1));

  res.json(saved);
});

export default router;
