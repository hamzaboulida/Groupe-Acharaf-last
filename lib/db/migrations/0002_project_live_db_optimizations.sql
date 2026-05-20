BEGIN;

ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "project_type" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "tagline" text DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "short_description" text DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "long_description" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "address_text" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "hero_title" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "hero_subtitle" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "hero_location_text" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "primary_cta_label" text NOT NULL DEFAULT 'Découvrir le projet';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "secondary_cta_label" text NOT NULL DEFAULT 'Prendre rendez-vous';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "show_price" boolean NOT NULL DEFAULT true;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "price_note" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "secondary_image_url" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "lifestyle_image_url" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "project_section_title" text NOT NULL DEFAULT 'Le projet';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "project_section_description" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "lifestyle_title" text DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "lifestyle_description" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "location_section_title" text NOT NULL DEFAULT 'Emplacement';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "location_description" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "location_advantages" text[] DEFAULT '{}';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "map_embed_url" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "map_share_url" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "contact_title" text NOT NULL DEFAULT 'Intéressé par ce projet ?';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "contact_subtitle" text NOT NULL DEFAULT 'Notre équipe vous recontacte dans les 24 heures pour organiser une visite ou répondre à toutes vos questions.';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "meta_title" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "meta_description" text NOT NULL DEFAULT '';

UPDATE "projects"
SET
  "tagline" = coalesce("tagline", ''),
  "short_description" = coalesce("short_description", ''),
  "lifestyle_title" = coalesce("lifestyle_title", ''),
  "location_advantages" = coalesce("location_advantages", '{}'::text[]),
  "long_description" = coalesce(nullif("long_description", ''), "description", ''),
  "address_text" = coalesce(nullif("address_text", ''), "location", ''),
  "hero_title" = coalesce(nullif("hero_title", ''), "title", ''),
  "hero_subtitle" = coalesce(nullif("hero_subtitle", ''), nullif("tagline", ''), nullif("short_description", ''), "description", ''),
  "hero_location_text" = coalesce(nullif("hero_location_text", ''), "location", "city", ''),
  "project_section_title" = coalesce(nullif("project_section_title", ''), nullif("story_title", ''), 'Le projet'),
  "project_section_description" = coalesce(nullif("project_section_description", ''), nullif("story_text", ''), "description", ''),
  "lifestyle_description" = coalesce(nullif("lifestyle_description", ''), nullif("lifestyle_text", ''), ''),
  "location_description" = coalesce(nullif("location_description", ''), nullif("map_location", ''), "location", ''),
  "price_note" = coalesce(nullif("price_note", ''), nullif("financing_details", ''), ''),
  "primary_cta_label" = coalesce(nullif("primary_cta_label", ''), nullif("cta_text", ''), 'Découvrir le projet'),
  "meta_title" = coalesce(nullif("meta_title", ''), nullif("seo_title", ''), ''),
  "meta_description" = coalesce(nullif("meta_description", ''), nullif("seo_description", ''), '');

UPDATE "projects"
SET "slug" = 'les-jardins-de-la-coupole'
WHERE "id" = 3
  AND "slug" = ''
  AND NOT EXISTS (
    SELECT 1
    FROM "projects" existing_project
    WHERE existing_project."slug" = 'les-jardins-de-la-coupole'
  );

ALTER TABLE "projects" ALTER COLUMN "tagline" SET DEFAULT '';
ALTER TABLE "projects" ALTER COLUMN "tagline" SET NOT NULL;
ALTER TABLE "projects" ALTER COLUMN "short_description" SET DEFAULT '';
ALTER TABLE "projects" ALTER COLUMN "short_description" SET NOT NULL;
ALTER TABLE "projects" ALTER COLUMN "lifestyle_title" SET DEFAULT '';
ALTER TABLE "projects" ALTER COLUMN "lifestyle_title" SET NOT NULL;
ALTER TABLE "projects" ALTER COLUMN "location_advantages" SET DEFAULT '{}'::text[];
ALTER TABLE "projects" ALTER COLUMN "location_advantages" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "projects_brand_id_idx" ON "projects" ("brand_id");
CREATE INDEX IF NOT EXISTS "projects_status_idx" ON "projects" ("status");
CREATE INDEX IF NOT EXISTS "projects_city_idx" ON "projects" ("city");
CREATE INDEX IF NOT EXISTS "projects_featured_idx" ON "projects" ("featured");
CREATE INDEX IF NOT EXISTS "projects_updated_at_idx" ON "projects" ("updated_at" DESC);

COMMIT;

ANALYZE "projects";
ANALYZE "brands";
