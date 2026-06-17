import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  useListProjects,
  useListBrands,
  useListArticles,
  useListCareers,
  useListLeads,
  useListApplications,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  useCreateCareer,
  useUpdateCareer,
  useDeleteCareer,
  useDeleteLead,
  getListProjectsQueryKey,
  getListArticlesQueryKey,
  getListCareersQueryKey,
  getListLeadsQueryKey,
  getListApplicationsQueryKey,
} from "@workspace/api-client-react";
import { motion, Reorder } from "framer-motion";
import { projectPriceLabel, statusBadgeClass, statusLabel } from "@/lib/project-display";
import { ArrowDown, ArrowUp, GripVertical, Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { usePageSeo } from "@/lib/seo";

type Tab = "projects" | "leads" | "articles" | "careers" | "applications";
type OpportunityCategory = "lots_r1" | "lots_r2" | "lots_r3" | "creche";

const NAV_ITEMS: { id: Tab; label: string }[] = [
  { id: "projects", label: "Projets" },
  { id: "leads", label: "Leads" },
  { id: "articles", label: "Articles" },
  { id: "careers", label: "Offres d'emploi" },
  { id: "applications", label: "Candidatures" },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-MA", { year: "numeric", month: "short", day: "numeric" });
}

function slugFromTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function Badge({ children, color = "gold" }: { children: React.ReactNode; color?: "gold" | "blue" | "green" | "red" | "gray" }) {
  const colors = {
    gold: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    blue: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
    green: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    red: "bg-red-500/15 text-red-400 border border-red-500/20",
    gray: "bg-white/10 text-white/60 border border-white/10",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider border ${colors[color]}`}>{children}</span>
  );
}

function ConfirmButton({ onConfirm, label = "Supprimer" }: { onConfirm: () => void; label?: string }) {
  const [step, setStep] = useState(0);
  if (step === 0) {
    return (
      <button
        onClick={() => setStep(1)}
        className="text-[#8EA4AF] hover:text-white text-sm px-2 py-1 hover:bg-white/5 transition-colors"
      >
        {label}
      </button>
    );
  }
  return (
    <span className="flex gap-2">
      <button
        onClick={() => { onConfirm(); setStep(0); }}
        className="text-[#8EA4AF] text-sm font-semibold"
      >
        Confirmer
      </button>
      <button onClick={() => setStep(0)} className="text-white/40 text-sm">
        Annuler
      </button>
    </span>
  );
}

// ──────────────────────────────────────────────────────────
// PROJECTS TAB
// ──────────────────────────────────────────────────────────
type ProjectForm = {
  brandId: number;
  title: string;
  slug: string;
  projectType: string;
  tagline: string;
  shortDescription: string;
  description: string;
  longDescription: string;
  location: string;
  city: string;
  addressText: string;
  status: "upcoming" | "ongoing" | "completed";
  heroTitle: string;
  heroSubtitle: string;
  heroLocationText: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  priceMin: string;
  priceMax: string;
  showPrice: boolean;
  priceLabel: string;
  priceNote: string;
  availabilityNote: string;
  surfaceMin: string;
  surfaceMax: string;
  deliveryDate: string;
  featured: boolean;
  displayOrder: string;
  displayType: "estya" | "acharaf" | "opportunity";
  isOpportunity: boolean;
  opportunityType: OpportunityCategory;
  opportunityTitle: string;
  opportunityDescription: string;
  opportunityHighlight: string;
  opportunityValidUntil: string;
  opportunityCtaLabel: string;
  coverImageUrl: string;
  secondaryImageUrl: string;
  lifestyleImageUrl: string;
  images: string[];
  amenities: string[];
  galleryTitle: string;
  featuresTitle: string;
  projectSectionTitle: string;
  projectSectionDescription: string;
  lifestyleTitle: string;
  lifestyleDescription: string;
  locationSectionTitle: string;
  locationDescription: string;
  locationAdvantages: string[];
  mapEmbedUrl: string;
  mapIframeCode: string;
  mapShareUrl: string;
  virtualTourUrl: string;
  contactTitle: string;
  contactSubtitle: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
};

function emptyProjectForm(brandId = 1): ProjectForm {
  return {
    brandId,
    title: "",
    slug: "",
    projectType: "",
    tagline: "",
    shortDescription: "",
    description: "",
    longDescription: "",
    location: "",
    city: "",
    addressText: "",
    status: "upcoming",
    heroTitle: "",
    heroSubtitle: "",
    heroLocationText: "",
    primaryCtaLabel: "Découvrir le projet",
    secondaryCtaLabel: "Prendre rendez-vous",
    priceMin: "",
    priceMax: "",
    showPrice: true,
    priceLabel: "Prix de départ",
    priceNote: "",
    availabilityNote: "",
    surfaceMin: "",
    surfaceMax: "",
    deliveryDate: "",
    featured: false,
    displayOrder: "",
    displayType: "estya",
    isOpportunity: false,
    opportunityType: "lots_r1",
    opportunityTitle: "",
    opportunityDescription: "",
    opportunityHighlight: "",
    opportunityValidUntil: "",
    opportunityCtaLabel: "Découvrir l’opportunité",
    coverImageUrl: "",
    secondaryImageUrl: "",
    lifestyleImageUrl: "",
    images: [],
    amenities: [],
    galleryTitle: "Visuels du projet",
    featuresTitle: "Points forts du projet",
    projectSectionTitle: "Le projet",
    projectSectionDescription: "",
    lifestyleTitle: "",
    lifestyleDescription: "",
    locationSectionTitle: "Emplacement",
    locationDescription: "",
    locationAdvantages: [],
    mapEmbedUrl: "",
    mapIframeCode: "",
    mapShareUrl: "",
    virtualTourUrl: "",
    contactTitle: "Intéressé par ce projet ?",
    contactSubtitle: "Notre équipe vous recontacte dans les 24 heures pour organiser une visite ou répondre à toutes vos questions.",
    metaTitle: "",
    metaDescription: "",
    ogImageUrl: "",
  };
}

function normalizeOpportunityType(value?: string | null): OpportunityCategory {
  switch (value) {
    case "lots_r1":
    case "promotion":
      return "lots_r1";
    case "lots_r2":
    case "reduction":
      return "lots_r2";
    case "lots_r3":
    case "limited_offer":
      return "lots_r3";
    case "creche":
    case "investment":
    case "last_units":
      return "creche";
    default:
      return "lots_r1";
  }
}

import {
  Check,
  Home,
  Building2,
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
  MapPin,
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

const AMENITY_ICONS = [
  { value: "check", label: "Check (Défaut)" },
  { value: "home", label: "Maison (Home)" },
  { value: "building", label: "Bâtiment (Building)" },
  { value: "tree", label: "Arbre / Parc (Tree)" },
  { value: "leaf", label: "Feuille / Éco (Leaf)" },
  { value: "car", label: "Voiture (Car)" },
  { value: "parking", label: "Parking" },
  { value: "shield", label: "Sécurité / Gardien (Shield)" },
  { value: "lock", label: "Verrou (Lock)" },
  { value: "camera", label: "Caméra / Vidéosurveillance (Camera)" },
  { value: "pool", label: "Piscine (Pool)" },
  { value: "elevator", label: "Ascenseur (Elevator)" },
  { value: "accessibility", label: "PMR / Accessibilité" },
  { value: "phone", label: "Téléphone (Phone)" },
  { value: "wifi", label: "Wifi" },
  { value: "water", label: "Eau (Water)" },
  { value: "sun", label: "Soleil / Énergie solaire (Sun)" },
  { value: "shopping", label: "Commerce / Magasins (Shopping)" },
  { value: "school", label: "École / Éducation (School)" },
  { value: "hospital", label: "Hôpital / Santé (Hospital)" },
  { value: "location", label: "Localisation (Pin)" },
  { value: "garden", label: "Jardin / Fleur (Garden)" },
  { value: "key", label: "Clé / Clé en main (Key)" },
  { value: "star", label: "Étoile / Prestation de luxe (Star)" },
  { value: "wind", label: "Climatisation (Wind)" },
  { value: "terrace", label: "Balcon / Terrasse (Layers)" },
];

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

function stringifyAmenity(text: string, icon: string): string {
  if (icon === "check") return text;
  return JSON.stringify({ text, icon });
}

function AmenitiesEditor({
  values,
  onChange,
}: {
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const normalized = values.length ? values : [""];
  return (
    <div>
      <label className={labelClass}>Prestations</label>
      <div className="space-y-2">
        {normalized.map((value, index) => {
          const parsed = parseAmenity(value);
          const IconComponent = amenityIconMap[parsed.icon] || Check;
          return (
            <div key={index} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 items-center">
              {/* Icon Preview */}
              <div className="w-10 h-10 border border-white/15 bg-white/5 flex items-center justify-center text-white/70 flex-shrink-0">
                <IconComponent size={16} strokeWidth={1.4} />
              </div>
              {/* Text Input */}
              <input
                value={parsed.text}
                placeholder="Piscine, parking sécurisé..."
                onChange={(e) => {
                  const next = [...normalized];
                  next[index] = stringifyAmenity(e.target.value, parsed.icon);
                  onChange(next);
                }}
                className={inputClass}
              />
              {/* Icon Dropdown */}
              <select
                value={parsed.icon}
                onChange={(e) => {
                  const next = [...normalized];
                  next[index] = stringifyAmenity(parsed.text, e.target.value);
                  onChange(next);
                }}
                className={`${inputClass} max-w-[170px] cursor-pointer`}
              >
                {AMENITY_ICONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {/* Reorder Up */}
              <button
                type="button"
                onClick={() => {
                  if (index === 0) return;
                  const next = [...normalized];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  onChange(next);
                }}
                disabled={index === 0}
                className="px-3 py-2 border border-white/15 text-white/45 hover:text-white hover:border-white/35 text-xs disabled:opacity-20"
                aria-label="Monter"
              >
                <ArrowUp size={14} />
              </button>
              {/* Reorder Down */}
              <button
                type="button"
                onClick={() => {
                  if (index === normalized.length - 1) return;
                  const next = [...normalized];
                  [next[index], next[index + 1]] = [next[index + 1], next[index]];
                  onChange(next);
                }}
                disabled={index === normalized.length - 1}
                className="px-3 py-2 border border-white/15 text-white/45 hover:text-white hover:border-white/35 text-xs disabled:opacity-20"
                aria-label="Descendre"
              >
                <ArrowDown size={14} />
              </button>
              {/* Remove */}
              <button
                type="button"
                onClick={() => onChange(normalized.filter((_, i) => i !== index))}
                className="px-3 py-2 border border-white/15 text-white/45 hover:text-white hover:border-white/35 text-xs"
              >
                Retirer
              </button>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onChange([...normalized, ""])}
        className="mt-2 text-[#8EA4AF] hover:text-white text-xs tracking-[0.12em] uppercase"
      >
        + Ajouter
      </button>
    </div>
  );
}

const inputClass = "ga-input ga-input-dark";
const labelClass = "ga-label ga-label-dark";

function FormGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="ga-card-dark p-4 space-y-4">
      <h4 className="ga-kicker text-white/80">{title}</h4>
      {children}
    </section>
  );
}

function ArrayEditor({
  label,
  values,
  placeholder,
  onChange,
}: {
  label: string;
  values: string[];
  placeholder: string;
  onChange: (values: string[]) => void;
}) {
  const normalized = values.length ? values : [""];
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="space-y-2">
        {normalized.map((value, index) => (
          <div key={index} className="grid grid-cols-[1fr_auto_auto_auto] gap-2">
            <input
              value={value}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...normalized];
                next[index] = e.target.value;
                onChange(next);
              }}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => {
                if (index === 0) return;
                const next = [...normalized];
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                onChange(next);
              }}
              disabled={index === 0}
              className="px-3 py-2 border border-white/15 text-white/45 hover:text-white hover:border-white/35 text-xs disabled:opacity-20"
              aria-label="Monter"
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (index === normalized.length - 1) return;
                const next = [...normalized];
                [next[index], next[index + 1]] = [next[index + 1], next[index]];
                onChange(next);
              }}
              disabled={index === normalized.length - 1}
              className="px-3 py-2 border border-white/15 text-white/45 hover:text-white hover:border-white/35 text-xs disabled:opacity-20"
              aria-label="Descendre"
            >
              <ArrowDown size={14} />
            </button>
            <button
              type="button"
              onClick={() => onChange(normalized.filter((_, i) => i !== index))}
              className="px-3 py-2 border border-white/15 text-white/45 hover:text-white hover:border-white/35 text-xs"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...normalized, ""])}
        className="mt-2 text-[#8EA4AF] hover:text-white text-xs tracking-[0.12em] uppercase"
      >
        + Ajouter
      </button>
    </div>
  );
}

const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const acceptedImageExtensions = ".jpg,.jpeg,.png,.webp";
const maxImageSize = 8 * 1024 * 1024;
const acceptedVideoTypes = ["video/mp4", "video/webm"];
const acceptedVideoExtensions = ".mp4,.webm";
const maxVideoSize = 20 * 1024 * 1024;

type UploadedImage = {
  url: string;
  originalName: string;
  size: number;
};

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function validateImageFiles(files: File[]) {
  for (const file of files) {
    if (!acceptedImageTypes.includes(file.type)) {
      return "Formats acceptés : JPG, JPEG, PNG ou WEBP.";
    }
    if (file.size > maxImageSize) {
      return `Chaque image doit faire moins de ${formatBytes(maxImageSize)}.`;
    }
  }
  return "";
}

function validateVideoFile(file: File) {
  if (!acceptedVideoTypes.includes(file.type)) {
    return "Formats vidéo acceptés : MP4 ou WEBM.";
  }
  if (file.size > maxVideoSize) {
    return `La vidéo doit faire moins de ${formatBytes(maxVideoSize)}.`;
  }
  return "";
}

async function uploadProjectImages(files: File[]): Promise<UploadedImage[]> {
  const validationError = validateImageFiles(files);
  if (validationError) {
    throw new Error(validationError);
  }

  const data = new FormData();
  files.forEach((file) => data.append("files", file));

  const response = await fetch("/api/uploads/images", {
    method: "POST",
    body: data,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const backendError = payload.error || payload.detail;
    throw new Error(backendError ? `${backendError}` : `Erreur serveur lors de l'upload image (HTTP ${response.status}).`);
  }

  return payload.files ?? [];
}

type UploadedVideo = UploadedImage;

async function uploadHeroVideo(file: File): Promise<UploadedVideo> {
  const validationError = validateVideoFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const data = new FormData();
  data.append("files", file);

  const response = await fetch("/api/uploads/videos", {
    method: "POST",
    body: data,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const backendError = payload.error || payload.detail;
    throw new Error(backendError ? `${backendError}` : `Erreur serveur lors de l'upload vidéo (HTTP ${response.status}).`);
  }

  return payload.files?.[0];
}

type HomepageHeroSettings = {
  mediaType: "slideshow" | "video" | "mixed";
  images: string[];
  videoUrl: string;
  fallbackImageUrl: string;
  enableVideoOnMobile: boolean;
};

const defaultHomepageHeroSettings: HomepageHeroSettings = {
  mediaType: "slideshow",
  images: [],
  videoUrl: "",
  fallbackImageUrl: "",
  enableVideoOnMobile: false,
};

function HomepageHeroAdminSection() {
  const [settings, setSettings] = useState<HomepageHeroSettings>(defaultHomepageHeroSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingFallback, setUploadingFallback] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/homepage-hero");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Impossible de charger les réglages hero.");
      }
      setSettings({
        mediaType: payload.mediaType ?? "slideshow",
        images: Array.isArray(payload.images) ? payload.images : [],
        videoUrl: payload.videoUrl ?? "",
        fallbackImageUrl: payload.fallbackImageUrl ?? "",
        enableVideoOnMobile: payload.enableVideoOnMobile === true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/homepage-hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaType: settings.mediaType,
          images: settings.images.filter(Boolean),
          videoUrl: settings.videoUrl.trim(),
          fallbackImageUrl: settings.fallbackImageUrl.trim(),
          enableVideoOnMobile: settings.enableVideoOnMobile,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Sauvegarde impossible.");
      }
      setMessage("Réglages Homepage Hero enregistrés.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sauvegarde impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function handleImagesUpload(files: FileList | null) {
    const selectedFiles = Array.from(files ?? []);
    if (!selectedFiles.length) return;
    setUploadingImages(true);
    setError("");
    setMessage("");
    try {
      const uploaded = await uploadProjectImages(selectedFiles);
      setSettings((prev) => ({
        ...prev,
        images: [...prev.images.filter(Boolean), ...uploaded.map((item) => item.url)],
      }));
      setMessage(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} ajoutée${uploaded.length > 1 ? "s" : ""}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload images impossible.");
    } finally {
      setUploadingImages(false);
    }
  }

  async function handleVideoUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    setError("");
    setMessage("");
    try {
      const uploaded = await uploadHeroVideo(file);
      setSettings((prev) => ({ ...prev, videoUrl: uploaded.url }));
      setMessage("Vidéo hero uploadée.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload vidéo impossible.");
    } finally {
      setUploadingVideo(false);
    }
  }

  async function handleFallbackUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploadingFallback(true);
    setError("");
    setMessage("");
    try {
      const [uploaded] = await uploadProjectImages([file]);
      setSettings((prev) => ({ ...prev, fallbackImageUrl: uploaded.url }));
      setMessage("Image fallback uploadée.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fallback impossible.");
    } finally {
      setUploadingFallback(false);
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= settings.images.length) return;
    const next = [...settings.images];
    [next[index], next[target]] = [next[target], next[index]];
    setSettings((prev) => ({ ...prev, images: next }));
  }

  function removeImage(index: number) {
    setSettings((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  }

  if (loading) {
    return (
      <section className="ga-admin-panel p-6 mb-8">
        <div className="text-white/60 text-sm flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" /> Chargement Homepage Hero...
        </div>
      </section>
    );
  }

  return (
    <section className="ga-admin-panel p-6 mb-8 space-y-5">
      <div>
        <h3 className="text-white font-serif text-xl">Homepage Hero</h3>
        <p className="text-white/45 text-xs mt-1">Upload optimized night/luxury visuals for best homepage performance.</p>
      </div>

      <div>
        <label className={labelClass}>Type de média</label>
        <select
          value={settings.mediaType}
          onChange={(e) => setSettings((prev) => ({ ...prev, mediaType: e.target.value as HomepageHeroSettings["mediaType"] }))}
          className={inputClass}
        >
          <option value="slideshow">Image slideshow</option>
          <option value="video">Video</option>
          <option value="mixed">Mixed media</option>
        </select>
      </div>

      {(settings.mediaType === "slideshow" || settings.mediaType === "mixed") && (
        <div className="space-y-3">
          <label className={labelClass}>Images hero</label>
          <div className="flex items-center gap-2">
            <label htmlFor="homepage-hero-images" className="inline-flex items-center gap-2 px-3 py-2 border border-[#8EA4AF]/40 text-[#DCE0E7] hover:border-[#8EA4AF] hover:bg-white/5 text-xs tracking-[0.12em] uppercase cursor-pointer transition-colors">
              {uploadingImages ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Upload images
            </label>
            <input
              id="homepage-hero-images"
              type="file"
              multiple
              accept={acceptedImageExtensions}
              className="sr-only"
              disabled={uploadingImages}
              onChange={(e) => {
                handleImagesUpload(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          <div className="space-y-3">
            {settings.images.map((url, index) => (
              <div key={`${url}-${index}`} className="grid grid-cols-[96px_1fr_auto] gap-3 items-center border border-white/10 bg-white/[0.03] p-3">
                <div className="w-full aspect-[4/3] bg-white/[0.05] border border-white/10 overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
                <input
                  value={url}
                  onChange={(e) => {
                    const next = [...settings.images];
                    next[index] = e.target.value;
                    setSettings((prev) => ({ ...prev, images: next }));
                  }}
                  className={inputClass}
                />
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} className="p-2 border border-white/15 text-white/45 hover:text-white disabled:opacity-20">
                    <ArrowUp size={14} />
                  </button>
                  <button type="button" onClick={() => moveImage(index, 1)} disabled={index === settings.images.length - 1} className="p-2 border border-white/15 text-white/45 hover:text-white disabled:opacity-20">
                    <ArrowDown size={14} />
                  </button>
                  <button type="button" onClick={() => removeImage(index)} className="inline-flex items-center gap-2 px-3 py-2 border border-white/15 text-white/45 hover:text-white hover:border-white/35 text-xs">
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            ))}
            {settings.images.length === 0 && (
              <div className="border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-white/35 text-sm">
                Aucune image configurée.
              </div>
            )}
          </div>
        </div>
      )}

      {(settings.mediaType === "video" || settings.mediaType === "mixed") && (
        <div className="space-y-3">
          <label className={labelClass}>Vidéo hero</label>
          <label className="flex items-center gap-3 text-white/70 text-sm">
            <input
              type="checkbox"
              checked={settings.enableVideoOnMobile}
              onChange={(e) => setSettings((prev) => ({ ...prev, enableVideoOnMobile: e.target.checked }))}
            />
            Enable video on mobile
          </label>
          <p className="text-white/35 text-xs leading-relaxed">
            For better mobile speed, we recommend using fallback image instead of video.
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="homepage-hero-video" className="inline-flex items-center gap-2 px-3 py-2 border border-[#8EA4AF]/40 text-[#DCE0E7] hover:border-[#8EA4AF] hover:bg-white/5 text-xs tracking-[0.12em] uppercase cursor-pointer transition-colors">
              {uploadingVideo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {settings.videoUrl ? "Remplacer vidéo" : "Uploader vidéo"}
            </label>
            <input
              id="homepage-hero-video"
              type="file"
              accept={acceptedVideoExtensions}
              className="sr-only"
              disabled={uploadingVideo}
              onChange={(e) => {
                handleVideoUpload(e.target.files);
                e.target.value = "";
              }}
            />
            {settings.videoUrl && (
              <button type="button" onClick={() => setSettings((prev) => ({ ...prev, videoUrl: "" }))} className="inline-flex items-center gap-2 px-3 py-2 border border-white/15 text-white/45 hover:text-white hover:border-white/35 text-xs">
                <Trash2 size={13} /> Retirer
              </button>
            )}
          </div>
          <input
            value={settings.videoUrl}
            onChange={(e) => setSettings((prev) => ({ ...prev, videoUrl: e.target.value }))}
            className={inputClass}
            placeholder="URL vidéo (option manuelle)"
          />
          {settings.videoUrl && (
            <video src={settings.videoUrl} controls className="w-full max-h-64 border border-white/10 bg-black/40" />
          )}
        </div>
      )}

      <div className="space-y-3">
        <label className={labelClass}>Image fallback</label>
        <p className="text-white/35 text-xs leading-relaxed">
          This image is used on mobile and as a fallback while the video loads.
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="homepage-fallback-image" className="inline-flex items-center gap-2 px-3 py-2 border border-[#8EA4AF]/40 text-[#DCE0E7] hover:border-[#8EA4AF] hover:bg-white/5 text-xs tracking-[0.12em] uppercase cursor-pointer transition-colors">
            {uploadingFallback ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {settings.fallbackImageUrl ? "Remplacer fallback" : "Uploader fallback"}
          </label>
          <input
            id="homepage-fallback-image"
            type="file"
            accept={acceptedImageExtensions}
            className="sr-only"
            disabled={uploadingFallback}
            onChange={(e) => {
              handleFallbackUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        <input
          value={settings.fallbackImageUrl}
          onChange={(e) => setSettings((prev) => ({ ...prev, fallbackImageUrl: e.target.value }))}
          className={inputClass}
          placeholder="URL image fallback (option manuelle)"
        />
        <div className="aspect-[16/7] border border-white/10 bg-white/[0.04] overflow-hidden">
          {settings.fallbackImageUrl ? (
            <img src={settings.fallbackImageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/25 text-xs tracking-[0.14em] uppercase">Aucune image fallback</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="ga-btn btn-medium px-6 py-2 inline-flex items-center gap-2">
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          Enregistrer Homepage Hero
        </button>
        <button type="button" onClick={load} className="ga-btn ga-btn-light px-4 py-2">
          Recharger
        </button>
      </div>
      <UploadStatus message={message} error={error} />
    </section>
  );
}

function UploadStatus({ message, error }: { message: string; error: string }) {
  if (!message && !error) return null;
  return (
    <p className={`text-xs mt-2 ${error ? "text-[#8EA4AF]" : "text-[#DCE0E7]"}`}>
      {error || message}
    </p>
  );
}

function ImageUploadField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const [uploaded] = await uploadProjectImages([file]);
      onChange(uploaded.url);
      setMessage("Image uploadée. Enregistrez le projet pour publier ce changement.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload impossible.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className={labelClass}>{label}</label>
      <div className="aspect-[4/3] border border-white/10 bg-white/[0.04] overflow-hidden flex items-center justify-center">
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="text-white/25 flex flex-col items-center gap-2">
            <ImageIcon size={22} strokeWidth={1.4} />
            <span className="text-[10px] tracking-[0.16em] uppercase">Aucune image</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor={id}
          className="inline-flex items-center gap-2 px-3 py-2 border border-[#8EA4AF]/40 text-[#DCE0E7] hover:border-[#8EA4AF] hover:bg-white/5 text-xs tracking-[0.12em] uppercase cursor-pointer transition-colors"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {value ? "Remplacer" : "Uploader"}
        </label>
        <input
          id={id}
          type="file"
          accept={acceptedImageExtensions}
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            handleUpload(e.target.files);
            e.target.value = "";
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-2 px-3 py-2 border border-white/15 text-white/45 hover:text-white hover:border-white/35 text-xs transition-colors"
          >
            <Trash2 size={13} /> Effacer
          </button>
        )}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder="URL manuelle avancée"
      />
      <UploadStatus message={message} error={error} />
    </div>
  );
}

function GalleryEditor({
  values,
  onChange,
}: {
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleUpload(files: FileList | null) {
    const selectedFiles = Array.from(files ?? []);
    if (!selectedFiles.length) return;

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const uploaded = await uploadProjectImages(selectedFiles);
      onChange([...values.filter(Boolean), ...uploaded.map((file) => file.url)]);
      setMessage(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploadée${uploaded.length > 1 ? "s" : ""}. Enregistrez le projet pour publier.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload impossible.");
    } finally {
      setUploading(false);
    }
  }

  function updateAt(index: number, value: string) {
    const next = [...values];
    next[index] = value;
    onChange(next);
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <label className={labelClass}>Images de galerie</label>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <label
          htmlFor="project-gallery-upload"
          className="inline-flex items-center gap-2 px-3 py-2 border border-[#8EA4AF]/40 text-[#DCE0E7] hover:border-[#8EA4AF] hover:bg-white/5 text-xs tracking-[0.12em] uppercase cursor-pointer transition-colors"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Upload images
        </label>
        <input
          id="project-gallery-upload"
          type="file"
          multiple
          accept={acceptedImageExtensions}
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            handleUpload(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="px-3 py-2 border border-white/15 text-white/50 hover:text-white hover:border-white/35 text-xs tracking-[0.12em] uppercase transition-colors"
        >
          + URL manuelle
        </button>
      </div>
      <UploadStatus message={message} error={error} />

      <div className="space-y-3 mt-3">
        {values.map((value, index) => (
          <div key={`${value}-${index}`} className="grid grid-cols-[84px_1fr] md:grid-cols-[96px_1fr_auto] gap-3 items-center border border-white/10 bg-white/[0.03] p-3">
            <div className="w-full aspect-[4/3] bg-white/[0.05] border border-white/10 overflow-hidden flex items-center justify-center">
              {value ? (
                <img src={value} alt="" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={18} className="text-white/25" strokeWidth={1.4} />
              )}
            </div>
            <input
              value={value}
              placeholder="URL image"
              onChange={(e) => updateAt(index, e.target.value)}
              className={inputClass}
            />
            <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-2">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="p-2 border border-white/15 text-white/45 hover:text-white disabled:opacity-20">
                <ArrowUp size={14} />
              </button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === values.length - 1} className="p-2 border border-white/15 text-white/45 hover:text-white disabled:opacity-20">
                <ArrowDown size={14} />
              </button>
              <button type="button" onClick={() => removeAt(index)} className="inline-flex items-center gap-2 px-3 py-2 border border-white/15 text-white/45 hover:text-white hover:border-white/35 text-xs">
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>
        ))}
        {values.length === 0 && (
          <div className="border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-white/35 text-sm">
            Aucune image de galerie.
          </div>
        )}
      </div>
    </div>
  );
}

function cleanMapValue(value: string) {
  return value.trim();
}

function extractTrustedGoogleMapUrl(iframeCode: string, embedUrl: string) {
  const raw = cleanMapValue(iframeCode) || cleanMapValue(embedUrl);
  if (!raw) return "";
  const iframeSrc = raw.match(/src=["']([^"']+)["']/i)?.[1] ?? raw;
  const decodedSrc = iframeSrc.replace(/&amp;/g, "&").trim();

  try {
    const url = new URL(decodedSrc);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    const trusted =
      (hostname === "google.com" && url.pathname.startsWith("/maps")) ||
      hostname === "maps.google.com" ||
      hostname === "googleusercontent.com" ||
      hostname.endsWith(".googleusercontent.com");

    return trusted && (url.protocol === "https:" || url.protocol === "http:") ? url.toString() : "";
  } catch {
    return "";
  }
}

function MapPreview({ iframeCode, embedUrl, address }: { iframeCode: string; embedUrl: string; address: string }) {
  const src = extractTrustedGoogleMapUrl(iframeCode, embedUrl);

  return (
    <div className="border border-white/10 bg-white/[0.03] p-3">
      <p className={labelClass}>Aperçu carte</p>
      <div className="relative aspect-[16/9] overflow-hidden bg-white/[0.05] border border-white/10">
        {src ? (
          <iframe
            src={src}
            title="Aperçu Google Maps"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-center px-6">
            <div>
              <p className="text-white/50 text-xs tracking-[0.16em] uppercase">{address || "Adresse non renseignée"}</p>
              <p className="text-white/30 text-[10px] tracking-[0.14em] uppercase mt-2">Carte bientôt disponible</p>
            </div>
          </div>
        )}
      </div>
      {(iframeCode || embedUrl) && !src && (
        <p className="ga-error mt-2">Le lien doit venir de Google Maps.</p>
      )}
    </div>
  );
}

function getDisplayTypeBadge(displayType: string | null | undefined, isOpportunity: boolean) {
  const type = displayType ?? (isOpportunity ? "opportunity" : "estya");
  if (type === "opportunity") {
    return <Badge color="green">Opportunité</Badge>;
  }
  if (type === "acharaf") {
    return <Badge color="gold">Acharaf Immobilier</Badge>;
  }
  return <Badge color="blue">Estya</Badge>;
}

function ProjectsTab() {
  const qc = useQueryClient();
  const { data: projects = [] } = useListProjects();
  const { data: brands = [] } = useListBrands();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<ProjectForm>(() => emptyProjectForm());
  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "estya" | "acharaf" | "opportunity">("all");

  useEffect(() => {
    setOrderedIds(projects.map((p) => p.id));
  }, [projects]);

  const orderedProjects = useMemo(
    () => orderedIds
      .map((id) => projects.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [orderedIds, projects],
  );

  const filteredProjects = useMemo(() => {
    return orderedProjects.filter((p) => {
      if (filterType === "all") return true;
      const type = p.displayType ?? (p.isOpportunity ? "opportunity" : (p.brandId === 2 ? "acharaf" : "estya"));
      return type === filterType;
    });
  }, [orderedProjects, filterType]);

  const handleReorder = (newFilteredIds: number[]) => {
    if (filterType === "all") {
      setOrderedIds(newFilteredIds);
    } else {
      const filteredSet = new Set(newFilteredIds);
      let filteredIndex = 0;
      const nextOrderedIds = orderedIds.map((id) => {
        if (filteredSet.has(id)) {
          return newFilteredIds[filteredIndex++];
        }
        return id;
      });
      setOrderedIds(nextOrderedIds);
    }
  };

  const orderDirty = useMemo(() => {
    if (orderedIds.length !== projects.length) return false;
    return orderedIds.some((id, index) => id !== projects[index]?.id);
  }, [orderedIds, projects]);

  function resetForm() {
    setForm(emptyProjectForm(brands[0]?.id ?? 1));
    setFormError("");
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(p: (typeof projects)[0]) {
    setForm({
      brandId: p.brandId,
      title: p.title,
      slug: p.slug,
      projectType: p.projectType ?? "",
      tagline: p.tagline ?? "",
      shortDescription: p.shortDescription ?? "",
      description: p.description ?? "",
      longDescription: p.longDescription ?? "",
      location: p.location ?? "",
      city: p.city ?? "",
      addressText: p.addressText ?? "",
      status: (p.status as "upcoming" | "ongoing" | "completed") ?? "upcoming",
      heroTitle: p.heroTitle ?? "",
      heroSubtitle: p.heroSubtitle ?? "",
      heroLocationText: p.heroLocationText ?? "",
      primaryCtaLabel: p.primaryCtaLabel ?? "Découvrir le projet",
      secondaryCtaLabel: p.secondaryCtaLabel ?? "Prendre rendez-vous",
      priceMin: p.priceMin ? String(p.priceMin) : "",
      priceMax: p.priceMax ? String(p.priceMax) : "",
      showPrice: p.showPrice !== false,
      priceLabel: p.priceLabel ?? "Prix de départ",
      priceNote: p.priceNote ?? "",
      availabilityNote: p.availabilityNote ?? "",
      surfaceMin: p.surfaceMin ? String(p.surfaceMin) : "",
      surfaceMax: p.surfaceMax ? String(p.surfaceMax) : "",
      deliveryDate: p.deliveryDate ?? "",
      featured: p.featured,
      displayOrder: p.displayOrder !== undefined && p.displayOrder !== null ? String(p.displayOrder) : "",
      displayType: p.displayType ?? (p.isOpportunity ? "opportunity" : (p.brandId === 2 ? "acharaf" : "estya")),
      isOpportunity: p.isOpportunity ?? false,
      opportunityType: normalizeOpportunityType(p.opportunityType),
      opportunityTitle: p.opportunityTitle ?? "",
      opportunityDescription: p.opportunityDescription ?? "",
      opportunityHighlight: p.opportunityHighlight ?? "",
      opportunityValidUntil: p.opportunityValidUntil ?? "",
      opportunityCtaLabel: p.opportunityCtaLabel ?? "Découvrir l’opportunité",
      coverImageUrl: p.coverImageUrl ?? "",
      secondaryImageUrl: p.secondaryImageUrl ?? "",
      lifestyleImageUrl: p.lifestyleImageUrl ?? "",
      images: p.images ?? [],
      amenities: p.amenities ?? [],
      galleryTitle: p.galleryTitle ?? "Visuels du projet",
      featuresTitle: p.featuresTitle ?? "Points forts du projet",
      projectSectionTitle: p.projectSectionTitle ?? "Le projet",
      projectSectionDescription: p.projectSectionDescription ?? "",
      lifestyleTitle: p.lifestyleTitle ?? "",
      lifestyleDescription: p.lifestyleDescription ?? "",
      locationSectionTitle: p.locationSectionTitle ?? "Emplacement",
      locationDescription: p.locationDescription ?? "",
      locationAdvantages: p.locationAdvantages ?? [],
      mapEmbedUrl: p.mapEmbedUrl ?? "",
      mapIframeCode: p.mapIframeCode ?? "",
      mapShareUrl: p.mapShareUrl ?? "",
      virtualTourUrl: p.virtualTourUrl ?? "",
      contactTitle: p.contactTitle ?? "Intéressé par ce projet ?",
      contactSubtitle: p.contactSubtitle ?? "Notre équipe vous recontacte dans les 24 heures pour organiser une visite ou répondre à toutes vos questions.",
      metaTitle: p.metaTitle ?? "",
      metaDescription: p.metaDescription ?? "",
      ogImageUrl: p.ogImageUrl ?? "",
    });
    setFormError("");
    setEditing(p.id);
    setShowForm(true);
  }

  function toNumber(value: string) {
    return value.trim() ? Number(value) : 0;
  }

  function cleanList(values: string[]) {
    return values.map((v) => v.trim()).filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.displayType || !form.status) {
      setFormError("Titre, type d’affichage et statut sont obligatoires.");
      return;
    }
    if (form.displayType === "opportunity" && !form.opportunityType) {
      setFormError("La catégorie d’opportunité est obligatoire.");
      return;
    }
    if (form.showPrice && !form.priceMin.trim()) {
      setFormError("Ajoutez un prix min ou désactivez l'affichage public du prix.");
      return;
    }
    setFormError("");
    const payload = {
      ...form,
      title: form.title.trim(),
      slug: form.slug.trim() || slugFromTitle(form.title.trim()) || `projet-${Date.now()}`,
      priceLabel: form.priceLabel.trim() || "Prix de départ",
      galleryTitle: form.galleryTitle.trim() || "Visuels du projet",
      featuresTitle: form.featuresTitle.trim() || "Points forts du projet",
      priceMin: toNumber(form.priceMin),
      priceMax: toNumber(form.priceMax),
      surfaceMin: toNumber(form.surfaceMin),
      surfaceMax: toNumber(form.surfaceMax),
      displayOrder: form.displayOrder.trim() ? Number(form.displayOrder) : 9999,
      images: cleanList(form.images),
      amenities: cleanList(form.amenities),
      locationAdvantages: cleanList(form.locationAdvantages),
    };
    if (editing !== null) {
      await updateProject.mutateAsync({ id: editing, data: payload });
    } else {
      await createProject.mutateAsync({ data: payload });
    }
    qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    resetForm();
  }

  async function saveDisplayOrder() {
    if (!orderDirty || isSavingOrder) return;
    setIsSavingOrder(true);
    try {
      for (const [index, projectId] of orderedIds.entries()) {
        const project = projects.find((p) => p.id === projectId);
        if (!project) continue;
        await updateProject.mutateAsync({
          id: project.id,
          data: {
            brandId: project.brandId,
            title: project.title,
            slug: project.slug,
            status: project.status,
            displayOrder: index + 1,
            displayType: project.displayType || "estya",
          },
        });
      }
      qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    } finally {
      setIsSavingOrder(false);
    }
  }

  return (
    <div>
      <HomepageHeroAdminSection />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-white">Projets <span className="text-white/30 text-lg ml-2">({projects.length})</span></h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!orderDirty || isSavingOrder}
            onClick={saveDisplayOrder}
            className="ga-btn ga-btn-light px-4 py-2 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {isSavingOrder ? "Enregistrement..." : "Enregistrer l’ordre"}
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="ga-btn btn-medium px-4 py-2"
          >
            + Ajouter
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="ga-admin-panel p-6 mb-6 space-y-5">
          <h3 className="text-white font-serif text-lg mb-4">{editing !== null ? "Modifier le projet" : "Nouveau projet"}</h3>
          {formError && <div className="border border-[#8EA4AF]/35 bg-white/5 text-[#DCE0E7] text-sm px-4 py-3">{formError}</div>}

          <FormGroup title="1. Informations de base">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Titre *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Slug (identifiant d'URL) *</label>
                <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} placeholder="exemple-de-slug" />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <input value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value })} className={inputClass} placeholder="Villa, Résidence, Lotissement..." />
              </div>
              <div>
                <label className={labelClass}>Tagline courte</label>
                <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description courte</label>
              <textarea rows={2} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description longue</label>
              <textarea rows={5} value={form.longDescription} onChange={(e) => setForm({ ...form, longDescription: e.target.value })} className={inputClass} />
            </div>
          </FormGroup>

          <FormGroup title="2. Type d’affichage & statut">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Type d’affichage *</label>
              <select
                required
                value={form.displayType}
                onChange={(e) => {
                  const val = e.target.value as "estya" | "acharaf" | "opportunity";
                  setForm({
                    ...form,
                    displayType: val,
                    isOpportunity: val === "opportunity",
                    brandId: val === "estya" ? 1 : (val === "acharaf" ? 2 : form.brandId),
                  });
                }}
                className={inputClass}
              >
                <option value="estya">Estya</option>
                <option value="acharaf">Acharaf Immobilier</option>
                <option value="opportunity">Opportunité</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Statut *</label>
              <select
                required
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "upcoming" | "ongoing" | "completed" })}
                className={inputClass}
              >
                <option value="upcoming">À venir</option>
                <option value="ongoing">En cours</option>
                <option value="completed">Livré</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Livraison</label>
              <input value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} className={inputClass} placeholder="ex: T4 2025" />
            </div>
            </div>
            <label className="flex items-center gap-3 text-white/70 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Projet mis en avant
            </label>
          </FormGroup>

          {form.displayType === "opportunity" && (
            <FormGroup title="2bis. Spécificités de l’opportunité">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Type d’opportunité</label>
                  <select
                    value={form.opportunityType}
                    onChange={(e) => setForm({ ...form, opportunityType: e.target.value as ProjectForm["opportunityType"] })}
                    className={inputClass}
                  >
                    <option value="lots_r1">LOTS R+1</option>
                    <option value="lots_r2">LOTS R+2</option>
                    <option value="lots_r3">LOTS R+3</option>
                    <option value="creche">CRÈCHE</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Valable jusqu’au (optionnel)</label>
                  <input value={form.opportunityValidUntil} onChange={(e) => setForm({ ...form, opportunityValidUntil: e.target.value })} className={inputClass} placeholder="31/12/2026" />
                </div>
                <div>
                  <label className={labelClass}>Titre d’opportunité</label>
                  <input value={form.opportunityTitle} onChange={(e) => setForm({ ...form, opportunityTitle: e.target.value })} className={inputClass} placeholder="Offre spéciale lancement" />
                </div>
                <div>
                  <label className={labelClass}>Highlight</label>
                  <input value={form.opportunityHighlight} onChange={(e) => setForm({ ...form, opportunityHighlight: e.target.value })} className={inputClass} placeholder="-10% / Frais offerts / Dernières unités" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description courte</label>
                <textarea rows={3} value={form.opportunityDescription} onChange={(e) => setForm({ ...form, opportunityDescription: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Libellé CTA opportunité</label>
                <input value={form.opportunityCtaLabel} onChange={(e) => setForm({ ...form, opportunityCtaLabel: e.target.value })} className={inputClass} />
              </div>
            </FormGroup>
          )}

          <FormGroup title="3. Pricing">
            <label className="flex items-center gap-3 text-white/70 text-sm">
              <input type="checkbox" checked={form.showPrice} onChange={(e) => setForm({ ...form, showPrice: e.target.checked })} />
              Afficher le prix sur le site
            </label>
            <p className="text-white/35 text-xs leading-relaxed">
              Si cette option est désactivée, le public verra uniquement “Prix à consulter”. Les montants restent stockés en interne.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Libellé prix</label>
                <input value={form.priceLabel} onChange={(e) => setForm({ ...form, priceLabel: e.target.value })} className={inputClass} placeholder="Prix de départ" />
              </div>
              <div>
                <label className={labelClass}>Prix de départ (MAD)</label>
                <input type="number" required={form.showPrice} value={form.priceMin} onChange={(e) => setForm({ ...form, priceMin: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Surface min (m²)</label>
                <input type="number" value={form.surfaceMin} onChange={(e) => setForm({ ...form, surfaceMin: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Surface max (m²)</label>
                <input type="number" value={form.surfaceMax} onChange={(e) => setForm({ ...form, surfaceMax: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Note financement</label>
                <textarea rows={2} value={form.priceNote} onChange={(e) => setForm({ ...form, priceNote: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Note disponibilité</label>
                <textarea rows={2} value={form.availabilityNote} onChange={(e) => setForm({ ...form, availabilityNote: e.target.value })} className={inputClass} />
              </div>
            </div>
          </FormGroup>

          <FormGroup title="4. Location & map">
            <p className="text-white/40 text-xs leading-relaxed">
              Collez ici le lien d’intégration Google Maps ou le code iframe.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Ville</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Localisation courte</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Adresse complète</label>
              <input value={form.addressText} onChange={(e) => setForm({ ...form, addressText: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Titre section emplacement</label>
              <input value={form.locationSectionTitle} onChange={(e) => setForm({ ...form, locationSectionTitle: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description emplacement</label>
              <textarea rows={3} value={form.locationDescription} onChange={(e) => setForm({ ...form, locationDescription: e.target.value })} className={inputClass} />
            </div>
            <ArrayEditor label="Avantages à proximité" values={form.locationAdvantages} placeholder="Écoles à proximité" onChange={(locationAdvantages) => setForm({ ...form, locationAdvantages })} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Google Maps embed URL</label>
                <input value={form.mapEmbedUrl} onChange={(e) => setForm({ ...form, mapEmbedUrl: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Lien Google Maps</label>
                <input value={form.mapShareUrl} onChange={(e) => setForm({ ...form, mapShareUrl: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Visite Virtuelle (URL HTTPS)</label>
              <input
                type="url"
                placeholder="https://axeon.ma/CLIENT/GROUPE_ACHARAF/Marrakech/VISITE_360/F3/"
                value={form.virtualTourUrl}
                onChange={(e) => setForm({ ...form, virtualTourUrl: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Google Maps iframe code</label>
              <textarea
                rows={3}
                value={form.mapIframeCode}
                onChange={(e) => setForm({ ...form, mapIframeCode: e.target.value })}
                className={inputClass}
                placeholder="<iframe src=&quot;https://www.google.com/maps/embed?...&quot;></iframe>"
              />
            </div>
            <MapPreview iframeCode={form.mapIframeCode} embedUrl={form.mapEmbedUrl} address={form.addressText || form.location || form.city} />
          </FormGroup>

          <FormGroup title="5. Hero section">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Hero title</label>
                <input value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hero subtitle</label>
                <input value={form.heroSubtitle} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hero location text</label>
                <input value={form.heroLocationText} onChange={(e) => setForm({ ...form, heroLocationText: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>CTA principal</label>
                <input value={form.primaryCtaLabel} onChange={(e) => setForm({ ...form, primaryCtaLabel: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>CTA contact</label>
                <input value={form.secondaryCtaLabel} onChange={(e) => setForm({ ...form, secondaryCtaLabel: e.target.value })} className={inputClass} />
              </div>
            </div>
          </FormGroup>

          <FormGroup title="6. Project story/content">
            <div>
              <label className={labelClass}>Titre section “Le projet”</label>
              <input value={form.projectSectionTitle} onChange={(e) => setForm({ ...form, projectSectionTitle: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description section “Le projet”</label>
              <textarea rows={4} value={form.projectSectionDescription} onChange={(e) => setForm({ ...form, projectSectionDescription: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description historique / compatibilité</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
            </div>
          </FormGroup>

          <FormGroup title="7. Media & gallery">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ImageUploadField id="project-hero-upload" label="Image hero" value={form.coverImageUrl} onChange={(coverImageUrl) => setForm({ ...form, coverImageUrl })} />
              <ImageUploadField id="project-secondary-upload" label="Image secondaire" value={form.secondaryImageUrl} onChange={(secondaryImageUrl) => setForm({ ...form, secondaryImageUrl })} />
              <ImageUploadField id="project-lifestyle-upload" label="Image art de vivre" value={form.lifestyleImageUrl} onChange={(lifestyleImageUrl) => setForm({ ...form, lifestyleImageUrl })} />
            </div>
            <div>
              <label className={labelClass}>Titre galerie</label>
              <input value={form.galleryTitle} onChange={(e) => setForm({ ...form, galleryTitle: e.target.value })} className={inputClass} />
            </div>
            <GalleryEditor values={form.images} onChange={(images) => setForm({ ...form, images })} />
          </FormGroup>

          <FormGroup title="8. Prestations / features">
            <div>
              <label className={labelClass}>Titre prestations</label>
              <input value={form.featuresTitle} onChange={(e) => setForm({ ...form, featuresTitle: e.target.value })} className={inputClass} />
            </div>
            <AmenitiesEditor values={form.amenities} onChange={(amenities) => setForm({ ...form, amenities })} />
          </FormGroup>

          <FormGroup title="9. Art de vivre">
            <div>
              <label className={labelClass}>Titre art de vivre</label>
              <input value={form.lifestyleTitle} onChange={(e) => setForm({ ...form, lifestyleTitle: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description art de vivre</label>
              <textarea rows={3} value={form.lifestyleDescription} onChange={(e) => setForm({ ...form, lifestyleDescription: e.target.value })} className={inputClass} />
            </div>
          </FormGroup>

          <FormGroup title="10. Contact & lead settings">
            <p className="text-white/35 text-xs leading-relaxed">
              Les leads envoyés depuis la fiche projet enregistrent automatiquement le nom du projet et la source project:id.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Titre contact</label>
                <input value={form.contactTitle} onChange={(e) => setForm({ ...form, contactTitle: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Sous-titre contact</label>
                <input value={form.contactSubtitle} onChange={(e) => setForm({ ...form, contactSubtitle: e.target.value })} className={inputClass} />
              </div>
            </div>
          </FormGroup>

          <FormGroup title="11. SEO">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Meta title</label>
                <input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Meta description</label>
                <input value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className={inputClass} />
              </div>
            </div>
            <ImageUploadField id="project-og-upload" label="Image OG / partage social" value={form.ogImageUrl} onChange={(ogImageUrl) => setForm({ ...form, ogImageUrl })} />
          </FormGroup>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="ga-btn btn-medium px-6 py-2">
              {editing !== null ? "Enregistrer" : "Créer"}
            </button>
            <button type="button" onClick={resetForm} className="ga-btn ga-btn-light px-4 py-2">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
        {[
          { label: "Tous", val: "all" },
          { label: "Estya", val: "estya" },
          { label: "Acharaf Immobilier", val: "acharaf" },
          { label: "Opportunité", val: "opportunity" },
        ].map((f) => (
          <button
            key={f.val}
            type="button"
            onClick={() => setFilterType(f.val as any)}
            className={`px-4 py-1.5 text-xs font-medium uppercase tracking-wider border rounded transition-all duration-200 ${
              filterType === f.val
                ? "bg-white text-[#082634] border-white"
                : "text-white/60 border-white/10 hover:text-white hover:border-white/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Reorder.Group axis="y" values={orderedIds} onReorder={handleReorder} className="space-y-2">
        {filteredProjects.map((p) => (
          <Reorder.Item
            key={p.id}
            value={p.id}
            className="ga-card-dark p-4 flex items-center justify-between hover:border-white/20 transition-colors"
            whileDrag={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-4">
              <div className="text-white/40 cursor-grab active:cursor-grabbing">
                <GripVertical size={16} />
              </div>
              {p.coverImageUrl && <img src={p.coverImageUrl} alt="" className="w-16 h-12 object-cover opacity-70" />}
              <div>
                <div className="text-white font-medium flex items-center gap-2">
                  {p.title}
                  {getDisplayTypeBadge(p.displayType, !!p.isOpportunity)}
                </div>
                <div className="text-white/40 text-sm">{p.city} · {p.brand?.name} · {projectPriceLabel(p)}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-2 py-0.5 rounded text-xs font-medium tracking-wide border ${statusBadgeClass(p.status)}`}>{statusLabel(p.status)}</span>
              {p.featured && <Badge color="gold">En vedette</Badge>}
              <div className="text-white/30 text-xs">{formatDate(p.createdAt)}</div>
              <button onClick={() => startEdit(p)} className="text-white/50 hover:text-white text-sm px-2 py-1 hover:bg-white/10 transition-colors">
                Modifier
              </button>
              <ConfirmButton onConfirm={async () => {
                await deleteProject.mutateAsync({ id: p.id });
                qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
              }} />
            </div>
          </Reorder.Item>
        ))}
        {filteredProjects.length === 0 && <p className="text-white/30 text-sm py-8 text-center">Aucun projet trouvé dans cette catégorie.</p>}
      </Reorder.Group>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// LEADS TAB
// ──────────────────────────────────────────────────────────
function LeadsTab() {
  const qc = useQueryClient();
  const { data: leads = [] } = useListLeads();
  const deleteLead = useDeleteLead();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-white">Leads <span className="text-white/30 text-lg ml-2">({leads.length})</span></h2>
      </div>
      <div className="space-y-2">
        {leads.map((l) => (
          <div key={l.id} className="ga-card-dark p-4 hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-white font-medium">{l.firstName} {l.lastName}</div>
                <div className="text-[#8EA4AF] text-sm">{l.email} {l.phone && `· ${l.phone}`}</div>
                {l.projectInterest && <div className="text-white/50 text-sm mt-1">Intérêt: {l.projectInterest}</div>}
                {l.message && <div className="text-white/40 text-sm mt-2 max-w-2xl">{l.message}</div>}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-white/30 text-xs">{formatDate(l.createdAt)}</div>
                <ConfirmButton onConfirm={async () => {
                  await deleteLead.mutateAsync({ id: l.id });
                  qc.invalidateQueries({ queryKey: getListLeadsQueryKey() });
                }} />
              </div>
            </div>
          </div>
        ))}
        {leads.length === 0 && <p className="text-white/30 text-sm py-8 text-center">Aucun lead.</p>}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// ARTICLES TAB
// ──────────────────────────────────────────────────────────
function ArticlesTab() {
  const qc = useQueryClient();
  const { data: articles = [] } = useListArticles();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", coverImageUrl: "", category: "", metaTitle: "", metaDescription: "", published: false });

  function resetForm() {
    setForm({ title: "", slug: "", excerpt: "", content: "", coverImageUrl: "", category: "", metaTitle: "", metaDescription: "", published: false });
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(a: (typeof articles)[0]) {
    setForm({ title: a.title, slug: a.slug, excerpt: a.excerpt ?? "", content: a.content ?? "", coverImageUrl: a.coverImageUrl ?? "", category: a.category ?? "", metaTitle: a.metaTitle ?? "", metaDescription: a.metaDescription ?? "", published: a.published });
    setEditing(a.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, tags: [], publishedAt: form.published ? new Date().toISOString() : undefined };
    if (editing !== null) {
      await updateArticle.mutateAsync({ id: editing, data: payload });
    } else {
      await createArticle.mutateAsync({ data: payload });
    }
    qc.invalidateQueries({ queryKey: getListArticlesQueryKey() });
    resetForm();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-white">Articles <span className="text-white/30 text-lg ml-2">({articles.length})</span></h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="ga-btn btn-medium px-4 py-2">
          + Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="ga-admin-panel p-6 mb-6 space-y-4">
          <h3 className="text-white font-serif text-lg mb-4">{editing !== null ? "Modifier l'article" : "Nouvel article"}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Titre *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Slug *</label>
              <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Catégorie</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Image de couverture (URL)</label>
              <input value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Meta Title (SEO)</label>
              <input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Meta Description (SEO)</label>
              <input value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Extrait</label>
            <textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Contenu</label>
            <textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={inputClass} />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            <label htmlFor="published" className="text-white/70 text-sm">Publié</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="ga-btn btn-medium px-6 py-2">{editing !== null ? "Enregistrer" : "Créer"}</button>
            <button type="button" onClick={resetForm} className="ga-btn ga-btn-light px-4 py-2">Annuler</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {articles.map((a) => (
          <div key={a.id} className="ga-card-dark p-4 flex items-center justify-between hover:border-white/20 transition-colors">
            <div className="flex items-center gap-4">
              {a.coverImageUrl && <img src={a.coverImageUrl} alt="" className="w-16 h-12 object-cover opacity-70" />}
              <div>
                <div className="text-white font-medium">{a.title}</div>
                <div className="text-white/40 text-sm">{a.category}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge color={a.published ? "green" : "gray"}>{a.published ? "Publié" : "Brouillon"}</Badge>
              <div className="text-white/30 text-xs">{formatDate(a.createdAt)}</div>
              <button onClick={() => startEdit(a)} className="text-white/50 hover:text-white text-sm px-2 py-1 hover:bg-white/10 transition-colors">Modifier</button>
              <ConfirmButton onConfirm={async () => {
                await deleteArticle.mutateAsync({ id: a.id });
                qc.invalidateQueries({ queryKey: getListArticlesQueryKey() });
              }} />
            </div>
          </div>
        ))}
        {articles.length === 0 && <p className="text-white/30 text-sm py-8 text-center">Aucun article.</p>}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// CAREERS TAB
// ──────────────────────────────────────────────────────────
function CareersTab() {
  const qc = useQueryClient();
  const { data: careers = [] } = useListCareers();
  const createCareer = useCreateCareer();
  const updateCareer = useUpdateCareer();
  const deleteCareer = useDeleteCareer();
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", department: "", location: "", type: "full-time" as "full-time" | "part-time" | "internship" | "freelance", description: "", active: true });

  function resetForm() {
    setForm({ title: "", department: "", location: "", type: "full-time", description: "", active: true });
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(c: (typeof careers)[0]) {
    setForm({ title: c.title, department: c.department, location: c.location ?? "", type: (c.type as "full-time" | "part-time" | "internship" | "freelance") ?? "full-time", description: c.description ?? "", active: c.active });
    setEditing(c.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, requirements: [] };
    if (editing !== null) {
      await updateCareer.mutateAsync({ id: editing, data: payload });
    } else {
      await createCareer.mutateAsync({ data: payload });
    }
    qc.invalidateQueries({ queryKey: getListCareersQueryKey() });
    resetForm();
  }

  const typeLabel = (t: string) => ({ "full-time": "CDI", "part-time": "Temps partiel", internship: "Stage", freelance: "Freelance" }[t] ?? t);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-white">Offres d'emploi <span className="text-white/30 text-lg ml-2">({careers.length})</span></h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="ga-btn btn-medium px-4 py-2">
          + Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="ga-admin-panel p-6 mb-6 space-y-4">
          <h3 className="text-white font-serif text-lg mb-4">{editing !== null ? "Modifier l'offre" : "Nouvelle offre"}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Titre *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Département *</label>
              <input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ville</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "full-time" | "part-time" | "internship" | "freelance" })} className={inputClass}>
                <option value="full-time">CDI</option>
                <option value="part-time">Temps partiel</option>
                <option value="internship">Stage</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            <label htmlFor="active" className="text-white/70 text-sm">Offre active</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="ga-btn btn-medium px-6 py-2">{editing !== null ? "Enregistrer" : "Créer"}</button>
            <button type="button" onClick={resetForm} className="ga-btn ga-btn-light px-4 py-2">Annuler</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {careers.map((c) => (
          <div key={c.id} className="ga-card-dark p-4 flex items-center justify-between hover:border-white/20 transition-colors">
            <div>
              <div className="text-white font-medium">{c.title}</div>
              <div className="text-white/40 text-sm">{c.department} · {c.location}</div>
            </div>
            <div className="flex items-center gap-4">
              <Badge color="blue">{typeLabel(c.type)}</Badge>
              <Badge color={c.active ? "green" : "gray"}>{c.active ? "Active" : "Inactive"}</Badge>
              <div className="text-white/30 text-xs">{formatDate(c.createdAt)}</div>
              <button onClick={() => startEdit(c)} className="text-white/50 hover:text-white text-sm px-2 py-1 hover:bg-white/10 transition-colors">Modifier</button>
              <ConfirmButton onConfirm={async () => {
                await deleteCareer.mutateAsync({ id: c.id });
                qc.invalidateQueries({ queryKey: getListCareersQueryKey() });
              }} />
            </div>
          </div>
        ))}
        {careers.length === 0 && <p className="text-white/30 text-sm py-8 text-center">Aucune offre.</p>}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// APPLICATIONS TAB
// ──────────────────────────────────────────────────────────
function ApplicationsTab() {
  const { data: applications = [] } = useListApplications();
  const jobApplications = applications.filter((a: any) => (a.applicationType ?? "job") !== "spontaneous");
  const spontaneousApplications = applications.filter((a: any) => (a.applicationType ?? "job") === "spontaneous");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-white">Candidatures <span className="text-white/30 text-lg ml-2">({applications.length})</span></h2>
      </div>
      <div className="space-y-8">
        <section>
          <h3 className="text-white/75 text-xs tracking-[0.18em] uppercase mb-3">Candidatures sur offres ({jobApplications.length})</h3>
          <div className="space-y-2">
            {jobApplications.map((a: any) => (
              <div key={a.id} className="ga-card-dark p-4 hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-medium">{a.firstName} {a.lastName}</div>
                    <div className="text-[#8EA4AF] text-sm">{a.email} {a.phone && `· ${a.phone}`}</div>
                    {a.career && <div className="text-white/50 text-sm mt-1">Poste: {a.career.title}</div>}
                    {a.cvUrl && (
                      <a href={a.cvUrl} target="_blank" rel="noreferrer" className="text-[#8EA4AF] text-xs uppercase tracking-[0.12em] mt-2 inline-block hover:text-white transition-colors">
                        Télécharger le CV
                      </a>
                    )}
                    {a.message && <div className="text-white/40 text-sm mt-2 max-w-2xl">{a.message}</div>}
                  </div>
                  <div className="text-white/30 text-xs">{formatDate(a.createdAt)}</div>
                </div>
              </div>
            ))}
            {jobApplications.length === 0 && <p className="text-white/30 text-sm py-8 text-center">Aucune candidature sur offre.</p>}
          </div>
        </section>

        <section>
          <h3 className="text-white/75 text-xs tracking-[0.18em] uppercase mb-3">Candidatures spontanées ({spontaneousApplications.length})</h3>
          <div className="space-y-2">
            {spontaneousApplications.map((a: any) => (
              <div key={a.id} className="ga-card-dark p-4 hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-medium">{a.firstName} {a.lastName}</div>
                    <div className="text-[#8EA4AF] text-sm">{a.email} {a.phone && `· ${a.phone}`}</div>
                    {a.desiredPosition && <div className="text-white/55 text-sm mt-1">Domaine d’intérêt: {a.desiredPosition}</div>}
                    {a.cvUrl && (
                      <a href={a.cvUrl} target="_blank" rel="noreferrer" className="text-[#8EA4AF] text-xs uppercase tracking-[0.12em] mt-2 inline-block hover:text-white transition-colors">
                        Télécharger le CV
                      </a>
                    )}
                    {a.message && <div className="text-white/40 text-sm mt-2 max-w-2xl">{a.message}</div>}
                  </div>
                  <div className="text-white/30 text-xs">{formatDate(a.createdAt)}</div>
                </div>
              </div>
            ))}
            {spontaneousApplications.length === 0 && <p className="text-white/30 text-sm py-8 text-center">Aucune candidature spontanée.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// MAIN ADMIN PAGE
// ──────────────────────────────────────────────────────────
export default function Admin() {
  usePageSeo({
    title: "Admin | Groupe Acharaf",
    description: "Espace d’administration Groupe Acharaf.",
    path: "/admin",
    noIndex: true,
  });

  const [activeTab, setActiveTab] = useState<Tab>("projects");
  const [, navigate] = useLocation();

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="ga-admin-shell flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#082634]/96 border-r border-white/10 flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <img
            src="/logo.png"
            alt="Groupe Acharaf"
            className="h-7 w-auto object-contain mb-1.5"
          />
          <div className="text-white/30 text-[10px] tracking-widest uppercase">BACK-OFFICE</div>
        </div>
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`ga-admin-nav-item w-full text-left px-4 py-3 text-sm tracking-wide ${
                activeTab === item.id
                  ? "ga-admin-nav-item-active border-l-2 border-[#8EA4AF]"
                  : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-6 left-0 w-64 px-6">
          <a href="/" className="text-white/30 text-xs hover:text-white/60 transition-colors tracking-wide">
            &larr; Retour au site
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="bg-[#082634]/92 border-b border-white/10 px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-white/60 text-sm tracking-widest uppercase">{NAV_ITEMS.find((n) => n.id === activeTab)?.label}</h1>
            <button
              onClick={logout}
              className="text-white/55 hover:text-white text-xs tracking-[0.14em] uppercase border border-white/15 px-3 py-2 hover:border-white/30 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </header>
        <div className="p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "projects" && <ProjectsTab />}
            {activeTab === "leads" && <LeadsTab />}
            {activeTab === "articles" && <ArticlesTab />}
            {activeTab === "careers" && <CareersTab />}
            {activeTab === "applications" && <ApplicationsTab />}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
