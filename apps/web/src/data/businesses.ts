import type { CSSProperties } from "react";

export type BusinessStatus = "available" | "sold" | "pending";

export type BusinessTheme = {
  bg: string;
  surface: string;
  accent: string;
  accent2: string;
  text: string;
  muted: string;
};

export type BusinessPreview =
  | {
      kind: "saas";
      brand: string;
      headline: string;
      sub: string;
      metric: string;
      metricLabel: string;
    }
  | {
      kind: "commerce";
      brand: string;
      headline: string;
      product: string;
      price: string;
    }
  | {
      kind: "newsletter";
      brand: string;
      headline: string;
      issue: string;
      subs: string;
    }
  | { kind: "local"; brand: string; headline: string; sub: string; cta: string }
  | { kind: "directory"; brand: string; headline: string; count: string };

export type Business = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  price: number;
  mrr?: string;
  status: BusinessStatus;
  stack: string[];
  includes: string[];
  theme: BusinessTheme;
  preview: BusinessPreview;
};

export const BUSINESSES: Business[] = [
  {
    slug: "lamina",
    name: "Lamina",
    tagline: "Minimal habit tracker for serious people",
    category: "SaaS · Productivity",
    description:
      "A zero-chrome habit tracker built for the 'no streak, just signal' crowd. Clean mobile PWA, Stripe subscriptions, retention dashboard.",
    price: 4200,
    mrr: "$680 MRR",
    status: "available",
    stack: ["Next.js", "Supabase", "Stripe", "Vercel"],
    includes: [
      "Full codebase + assets",
      "Stripe + billing wired",
      "Domain transfer (lamina.app) at handoff",
      "30 days post-launch support",
    ],
    theme: {
      bg: "#0e120f",
      surface: "#151b17",
      accent: "#7bd3a8",
      accent2: "#2e4a3a",
      text: "#ecf4ef",
      muted: "rgba(236, 244, 239, 0.6)",
    },
    preview: {
      kind: "saas",
      brand: "Lamina",
      headline: "Build the day.",
      sub: "Track what matters. Skip the streaks.",
      metric: "92%",
      metricLabel: "7-day signal",
    },
  },
  {
    slug: "ovenly",
    name: "Ovenly",
    tagline: "Bakery + café storefront, ready to ship",
    category: "Commerce · Local",
    description:
      "A photo-first ordering site for neighborhood bakeries. Square payments, pickup windows, SMS order confirmations, CMS for daily menu drops.",
    price: 2800,
    status: "available",
    stack: ["Astro", "Square", "Sanity", "Cloudflare"],
    includes: [
      "Design system + 12 page templates",
      "Square catalog + tax config",
      "Twilio SMS confirmations",
      "Daily menu CMS seeded",
    ],
    theme: {
      bg: "#1a1310",
      surface: "#221912",
      accent: "#e4a46a",
      accent2: "#6b3d1d",
      text: "#f4e9dc",
      muted: "rgba(244, 233, 220, 0.58)",
    },
    preview: {
      kind: "commerce",
      brand: "Ovenly",
      headline: "Today's bake.",
      product: "Miso sourdough · fresh at 3pm",
      price: "$9",
    },
  },
  {
    slug: "parcel",
    name: "Parcel",
    tagline: "Shipping notification micro-SaaS",
    category: "SaaS · Ops",
    description:
      "Drop-in tracking widget for Shopify stores. Branded shipping emails, SMS updates, ETA predictions. Built for shops doing <10k orders/mo.",
    price: 9800,
    mrr: "$1,450 MRR",
    status: "available",
    stack: ["Remix", "Postgres", "Redis"],
    includes: [
      "Shopify app listing + review assets",
      "Multi-carrier API integrations",
      "Customer dashboard + admin",
      "First 60 days of support",
    ],
    theme: {
      bg: "#0d1016",
      surface: "#141823",
      accent: "#8ab4ff",
      accent2: "#1e3366",
      text: "#e8ecf4",
      muted: "rgba(232, 236, 244, 0.6)",
    },
    preview: {
      kind: "saas",
      brand: "Parcel",
      headline: "Where's it at?",
      sub: "Branded tracking that feels like your store.",
      metric: "4,218",
      metricLabel: "shipments this week",
    },
  },
  {
    slug: "fieldnote",
    name: "Fieldnote",
    tagline: "Paid newsletter for indie operators",
    category: "Media · Newsletter",
    description:
      "A ready-to-run paid newsletter on small-business operations. Substack-equivalent on your own domain, with archive, paywall, and a starter audience of 1,400.",
    price: 6400,
    mrr: "$520 MRR",
    status: "pending",
    stack: ["Ghost", "Postmark", "Stripe"],
    includes: [
      "Ghost instance + custom theme",
      "1,400 starter subscribers",
      "12 evergreen posts drafted",
      "Launch-week distribution plan",
    ],
    theme: {
      bg: "#141211",
      surface: "#1d1a18",
      accent: "#d4c098",
      accent2: "#5a4a34",
      text: "#f0ebe2",
      muted: "rgba(240, 235, 226, 0.6)",
    },
    preview: {
      kind: "newsletter",
      brand: "Fieldnote",
      headline: "Notes from the floor.",
      issue: "Issue 47 · How a 3-person SaaS priced itself up",
      subs: "1,412 paid readers",
    },
  },
  {
    slug: "bench",
    name: "Bench",
    tagline: "Freelancer booking + intake, minus the ugly",
    category: "SaaS · Services",
    description:
      "Calendly + intake form + invoice, bundled and beautiful. For solo freelancers running $5–25k projects. White-label ready.",
    price: 3600,
    status: "available",
    stack: ["SvelteKit", "Supabase", "Stripe", "Cal.com"],
    includes: [
      "Bookable scheduler",
      "Dynamic intake forms",
      "Stripe deposits + invoicing",
      "Client-facing project room",
    ],
    theme: {
      bg: "#100f14",
      surface: "#171621",
      accent: "#b091f5",
      accent2: "#3b2e5e",
      text: "#ece8f5",
      muted: "rgba(236, 232, 245, 0.6)",
    },
    preview: {
      kind: "saas",
      brand: "Bench",
      headline: "Book serious work.",
      sub: "One link. Clean intake. Paid deposit.",
      metric: "38",
      metricLabel: "clients onboarded",
    },
  },
  {
    slug: "stackview",
    name: "Stackview",
    tagline: "Portfolio builder for staff engineers",
    category: "Tools · Dev",
    description:
      "A self-serve portfolio site generator with GitHub + talks + reading list pulled in automatically. Targeted at senior engineers doing the circuit.",
    price: 2200,
    status: "available",
    stack: ["Next.js", "GitHub API", "MDX", "Vercel"],
    includes: [
      "Template engine + 4 themes",
      "GitHub + RSS importers",
      "Custom domain + CDN",
      "SEO + OG image generator",
    ],
    theme: {
      bg: "#0c0e0d",
      surface: "#131614",
      accent: "#9dd69a",
      accent2: "#2c4a2d",
      text: "#e6ede6",
      muted: "rgba(230, 237, 230, 0.6)",
    },
    preview: {
      kind: "directory",
      brand: "Stackview",
      headline: "engineers, rendered.",
      count: "184 portfolios shipped",
    },
  },
  {
    slug: "nightkey",
    name: "Nightkey",
    tagline: "Short-stay booking for boutique properties",
    category: "Commerce · Hospitality",
    description:
      "A 3-property Airbnb-style site with direct booking, a concierge chat, and Stripe-based holds. For owners tired of 18% platform fees.",
    price: 12500,
    mrr: "$3,100 MRR",
    status: "sold",
    stack: ["Next.js", "Stripe", "Sanity", "Twilio"],
    includes: [
      "Multi-property CMS",
      "Stripe holds + payouts",
      "Concierge SMS routing",
      "iCal sync with Airbnb / VRBO",
    ],
    theme: {
      bg: "#13100d",
      surface: "#1c1813",
      accent: "#e8b472",
      accent2: "#5a3d1e",
      text: "#f5ece0",
      muted: "rgba(245, 236, 224, 0.58)",
    },
    preview: {
      kind: "local",
      brand: "Nightkey",
      headline: "Stay direct.",
      sub: "Three houses. No middle.",
      cta: "Check dates",
    },
  },
  {
    slug: "pressroom",
    name: "Pressroom",
    tagline: "Media kit + press database for founders",
    category: "SaaS · Marketing",
    description:
      "A beautiful, no-login media kit page plus a searchable database of 4,800 journalists. Founders drop a link and get covered faster.",
    price: 7400,
    mrr: "$920 MRR",
    status: "available",
    stack: ["Next.js", "Postgres", "Clerk", "Stripe"],
    includes: [
      "Media kit builder + templates",
      "4,800-journalist database",
      "Pitch tracker + CRM",
      "Quarterly DB refresh contract",
    ],
    theme: {
      bg: "#11110f",
      surface: "#191815",
      accent: "#f0c58a",
      accent2: "#5a4a2c",
      text: "#f3ece0",
      muted: "rgba(243, 236, 224, 0.6)",
    },
    preview: {
      kind: "directory",
      brand: "Pressroom",
      headline: "press, organized.",
      count: "4,812 journalists indexed",
    },
  },
];

export function getBusiness(slug: string): Business | undefined {
  return BUSINESSES.find((b) => b.slug === slug);
}

export function businessStyle(b: Business): CSSProperties {
  return {
    "--g-bg": b.theme.bg,
    "--g-surface": b.theme.surface,
    "--g-accent": b.theme.accent,
    "--g-accent-2": b.theme.accent2,
    "--g-text": b.theme.text,
    "--g-muted": b.theme.muted,
  } as CSSProperties;
}

export function formatPrice(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}
