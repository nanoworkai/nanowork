import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BuiltAppState } from "./types";
import { addSignup, saveBuiltApp } from "./derive";

type Ctx = {
  app: BuiltAppState;
  addEmail: (email: string) => void;
  updateName: (name: string, tagline: string) => void;
};

const BuiltAppContext = createContext<Ctx | null>(null);

export function BuiltAppProvider({
  initialApp,
  children,
}: {
  initialApp: BuiltAppState;
  children: ReactNode;
}) {
  const [app, setApp] = useState(initialApp);

  const addEmail = useCallback((email: string) => {
    setApp((s: BuiltAppState) => {
      const n = addSignup(s, email);
      if (n === s) return s;
      saveBuiltApp(n);
      return n;
    });
  }, []);

  const updateName = useCallback((name: string, tagline: string) => {
    setApp((s: BuiltAppState) => {
      const n = { ...s, name: name.trim() || s.name, tagline: tagline.trim() || s.tagline };
      saveBuiltApp(n);
      return n;
    });
  }, []);

  const value = useMemo(
    () => ({ app, addEmail, updateName }),
    [app, addEmail, updateName],
  );

  return <BuiltAppContext.Provider value={value}>{children}</BuiltAppContext.Provider>;
}

export function useBuiltApp() {
  const c = useContext(BuiltAppContext);
  if (!c) throw new Error("useBuiltApp requires BuiltAppProvider");
  return c;
}
