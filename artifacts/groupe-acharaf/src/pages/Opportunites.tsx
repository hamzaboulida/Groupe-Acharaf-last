import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useListProjects } from "@workspace/api-client-react";
import { projectPriceLabel, statusBadgeClass, statusLabel } from "@/lib/project-display";
import { sharedHeroImage } from "@/assets/hero-shared";
import { usePageSeo } from "@/lib/seo";

const EC = [0.22, 1, 0.36, 1] as const;

const OPPORTUNITY_LABELS: Record<string, string> = {
  all: "Toutes",
  lots_r1: "LOTS R+1",
  lots_r2: "LOTS R+2",
  lots_r3: "LOTS R+3",
  creche: "CRÈCHE",
};

export default function Opportunites() {
  const { data: projects = [], isLoading } = useListProjects();
  const [activeType, setActiveType] = useState<keyof typeof OPPORTUNITY_LABELS>("all");

  usePageSeo({
    title: "Opportunités immobilières au Maroc | Groupe Acharaf",
    description:
      "Découvrez les opportunités immobilières Groupe Acharaf : lots R+1, lots R+2, lots R+3 et crèche au Maroc.",
    path: "/opportunites",
  });

  const opportunities = useMemo(
    () => projects.filter((project) => project.isOpportunity),
    [projects],
  );

  const filtered = useMemo(() => {
    if (activeType === "all") return opportunities;
    return opportunities.filter((project) => project.opportunityType === activeType);
  }, [activeType, opportunities]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <Layout>
      <section className="relative h-[64vh] w-full overflow-hidden flex items-end pb-20">
        <picture>
          <source srcSet={sharedHeroImage.srcSetWebp} sizes={sharedHeroImage.heroSizes} type="image/webp" />
          <img
            src={sharedHeroImage.src}
            srcSet={sharedHeroImage.srcSetJpg}
            sizes={sharedHeroImage.heroSizes}
            alt=""
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.75]"
          />
        </picture>
        <div className="absolute inset-0 brand-overlay" />
        <div className="relative z-10 ga-container">
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EC }}>
            <p className="ga-kicker mb-6">Sélection Privée</p>
            <h1 className="text-white font-serif font-light text-6xl md:text-8xl leading-none">Opportunités</h1>
            <p className="text-white/70 text-sm md:text-base font-light max-w-xl mt-5">
              Une sélection d’adresses à saisir, entre valeur, rareté et potentiel.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-white border-b border-[#8EA4AF]/16 sticky top-[64px] z-30">
        <div className="ga-container py-6 flex flex-col gap-5">
          <p className="text-[#082634]/72 text-sm font-light">
            Une page courte, pensée pour les offres à forte valeur et à disponibilité limitée.
          </p>
          <div className="flex gap-2 overflow-x-auto">
            {(Object.keys(OPPORTUNITY_LABELS) as Array<keyof typeof OPPORTUNITY_LABELS>).map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`ga-badge shrink-0 transition-colors ${
                  activeType === type ? "ga-badge-dark" : "ga-badge-light hover:bg-[#8EA4AF]/25"
                }`}
              >
                {OPPORTUNITY_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="ga-section section-white">
        <div className="ga-container">
          {isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10">
              <div className="aspect-[16/10] bg-[#DCE0E7] animate-pulse" />
              <div className="space-y-4">
                <div className="h-28 bg-[#DCE0E7] animate-pulse" />
                <div className="h-28 bg-[#DCE0E7] animate-pulse" />
                <div className="h-28 bg-[#DCE0E7] animate-pulse" />
              </div>
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ga-card p-12 text-center max-w-3xl mx-auto">
              <h2 className="ga-heading text-3xl md:text-4xl mb-4">Aucune opportunité disponible pour le moment.</h2>
              <p className="ga-body text-sm max-w-2xl mx-auto mb-10">
                Nos offres spéciales seront prochainement publiées. Nous vous invitons à consulter nos projets ou à nous contacter pour être informé en priorité.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/nos-projets" className="ga-btn ga-btn-primary">Voir les projets</Link>
                <Link href="/contact" className="ga-btn ga-btn-secondary">Nous contacter</Link>
              </div>
            </motion.div>
          )}

          {!isLoading && filtered.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeType}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: EC }}
                className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10"
              >
                {featured && (
                  <Link href={`/nos-projets/${featured.id}`} className="group block ga-card overflow-hidden brand-shadow">
                    <div className="relative aspect-[4/5] sm:aspect-[16/10] overflow-hidden">
                      <img src={featured.coverImageUrl || sharedHeroImage.src} alt={featured.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#082634]/78 via-[#082634]/18 to-transparent" />
                      <div className="absolute left-4 bottom-4 right-4 sm:left-8 sm:bottom-8 sm:right-8">
                        <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                          <span className={`ga-badge ${statusBadgeClass(featured.status)}`}>{statusLabel(featured.status)}</span>
                          <span className="ga-badge ga-badge-medium">{OPPORTUNITY_LABELS[featured.opportunityType as keyof typeof OPPORTUNITY_LABELS] || "LOTS R+1"}</span>
                          {featured.opportunityHighlight && <span className="ga-badge ga-badge-light">{featured.opportunityHighlight}</span>}
                        </div>
                        <h2 className="text-white font-serif font-light text-2xl sm:text-4xl md:text-6xl leading-[1.02] break-words">{featured.title}</h2>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-white/80 text-[10px] md:text-xs tracking-[0.13em] md:tracking-[0.14em] uppercase mt-3 sm:mt-4">
                          <span>{featured.brand?.name}</span>
                          <span className="inline-flex items-center gap-1.5"><MapPin size={11} /> {featured.city || featured.location}</span>
                        </div>
                        {featured.opportunityTitle && <p className="text-white/92 text-base md:text-lg font-serif font-light mt-4 sm:mt-6">{featured.opportunityTitle}</p>}
                        {featured.opportunityDescription && <p className="text-white/78 text-xs sm:text-sm font-light mt-2 sm:mt-3 max-w-xl line-clamp-3 sm:line-clamp-none">{featured.opportunityDescription}</p>}
                        <div className="mt-4 sm:mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
                          <p className="text-white text-xs sm:text-sm tracking-[0.1em] uppercase">{projectPriceLabel(featured)}</p>
                          <span className="ga-btn ga-btn-light">{featured.opportunityCtaLabel || "Découvrir l’opportunité"} <ArrowRight size={12} /></span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                <div className="space-y-4">
                  {rest.map((project) => (
                    <Link key={project.id} href={`/nos-projets/${project.id}`} className="group ga-card p-5 block hover:border-[#8EA4AF]/45 transition-colors">
                      <div className="flex gap-4">
                        <div className="w-28 h-24 shrink-0 overflow-hidden">
                          <img src={project.coverImageUrl || sharedHeroImage.src} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="ga-badge ga-badge-light">{OPPORTUNITY_LABELS[project.opportunityType as keyof typeof OPPORTUNITY_LABELS] || "LOTS R+1"}</span>
                            {project.opportunityHighlight && <span className="ga-badge ga-badge-medium">{project.opportunityHighlight}</span>}
                          </div>
                          <h3 className="ga-heading text-xl mb-1 line-clamp-2">{project.title}</h3>
                          <p className="text-[#082634]/62 text-xs tracking-[0.12em] uppercase">{project.brand?.name} · {project.city || project.location}</p>
                          {project.opportunityTitle && <p className="text-[#082634]/84 text-sm font-light mt-2">{project.opportunityTitle}</p>}
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <p className="text-[#082634] text-xs tracking-[0.1em] uppercase">{projectPriceLabel(project)}</p>
                            <span className="text-[#8EA4AF] text-xs uppercase tracking-[0.14em] inline-flex items-center gap-1">
                              {project.opportunityCtaLabel || "Découvrir l’opportunité"} <ArrowRight size={11} />
                            </span>
                          </div>
                          {project.opportunityValidUntil && (
                            <p className="text-[#8EA4AF] text-[10px] tracking-[0.14em] uppercase mt-2 inline-flex items-center gap-1.5">
                              <Calendar size={10} /> Valable jusqu’au {project.opportunityValidUntil}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>
    </Layout>
  );
}
