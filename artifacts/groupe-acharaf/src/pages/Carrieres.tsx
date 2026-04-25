import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useListCareers, useApplyForCareer } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { MapPin, Briefcase } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";

const EC = [0.22, 1, 0.36, 1] as const;

type ApplicationForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
};

const TYPE_LABEL: Record<string, string> = {
  "full-time": "CDI",
  "part-time": "Temps partiel",
  internship: "Stage",
  freelance: "Freelance",
};

/* ── Career Card ─────────────────────────────────────────── */
function CareerCard({
  career,
  onApply,
}: {
  career: NonNullable<ReturnType<typeof useListCareers>["data"]>[0];
  onApply: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      layout
      className="border-b border-[#DCE0E7] last:border-b-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-7 flex items-center justify-between gap-6 group"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {career.department && (
              <span className="text-[#5C7480] text-[10px] tracking-[0.18em] uppercase">
                {career.department}
              </span>
            )}
            {career.type && (
              <>
                <span className="text-[#8EA4AF]/50">·</span>
                <span className="text-[#5C7480] text-[10px] tracking-[0.15em] uppercase">
                  {TYPE_LABEL[career.type] ?? career.type}
                </span>
              </>
            )}
            {career.location && (
              <>
                <span className="text-[#8EA4AF]/50">·</span>
                <span className="flex items-center gap-1 text-[#5C7480] text-[10px]">
                  <MapPin size={10} strokeWidth={1.5} />
                  {career.location}
                </span>
              </>
            )}
          </div>
          <h3 className="text-[#082634] text-lg md:text-xl font-serif font-light group-hover:text-[#3B5661] transition-colors duration-300">
            {career.title}
          </h3>
        </div>
        <span
          className={`text-[#8EA4AF] text-2xl flex-shrink-0 transition-transform duration-400 ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EC }}
            className="overflow-hidden"
          >
            <div className="pb-8">
              {career.description && (
                <p className="text-[#3B5661] leading-relaxed mb-6 font-light text-sm max-w-2xl">
                  {career.description}
                </p>
              )}
              {career.requirements && career.requirements.length > 0 && (
                <div className="mb-7">
                  <h4 className="text-[#3B5661] text-[10px] tracking-[0.18em] uppercase mb-4">
                    Profil recherché
                  </h4>
                  <ul className="space-y-2">
                    {career.requirements.map((r, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-[#3B5661] text-sm font-light"
                      >
                        <span className="w-1 h-1 bg-[#8EA4AF] flex-shrink-0 mt-2 rounded-full" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={onApply}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#082634] text-white text-xs font-medium tracking-[0.15em] uppercase hover:bg-[#0a3245] transition-colors duration-300"
              >
                Postuler
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Application Modal ───────────────────────────────────── */
function ApplicationModal({
  careerId,
  title,
  onClose,
}: {
  careerId: number;
  title: string;
  onClose: () => void;
}) {
  const apply = useApplyForCareer();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationForm>();
  const [sent, setSent] = useState(false);

  async function onSubmit(data: ApplicationForm) {
    await apply.mutateAsync({ id: careerId, data });
    setSent(true);
  }

  const inputClass =
    "w-full bg-white/4 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#8EA4AF]/40 transition-colors placeholder:text-white/40 font-light";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#080629]/90 backdrop-blur-md z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.45, ease: EC }}
        className="bg-[#082634] border border-[#8EA4AF]/10 p-8 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {!sent ? (
          <>
            <p className="text-[#8EA4AF]/80 text-xs tracking-[0.2em] uppercase mb-2">
              Candidature
            </p>
            <h2 className="text-white font-serif text-2xl mb-7 font-light">
              {title}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    placeholder="Prénom *"
                    {...register("firstName", { required: true })}
                    className={inputClass}
                  />
                  {errors.firstName && (
                    <span className="text-red-400 text-xs mt-1 block">Requis</span>
                  )}
                </div>
                <div>
                  <input
                    placeholder="Nom *"
                    {...register("lastName", { required: true })}
                    className={inputClass}
                  />
                  {errors.lastName && (
                    <span className="text-red-400 text-xs mt-1 block">Requis</span>
                  )}
                </div>
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email *"
                  {...register("email", { required: true })}
                  className={inputClass}
                />
                {errors.email && (
                  <span className="text-red-400 text-xs mt-1 block">Requis</span>
                )}
              </div>
              <input
                placeholder="Téléphone"
                {...register("phone")}
                className={inputClass}
              />
              <textarea
                rows={4}
                placeholder="Lettre de motivation…"
                {...register("message")}
                className={`${inputClass} resize-none`}
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={apply.isPending}
                  className="flex-1 bg-[#8EA4AF] text-[#082634] py-3 text-xs font-medium tracking-[0.15em] uppercase hover:bg-[#B2BED0] transition-colors disabled:opacity-50"
                >
                  {apply.isPending ? "Envoi…" : "Envoyer ma candidature"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 border border-white/20 text-white/55 text-xs uppercase tracking-wider hover:border-white/35 hover:text-white/75 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="w-12 h-12 border border-[#8EA4AF]/30 flex items-center justify-center mx-auto mb-6">
              <span className="text-[#8EA4AF] text-lg">✓</span>
            </div>
            <h3 className="text-white font-serif text-2xl mb-3 font-light">
              Candidature envoyée
            </h3>
            <p className="text-white/60 mb-7 font-light text-sm leading-relaxed">
              Nous avons bien reçu votre dossier pour le poste de {title}.
              Notre équipe RH vous contactera sous 48h.
            </p>
            <button
              onClick={onClose}
              className="border border-white/20 text-white/55 px-6 py-2 text-xs uppercase tracking-wider hover:border-white/35 hover:text-white/75 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function Carrieres() {
  const { data: careers = [], isLoading } = useListCareers({ active: true });
  const [selectedCareer, setSelectedCareer] = useState<{
    id: number;
    title: string;
  } | null>(null);

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative h-[65vh] w-full flex items-end pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt=""
            className="w-full h-full object-cover scale-105 brightness-[0.72]"
          />
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
            <p className="text-[#8EA4AF] text-xs tracking-[0.2em] uppercase mb-6 opacity-80">
              Rejoignez-nous
            </p>
            <div className="overflow-hidden">
              <motion.h1
                className="text-6xl md:text-8xl font-serif font-light text-white leading-none tracking-tight"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, delay: 0.2, ease: EC }}
              >
                Carrières
              </motion.h1>
            </div>
            <p className="text-white/60 text-sm font-light mt-5 max-w-sm leading-relaxed">
              Construisez votre avenir au sein d'un groupe qui façonne
              l'immobilier d'exception au Maroc.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Offres ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EC }}
            className="mb-14"
          >
            <p className="text-[#5C7480] text-[10px] tracking-[0.22em] uppercase mb-4">
              Offres disponibles
            </p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl md:text-4xl font-serif font-light text-[#082634]">
                Postes ouverts
              </h2>
              {!isLoading && careers.length > 0 && (
                <span className="text-[#8EA4AF] font-light text-lg">
                  ({careers.length})
                </span>
              )}
            </div>
          </motion.div>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-0">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border-b border-[#DCE0E7] py-7"
                >
                  <div className="h-3 w-32 bg-[#DCE0E7] animate-pulse mb-3 rounded" />
                  <div className="h-5 w-64 bg-[#DCE0E7] animate-pulse rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && careers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, ease: EC }}
              className="py-20 border-y border-[#DCE0E7] text-center"
            >
              <div className="w-10 h-10 border border-[#DCE0E7] flex items-center justify-center mx-auto mb-7">
                <Briefcase size={16} className="text-[#8EA4AF]" strokeWidth={1.4} />
              </div>
              <p className="text-[#082634] font-serif text-xl font-light mb-3">
                Aucune offre disponible pour le moment.
              </p>
              <p className="text-[#5C7480] font-light text-sm leading-relaxed max-w-sm mx-auto">
                Nous vous invitons à revenir prochainement pour découvrir
                nos futures opportunités.
              </p>
            </motion.div>
          )}

          {/* List */}
          {!isLoading && careers.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.07 } },
              }}
              className="border-t border-[#DCE0E7]"
            >
              {careers.map((career) => (
                <motion.div
                  key={career.id}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EC } },
                  }}
                >
                  <CareerCard
                    career={career}
                    onApply={() =>
                      setSelectedCareer({ id: career.id, title: career.title })
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Application Modal ── */}
      <AnimatePresence>
        {selectedCareer && (
          <ApplicationModal
            careerId={selectedCareer.id}
            title={selectedCareer.title}
            onClose={() => setSelectedCareer(null)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
