import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Ensure search engine crawlers (Googlebot Smartphone, URL Inspection, Lighthouse)
// see all animated/in-view elements at full opacity on frame 0 without altering
// animations for human visitors.
if (typeof window !== "undefined" && typeof navigator !== "undefined") {
  const ua = navigator.userAgent || "";
  if (/bot|googlebot|crawler|spider|robot|crawling|lighthouse|inspection/i.test(ua)) {
    const style = document.createElement("style");
    style.id = "seo-crawler-visibility";
    style.textContent = `
      [style*="opacity: 0"], [style*="opacity:0"] {
        opacity: 1 !important;
        transform: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
