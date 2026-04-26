import React, { useRef, useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import {
  motion, useScroll, useTransform,
  AnimatePresence, useInView,
} from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight, ChevronRight,
  PenTool, Building2, Wrench, Users, Quote,
} from "lucide-react";
import { useGetStats, useListProjects } from "@workspace/api-client-react";
import { CountUp } from "@/components/ui/count-up";

import brandEstya   from "@/assets/brand-estya.png";
import brandAcharaf from "@/assets/brand-acharaf.png";

/* ─────────────── Hero slides — night luxury visuals ─────────────── */
const SLIDES = [
  {
    /* Luxury wood & glass house at night — blue sky, warm amber glow */
    src: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1920&q=90",
    zoomDir: "in",
  },
  {
    /* Elegant courtyard villa at twilight — warm accent lighting */
    src: "https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?w=1920&q=90",
    zoomDir: "out",
  },
  {
    /* Luxury pool at dusk — fire feature, golden reflections in water */
    src: "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=1920&q=90",
    zoomDir: "in",
  },
  {
    /* Mediterranean white villa — blue-hour pool, cinematic atmosphere */
    src: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1920&q=90",
    zoomDir: "out",
  },
  {
    /* Contemporary dark-wood house at dusk — deep blue sky, warm interior */
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=90",
    zoomDir: "in",
  },
];
const SLIDE_DURATION = 6000;
const TRANSITION_S   = 1.4;
const ZOOM_S         = 7;

/* Cinematic ease — used everywhere */
const EC = [0.22, 1, 0.36, 1] as const;

/*
  Global fade preset — slow, smooth, starts BEFORE section reaches center
  margin: "-40px" means animation fires when element is 40px past the bottom edge
*/
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 1.4, delay, ease: EC },
});

/* ─────────────── Data ─────────────── */
const PILLARS = [
  {
    num: "01",
    icon: <PenTool size={22} strokeWidth={1.2} />,
    title: "Conception architecturale",
    desc: "Des plans pensés par les meilleurs architectes, où esthétique et fonctionnalité coexistent en harmonie.",
  },
  {
    num: "02",
    icon: <Building2 size={22} strokeWidth={1.2} />,
    title: "Développement immobilier",
    desc: "Une maîtrise complète du cycle — de l'acquisition foncière à la livraison — avec une vision long terme.",
  },
  {
    num: "03",
    icon: <Wrench size={22} strokeWidth={1.2} />,
    title: "Exécution & qualité",
    desc: "Des standards d'exécution qui surpassent les attentes : matériaux nobles, délais tenus, finitions impeccables.",
  },
  {
    num: "04",
    icon: <Users size={22} strokeWidth={1.2} />,
    title: "Accompagnement client",
    desc: "Un suivi personnalisé de bout en bout, bien au-delà de la remise des clés.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Groupe Acharaf a su comprendre notre vision et livrer un appartement qui dépasse tout ce que nous imaginions. Un soin du détail rare au Maroc.",
    author: "Mme. Laila Benjelloun",
    role: "Cliente — Résidence Estya, Casablanca",
  },
  {
    quote: "Une transparence totale tout au long du projet et une équipe d'une grande disponibilité. Nous recommandons sans réserve.",
    author: "M. Karim El Fassi",
    role: "Investisseur — Acharaf Prestige, Rabat",
  },
  {
    quote: "Le standing, la localisation et la qualité de construction sont au rendez-vous. C'est exactement ce que nous cherchions.",
    author: "M. & Mme. Tahiri",
    role: "Clients — Villa Collection, Marrakech",
  },
];

/* ────────────────────────────────────────────────────────────
   SectionReveal — Scroll-driven content lift
   Wraps the CONTENT container (not the section bg) so backgrounds
   stay solid while copy / cards gently materialize from below.
──────────────────────────────────────────────────────────── */
function SectionReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.45"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.55, 1]);
  const y       = useTransform(scrollYProgress, [0, 1], [40, 0]);

  return (
    <motion.div ref={ref} style={{ opacity, y }} className={`relative ${className}`}>
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════ */
export default function Home() {
  const { data: stats }    = useGetStats();
  const { data: projects } = useListProjects({ featured: true });

  /* Exactly 4 curated projects — 2 Estya + 2 Acharaf, interleaved */
  const featuredSlice = useMemo(() => {
    if (!projects?.length || !Array.isArray(projects)) return [];
    const estya   = projects.filter((p) => p.brand?.slug === "estya").slice(0, 2);
    const acharaf = projects.filter((p) => p.brand?.slug === "acharaf-immobilier").slice(0, 2);
    // Interleave so the grid alternates brands: Estya / Acharaf / Estya / Acharaf
    const result: typeof projects = [];
    for (let i = 0; i < 2; i++) {
      if (estya[i])   result.push(estya[i]);
      if (acharaf[i]) result.push(acharaf[i]);
    }
    // Fallback: if one brand has fewer than 2, fill from the other up to 4
    if (result.length < 4) {
      const rest = projects.filter((p) => !result.includes(p));
      result.push(...rest.slice(0, 4 - result.length));
    }
    return result.slice(0, 4);
  }, [projects]);

  /* Slideshow */
  const [current, setCurrent] = useState(0);

  /* Brand gateway — click to highlight */
  const [selectedBrand, setSelectedBrand] = useState<"estya" | "acharaf" | null>(null);
  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % SLIDES.length), SLIDE_DURATION);
    return () => clearInterval(t);
  }, []);

  /* Global scroll — hero parallax */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0.2]);

  /* Parallax for decorative glow orbs */
  const { scrollYProgress: pageProgress } = useScroll();
  const glowY1 = useTransform(pageProgress, [0, 1], [0,  -120]);
  const glowY2 = useTransform(pageProgress, [0, 1], [0,  -80]);
  const glowY3 = useTransform(pageProgress, [0, 1], [0,  -60]);

  return (
    <Layout>

      {/* ══════════════════════════════════════════════
          HERO — Living Cinematic Scene
      ══════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="sync">
          {SLIDES.map((slide, i) =>
            i === current ? (
              <motion.div
                key={i}
                className="absolute inset-0 z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: TRANSITION_S, ease: "easeInOut" }}
              >
                <motion.img
                  src={slide.src}
                  alt=""
                  className="w-full h-full object-cover object-center"
                  initial={{ scale: slide.zoomDir === "in" ? 1.0 : 1.12 }}
                  animate={{ scale: slide.zoomDir === "in" ? 1.12 : 1.0 }}
                  transition={{ duration: ZOOM_S, ease: "linear" }}
                />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* Layered overlays */}
        <div className="absolute inset-0 z-1 bg-gradient-to-b from-[#082634]/55 via-[#082634]/10 to-[#082634]/70" />
        <div className="absolute inset-0 z-1 bg-gradient-to-r from-[#082634]/20 via-transparent to-[#082634]/20" />
        <div className="absolute inset-0 z-1 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,_rgba(8,38,52,0.18)_0%,_transparent_100%)]" />

        {/* Slide dots */}
        <div className="absolute bottom-10 right-10 z-20 flex gap-2 items-center">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-500 ${i === current ? "bg-white/70 w-5" : "bg-white/20 w-1"}`}
            />
          ))}
        </div>

        {/* Copy */}
        <motion.div className="relative z-10 container mx-auto px-6 text-center" style={{ opacity: heroOpacity }}>
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.4em" }}
            animate={{ opacity: 1, letterSpacing: "0.22em" }}
            transition={{ duration: 1.6, delay: 0.3 }}
            className="text-[#8EA4AF] text-xs font-normal uppercase tracking-[0.22em] mb-10 block"
          >
            Immobilier d'Exception · Maroc
          </motion.div>

          <div className="overflow-hidden mb-4">
            <motion.h1
              className="text-[13vw] md:text-[10vw] lg:text-[8vw] font-serif font-light text-white leading-[0.88] tracking-tight"
              initial={{ y: "110%" }} animate={{ y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: EC }}
            >
              L'Art de Vivre
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-14">
            <motion.h1
              className="text-[13vw] md:text-[10vw] lg:text-[8vw] font-serif font-light italic text-white/50 leading-[0.88] tracking-tight"
              initial={{ y: "110%" }} animate={{ y: 0 }}
              transition={{ duration: 1.2, delay: 0.7, ease: EC }}
            >
              au sommet
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/nos-projets" className="btn-primary group">
              Découvrir nos créations
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link href="/contact" className="group flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-white/70 hover:text-white/95 transition-colors duration-300 px-4 py-3 sm:ml-3">
              <span className="relative">
                Prendre contact
                <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-px bg-white/45 transition-all duration-300 ease-out" />
              </span>
              <ArrowRight size={11} className="opacity-50 group-hover:opacity-90 group-hover:translate-x-1 transition-all duration-300" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="w-px h-14 bg-gradient-to-b from-[#8EA4AF]/40 to-transparent"
          />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          MANIFESTO — Light contrast section
      ══════════════════════════════════════════════ */}
      <section className="py-44 bg-[#DCE0E7]">
        <SectionReveal className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <motion.div {...fade(0)}>
                <p className="text-xs tracking-[0.2em] uppercase text-[#3B5661] mb-6">Notre Vision</p>
              </motion.div>
              <motion.div
                initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }}
                transition={{ duration: 1.4, ease: EC }}
                className="h-px bg-[#082634]/30 mb-8"
              />
              <motion.div {...fade(0.1)}>
                <p className="text-[#3B5661] text-sm font-light leading-relaxed max-w-xs">
                  Depuis plus de vingt ans, Groupe Acharaf façonne un nouveau chapitre de l'art de vivre au Maroc.
                </p>
              </motion.div>
            </div>
            <div className="lg:col-span-7">
              <motion.h2
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 1.5, ease: EC }}
                className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#082634] font-light leading-[1.1] tracking-tight"
              >
                Une vision singulière de l'immobilier, où chaque détail est pensé pour créer des œuvres intemporelles.
              </motion.h2>
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* ══════════════════════════════════════════════
          SAVOIR-FAIRE — 4 Expertise Pillars
      ══════════════════════════════════════════════ */}
      <section className="py-36 bg-white relative overflow-hidden">
        <SectionReveal className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <motion.div {...fade(0)}>
              <p className="text-xs tracking-[0.2em] uppercase text-[#5C7480] mb-4">Notre Expertise</p>
              <h2 className="text-4xl md:text-6xl font-serif text-[#082634] font-light">Notre Savoir-Faire</h2>
            </motion.div>
            <motion.div {...fade(0.1)}>
              <p className="text-[#3B5661] font-light text-sm max-w-xs leading-relaxed">
                Quatre piliers d'excellence qui guident chacun de nos projets, de la vision à la réalité.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#8EA4AF]/12">
            {PILLARS.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 44 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 1.3, delay: i * 0.15, ease: EC }}
                className="group relative bg-white p-10 hover:bg-[#DCE0E7] transition-colors duration-700 cursor-default"
              >
                <div className="text-[10px] tracking-[0.25em] text-[#5C7480] font-mono mb-8">{p.num}</div>
                <div className="text-[#8EA4AF] mb-7 group-hover:text-[#082634]/60 transition-colors duration-500">
                  {p.icon}
                </div>
                <h3 className="text-lg font-serif text-[#082634] font-light mb-4 leading-snug">{p.title}</h3>
                <div className="w-0 group-hover:w-8 h-px bg-[#8EA4AF] transition-all duration-700 mb-4" />
                <p className="text-[#3B5661] text-sm font-light leading-relaxed group-hover:text-[#082634] transition-colors duration-500">
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </SectionReveal>
      </section>

      {/* ══════════════════════════════════════════════
          SIGNATURE — Editorial brand statement
      ══════════════════════════════════════════════ */}
      <section className="py-44 bg-[#082634] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#082634] via-[#080629]/40 to-[#082634] pointer-events-none" />
        <motion.div
          style={{ y: glowY2 }}
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_50%_40%_at_30%_60%,_#8EA4AF_0%,_transparent_100%)] opacity-[0.03]"
        />

        <SectionReveal className="container mx-auto px-6 relative z-10 max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: EC }}
            className="flex items-center gap-5 mb-14"
          >
            <div className="w-10 h-px bg-[#8EA4AF]/30" />
            <p className="text-xs tracking-[0.22em] uppercase text-[#8EA4AF]/80">Notre Engagement</p>
          </motion.div>
          <div className="overflow-hidden mb-3">
            <motion.h2
              initial={{ y: "100%" }} whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.3, delay: 0.1, ease: EC }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif text-white font-light leading-[0.95] tracking-tight"
            >
              Construire plus que
            </motion.h2>
          </div>
          <div className="overflow-hidden mb-3">
            <motion.h2
              initial={{ y: "100%" }} whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.3, delay: 0.22, ease: EC }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif text-white font-light leading-[0.95] tracking-tight"
            >
              des projets.
            </motion.h2>
          </div>
          <div className="overflow-hidden mt-5">
            <motion.h2
              initial={{ y: "100%" }} whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.3, delay: 0.38, ease: EC }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif italic text-white/50 font-light leading-[0.95] tracking-tight"
            >
              Créer des références.
            </motion.h2>
          </div>
        </SectionReveal>
      </section>

      {/* ══════════════════════════════════════════════
          KEY NUMBERS — Typographic authority monument
      ══════════════════════════════════════════════ */}
      {stats && (
        <section className="bg-[#DCE0E7] relative overflow-hidden py-20 md:py-28">
          <SectionReveal className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: EC }}
              className="flex items-center gap-4 mb-10 md:mb-14"
            >
              <motion.div
                initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.0, ease: EC }}
                style={{ originX: 0 }}
                className="w-10 h-px bg-[#8EA4AF]/50"
              />
              <p className="text-[10px] tracking-[0.32em] uppercase text-[#3B5661]">
                Notre Impact · En chiffres
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
              {[
                { label: "Projets livrés",      value: stats.deliveredProjects, suffix: ""  },
                { label: "Années d'expérience", value: stats.yearsExperience,   suffix: ""  },
                { label: "Unités livrées",       value: stats.totalUnits,        suffix: "+" },
                { label: "Villes présentes",     value: stats.cities,            suffix: ""  },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 1.1, delay: i * 0.14, ease: EC }}
                  className="group relative min-w-0 px-6 lg:px-10 py-8 lg:py-0 border-r border-[#8EA4AF]/15 last:border-r-0 even:border-r-0 lg:even:border-r lg:last:border-r-0"
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: i * 0.14, ease: EC }}
                    style={{ originX: 0 }}
                    className="w-full h-px bg-[#8EA4AF]/25 mb-8 lg:mb-10 hidden lg:block"
                  />
                  <div
                    className="font-serif font-light text-[#082634] leading-none tracking-tight mb-3 tabular-nums whitespace-nowrap"
                    style={{ fontSize: "clamp(2.6rem, 5vw, 5.5rem)" }}
                  >
                    <CountUp end={stat.value} duration={2.0} suffix={stat.suffix} />
                  </div>
                  <p className="text-[10px] tracking-[0.26em] uppercase text-[#3B5661] group-hover:text-[#082634] transition-colors duration-700">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </SectionReveal>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          FEATURED PROJECTS
      ══════════════════════════════════════════════ */}
      <section className="pt-36 pb-40 bg-white">
        <SectionReveal className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
            <motion.div {...fade(0)}>
              <p className="text-xs tracking-[0.2em] uppercase text-[#5C7480] mb-4">Portfolio sélectionné</p>
              <h2 className="text-4xl md:text-6xl font-serif text-[#082634] font-light">Nos Projets Phares</h2>
            </motion.div>
            <motion.div {...fade(0.1)}>
              <Link
                href="/nos-projets"
                className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#3B5661] hover:text-[#082634] transition-colors border-b border-transparent hover:border-[#8EA4AF]/40 pb-0.5"
              >
                Tout voir <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 lg:gap-28">
            {featuredSlice.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 1.4, delay: i * 0.2, ease: EC }}
                className={`group cursor-pointer ${i % 2 !== 0 ? "md:mt-32" : ""}`}
              >
                <Link href={`/nos-projets/${project.id}`}>
                  <div className="relative overflow-hidden aspect-[4/5] mb-7 bg-[#DCE0E7]">
                    {project.coverImageUrl && (
                      <motion.img
                        src={project.coverImageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.07 }}
                        transition={{ duration: 1.4, ease: EC }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-black/15 transition-all duration-1000" />
                    <div className="absolute top-5 left-5">
                      <span className="px-3 py-1 bg-white/85 backdrop-blur-sm text-[#082634] text-xs tracking-[0.15em] uppercase border border-white/60">
                        {project.brand?.name || "Groupe Acharaf"}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                      <p className="text-white/80 text-xs tracking-[0.15em] uppercase">{project.location}</p>
                    </div>
                    <div className="absolute bottom-6 right-6 w-10 h-10 bg-white flex items-center justify-center text-[#082634] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-serif text-[#082634] mb-2 font-light group-hover:text-[#8EA4AF] transition-colors duration-700">
                        {project.title}
                      </h3>
                      <p className="text-[#5C7480] tracking-[0.15em] uppercase text-xs">{project.location}</p>
                    </div>
                    <div className="w-0 group-hover:w-10 h-px bg-[#8EA4AF] transition-all duration-700 mt-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </SectionReveal>
      </section>

      {/* ══════════════════════════════════════════════
          BRAND GATEWAY — Mobile-first premium selector
          Two always-visible cards: Estya + Acharaf
      ══════════════════════════════════════════════ */}
      <section className="py-28 bg-white">
        <SectionReveal className="container mx-auto px-6 max-w-6xl">

          {/* Header */}
          <div className="text-center mb-14">
            <motion.p {...fade(0)} className="text-xs tracking-[0.2em] uppercase text-[#5C7480] mb-4">
              Nos Marques
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.1, ease: EC }}
              className="text-4xl md:text-5xl font-serif text-[#082634] font-light"
            >
              Deux univers, une exigence
            </motion.h2>
            <motion.p
              {...fade(0.2)}
              className="text-[#3B5661] font-light text-sm mt-5 max-w-sm mx-auto leading-relaxed"
            >
              Deux marques complémentaires pour répondre à toutes les aspirations résidentielles.
            </motion.p>
          </div>

          {/* Cards — stacked on mobile, side-by-side on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <BrandCard
              bg={brandEstya} brandId="estya"
              selected={selectedBrand === "estya"}
              onSelect={() => setSelectedBrand((s) => (s === "estya" ? null : "estya"))}
            />
            <BrandCard
              bg={brandAcharaf} brandId="acharaf"
              selected={selectedBrand === "acharaf"}
              onSelect={() => setSelectedBrand((s) => (s === "acharaf" ? null : "acharaf"))}
            />
          </div>

          {/* See-all gateway */}
          <motion.div {...fade(0.3)} className="text-center mt-12">
            <Link
              href="/nos-marques"
              className="group inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.2em] text-[#5C7480] hover:text-[#082634] transition-colors duration-500"
            >
              Explorer toutes nos marques
              <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>

        </SectionReveal>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONIALS — Trust & credibility
      ══════════════════════════════════════════════ */}
      <section className="pt-40 pb-60 bg-white relative overflow-hidden">
        <SectionReveal className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <motion.div {...fade(0)}>
              <p className="text-xs tracking-[0.22em] uppercase text-[#5C7480] mb-5">Ils nous font confiance</p>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 1.4, delay: 0.1, ease: EC }}
              className="text-4xl md:text-5xl font-serif text-[#082634] font-light"
            >
              La parole de nos clients
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 44 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 1.3, delay: i * 0.18, ease: EC }}
                className="group"
              >
                <div className="text-[#8EA4AF]/60 mb-7 group-hover:text-[#8EA4AF] transition-colors duration-700">
                  <Quote size={36} strokeWidth={1} />
                </div>
                <p className="text-[#3B5661] font-light leading-relaxed mb-8 text-[15px] italic group-hover:text-[#082634] transition-colors duration-700">
                  "{t.quote}"
                </p>
                <div className="w-8 h-px bg-[#8EA4AF]/35 mb-6" />
                <p className="text-[#082634] text-sm font-light">{t.author}</p>
                <p className="text-[#5C7480] text-xs tracking-[0.12em] mt-1">{t.role}</p>
              </motion.div>
            ))}
          </div>
        </SectionReveal>
      </section>

    </Layout>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   BRAND CARD — Mobile-first premium gateway card
   Always-visible content, click-to-highlight, no hover dependency
═══════════════════════════════════════════════════════════════════════ */

function BrandCard({
  bg, brandId, selected, onSelect,
}: {
  bg: string;
  brandId: "estya" | "acharaf";
  selected: boolean;
  onSelect: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const EC       = [0.22, 1, 0.36, 1] as const;
  const isEstya  = brandId === "estya";

  /* Combine hover + focus into a single "active" signal.
     selected state takes visual priority but is independent. */
  const isActive = isHovered || isFocused;

  /* Derived animation values — layered priority: selected > active > rest */
  const imgScale  = selected ? 1.04 : isActive ? 1.03 : 1.0;
  const overlayOp = selected ? 0.38 : isActive ? 0.44 : 0.55;
  const liftY     = selected ? -4   : isActive ? -2   : 0;
  const shadow    = selected
    ? "0 28px 70px rgba(8,38,52,0.20), 0 4px 14px rgba(8,38,52,0.12)"
    : isActive
      ? "0 14px 44px rgba(8,38,52,0.14), 0 2px 8px rgba(8,38,52,0.08)"
      : "0 0px 0px rgba(0,0,0,0)";

  /* Accent bar: full width+opacity on selected; 1/3 width at half-opacity on hover */
  const barScaleX = selected ? 1 : isActive ? 0.34 : 0;
  const barOpacity = selected ? 1 : isActive ? 0.55 : 0;

  return (
    <motion.div
      className="relative overflow-hidden cursor-pointer outline-none"
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      animate={{ y: liftY, boxShadow: shadow }}
      transition={{ duration: 0.75, ease: EC }}
    >
      {/* ── Keyboard focus ring — only visible on :focus-visible ── */}
      <motion.div
        className={`absolute inset-0 z-40 pointer-events-none ring-2 ${isEstya ? "ring-[#8EA4AF]" : "ring-[#B2BED0]"}`}
        animate={{ opacity: isFocused ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* ── Accent bar: preview (hover) → confirmed (selected) ── */}
      <motion.div
        className={`absolute top-0 inset-x-0 h-[2px] z-30 ${isEstya ? "bg-[#8EA4AF]" : "bg-[#B2BED0]"}`}
        animate={{ scaleX: barScaleX, opacity: barOpacity }}
        style={{ originX: 0 }}
        transition={{ duration: selected ? 0.55 : 0.8, ease: EC }}
      />

      {/* ── Image + overlays ── */}
      <div className="relative h-[420px] sm:h-[480px] md:h-[520px] lg:h-[560px]">

        {/* Background image — slow cinematic zoom on hover/select */}
        <motion.img
          src={bg}
          alt={isEstya ? "Estya — Ultra-Luxe" : "Acharaf Immobilier — Premium"}
          className="absolute inset-0 w-full h-full object-cover"
          animate={{ scale: imgScale }}
          transition={{ duration: 1.9, ease: EC }}
        />

        {/* Brand-specific dark overlay — brightens on hover/select */}
        <motion.div
          className={`absolute inset-0 ${isEstya ? "bg-[#080629]" : "bg-[#082634]"}`}
          animate={{ opacity: overlayOp }}
          transition={{ duration: 1.1, ease: EC }}
        />

        {/* Bottom-up gradient scrim — permanent text anchor */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

        {/* Top-down subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" />

        {/* ── Content — pinned to bottom, always fully readable ── */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-7 sm:p-9 md:p-10">

          {/* Kicker */}
          <p className={`text-[10px] tracking-[0.32em] uppercase font-light mb-3 ${isEstya ? "text-[#8EA4AF]" : "text-[#B8CACC]"}`}>
            {isEstya ? "Ultra-Luxe" : "Premium & Accessible"}
          </p>

          {/* Brand name */}
          <div className="mb-4">
            <h2
              className="font-serif text-white font-light leading-none"
              style={{ fontSize: isEstya ? "clamp(3.5rem,7vw,5.5rem)" : "clamp(3rem,6vw,4.8rem)" }}
            >
              {isEstya ? "Estya" : "Acharaf"}
            </h2>
            {!isEstya && (
              <p className="text-white/65 text-base font-light tracking-wide mt-0.5">Immobilier</p>
            )}
          </div>

          {/* Rule — expands on active or selected */}
          <motion.div
            className="h-px bg-white/30 mb-5"
            animate={{ width: (selected || isActive) ? "3rem" : "1.75rem" }}
            transition={{ duration: 0.6, ease: EC }}
          />

          {/* Description — always fully visible */}
          <p className="text-white/80 text-sm font-light leading-relaxed mb-7 max-w-[28ch]">
            {isEstya
              ? "La quintessence du luxe immobilier. Des adresses confidentielles, des volumes majestueux, une rareté absolue."
              : "L'excellence du cadre de vie. Architecture contemporaine, espaces chaleureux, emplacements stratégiques pour une vie pleine."}
          </p>

          {/* CTA — stops propagation so card click and link click are independent */}
          <div>
            <Link
              href="/nos-marques"
              onClick={(e) => e.stopPropagation()}
              className={`group inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.22em] border-b pb-0.5 transition-colors duration-500 ${
                isEstya
                  ? "text-[#C8D4DA] border-[#8EA4AF]/40 hover:border-[#8EA4AF]/80"
                  : "text-[#DCE0E7] border-[#B2BED0]/40 hover:border-[#B2BED0]/80"
              }`}
            >
              {isEstya ? "Explorer" : "Découvrir"}
              <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform duration-500" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
