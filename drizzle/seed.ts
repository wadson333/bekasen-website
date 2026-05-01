/**
 * Bekasen — DB seed script
 *
 * Usage (after `docker compose -f docker-compose.dev.yml up -d`):
 *   npm run db:seed
 *
 * What this seeds (idempotent):
 *   1. Admin user (email from .env or jwadson666@gmail.com).
 *      - Generates a 16-char temp password if no admin exists yet.
 *      - Sets `must_change_password = true` so first login forces a new one.
 *   2. Generates ADMIN_PANEL_UID if missing in .env.local.
 *   3. Three default pricing plans (Starter, Business, Premium) + features
 *      per the spec, with USD/HTG/EUR/CAD price points.
 *   4. Four sample portfolio projects (matches the existing PortfolioSection).
 *
 * Safe to re-run: existing rows are detected by unique slug/email and skipped.
 */
import "dotenv/config";
import { promises as fs } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
import { db, pool } from "../lib/db";
import {
  adminUsers,
  pricingPlans,
  pricingFeatures,
  portfolioProjects,
} from "./schema";
import { eq } from "drizzle-orm";

const PANEL_UID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const generatePanelUid = customAlphabet(PANEL_UID_ALPHABET, 12);

function generateTempPassword(): string {
  const charset =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let out = "";
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < bytes.length; i++) {
    out += charset[bytes[i] % charset.length];
  }
  return out;
}

async function ensurePanelUid(): Promise<string> {
  const existing = process.env.ADMIN_PANEL_UID?.trim();
  if (existing) return existing;

  const fresh = generatePanelUid();
  const envPath = path.resolve(process.cwd(), ".env.local");

  let envContents = "";
  try {
    envContents = await fs.readFile(envPath, "utf8");
  } catch {
    // .env.local doesn't exist yet — bootstrap from .env.example
    try {
      envContents = await fs.readFile(
        path.resolve(process.cwd(), ".env.example"),
        "utf8",
      );
    } catch {
      envContents = "";
    }
  }

  if (envContents.match(/^ADMIN_PANEL_UID=.*$/m)) {
    envContents = envContents.replace(
      /^ADMIN_PANEL_UID=.*$/m,
      `ADMIN_PANEL_UID=${fresh}`,
    );
  } else {
    envContents += `\nADMIN_PANEL_UID=${fresh}\n`;
  }

  await fs.writeFile(envPath, envContents, "utf8");
  return fresh;
}

async function seedAdmin(): Promise<{
  email: string;
  panelUid: string;
  tempPassword: string | null;
}> {
  const email = (process.env.ADMIN_EMAIL ?? "jwadson666@gmail.com").toLowerCase();
  const panelUid = await ensurePanelUid();

  const existing = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  if (existing.length > 0) {
    return { email, panelUid, tempPassword: null };
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  await db.insert(adminUsers).values({
    email,
    passwordHash,
    totpEnabled: false,
    mustChangePassword: true,
  });

  return { email, panelUid, tempPassword };
}

const PLANS = [
  {
    slug: "starter",
    name: { en: "Starter", fr: "Vitrine", ht: "Vitrin", es: "Inicial" },
    description: {
      en: "Premium template-based website for small businesses needing online presence fast.",
      fr: "Site vitrine premium basé sur template pour PME qui veulent une présence en ligne rapidement.",
      ht: "Sit vitrin premium ki baze sou template pou ti biznis ki bezwen yon prezans an liy rapid.",
      es: "Sitio vitrina premium basado en plantilla para pymes que necesitan presencia online rápida.",
    },
    priceUsd: 79900, // $799
    priceHtg: 10500000, // ~105,000 HTG
    priceEur: 73900, // ~€739
    priceCad: 109000, // ~CA$1,090
    billingType: "one_time" as const,
    isPopular: false,
    displayOrder: 1,
    features: [
      { en: "Up to 5 static pages", fr: "Jusqu'à 5 pages statiques", ht: "Rive nan 5 paj", es: "Hasta 5 páginas estáticas" },
      { en: "Mobile-responsive design", fr: "Design responsive mobile", ht: "Design responsive mobil", es: "Diseño responsive móvil" },
      { en: "Contact form + WhatsApp integration", fr: "Formulaire de contact + WhatsApp", ht: "Fòm kontak + WhatsApp", es: "Formulario contacto + WhatsApp" },
      { en: "Basic SEO + sitemap", fr: "SEO de base + sitemap", ht: "SEO debaz + sitemap", es: "SEO básico + sitemap" },
      { en: "1 language", fr: "1 langue", ht: "1 lang", es: "1 idioma" },
      { en: "5 business days delivery", fr: "Livraison 5 jours ouvrés", ht: "Livrezon 5 jou", es: "Entrega 5 días hábiles" },
      { en: "30 days email support", fr: "Support email 30 jours", ht: "Sipò imel 30 jou", es: "Soporte email 30 días" },
      { en: "Source code ownership", fr: "Code source vous appartient", ht: "Kòd sous a se pou ou", es: "Propiedad del código fuente" },
    ],
  },
  {
    slug: "business",
    name: { en: "Business", fr: "Business", ht: "Biznis", es: "Negocios" },
    description: {
      en: "Custom website with CMS, booking integration, and chatbot for growing businesses.",
      fr: "Site sur mesure avec CMS, réservation et chatbot pour entreprises en croissance.",
      ht: "Sit pèsonalize ak CMS, rezèvasyon ak chatbot pou biznis k ap grandi.",
      es: "Sitio a medida con CMS, reservas y chatbot para empresas en crecimiento.",
    },
    priceUsd: 149900, // $1,499
    priceHtg: 19700000,
    priceEur: 138900,
    priceCad: 204000,
    billingType: "one_time" as const,
    isPopular: true,
    displayOrder: 2,
    features: [
      { en: "Up to 10 pages with CMS", fr: "Jusqu'à 10 pages avec CMS", ht: "Rive nan 10 paj ak CMS", es: "Hasta 10 páginas con CMS" },
      { en: "Custom design (brand applied)", fr: "Design sur mesure (charte appliquée)", ht: "Design pèsonalize", es: "Diseño a medida" },
      { en: "Full on-page SEO + schema markup", fr: "SEO on-page complet + schema", ht: "SEO konplè + schema", es: "SEO completo + schema" },
      { en: "Cal.com booking + payment link", fr: "Réservation Cal.com + lien paiement", ht: "Rezèvasyon Cal.com + peman", es: "Reservas Cal.com + pago" },
      { en: "AI chatbot widget (lead capture)", fr: "Chatbot IA (capture leads)", ht: "Chatbot AI (kapti lead)", es: "Chatbot IA (captura leads)" },
      { en: "Up to 2 languages", fr: "Jusqu'à 2 langues", ht: "Rive nan 2 lang", es: "Hasta 2 idiomas" },
      { en: "10 business days delivery", fr: "Livraison 10 jours ouvrés", ht: "Livrezon 10 jou", es: "Entrega 10 días hábiles" },
      { en: "60 days email + WhatsApp support", fr: "Support 60 jours email + WhatsApp", ht: "Sipò 60 jou", es: "Soporte 60 días email + WhatsApp" },
      { en: "Source code ownership", fr: "Code source vous appartient", ht: "Kòd sous a se pou ou", es: "Propiedad del código fuente" },
    ],
  },
  {
    slug: "premium",
    name: { en: "Premium", fr: "Premium", ht: "Premium", es: "Premium" },
    description: {
      en: "Custom web app or management software with full admin panel and AI automation.",
      fr: "Application web sur mesure avec panneau admin complet et automatisation IA.",
      ht: "Aplikasyon web pèsonalize ak panèl admin konplè ak otomasyon AI.",
      es: "Aplicación web a medida con panel admin completo y automatización IA.",
    },
    priceUsd: 299900, // $2,999 starting
    priceHtg: 39400000,
    priceEur: 277900,
    priceCad: 408000,
    billingType: "custom" as const,
    isPopular: false,
    displayOrder: 3,
    features: [
      { en: "Unlimited pages, custom architecture", fr: "Pages illimitées, architecture sur mesure", ht: "Paj san limit, achitekti pèsonalize", es: "Páginas ilimitadas, arquitectura a medida" },
      { en: "Fully custom UI/UX design", fr: "Design UI/UX entièrement sur mesure", ht: "Design UI/UX konplètman pèsonalize", es: "Diseño UI/UX totalmente a medida" },
      { en: "Full admin panel + role-based access", fr: "Panneau admin + gestion des rôles", ht: "Panèl admin + jesyon wòl", es: "Panel admin + gestión de roles" },
      { en: "Full SEO + content strategy", fr: "SEO complet + stratégie de contenu", ht: "SEO konplè + estrateji kontni", es: "SEO completo + estrategia de contenido" },
      { en: "Custom API integrations", fr: "Intégrations API sur mesure", ht: "Entegrasyon API pèsonalize", es: "Integraciones API a medida" },
      { en: "AI assistant + automation", fr: "Assistant IA + automatisation", ht: "Asistan AI + otomasyon", es: "Asistente IA + automatización" },
      { en: "Up to 4 languages", fr: "Jusqu'à 4 langues", ht: "Rive nan 4 lang", es: "Hasta 4 idiomas" },
      { en: "15-25 business days delivery", fr: "Livraison 15-25 jours ouvrés", ht: "Livrezon 15-25 jou", es: "Entrega 15-25 días hábiles" },
      { en: "90 days priority support", fr: "Support prioritaire 90 jours", ht: "Sipò prioritè 90 jou", es: "Soporte prioritario 90 días" },
      { en: "Source code ownership", fr: "Code source vous appartient", ht: "Kòd sous a se pou ou", es: "Propiedad del código fuente" },
    ],
  },
];

async function seedPricing() {
  for (const plan of PLANS) {
    const existing = await db
      .select()
      .from(pricingPlans)
      .where(eq(pricingPlans.slug, plan.slug))
      .limit(1);

    if (existing.length > 0) continue;

    const [inserted] = await db
      .insert(pricingPlans)
      .values({
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        priceUsd: plan.priceUsd,
        priceHtg: plan.priceHtg,
        priceEur: plan.priceEur,
        priceCad: plan.priceCad,
        billingType: plan.billingType,
        isPopular: plan.isPopular,
        displayOrder: plan.displayOrder,
      })
      .returning({ id: pricingPlans.id });

    if (!inserted) continue;

    await db.insert(pricingFeatures).values(
      plan.features.map((label, idx) => ({
        planId: inserted.id,
        label,
        isIncluded: true,
        displayOrder: idx,
      })),
    );
  }
}

const PORTFOLIO = [
  {
    slug: "clinix-pro",
    title: { en: "Clinix Pro", fr: "Clinix Pro", ht: "Clinix Pro", es: "Clinix Pro" },
    description: {
      en: "Complete medical ERP with patient management, appointments and billing.",
      fr: "ERP médical complet avec gestion de patients, rendez-vous et facturation.",
      ht: "ERP medikal konplè ak jesyon pasyan, randevou ak fakti.",
      es: "ERP médico completo con gestión de pacientes, citas y facturación.",
    },
    category: "saas" as const,
    thumbnailUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    demoUrl: "https://clinix-pro.bekasen.com",
    techStack: ["JHipster", "Angular", "PostgreSQL", "Spring Boot"],
    isFeatured: true,
    displayOrder: 1,
  },
  {
    slug: "horizon-hotel",
    title: { en: "Horizon Hôtel", fr: "Horizon Hôtel", ht: "Horizon Hotel", es: "Horizon Hotel" },
    description: {
      en: "Hotel management system with online booking and admin dashboard.",
      fr: "Système de gestion hôtelière avec réservation en ligne et tableau de bord admin.",
      ht: "Sistèm jesyon otèl ak rezèvasyon an liy ak tablo admin.",
      es: "Sistema de gestión hotelera con reservas online y panel admin.",
    },
    category: "business" as const,
    thumbnailUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    demoUrl: null,
    techStack: ["JHipster", "Spring Boot", "PostgreSQL"],
    isFeatured: true,
    displayOrder: 2,
  },
  {
    slug: "aura-market",
    title: { en: "Aura Market", fr: "Aura Market", ht: "Aura Market", es: "Aura Market" },
    description: {
      en: "Mobile-first marketplace connecting local sellers and buyers.",
      fr: "Marketplace mobile-first connectant vendeurs et acheteurs locaux.",
      ht: "Mache mobile-first ki konekte machann ak achtè lokal.",
      es: "Marketplace móvil que conecta vendedores y compradores locales.",
    },
    category: "webapp" as const,
    thumbnailUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    demoUrl: null,
    techStack: ["Next.js", "Tailwind", "PostgreSQL"],
    isFeatured: true,
    displayOrder: 3,
  },
  {
    slug: "impact-global",
    title: { en: "Impact Global", fr: "Impact Global", ht: "Impact Global", es: "Impact Global" },
    description: {
      en: "Institutional website with immersive animations and visual storytelling.",
      fr: "Site institutionnel avec animations immersives et storytelling visuel.",
      ht: "Sit enstitisyonèl ak animasyon imèsif ak racontaj vizyèl.",
      es: "Sitio institucional con animaciones inmersivas y storytelling visual.",
    },
    category: "showcase" as const,
    thumbnailUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    demoUrl: null,
    techStack: ["Next.js", "Framer Motion"],
    isFeatured: false,
    displayOrder: 4,
  },
];

async function seedPortfolio() {
  for (const project of PORTFOLIO) {
    const existing = await db
      .select()
      .from(portfolioProjects)
      .where(eq(portfolioProjects.slug, project.slug))
      .limit(1);
    if (existing.length > 0) continue;

    await db.insert(portfolioProjects).values(project);
  }
}

async function main() {
  console.log("\n🌱 Bekasen seed starting…\n");

  const { email, panelUid, tempPassword } = await seedAdmin();
  await seedPricing();
  await seedPortfolio();

  console.log("✅ Pricing plans + features seeded (Starter, Business, Premium)");
  console.log("✅ Portfolio projects seeded (Clinix, Horizon, Aura, Impact)");

  console.log("\n──────────────────────────────────────────────────");
  console.log("ADMIN ACCESS — read carefully, save somewhere safe");
  console.log("──────────────────────────────────────────────────");
  console.log(`  Login URL  : http://localhost:3000/panel-${panelUid}/login`);
  console.log(`  Email      : ${email}`);
  if (tempPassword) {
    console.log(`  Password   : ${tempPassword}   ← TEMP, change at first login`);
  } else {
    console.log(`  Password   : (already set on a previous run — use what you saved)`);
  }
  console.log("──────────────────────────────────────────────────");
  console.log("ADMIN_PANEL_UID has been written to .env.local.");
  console.log("Keep that file out of git. Rotate the UID by editing it + re-running seed.\n");

  await pool.end();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
