CREATE TABLE IF NOT EXISTS "homepage_hero_settings" (
  "id" serial PRIMARY KEY,
  "media_type" text NOT NULL DEFAULT 'slideshow',
  "images" text[] NOT NULL DEFAULT '{}',
  "video_url" text NOT NULL DEFAULT '',
  "fallback_image_url" text NOT NULL DEFAULT '',
  "updated_at" timestamp NOT NULL DEFAULT now()
);

INSERT INTO "homepage_hero_settings" ("id")
SELECT 1
WHERE NOT EXISTS (
  SELECT 1 FROM "homepage_hero_settings" WHERE "id" = 1
);
