import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNotification } from "./Notification";
import { useWallet } from "../contexts/WalletContext";

const navItems = [
  { key: "home", href: "/" },
  { key: "fund", href: "/fund" },
  { key: "defi", href: "/defi" },
  { key: "governance", href: "/governance" },
  { key: "portfolio", href: "/portfolio" },
  { key: "swap", href: "/swap" },
  { key: "docs", href: "/docs" },
  { key: "bridge", action: "bridge" },
];

function formatAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function WalletConnectButton({ address, connecting, onConnect, onDisconnect, t }) {
  if (address) {
    return (
      <div className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#fcd535]/30 bg-[#fcd535]/10 px-3 text-sm text-[#f0cd54]">
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
        <span className="max-w-[118px] truncate font-medium">{formatAddress(address)}</span>
        <button
          type="button"
          onClick={onDisconnect}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#f0cd54] transition hover:bg-black/30 hover:text-white"
          title={t("header.wallet.disconnect")}
        >
          <Icon icon="mdi:logout" width="16" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onConnect}
      disabled={connecting}
      className="morgan-btn-secondary inline-flex h-10 items-center gap-2 px-4 text-sm"
    >
      <Icon icon={connecting ? "mdi:loading" : "mdi:wallet"} width="16" className={connecting ? "animate-spin" : ""} />
      {connecting ? t("header.wallet.connecting") : t("header.wallet.connect")}
    </button>
  );
}

export default function AppHeader() {
  const location = useLocation();
  const { notify } = useNotification();
  const { t, i18n } = useTranslation();
  const { address: walletAddress, isConnecting: walletConnecting, connect, disconnect } = useWallet();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  const languageWrapRef = useRef(null);

  const activeMap = useMemo(
    () => ({
      "/": location.pathname === "/",
      "/fund": location.pathname === "/fund",
      "/defi": location.pathname === "/defi" || location.pathname === "/farms" || location.pathname === "/mine/one",
      "/governance": location.pathname === "/governance",
      "/portfolio": location.pathname === "/portfolio" || location.pathname === "/mine/two",
      "/swap": location.pathname === "/swap",
      "/docs": location.pathname === "/docs",
    }),
    [location.pathname],
  );

  const currentLanguage = useMemo(() => (i18n.language?.startsWith("zh") ? "zh" : "en"), [i18n.language]);

  const languageOptions = useMemo(
    () => [
      { code: "en", label: t("header.language.en") },
      { code: "zh", label: t("header.language.zh") },
    ],
    [t],
  );

  useEffect(() => {
    setMobileMenuOpen(false);
    setLanguageMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!languageMenuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (languageWrapRef.current && !languageWrapRef.current.contains(event.target)) {
        setLanguageMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [languageMenuOpen]);

  const handleConnectWallet = async () => {
    try {
      const first = await connect();
      if (first) {
        notify({ type: "success", message: `${t("header.wallet.connected")} ${formatAddress(first)}` });
      }
    } catch (error) {
      if (error?.code === "NO_PROVIDER") {
        notify({ type: "error", message: t("header.wallet.extensionMissing") });
      } else if (error?.code === 4001) {
        notify({ type: "info", message: t("header.wallet.connectCancelled") });
      } else {
        notify({ type: "error", message: t("header.wallet.connectFailed") });
      }
    }
  };

  const handleDisconnectWallet = () => {
    disconnect();
    notify({ type: "info", message: t("header.wallet.sessionDisconnected") });
  };

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("i18nextLng", languageCode);
    }
    setLanguageMenuOpen(false);
  };

  const renderNavItem = (item, className, onNavigate) => {
    if (item.action === "bridge") {
      return (
        <button
          key={item.key}
          type="button"
          onClick={() => {
            notify({ type: "info", message: t("header.bridgeComingSoon") });
            onNavigate?.();
          }}
          className={`${className} cursor-pointer border-0 bg-transparent text-left`}
        >
          {t(`header.nav.${item.key}`)}
        </button>
      );
    }

    const isActive = item.href ? activeMap[item.href] : false;
    return (
      <Link key={item.key} to={item.href} className={`${className} ${isActive ? "text-[#f0cd54]" : ""}`} onClick={onNavigate}>
        {t(`header.nav.${item.key}`)}
      </Link>
    );
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/55 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-3 lg:gap-10">
          <div className="flex items-center gap-2">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl">
                <img src="/static/godl_logo.png" alt="GODL logo" className="h-10 w-10 object-contain" />
              </span>
              <span className="hidden text-sm font-semibold tracking-[0.16em] text-slate-100 sm:inline">GODL LABS</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-2 xl:flex">
            {navItems.map((item) => renderNavItem(item, "block rounded-lg px-2 py-1 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"))}
          </nav>

          <div className="flex items-center gap-2 lg:gap-3">
            <WalletConnectButton
              address={walletAddress}
              connecting={walletConnecting}
              onConnect={handleConnectWallet}
              onDisconnect={handleDisconnectWallet}
              t={t}
            />

            <div ref={languageWrapRef} className="relative">
              <button
                type="button"
                onClick={() => setLanguageMenuOpen((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-200 transition hover:border-white/30 hover:text-white"
                aria-label={t("header.language.label")}
                title={t("header.language.label")}
              >
                <Icon icon="mdi:earth" width="18" />
              </button>

              {languageMenuOpen && (
                <div className="absolute right-0 top-12 z-[70] w-40 rounded-xl border border-white/15 bg-black/85 p-1 shadow-[0_12px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                  {languageOptions.map((option) => {
                    const active = option.code === currentLanguage;
                    return (
                      <button
                        key={option.code}
                        type="button"
                        onClick={() => handleLanguageChange(option.code)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${active ? "bg-white/10 text-[#f0cd54]" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
                      >
                        <span>{option.label}</span>
                        {active && <Icon icon="mdi:check" width="14" className="text-[#fcd535]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-200 transition hover:border-white/30 hover:text-white xl:hidden"
              aria-label={t("header.menu.toggle")}
            >
              <Icon icon={mobileMenuOpen ? "mdi:close" : "mdi:menu"} width="18" />
            </button>
          </div>
        </div>

        <div className={`${mobileMenuOpen ? "block" : "hidden"} xl:hidden`}>
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-4">
            <nav className="flex flex-col gap-3 text-sm text-slate-300">
              {navItems.map((item) =>
                renderNavItem(item, "w-full rounded-lg px-2 py-1 text-left transition hover:bg-white/5 hover:text-white", () => setMobileMenuOpen(false)),
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
