ALTER TABLE projects
ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 9999;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS position
  FROM projects
)
UPDATE projects
SET display_order = ranked.position
FROM ranked
WHERE projects.id = ranked.id
  AND projects.display_order = 9999;
