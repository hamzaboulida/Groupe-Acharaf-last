import { sql } from "drizzle-orm";
import { pgTable, text, serial, timestamp, boolean, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  projectType: text("project_type").notNull().default(""),
  tagline: text("tagline").notNull().default(""),
  shortDescription: text("short_description").notNull().default(""),
  description: text("description"),
  longDescription: text("long_description").notNull().default(""),
  location: text("location"),
  city: text("city"),
  addressText: text("address_text").notNull().default(""),
  status: text("status").notNull().default("upcoming"),
  heroTitle: text("hero_title").notNull().default(""),
  heroSubtitle: text("hero_subtitle").notNull().default(""),
  heroLocationText: text("hero_location_text").notNull().default(""),
  primaryCtaLabel: text("primary_cta_label").notNull().default("Découvrir le projet"),
  secondaryCtaLabel: text("secondary_cta_label").notNull().default("Prendre rendez-vous"),
  priceMin: real("price_min"),
  priceMax: real("price_max"),
  showPrice: boolean("show_price").notNull().default(true),
  priceLabel: text("price_label").notNull().default("Prix de départ"),
  priceNote: text("price_note").notNull().default(""),
  availabilityNote: text("availability_note").notNull().default(""),
  surfaceMin: real("surface_min"),
  surfaceMax: real("surface_max"),
  deliveryDate: text("delivery_date"),
  featured: boolean("featured").notNull().default(false),
  isOpportunity: boolean("is_opportunity").notNull().default(false),
  opportunityType: text("opportunity_type").notNull().default("lots_r1"),
  opportunityTitle: text("opportunity_title").notNull().default(""),
  opportunityDescription: text("opportunity_description").notNull().default(""),
  opportunityHighlight: text("opportunity_highlight").notNull().default(""),
  opportunityValidUntil: text("opportunity_valid_until").notNull().default(""),
  opportunityCtaLabel: text("opportunity_cta_label").notNull().default("Découvrir l’opportunité"),
  coverImageUrl: text("cover_image_url"),
  secondaryImageUrl: text("secondary_image_url").notNull().default(""),
  lifestyleImageUrl: text("lifestyle_image_url").notNull().default(""),
  images: text("images").array(),
  
  // New details fields
  storyTitle: text("story_title"),
  storyText: text("story_text"),
  lifestyleText: text("lifestyle_text"),
  mapLocation: text("map_location"),
  financingDetails: text("financing_details"),
  ctaText: text("cta_text"),
  
  // SEO
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),

  amenities: text("amenities").array(),
  galleryTitle: text("gallery_title").notNull().default("Visuels du projet"),
  featuresTitle: text("features_title").notNull().default("Points forts du projet"),
  projectSectionTitle: text("project_section_title").notNull().default("Le projet"),
  projectSectionDescription: text("project_section_description").notNull().default(""),
  lifestyleTitle: text("lifestyle_title").notNull().default(""),
  lifestyleDescription: text("lifestyle_description").notNull().default(""),
  locationSectionTitle: text("location_section_title").notNull().default("Emplacement"),
  locationDescription: text("location_description").notNull().default(""),
  locationAdvantages: text("location_advantages").array().notNull().default(sql`'{}'::text[]`),
  mapEmbedUrl: text("map_embed_url").notNull().default(""),
  mapIframeCode: text("map_iframe_code").notNull().default(""),
  mapShareUrl: text("map_share_url").notNull().default(""),
  contactTitle: text("contact_title").notNull().default("Intéressé par ce projet ?"),
  contactSubtitle: text("contact_subtitle").notNull().default("Notre équipe vous recontacte dans les 24 heures pour organiser une visite ou répondre à toutes vos questions."),
  metaTitle: text("meta_title").notNull().default(""),
  metaDescription: text("meta_description").notNull().default(""),
  ogImageUrl: text("og_image_url").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, createdAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
