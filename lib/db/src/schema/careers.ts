import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const careersTable = pgTable("careers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  department: text("department").notNull(),
  location: text("location"),
  type: text("type").notNull().default("full-time"),
  description: text("description"),
  requirements: text("requirements").array(),
  coverImageUrl: text("cover_image_url"),
  active: boolean("active").notNull().default(true),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCareerSchema = createInsertSchema(careersTable).omit({ id: true, createdAt: true });
export type InsertCareer = z.infer<typeof insertCareerSchema>;
export type Career = typeof careersTable.$inferSelect;

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  careerId: serial("career_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, createdAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
