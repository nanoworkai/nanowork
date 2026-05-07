import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export interface UserProfile {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  businessName?: string;
  businessPrompt?: string;
  plan: "free" | "starter" | "growth" | "scale";
  customDomain?: string;
  subdomain?: string;
  stripeCustomerId?: string;
  createdAt: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  requestOtp: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (partial: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  session: null,
  profile: null,
  requestOtp: async () => ({ error: null }),
  verifyOtp: async () => ({ error: null }),
  logout: async () => {},
  updateProfile: async () => {},
});

function phoneToSubdomain(phone: string): string {
  return "app-" + phone.replace(/\D/g, "").slice(-6);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (u: User) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", u.id)
      .single();

    if (data) {
      setProfile(data as UserProfile);
    } else {
      const newProfile: UserProfile = {
        id: u.id,
        phone: u.phone ?? "",
        plan: "free",
        subdomain: phoneToSubdomain(u.phone ?? u.id),
        createdAt: new Date().toISOString(),
      };
      await supabase.from("profiles").upsert(newProfile);
      setProfile(newProfile);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user).finally(() => setIsLoading(false));
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) await loadProfile(s.user);
        else setProfile(null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

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
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (partial: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...profile, ...partial } as UserProfile;
    setProfile(updated);
    await supabase.from("profiles").update(partial).eq("id", user.id);
  }, [user, profile]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!session,
        isLoading,
        user,
        session,
        profile,
        requestOtp,
        verifyOtp,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
