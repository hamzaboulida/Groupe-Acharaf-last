import { db, brandsTable, projectsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { logger } from "./lib/logger";

const BRANDS = [
  {
    name: "Estya",
    slug: "estya",
    tagline: "L'art de vivre à son apogée",
    description:
      "Estya incarne l'immobilier de luxe absolu au Maroc — des résidences d'exception pensées pour une clientèle exigeante, où chaque détail architectural exprime une vision sans compromis.",
    segment: "luxury",
    accentColor: "#C9A96E",
  },
  {
    name: "Acharaf Immobilier",
    slug: "acharaf-immobilier",
    tagline: "Votre foyer, notre engagement",
    description:
      "Acharaf Immobilier conçoit des résidences accessibles et familiales dans les principales villes du Maroc, avec un soin particulier pour la qualité de vie et la durabilité.",
    segment: "premium",
    accentColor: "#082634",
  },
];

const PROJECTS = (estyaId: number, acharafId: number) => [
  // ── ESTYA ──────────────────────────────────────────────────────────
  {
    brandId: estyaId,
    title: "Villa Majorelle",
    slug: "villa-majorelle",
    description:
      "Une résidence d'exception nichée au cœur des jardins de Marrakech. Villa Majorelle incarne l'alliance parfaite entre l'architecture contemporaine et l'héritage artisanal marocain.",
    location: "Quartier Majorelle, Guéliz",
    city: "Marrakech",
    status: "ongoing",
    priceMin: 8500000,
    priceMax: 24000000,
    surfaceMin: 450,
    surfaceMax: 1200,
    deliveryDate: "T4 2025",
    featured: true,
    coverImageUrl:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=85",
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=85",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=85",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=85",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&q=85",
    ],
    amenities: [
      "Piscine à débordement",
      "Spa & hammam privé",
      "Jardin paysager avec fontaines",
      "Domotique intégrée",
      "Cave à vins climatisée",
      "Garage souterrain 4 véhicules",
      "Vue Atlas panoramique",
      "Finitions italiennes sur mesure",
    ],
  },
  {
    brandId: estyaId,
    title: "Résidence Anfa Heights",
    slug: "residence-anfa-heights",
    description:
      "Surplombant la corniche de Casablanca, Résidence Anfa Heights redéfinit le standing urbain. Chaque appartement bénéficie d'une vue imprenable sur l'Atlantique et d'une finition architecturale sans compromis.",
    location: "Boulevard de la Corniche, Ain Diab",
    city: "Casablanca",
    status: "upcoming",
    priceMin: 5200000,
    priceMax: 18000000,
    surfaceMin: 180,
    surfaceMax: 680,
    deliveryDate: "T2 2026",
    featured: true,
    coverImageUrl:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=85",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=85",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920&q=85",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=85",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=85",
    ],
    amenities: [
      "Terrasses panoramiques vue mer",
      "Concierge 24h/24",
      "Rooftop lounge & piscine",
      "Salle de fitness équipée",
      "Sécurité biométrique",
      "Parking privé sous-sol",
      "Lobby grand hôtel",
      "Système domotique Lutron",
    ],
  },
  {
    brandId: estyaId,
    title: "Les Terrasses de l'Agdal",
    slug: "terrasses-agdal",
    description:
      "Un projet de prestige au cœur diplomatique de Rabat. Penthouses et appartements d'exception articulés autour de terrasses végétalisées, à quelques minutes des ambassades et des institutions.",
    location: "Quartier Agdal",
    city: "Rabat",
    status: "completed",
    priceMin: 3800000,
    priceMax: 12500000,
    surfaceMin: 150,
    surfaceMax: 520,
    deliveryDate: "T1 2024",
    featured: false,
    coverImageUrl:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=85",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=85",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=85",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1920&q=85",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920&q=85",
    ],
    amenities: [
      "Terrasses végétalisées privatives",
      "Double hauteur sous plafond",
      "Baignoire îlot en marbre",
      "Cuisine équipée Boffi",
      "Parquet massif chêne français",
      "Gardiennage & vidéosurveillance",
      "Emplacement quartier diplomatique",
      "Livraison clés en main",
    ],
  },

  // ── ACHARAF IMMOBILIER ────────────────────────────────────────────
  {
    brandId: acharafId,
    title: "Résidence Al Andalous",
    slug: "residence-al-andalous",
    description:
      "Un cadre de vie familial pensé pour le confort du quotidien. Résidence Al Andalous propose des appartements lumineux dans un environnement verdoyant, à proximité des écoles et des commerces.",
    location: "Hay Salam, Route de Sefrou",
    city: "Fès",
    status: "ongoing",
    priceMin: 620000,
    priceMax: 1450000,
    surfaceMin: 68,
    surfaceMax: 160,
    deliveryDate: "T3 2025",
    featured: true,
    coverImageUrl:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&q=85",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&q=85",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=85",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1920&q=85",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1920&q=85",
    ],
    amenities: [
      "Espaces verts & aire de jeux",
      "Parking résidentiel sécurisé",
      "Ascenseur & accès PMR",
      "Proche écoles & centres commerciaux",
      "Eau chaude solaire",
      "Interphone & vidéophone",
      "Cave de stockage incluse",
      "Gardiennage 24h/24",
    ],
  },
  {
    brandId: acharafId,
    title: "Jardins de Bouskoura",
    slug: "jardins-bouskoura",
    description:
      "Entre Casablanca et son aéroport international, Jardins de Bouskoura offre un écrin résidentiel moderne alliant calme, verdure et accessibilité. Un choix stratégique pour les familles actives.",
    location: "Bouskoura, Route de l'Aéroport",
    city: "Casablanca",
    status: "upcoming",
    priceMin: 780000,
    priceMax: 1800000,
    surfaceMin: 75,
    surfaceMax: 195,
    deliveryDate: "T1 2026",
    featured: true,
    coverImageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=85",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=85",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1920&q=85",
      "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=1920&q=85",
      "https://images.unsplash.com/photo-1584738766473-61c083514bf4?w=1920&q=85",
    ],
    amenities: [
      "Jardin commun paysager",
      "Salle de sport résidentielle",
      "Locaux commerciaux en rez-de-chaussée",
      "Borne de recharge véhicule électrique",
      "Isolation thermique & acoustique renforcée",
      "Accès rapide autoroute A7",
      "Double vitrage & stores électriques",
      "Syndic de copropriété inclus",
    ],
  },
  {
    brandId: acharafId,
    title: "Lotissement Al Wifaq",
    slug: "lotissement-al-wifaq",
    description:
      "Conçu pour rendre la propriété accessible au plus grand nombre, Al Wifaq propose des maisons individuelles de plain-pied et duplex dans un lotissement sécurisé aux portes de Meknès.",
    location: "Route d'Agouray",
    city: "Meknès",
    status: "completed",
    priceMin: 480000,
    priceMax: 950000,
    surfaceMin: 90,
    surfaceMax: 200,
    deliveryDate: "T4 2023",
    featured: false,
    coverImageUrl:
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1920&q=85",
    images: [
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1920&q=85",
      "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=1920&q=85",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1920&q=85",
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&q=85",
    ],
    amenities: [
      "Maisons individuelles avec jardin",
      "Lotissement clôturé & sécurisé",
      "Voirie & réseaux divers livrés",
      "Eau & électricité raccordées",
      "Mosquée de proximité",
      "Transport en commun desservi",
      "École primaire à 5 minutes",
      "Titre foncier individuel fourni",
    ],
  },
];

export async function seedIfEmpty(): Promise<void> {
  try {
    // ── 1. Seed brands if absent ───────────────────────────────────
    const [{ value: brandCount }] = await db
      .select({ value: count() })
      .from(brandsTable);

    let estyaId: number;
    let acharafId: number;

    if (Number(brandCount) === 0) {
      logger.info("Seeding brands…");
      const inserted = await db
        .insert(brandsTable)
        .values(BRANDS)
        .returning({ id: brandsTable.id, slug: brandsTable.slug });

      estyaId = inserted.find((b) => b.slug === "estya")!.id;
      acharafId = inserted.find((b) => b.slug === "acharaf-immobilier")!.id;
      logger.info({ estyaId, acharafId }, "Brands seeded");
    } else {
      const allBrands = await db
        .select({ id: brandsTable.id, slug: brandsTable.slug })
        .from(brandsTable);
      estyaId = allBrands.find((b) => b.slug === "estya")?.id ?? 1;
      acharafId =
        allBrands.find((b) => b.slug === "acharaf-immobilier")?.id ?? 2;
    }

    // ── 2. Seed projects if absent ─────────────────────────────────
    const [{ value: projectCount }] = await db
      .select({ value: count() })
      .from(projectsTable);

    if (Number(projectCount) === 0) {
      logger.info("Seeding demo projects…");
      const projects = PROJECTS(estyaId, acharafId);
      await db.insert(projectsTable).values(projects);
      logger.info({ count: projects.length }, "Demo projects seeded");
    } else {
      logger.info(
        { count: Number(projectCount) },
        "Projects already present — skipping seed"
      );
    }
  } catch (err) {
    logger.error({ err }, "Seed failed — server will still start");
  }
}
