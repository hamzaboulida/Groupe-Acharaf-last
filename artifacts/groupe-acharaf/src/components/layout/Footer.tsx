import React from "react";
import { Link } from "wouter";
import { Instagram, Linkedin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const col1 = [
  { href: "/a-propos", label: "Groupe" },
  { href: "/nos-marques", label: "Marques" },
  { href: "/projets", label: "Projets" },
];
const col2 = [
  { href: "/opportunites", label: "Opportunités" },
  { href: "/carrieres", label: "Carrières" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="relative bg-[#F7F9FA] border-t border-[#8EA4AF]/14 overflow-hidden">
      <div className="relative z-10">
        {/* Main footer body */}
        <div className="container mx-auto px-6 md:px-12 py-14 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
            {/* Brand column */}
            <div className="md:col-span-5">
              <Link href="/" className="block mb-8">
                <span className="font-serif text-2xl font-medium tracking-[0.15em] uppercase text-[#082634]">
                  Groupe <span className="text-[#8EA4AF] font-light">Acharaf</span>
                </span>
              </Link>
              <p className="text-[#082634] text-sm font-light leading-relaxed max-w-xs mb-10">
                Créateur d'espaces de vie d'exception au Maroc. L'alliance entre héritage architectural et vision contemporaine.
              </p>
              <div className="flex gap-3">
                <a href="#" aria-label="Instagram" className="w-8 h-8 border border-[#8EA4AF]/20 flex items-center justify-center text-[#8EA4AF] hover:text-[#082634] hover:border-[#8EA4AF]/45 transition-all duration-300">
                  <Instagram size={13} />
                </a>
                <a href="https://www.linkedin.com/company/groupeacharaf/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-8 h-8 border border-[#8EA4AF]/20 flex items-center justify-center text-[#8EA4AF] hover:text-[#082634] hover:border-[#8EA4AF]/45 transition-all duration-300">
                  <Linkedin size={13} />
                </a>
              </div>
            </div>

            {/* Nav columns */}
            <div className="md:col-span-3">
              <h4 className="text-xs tracking-[0.2em] uppercase text-[#8EA4AF] mb-7">Découvrir</h4>
              <ul className="space-y-4">
                {col1.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="group flex items-center gap-2 text-[#082634] hover:text-[#082634] transition-colors text-sm font-light">
                      <span className="w-0 group-hover:w-3 h-px bg-[#8EA4AF] transition-all duration-300 overflow-hidden" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-xs tracking-[0.2em] uppercase text-[#8EA4AF] mb-7">Accès</h4>
              <ul className="space-y-4">
                {col2.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="group flex items-center gap-2 text-[#082634] hover:text-[#082634] transition-colors text-sm font-light">
                      <span className="w-0 group-hover:w-3 h-px bg-[#8EA4AF] transition-all duration-300 overflow-hidden" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-xs tracking-[0.2em] uppercase text-[#8EA4AF] mb-7">Contact</h4>
              <ul className="space-y-5 text-sm text-[#082634] font-light">
                <li className="flex flex-col gap-1 leading-relaxed">
                  <a
                    href="https://www.google.com/maps/search/461%20R322%2C%20Casablanca%2020100%2C%20Maroc/@33.60371017456055,-7.580126762390137,17z?hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#8EA4AF] transition-colors"
                  >
                    465, Avenue Ambassadeur Ben Aïcha<br />Roches Noires - 20300 Casablanca
                  </a>
                </li>
                <li>
                  <a href="mailto:infos@groupeacharaf.ma" className="hover:text-[#8EA4AF] transition-colors">
                    infos@groupeacharaf.ma
                  </a>
                </li>
                <li>
                  <a href="tel:+212522406848" className="hover:text-[#8EA4AF] transition-colors">
                    05 22 40 68 48
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#8EA4AF]/10">
          <div className="container mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8EA4AF] font-light">
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
