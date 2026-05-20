ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "is_opportunity" boolean NOT NULL DEFAULT false;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "opportunity_type" text NOT NULL DEFAULT 'promotion';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "opportunity_title" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "opportunity_description" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "opportunity_highlight" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "opportunity_valid_until" text NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "opportunity_cta_label" text NOT NULL DEFAULT 'Découvrir l’opportunité';

UPDATE "projects"
SET
  "opportunity_type" = coalesce(nullif("opportunity_type", ''), 'promotion'),
  "opportunity_title" = coalesce("opportunity_title", ''),
  "opportunity_description" = coalesce("opportunity_description", ''),
  "opportunity_highlight" = coalesce("opportunity_highlight", ''),
  "opportunity_valid_until" = coalesce("opportunity_valid_until", ''),
  "opportunity_cta_label" = coalesce(nullif("opportunity_cta_label", ''), 'Découvrir l’opportunité');
