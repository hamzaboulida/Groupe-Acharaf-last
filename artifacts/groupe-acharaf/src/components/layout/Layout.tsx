import React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { motion, AnimatePresence } from "framer-motion";
import { SITE_NAME, SITE_URL, useStructuredData } from "@/lib/structured-data";

const pageVariants = {
  initial: { opacity: 0, filter: "blur(4px)", scale: 0.995 },
  in:      { opacity: 1, filter: "blur(0px)", scale: 1 },
  out:     { opacity: 0, filter: "blur(4px)", scale: 1.005 },
};

const pageTransition = {
  type: "tween",
  ease: [0.22, 1, 0.36, 1],
  duration: 0.75,
};

export function Layout({
  children,
  hideFooter = false,
}: {
  children: React.ReactNode;
  hideFooter?: boolean;
}) {
  useStructuredData("ga-site-organization", [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      sameAs: [],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "fr-MA",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/nos-projets?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": ["RealEstateAgent", "LocalBusiness"],
      name: SITE_NAME,
      url: SITE_URL,
      areaServed: "MA",
      telephone: "+212522406848",
      image: `${SITE_URL}/og-default.jpg`,
    },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#082634] text-white">
      <Navbar />
      <motion.main
        className="flex-1"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.main>
      <AnimatePresence>
        {!hideFooter && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating WhatsApp ── */}
      <motion.a
        href="https://wa.me/212522406848"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Nous contacter sur WhatsApp"
        className="fixed bottom-5 right-4 md:bottom-8 md:right-8 z-50 group"
        initial={{ opacity: 0, scale: 0.8, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
      >
        {/* Outer ring — pulses on hover */}
        <span className="absolute inset-0 rounded-full border border-[#8EA4AF]/20 scale-100 group-hover:scale-125 group-hover:opacity-0 transition-all duration-700" />
        {/* Button body */}
        <span className="relative flex items-center justify-center rounded-full bg-[#082634] border border-[#8EA4AF]/25 shadow-[0_8px_32px_rgba(8,38,52,0.35),0_0_0_1px_rgba(142,164,175,0.12)] group-hover:border-[#8EA4AF]/50 transition-all duration-500"
          style={{ width: "3rem", height: "3rem" }}>
          {/* WhatsApp SVG — cleaner than icon library version */}
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
              fill="#8EA4AF"
            />
          </svg>
        </span>
      </motion.a>
    </div>
  );
}
