import React, { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useParams, Link } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useGetProject, useCreateLead, getGetProjectQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import {
  MapPin, Ruler, Calendar, ChevronDown, ArrowRight, Phone,
  Shield, Trees, Car, Wifi, Star, Building2,
  Check, X, ZoomIn, ChevronLeft, ChevronRight,
} from "lucide-react";

import project1 from "@/assets/project-1.png";
import project2 from "@/assets/project-2.png";
import project3 from "@/assets/project-3.png";

const FB = [project1, project2, project3];
const EC = [0.22, 1, 0.36, 1] as const;

/* ── Helpers ────────────────────────────────────────────────── */
function formatPrice(n: number | null | undefined): string {
  if (!n) return "";
  return n.toLocaleString("fr-MA");
}

function statusLabel(s: string | null | undefined) {
  if (s === "ongoing") return "En cours";
  if (s === "completed") return "Livré";
  return "À venir";
}

function statusColor(s: string | null | undefined) {
  if (s === "ongoing") return "bg-emerald-500/10 text-emerald-700 border-emerald-500/25";
  if (s === "completed") return "bg-[#082634]/8 text-[#082634] border-[#082634]/15";
  return "bg-amber-500/10 text-amber-700 border-amber-500/20";
}

function segmentLabel(s: string | null | undefined) {
  if (s === "luxury") return "Villa / Résidence de luxe";
  return "Résidence premium";
}

function AmenityIcon({ label }: { label: string }) {
  const l = label.toLowerCase();
  if (l.includes("sécurité") || l.includes("securite") || l.includes("gardien") || l.includes("biométrique") || l.includes("surveillance"))
    return <Shield size={16} strokeWidth={1.4} />;
  if (l.includes("jardin") || l.includes("vert") || l.includes("arbre") || l.includes("parc") || l.includes("paysag"))
    return <Trees size={16} strokeWidth={1.4} />;
  if (l.includes("parking") || l.includes("garage") || l.includes("véhicule") || l.includes("recharge"))
    return <Car size={16} strokeWidth={1.4} />;
  if (l.includes("domotique") || l.includes("wifi") || l.includes("smart") || l.includes("lutron"))
    return <Wifi size={16} strokeWidth={1.4} />;
  if (l.includes("terrasse") || l.includes("rooftop") || l.includes("vue") || l.includes("panoram"))
    return <Star size={16} strokeWidth={1.4} />;
  if (l.includes("piscine") || l.includes("spa") || l.includes("hammam") || l.includes("fitness") || l.includes("lounge"))
    return <Building2 size={16} strokeWidth={1.4} />;
  return <Check size={16} strokeWidth={1.4} />;
}

/* ── Lightbox ───────────────────────────────────────────────── */
function Lightbox({
  images, index, onClose, onPrev, onNext,
}: {
  images: string[]; index: number;
  onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#080629]/96 backdrop-blur-lg z-50 flex items-center justify-center"
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

function LeadSection({ projectTitle }: { projectTitle: string }) {
  const createLead = useCreateLead();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LeadData>();
  const [sent, setSent] = useState(false);

  async function onSubmit(data: LeadData) {
    await createLead.mutateAsync({
      data: { ...data, subject: "Prise de rendez-vous", projectInterest: projectTitle },
    });
    setSent(true);
    reset();
  }

  const base = "w-full bg-white border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:outline-none focus:border-[#5C7480] transition-colors placeholder:text-[#8EA4AF] font-light";

  return (
    <section id="contact" className="py-28 bg-white relative overflow-hidden border-t border-[#DCE0E7]">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <p className="text-[#5C7480] text-xs tracking-[0.22em] uppercase mb-4">Contact direct</p>
          <h2 className="text-4xl md:text-5xl font-serif font-light text-[#082634] mb-5 leading-tight">
            Intéressé par<br />ce projet ?
          </h2>
          <p className="text-[#3B5661] font-light text-sm leading-relaxed max-w-sm mx-auto">
            Notre équipe vous recontacte dans les 24 heures pour organiser une visite ou répondre à toutes vos questions.
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input placeholder="Prénom *" {...register("firstName", { required: true })} className={base} />
                {errors.firstName && <span className="text-red-600 text-xs mt-1.5 block">Requis</span>}
              </div>
              <div>
                <input placeholder="Nom *" {...register("lastName", { required: true })} className={base} />
                {errors.lastName && <span className="text-red-600 text-xs mt-1.5 block">Requis</span>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input type="email" placeholder="Email *" {...register("email", { required: true })} className={base} />
                {errors.email && <span className="text-red-600 text-xs mt-1.5 block">Requis</span>}
              </div>
              <input placeholder="Téléphone" {...register("phone")} className={base} />
            </div>
            <textarea rows={4} placeholder="Votre message (optionnel)" {...register("message")} className={`${base} resize-none`} />

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={createLead.isPending}
                className="w-full max-w-sm flex items-center justify-center gap-3 bg-[#082634] text-white px-10 py-4 text-xs font-medium tracking-[0.15em] uppercase hover:bg-[#0a3245] transition-colors disabled:opacity-50"
              >
                {createLead.isPending ? "Envoi…" : "Prendre rendez-vous"}
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
            <p className="text-[#3B5661] font-light text-sm leading-relaxed">
              Notre équipe vous contactera dans les plus brefs délais.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main page
═══════════════════════════════════════════════════════════ */
export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = id ? Number(id) : 0;

  const { data: project, isLoading } = useGetProject(projectId, { query: { queryKey: getGetProjectQueryKey(projectId), enabled: !!projectId } });

  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImgY = useTransform(heroScroll, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);

  const cover = project?.coverImageUrl ?? FB[projectId % 3];
  const gallery = project?.images?.length ? project.images : [FB[0], FB[1], FB[2]];

  /* SEO */
  useEffect(() => {
    if (project) {
      document.title = `${project.title} | Immobilier à ${project.city ?? project.location} | Groupe Acharaf`;
    }
  }, [project]);

  /* Loading state */
  if (isLoading) {
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

  const priceLabel = project?.priceMin
    ? `À partir de ${formatPrice(project.priceMin)} DH`
    : null;

  const surfaceLabel = (project?.surfaceMin && project?.surfaceMax)
    ? `${project.surfaceMin} – ${project.surfaceMax} m²`
    : project?.surfaceMin
    ? `Dès ${project.surfaceMin} m²`
    : null;

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
          <img src={cover} alt={project?.title ?? "Projet"} className="w-full h-full object-cover" />
        </motion.div>

        {/* Overlays — cinematic, image stays vivid */}
        <div className="absolute inset-0 bg-black/15 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/22 via-transparent to-transparent z-[1]" />
        {/* Navbar scrim — top gradient so transparent header text stays legible */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent z-[1]" />

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
            <div className="flex items-center gap-3 mb-7">
              {project?.brand?.name && (
                <span className="px-4 py-1.5 bg-[#8EA4AF] text-[#082634] text-xs font-medium tracking-[0.15em] uppercase">
                  {project.brand.name}
                </span>
              )}
              {project?.status && (
                <span className={`px-4 py-1.5 border text-xs tracking-[0.15em] uppercase ${statusColor(project.status)}`}>
                  {statusLabel(project.status)}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light text-white mb-4 leading-none tracking-tight">
              {project?.title ?? "Projet d'exception"}
            </h1>

            {/* Tagline from brand */}
            {project?.brand?.tagline && (
              <p className="text-white/45 font-light text-base md:text-lg mb-3 max-w-lg italic font-serif">
                "{project.brand.tagline}"
              </p>
            )}

            {/* Location */}
            {project?.location && (
              <p className="text-white/40 font-light flex items-center gap-2 text-sm mb-10">
                <MapPin size={13} className="text-[#8EA4AF] opacity-70" />
                {project.location}{project.city ? `, ${project.city}` : ""}
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
                Découvrir le projet
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-white/65 hover:text-white/95 transition-colors duration-300 px-4 py-3 sm:ml-3"
              >
                <span className="relative">
                  Prendre rendez-vous
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
                <p className="text-[#5C7480] text-[10px] tracking-[0.18em] uppercase mb-1.5">Localisation</p>
                <p className="text-[#082634] font-light text-sm leading-snug">{project?.city ?? project?.location ?? "—"}</p>
              </div>
            </div>

            {/* Type */}
            <div className="flex items-start gap-4 px-6 lg:px-8 py-7">
              <Building2 size={16} className="text-[#8EA4AF] mt-0.5 shrink-0" strokeWidth={1.4} />
              <div className="min-w-0">
                <p className="text-[#5C7480] text-[10px] tracking-[0.18em] uppercase mb-1.5">Type</p>
                <p className="text-[#082634] font-light text-sm leading-snug">{segmentLabel(project?.brand?.segment)}</p>
              </div>
            </div>

            {/* Statut */}
            <div className="flex items-start gap-4 px-6 lg:px-8 py-7">
              <Calendar size={16} className="text-[#8EA4AF] mt-0.5 shrink-0" strokeWidth={1.4} />
              <div className="min-w-0">
                <p className="text-[#5C7480] text-[10px] tracking-[0.18em] uppercase mb-1.5">Statut</p>
                <p className="text-[#082634] font-light text-sm leading-snug">
                  {statusLabel(project?.status)}
                  {project?.deliveryDate && (
                    <span className="block text-[#5C7480] text-xs mt-0.5">{project.deliveryDate}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Surface */}
            <div className="flex items-start gap-4 px-6 lg:px-8 py-7">
              <Ruler size={16} className="text-[#8EA4AF] mt-0.5 shrink-0" strokeWidth={1.4} />
              <div className="min-w-0">
                <p className="text-[#5C7480] text-[10px] tracking-[0.18em] uppercase mb-1.5">Surfaces</p>
                <p className="text-[#082634] font-light text-sm leading-snug">{surfaceLabel ?? "Sur demande"}</p>
              </div>
            </div>

            {/* PRICE — dominant */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1 flex items-center gap-5 px-6 lg:px-8 py-7 bg-[#DCE0E7]/50">
              <div className="min-w-0 flex-1">
                <p className="text-[#5C7480] text-[10px] tracking-[0.2em] uppercase mb-2">Prix de départ</p>
                {priceLabel ? (
                  <p className="text-[#082634] font-serif text-2xl lg:text-3xl font-semibold leading-none tracking-tight">
                    {priceLabel}
                  </p>
                ) : (
                  <p className="text-[#5C7480] font-light text-sm">Prix sur demande</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          3 · PROJECT INTRODUCTION
      ════════════════════════════════════════════════════ */}
      {project?.description && (
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
                <p className="text-[#5C7480] text-xs tracking-[0.22em] uppercase mb-6">Le projet</p>
                <h2 className="text-3xl md:text-4xl font-serif font-light text-[#082634] mb-8 leading-tight">
                  {project.title}
                </h2>
                <p className="text-[#3B5661] font-light leading-[1.9] text-base mb-8">
                  {project.description}
                </p>
                {/* Micro-stats */}
                <div className="flex gap-8 pt-6 border-t border-[#DCE0E7]">
                  {project.city && (
                    <div>
                      <p className="text-[#5C7480] text-[10px] tracking-[0.18em] uppercase mb-1">Ville</p>
                      <p className="text-[#082634] font-light text-sm">{project.city}</p>
                    </div>
                  )}
                  {project.deliveryDate && (
                    <div>
                      <p className="text-[#5C7480] text-[10px] tracking-[0.18em] uppercase mb-1">Livraison</p>
                      <p className="text-[#082634] font-light text-sm">{project.deliveryDate}</p>
                    </div>
                  )}
                  {project.brand?.name && (
                    <div>
                      <p className="text-[#5C7480] text-[10px] tracking-[0.18em] uppercase mb-1">Marque</p>
                      <p className="text-[#082634] font-light text-sm">{project.brand.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Image */}
              <div className="relative overflow-hidden aspect-[4/3] bg-[#DCE0E7]/40 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                <motion.img
                  src={gallery[1] ?? cover}
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
      <section id="gallery" className="pb-28 bg-[#F7F7F7] pt-28">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EC }}
            className="mb-12"
          >
            <p className="text-[#5C7480] text-xs tracking-[0.22em] uppercase mb-4">Galerie</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-[#082634]">Visuels du projet</h2>
          </motion.div>

          {/* Main image */}
          <div
            className="relative overflow-hidden aspect-video mb-3 cursor-zoom-in group bg-[#DCE0E7]/50 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
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
            <div className="absolute inset-0 bg-transparent group-hover:bg-black/8 transition-colors duration-500" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 border border-[#082634]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm bg-white/75">
              <ZoomIn size={20} className="text-[#082634]" />
            </div>
            {gallery.length > 1 && (
              <div className="absolute bottom-5 right-5 px-3 py-1.5 bg-white/85 backdrop-blur-sm text-[#5C7480] text-xs tracking-[0.15em] uppercase border border-[#DCE0E7]">
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

      {/* ════════════════════════════════════════════════════
          5 · KEY FEATURES / AMENITIES
      ════════════════════════════════════════════════════ */}
      {project?.amenities && project.amenities.length > 0 && (
        <section className="py-28 bg-[#DCE0E7]">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EC }}
              className="mb-14"
            >
              <p className="text-[#3B5661] text-xs tracking-[0.22em] uppercase mb-4">Prestations</p>
              <h2 className="text-3xl md:text-4xl font-serif font-light text-[#082634]">Points forts du projet</h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {project.amenities.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.7, ease: EC }}
                  className="bg-white px-7 py-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-500 group"
                >
                  <div className="w-10 h-10 border border-[#8EA4AF]/30 flex items-center justify-center text-[#8EA4AF] group-hover:border-[#8EA4AF]/60 transition-all duration-500 mb-5">
                    <AmenityIcon label={item} />
                  </div>
                  <p className="text-[#3B5661] font-light text-sm leading-snug group-hover:text-[#082634] transition-colors duration-300">
                    {item}
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
            src={gallery[2] ?? gallery[0] ?? cover}
            alt=""
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10 z-[1]" />
        <div className="absolute inset-0 bg-black/15 z-[1]" />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: EC }}
          className="relative z-10 container mx-auto px-6 max-w-2xl"
        >
          <p className="text-[#8EA4AF] text-xs tracking-[0.25em] uppercase mb-6 opacity-80">Art de vivre</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white leading-tight mb-6">
            Un cadre de vie pensé<br />pour l'essentiel
          </h2>
          <p className="text-white/45 font-light leading-[1.9] text-base mb-10 max-w-lg">
            {project?.brand?.description ??
              "Chaque espace a été conçu pour offrir le meilleur équilibre entre confort, élégance et fonctionnalité — une vision de l'habitat qui transcende l'ordinaire."}
          </p>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/60 hover:text-white/90 transition-colors duration-300 border-b border-white/15 hover:border-white/35 pb-1"
          >
            Prendre rendez-vous
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════
          7 · LOCATION
      ════════════════════════════════════════════════════ */}
      {(project?.location || project?.city) && (
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
                <p className="text-[#5C7480] text-xs tracking-[0.22em] uppercase mb-6">Emplacement</p>
                <h2 className="text-3xl md:text-4xl font-serif font-light text-[#082634] mb-6 leading-tight">
                  {project.location}
                  {project.city ? `, ${project.city}` : ""}
                </h2>
                <p className="text-[#3B5661] font-light leading-[1.9] text-sm mb-10">
                  Un emplacement stratégique offrant un accès privilégié aux principaux axes de la ville,
                  aux établissements scolaires, aux centres commerciaux et aux zones d'activité.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    "Écoles à proximité",
                    "Accès autoroute rapide",
                    "Commerces & services",
                    "Transports en commun",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-[#8EA4AF] rounded-full shrink-0" />
                      <span className="text-[#3B5661] font-light text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map placeholder */}
              <div className="relative overflow-hidden aspect-[4/3] bg-[#DCE0E7]/50 border border-[#DCE0E7] flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <div className="text-center">
                  <MapPin size={28} className="text-[#8EA4AF] mx-auto mb-4" strokeWidth={1.2} />
                  <p className="text-[#5C7480] text-xs tracking-[0.18em] uppercase">
                    {project.city ?? project.location}
                  </p>
                  <p className="text-[#8EA4AF] text-[10px] tracking-[0.15em] uppercase mt-1">Carte interactive</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════
          8 · PRICE CTA BLOCK — Conversion trigger
      ════════════════════════════════════════════════════ */}
      {priceLabel && (
        <section className="py-24 bg-[#082634]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EC }}
            className="container mx-auto px-6 text-center"
          >
            <p className="text-[#8EA4AF] text-xs tracking-[0.22em] uppercase mb-5">Tarification</p>
            <p className="text-white/60 text-sm font-light uppercase tracking-[0.18em] mb-3">Prix de départ</p>
            <p className="text-5xl md:text-7xl font-serif font-light text-white tracking-tight mb-4">
              {formatPrice(project?.priceMin ?? 0)} DH
            </p>
            {project?.priceMax && project.priceMax !== project.priceMin && (
              <p className="text-white/50 font-light text-sm mb-8 tracking-wider">
                Jusqu'à {formatPrice(project.priceMax)} DH
              </p>
            )}
            <p className="text-white/50 text-xs font-light max-w-xs mx-auto leading-relaxed mb-10">
              Financement disponible. Contactez-nous pour connaître les conditions et disponibilités actuelles.
            </p>
            <div className="flex justify-center">
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-3 bg-white text-[#082634] px-12 py-4 text-xs font-medium tracking-[0.15em] uppercase hover:bg-[#DCE0E7] transition-colors"
              >
                Prendre rendez-vous <ArrowRight size={13} />
              </a>
            </div>
          </motion.div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════
          9 · LEAD FORM
      ════════════════════════════════════════════════════ */}
      <LeadSection projectTitle={project?.title ?? "ce projet"} />

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
