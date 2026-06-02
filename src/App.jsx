import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppFooter from "./components/AppFooter";
import AppHeader from "./components/AppHeader";
import ContactPage from "./pages/ContactPage";
import DocsPage from "./pages/DocsPage";
import FaqPage from "./pages/FaqPage";
import FarmsPage from "./pages/FarmsPage";
import FundPage from "./pages/FundPage";
import GovernancePage from "./pages/GovernancePage";
import HomePage from "./pages/HomePage";
import LabPage from "./pages/LabPage";
import Portfolio from "./pages/Portfolio";
import SwapPage from "./pages/SwapPage";

function HashScrollHandler() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const id = decodeURIComponent(location.hash.slice(1));
    const target = document.getElementById(id);
    if (target) {
      window.requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.pathname, location.hash]);

  return null;
}

export default function App() {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const baseTitle = "GODL Labs";
    const homeTitle = t("meta.homeTitle");
    const pageTitleKeyByPath = {
      "/": "",
      "/defi": "header.nav.defi",
      "/fund": "fund.title",
      "/stake": "fund.title",
      "/governance": "header.nav.governance",
      "/lab": "lab.title",
      "/docs": "header.nav.docs",
      "/faq": "faq.title",
      "/portfolio": "portfolio.title",
      "/swap": "header.nav.swap",
      "/contact-us": "contact.title",
    };

    const pageTitleKey = pageTitleKeyByPath[location.pathname];
    if (location.pathname === "/") {
      document.title = homeTitle;
      return;
    }

    const pageTitle = pageTitleKey ? t(pageTitleKey) : "";
    document.title = pageTitle ? `${pageTitle} | ${baseTitle}` : baseTitle;
  }, [i18n.language, location.pathname, t]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050608] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(252,213,53,0.14),rgba(252,213,53,0)_36%),radial-gradient(circle_at_12%_30%,rgba(252,213,53,0.08),rgba(252,213,53,0)_32%),radial-gradient(circle_at_88%_68%,rgba(252,213,53,0.08),rgba(252,213,53,0)_28%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <HashScrollHandler />
        <AppHeader />

        <main className="flex-1 pt-[72px] md:pt-[80px]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/defi" element={<FarmsPage />} />
            <Route path="/stake" element={<FundPage />} />
            <Route path="/fund" element={<Navigate to="/stake" replace />} />
            <Route path="/governance" element={<GovernancePage />} />
            <Route path="/lab" element={<LabPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/swap" element={<SwapPage />} />
            <Route path="/contact-us" element={<ContactPage />} />
            <Route path="/farms" element={<Navigate to="/defi" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
