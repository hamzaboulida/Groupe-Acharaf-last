ALTER TABLE "applications"
  ALTER COLUMN "career_id" DROP NOT NULL,
  ALTER COLUMN "career_id" DROP DEFAULT;

ALTER TABLE "applications"
  ADD COLUMN IF NOT EXISTS "application_type" text NOT NULL DEFAULT 'job',
  ADD COLUMN IF NOT EXISTS "desired_position" text NOT NULL DEFAULT '';

UPDATE "applications"
SET
  "application_type" = CASE
    WHEN "career_id" IS NULL THEN 'spontaneous'
    ELSE 'job'
  END,
  "desired_position" = coalesce("desired_position", '');

ALTER TABLE "applications"
  DROP CONSTRAINT IF EXISTS "applications_application_type_check";

ALTER TABLE "applications"
  ADD CONSTRAINT "applications_application_type_check"
  CHECK ("application_type" IN ('job', 'spontaneous'));
