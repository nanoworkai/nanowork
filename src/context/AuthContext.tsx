import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface AgentProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  domain: string;
  plan: "starter" | "growth" | "scale";
  status: "active" | "paused" | "error";
  createdAt: string;
  spending: {
    currentMonth: number;
    limit: number;
    history: { month: string; amount: number }[];
  };
  domains: { domain: string; status: "active" | "pending" | "error"; addedAt: string }[];
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  phone: string | null;
  agent: AgentProfile | null;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<boolean>;
  logout: () => void;
  updateAgent: (partial: Partial<AgentProfile>) => void;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  phone: null,
  agent: null,
  requestOtp: async () => {},
  verifyOtp: async () => false,
  logout: () => {},
  updateAgent: () => {},
});

const AUTH_KEY = "nanowork-auth";

const MOCK_AGENT: AgentProfile = {
  id: "agent_01J8K2M",
  name: "Morning Brief AI",
  phone: "+1 (555) 012-3456",
  email: "hello@morningbrief.ai",
  domain: "morningbrief.ai",
  plan: "growth",
  status: "active",
  createdAt: "2025-11-14T08:00:00Z",
  spending: {
    currentMonth: 47.82,
    limit: 200,
    history: [
      { month: "Nov 2025", amount: 12.4 },
      { month: "Dec 2025", amount: 28.9 },
      { month: "Jan 2026", amount: 41.2 },
      { month: "Feb 2026", amount: 38.5 },
      { month: "Mar 2026", amount: 52.1 },
      { month: "Apr 2026", amount: 47.82 },
    ],
  },
  domains: [
    { domain: "morningbrief.ai", status: "active", addedAt: "2025-11-14T08:00:00Z" },
    { domain: "www.morningbrief.ai", status: "active", addedAt: "2025-11-14T08:00:00Z" },
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [phone, setPhone] = useState<string | null>(null);
  const [agent, setAgent] = useState<AgentProfile | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPhone(parsed.phone);
        setAgent(parsed.agent || MOCK_AGENT);
        setIsAuthenticated(true);
      }
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const requestOtp = useCallback(async (phoneNumber: string) => {
    setPhone(phoneNumber);
    await new Promise((r) => setTimeout(r, 800));
  }, []);

  const verifyOtp = useCallback(
    async (code: string) => {
      await new Promise((r) => setTimeout(r, 600));
      if (code.length >= 4) {
        const agentData = { ...MOCK_AGENT, phone: phone || MOCK_AGENT.phone };
        setAgent(agentData);
        setIsAuthenticated(true);
        try {
          localStorage.setItem(AUTH_KEY, JSON.stringify({ phone, agent: agentData }));
        } catch {
          // ignore
        }
        return true;
      }
      return false;
    },
    [phone],
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setPhone(null);
    setAgent(null);
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {
      // ignore
    }
  }, []);

  const updateAgent = useCallback((partial: Partial<AgentProfile>) => {
    setAgent((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem(AUTH_KEY, JSON.stringify({ phone, agent: updated }));
      } catch {
        // ignore
      }
      return updated;
    });
  }, [phone]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, phone, agent, requestOtp, verifyOtp, logout, updateAgent }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
