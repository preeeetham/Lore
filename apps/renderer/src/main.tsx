import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "@/contexts/theme-context";
import { ErrorBoundary } from "./ErrorBoundary";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system">
        <App />
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
