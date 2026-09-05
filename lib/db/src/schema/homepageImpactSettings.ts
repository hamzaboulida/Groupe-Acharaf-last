import { pgTable, serial, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export interface StatItem {
  id: string;
  value: number;
  label: string;
  suffix?: string;
  isVisible: boolean;
}

export const homepageImpactSettingsTable = pgTable("homepage_impact_settings", {
  id: serial("id").primaryKey(),
  isVisible: boolean("is_visible").notNull().default(true),
  title: text("title").notNull().default("NOTRE IMPACT · EN CHIFFRES"),
  items: jsonb("items").$type<StatItem[]>().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
