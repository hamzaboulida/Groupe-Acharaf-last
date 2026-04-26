import React, { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useParams, Link } from "wouter";
import { useGetArticle, getGetArticleQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, Tag } from "lucide-react";

const EC = [0.22, 1, 0.36, 1] as const;

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const articleId = id ? Number(id) : 0;

  const { data: article, isLoading, isError } = useGetArticle(articleId, {
    query: { queryKey: getGetArticleQueryKey(articleId), enabled: !!articleId },
  });

  /* SEO */
  useEffect(() => {
    if (article) {
      document.title = article.metaTitle ?? `${article.title} | Groupe Acharaf`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          "content",
          article.metaDescription ?? article.excerpt ?? ""
        );
      }
    }
  }, [article]);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <Layout>
        <div className="pt-40 pb-24 bg-white min-h-screen">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="h-3 w-32 bg-[#DCE0E7] animate-pulse rounded mb-6" />
            <div className="h-10 w-full bg-[#DCE0E7] animate-pulse rounded mb-3" />
            <div className="h-10 w-3/4 bg-[#DCE0E7] animate-pulse rounded mb-12" />
            <div className="aspect-[16/7] w-full bg-[#DCE0E7] animate-pulse mb-12" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`h-3 bg-[#DCE0E7] animate-pulse rounded ${i === 3 ? "w-2/3" : "w-full"}`} />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  /* ── Not found ── */
  if (isError || !article) {
    return (
      <Layout>
        <div className="pt-40 pb-24 bg-white min-h-screen flex items-start">
          <div className="container mx-auto px-6 max-w-3xl">
            <p className="text-[#8EA4AF] text-xs tracking-[0.2em] uppercase mb-6">Article introuvable</p>
            <h1 className="text-4xl font-serif font-light text-[#082634] mb-6">
              Cet article n'existe pas ou a été retiré.
            </h1>
            <Link
              href="/actualites"
              className="inline-flex items-center gap-2 text-[#5C7480] text-xs tracking-[0.15em] uppercase hover:text-[#082634] transition-colors"
            >
              <ArrowLeft size={12} /> Retour aux actualités
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="bg-white min-h-screen">
        {/* ── Header ── */}
        <div className="pt-36 pb-12 bg-white">
          <div className="container mx-auto px-6 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EC }}
            >
              {/* Back link */}
              <Link
                href="/actualites"
                className="inline-flex items-center gap-2 text-[#5C7480] text-[10px] tracking-[0.18em] uppercase hover:text-[#082634] transition-colors mb-10 group"
              >
                <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
                Actualités
              </Link>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-7">
                {article.category && (
                  <span className="inline-flex items-center gap-1.5 bg-[#DCE0E7] text-[#3B5661] text-[10px] font-medium tracking-[0.15em] uppercase px-3 py-1.5">
                    <Tag size={9} strokeWidth={2} />
                    {article.category}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-[#5C7480] text-xs">
                  <Calendar size={11} strokeWidth={1.5} />
                  <time dateTime={article.publishedAt ?? ""}>
                    {article.publishedAt
                      ? format(new Date(article.publishedAt), "dd MMMM yyyy", { locale: fr })
                      : ""}
                  </time>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-[#082634] leading-tight mb-6">
                {article.title}
              </h1>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-[#3B5661] font-light text-lg leading-relaxed max-w-2xl border-l-2 border-[#8EA4AF]/40 pl-5">
                  {article.excerpt}
                </p>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── Cover image ── */}
        {article.coverImageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2, ease: EC }}
            className="w-full aspect-[21/8] relative overflow-hidden mb-16"
          >
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/8" />
          </motion.div>
        )}

        {/* ── Content ── */}
        <div className="container mx-auto px-6 max-w-3xl pb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: EC }}
            className={`
              prose max-w-none
              prose-headings:font-serif prose-headings:font-light prose-headings:text-[#082634]
              prose-h2:text-3xl prose-h3:text-2xl
              prose-p:text-[#3B5661] prose-p:font-light prose-p:leading-[1.9] prose-p:text-base
              prose-a:text-[#082634] prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-[#5C7480]
              prose-strong:text-[#082634] prose-strong:font-medium
              prose-ul:text-[#3B5661] prose-ol:text-[#3B5661]
              prose-li:font-light prose-li:leading-relaxed
              prose-blockquote:border-l-[#8EA4AF] prose-blockquote:text-[#5C7480] prose-blockquote:font-light prose-blockquote:italic
              prose-img:shadow-[0_10px_40px_rgba(0,0,0,0.08)]
              prose-hr:border-[#DCE0E7]
            `}
            dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
          />

          {/* ── Footer divider & back link ── */}
          <div className="mt-20 pt-8 border-t border-[#DCE0E7]">
            <Link
              href="/actualites"
              className="inline-flex items-center gap-2.5 text-[#5C7480] text-xs tracking-[0.15em] uppercase hover:text-[#082634] transition-colors group"
            >
              <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
              Retour aux actualités
            </Link>
          </div>
        </div>
      </article>
    </Layout>
  );
}
