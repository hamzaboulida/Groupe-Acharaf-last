import { useEffect } from "react";

type PageSeoOptions = {
  title: string;
  description: string;
  path: string;
  imageUrl?: string;
  noIndex?: boolean;
};

function upsertMeta(attribute: "name" | "property", key: string, value: string) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
}

function upsertCanonical(href: string) {
  let element = document.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export function usePageSeo({ title, description, path, imageUrl, noIndex = false }: PageSeoOptions) {
  useEffect(() => {
    const origin = window.location.origin;
    const canonical = `${origin}${path}`;

    document.title = title;
    upsertCanonical(canonical);
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:locale", "fr_MA");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);

    if (imageUrl) {
      const ogImage = imageUrl.startsWith("http") ? imageUrl : `${origin}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
      upsertMeta("property", "og:image", ogImage);
      upsertMeta("name", "twitter:image", ogImage);
    }
  }, [description, imageUrl, noIndex, path, title]);
}
