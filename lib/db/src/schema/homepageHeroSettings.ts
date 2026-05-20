import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const homepageHeroSettingsTable = pgTable("homepage_hero_settings", {
  id: serial("id").primaryKey(),
  mediaType: text("media_type").notNull().default("slideshow"), // slideshow | video | mixed
  images: text("images").array().notNull().default([]),
  videoUrl: text("video_url").notNull().default(""),
  fallbackImageUrl: text("fallback_image_url").notNull().default(""),
  enableVideoOnMobile: boolean("enable_video_on_mobile").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
