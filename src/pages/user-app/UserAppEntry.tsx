import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { BuiltAppProvider } from "../../built-app/BuiltAppContext";
import { loadBuiltApp } from "../../built-app/derive";

/**
 * Mounts the generated app only when a build exists in storage.
 */
export default function UserAppEntry() {
  const [app] = useState(() => loadBuiltApp());
  if (!app) {
    return <Navigate to="/" replace />;
  }
  return (
    <BuiltAppProvider initialApp={app}>
      <Outlet />
    </BuiltAppProvider>
  );
}
