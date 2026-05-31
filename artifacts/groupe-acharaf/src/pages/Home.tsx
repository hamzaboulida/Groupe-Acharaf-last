import React, { useRef, useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import {
  motion, useScroll, useTransform,
  AnimatePresence, useInView,
} from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight, ChevronRight,
  PenTool, Building2, Wrench, Users,
} from "lucide-react";
import { useGetStats, useListProjects } from "@workspace/api-client-react";
import { CountUp } from "@/components/ui/count-up";
import { projectPriceLabel, statusBadgeClass, statusLabel } from "@/lib/project-display";
import { usePageSeo } from "@/lib/seo";

import presenceNationaleMap from "@/assets/presence-nationale-map.png";

const SLIDE_DURATION = 6000;
const TRANSITION_S   = 1.4;
const ZOOM_S         = 7;

/* Cinematic ease — used everywhere */
const EC = [0.22, 1, 0.36, 1] as const;

type HeroSettings = {
  mediaType: "slideshow" | "video" | "mixed";
  images: string[];
  videoUrl: string;
  fallbackImageUrl: string;
  enableVideoOnMobile: boolean;
};

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
    title: "Architecture & conception",
    desc: "Des espaces élégants et fonctionnels, imaginés autour des attentes réelles des acquéreurs.",
  },
  {
    num: "02",
    icon: <Building2 size={22} strokeWidth={1.2} />,
    title: "Études & programmation",
    desc: "Des projets pensés à partir d’une lecture fine des marchés, des usages et des évolutions urbaines.",
  },
  {
    num: "03",
    icon: <Wrench size={22} strokeWidth={1.2} />,
    title: "Construction & qualité",
    desc: "Des réalisations conçues avec exigence, portées par des standards élevés de construction et de finition.",
  },
  {
    num: "04",
    icon: <Users size={22} strokeWidth={1.2} />,
    title: "Livraison & accompagnement",
    desc: "Une remise des clés encadrée avec soin, accompagnée d’un suivi attentif jusqu’à votre installation.",
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
  usePageSeo({
    title: "Groupe Acharaf — Immobilier d'Exception au Maroc",
    description:
      "Promoteur immobilier marocain d’excellence. Découvrez nos projets, nos opportunités et notre vision résidentielle premium.",
    path: "/",
  });

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
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isMobileLike, setIsMobileLike] = useState(false);

  const uploadedHeroImages = useMemo(
    () => (heroSettings?.images ?? []).map((src) => src.trim()).filter(Boolean),
    [heroSettings?.images]
  );
  const heroVideoUrl = heroSettings?.videoUrl?.trim() ?? "";
  const heroFallbackImage = heroSettings?.fallbackImageUrl?.trim() ?? "";
  const heroMediaType = heroSettings?.mediaType ?? "slideshow";
  const hasAdminVideo = heroVideoUrl.length > 0;
  const hasAdminImages = uploadedHeroImages.length > 0;

  const heroFrameImages = useMemo(() => {
    const mediaType = heroSettings?.mediaType ?? "slideshow";
    const wantsVideo = mediaType === "video" || mediaType === "mixed";
    const mobileVideoDisabled = isMobileLike && heroSettings?.enableVideoOnMobile !== true;

    if (wantsVideo && mobileVideoDisabled && heroFallbackImage) {
      return [heroFallbackImage];
    }

    if (hasAdminImages) return uploadedHeroImages;
    if (heroFallbackImage) return [heroFallbackImage];
    return [];
  }, [
    hasAdminImages,
    heroFallbackImage,
    heroSettings?.enableVideoOnMobile,
    heroSettings?.mediaType,
    isMobileLike,
    uploadedHeroImages,
  ]);

  const showVideo =
    hasAdminVideo &&
    (!isMobileLike || heroSettings?.enableVideoOnMobile === true) &&
    !videoFailed &&
    (heroMediaType === "video" || heroMediaType === "mixed");

  useEffect(() => {
    if (heroFrameImages.length <= 1) {
      setCurrent(0);
      return;
    }
    const t = setInterval(() => {
      setCurrent((p) => (p + 1) % heroFrameImages.length);
    }, SLIDE_DURATION);
    return () => clearInterval(t);
  }, [heroFrameImages.length]);

  useEffect(() => {
    setCurrent(0);
  }, [heroFrameImages.length]);

  useEffect(() => {
    setVideoReady(false);
    setVideoFailed(false);
  }, [heroSettings?.videoUrl, heroSettings?.enableVideoOnMobile, heroSettings?.mediaType, isMobileLike]);

  useEffect(() => {
    async function loadHeroSettings() {
      try {
        const response = await fetch("/api/homepage-hero");
        const payload = await response.json();
        if (!response.ok) return;
        setHeroSettings({
          mediaType: payload.mediaType ?? "slideshow",
          images: Array.isArray(payload.images) ? payload.images : [],
          videoUrl: payload.videoUrl ?? "",
          fallbackImageUrl: payload.fallbackImageUrl ?? "",
          enableVideoOnMobile: payload.enableVideoOnMobile === true,
        });
      } catch {
        // Keep empty premium fallback when API is unavailable.
      }
    }

    loadHeroSettings();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 900px)");
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const update = () => {
      setIsMobileLike(mediaQuery.matches || saveData);
    };
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const firstImage = (
      heroFallbackImage ||
      heroFrameImages[0] ||
      ""
    ).trim();
    if (!firstImage || typeof document === "undefined") return;
    const existing = document.querySelector(`link[rel="preload"][href="${firstImage}"]`);
    if (existing) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = firstImage;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [heroFallbackImage, heroFrameImages]);

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
        {showVideo ? (
          <>
            {((heroFallbackImage || uploadedHeroImages[0]) && !videoReady) && (
              <img
                src={heroFallbackImage || uploadedHeroImages[0]}
                alt=""
                className="absolute inset-0 z-0 w-full h-full object-cover object-center"
                fetchPriority="high"
              />
            )}
            <video
              className="absolute inset-0 z-0 w-full h-full object-cover object-center"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={heroFallbackImage || uploadedHeroImages[0] || undefined}
              onCanPlay={() => setVideoReady(true)}
              onError={() => setVideoFailed(true)}
            >
              <source src={heroVideoUrl} type={heroVideoUrl.endsWith(".webm") ? "video/webm" : "video/mp4"} />
            </video>
          </>
        ) : heroFrameImages.length > 0 ? (
        <AnimatePresence mode="sync">
          {heroFrameImages.map((slideSrc, i) =>
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
                  src={slideSrc}
                  alt=""
                  className="w-full h-full object-cover object-center"
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  initial={{ scale: i % 2 === 0 ? 1.0 : 1.12 }}
                  animate={{ scale: i % 2 === 0 ? 1.12 : 1.0 }}
                  transition={{ duration: ZOOM_S, ease: "linear" }}
                />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
        ) : (
          <div className="absolute inset-0 z-0 bg-[#082634]" />
        )}

        {/* Layered overlays */}
        <div className="absolute inset-0 z-1 bg-gradient-to-b from-[#082634]/55 via-[#082634]/10 to-[#082634]/70" />
        <div className="absolute inset-0 z-1 bg-gradient-to-r from-[#082634]/20 via-transparent to-[#082634]/20" />
        <div className="absolute inset-0 z-1 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,_rgba(8,38,52,0.18)_0%,_transparent_100%)]" />

        {/* Slide dots */}
        {heroFrameImages.length > 1 && (
        <div className="absolute bottom-10 right-10 z-20 flex gap-2 items-center">
          {heroFrameImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-500 ${i === current ? "bg-white/70 w-5" : "bg-white/20 w-1"}`}
            />
          ))}
        </div>
        )}

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
              Habiter mieux
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-14">
            <motion.h1
              className="text-[13vw] md:text-[10vw] lg:text-[8vw] font-serif font-light italic text-white/50 leading-[0.88] tracking-tight"
              initial={{ y: "110%" }} animate={{ y: 0 }}
              transition={{ duration: 1.2, delay: 0.7, ease: EC }}
            >
              commence ici.
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
                <p className="text-xs tracking-[0.2em] uppercase text-[#082634] mb-6">Notre Vision</p>
              </motion.div>
              <motion.div
                initial={{ width: 0 }} whileInView={{ width: "3rem" }} viewport={{ once: true }}
                transition={{ duration: 1.4, ease: EC }}
                className="h-px bg-[#082634]/30 mb-8"
              />
              <motion.div {...fade(0.1)}>
                <p className="text-[#082634] text-sm font-light leading-relaxed max-w-xs">
                  Depuis plus de 46 ans, le Groupe Acharaf imagine des lieux pensés pour traverser le temps.
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
                Développer des projets immobiliers durables et finement pensés, conçus pour répondre aux attentes réelles des acquéreurs.
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
              <p className="text-xs tracking-[0.2em] uppercase text-[#8EA4AF] mb-4">Notre Expertise</p>
              <h2 className="text-4xl md:text-6xl font-serif text-[#082634] font-light">Notre Savoir-Faire</h2>
            </motion.div>
            <motion.div {...fade(0.1)}>
              <p className="text-[#082634] font-light text-sm max-w-xs leading-relaxed">
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
                <div className="text-[10px] tracking-[0.25em] text-[#8EA4AF] font-mono mb-8">{p.num}</div>
                <div className="text-[#8EA4AF] mb-7 group-hover:text-[#082634]/60 transition-colors duration-500">
                  {p.icon}
                </div>
                <h3 className="text-lg font-serif text-[#082634] font-light mb-4 leading-snug">{p.title}</h3>
                <div className="w-0 group-hover:w-8 h-px bg-[#8EA4AF] transition-all duration-700 mb-4" />
                <p className="text-[#082634] text-sm font-light leading-relaxed group-hover:text-[#082634] transition-colors duration-500">
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#082634] via-[#082634]/40 to-[#082634] pointer-events-none" />
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
              Construire avec exigence,
            </motion.h2>
          </div>
          {/* <div className="overflow-hidden mb-3">
            <motion.h2
              initial={{ y: "100%" }} whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.3, delay: 0.22, ease: EC }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif text-white font-light leading-[0.95] tracking-tight"
            >
              l’essentiel qui dure.
            </motion.h2>
          </div> */}
          <div className="overflow-hidden mt-5">
            <motion.h2
              initial={{ y: "100%" }} whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.3, delay: 0.38, ease: EC }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif italic text-white/50 font-light leading-[0.95] tracking-tight"
            >
              l’essentiel qui dure.
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
              <p className="text-[10px] tracking-[0.32em] uppercase text-[#082634]">
                Notre Impact · En chiffres
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
              {[
                { label: "Projets livrés",      value: stats.deliveredProjects, suffix: ""  },
                { label: "Années d'expérience", value: stats.yearsExperience,   suffix: ""  },
                { label: "Unités livrées",       value: stats.totalUnits,        suffix: "" },
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
                  <p className="text-[10px] tracking-[0.26em] uppercase text-[#082634] group-hover:text-[#082634] transition-colors duration-700">
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
              <p className="text-xs tracking-[0.2em] uppercase text-[#8EA4AF] mb-4">Portfolio sélectionné</p>
              <h2 className="text-4xl md:text-6xl font-serif text-[#082634] font-light">Nos Projets Phares</h2>
            </motion.div>
            <motion.div {...fade(0.1)}>
              <Link
                href="/nos-projets"
                className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#082634] hover:text-[#082634] transition-colors border-b border-transparent hover:border-[#8EA4AF]/40 pb-0.5"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-[#082634]/40 via-transparent to-transparent group-hover:from-[#082634]/15 transition-all duration-1000" />
                    <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white/85 backdrop-blur-sm text-[#082634] text-xs tracking-[0.15em] uppercase border border-white/60">
                        {project.brand?.name || "Groupe Acharaf"}
                      </span>
                      <span className={`px-3 py-1 border text-xs tracking-[0.15em] uppercase ${statusBadgeClass(project.status)}`}>
                        {statusLabel(project.status)}
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
                      <h3 className="text-xl md:text-2xl font-serif text-[#082634] mb-2 font-light group-hover:text-[#8EA4AF] transition-colors duration-700 leading-tight">
                        {project.title}
                      </h3>
                      <p className="text-[#8EA4AF] tracking-[0.15em] uppercase text-xs">{project.location}</p>
                      <p className="text-[#082634] text-sm font-serif font-light mt-2">{projectPriceLabel(project)}</p>
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
          PRESENCE NATIONALE
      ══════════════════════════════════════════════ */}
      <section className="pt-20 pb-24 md:pt-28 md:pb-28 bg-white relative overflow-hidden">
        <SectionReveal className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 lg:gap-6 items-center">
            <div className="lg:col-span-4 xl:col-span-4 lg:pr-4">
              <motion.div {...fade(0)}>
                <p className="text-xs tracking-[0.22em] uppercase text-[#8EA4AF] mb-5">PRÉSENCE NATIONALE</p>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 1.4, delay: 0.1, ease: EC }}
                className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#082634] font-light leading-[1.04] max-w-[13ch]"
              >
                Un ancrage fort à travers le Royaume
              </motion.h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 1.4, delay: 0.12, ease: EC }}
              className="lg:col-span-8 xl:col-span-8"
            >
              <div className="relative w-full lg:pl-1 overflow-x-clip">
                <img
                  src={presenceNationaleMap}
                  alt="Carte de présence nationale Groupe Acharaf"
                  className="block h-auto object-contain mx-auto w-[116%] max-w-none -mx-[8%] sm:w-[112%] sm:-mx-[6%] md:w-full md:mx-0 md:max-w-[860px] lg:max-w-none"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>
        </SectionReveal>
      </section>

    </Layout>
  );
}
