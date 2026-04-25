import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À Propos" },
  { href: "/nos-marques", label: "Nos Marques" },
  { href: "/nos-projets", label: "Projets" },
  { href: "/actualites", label: "Actualités" },
  { href: "/carrieres", label: "Carrières" },
];

/** Pages where the navbar should be transparent while the hero is visible */
function isHeroPage(path: string) {
  return (
    path === "/" ||
    path === "/a-propos" ||
    /^\/nos-projets\/.+/.test(path)
  );
}

export function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled]         = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Recalculate scroll position on route change (SPA navigation) */
  useEffect(() => {
    setScrolled(window.scrollY > 60);
    setMobileMenuOpen(false);
  }, [location]);

  const hero        = isHeroPage(location);
  const transparent = hero && !scrolled && !mobileMenuOpen;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        transparent
          ? "bg-transparent border-b border-transparent shadow-none"
          : "bg-white border-b border-[#8EA4AF]/15",
        !transparent && scrolled ? "shadow-sm" : ""
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between py-5">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div
            className={cn(
              "font-serif text-xl font-medium tracking-[0.15em] uppercase transition-colors duration-500",
              transparent ? "text-white" : "text-[#082634]"
            )}
          >
            Groupe{" "}
            <span
              className={cn(
                "font-light transition-colors duration-500",
                transparent ? "text-white/65" : "text-[#8EA4AF]"
              )}
            >
              Acharaf
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-xs font-normal tracking-[0.12em] uppercase transition-colors duration-300",
                transparent
                  ? location === link.href
                    ? "text-white"
                    : "text-white/55 hover:text-white/90"
                  : location === link.href
                    ? "text-[#082634]"
                    : "text-[#082634]/40 hover:text-[#082634]/75"
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* CTA — Contact */}
          <Link
            href="/contact"
            className={cn(
              "px-6 py-2.5 text-xs font-light uppercase tracking-[0.14em] transition-all duration-500",
              transparent
                ? "border border-white/40 text-white hover:bg-white/10 hover:border-white/70"
                : "border border-[#082634]/25 text-[#082634] hover:bg-[#082634]/5 hover:border-[#082634]/45"
            )}
          >
            Contact
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className={cn(
            "md:hidden transition-colors",
            transparent
              ? "text-white/80 hover:text-white"
              : "text-[#082634]/60 hover:text-[#082634]"
          )}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-[#8EA4AF]/15 shadow-md p-8 flex flex-col gap-7 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "font-serif text-xl tracking-[0.08em] uppercase transition-colors",
                location === link.href ? "text-[#082634]" : "text-[#082634]/40"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="inline-block w-max px-6 py-3 border border-[#082634]/25 text-[#082634] text-xs font-light uppercase tracking-[0.14em] hover:bg-[#082634]/5 transition-all"
          >
            Nous contacter
          </Link>
        </div>
      )}
    </header>
  );
}
