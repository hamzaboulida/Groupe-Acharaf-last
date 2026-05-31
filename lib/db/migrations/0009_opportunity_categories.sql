ALTER TABLE "projects"
  ALTER COLUMN "opportunity_type" SET DEFAULT 'lots_r1';

UPDATE "projects"
SET "opportunity_type" = CASE
  WHEN "opportunity_type" IN ('lots_r1', 'promotion') THEN 'lots_r1'
  WHEN "opportunity_type" IN ('lots_r2', 'reduction') THEN 'lots_r2'
  WHEN "opportunity_type" IN ('lots_r3', 'limited_offer') THEN 'lots_r3'
  WHEN "opportunity_type" IN ('creche', 'investment', 'last_units') THEN 'creche'
  ELSE 'lots_r1'
END;

ALTER TABLE "projects"
  DROP CONSTRAINT IF EXISTS "projects_opportunity_type_check";

ALTER TABLE "projects"
  ADD CONSTRAINT "projects_opportunity_type_check"
  CHECK ("opportunity_type" IN ('lots_r1', 'lots_r2', 'lots_r3', 'creche'));
