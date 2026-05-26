import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "../lib/apiFetch";

export type Region = {
  code: string;
  label: string;
  available: boolean;
};

type RevealedNumber = {
  e164: string;
  display: string;
  href: string;
};

export type PhoneStatus =
  | "idle"
  | "loading_regions"
  | "regions_error"
  | "regions_ready"
  | "resolving"
  | "revealed"
  | "coming_soon"
  | "region_mismatch"
  | "error";

export type PhoneState = {
  status: PhoneStatus;
  regions: Region[];
  selectedRegion: string | null;
  detectedCountry: string | null;
  number: RevealedNumber | null;
  message: string | null;
  isModalOpen: boolean;
};

type PhoneContextValue = PhoneState & {
  openReveal: () => void;
  closeReveal: () => void;
  selectRegion: (code: string) => Promise<void>;
  /** Clear the selected region / reset the modal to the region-picker step. */
  reset: () => void;
};

const SESSION_KEY = "nanowork:phone-reveal:v1";

const PhoneContext = createContext<PhoneContextValue | null>(null);

function readCachedReveal():
  | { region: string; number: RevealedNumber }
  | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      region?: string;
      number?: RevealedNumber;
    };
    if (!parsed?.region || !parsed.number?.e164) return null;
    return { region: parsed.region, number: parsed.number };
  } catch {
    return null;
  }
}

function writeCachedReveal(region: string, number: RevealedNumber) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ region, number }),
    );
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function PhoneProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PhoneState>(() => {
    const cached = readCachedReveal();
    return {
      status: cached ? "revealed" : "idle",
      regions: [],
      selectedRegion: cached?.region ?? null,
      detectedCountry: null,
      number: cached?.number ?? null,
      message: null,
      isModalOpen: false,
    };
  });

  const regionsLoadedRef = useRef(false);

  const loadRegions = useCallback(async () => {
    if (regionsLoadedRef.current) return;
    regionsLoadedRef.current = true;
    setState((s) => ({ ...s, status: "loading_regions", message: null }));
    try {
      const res = await apiFetch("/api/phone", { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { regions?: Region[] };
      const regions = Array.isArray(data.regions) ? data.regions : [];
      setState((s) => ({
        ...s,
        regions,
        status: s.number ? "revealed" : "regions_ready",
      }));
    } catch (err) {
      regionsLoadedRef.current = false;
      setState((s) => ({
        ...s,
        status: "regions_error",
        message:
          err instanceof Error
            ? err.message
            : "Could not load regions. Try again.",
      }));
    }
  }, []);

  const openReveal = useCallback(() => {
    setState((s) => ({ ...s, isModalOpen: true }));
    if (!regionsLoadedRef.current) {
      void loadRegions();
    }
  }, [loadRegions]);

  const closeReveal = useCallback(() => {
    setState((s) => ({ ...s, isModalOpen: false }));
  }, []);

  const reset = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(SESSION_KEY);
      } catch {
        /* noop */
      }
    }
    setState((s) => ({
      ...s,
      status: s.regions.length ? "regions_ready" : "idle",
      selectedRegion: null,
      number: null,
      detectedCountry: null,
      message: null,
    }));
  }, []);

  const selectRegion = useCallback(async (code: string) => {
    setState((s) => ({
      ...s,
      status: "resolving",
      selectedRegion: code,
      message: null,
    }));
    try {
      const res = await apiFetch("/api/phone", {
        method: "POST",
        body: JSON.stringify({ region: code }),
      });
      const data = (await res.json()) as {
        status?: string;
        region?: { code: string; label: string };
        detectedCountry?: string | null;
        number?: RevealedNumber;
      };

      if (data.status === "invalid_region") {
        setState((s) => ({
          ...s,
          status: "error",
          number: null,
          message: "That region isn't recognized. Please pick a region from the list.",
        }));
        return;
      }

      if (data.status === "revealed" && data.number) {
        writeCachedReveal(code, data.number);
        setState((s) => ({
          ...s,
          status: "revealed",
          number: data.number ?? null,
          detectedCountry: data.detectedCountry ?? null,
          message: null,
        }));
        return;
      }

      if (data.status === "coming_soon") {
        setState((s) => ({
          ...s,
          status: "coming_soon",
          detectedCountry: data.detectedCountry ?? null,
          number: null,
          message: `We're not live in ${data.region?.label ?? "that region"} yet. Tap notify when we open the line.`,
        }));
        return;
      }

      if (data.status === "region_mismatch") {
        setState((s) => ({
          ...s,
          status: "region_mismatch",
          detectedCountry: data.detectedCountry ?? null,
          number: null,
          message: data.detectedCountry
            ? `We can't verify that you're in ${data.region?.label ?? "that region"}. Your connection looks like ${data.detectedCountry}.`
            : `We can't verify your region right now. Try again on a direct connection (no VPN).`,
        }));
        return;
      }

      setState((s) => ({
        ...s,
        status: "error",
        number: null,
        message: "Something went wrong. Please try again.",
      }));
    } catch {
      setState((s) => ({
        ...s,
        status: "error",
        number: null,
        message: "Could not reach the server. Please try again.",
      }));
    }
  }, []);

  useEffect(() => {
    if (!state.isModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeReveal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.isModalOpen, closeReveal]);

  const value = useMemo<PhoneContextValue>(
    () => ({
      ...state,
      openReveal,
      closeReveal,
      selectRegion,
      reset,
    }),
    [state, openReveal, closeReveal, selectRegion, reset],
  );

  return (
    <PhoneContext.Provider value={value}>{children}</PhoneContext.Provider>
  );
}

export function usePhone(): PhoneContextValue {
  const ctx = useContext(PhoneContext);
  if (!ctx) {
    throw new Error("usePhone must be used inside <PhoneProvider>");
  }
  return ctx;
}

/** Human-readable masked form for the big "call to action" display. */
export const MASKED_DISPLAY = "(•••) •••-••••";
