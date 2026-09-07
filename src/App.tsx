import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { KEYS, getLS } from "./lib/storage";
import { SiteHeader } from "./components/layout/SiteHeader";
import { SiteFooter } from "./components/layout/SiteFooter";
import Landing from "./pages/Landing";
import Studio from "./pages/Studio";

function AppShell() {
  const [, setThemeTick] = useState(0);

  useEffect(() => {
    const saved = getLS(KEYS.theme, "");
    if (saved === "dark") document.documentElement.classList.add("dark");
    // respect system if no pref
    if (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const bump = () => setThemeTick((x) => x + 1);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <SiteHeader onToggleTheme={bump} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<Studio />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return <AppShell />;
}
