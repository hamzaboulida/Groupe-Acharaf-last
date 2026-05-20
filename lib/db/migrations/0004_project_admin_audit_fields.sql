ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "price_label" text NOT NULL DEFAULT 'Prix de départ';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "availability_note" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "gallery_title" text NOT NULL DEFAULT 'Visuels du projet';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "features_title" text NOT NULL DEFAULT 'Points forts du projet';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "og_image_url" text NOT NULL DEFAULT '';

UPDATE "projects"
SET
  "price_label" = coalesce(nullif("price_label", ''), 'Prix de départ'),
  "gallery_title" = coalesce(nullif("gallery_title", ''), 'Visuels du projet'),
  "features_title" = coalesce(nullif("features_title", ''), 'Points forts du projet'),
  "og_image_url" = coalesce(nullif("og_image_url", ''), "cover_image_url", '');
