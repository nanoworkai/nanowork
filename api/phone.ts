/**
 * Region-gated phone reveal.
 *
 * The Nanowork front-door phone number is intentionally NOT shipped in the
 * client bundle. The browser has to POST to this endpoint with a requested
 * region and we decide — server-side — whether to return the number.
 *
 * Two checks gate the reveal:
 *
 * 1. Is the requested region one we actually staff / provision a line for?
 * 2. Does the caller's IP look like it's coming from that region? This is
 *    cheap spam protection — we're not claiming it's tamper-proof, it just
 *    stops casual scraping and keeps us from handing out a US line to
 *    someone who selected "United Kingdom" from a UK IP by accident.
 *
 * On Vercel Edge we trust `x-vercel-ip-country`. Locally (no header) we
 * fall back to "any" so the dev loop still works.
 */

export const config = {
  runtime: "edge",
};

type RegionCode = "us" | "ca" | "uk" | "au" | "eu";

type RegionRecord = {
  code: RegionCode;
  label: string;
  /** ISO-3166 alpha-2 country codes whose IPs are allowed to reveal this number. */
  allowedCountries: string[];
  /** Phone line we expose for this region, or null if not yet provisioned. */
  line: null | {
    e164: string;
    display: string;
  };
};

const REGIONS: Record<RegionCode, RegionRecord> = {
  us: {
    code: "us",
    label: "United States",
    allowedCountries: ["US"],
    line: {
      e164: "+16506740193",
      display: "(650) 674-0193",
    },
  },
  ca: {
    code: "ca",
    label: "Canada",
    allowedCountries: ["CA"],
    line: null,
  },
  uk: {
    code: "uk",
    label: "United Kingdom",
    allowedCountries: ["GB"],
    line: null,
  },
  au: {
    code: "au",
    label: "Australia",
    allowedCountries: ["AU"],
    line: null,
  },
  eu: {
    code: "eu",
    label: "European Union",
    allowedCountries: [
      "AT",
      "BE",
      "BG",
      "HR",
      "CY",
      "CZ",
      "DK",
      "EE",
      "FI",
      "FR",
      "DE",
      "GR",
      "HU",
      "IE",
      "IT",
      "LV",
      "LT",
      "LU",
      "MT",
      "NL",
      "PL",
      "PT",
      "RO",
      "SK",
      "SI",
      "ES",
      "SE",
    ],
    line: null,
  },
};

function isRegionCode(value: unknown): value is RegionCode {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(REGIONS, value)
  );
}

function json(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...(init?.headers || {}),
    },
  });
}

function getClientCountry(req: Request): string | null {
  const direct = req.headers.get("x-vercel-ip-country");
  if (direct) return direct.toUpperCase();
  const cf = req.headers.get("cf-ipcountry");
  if (cf) return cf.toUpperCase();
  return null;
}

function publicRegionList() {
  return Object.values(REGIONS).map((r) => ({
    code: r.code,
    label: r.label,
    available: r.line !== null,
  }));
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "GET") {
    return json({ regions: publicRegionList() });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, { status: 405 });
  }

  let body: { region?: unknown } = {};
  try {
    body = (await req.json()) as { region?: unknown };
  } catch {
    return json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isRegionCode(body.region)) {
    return json(
      {
        status: "invalid_region",
        regions: publicRegionList(),
      },
      { status: 400 },
    );
  }

  const region = REGIONS[body.region];
  const detectedCountry = getClientCountry(req);
  const devMode =
    (globalThis as any).process?.env?.NODE_ENV !== "production" &&
    (globalThis as any).process?.env?.VERCEL !== "1";

  if (region.line === null) {
    return json({
      status: "coming_soon",
      region: { code: region.code, label: region.label },
      detectedCountry,
    });
  }

  const ipAllowed =
    detectedCountry === null
      ? devMode
      : region.allowedCountries.includes(detectedCountry);

  if (!ipAllowed) {
    return json({
      status: "region_mismatch",
      region: { code: region.code, label: region.label },
      detectedCountry,
    });
  }

  return json({
    status: "revealed",
    region: { code: region.code, label: region.label },
    detectedCountry,
    number: {
      e164: region.line.e164,
      display: region.line.display,
      href: `sms:${region.line.e164}`,
    },
  });
}
