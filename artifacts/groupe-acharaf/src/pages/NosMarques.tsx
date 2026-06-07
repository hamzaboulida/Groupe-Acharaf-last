import React, { useState, useEffect, useRef, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "wouter";
import { useListProjects } from "@workspace/api-client-react";
import { projectPriceLabel } from "@/lib/project-display";
import { usePageSeo } from "@/lib/seo";
import { projectPath } from "@/lib/project-routing";
import { breadcrumbSchema, useStructuredData } from "@/lib/structured-data";

import estyaBg   from "@/assets/brand-estya.png";
import acharafBg from "@/assets/brand-acharaf-new.jpg";
import proj1 from "@/assets/project-1.png";
import proj2 from "@/assets/project-2.png";
import proj3 from "@/assets/project-3.png";

type Brand = "estya" | "acharaf";

const EC = [0.22, 1, 0.36, 1] as const;
const FALLBACK = [proj1, proj2, proj3];
const ACHARAF_PRIMARY = "#043235";
const ACHARAF_SECONDARY = "#88978D";
const ACHARAF_TERTIARY = "#C0C7C2";
const ESTYA_PRIMARY = "#181F39";
const ESTYA_SECONDARY = "#CCDCE1";
const ESTYA_TERTIARY = "#000000";

function getBrandFromUrl(): Brand | null {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  const b = p.get("brand");
  if (b === "estya" || b === "acharaf") return b;
  return null;
}

/* ─────────────────────────────────────── */
/*  Sub-components                         */
/* ─────────────────────────────────────── */

function ProjectCard({
  proj, index, brand,
}: {
  proj: { id: number; title: string; location?: string | null; coverImageUrl?: string | null; priceMin?: number | null; priceMax?: number | null; showPrice?: boolean | null };
  index: number;
  brand: Brand;
}) {
  const isEstya = brand === "estya";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: EC }}
      className="group"
    >
      <Link href={projectPath(proj)}>
        <div
          className="relative aspect-[4/3] overflow-hidden mb-4"
          style={{ backgroundColor: isEstya ? "rgba(204,220,225,0.12)" : "rgba(4,50,53,0.08)" }}
        >
          <motion.img
            src={proj.coverImageUrl ?? FALLBACK[index % 3]}
            alt={proj.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 1.1, ease: EC }}
          />
          <div
            className="absolute inset-0 transition-colors duration-700 group-hover:opacity-0"
            style={{ backgroundColor: isEstya ? "rgba(24,31,57,0.22)" : "rgba(192,199,194,0.22)" }}
          />
        </div>
        <h3
          className="font-serif text-lg font-light mb-1 transition-colors duration-500"
          style={{ color: isEstya ? "#FFFFFF" : ACHARAF_PRIMARY }}
        >
          {proj.title}
        </h3>
        <p
          className="text-[11px] tracking-[0.14em] uppercase"
          style={{ color: isEstya ? "rgba(204,220,225,0.72)" : ACHARAF_SECONDARY }}
        >
          {proj.location}
        </p>
        <p
          className="text-sm font-serif font-light mt-2"
          style={{ color: isEstya ? "rgba(204,220,225,0.92)" : ACHARAF_PRIMARY }}
        >
          {projectPriceLabel(proj)}
        </p>
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────── */
/*  Estya expanded content                 */
/* ─────────────────────────────────────── */

type BrandPreviewProject = { id: number; title: string; location?: string | null; coverImageUrl?: string | null; priceMin?: number | null; priceMax?: number | null; showPrice?: boolean | null };

function EstyaContent({ projects }: { projects?: BrandPreviewProject[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.85, ease: EC }}
    >
      {/* Brand Story */}
      <section style={{ backgroundColor: ESTYA_PRIMARY }} className="py-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: EC }}
            >
              <p className="text-[9px] tracking-[0.35em] uppercase mb-8" style={{ color: "rgba(204,220,225,0.72)" }}>L'univers Estya</p>
              <h2 className="text-4xl md:text-5xl font-light text-white leading-[1.1] mb-8">
                L'art de vivre<br />à son apogée
              </h2>
              <div className="h-px w-12 mb-8" style={{ backgroundColor: "rgba(204,220,225,0.3)" }} />
              <p className="text-white/70 font-light leading-relaxed text-[15px] mb-5">
                ESTYA incarne la vision résidentielle moyen et haut standing du Groupe Acharaf. La marque développe des projets conçus avec une attention particulière portée à l’architecture, à la qualité des finitions et à l’expérience de vie des résidents. Pensés dans une logique d’élégance, de confort et de durabilité.
              </p>
              <p className="text-white/55 font-light leading-relaxed text-sm mb-10">
                Les projets ESTYA s’adressent à une clientèle à la recherche d’un cadre de vie moderne, cohérent et valorisant.
              </p>
              <Link
                href="/nos-projets?brand=1"
                className="group inline-flex items-center gap-3 px-7 py-4 border text-white transition-all duration-500 text-[11px] tracking-[0.18em] uppercase"
                style={{ borderColor: "rgba(204,220,225,0.35)", color: "rgba(204,220,225,0.95)" }}
              >
                Découvrir les projets Estya
                <ArrowRight size={12} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.2, ease: EC }}
              className="relative aspect-[4/5] overflow-hidden"
            >
              <img src={estyaBg} alt="Estya" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#082634]/60 via-transparent to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section style={{ backgroundColor: ESTYA_PRIMARY, borderTopColor: "rgba(204,220,225,0.18)" }} className="border-t py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-[9px] tracking-[0.28em] uppercase mb-10"
              style={{ color: "rgba(204,220,225,0.72)" }}
            >
              Projets phares · Estya
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projects.slice(0, 3).map((proj, i) => (
                <ProjectCard key={proj.id} proj={proj} index={i} brand="estya" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA — white closing section for clean footer transition */}
      <section style={{ backgroundColor: ESTYA_SECONDARY, borderTopColor: "rgba(24,31,57,0.2)" }} className="border-t py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p style={{ color: ESTYA_PRIMARY }} className="font-light text-lg font-serif mb-1">Prêt à entrer dans l'univers Estya&nbsp;?</p>
              <p style={{ color: ESTYA_TERTIARY }} className="text-sm font-light">Nos conseillers vous accompagnent dans votre acquisition confidentielle.</p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link href="/nos-projets?brand=1" style={{ backgroundColor: ESTYA_PRIMARY }} className="group inline-flex items-center gap-2 px-6 py-3.5 text-white text-[11px] tracking-[0.18em] uppercase font-medium transition-colors duration-300">
                Voir les projets
                <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link href="/contact" style={{ borderColor: "rgba(24,31,57,0.32)", color: ESTYA_PRIMARY }} className="group inline-flex items-center gap-2 px-6 py-3.5 border text-[11px] tracking-[0.18em] uppercase transition-all duration-300">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

/* ─────────────────────────────────────── */
/*  Acharaf expanded content               */
/* ─────────────────────────────────────── */

function AcharafContent({ projects }: { projects?: BrandPreviewProject[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.85, ease: EC }}
    >
      {/* Brand Story */}
      <section style={{ backgroundColor: ACHARAF_TERTIARY }} className="py-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.2, ease: EC }}
              className="relative aspect-[4/5] overflow-hidden order-2 lg:order-1"
            >
              <img src={acharafBg} alt="Acharaf Immobilier" className="w-full h-full object-cover brightness-95" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#043235]/25 via-transparent to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: EC }}
              className="order-1 lg:order-2"
            >
              <p className="text-[9px] tracking-[0.35em] uppercase mb-8" style={{ color: ACHARAF_SECONDARY }}>L'univers Acharaf</p>
              <h2 className="text-4xl md:text-5xl font-serif font-light leading-[1.1] mb-8" style={{ color: ACHARAF_PRIMARY }}>
                L'excellence<br />accessible
              </h2>
              <div className="h-px w-12 mb-8" style={{ backgroundColor: "rgba(4,50,53,0.22)" }} />
              <p className="font-light leading-relaxed text-[15px] mb-5" style={{ color: ACHARAF_PRIMARY }}>
                Acharaf Immobilier porte le développement de projets résidentiels accessibles et fonctionnels, pensés pour répondre aux attentes réelles des acquéreurs et aux dynamiques des marchés locaux. À travers une approche fondée sur la maîtrise des coûts, la qualité de réalisation et la pertinence des emplacements.
              </p>
              <p className="font-light leading-relaxed text-sm mb-10" style={{ color: ACHARAF_PRIMARY }}>
                La marque développe des projets offrant un équilibre durable entre accessibilité, confort et valeur d’usage.
              </p>
              <Link
                href="/nos-projets?brand=2"
                style={{ borderColor: "rgba(4,50,53,0.3)", color: ACHARAF_PRIMARY }}
                className="group inline-flex items-center gap-3 px-7 py-4 border transition-all duration-500 text-[11px] tracking-[0.18em] uppercase"
              >
                Découvrir les projets Acharaf
                <ArrowRight size={12} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section style={{ backgroundColor: ACHARAF_TERTIARY, borderTopColor: "rgba(4,50,53,0.12)" }} className="border-t py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-[9px] tracking-[0.28em] uppercase mb-10"
              style={{ color: ACHARAF_SECONDARY }}
            >
              Projets phares · Acharaf Immobilier
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projects.slice(0, 3).map((proj, i) => (
                <ProjectCard key={proj.id} proj={proj} index={i} brand="acharaf" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ backgroundColor: ACHARAF_TERTIARY, borderTopColor: "rgba(4,50,53,0.12)" }} className="border-t py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="font-light text-lg font-serif mb-1" style={{ color: ACHARAF_PRIMARY }}>Prêt à découvrir Acharaf Immobilier&nbsp;?</p>
              <p className="text-sm font-light" style={{ color: ACHARAF_PRIMARY }}>Nos équipes sont à votre disposition pour vous guider.</p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link href="/nos-projets?brand=2" style={{ backgroundColor: ACHARAF_PRIMARY }} className="group inline-flex items-center gap-2 px-6 py-3.5 text-white text-[11px] tracking-[0.18em] uppercase transition-colors duration-300">
                Voir les projets
                <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link href="/contact" style={{ borderColor: "rgba(4,50,53,0.3)", color: ACHARAF_PRIMARY }} className="group inline-flex items-center gap-2 px-6 py-3.5 border text-[11px] tracking-[0.18em] uppercase transition-all duration-300">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

/* ─────────────────────────────────────── */
/*  Main page                              */
/* ─────────────────────────────────────── */

export default function NosMarques() {
  usePageSeo({
    title: "Nos Marques | Groupe Acharaf",
    description:
      "Explorez les univers Estya et Acharaf Immobilier, deux signatures complémentaires du Groupe Acharaf.",
    path: "/nos-marques",
  });
  useStructuredData(
    "ga-breadcrumb-marques",
    breadcrumbSchema([
      { name: "Accueil", path: "/" },
      { name: "Nos Marques", path: "/nos-marques" },
    ]),
  );

  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(getBrandFromUrl);
  const [hoveredBrand, setHoveredBrand]   = useState<Brand | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: rawEstyaProjects }   = useListProjects({ brandId: 1 });
  const { data: rawAcharafProjects } = useListProjects({ brandId: 2 });

  const estyaProjects = useMemo(() => {
    return rawEstyaProjects?.filter((p) => p.displayType === "estya") ?? [];
  }, [rawEstyaProjects]);

  const acharafProjects = useMemo(() => {
    return rawAcharafProjects?.filter((p) => p.displayType === "acharaf") ?? [];
  }, [rawAcharafProjects]);

  const selectBrand = useCallback((brand: Brand) => {
    if (selectedBrand === brand) return;
    setSelectedBrand(brand);
    const url = new URL(window.location.href);
    url.searchParams.set("brand", brand);
    window.history.pushState({ brand }, "", url.toString());
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  }, [selectedBrand]);

  useEffect(() => {
    const handlePop = () => setSelectedBrand(getBrandFromUrl());
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const estyaActive   = selectedBrand === "estya";
  const acharafActive = selectedBrand === "acharaf";

  return (
    <Layout hideFooter={!selectedBrand}>

      {/* ════════════════════════════════════════
          BRAND CHOOSER — Full viewport split
      ════════════════════════════════════════ */}
      <div className="relative flex flex-col md:flex-row h-auto md:h-screen overflow-hidden">

        {/* ── ESTYA SIDE ── */}
        <motion.div
          className="relative overflow-hidden cursor-pointer select-none min-h-[55vh] md:min-h-full"
          style={{ flex: 1 }}
          animate={{
            flex: acharafActive ? "0 0 38%" : estyaActive ? "0 0 62%" : hoveredBrand === "estya" ? "0 0 62%" : hoveredBrand === "acharaf" ? "0 0 38%" : "0 0 50%",
          }}
          transition={{ duration: 0.9, ease: EC }}
          onClick={() => selectBrand("estya")}
          onHoverStart={() => setHoveredBrand("estya")}
          onHoverEnd={() => setHoveredBrand(null)}
        >
          {/* Background */}
          <motion.div
            className="absolute inset-0 scale-[1.1]"
            animate={{ scale: (hoveredBrand === "estya" || estyaActive) ? 1.08 : 1.05 }}
            transition={{ duration: 1.4, ease: EC }}
          >
            <img src={estyaBg} alt="Estya" className="w-full h-full object-cover" />
          </motion.div>

          {/* Base dark overlay */}
          <div className="absolute inset-0 bg-[#082634]/82" />
          {/* Content-side gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#082634]/40 via-[#082634]/15 to-transparent" />

          {/* Dimming when acharaf active */}
          <motion.div
            className="absolute inset-0 bg-[#082634] pointer-events-none"
            animate={{ opacity: (acharafActive || hoveredBrand === "acharaf") ? 0.35 : 0 }}
            transition={{ duration: 0.7, ease: EC }}
          />

          {/* Active bottom border */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8EA4AF] origin-left"
            animate={{ scaleX: estyaActive ? 1 : 0 }}
            transition={{ duration: 0.8, ease: EC }}
          />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center px-9 md:px-12 xl:px-20 py-16" style={{ textShadow: "0 2px 18px rgba(8,38,52,0.55)" }}>
            <div className="overflow-hidden mb-2">
              <motion.h2
                className="text-[4.5rem] sm:text-[6rem] md:text-[5rem] lg:text-[7rem] xl:text-[9rem] font-serif font-light text-white leading-none"
                style={{ letterSpacing: "-0.025em" }}
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.3, delay: 0.1, ease: EC }}
              >
                Estya
              </motion.h2>
            </div>

            <motion.div
              className="h-px bg-[#8EA4AF]/25 mt-6 mb-7 origin-left"
              animate={{
                width: 40,
                opacity: (acharafActive || hoveredBrand === "acharaf") ? 0.25 : hoveredBrand === "estya" ? 1 : 0.8,
              }}
              initial={{ width: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            />

            <motion.p
              className="text-white/95 font-normal text-sm max-w-xs leading-relaxed mb-8"
              animate={{ opacity: (acharafActive || hoveredBrand === "acharaf") ? 0.2 : hoveredBrand === "estya" ? 1 : 0.9 }}
              transition={{ duration: 0.7 }}
            >
              Des adresses où architecture, distinction et qualité d’exécution se rencontrent. 
            </motion.p>

            {/* Selection state */}
            <motion.div
              animate={{ opacity: (acharafActive || hoveredBrand === "acharaf") ? 0.2 : 1 }}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-2.5 text-[10px] tracking-[0.2em] uppercase"
            >
              {estyaActive ? (
                <>
                  <span className="w-4 h-4 rounded-full border border-[#8EA4AF] flex items-center justify-center flex-shrink-0">
                    <Check size={8} className="text-[#8EA4AF]" />
                  </span>
                  <span className="text-[#8EA4AF]">Univers sélectionné</span>
                </>
              ) : (
                <motion.span
                  className="text-white/85 flex items-center gap-2"
                  animate={{ x: hoveredBrand === "estya" ? 4 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Choisir cet univers
                  <ArrowRight size={10} />
                </motion.span>
              )}
            </motion.div>

          </div>
        </motion.div>

        {/* ── VERTICAL DIVIDER ── */}
        <div className="hidden md:block relative z-20 w-px flex-shrink-0">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: selectedBrand
                ? "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06), transparent)"
                : "linear-gradient(to bottom, transparent, rgba(255,255,255,0.12), transparent)",
            }}
            transition={{ duration: 0.7 }}
          />
        </div>

        {/* ── ACHARAF SIDE ── */}
        <motion.div
          className="relative overflow-hidden cursor-pointer select-none min-h-[55vh] md:min-h-full"
          style={{ flex: 1 }}
          animate={{
            flex: estyaActive ? "0 0 38%" : acharafActive ? "0 0 62%" : hoveredBrand === "acharaf" ? "0 0 62%" : hoveredBrand === "estya" ? "0 0 38%" : "0 0 50%",
          }}
          transition={{ duration: 0.9, ease: EC }}
          onClick={() => selectBrand("acharaf")}
          onHoverStart={() => setHoveredBrand("acharaf")}
          onHoverEnd={() => setHoveredBrand(null)}
        >
          {/* Background */}
          <motion.div
            className="absolute inset-0 scale-[1.1]"
            animate={{ scale: (hoveredBrand === "acharaf" || acharafActive) ? 1.08 : 1.05 }}
            transition={{ duration: 1.4, ease: EC }}
          >
            <img src={acharafBg} alt="Acharaf Immobilier" className="w-full h-full object-cover brightness-90" />
          </motion.div>

          {/* Light overlay — strengthened for text readability */}
          <div className="absolute inset-0 bg-white/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/55 via-white/25 to-transparent" />

          {/* Dimming when estya active */}
          <motion.div
            className="absolute inset-0 bg-[#DCE0E7] pointer-events-none"
            animate={{ opacity: (estyaActive || hoveredBrand === "estya") ? 0.4 : 0 }}
            transition={{ duration: 0.7, ease: EC }}
          />

          {/* Active bottom border */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#082634] origin-left"
            animate={{ scaleX: acharafActive ? 1 : 0 }}
            transition={{ duration: 0.8, ease: EC }}
          />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center px-9 md:px-12 xl:px-20 py-16">
            <div className="overflow-hidden mb-2">
              <motion.div
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.3, delay: 0.15, ease: EC }}
              >
                <h2
                  className="text-[3.5rem] sm:text-[4.5rem] md:text-[4rem] lg:text-[5.5rem] xl:text-[7rem] font-serif font-light text-[#082634] leading-none"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Acharaf
                </h2>
                <p className="text-xl md:text-2xl xl:text-3xl font-serif font-light text-[#082634] tracking-tight">
                  Immobilier
                </p>
              </motion.div>
            </div>

            <motion.div
              className="h-px bg-[#082634]/18 mt-5 mb-7 origin-left"
              animate={{
                width: 40,
                opacity: (estyaActive || hoveredBrand === "estya") ? 0.2 : hoveredBrand === "acharaf" ? 1 : 0.9,
              }}
              initial={{ width: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            />

            <motion.p
              className="text-[#082634]/90 font-normal text-sm max-w-xs leading-relaxed mb-8"
              animate={{ opacity: (estyaActive || hoveredBrand === "estya") ? 0.2 : hoveredBrand === "acharaf" ? 1 : 0.9 }}
              transition={{ duration: 0.7 }}
            >
              Une approche résidentielle pensée pour concilier confort, fonctionnalité et accessibilité.
            </motion.p>

            {/* Selection state */}
            <motion.div
              animate={{ opacity: (estyaActive || hoveredBrand === "estya") ? 0.15 : 1 }}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-2.5 text-[10px] tracking-[0.2em] uppercase"
            >
              {acharafActive ? (
                <>
                  <span className="w-4 h-4 rounded-full border border-[#082634]/50 flex items-center justify-center flex-shrink-0">
                    <Check size={8} className="text-[#082634]" />
                  </span>
                  <span className="text-[#082634]/70">Univers sélectionné</span>
                </>
              ) : (
                <motion.span
                  className="text-[#082634]/85 flex items-center gap-2"
                  animate={{ x: hoveredBrand === "acharaf" ? 4 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Choisir cet univers
                  <ArrowRight size={10} />
                </motion.span>
              )}
            </motion.div>

          </div>
        </motion.div>


        {/* Brand switcher bar — visible when a brand is selected, positioned absolutely at left center */}
        <AnimatePresence>
          {selectedBrand && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.5, ease: EC }}
              className="absolute left-1/2 -translate-x-1/2 bottom-6 z-30 hidden md:flex items-center gap-1 bg-[#082634]/30 backdrop-blur-md border border-white/10 px-1 py-1"
            >
              <button
                onClick={(e) => { e.stopPropagation(); selectBrand("estya"); }}
                className={`px-5 py-2 text-[10px] tracking-[0.18em] uppercase transition-all duration-400 ${
                  estyaActive
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:text-white"
                }`}
              >
                Estya
              </button>
              <div className="w-px h-4 bg-white/15" />
              <button
                onClick={(e) => { e.stopPropagation(); selectBrand("acharaf"); }}
                className={`px-5 py-2 text-[10px] tracking-[0.18em] uppercase transition-all duration-400 ${
                  acharafActive
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:text-white"
                }`}
              >
                Acharaf
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ════════════════════════════════════════
          BRAND CONTENT — Expands below chooser
      ════════════════════════════════════════ */}
      <div ref={contentRef} className={selectedBrand ? "bg-white" : ""}>
        <AnimatePresence mode="wait">
          {estyaActive && (
            <EstyaContent key="estya" projects={estyaProjects ?? []} />
          )}
          {acharafActive && (
            <AcharafContent key="acharaf" projects={acharafProjects ?? []} />
          )}
        </AnimatePresence>
      </div>

    </Layout>
  );
}
