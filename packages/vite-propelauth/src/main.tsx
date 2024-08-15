import { type ReactNode, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider, RedirectToLogin, useAuthInfo, useHostedPageUrls } from "@propelauth/react";

const IsAuthenticated = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn, loading } = useAuthInfo();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (isLoggedIn) {
    return children;
  }

  return <RedirectToLogin postLoginRedirectUrl="http://localhost:5173/api/auth/callback" />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider authUrl={import.meta.env.VITE_AUTH_URL}>
      <IsAuthenticated>
        <App />
      </IsAuthenticated>
    </AuthProvider>
  </StrictMode>,
);
