import React, { useState } from "react";
import { Link } from "wouter";
import { Send, Instagram, Linkedin, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const col1 = [
  { href: "/a-propos", label: "Notre Maison" },
  { href: "/nos-marques", label: "Nos Marques" },
  { href: "/nos-marques?brand=acharaf", label: "Acharaf Immobilier" },
  { href: "/nos-projets", label: "Galerie de Projets" },
];
const col2 = [
  { href: "/actualites", label: "Actualités" },
  { href: "/carrieres", label: "Carrières" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: "newsletter_signup" });
    }
    toast({ title: "Inscription réussie", description: "Vous êtes maintenant abonné à notre newsletter." });
    setEmail("");
  };

  return (
    <footer className="relative bg-white border-t border-[#8EA4AF]/15 overflow-hidden">
      <div className="relative z-10">
        {/* Top CTA band */}
        <div className="border-b border-[#8EA4AF]/10">
          <div className="container mx-auto px-6 md:px-12 py-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="max-w-md"
            >
              <p className="text-xs tracking-[0.2em] uppercase text-[#5C7480] mb-4">Newsletter</p>
              <h3 className="font-serif text-3xl text-[#082634] font-light leading-snug">
                L'Art de Vivre,<br />en avant-première.
              </h3>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15 }}
              onSubmit={handleNewsletterSubmit}
              className="flex w-full lg:w-auto"
            >
              <input
                type="email"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#DCE0E7]/40 border border-[#8EA4AF]/20 text-[#082634] px-5 py-3.5 w-full lg:w-72 focus:outline-none focus:border-[#8EA4AF]/60 transition-colors placeholder:text-[#082634]/45 text-sm font-light"
                required
              />
              <button
                type="submit"
                className="bg-[#082634] text-white px-5 py-3.5 hover:bg-[#0a3548] transition-colors flex-shrink-0 flex items-center gap-2"
              >
                <Send size={13} />
              </button>
            </motion.form>
          </div>
        </div>

        {/* Main footer body */}
        <div className="container mx-auto px-6 md:px-12 py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
            {/* Brand column */}
            <div className="md:col-span-5">
              <Link href="/" className="block mb-8">
                <span className="font-serif text-2xl font-medium tracking-[0.15em] uppercase text-[#082634]">
                  Groupe <span className="text-[#8EA4AF] font-light">Acharaf</span>
                </span>
              </Link>
              <p className="text-[#3B5661] text-sm font-light leading-relaxed max-w-xs mb-10">
                Créateur d'espaces de vie d'exception au Maroc. L'alliance entre héritage architectural et vision contemporaine.
              </p>
              <div className="flex gap-3">
                <a href="#" aria-label="Instagram" className="w-8 h-8 border border-[#8EA4AF]/20 flex items-center justify-center text-[#5C7480] hover:text-[#082634] hover:border-[#8EA4AF]/45 transition-all duration-300">
                  <Instagram size={13} />
                </a>
                <a href="#" aria-label="LinkedIn" className="w-8 h-8 border border-[#8EA4AF]/20 flex items-center justify-center text-[#5C7480] hover:text-[#082634] hover:border-[#8EA4AF]/45 transition-all duration-300">
                  <Linkedin size={13} />
                </a>
              </div>
            </div>

            {/* Nav columns */}
            <div className="md:col-span-3">
              <h4 className="text-xs tracking-[0.2em] uppercase text-[#5C7480] mb-7">Découvrir</h4>
              <ul className="space-y-4">
                {col1.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="group flex items-center gap-2 text-[#3B5661] hover:text-[#082634] transition-colors text-sm font-light">
                      <span className="w-0 group-hover:w-3 h-px bg-[#8EA4AF] transition-all duration-300 overflow-hidden" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-xs tracking-[0.2em] uppercase text-[#5C7480] mb-7">Accès</h4>
              <ul className="space-y-4">
                {col2.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="group flex items-center gap-2 text-[#3B5661] hover:text-[#082634] transition-colors text-sm font-light">
                      <span className="w-0 group-hover:w-3 h-px bg-[#8EA4AF] transition-all duration-300 overflow-hidden" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-xs tracking-[0.2em] uppercase text-[#5C7480] mb-7">Contact</h4>
              <ul className="space-y-5 text-sm text-[#3B5661] font-light">
                <li className="flex flex-col gap-1 leading-relaxed">Boulevard d'Anfa<br />Casablanca, Maroc</li>
                <li>contact@groupeacharaf.ma</li>
                <li>+212 522 00 00 00</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#8EA4AF]/10">
          <div className="container mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#5C7480] font-light">
            <span>&copy; {new Date().getFullYear()} Groupe Acharaf — Tous droits réservés</span>
            <div className="flex gap-6">
              <Link href="/mentions-legales" className="hover:text-[#082634]/50 transition-colors tracking-wide">Mentions légales</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
