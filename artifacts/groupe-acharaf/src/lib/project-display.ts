export type ProjectDisplay = {
  status?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  showPrice?: boolean | null;
};

export function formatProjectPrice(value: number | null | undefined): string {
  if (!value) return "";
  return value.toLocaleString("fr-MA");
}

export function statusLabel(status: string | null | undefined): string {
  if (status === "ongoing") return "En cours";
  if (status === "completed") return "Livré";
  return "À venir";
}

export function statusBadgeClass(status: string | null | undefined): string {
  if (status === "ongoing") {
    return "bg-[#082634] text-white border-[#082634]";
  }
  if (status === "completed") {
    return "bg-[#8EA4AF] text-[#082634] border-[#8EA4AF]";
  }
  return "bg-[#DCE0E7] text-[#082634] border-[#DCE0E7]";
}

export function shouldShowProjectPrice(project: ProjectDisplay | null | undefined): boolean {
  return project?.showPrice !== false;
}

export function projectPriceLabel(project: ProjectDisplay | null | undefined): string {
  if (!shouldShowProjectPrice(project)) return "Prix à consulter";
  if (!project?.priceMin) return "Prix à consulter";
  return `À partir de ${formatProjectPrice(project.priceMin)} DH`;
}

export function projectPriceRangeLabel(project: ProjectDisplay | null | undefined): string | null {
  if (!shouldShowProjectPrice(project)) return null;
  if (!project?.priceMax || project.priceMax === project.priceMin) return null;
  return `Jusqu'à ${formatProjectPrice(project.priceMax)} DH`;
}
