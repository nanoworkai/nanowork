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
  {
    slug: "legalflow",
    name: "LegalFlow",
    tagline: "Contract templates + e-signature for indie lawyers",
    category: "SaaS · Legal",
    description:
      "A white-label contract builder with 40+ templates, e-signature workflow, and client portal. Designed for solo practitioners who bill $200–500/hr. No Adobe required.",
    price: 5800,
    mrr: "$740 MRR",
    status: "available",
    stack: ["Next.js", "Postgres", "DocuSign", "Stripe"],
    includes: [
      "40+ legal templates (US-focused)",
      "E-signature API integration",
      "Client portal + document vault",
      "White-label branding system",
    ],
    theme: {
      bg: "#0f1113",
      surface: "#181a1d",
      accent: "#7a9fc7",
      accent2: "#2a3d52",
      text: "#e9ecf0",
      muted: "rgba(233, 236, 240, 0.6)",
    },
    preview: {
      kind: "saas",
      brand: "LegalFlow",
      headline: "Contracts, signed.",
      sub: "Templates to signature in minutes, not hours.",
      metric: "127",
      metricLabel: "docs signed this month",
    },
  },
  {
    slug: "gymflow",
    name: "GymFlow",
    tagline: "Class booking + membership for boutique fitness",
    category: "SaaS · Fitness",
    description:
      "All-in-one system for yoga studios, pilates, and boutique gyms. Class scheduling, membership billing, mobile check-in, waitlist automation. Built for 50–300 member studios.",
    price: 8200,
    mrr: "$1,280 MRR",
    status: "available",
    stack: ["React", "Node.js", "Stripe", "Twilio"],
    includes: [
      "Class scheduler + capacity limits",
      "Recurring membership billing",
      "Mobile check-in app (PWA)",
      "Automated waitlist + SMS alerts",
    ],
    theme: {
      bg: "#120f14",
      surface: "#1a1621",
      accent: "#e87eb8",
      accent2: "#5a2d48",
      text: "#f2e8ef",
      muted: "rgba(242, 232, 239, 0.6)",
    },
    preview: {
      kind: "saas",
      brand: "GymFlow",
      headline: "Full studios.",
      sub: "Book, bill, and check-in without the chaos.",
      metric: "1,842",
      metricLabel: "classes booked",
    },
  },
  {
    slug: "propkit",
    name: "PropKit",
    tagline: "Rental listing site for independent landlords",
    category: "Commerce · Real Estate",
    description:
      "A Zillow-style listing platform for small landlords managing 3–15 properties. Application forms, credit checks via API, tenant screening, lease signing. Escape the Zillow tax.",
    price: 6900,
    mrr: "$890 MRR",
    status: "pending",
    stack: ["Next.js", "Stripe", "TransUnion API", "Vercel"],
    includes: [
      "Multi-property listing builder",
      "Tenant screening + credit checks",
      "Online application forms",
      "Lease templates + e-signature",
    ],
    theme: {
      bg: "#0e1215",
      surface: "#161b20",
      accent: "#6db3d4",
      accent2: "#254a5e",
      text: "#e6f0f5",
      muted: "rgba(230, 240, 245, 0.6)",
    },
    preview: {
      kind: "local",
      brand: "PropKit",
      headline: "List direct.",
      sub: "Your properties. Your terms. No platform fee.",
      cta: "View rentals",
    },
  },
  {
    slug: "tutorlink",
    name: "TutorLink",
    tagline: "Marketplace for private tutors and test prep",
    category: "Marketplace · Education",
    description:
      "Two-sided marketplace connecting tutors with parents. Built-in scheduling, video sessions via API, payment splits, review system. Targeted at SAT/ACT and subject tutoring.",
    price: 11200,
    mrr: "$1,840 MRR",
    status: "available",
    stack: ["Remix", "Postgres", "Stripe Connect", "Daily.co"],
    includes: [
      "Tutor profiles + parent dashboard",
      "Video session integration",
      "Stripe Connect payment splits",
      "Review + rating system",
    ],
    theme: {
      bg: "#14100e",
      surface: "#1d1814",
      accent: "#d9a76a",
      accent2: "#5c4229",
      text: "#f4ebe0",
      muted: "rgba(244, 235, 224, 0.6)",
    },
    preview: {
      kind: "directory",
      brand: "TutorLink",
      headline: "find your tutor.",
      count: "218 tutors available",
    },
  },
  {
    slug: "mealprep",
    name: "MealPrep",
    tagline: "Meal planning SaaS for busy professionals",
    category: "SaaS · Food",
    description:
      "AI-powered weekly meal plans with grocery lists, macros, and dietary filters (keto, vegan, gluten-free). One-click export to Instacart. Built for the 'I need to eat healthy but I'm exhausted' crowd.",
    price: 4800,
    mrr: "$620 MRR",
    status: "available",
    stack: ["Next.js", "OpenAI", "Supabase", "Stripe"],
    includes: [
      "AI meal plan generator",
      "Dietary preference filters",
      "Auto-generated grocery lists",
      "Instacart API integration",
    ],
    theme: {
      bg: "#0f1410",
      surface: "#171d18",
      accent: "#90d48f",
      accent2: "#30523b",
      text: "#e8f2e8",
      muted: "rgba(232, 242, 232, 0.6)",
    },
    preview: {
      kind: "saas",
      brand: "MealPrep",
      headline: "Eat real food.",
      sub: "Weekly plans. Zero decisions. Delivered.",
      metric: "2,847",
      metricLabel: "meals planned",
    },
  },
  {
    slug: "dogwalk",
    name: "DogWalk",
    tagline: "Booking platform for local dog walkers",
    category: "Marketplace · Services",
    description:
      "Rover alternative for neighborhood dog walkers. GPS tracking, photo updates, recurring bookings, Stripe payouts. Lower fees (12% vs 20%) and designed for walkers doing 10–30 dogs/week.",
    price: 7600,
    mrr: "$1,140 MRR",
    status: "available",
    stack: ["React Native", "Node.js", "Stripe Connect", "Mapbox"],
    includes: [
      "Mobile app (iOS + Android)",
      "GPS walk tracking",
      "Photo upload + notifications",
      "Stripe Connect for payouts",
    ],
    theme: {
      bg: "#13110f",
      surface: "#1b1814",
      accent: "#e8b068",
      accent2: "#5e3e1d",
      text: "#f5ede0",
      muted: "rgba(245, 237, 224, 0.58)",
    },
    preview: {
      kind: "local",
      brand: "DogWalk",
      headline: "Walks, tracked.",
      sub: "GPS + photos. Happy dogs. Fair fees.",
      cta: "Find a walker",
    },
  },
  {
    slug: "invoicely",
    name: "Invoicely",
    tagline: "Beautiful invoicing for creative freelancers",
    category: "SaaS · Finance",
    description:
      "Invoicing that doesn't look like 1998. Custom branding, automatic reminders, payment tracking, client portal. Designed for designers, writers, and creatives charging $75–250/hr.",
    price: 3200,
    mrr: "$480 MRR",
    status: "available",
    stack: ["SvelteKit", "Stripe", "Supabase", "Resend"],
    includes: [
      "Custom invoice templates",
      "Stripe + PayPal integration",
      "Automated payment reminders",
      "Client portal for payment history",
    ],
    theme: {
      bg: "#11100f",
      surface: "#19181b",
      accent: "#c89ef7",
      accent2: "#4a3361",
      text: "#ede8f3",
      muted: "rgba(237, 232, 243, 0.6)",
    },
    preview: {
      kind: "saas",
      brand: "Invoicely",
      headline: "Get paid, beautifully.",
      sub: "Invoices that match your brand, not your bank's.",
      metric: "$84k",
      metricLabel: "invoiced this quarter",
    },
  },
  {
    slug: "podqueue",
    name: "PodQueue",
    tagline: "Podcast transcript search + summarization tool",
    category: "SaaS · Media",
    description:
      "Upload podcast episodes, get searchable transcripts + AI summaries. Built for podcast listeners who want to find specific moments, and creators who want SEO-friendly show notes.",
    price: 5400,
    mrr: "$710 MRR",
    status: "available",
    stack: ["Next.js", "Whisper API", "Postgres", "Vercel"],
    includes: [
      "Audio transcription (Whisper)",
      "AI-powered episode summaries",
      "Full-text search engine",
      "Embeddable player + transcript",
    ],
    theme: {
      bg: "#0f1014",
      surface: "#161821",
      accent: "#9b8fff",
      accent2: "#3a2e66",
      text: "#ebe8f5",
      muted: "rgba(235, 232, 245, 0.6)",
    },
    preview: {
      kind: "saas",
      brand: "PodQueue",
      headline: "Find that moment.",
      sub: "Search any podcast. Get AI summaries.",
      metric: "3,214",
      metricLabel: "hours transcribed",
    },
  },
  {
    slug: "careerhub",
    name: "CareerHub",
    tagline: "Job board + applicant tracking for niche industries",
    category: "SaaS · Recruiting",
    description:
      "White-label job board with built-in ATS. Employers post jobs, candidates apply, all tracked in one system. Designed for industry-specific boards (legal, healthcare, remote-only, etc.).",
    price: 9400,
    mrr: "$1,520 MRR",
    status: "available",
    stack: ["Next.js", "Postgres", "Stripe", "Resend"],
    includes: [
      "White-label job board",
      "Applicant tracking system",
      "Employer dashboard + analytics",
      "Email notification system",
    ],
    theme: {
      bg: "#0e1114",
      surface: "#151a1f",
      accent: "#6fbfcc",
      accent2: "#26494f",
      text: "#e8f2f4",
      muted: "rgba(232, 242, 244, 0.6)",
    },
    preview: {
      kind: "directory",
      brand: "CareerHub",
      headline: "jobs, organized.",
      count: "642 active listings",
    },
  },
  {
    slug: "waitlist",
    name: "Waitlist",
    tagline: "Pre-launch landing page + email collection tool",
    category: "SaaS · Marketing",
    description:
      "One-click launch page builder with email capture, referral tracking, and countdown timers. Built for indie makers running 'coming soon' campaigns. Integrates with Mailchimp, ConvertKit, and Loops.",
    price: 2400,
    mrr: "$320 MRR",
    status: "available",
    stack: ["Astro", "Supabase", "Resend", "Cloudflare"],
    includes: [
      "Landing page templates (8 designs)",
      "Email provider integrations",
      "Referral tracking system",
      "Analytics + conversion tracking",
    ],
    theme: {
      bg: "#10110f",
      surface: "#181916",
      accent: "#a8d47a",
      accent2: "#3d5129",
      text: "#ebf0e3",
      muted: "rgba(235, 240, 227, 0.6)",
    },
    preview: {
      kind: "saas",
      brand: "Waitlist",
      headline: "Launch hype.",
      sub: "Collect emails. Track referrals. Ship faster.",
      metric: "18,472",
      metricLabel: "signups collected",
    },
  },
  {
    slug: "reviewkit",
    name: "ReviewKit",
    tagline: "Automated review collection for local businesses",
    category: "SaaS · Marketing",
    description:
      "SMS + email review requests with smart timing. Sends to Google, Yelp, Facebook based on customer preference. Dashboard shows response rates. Built for restaurants, salons, and service businesses.",
    price: 6200,
    mrr: "$820 MRR",
    status: "pending",
    stack: ["Next.js", "Twilio", "Postgres", "Stripe"],
    includes: [
      "Multi-channel review requests",
      "Smart timing engine",
      "Dashboard + analytics",
      "Google/Yelp/Facebook integration",
    ],
    theme: {
      bg: "#14100d",
      surface: "#1d1813",
      accent: "#f0b86a",
      accent2: "#5e3e1c",
      text: "#f5ede0",
      muted: "rgba(245, 237, 224, 0.6)",
    },
    preview: {
      kind: "saas",
      brand: "ReviewKit",
      headline: "5 stars, faster.",
      sub: "Automated review requests that actually work.",
      metric: "842",
      metricLabel: "reviews this month",
    },
  },
  {
    slug: "inventoryflow",
    name: "InventoryFlow",
    tagline: "Inventory management for small e-commerce sellers",
    category: "SaaS · E-commerce",
    description:
      "Simple inventory tracker for Shopify + Etsy sellers managing 50–500 SKUs. Low-stock alerts, reorder reminders, profit tracking, supplier management. No enterprise bloat.",
    price: 4600,
    mrr: "$640 MRR",
    status: "available",
    stack: ["React", "Node.js", "Postgres", "Shopify API"],
    includes: [
      "Multi-channel inventory sync",
      "Low-stock alerts (SMS/email)",
      "Profit margin calculator",
      "Supplier contact management",
    ],
    theme: {
      bg: "#0f1214",
      surface: "#171b1f",
      accent: "#7ac4d9",
      accent2: "#2a4b56",
      text: "#e8f1f5",
      muted: "rgba(232, 241, 245, 0.6)",
    },
    preview: {
      kind: "saas",
      brand: "InventoryFlow",
      headline: "Never stock out.",
      sub: "Track inventory across channels. Reorder on time.",
      metric: "487",
      metricLabel: "SKUs tracked",
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
