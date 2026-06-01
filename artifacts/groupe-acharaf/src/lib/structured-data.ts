import { useEffect } from "react";

export const SITE_URL = "https://groupeacharaf.ma";
export const SITE_NAME = "Groupe Acharaf";

function upsertJsonLd(id: string, payload: Record<string, unknown> | Array<Record<string, unknown>>) {
  const serialized = JSON.stringify(payload);
  let node = document.getElementById(id) as HTMLScriptElement | null;
  if (!node) {
    node = document.createElement("script");
    node.id = id;
    node.type = "application/ld+json";
    document.head.appendChild(node);
  }
  node.textContent = serialized;
}

export function useStructuredData(
  id: string,
  payload: Record<string, unknown> | Array<Record<string, unknown>> | null,
) {
  useEffect(() => {
    if (!payload) return;
    upsertJsonLd(id, payload);
  }, [id, payload]);
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

