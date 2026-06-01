type ProjectLike = {
  id: number;
  title?: string | null;
  slug?: string | null;
};

export function slugifyProjectTitle(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function projectSlug(project: ProjectLike): string {
  const stored = slugifyProjectTitle(project.slug);
  if (stored) return stored;
  const generated = slugifyProjectTitle(project.title);
  if (generated) return generated;
  return "";
}

export function projectMatchesSlug(project: ProjectLike, slug: string): boolean {
  const normalizedRequested = slugifyProjectTitle(slug);
  if (!normalizedRequested) return false;
  return projectSlug(project) === normalizedRequested;
}

export function projectPath(project: ProjectLike): string {
  const slug = projectSlug(project);
  if (slug) return `/nos-projets/${slug}`;
  return `/nos-projets/${project.id}`;
}
