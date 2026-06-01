ALTER TABLE projects
ADD COLUMN IF NOT EXISTS virtual_tour_url text NOT NULL DEFAULT '';
