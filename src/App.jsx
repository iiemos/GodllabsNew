import { Navigate, Route, Routes } from "react-router-dom";
import AppFooter from "./components/AppFooter";
import AppHeader from "./components/AppHeader";
import ContactPage from "./pages/ContactPage";
import FarmsPage from "./pages/FarmsPage";
import HomePage from "./pages/HomePage";
import Portfolio from "./pages/Portfolio";
import SwapPage from "./pages/SwapPage";

export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050608] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(255,133,73,0.22),rgba(255,133,73,0)_36%),radial-gradient(circle_at_12%_30%,rgba(255,133,73,0.14),rgba(255,133,73,0)_32%),radial-gradient(circle_at_88%_68%,rgba(255,133,73,0.14),rgba(255,133,73,0)_28%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <AppHeader />

        <main className="flex-1 pt-[72px] md:pt-[80px]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/farms" element={<FarmsPage />} />
            <Route path="/mine/one" element={<Navigate to="/farms" replace />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/mine/two" element={<Navigate to="/portfolio" replace />} />
            <Route path="/swap" element={<SwapPage />} />
            <Route path="/contact-us" element={<ContactPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
