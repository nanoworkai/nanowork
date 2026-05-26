import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Company } from "../types/database";

// Updated UserProfile to match v2 schema with phone auth
export interface UserProfile {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  businessName?: string;
  businessPrompt?: string;
  aiEmail?: string; // AI agent email like nova@nanowork.ai
  agentId?: string; // User's primary agent ID for linking builds/businesses

  // Account status
  status: "active" | "suspended" | "deleted";
  phoneVerified: boolean;

  // Subscription & billing
  plan: "free" | "starter" | "growth" | "scale" | "enterprise";
  stripeCustomerId?: string;
  subscriptionStatus?: "active" | "trialing" | "past_due" | "canceled" | "paused";
  subscriptionId?: string;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;

  // Usage & credits
  creditsBalance: number;
  monthlyCompanyLimit: number;
  totalCompaniesCreated: number;

  // Legacy fields
  customDomain?: string;
  subdomain?: string;

  // Preferences
  timezone: string;
  notificationPreferences: {
    sms: boolean;
    activity: boolean;
    billing: boolean;
  };

  // Metadata
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;

  // Companies
  companies: Company[];
  activeCompany: Company | null;
  setActiveCompany: (companyId: string) => void;
  refreshCompanies: () => Promise<void>;
  canCreateCompany: () => boolean;

  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  requestOtp: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;

  // Profile management
  updateProfile: (partial: Partial<UserProfile>) => Promise<void>;

  // Credits management
  deductCredits: (amount: number, description: string, usageType: string, companyId?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  session: null,
  profile: null,
  companies: [],
  activeCompany: null,
  setActiveCompany: () => {},
  refreshCompanies: async () => {},
  canCreateCompany: () => false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  requestOtp: async () => ({ error: null }),
  verifyOtp: async () => ({ error: null }),
  logout: async () => {},
  updateProfile: async () => {},
  deductCredits: async () => false,
});

// Legacy phone-based subdomain generator (unused with email auth)
// Commented out to fix TypeScript build error
// function phoneToSubdomain(phone: string): string {
//   return "app-" + phone.replace(/\D/g, "").slice(-6);
// }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0] || null;

  const loadProfile = useCallback(async (u: User) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", u.id)
      .maybeSingle();

    if (data) {
      // Map database fields (snake_case) to UserProfile (camelCase)
      const mappedProfile: UserProfile = {
        id: data.id,
        phone: data.phone || "",
        email: data.email || undefined,
        name: data.name || undefined,
        aiEmail: data.ai_email || undefined,
        status: data.status || "active",
        phoneVerified: data.phone_verified || false,
        plan: data.plan || "free",
        creditsBalance: data.credits_balance || 0,
        monthlyCompanyLimit: data.monthly_company_limit || 1,
        totalCompaniesCreated: data.total_companies_created || 0,
        timezone: data.timezone || "UTC",
        notificationPreferences: data.notification_preferences || {
          sms: true,
          activity: true,
          billing: true,
        },
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString(),
      };
      setProfile(mappedProfile);
    } else {
      console.warn("[AuthContext] Profile not found for user - trigger should have created it");
    }
  }, []);

  const loadCompanies = useCallback(async (userId: string) => {
    // Check for pending claim and process it first
    const pendingClaim = localStorage.getItem('pending_claim');
    if (pendingClaim) {
      try {
        const claim = JSON.parse(pendingClaim);
        const { error: insertError } = await supabase.from('companies').insert({
          owner_id: userId,
          name: claim.businessData.name,
          description: claim.businessData.description || claim.businessData.tagline || '',
          slug: claim.businessData.slug,
          industry: claim.businessData.category,
          status: 'active',
          claimed_at: new Date().toISOString(),
          source: 'claimed',
          settings: {
            originalBusinessData: claim.businessData
          }
        });

        if (insertError) {
          console.error('Failed to create claimed company:', insertError);
        }
      } catch (claimError) {
        console.error('Failed to process pending claim:', claimError);
      } finally {
        // Always remove the pending claim, even if it failed
        localStorage.removeItem('pending_claim');
      }
    }

    // Get companies owned by user
    const { data: ownedCompanies } = await supabase
      .from("companies")
      .select("*")
      .eq("owner_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    // Get companies where user is a member (if company_members table exists)
    const { data: memberCompanies } = await supabase
      .from("company_members")
      .select(`
        company_id,
        companies (*)
      `)
      .eq("user_id", userId);

    const allCompanies = [
      ...(ownedCompanies || []),
      ...(memberCompanies?.map((m: any) => m.companies).flat().filter(Boolean) || []),
    ] as Company[];

    setCompanies(allCompanies);

    // Set active company from localStorage or first company
    const savedCompanyId = localStorage.getItem("activeCompanyId");
    if (savedCompanyId && allCompanies.some(c => c.id === savedCompanyId)) {
      setActiveCompanyId(savedCompanyId);
    } else if (allCompanies.length > 0) {
      setActiveCompanyId(allCompanies[0].id);
    }
  }, []);

  useEffect(() => {
    // If Supabase is not configured, skip auth entirely
    if (!isSupabaseConfigured) {
      console.warn("[AuthContext] Running in fallback mode - no authentication");
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        await loadProfile(s.user);
        await loadCompanies(s.user.id).catch(() => {
          // Companies table might not exist yet - that's okay
        });
        // Update last login (fire and forget)
        void (async () => {
          try {
            await supabase
              .from("profiles")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", s.user.id);
          } catch {
            // Ignore errors - column may not exist
          }
        })();
      }
      setIsLoading(false);
    }).catch((err) => {
      console.error("[AuthContext] Failed to get session:", err);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          await loadProfile(s.user);
          await loadCompanies(s.user.id).catch(() => {});
        } else {
          setProfile(null);
          setCompanies([]);
          setActiveCompanyId(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile, loadCompanies]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${import.meta.env?.VITE_SITE_URL || window.location.origin}/dashboard`,
      },
    });

    if (error) return { error: error.message };

    // Profile is automatically created by database trigger
    return { error: null };
  }, []);

  const requestOtp = useCallback(async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    return { error: error?.message ?? null };
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
    return { error: error?.message ?? null };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }, []);

  const updateProfile = useCallback(async (partial: Partial<UserProfile>) => {
    if (!user) return;

    // Convert camelCase to snake_case for database
    const dbUpdate: any = {};
    if (partial.name !== undefined) dbUpdate.name = partial.name;
    if (partial.email !== undefined) dbUpdate.email = partial.email;
    if (partial.avatarUrl !== undefined) dbUpdate.avatar_url = partial.avatarUrl;
    if (partial.businessName !== undefined) dbUpdate.business_name = partial.businessName;
    if (partial.businessPrompt !== undefined) dbUpdate.business_prompt = partial.businessPrompt;
    if (partial.timezone !== undefined) dbUpdate.timezone = partial.timezone;
    if (partial.notificationPreferences !== undefined) {
      dbUpdate.notification_preferences = partial.notificationPreferences;
    }
    if (partial.plan !== undefined) dbUpdate.plan = partial.plan;
    if (partial.subdomain !== undefined) dbUpdate.subdomain = partial.subdomain;
    if (partial.customDomain !== undefined) dbUpdate.custom_domain = partial.customDomain;

    await supabase.from("profiles").update(dbUpdate).eq("id", user.id);

    const updated = { ...profile, ...partial } as UserProfile;
    setProfile(updated);
  }, [user, profile]);

  const setActiveCompany = useCallback((companyId: string) => {
    setActiveCompanyId(companyId);
    localStorage.setItem("activeCompanyId", companyId);
  }, []);

  const refreshCompanies = useCallback(async () => {
    if (!user) return;
    await loadCompanies(user.id);
  }, [user, loadCompanies]);

  const canCreateCompany = useCallback(() => {
    if (!profile) return false;
    const activeCompaniesCount = companies.filter(
      c => c.status !== "archived" && c.status !== "deleted"
    ).length;
    return activeCompaniesCount < profile.monthlyCompanyLimit;
  }, [profile, companies]);

  const deductCredits = useCallback(async (
    amount: number,
    description: string,
    usageType: string,
    companyId?: string
  ): Promise<boolean> => {
    if (!user || !profile) return false;

    // Check if user has enough credits
    if (profile.creditsBalance < amount) {
      return false;
    }

    const newBalance = profile.creditsBalance - amount;

    // Insert transaction (this will trigger auto-update of balance via DB function)
    const { error } = await supabase.from("credits_transactions").insert({
      user_id: user.id,
      type: "usage",
      amount: -amount,
      balance_after: newBalance,
      company_id: companyId || null,
      description,
      usage_type: usageType,
    });

    if (error) {
      console.error("Failed to deduct credits:", error);
      return false;
    }

    // Update local state
    setProfile({
      ...profile,
      creditsBalance: newBalance,
    });

    return true;
  }, [user, profile]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!session,
        isLoading,
        user,
        session,
        profile,
        companies,
        activeCompany,
        signIn,
        signUp,
        requestOtp,
        verifyOtp,
        logout,
        updateProfile,
        setActiveCompany,
        refreshCompanies,
        canCreateCompany,
        deductCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
