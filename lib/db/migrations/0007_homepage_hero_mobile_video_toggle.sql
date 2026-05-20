ALTER TABLE "homepage_hero_settings"
ADD COLUMN IF NOT EXISTS "enable_video_on_mobile" boolean NOT NULL DEFAULT false;

UPDATE "homepage_hero_settings"
SET "enable_video_on_mobile" = coalesce("enable_video_on_mobile", false);
