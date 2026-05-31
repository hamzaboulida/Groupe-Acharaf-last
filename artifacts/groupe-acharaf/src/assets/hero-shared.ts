import hero768Jpg from "./heroes/hero-shared-768.jpg";
import hero1280Jpg from "./heroes/hero-shared-1280.jpg";
import hero1920Jpg from "./heroes/hero-shared-1920.jpg";
import hero768Webp from "./heroes/hero-shared-768.webp";
import hero1280Webp from "./heroes/hero-shared-1280.webp";
import hero1920Webp from "./heroes/hero-shared-1920.webp";

export const sharedHeroImage = {
  src: hero1920Jpg,
  srcSetJpg: `${hero768Jpg} 768w, ${hero1280Jpg} 1280w, ${hero1920Jpg} 1920w`,
  srcSetWebp: `${hero768Webp} 768w, ${hero1280Webp} 1280w, ${hero1920Webp} 1920w`,
  heroSizes: "100vw",
};

