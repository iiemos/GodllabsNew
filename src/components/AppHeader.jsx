import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNotification } from "./Notification";

const navItems = [
  { key: "home", href: "/" },
  { key: "farms", href: "/farms" },
  { key: "portfolio", href: "/portfolio" },
  { key: "swap", href: "/swap" },
  { key: "bridge", action: "bridge" },
];

const WALLET_STORAGE_KEY = "godl_wallet_address";

function formatAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function WalletConnectButton({ address, connecting, onConnect, onDisconnect, t }) {
  if (address) {
    return (
      <div className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ffb13b]/35 bg-[#ffb13b]/10 px-3 text-sm text-[#ffd8b6]">
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
        <span className="max-w-[118px] truncate font-medium">{formatAddress(address)}</span>
        <button
          type="button"
          onClick={onDisconnect}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#ffbe95] transition hover:bg-black/20 hover:text-white"
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletConnecting, setWalletConnecting] = useState(false);

  const languageWrapRef = useRef(null);
  const ethereum = typeof window !== "undefined" ? window.ethereum : undefined;

  const activeMap = useMemo(
    () => ({
      "/": location.pathname === "/",
      "/farms": location.pathname === "/farms" || location.pathname === "/mine/one",
      "/portfolio": location.pathname === "/portfolio" || location.pathname === "/mine/two",
      "/swap": location.pathname === "/swap",
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedAddress = window.localStorage.getItem(WALLET_STORAGE_KEY);
    if (savedAddress) {
      setWalletAddress(savedAddress);
    }

    if (!ethereum?.request) return;

    let alive = true;
    ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (!alive) return;
        const first = Array.isArray(accounts) ? accounts[0] : "";
        if (first) {
          setWalletAddress(first);
          window.localStorage.setItem(WALLET_STORAGE_KEY, first);
        }
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [ethereum]);

  useEffect(() => {
    if (!ethereum?.on) return;

    const onAccountsChanged = (accounts) => {
      const first = Array.isArray(accounts) ? accounts[0] : "";
      if (first) {
        setWalletAddress(first);
        window.localStorage.setItem(WALLET_STORAGE_KEY, first);
        notify({ type: "success", message: `${t("header.wallet.connected")} ${formatAddress(first)}` });
      } else {
        setWalletAddress("");
        window.localStorage.removeItem(WALLET_STORAGE_KEY);
        notify({ type: "info", message: t("header.wallet.disconnected") });
      }
    };

    const onChainChanged = () => {
      notify({ type: "info", message: t("header.wallet.networkChanged") });
    };

    ethereum.on("accountsChanged", onAccountsChanged);
    ethereum.on("chainChanged", onChainChanged);

    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener("accountsChanged", onAccountsChanged);
        ethereum.removeListener("chainChanged", onChainChanged);
      }
    };
  }, [ethereum, notify, t]);

  const handleConnectWallet = async () => {
    if (!ethereum?.request) {
      notify({ type: "error", message: t("header.wallet.extensionMissing") });
      return;
    }

    setWalletConnecting(true);
    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const first = Array.isArray(accounts) ? accounts[0] : "";
      if (first) {
        setWalletAddress(first);
        window.localStorage.setItem(WALLET_STORAGE_KEY, first);
        notify({ type: "success", message: `${t("header.wallet.connected")} ${formatAddress(first)}` });
      }
    } catch (error) {
      if (error?.code === 4001) {
        notify({ type: "info", message: t("header.wallet.connectCancelled") });
      } else {
        notify({ type: "error", message: t("header.wallet.connectFailed") });
      }
    } finally {
      setWalletConnecting(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(WALLET_STORAGE_KEY);
    }
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
      <Link key={item.key} to={item.href} className={`${className} ${isActive ? "text-[#ffcfad]" : ""}`} onClick={onNavigate}>
        {t(`header.nav.${item.key}`)}
      </Link>
    );
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-3 lg:gap-10">
          <div className="flex items-center gap-2">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                <img src="/static/gold.svg" alt="GODL" className="h-5 w-5 object-contain" />
              </span>
              <span className="hidden text-sm font-semibold tracking-[0.16em] text-slate-100 sm:inline">GODL LABS</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-8 lg:gap-10 md:flex">
            {navItems.map((item) => renderNavItem(item, "block px-4 text-sm font-medium text-slate-300 transition hover:text-white"))}
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
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${active ? "bg-white/10 text-[#ffd3b2]" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
                      >
                        <span>{option.label}</span>
                        {active && <Icon icon="mdi:check" width="14" className="text-[#ffb13b]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-200 transition hover:border-white/30 hover:text-white md:hidden"
              aria-label={t("header.menu.toggle")}
            >
              <Icon icon={mobileMenuOpen ? "mdi:close" : "mdi:menu"} width="18" />
            </button>
          </div>
        </div>

        <div className={`${mobileMenuOpen ? "block" : "hidden"} md:hidden`}>
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
