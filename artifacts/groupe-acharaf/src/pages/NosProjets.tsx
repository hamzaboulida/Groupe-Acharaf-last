import React, { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { useListProjects } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearch } from "wouter";
import { ArrowRight, MapPin } from "lucide-react";

const EC = [0.22, 1, 0.36, 1] as const;

const STATUS_LABELS: Record<string, string> = {
  ongoing: "En cours",
  completed: "Livré",
  upcoming: "À venir",
};

export default function NosProjets() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialBrandParam = searchParams.get("brand");

  const [activeBrandFilter, setActiveBrandFilter] = useState<number | null>(
    initialBrandParam ? Number(initialBrandParam) : null
  );
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);

  const { data: projects, isLoading } = useListProjects({
    brandId: activeBrandFilter || undefined,
    status: activeStatusFilter as any || undefined,
  });

  const featuredProject = useMemo(() => projects?.find((p) => p.featured) || projects?.[0], [projects]);
  const galleryProjects = useMemo(() => projects?.filter((p) => p.id !== featuredProject?.id) || [], [projects, featuredProject]);

  const chip = (active: boolean) =>
    `px-4 py-1.5 text-[10px] tracking-[0.18em] uppercase border transition-all duration-300 ${
      active
        ? "border-[#082634] text-[#082634] bg-[#082634]/5"
        : "border-[#8EA4AF]/30 text-[#5C7480] hover:text-[#082634] hover:border-[#8EA4AF]/60"
    }`;

  return (
    <Layout>
      {/* ── Header ── */}
      <section className="pt-36 pb-10 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EC }}
            className="mb-10"
          >
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#5C7480] mb-3">La Galerie</p>
            <h1 className="text-4xl md:text-7xl font-serif text-[#082634] font-light leading-none">
              Nos Projets
            </h1>
            <p className="text-[#3B5661] text-sm font-light mt-3 max-w-xs">
              Une collection d'adresses qui redéfinissent le prestige.
            </p>
          </motion.div>

          {/* Filters — single scrollable row on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="border-t border-[#8EA4AF]/12 pt-6"
          >
            <div className="flex flex-wrap gap-2">
              {/* Brand filters */}
              {[
                { label: "Tous", val: null, type: "brand" },
                { label: "Estya", val: 1, type: "brand" },
                { label: "Acharaf", val: 2, type: "brand" },
              ].map((f) => (
                <button
                  key={`brand-${f.label}`}
                  onClick={() => setActiveBrandFilter(f.val)}
                  className={chip(activeBrandFilter === f.val)}
                >
                  {f.label}
                </button>
              ))}

              <div className="w-px h-6 self-center bg-[#8EA4AF]/25 mx-1" />

              {/* Status filters */}
              {[
                { label: "Tous statuts", val: null },
                { label: "En cours", val: "ongoing" },
                { label: "Livré", val: "completed" },
                { label: "À venir", val: "upcoming" },
              ].map((f) => (
                <button
                  key={`status-${f.label}`}
                  onClick={() => setActiveStatusFilter(f.val)}
                  className={chip(activeStatusFilter === f.val)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="pb-24 bg-white min-h-[60vh]">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[4/3] bg-[#8EA4AF]/10 animate-pulse" />
              ))}
            </div>
          ) : projects?.length === 0 ? (
            <div className="text-center py-32 text-[#5C7480] border border-dashed border-[#8EA4AF]/20">
              <p className="text-xl font-serif font-light">Aucun projet trouvé.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeBrandFilter}-${activeStatusFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Featured — Full width, landscape on desktop / portrait on mobile */}
                {featuredProject && (
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: EC }}
                    className="mb-16 md:mb-24 group cursor-pointer"
                  >
                    <Link href={`/nos-projets/${featuredProject.id}`}>
                      {/* Image — taller on mobile so title fits comfortably */}
                      <div className="relative w-full aspect-[4/3] md:aspect-[21/8] overflow-hidden bg-[#8EA4AF]/10">
                        {featuredProject.coverImageUrl && (
                          <motion.img
                            src={featuredProject.coverImageUrl}
                            alt={featuredProject.title}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.04 }}
                            transition={{ duration: 1.4, ease: EC }}
                          />
                        )}
                        {/* Strong bottom scrim so text is always readable */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-1000" />

                        {/* Badges — top left */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="px-3 py-1 bg-white/85 backdrop-blur-sm border border-white/50 text-[#082634] text-[10px] tracking-[0.15em] uppercase">
                            {featuredProject.brand?.name || "Projet"}
                          </span>
                          <span className="px-3 py-1 bg-[#8EA4AF] text-[#082634] text-[10px] tracking-[0.15em] uppercase font-medium">
                            {STATUS_LABELS[featuredProject.status ?? ""] ?? featuredProject.status}
                          </span>
                        </div>

                        {/* Title + CTA — pinned to bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 flex items-end justify-between gap-4">
                          <div className="min-w-0">
                            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif text-white font-light leading-tight mb-1 line-clamp-2">
                              {featuredProject.title}
                            </h2>
                            <p className="text-white/70 tracking-[0.14em] uppercase text-[10px] flex items-center gap-1.5">
                              <MapPin size={10} className="text-[#8EA4AF] shrink-0" />
                              <span className="truncate">{featuredProject.location}</span>
                            </p>
                          </div>
                          <div className="shrink-0 w-10 h-10 md:w-14 md:h-14 border border-white/25 flex items-center justify-center text-white backdrop-blur-sm group-hover:bg-[#8EA4AF] group-hover:border-[#8EA4AF] group-hover:text-[#082634] transition-all duration-500">
                            <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )}

                {/* Staggered grid — 2 cols on mobile, offset stagger on md+ */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-16 lg:gap-24">
                  {galleryProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.9, delay: index * 0.07, ease: EC }}
                      className={`group cursor-pointer ${index % 2 !== 0 ? "md:mt-24" : ""}`}
                    >
                      <Link href={`/nos-projets/${project.id}`}>
                        {/* Image */}
                        <div className="relative overflow-hidden aspect-[3/4] mb-3 md:mb-6 bg-[#8EA4AF]/10">
                          {project.coverImageUrl && (
                            <motion.img
                              src={project.coverImageUrl}
                              alt={project.title}
                              className="w-full h-full object-cover"
                              whileHover={{ scale: 1.06 }}
                              transition={{ duration: 1.2, ease: EC }}
                            />
                          )}
                          <div className="absolute inset-0 bg-black/8 group-hover:bg-transparent transition-colors duration-700" />
                          {/* Brand badge */}
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-1 bg-white/85 backdrop-blur-sm border border-white/50 text-[#082634] text-[9px] tracking-[0.12em] uppercase">
                              {project.brand?.name}
                            </span>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-sm md:text-xl font-serif text-[#082634] font-light leading-snug group-hover:text-[#8EA4AF] transition-colors duration-500 mb-1">
                              {project.title}
                            </h3>
                            <p className="text-[#5C7480] tracking-[0.1em] uppercase text-[9px] md:text-xs flex items-center gap-1">
                              <MapPin size={9} className="text-[#8EA4AF] shrink-0" />
                              <span className="truncate">{project.location}</span>
                            </p>
                          </div>
                          <div className="shrink-0 w-7 h-7 md:w-9 md:h-9 border border-[#8EA4AF]/25 flex items-center justify-center text-[#5C7480] group-hover:bg-[#8EA4AF] group-hover:border-[#8EA4AF] group-hover:text-[#082634] transition-all duration-500">
                            <ArrowRight size={11} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
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
