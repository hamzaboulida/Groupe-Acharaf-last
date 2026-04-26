import React from "react";
import { Layout } from "@/components/layout/Layout";
import { motion, useScroll, useTransform } from "framer-motion";
import { useGetStats } from "@workspace/api-client-react";
import { CountUp } from "@/components/ui/count-up";
import { Link } from "wouter";
import { ArrowRight, Trophy, Target, Users } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";

const EC_EASE = [0.22, 1, 0.36, 1] as const;
const fade = (delay = 0, duration = 1) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" } as const,
  transition: { duration, delay, ease: EC_EASE },
});

export default function APropos() {
  const { data: stats } = useGetStats();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 900], [0, 180]);

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative h-screen w-full flex items-end pb-36 lg:pb-48 overflow-hidden">

        {/* Parallax wrapper + slow continuous zoom — both run independently */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: y1 }}
          animate={{ scale: [1.06, 1.14] }}
          transition={{ duration: 16, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
        >
          <img
            src={heroBg}
            alt=""
            className="w-full h-full object-cover brightness-[0.70]"
          />
        </motion.div>

        {/* ── Overlay system — refined cinematic layers ── */}
        {/* 1. Subtle uniform base — lifts overall contrast without crushing image */}
        <div className="absolute inset-0 bg-black/18" />
        {/* 2. Top-to-bottom vignette — clears in the middle to let image breathe */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/45" />
        {/* 3. Left-side directional depth for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
        {/* 4. Radial scrim anchored bottom-left — ensures text always readable */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_50%_at_25%_95%,rgba(0,0,0,0.40)_0%,transparent_65%)]" />

        {/* ── Content ── */}
        <div className="relative z-10 container mx-auto px-6">

          {/* Kicker — letterSpacing expands inward on load */}
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.48em" }}
            animate={{ opacity: 1, letterSpacing: "0.22em" }}
            transition={{ duration: 1.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[#8EA4AF] text-[10px] tracking-[0.22em] uppercase mb-8 opacity-72">
              Notre Héritage
            </p>
          </motion.div>

          {/* Headline — clip-reveal slide up */}
          <div className="overflow-hidden mb-7">
            <motion.h1
              className="text-6xl md:text-8xl lg:text-9xl font-serif font-light text-white leading-[0.92] tracking-tight max-w-4xl"
              initial={{ y: "105%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.35, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              Forger l'avenir<br />de l'immobilier<br />d'exception
            </motion.h1>
          </div>

          {/* Supporting line — delayed fade */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
            className="text-white/55 font-light text-sm max-w-xs leading-relaxed"
          >
            Deux décennies d'excellence au service de l'immobilier marocain de prestige.
          </motion.p>

        </div>
      </section>

      {/* ── Narrative — LIGHT BREATHING SECTION ── */}
      <section className="py-36 bg-[#DCE0E7] relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-xs tracking-[0.2em] uppercase text-[#5C7480] mb-6">Notre Histoire</p>
              <h2 className="text-4xl md:text-5xl font-serif text-[#082634] mb-8 leading-tight font-light">
                Une passion pour la perfection, transmise de génération en génération.
              </h2>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "2.5rem" }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-px bg-[#082634]/25 mb-8"
              />
              <div className="space-y-5 text-[#3B5661] font-light leading-relaxed text-sm">
                <p>Depuis plus de deux décennies, Groupe Acharaf sculpte le paysage urbain marocain. Notre mission dépasse la simple construction de murs ; nous créons des espaces de vie où l'art, le confort et le prestige se rencontrent pour définir une nouvelle norme d'excellence.</p>
                <p>Né de la vision d'un bâtisseur passionné, le groupe s'est développé autour d'une conviction profonde : chaque projet doit être unique, pensé pour ses futurs occupants et respectueux de son environnement.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="aspect-[4/5] overflow-hidden bg-[#082634]/10 relative group">
                <motion.img
                  src={heroBg}
                  alt="Vision"
                  className="w-full h-full object-cover brightness-75"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
                <div className="absolute inset-0 bg-[#082634]/10 group-hover:bg-transparent transition-colors duration-700" />
              </div>
              <div className="absolute -bottom-8 -left-6 bg-[#082634] text-white p-8 w-52">
                <div className="text-5xl font-serif mb-2 font-light">20+</div>
                <div className="text-xs uppercase tracking-[0.15em] text-[#8EA4AF]">Années d'excellence</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-36 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <motion.div {...fade(0)}>
              <p className="text-xs tracking-[0.2em] uppercase text-[#5C7480] mb-5">Notre ADN</p>
              <h2 className="text-4xl md:text-6xl font-serif text-[#082634] mb-6 font-light">Les Piliers du Groupe</h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#8EA4AF]/12">
            {[
              { icon: <Trophy size={22} />, title: "L'Excellence", desc: "La recherche constante de la perfection dans les finitions, le choix des matériaux et le design architectural." },
              { icon: <Target size={22} />, title: "L'Innovation", desc: "Intégrer les dernières avancées technologiques et architecturales pour un habitat durable et intelligent." },
              { icon: <Users size={22} />, title: "L'Humain", desc: "Placer le bien-être de nos clients au centre de toute réflexion conceptuelle et opérationnelle." },
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.12 }}
                className="bg-white p-12 hover:bg-[#DCE0E7] transition-colors duration-700 group"
              >
                <div className="text-[#8EA4AF] mb-8 group-hover:text-[#082634]/50 transition-colors">{value.icon}</div>
                <h3 className="text-2xl font-serif text-[#082634] mb-4 font-light">{value.title}</h3>
                <p className="text-[#3B5661] font-light leading-relaxed text-sm">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-36 bg-[#DCE0E7]">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-24">
            <motion.div {...fade(0)}>
              <p className="text-xs tracking-[0.2em] uppercase text-[#5C7480] mb-5">Chronologie</p>
              <h2 className="text-4xl md:text-6xl font-serif text-[#082634] font-light">Jalons Historiques</h2>
            </motion.div>
          </div>

          <div className="max-w-4xl mx-auto relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#8EA4AF]/30 -translate-x-1/2 hidden md:block" />
            {[
              { year: "2000", title: "Fondation du Groupe", desc: "Création de Groupe Acharaf avec une première réalisation résidentielle à Casablanca." },
              { year: "2010", title: "Lancement Acharaf Immobilier", desc: "Structuration de la marque premium pour répondre à la demande croissante." },
              { year: "2018", title: "Création de la marque Estya", desc: "Naissance de notre signature ultra-luxe pour une clientèle internationale exigeante." },
              { year: "2023", title: "Expansion Nationale", desc: "Lancement de projets d'envergure à Rabat, Marrakech et Tanger." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8 }}
                className={`relative flex flex-col md:flex-row items-center gap-8 mb-16 last:mb-0 ${i % 2 === 0 ? "" : "md:flex-row-reverse"}`}
              >
                <div className={`w-full md:w-1/2 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <h3 className="text-xl font-serif mb-2 text-[#082634] font-light">{item.title}</h3>
                  <p className="text-[#3B5661] font-light text-sm leading-relaxed">{item.desc}</p>
                </div>
                <div className="w-14 h-14 bg-white border border-[#8EA4AF]/35 text-[#082634] flex items-center justify-center text-xs font-light tracking-wide z-10 shrink-0">
                  {item.year}
                </div>
                <div className="w-full md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Metrics & CTA ── */}
      <section className="py-20 md:py-28 bg-[#082634] text-center relative overflow-hidden">

        {/* ── Background depth layers ── */}
        {/* Primary radial — stays within #082634 family */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_52%,#0d3a4f_0%,#082634_68%)] opacity-65 pointer-events-none" />
        {/* Subtle top vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#082634]/40 via-transparent to-[#082634]/25 pointer-events-none" />

        {/* Breathing glow — primary, within brand colour family */}
        <motion.div
          animate={{ opacity: [0.4, 0.75, 0.4], scale: [1, 1.10, 1] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[rgba(13,60,80,0.6)] blur-[130px] pointer-events-none"
        />
        {/* Breathing glow — secondary, offset timing */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.12, 1] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-[rgba(10,48,66,0.55)] blur-[100px] pointer-events-none"
        />

        {/* Ghost watermark word */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[18vw] font-serif font-light text-white/[0.018] leading-none tracking-tighter">
            AVENIR
          </span>
        </div>

        <div className="container mx-auto px-6 relative z-10">

          {/* Stats row */}
          {stats && (
            <div className="flex flex-wrap justify-center gap-16 md:gap-40 mb-14">
              {[
                { value: stats.totalProjects,    label: "Projets initiés" },
                { value: stats.satisfiedClients, label: "Clients satisfaits" },
              ].map((s, i) => (
                <motion.div key={i} {...fade(i * 0.15)}>
                  <div className="text-7xl md:text-9xl font-serif text-white mb-3 font-light">
                    <CountUp end={s.value} duration={3} />
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[#8EA4AF]/80">{s.label}</div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Vertical thread divider */}
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: "2.5rem" }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="w-px bg-[#8EA4AF]/18 mx-auto mb-10"
          />

          {/* CTA content */}
          <div className="max-w-3xl mx-auto">
            <motion.p {...fade(0.1, 12)} className="text-[#8EA4AF]/70 text-[10px] tracking-[0.35em] uppercase mb-5">
              Notre invitation
            </motion.p>

            {/* Headline — overflow clip reveal */}
            <div className="overflow-hidden mb-7">
              <motion.h2
                initial={{ y: "105%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif font-light text-white leading-[1.06] tracking-tight"
                style={{ fontSize: "clamp(2.8rem, 5.8vw, 5.5rem)" }}
              >
                Écrivons ensemble<br />le prochain chapitre
              </motion.h2>
            </div>

            <motion.p {...fade(0.35, 14)} className="text-white/55 text-sm font-light max-w-sm mx-auto leading-relaxed mb-8">
              Nos conseillers sont à votre écoute pour transformer votre vision en réalité architecturale.
            </motion.p>

            {/* CTA button — premium treatment */}
            <motion.div {...fade(0.48, 10)}>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-4 px-10 py-5 border border-white/25 text-white/80 hover:border-[#8EA4AF]/60 hover:text-white hover:scale-[1.025] active:scale-[0.985] transition-all duration-500 text-[11px] tracking-[0.22em] uppercase"
              >
                Contactez-nous
                <ArrowRight size={12} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>

        </div>
      </section>
    </Layout>
  );
}
