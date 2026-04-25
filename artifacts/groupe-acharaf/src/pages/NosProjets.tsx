import React, { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { useListProjects } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearch } from "wouter";
import { ArrowRight, MapPin } from "lucide-react";

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

  const filterBtn = (active: boolean) =>
    `px-5 py-2 text-xs tracking-[0.15em] uppercase border transition-all duration-300 ${
      active
        ? "border-[#082634]/50 text-[#082634] bg-[#082634]/6"
        : "border-[#8EA4AF]/20 text-[#3B5661] hover:text-[#082634] hover:border-[#8EA4AF]/40"
    }`;

  return (
    <Layout>
      {/* ── Header ── */}
      <section className="pt-44 pb-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-[#5C7480] mb-5">La Galerie</p>
            <h1 className="text-6xl md:text-8xl font-serif text-[#082634] mb-4 font-light leading-none">Nos Projets</h1>
            <p className="text-[#3B5661] text-base font-light mt-4">Une collection d'adresses qui redéfinissent le prestige.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-t border-[#8EA4AF]/12 pt-8"
          >
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Tous", val: null },
                { label: "Estya", val: 1 },
                { label: "Acharaf", val: 2 },
              ].map((f) => (
                <button key={f.label} onClick={() => setActiveBrandFilter(f.val)} className={filterBtn(activeBrandFilter === f.val)}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Tous statuts", val: null },
                { label: "En cours", val: "ongoing" },
                { label: "Livré", val: "completed" },
                { label: "À venir", val: "upcoming" },
              ].map((f) => (
                <button key={f.label} onClick={() => setActiveStatusFilter(f.val)} className={filterBtn(activeStatusFilter === f.val)}>
                  {f.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="py-20 bg-white min-h-[60vh]">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[4/5] bg-[#8EA4AF]/10 animate-pulse" />
              ))}
            </div>
          ) : projects?.length === 0 ? (
            <div className="text-center py-32 text-[#5C7480] border border-dashed border-[#8EA4AF]/20">
              <p className="text-2xl font-serif font-light">Aucun projet trouvé.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeBrandFilter}-${activeStatusFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Featured — Full width */}
                {featuredProject && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-32 group cursor-pointer"
                  >
                    <Link href={`/nos-projets/${featuredProject.id}`}>
                      <div className="relative w-full aspect-[21/9] md:aspect-[21/7] overflow-hidden mb-8 bg-[#8EA4AF]/10">
                        {featuredProject.coverImageUrl && (
                          <motion.img
                            src={featuredProject.coverImageUrl}
                            alt={featuredProject.title}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.04 }}
                            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-1000" />

                        <div className="absolute top-6 left-6 flex gap-3">
                          <span className="px-4 py-1.5 bg-white/85 backdrop-blur-sm border border-white/50 text-[#082634] text-xs tracking-[0.15em] uppercase">
                            {featuredProject.brand?.name || "Projet"}
                          </span>
                          <span className="px-4 py-1.5 bg-[#8EA4AF] text-[#082634] text-xs tracking-[0.15em] uppercase font-medium">
                            {featuredProject.status === "ongoing" ? "En cours" : featuredProject.status === "completed" ? "Livré" : "À venir"}
                          </span>
                        </div>

                        <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                          <div>
                            <h2 className="text-5xl md:text-7xl font-serif text-white mb-3 font-light">{featuredProject.title}</h2>
                            <p className="text-white/75 tracking-[0.15em] uppercase text-xs flex items-center gap-2">
                              <MapPin size={12} className="text-[#8EA4AF]" /> {featuredProject.location}
                            </p>
                          </div>
                          <div className="w-14 h-14 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm group-hover:bg-[#8EA4AF] group-hover:border-[#8EA4AF] group-hover:text-[#082634] transition-all duration-500">
                            <ArrowRight size={20} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )}

                {/* Staggered grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 lg:gap-28">
                  {galleryProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 1, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className={`group cursor-pointer ${index % 2 !== 0 ? "md:mt-32" : ""}`}
                    >
                      <Link href={`/nos-projets/${project.id}`}>
                        <div className="relative overflow-hidden aspect-[4/5] mb-7 bg-[#8EA4AF]/10">
                          {project.coverImageUrl && (
                            <motion.img
                              src={project.coverImageUrl}
                              alt={project.title}
                              className="w-full h-full object-cover"
                              whileHover={{ scale: 1.06 }}
                              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            />
                          )}
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
                          <div className="absolute top-5 left-5">
                            <span className="px-3 py-1 bg-white/85 backdrop-blur-sm border border-white/50 text-[#082634] text-xs tracking-[0.15em] uppercase">
                              {project.brand?.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-2xl font-serif text-[#082634] mb-2 font-light group-hover:text-[#8EA4AF] transition-colors duration-500">
                              {project.title}
                            </h3>
                            <p className="text-[#5C7480] tracking-[0.12em] uppercase text-xs flex items-center gap-1.5">
                              <MapPin size={11} className="text-[#8EA4AF]" /> {project.location}
                            </p>
                          </div>
                          <div className="w-9 h-9 shrink-0 border border-[#8EA4AF]/25 flex items-center justify-center text-[#5C7480] group-hover:bg-[#8EA4AF] group-hover:border-[#8EA4AF] group-hover:text-[#082634] transition-all duration-500">
                            <ArrowRight size={14} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
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
