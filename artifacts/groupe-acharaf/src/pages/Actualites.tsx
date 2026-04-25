import React, { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { useListArticles } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Calendar, Newspaper } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import heroBg from "@/assets/hero-bg.png";

const EC = [0.22, 1, 0.36, 1] as const;

export default function Actualites() {
  const { data: articles = [], isLoading } = useListArticles({ params: { published: true } });
  const [activeCategory, setActiveCategory] = useState("Tous");

  /* Derive categories dynamically from articles */
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(articles.map((a) => a.category).filter(Boolean) as string[])
    ).sort();
    return ["Tous", ...cats];
  }, [articles]);

  /* Reset to "Tous" if active category disappears after data loads */
  const filtered = useMemo(() => {
    if (activeCategory === "Tous") return articles;
    return articles.filter((a) => a.category === activeCategory);
  }, [articles, activeCategory]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative h-[65vh] w-full flex items-end pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover scale-105 brightness-[0.72]" />
        </div>
        <div className="absolute inset-0 bg-black/22" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />

        <div className="relative z-10 container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EC }}
          >
            <p className="text-[#8EA4AF] text-xs tracking-[0.2em] uppercase mb-6 opacity-80">Journal</p>
            <div className="overflow-hidden">
              <motion.h1
                className="text-6xl md:text-8xl font-serif font-light text-white leading-none tracking-tight"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, delay: 0.2, ease: EC }}
              >
                Actualités
              </motion.h1>
            </div>
            <p className="text-white/60 text-sm font-light mt-5 max-w-sm">
              L'univers de l'immobilier d'exception décrypté par nos experts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Category Filter — dynamic from API ── */}
      <section className="bg-white border-b border-[#8EA4AF]/12 sticky top-[64px] z-30">
        <div className="container mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {isLoading
              ? /* skeleton tabs while loading */
                ["Tous", "", "", ""].map((_, i) => (
                  <div
                    key={i}
                    className="px-5 py-4 shrink-0"
                  >
                    <div className={`h-2.5 bg-[#DCE0E7] animate-pulse rounded ${i === 0 ? "w-8" : "w-20"}`} />
                  </div>
                ))
              : categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-4 text-xs tracking-[0.15em] uppercase whitespace-nowrap transition-all duration-300 border-b-2 ${
                      activeCategory === cat
                        ? "border-[#8EA4AF] text-[#082634]"
                        : "border-transparent text-[#5C7480] hover:text-[#3B5661]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
          </div>
        </div>
      </section>

      {/* ── Articles ── */}
      <section className="py-20 bg-white min-h-screen">
        <div className="container mx-auto px-6">

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/3] bg-[#DCE0E7] animate-pulse" />
                  <div className="h-3 w-24 bg-[#DCE0E7] animate-pulse rounded" />
                  <div className="h-5 w-full bg-[#DCE0E7] animate-pulse rounded" />
                  <div className="h-4 w-3/4 bg-[#DCE0E7] animate-pulse rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Empty states */}
          {!isLoading && articles.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, ease: EC }}
              className="text-center py-28 border-y border-[#DCE0E7]"
            >
              <div className="w-10 h-10 border border-[#DCE0E7] flex items-center justify-center mx-auto mb-7">
                <Newspaper size={16} className="text-[#8EA4AF]" strokeWidth={1.4} />
              </div>
              <p className="text-[#082634] font-serif text-xl font-light mb-3">
                Aucun article publié pour le moment.
              </p>
              <p className="text-[#5C7480] font-light text-sm max-w-sm mx-auto">
                Revenez prochainement pour découvrir nos publications.
              </p>
            </motion.div>
          )}

          {!isLoading && articles.length > 0 && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 text-[#5C7480]"
            >
              <p className="text-2xl font-serif font-light">
                Aucun article dans cette catégorie.
              </p>
            </motion.div>
          )}

          {/* Article grid */}
          {!isLoading && filtered.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: EC }}
              >
                {/* Featured article */}
                {featured && (
                  <Link href={`/actualites/${featured.id}`}>
                    <motion.article
                      className="group grid grid-cols-1 md:grid-cols-2 mb-24 overflow-hidden border border-[#DCE0E7] hover:border-[#8EA4AF]/40 transition-colors duration-500"
                      whileHover={{ scale: 1.002 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="relative overflow-hidden aspect-[4/3] md:aspect-auto bg-[#DCE0E7]/50">
                        {featured.coverImageUrl ? (
                          <motion.img
                            src={featured.coverImageUrl}
                            alt={featured.title}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 1.2, ease: EC }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Newspaper size={32} className="text-[#8EA4AF]/40" strokeWidth={1} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-[#082634]/15 group-hover:bg-transparent transition-colors duration-700" />
                        {featured.category && (
                          <div className="absolute top-5 left-5">
                            <span className="bg-[#8EA4AF] text-[#082634] text-xs font-medium tracking-[0.15em] uppercase px-3 py-1">
                              {featured.category}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-10 md:p-14 flex flex-col justify-center bg-white border-l border-[#DCE0E7]">
                        <div className="flex items-center gap-2 text-[#5C7480] text-xs tracking-wider mb-6">
                          <Calendar size={11} />
                          <time dateTime={featured.publishedAt ?? ""}>
                            {featured.publishedAt
                              ? format(new Date(featured.publishedAt), "dd MMMM yyyy", { locale: fr })
                              : ""}
                          </time>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif text-[#082634] mb-5 group-hover:text-[#5C7480] transition-colors duration-500 leading-snug font-light">
                          {featured.title}
                        </h2>
                        {featured.excerpt && (
                          <p className="text-[#3B5661] font-light leading-relaxed mb-8 line-clamp-3 text-sm">
                            {featured.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-[#5C7480] text-xs tracking-[0.15em] uppercase">
                          Lire l'article{" "}
                          <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                )}

                {/* Rest of articles */}
                {rest.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {rest.map((article, index) => (
                      <motion.article
                        key={article.id}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: index * 0.08, ease: EC }}
                        className="group"
                      >
                        <Link href={`/actualites/${article.id}`}>
                          <div className="relative overflow-hidden aspect-[4/3] mb-5 bg-[#DCE0E7]/50">
                            {article.coverImageUrl ? (
                              <motion.img
                                src={article.coverImageUrl}
                                alt={article.title}
                                className="w-full h-full object-cover"
                                whileHover={{ scale: 1.06 }}
                                transition={{ duration: 1, ease: EC }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Newspaper size={24} className="text-[#8EA4AF]/40" strokeWidth={1} />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/8 group-hover:bg-transparent transition-colors duration-700" />
                            {article.category && (
                              <div className="absolute top-4 left-4">
                                <span className="bg-white/85 backdrop-blur-sm border border-white/50 text-[#082634] text-xs tracking-[0.15em] uppercase px-3 py-1">
                                  {article.category}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[#5C7480] text-xs tracking-wider mb-3">
                            <Calendar size={11} />
                            <time dateTime={article.publishedAt ?? ""}>
                              {article.publishedAt
                                ? format(new Date(article.publishedAt), "dd MMMM yyyy", { locale: fr })
                                : ""}
                            </time>
                          </div>
                          <h3 className="text-xl font-serif text-[#082634] mb-3 group-hover:text-[#5C7480] transition-colors duration-500 line-clamp-2 leading-snug font-light">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-[#3B5661] text-sm font-light line-clamp-2 mb-4 leading-relaxed">
                              {article.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-[#5C7480] text-xs tracking-[0.15em] uppercase">
                            Lire{" "}
                            <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Link>
                      </motion.article>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>
    </Layout>
  );
}
