import React, { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useParams, Link, useLocation } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useGetProject, useCreateLead, useListProjects } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import {
  projectPriceLabel,
  projectPriceRangeLabel,
  shouldShowProjectPrice,
  statusBadgeClass,
  statusLabel,
} from "@/lib/project-display";
import {
  MapPin, Ruler, Calendar, ChevronDown, ArrowRight,
  Check, X, ZoomIn, ChevronLeft, ChevronRight, ExternalLink, Loader2, Building2,
} from "lucide-react";

import project1 from "@/assets/project-1.png";
import project2 from "@/assets/project-2.png";
import project3 from "@/assets/project-3.png";
import { projectMatchesSlug, projectPath, slugifyProjectTitle } from "@/lib/project-routing";
import { SITE_NAME, SITE_URL, breadcrumbSchema, useStructuredData } from "@/lib/structured-data";

const FB = [project1, project2, project3];
const EC = [0.22, 1, 0.36, 1] as const;

/* ── Helpers ────────────────────────────────────────────────── */
function clean(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  if (!content) return;
  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function segmentLabel(type: string | null | undefined, segment: string | null | undefined) {
  if (clean(type)) return clean(type);
  if (segment === "luxury") return "Villa / Résidence de luxe";
  return "Résidence premium";
}

function normalizeMapEmbedUrl(value: string | null | undefined): string {
  const raw = clean(value);
  if (!raw) return "";
  const iframeSrc = raw.match(/src=["']([^"']+)["']/i)?.[1] ?? raw;
  const decodedSrc = iframeSrc.replace(/&amp;/g, "&").trim();

  try {
    const url = new URL(decodedSrc);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    const isGoogleMaps =
      (hostname === "google.com" && url.pathname.startsWith("/maps")) ||
      hostname === "maps.google.com" ||
      hostname.endsWith(".googleusercontent.com") ||
      hostname === "googleusercontent.com";

    return (url.protocol === "https:" || url.protocol === "http:") && isGoogleMaps ? url.toString() : "";
  } catch {
    return "";
  }
}

function normalizeVirtualTourUrl(value: string | null | undefined): string {
  const raw = clean(value);
  if (!raw) return "";

  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

import {
  Home,
  TreePine,
  Leaf,
  Car,
  ParkingCircle,
  Shield,
  Lock,
  Camera,
  Waves,
  ArrowUpDown,
  Accessibility,
  Phone,
  Wifi,
  Droplet,
  Sun,
  ShoppingBag,
  School,
  Hospital,
  Flower2,
  Key,
  Star,
  Wind,
  Layers
} from "lucide-react";

const amenityIconMap: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  check: Check,
  home: Home,
  building: Building2,
  tree: TreePine,
  leaf: Leaf,
  car: Car,
  parking: ParkingCircle,
  shield: Shield,
  lock: Lock,
  camera: Camera,
  pool: Waves,
  elevator: ArrowUpDown,
  accessibility: Accessibility,
  phone: Phone,
  wifi: Wifi,
  water: Droplet,
  sun: Sun,
  shopping: ShoppingBag,
  school: School,
  hospital: Hospital,
  location: MapPin,
  garden: Flower2,
  key: Key,
  star: Star,
  wind: Wind,
  terrace: Layers,
};

function parseAmenity(val: string): { text: string; icon: string } {
  try {
    const trimmed = val.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed.text === "string") {
        return { text: parsed.text, icon: parsed.icon || "check" };
      }
    }
  } catch (e) {}
  return { text: val, icon: "check" };
}

function AmenityIcon({ label }: { label: string }) {
  const parsed = parseAmenity(label);
  const IconComponent = amenityIconMap[parsed.icon] || Check;
  return <IconComponent size={16} strokeWidth={1.4} />;
}

/* ── Lightbox ───────────────────────────────────────────────── */
function Lightbox({
  images, index, onClose, onPrev, onNext,
}: {
  images: string[]; index: number;
  onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setScrollY(window.scrollY);
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", fn);
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-x-0 bg-[#082634]/96 backdrop-blur-lg z-50 flex items-center justify-center"
      style={{ top: `${scrollY}px`, height: "100vh" }}
      onClick={onClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all"
      >
        <ChevronLeft size={20} />
      </button>
      <motion.img
        key={index}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: EC }}
        src={images[index]}
        alt=""
        className="max-w-[90vw] max-h-[85vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all"
      >
        <ChevronRight size={20} />
      </button>
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all"
      >
        <X size={16} />
      </button>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/25 text-xs tracking-[0.2em] uppercase">
        {index + 1} / {images.length}
      </div>
    </motion.div>
  );
}

/* ── Lead Form Section ──────────────────────────────────────── */
type LeadData = { firstName: string; lastName: string; email: string; phone: string; message: string };

function LeadSection({
  projectId,
  projectTitle,
  title,
  subtitle,
  ctaLabel,
}: {
  projectId: number;
  projectTitle: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
}) {
  const createLead = useCreateLead();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LeadData>();
  const [sent, setSent] = useState(false);

  async function onSubmit(data: LeadData) {
    await createLead.mutateAsync({
      data: {
        ...data,
        subject: "Prise de rendez-vous",
        projectInterest: projectTitle,
        source: `project:${projectId}`,
      },
    });
    setSent(true);
    reset();
  }

  const base = "w-full bg-white border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:outline-none focus:border-[#8EA4AF] transition-colors placeholder:text-[#8EA4AF] font-light";

  return (
    <section id="contact" className="py-28 bg-white relative overflow-hidden border-t border-[#DCE0E7]">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <p className="text-[#8EA4AF] text-xs tracking-[0.22em] uppercase mb-4">Contact direct</p>
          <h2 className="text-4xl md:text-5xl font-serif font-light text-[#082634] mb-5 leading-tight">
            {title}
          </h2>
          <p className="text-[#082634] font-light text-sm leading-relaxed max-w-sm mx-auto">
            {subtitle}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input placeholder="Prénom *" {...register("firstName", { required: true })} className={base} />
                {errors.firstName && <span className="ga-error mt-1.5 block">Requis</span>}
              </div>
              <div>
                <input placeholder="Nom *" {...register("lastName", { required: true })} className={base} />
                {errors.lastName && <span className="ga-error mt-1.5 block">Requis</span>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input type="email" placeholder="Email *" {...register("email", { required: true })} className={base} />
                {errors.email && <span className="ga-error mt-1.5 block">Requis</span>}
              </div>
              <input placeholder="Téléphone" {...register("phone")} className={base} />
            </div>
            <textarea rows={4} placeholder="Votre message (optionnel)" {...register("message")} className={`${base} resize-none`} />

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={createLead.isPending}
                className="w-full max-w-sm flex items-center justify-center gap-3 bg-[#082634] text-white px-10 py-4 text-xs font-medium tracking-[0.15em] uppercase hover:bg-[#082634] transition-colors disabled:opacity-50"
              >
                {createLead.isPending ? "Envoi…" : ctaLabel}
                {!createLead.isPending && <ArrowRight size={13} />}
              </button>
            </div>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EC }}
            className="text-center py-16"
          >
            <div className="w-14 h-14 border border-[#082634]/20 flex items-center justify-center mx-auto mb-7">
              <Check size={20} className="text-[#082634]" />
            </div>
            <h3 className="text-[#082634] font-serif text-3xl mb-3 font-light">Demande envoyée</h3>
            <p className="text-[#082634] font-light text-sm leading-relaxed">
              Notre équipe vous contactera dans les plus brefs délais.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function VirtualTourSection({ url }: { url: string }) {
  const [shouldMountIframe, setShouldMountIframe] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = mountRef.current;
    if (!node || shouldMountIframe) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldMountIframe(true);
          observer.disconnect();
        }
      },
      { rootMargin: "220px 0px" },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, [shouldMountIframe]);

  useEffect(() => {
    if (!shouldMountIframe || loaded || failed) return;
    const timeout = window.setTimeout(() => {
      setFailed(true);
    }, 15000);
    return () => window.clearTimeout(timeout);
  }, [failed, loaded, shouldMountIframe]);

  return (
    <section className="py-28 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EC }}
          className="mb-10"
        >
          <p className="text-[#8EA4AF] text-xs tracking-[0.22em] uppercase mb-4">Expérience immersive</p>
          <h2 className="text-3xl md:text-4xl font-serif font-light text-[#082634] mb-4">Visite virtuelle</h2>
          <p className="text-[#082634] font-light text-sm leading-relaxed max-w-3xl">
            Découvrez le projet à travers une expérience immersive à 360° et explorez chaque espace comme si vous y étiez.
          </p>
        </motion.div>

        <div
          ref={mountRef}
          className="relative w-full overflow-hidden rounded-2xl shadow-[0_14px_50px_rgba(8,38,52,0.14)] bg-[#DCE0E7]/40 h-[500px] md:h-[650px] lg:h-[800px]"
        >
          {!shouldMountIframe && (
            <div className="absolute inset-0 flex items-center justify-center text-center px-8">
              <div className="flex flex-col items-center gap-3 text-[#082634]/75">
                <Loader2 size={24} className="animate-spin" />
                <p className="text-sm tracking-[0.08em] uppercase">Chargement de la visite virtuelle...</p>
              </div>
            </div>
          )}

          {shouldMountIframe && !failed && (
            <>
              {!loaded && (
                <div className="absolute inset-0 z-[1] flex items-center justify-center text-center px-8 bg-white/70 backdrop-blur-[1px]">
                  <div className="flex flex-col items-center gap-3 text-[#082634]/75">
                    <Loader2 size={24} className="animate-spin" />
                    <p className="text-sm tracking-[0.08em] uppercase">Chargement de la visite virtuelle...</p>
                  </div>
                </div>
              )}
              <iframe
                src={url}
                title="Visite virtuelle du projet"
                loading="lazy"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
                onLoad={() => setLoaded(true)}
                onError={() => setFailed(true)}
              />
            </>
          )}

          {failed && (
            <div className="absolute inset-0 flex items-center justify-center text-center px-8">
              <div>
                <p className="text-[#082634] text-base font-light mb-5">Impossible de charger la visite virtuelle.</p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#082634] text-white px-6 py-3 text-xs tracking-[0.15em] uppercase hover:bg-[#8EA4AF] hover:text-[#082634] transition-colors"
                >
                  Voir la visite virtuelle <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main page
═══════════════════════════════════════════════════════════ */
export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const projectKey = slugifyProjectTitle(id);
  const isNumericKey = /^\d+$/.test(projectKey);
  const numericId = isNumericKey ? Number(projectKey) : null;

  const { data: projects = [], isLoading: isProjectsLoading } = useListProjects();
  const projectFromSlug = !isNumericKey
    ? projects.find((p) => projectMatchesSlug(p, projectKey))
    : undefined;
  const resolvedProjectId = numericId ?? projectFromSlug?.id ?? 0;

  const {
    data: project,
    isLoading: isProjectLoading,
    isError,
  } = useGetProject(resolvedProjectId, {
    query: {
      enabled: resolvedProjectId > 0,
    } as any,
  });

  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImgY = useTransform(heroScroll, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);

  const projectImages = project?.images?.filter(Boolean) ?? [];
  const cover = clean(project?.coverImageUrl) || FB[resolvedProjectId % 3];
  const gallery = projectImages.length ? projectImages : [FB[0], FB[1], FB[2]];

  useStructuredData(
    "ga-breadcrumb-project",
    project
      ? breadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Nos Projets", path: "/nos-projets" },
          { name: project.title, path: projectPath(project) },
        ])
      : null,
  );

  useStructuredData(
    "ga-project-schema",
    project
      ? {
          "@context": "https://schema.org",
          "@type": "Residence",
          name: project.title,
          url: `${SITE_URL}${projectPath(project)}`,
          description: clean(project.metaDescription) || clean(project.shortDescription) || clean(project.description),
          image: clean(project.ogImageUrl) || clean(project.coverImageUrl),
          address: {
            "@type": "PostalAddress",
            addressLocality: project.city || project.location || "",
            addressCountry: "MA",
            streetAddress: clean(project.addressText),
          },
          brand: {
            "@type": "Brand",
            name: project.brand?.name || SITE_NAME,
          },
          offers: {
            "@type": "Offer",
            priceCurrency: "MAD",
            availability: project.status === "completed" ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
            price: shouldShowProjectPrice(project) ? project.priceMin ?? undefined : undefined,
          },
        }
      : null,
  );

  useEffect(() => {
    if (!project) return;
    const canonicalPath = projectPath(project);
    if (window.location.pathname !== canonicalPath) {
      navigate(canonicalPath, { replace: true });
    }
  }, [navigate, project]);

  /* SEO */
  useEffect(() => {
    if (project) {
      document.title =
        clean(project.metaTitle) ||
        `${project.title} | Immobilier à ${project.city ?? project.location} | Groupe Acharaf`;
      const seoDescription =
        clean(project.metaDescription) ||
        clean(project.shortDescription) ||
        clean(project.description) ||
        clean(project.longDescription);
      const ogImage = clean(project.ogImageUrl) || cover;

      upsertMeta("name", "description", seoDescription);
      upsertMeta("property", "og:title", document.title);
      upsertMeta("property", "og:description", seoDescription);
      upsertMeta("property", "og:image", ogImage);
      upsertMeta("property", "og:url", `${window.location.origin}${projectPath(project)}`);

      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", `${window.location.origin}${projectPath(project)}`);
    }
  }, [cover, project]);

  /* Loading state */
  if (isProjectLoading || (!isNumericKey && isProjectsLoading)) {
    return (
      <Layout>
        <div className="h-screen bg-white flex items-center justify-center">
          <div className="text-[#8EA4AF] text-xs tracking-[0.22em] uppercase font-light animate-pulse">
            Chargement…
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !project) {
    return (
      <Layout>
        <div className="h-screen bg-white flex items-center justify-center px-6 text-center">
          <div>
            <p className="text-[#8EA4AF] text-xs tracking-[0.22em] uppercase mb-4">Projet introuvable</p>
            <h1 className="text-4xl font-serif font-light text-[#082634] mb-6">
              Ce projet n'existe pas ou a été retiré.
            </h1>
            <Link href="/nos-projets" className="text-[#082634] text-xs tracking-[0.15em] uppercase hover:text-[#082634]">
              Retour aux projets
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const priceLabel = projectPriceLabel(project);
  const priceRangeLabel = projectPriceRangeLabel(project);
  const priceVisible = shouldShowProjectPrice(project);
  const pricingLabel = priceVisible ? clean(project.priceLabel) || "Prix de départ" : "Prix";
  const availabilityNote = clean(project.availabilityNote);

  const surfaceLabel = (project.surfaceMin && project.surfaceMax)
    ? `${project.surfaceMin} – ${project.surfaceMax} m²`
    : project.surfaceMin
    ? `Dès ${project.surfaceMin} m²`
    : null;
  const heroTitle = clean(project.heroTitle) || project.title;
  const heroSubtitle = clean(project.heroSubtitle) || clean(project.tagline) || clean(project.shortDescription) || clean(project.brand?.tagline);
  const heroLocation = clean(project.heroLocationText) || clean(project.addressText) || [project.location, project.city].filter(Boolean).join(", ");
  const primaryCtaLabel = clean(project.primaryCtaLabel) || "Découvrir le projet";
  const secondaryCtaLabel = clean(project.secondaryCtaLabel) || "Prendre rendez-vous";
  const projectSectionTitle = clean(project.projectSectionTitle) || clean(project.tagline) || project.title;
  const projectDescription =
    clean(project.projectSectionDescription) ||
    clean(project.longDescription) ||
    clean(project.description) ||
    clean(project.shortDescription);
  const introImage = clean(project.secondaryImageUrl) || gallery[1] || cover;
  const lifestyleImage = clean(project.lifestyleImageUrl) || gallery[2] || gallery[0] || cover;
  const galleryTitle = clean(project.galleryTitle) || "Visuels du projet";
  const featuresTitle = clean(project.featuresTitle) || "Points forts du projet";
  const lifestyleTitle = clean(project.lifestyleTitle) || clean(project.tagline) || clean(project.brand?.tagline) || "Art de vivre";
  const lifestyleDescription =
    clean(project.lifestyleDescription) ||
    clean(project.brand?.description) ||
    clean(project.longDescription) ||
    clean(project.description);
  const locationSectionTitle = clean(project.locationSectionTitle) || "Emplacement";
  const locationDescription = clean(project.locationDescription);
  const locationAdvantages = project.locationAdvantages?.filter(Boolean) ?? [];
  const addressText = clean(project.addressText) || [project.location, project.city].filter(Boolean).join(", ");
  const mapEmbedUrl = normalizeMapEmbedUrl(project.mapIframeCode) || normalizeMapEmbedUrl(project.mapEmbedUrl);
  const virtualTourUrl = normalizeVirtualTourUrl(project.virtualTourUrl);
  const contactTitle = clean(project.contactTitle) || "Intéressé par ce projet ?";
  const contactSubtitle =
    clean(project.contactSubtitle) ||
    "Notre équipe vous recontacte dans les 24 heures pour organiser une visite ou répondre à toutes vos questions.";

  return (
    <Layout>
      {/* ════════════════════════════════════════════════════
          1 · HERO — Fullscreen
      ════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen min-h-[680px] w-full overflow-hidden flex items-end pb-24">
        {/* Parallax image */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: EC }}
          style={{ y: heroImgY }}
        >
          <img src={cover} alt={project.title} className="w-full h-full object-cover" />
        </motion.div>

        {/* Overlays — stronger around content, still breathable over the image */}
        <div className="absolute inset-0 bg-[#082634]/12 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#082634]/82 via-[#082634]/24 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#082634]/72 via-[#082634]/28 to-transparent z-[1]" />
        <div className="absolute bottom-0 left-0 z-[1] h-[62%] w-full md:w-[76%] bg-[radial-gradient(ellipse_at_bottom_left,rgba(8,38,52,0.88)_0%,rgba(8,38,52,0.56)_42%,transparent_74%)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#082634]/45 to-transparent z-[1]" />

        {/* Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 container mx-auto px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.3, ease: EC }}
          >
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-7">
              {project.brand?.name && (
                <span className="px-4 py-1.5 bg-[#8EA4AF] text-[#082634] text-xs font-medium tracking-[0.15em] uppercase">
                  {project.brand.name}
                </span>
              )}
              {project.status && (
                <span className={`px-4 py-1.5 border text-xs tracking-[0.15em] uppercase ${statusBadgeClass(project.status)}`}>
                  {statusLabel(project.status)}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="max-w-5xl text-5xl md:text-7xl lg:text-8xl font-serif font-light text-white mb-5 leading-none tracking-tight drop-shadow-[0_3px_22px_rgba(8,38,52,0.42)]">
              {heroTitle}
            </h1>

            {heroSubtitle && (
              <p className="text-white/88 font-light text-base md:text-xl mb-4 max-w-2xl leading-relaxed font-serif drop-shadow-[0_2px_14px_rgba(8,38,52,0.44)]">
                {heroSubtitle}
              </p>
            )}

            {/* Location */}
            {heroLocation && (
              <p className="text-white/82 font-light flex items-center gap-2 text-sm mb-10 drop-shadow-[0_2px_12px_rgba(8,38,52,0.45)]">
                <MapPin size={13} className="text-[#8EA4AF]" />
                {heroLocation}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={() => {
                  const el = document.getElementById("gallery");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-outline-light group"
              >
                {primaryCtaLabel}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-white/85 hover:text-white transition-colors duration-300 px-4 py-3 sm:ml-3"
              >
                <span className="relative">
                  {secondaryCtaLabel}
                  <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-px bg-white/40 transition-all duration-300 ease-out" />
                </span>
                <ArrowRight size={11} className="opacity-50 group-hover:opacity-90 group-hover:translate-x-1 transition-all duration-300" />
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <span className="text-white/20 text-[10px] tracking-[0.25em] uppercase">Défiler</span>
          <motion.div
            animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <ChevronDown size={16} className="text-white/20" />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════
          2 · KEY INFO BAR
      ════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-[#DCE0E7]">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EC }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 divide-y md:divide-y-0 divide-x-0 md:divide-x divide-[#DCE0E7]"
          >
            {/* Location */}
            <div className="flex items-start gap-4 px-6 lg:px-8 py-7">
              <MapPin size={16} className="text-[#8EA4AF] mt-0.5 shrink-0" strokeWidth={1.4} />
              <div className="min-w-0">
                <p className="text-[#8EA4AF] text-[10px] tracking-[0.18em] uppercase mb-1.5">Localisation</p>
                <p className="text-[#082634] font-light text-sm leading-snug">{project.city || project.location || "—"}</p>
              </div>
            </div>

            {/* Type */}
            <div className="flex items-start gap-4 px-6 lg:px-8 py-7">
              <Building2 size={16} className="text-[#8EA4AF] mt-0.5 shrink-0" strokeWidth={1.4} />
              <div className="min-w-0">
                <p className="text-[#8EA4AF] text-[10px] tracking-[0.18em] uppercase mb-1.5">Type</p>
                <p className="text-[#082634] font-light text-sm leading-snug">{segmentLabel(project.projectType, project.brand?.segment)}</p>
              </div>
            </div>

            {/* Statut */}
            <div className="flex items-start gap-4 px-6 lg:px-8 py-7">
              <Calendar size={16} className="text-[#8EA4AF] mt-0.5 shrink-0" strokeWidth={1.4} />
              <div className="min-w-0">
                <p className="text-[#8EA4AF] text-[10px] tracking-[0.18em] uppercase mb-1.5">Statut</p>
                <p className="text-[#082634] font-light text-sm leading-snug">
                  {statusLabel(project.status)}
                  {project.deliveryDate && (
                    <span className="block text-[#8EA4AF] text-xs mt-0.5">{project.deliveryDate}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Surface */}
            <div className="flex items-start gap-4 px-6 lg:px-8 py-7">
              <Ruler size={16} className="text-[#8EA4AF] mt-0.5 shrink-0" strokeWidth={1.4} />
              <div className="min-w-0">
                <p className="text-[#8EA4AF] text-[10px] tracking-[0.18em] uppercase mb-1.5">Surfaces</p>
                <p className="text-[#082634] font-light text-sm leading-snug">{surfaceLabel ?? "Sur demande"}</p>
              </div>
            </div>

            {/* PRICE — dominant */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1 flex items-center gap-5 px-6 lg:px-8 py-7 bg-[#DCE0E7]/50">
              <div className="min-w-0 flex-1">
                <p className="text-[#8EA4AF] text-[10px] tracking-[0.2em] uppercase mb-2">{pricingLabel}</p>
                <p className="text-[#082634] font-serif text-2xl lg:text-3xl font-semibold leading-none tracking-tight">
                  {priceLabel}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          3 · PROJECT INTRODUCTION
      ════════════════════════════════════════════════════ */}
      {projectDescription && (
        <section className="py-28 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: EC }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center"
            >
              {/* Text */}
              <div>
                {/* <p className="text-[#8EA4AF] text-xs tracking-[0.22em] uppercase mb-6">Le projet</p> */}
                <h2 className="text-3xl md:text-4xl font-serif font-light text-[#082634] mb-8 leading-tight">
                  {projectSectionTitle}
                </h2>
                <p className="text-[#082634] font-light leading-[1.9] text-base mb-8">
                  {projectDescription}
                </p>
                {/* Micro-stats */}
                <div className="flex gap-8 pt-6 border-t border-[#DCE0E7]">
                  {project.city && (
                    <div>
                      <p className="text-[#8EA4AF] text-[10px] tracking-[0.18em] uppercase mb-1">Ville</p>
                      <p className="text-[#082634] font-light text-sm">{project.city}</p>
                    </div>
                  )}
                  {project.deliveryDate && (
                    <div>
                      <p className="text-[#8EA4AF] text-[10px] tracking-[0.18em] uppercase mb-1">Livraison</p>
                      <p className="text-[#082634] font-light text-sm">{project.deliveryDate}</p>
                    </div>
                  )}
                  {project.brand?.name && (
                    <div>
                      <p className="text-[#8EA4AF] text-[10px] tracking-[0.18em] uppercase mb-1">Marque</p>
                      <p className="text-[#082634] font-light text-sm">{project.brand.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Image */}
              <div className="relative overflow-hidden aspect-[4/3] bg-[#DCE0E7]/40 shadow-[0_10px_30px_rgba(8,38,52,0.05)]">
                <motion.img
                  src={introImage}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.05 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, ease: EC }}
                />
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════
          4 · VISUAL GALLERY
      ════════════════════════════════════════════════════ */}
      <section id="gallery" className="pb-28 bg-[#FFFFFF] pt-28">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EC }}
            className="mb-12"
          >
            <p className="text-[#8EA4AF] text-xs tracking-[0.22em] uppercase mb-4">Galerie</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-[#082634]">{galleryTitle}</h2>
          </motion.div>

          {/* Main image */}
          <div
            className="relative overflow-hidden aspect-video mb-3 cursor-zoom-in group bg-[#DCE0E7]/50 shadow-[0_10px_30px_rgba(8,38,52,0.06)]"
            onClick={() => setLightbox(activeImage)}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={gallery[activeImage] ?? cover}
                alt=""
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-transparent group-hover:bg-[#082634]/8 transition-colors duration-500" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 border border-[#082634]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm bg-white/75">
              <ZoomIn size={20} className="text-[#082634]" />
            </div>
            {gallery.length > 1 && (
              <div className="absolute bottom-5 right-5 px-3 py-1.5 bg-white/85 backdrop-blur-sm text-[#8EA4AF] text-xs tracking-[0.15em] uppercase border border-[#DCE0E7]">
                {activeImage + 1} / {gallery.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative overflow-hidden shrink-0 w-24 h-16 md:w-32 md:h-20 transition-all duration-300 ${
                    activeImage === i
                      ? "ring-2 ring-[#082634] opacity-100"
                      : "opacity-45 hover:opacity-70"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {virtualTourUrl && <VirtualTourSection url={virtualTourUrl} />}

      {/* ════════════════════════════════════════════════════
          5 · KEY FEATURES / AMENITIES
      ════════════════════════════════════════════════════ */}
      {project.amenities && project.amenities.length > 0 && (
        <section className="py-28 bg-[#DCE0E7]">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EC }}
              className="mb-14"
            >
              <p className="text-[#082634] text-xs tracking-[0.22em] uppercase mb-4">Prestations</p>
              <h2 className="text-3xl md:text-4xl font-serif font-light text-[#082634]">{featuresTitle}</h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {project.amenities.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.7, ease: EC }}
                  className="bg-white px-7 py-6 shadow-[0_4px_20px_rgba(8,38,52,0.04)] hover:shadow-[0_8px_32px_rgba(8,38,52,0.08)] hover:-translate-y-0.5 transition-all duration-500 group"
                >
                  <div className="w-10 h-10 border border-[#8EA4AF]/30 flex items-center justify-center text-[#8EA4AF] group-hover:border-[#8EA4AF]/60 transition-all duration-500 mb-5">
                    <AmenityIcon label={item} />
                  </div>
                  <p className="text-[#082634] font-light text-sm leading-snug group-hover:text-[#082634] transition-colors duration-300">
                    {parseAmenity(item).text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════
          6 · LIFESTYLE SECTION — Emotional
      ════════════════════════════════════════════════════ */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden flex items-center">
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.06 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: EC }}
        >
          <img
            src={lifestyleImage}
            alt=""
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#082634]/80 via-[#082634]/50 to-[#082634]/10 z-[1]" />
        <div className="absolute inset-0 bg-[#082634]/15 z-[1]" />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: EC }}
          className="relative z-10 container mx-auto px-6 max-w-2xl"
        >
          <p className="text-[#8EA4AF] text-xs tracking-[0.25em] uppercase mb-6 opacity-80">Art de vivre</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white leading-tight mb-6">
            {lifestyleTitle}
          </h2>
          {lifestyleDescription && (
            <p className="text-white/70 font-light leading-[1.9] text-base mb-10 max-w-lg">
              {lifestyleDescription}
            </p>
          )}
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/60 hover:text-white/90 transition-colors duration-300 border-b border-white/15 hover:border-white/35 pb-1"
          >
            {secondaryCtaLabel}
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════
          7 · LOCATION
      ════════════════════════════════════════════════════ */}
      {(project.location || project.city || addressText || mapEmbedUrl) && (
        <section className="py-28 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EC }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
            >
              {/* Text */}
              <div>
                <p className="text-[#8EA4AF] text-xs tracking-[0.22em] uppercase mb-6">Emplacement</p>
                <h2 className="text-3xl md:text-4xl font-serif font-light text-[#082634] mb-6 leading-tight">
                  {locationSectionTitle}
                </h2>
                {addressText && (
                  <p className="text-[#082634] font-serif text-xl font-light mb-4">
                    {addressText}
                  </p>
                )}
                {locationDescription && (
                  <p className="text-[#082634] font-light leading-[1.9] text-sm mb-10">
                    {locationDescription}
                  </p>
                )}
                {locationAdvantages.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {locationAdvantages.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-[#8EA4AF] rounded-full shrink-0" />
                      <span className="text-[#082634] font-light text-sm">{item}</span>
                    </div>
                  ))}
                  </div>
                )}
                {clean(project.mapShareUrl) && (
                  <a
                    href={clean(project.mapShareUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-10 text-[#082634] text-xs tracking-[0.16em] uppercase border-b border-[#8EA4AF]/35 pb-1 hover:text-[#8EA4AF] transition-colors"
                  >
                    Voir sur Google Maps <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="relative overflow-hidden aspect-[4/3] bg-[#DCE0E7]/50 border border-[#DCE0E7] shadow-[0_10px_30px_rgba(8,38,52,0.04)]">
                {mapEmbedUrl ? (
                  <iframe
                    src={mapEmbedUrl}
                    title={`Carte - ${project.title}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 w-full h-full grayscale-[0.2]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-center px-8">
                    <div>
                      <MapPin size={28} className="text-[#8EA4AF] mx-auto mb-4" strokeWidth={1.2} />
                      <p className="text-[#8EA4AF] text-xs tracking-[0.18em] uppercase">
                        {addressText || project.city || project.location}
                      </p>
                      <p className="text-[#8EA4AF] text-[10px] tracking-[0.15em] uppercase mt-2">Carte bientôt disponible</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════
          8 · PRICE CTA BLOCK — Conversion trigger
      ════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#082634]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EC }}
          className="container mx-auto px-6 text-center"
        >
          <p className="text-[#8EA4AF] text-xs tracking-[0.22em] uppercase mb-5">Tarification</p>
          <p className="text-white/60 text-sm font-light uppercase tracking-[0.18em] mb-3">
            {pricingLabel}
          </p>
          <p className="text-5xl md:text-7xl font-serif font-light text-white tracking-tight mb-4">
            {priceLabel}
          </p>
          {priceRangeLabel && (
            <p className="text-white/50 font-light text-sm mb-8 tracking-wider">
              {priceRangeLabel}
            </p>
          )}
          {project.priceNote && (
            <p className="text-white/55 text-xs font-light max-w-xs mx-auto leading-relaxed mb-10">
              {project.priceNote}
            </p>
          )}
          {availabilityNote && (
            <p className="text-white/45 text-xs font-light max-w-xs mx-auto leading-relaxed mb-10">
              {availabilityNote}
            </p>
          )}
          <div className="flex justify-center">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-3 bg-white text-[#082634] px-12 py-4 text-xs font-medium tracking-[0.15em] uppercase hover:bg-[#DCE0E7] transition-colors"
            >
              {secondaryCtaLabel} <ArrowRight size={13} />
            </a>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════
          9 · LEAD FORM
      ════════════════════════════════════════════════════ */}
      <LeadSection
        projectId={project.id}
        projectTitle={project.title}
        title={contactTitle}
        subtitle={contactSubtitle}
        ctaLabel={secondaryCtaLabel}
      />

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <Lightbox
            images={gallery}
            index={lightbox}
            onClose={() => setLightbox(null)}
            onPrev={() => setLightbox((l) => (l! - 1 + gallery.length) % gallery.length)}
            onNext={() => setLightbox((l) => (l! + 1) % gallery.length)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
