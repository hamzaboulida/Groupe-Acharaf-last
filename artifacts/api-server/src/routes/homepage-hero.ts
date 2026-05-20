import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, homepageHeroSettingsTable } from "@workspace/db";

const router: IRouter = Router();

const mediaTypeSchema = z.enum(["slideshow", "video", "mixed"]);

const payloadSchema = z.object({
  mediaType: mediaTypeSchema,
  images: z.array(z.string()).default([]),
  videoUrl: z.string().default(""),
  fallbackImageUrl: z.string().default(""),
  enableVideoOnMobile: z.boolean().default(false),
});

router.get("/homepage-hero", async (_req, res): Promise<void> => {
  const [settings] = await db
    .select()
    .from(homepageHeroSettingsTable)
    .where(eq(homepageHeroSettingsTable.id, 1));

  if (!settings) {
    res.json({
      id: 1,
      mediaType: "slideshow",
      images: [],
      videoUrl: "",
      fallbackImageUrl: "",
      enableVideoOnMobile: false,
    });
    return;
  }

  res.json({
    id: settings.id,
    mediaType: settings.mediaType,
    images: settings.images ?? [],
    videoUrl: settings.videoUrl ?? "",
    fallbackImageUrl: settings.fallbackImageUrl ?? "",
    enableVideoOnMobile: settings.enableVideoOnMobile ?? false,
    updatedAt: settings.updatedAt,
  });
});

router.put("/homepage-hero", async (req, res): Promise<void> => {
  const parsed = payloadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const normalized = {
    mediaType: parsed.data.mediaType,
    images: parsed.data.images.map((v) => v.trim()).filter(Boolean),
    videoUrl: parsed.data.videoUrl.trim(),
    fallbackImageUrl: parsed.data.fallbackImageUrl.trim(),
    enableVideoOnMobile: parsed.data.enableVideoOnMobile,
    updatedAt: new Date(),
  };

  const [existing] = await db
    .select({ id: homepageHeroSettingsTable.id })
    .from(homepageHeroSettingsTable)
    .where(eq(homepageHeroSettingsTable.id, 1));

  if (existing) {
    await db
      .update(homepageHeroSettingsTable)
      .set(normalized)
      .where(eq(homepageHeroSettingsTable.id, 1));
  } else {
    await db.insert(homepageHeroSettingsTable).values({
      id: 1,
      ...normalized,
    });
  }

  const [saved] = await db
    .select()
    .from(homepageHeroSettingsTable)
    .where(eq(homepageHeroSettingsTable.id, 1));

  res.json(saved);
});

export default router;
