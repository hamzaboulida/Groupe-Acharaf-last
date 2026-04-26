import React, { useState, useEffect, useRef, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "wouter";
import { useListProjects } from "@workspace/api-client-react";

import estyaBg   from "@/assets/brand-estya.png";
import acharafBg from "@/assets/brand-acharaf.png";
import proj1 from "@/assets/project-1.png";
import proj2 from "@/assets/project-2.png";
import proj3 from "@/assets/project-3.png";

type Brand = "estya" | "acharaf";

const EC = [0.22, 1, 0.36, 1] as const;
const FALLBACK = [proj1, proj2, proj3];

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
  proj, index, dark,
}: {
  proj: { id: number; title: string; location?: string | null; coverImageUrl?: string | null };
  index: number;
  dark: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: EC }}
      className="group"
    >
      <Link href={`/nos-projets/${proj.id}`}>
        <div className={`relative aspect-[4/3] overflow-hidden mb-4 ${dark ? "bg-[#8EA4AF]/8" : "bg-[#082634]/8"}`}>
          <motion.img
            src={proj.coverImageUrl ?? FALLBACK[index % 3]}
            alt={proj.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 1.1, ease: EC }}
          />
          <div className={`absolute inset-0 transition-colors duration-700 group-hover:opacity-0 ${dark ? "bg-[#080629]/25" : "bg-[#DCE0E7]/15"}`} />
        </div>
        <h3 className={`font-serif text-lg font-light mb-1 transition-colors duration-500 ${dark ? "text-white group-hover:text-[#8EA4AF]" : "text-[#082634] group-hover:text-[#082634]"}`}>
          {proj.title}
        </h3>
        <p className={`text-[11px] tracking-[0.14em] uppercase ${dark ? "text-white/55" : "text-[#5C7480]"}`}>
          {proj.location}
        </p>
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────── */
/*  Estya expanded content                 */
/* ─────────────────────────────────────── */

function EstyaContent({ projects }: { projects?: Array<{ id: number; title: string; location?: string | null; coverImageUrl?: string | null }> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.85, ease: EC }}
    >
      {/* Brand Story */}
      <section className="bg-[#080629] py-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.2, ease: EC }}
              className="relative aspect-[4/5] overflow-hidden order-first lg:order-last"
            >
              <img src={estyaBg} alt="Estya" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080629]/60 via-transparent to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: EC }}
              className="order-last lg:order-first"
            >
              <p className="text-[#8EA4AF]/75 text-[9px] tracking-[0.35em] uppercase mb-8">L'univers Estya</p>
              <h2 className="text-4xl md:text-5xl font-serif font-light text-white leading-[1.1] mb-8">
                L'art de vivre<br />à son apogée
              </h2>
              <div className="h-px w-12 bg-[#8EA4AF]/20 mb-8" />
              <p className="text-white/70 font-light leading-relaxed text-[15px] mb-5">
                La quintessence du luxe immobilier marocain. Des adresses confidentielles, des volumes majestueux, des matériaux nobles choisis aux quatre coins du monde.
              </p>
              <p className="text-white/55 font-light leading-relaxed text-sm mb-10">
                Chaque résidence Estya est une œuvre architecturale unique — conçue en nombre limité, pour une clientèle internationale qui n'attend que ce qui ne peut être répété.
              </p>
              <Link
                href="/nos-projets?brand=1"
                className="group inline-flex items-center gap-3 px-7 py-4 border border-white/25 text-white/80 hover:border-[#8EA4AF]/60 hover:text-white transition-all duration-500 text-[11px] tracking-[0.18em] uppercase"
              >
                Découvrir les projets Estya
                <ArrowRight size={12} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="bg-[#080629] border-t border-white/5 py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-[#8EA4AF]/70 text-[9px] tracking-[0.28em] uppercase mb-10"
            >
              Projets phares · Estya
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projects.slice(0, 3).map((proj, i) => (
                <ProjectCard key={proj.id} proj={proj} index={i} dark />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA — white closing section for clean footer transition */}
      <section className="bg-white border-t border-[#8EA4AF]/18 py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-[#082634] font-light text-lg font-serif mb-1">Prêt à entrer dans l'univers Estya&nbsp;?</p>
              <p className="text-[#3B5661] text-sm font-light">Nos conseillers vous accompagnent dans votre acquisition confidentielle.</p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link href="/nos-projets?brand=1" className="group inline-flex items-center gap-2 px-6 py-3.5 bg-[#082634] text-white text-[11px] tracking-[0.18em] uppercase font-medium hover:bg-[#0a3548] transition-colors duration-300">
                Voir les projets
                <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link href="/contact" className="group inline-flex items-center gap-2 px-6 py-3.5 border border-[#082634]/25 text-[#3B5661] text-[11px] tracking-[0.18em] uppercase hover:border-[#082634]/50 hover:text-[#082634] transition-all duration-300">
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

function AcharafContent({ projects }: { projects?: Array<{ id: number; title: string; location?: string | null; coverImageUrl?: string | null }> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.85, ease: EC }}
    >
      {/* Brand Story */}
      <section className="bg-white py-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.2, ease: EC }}
              className="relative aspect-[4/5] overflow-hidden order-first lg:order-last"
            >
              <img src={acharafBg} alt="Acharaf Immobilier" className="w-full h-full object-cover brightness-95" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: EC }}
              className="order-last lg:order-first"
            >
              <p className="text-[#5C7480] text-[9px] tracking-[0.35em] uppercase mb-8">L'univers Acharaf</p>
              <h2 className="text-4xl md:text-5xl font-serif font-light text-[#082634] leading-[1.1] mb-8">
                L'excellence<br />accessible
              </h2>
              <div className="h-px w-12 bg-[#082634]/15 mb-8" />
              <p className="text-[#3B5661] font-light leading-relaxed text-[15px] mb-5">
                Des projets résidentiels pensés pour le bien-être des familles. Espaces verts, architecture contemporaine et matériaux durables pour une vie épanouie.
              </p>
              <p className="text-[#3B5661] font-light leading-relaxed text-sm mb-10">
                Acharaf Immobilier incarne l'excellence accessible&nbsp;: une qualité de vie premium, sans compromis sur l'authenticité ni sur le confort du quotidien.
              </p>
              <Link
                href="/nos-projets?brand=2"
                className="group inline-flex items-center gap-3 px-7 py-4 border border-[#082634]/25 text-[#3B5661] hover:border-[#082634]/50 hover:text-[#082634] transition-all duration-500 text-[11px] tracking-[0.18em] uppercase"
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
        <section className="bg-white border-t border-[#082634]/6 py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-[#5C7480] text-[9px] tracking-[0.28em] uppercase mb-10"
            >
              Projets phares · Acharaf Immobilier
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projects.slice(0, 3).map((proj, i) => (
                <ProjectCard key={proj.id} proj={proj} index={i} dark={false} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-white border-t border-[#082634]/6 py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-[#082634]/60 font-light text-lg font-serif mb-1">Prêt à découvrir Acharaf Immobilier&nbsp;?</p>
              <p className="text-[#3B5661] text-sm font-light">Nos équipes sont à votre disposition pour vous guider.</p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link href="/nos-projets?brand=2" className="group inline-flex items-center gap-2 px-6 py-3.5 bg-[#082634] text-white text-[11px] tracking-[0.18em] uppercase hover:bg-[#082634]/85 transition-colors duration-300">
                Voir les projets
                <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link href="/contact" className="group inline-flex items-center gap-2 px-6 py-3.5 border border-[#082634]/25 text-[#3B5661] text-[11px] tracking-[0.18em] uppercase hover:border-[#082634]/50 hover:text-[#082634] transition-all duration-300">
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
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(getBrandFromUrl);
  const [hoveredBrand, setHoveredBrand]   = useState<Brand | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: estyaProjects }   = useListProjects({ brandId: 1 });
  const { data: acharafProjects } = useListProjects({ brandId: 2 });

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
          <div className="absolute inset-0 bg-[#080629]/82" />
          {/* Content-side gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent" />

          {/* Dimming when acharaf active */}
          <motion.div
            className="absolute inset-0 bg-black pointer-events-none"
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
          <div className="relative z-10 h-full flex flex-col justify-center px-9 md:px-12 xl:px-20 py-16" style={{ textShadow: "0 2px 18px rgba(0,0,0,0.55)" }}>
            <motion.p
              className="text-white/75 text-[9px] tracking-[0.35em] uppercase mb-7"
              animate={{ opacity: (acharafActive || hoveredBrand === "acharaf") ? 0.25 : hoveredBrand === "estya" ? 1 : 0.8 }}
              transition={{ duration: 0.7 }}
            >
              Ultra-Luxe · Confidentiel
            </motion.p>

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
              La quintessence du luxe immobilier marocain. Des adresses confidentielles, des volumes majestueux.
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

            {/* Price */}
            <motion.div
              className="absolute bottom-8 right-8 text-right"
              animate={{ opacity: (acharafActive || hoveredBrand === "acharaf") ? 0.15 : hoveredBrand === "estya" ? 0.75 : 0.6 }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-white/60 text-[9px] tracking-[0.22em] uppercase mb-1">À partir de</p>
              <p className="text-white font-serif text-2xl font-light opacity-85">5 M MAD</p>
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
            <motion.p
              className="text-[#082634]/80 text-[9px] tracking-[0.35em] uppercase mb-7"
              animate={{ opacity: (estyaActive || hoveredBrand === "estya") ? 0.2 : hoveredBrand === "acharaf" ? 1 : 0.85 }}
              transition={{ duration: 0.7 }}
            >
              Premium · Accessible
            </motion.p>

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
                <p className="text-xl md:text-2xl xl:text-3xl font-serif font-light text-[#3B5661] tracking-tight">
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
              Des projets résidentiels pensés pour le bien-être des familles, alliant qualité et accessibilité.
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

            {/* Price */}
            <motion.div
              className="absolute bottom-8 right-8 text-right"
              animate={{ opacity: (estyaActive || hoveredBrand === "estya") ? 0.15 : hoveredBrand === "acharaf" ? 0.8 : 0.65 }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-[#082634]/65 text-[9px] tracking-[0.22em] uppercase mb-1">À partir de</p>
              <p className="text-[#082634] font-serif text-2xl font-light opacity-90">1,2 M MAD</p>
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
              className="absolute left-1/2 -translate-x-1/2 bottom-6 z-30 hidden md:flex items-center gap-1 bg-black/30 backdrop-blur-md border border-white/10 px-1 py-1"
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
