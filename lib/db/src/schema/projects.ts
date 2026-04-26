import { pgTable, text, serial, timestamp, boolean, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  location: text("location"),
  city: text("city"),
  status: text("status").notNull().default("upcoming"),
  priceMin: real("price_min"),
  priceMax: real("price_max"),
  surfaceMin: real("surface_min"),
  surfaceMax: real("surface_max"),
  deliveryDate: text("delivery_date"),
  featured: boolean("featured").notNull().default(false),
  coverImageUrl: text("cover_image_url"),
  images: text("images").array(),
  
  // New details fields
  tagline: text("tagline"),
  shortDescription: text("short_description"),
  storyTitle: text("story_title"),
  storyText: text("story_text"),
  lifestyleTitle: text("lifestyle_title"),
  lifestyleText: text("lifestyle_text"),
  locationAdvantages: text("location_advantages").array(),
  mapLocation: text("map_location"),
  financingDetails: text("financing_details"),
  ctaText: text("cta_text"),
  
  // SEO
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),

  amenities: text("amenities").array(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, createdAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
