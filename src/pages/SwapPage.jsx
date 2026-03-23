import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../components/Notification";

const swapTabs = [
  {
    id: "usdt-usgd",
    labelKey: "swap.tabs.usdtUsgd.label",
    helperKey: "swap.tabs.usdtUsgd.helper",
    from: "USDT",
    to: "USGD",
    rate: 1.0,
  },
  {
    id: "usgd-godl",
    labelKey: "swap.tabs.usgdGodl.label",
    helperKey: "swap.tabs.usgdGodl.helper",
    from: "USGD",
    to: "GODL",
    rate: 0.0246,
  },
];

const tokenMeta = {
  USDT: { balance: 12540.23, icon: "mdi:currency-usd-circle-outline", chipClass: "bg-emerald-500/20 text-emerald-300" },
  USGD: { balance: 9880.1, icon: "mdi:shield-check-outline", chipClass: "bg-sky-500/20 text-sky-300" },
  GODL: { balance: 218.67, icon: "mdi:gold", chipClass: "bg-amber-500/20 text-amber-300" },
};

export default function SwapPage() {
  const { notify } = useNotification();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState(swapTabs[0].id);
  const [amount, setAmount] = useState("");
  const [isReversed, setIsReversed] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [customSlippage, setCustomSlippage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const settingsWrapRef = useRef(null);

  const currentTab = useMemo(
    () => swapTabs.find((item) => item.id === activeTab) ?? swapTabs[0],
    [activeTab],
  );

  const fromToken = isReversed ? currentTab.to : currentTab.from;
  const toToken = isReversed ? currentTab.from : currentTab.to;
  const currentRate = isReversed ? 1 / currentTab.rate : currentTab.rate;
  const fromBalance = tokenMeta[fromToken]?.balance ?? 0;
  const toBalance = tokenMeta[toToken]?.balance ?? 0;

  const numericAmount = Number(amount) || 0;
  const estimate = numericAmount > 0 ? (numericAmount * currentRate).toFixed(6) : "";
  const minimumReceived = estimate ? (Number(estimate) * (1 - slippage / 100)).toFixed(6) : "0.000000";
  const exchangeRateText = `1 ${fromToken} ≈ ${currentRate.toFixed(6)} ${toToken}`;

  useEffect(() => {
    const onClickOutside = (event) => {
      if (showSettings && settingsWrapRef.current && !settingsWrapRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [showSettings]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setIsReversed(false);
    setAmount("");
    setTransactionStatus("");
    setTransactionHash("");
  };

  const handleToggleDirection = () => {
    setIsReversed((prev) => !prev);
    setTransactionStatus("");
    setTransactionHash("");
  };

  const handleSetMax = () => {
    setAmount(fromBalance.toFixed(3));
  };

  const handleRefreshPrice = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      notify({ type: "success", message: t("swap.notifications.priceRefreshed") });
    }, 700);
  };

  const handleConfirmSwap = () => {
    if (isProcessing) return;
    if (!numericAmount || numericAmount <= 0) {
      notify({ type: "error", message: t("swap.notifications.invalidAmount") });
      return;
    }
    if (numericAmount > fromBalance) {
      notify({
        type: "error",
        message: t("swap.notifications.insufficientBalance", { balance: fromBalance.toFixed(3), token: fromToken }),
      });
      return;
    }

    setIsProcessing(true);
    setTransactionStatus("pending");
    notify({ type: "info", message: t("swap.notifications.requestProcessing") });

    setTimeout(() => {
      const hash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.slice(0, 34);
      setTransactionHash(hash);
      setTransactionStatus("success");
      setIsProcessing(false);
      notify({ type: "success", message: t("swap.notifications.swapSuccess", { from: fromToken, to: toToken }) });
    }, 1200);
  };

  return (
    <section className="relative overflow-hidden px-4 py-12 md:py-16">
      <div className="relative mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">{t("swap.title")}</h1>
          <p className="mt-2 text-sm text-slate-400">{t("swap.subtitle")}</p>
        </div>

        <div className="relative mx-auto mt-8 w-full max-w-[520px] overflow-hidden rounded-3xl border border-white/15 bg-white/[0.03] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:p-6">
          <div className="pointer-events-none absolute -left-24 -top-24 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(255,161,125,0.26)_0%,rgba(255,161,125,0)_70%)] blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(237,111,60,0.24)_0%,rgba(237,111,60,0)_72%)] blur-2xl" />

          <div className="relative z-10">
            <div className="">
              {swapTabs.map((tab) => {
                const active = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectTab(tab.id)}
                    className={`rounded-full px-4 py-2 text-sm transition mx-1 ${
                      active
                        ? "morgan-btn-primary border-0 font-semibold text-white shadow-[0_0_18px_rgba(255,177,59,0.42)]"
                        : "morgan-btn-secondary border border-transparent bg-transparent text-slate-300 hover:text-white"
                    }`}
                  >
                    {t(tab.labelKey)}
                  </button>
                );
              })}
            </div>

            <div ref={settingsWrapRef} className="relative mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettings((prev) => !prev)}
                className="morgan-btn-secondary inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-300"
              >
                <Icon icon="mdi:settings" width="16" />
              </button>
              {showSettings && (
                <div
                  className="glass-card absolute right-0 top-11 z-20 w-[280px] rounded-xl p-4 shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.90)", borderColor: "rgba(255, 177, 59, 0.38)" }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{t("swap.settings.title")}</p>
                    <button type="button" onClick={() => setShowSettings(false)} className="text-slate-400 transition hover:text-white">
                      <Icon icon="mdi:close" width="16" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">{t("swap.settings.slippageTolerance")}</p>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {[0.1, 0.5, 1.0, 2.0].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setSlippage(item);
                          setCustomSlippage("");
                        }}
                        className={`rounded-lg px-2 py-1.5 text-xs transition ${
                          slippage === item && customSlippage === ""
                            ? "morgan-btn-primary border-0 text-white"
                            : "morgan-btn-secondary text-slate-300 hover:text-white"
                        }`}
                      >
                        {item}%
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={customSlippage}
                      onChange={(event) => {
                        const value = event.target.value;
                        setCustomSlippage(value);
                        if (value !== "") {
                          const parsed = Number(value);
                          if (!Number.isNaN(parsed)) {
                            setSlippage(parsed);
                          }
                        }
                      }}
                      placeholder={t("swap.settings.customSlippage")}
                      className="h-6 w-full bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-500"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">{t("swap.settings.currentSlippage", { value: slippage })}</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-[#f19873]/50">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>{t("swap.fields.from")}</span>
                <span>
                  {t("swap.fields.balance")}: {fromBalance.toFixed(3)} {fromToken}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.00"
                  className="no-number-spin h-10 w-full bg-transparent text-3xl font-bold text-white outline-none placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={handleSetMax}
                  className="morgan-btn-secondary rounded-md px-2 py-1 text-[10px] font-semibold text-slate-100"
                >
                  {t("swap.buttons.max")}
                </button>
                <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 ${tokenMeta[fromToken].chipClass}`}>
                  <Icon icon={tokenMeta[fromToken].icon} width="16" />
                  <span className="text-sm font-semibold">{fromToken}</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex h-6 items-center justify-center">
              <button
                type="button"
                onClick={handleToggleDirection}
                className="swap-switch-btn morgan-btn-secondary inline-flex h-9 w-9 items-center justify-center rounded-xl border-2 text-[#f4c8b0]"
              >
                <Icon icon="mdi:swap-vertical" width="17" className="swap-switch-icon" />
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-[#f19873]/50">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>{t("swap.fields.to")}</span>
                <span>
                  {t("swap.fields.balance")}: {toBalance.toFixed(3)} {toToken}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={estimate}
                  placeholder="0.00"
                  className="h-10 w-full bg-transparent text-3xl font-bold text-white outline-none placeholder:text-white/20"
                />
                <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 ${tokenMeta[toToken].chipClass}`}>
                  <Icon icon={tokenMeta[toToken].icon} width="16" />
                  <span className="text-sm font-semibold">{toToken}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2 px-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t("swap.stats.exchangeRate")}</span>
                <span className="text-slate-300">{exchangeRateText}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t("swap.stats.priceImpact")}</span>
                <span className="text-emerald-400">{((slippage / 100) * numericAmount).toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t("swap.stats.liquidityFee")}</span>
                <span className="text-slate-300">0.03 {fromToken}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t("swap.stats.minimumReceived")}</span>
                <span className="text-slate-300">
                  {minimumReceived} {toToken}
                </span>
              </div>
            </div>

            {transactionStatus && (
              <div
                className={`mt-5 rounded-xl border px-3 py-2 text-sm ${
                  transactionStatus === "success"
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                    : "border-sky-500/30 bg-sky-500/15 text-sky-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon icon={transactionStatus === "success" ? "mdi:check-circle" : "mdi:clock-outline"} width="16" />
                  <span>{t(`swap.tx.${transactionStatus}`)}</span>
                </div>
                {transactionHash && <p className="mt-1 truncate text-xs opacity-80">{t("swap.tx.hashLabel")}: {transactionHash}</p>}
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirmSwap}
              disabled={!amount || isProcessing}
              className={`morgan-btn-primary mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold ${
                !amount || isProcessing ? "cursor-not-allowed opacity-55" : ""
              }`}
            >
              <Icon icon={isProcessing ? "mdi:refresh" : "mdi:check-circle"} className={isProcessing ? "animate-spin" : ""} width="16" />
              {isProcessing ? t("swap.buttons.processing") : t("swap.buttons.confirmSwap")}
            </button>

            <button
              type="button"
              onClick={handleRefreshPrice}
              disabled={isRefreshing}
              className="morgan-btn-secondary mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl text-xs font-semibold"
            >
              <Icon icon="mdi:refresh" className={isRefreshing ? "animate-spin" : ""} width="14" />
              {isRefreshing ? t("swap.buttons.refreshing") : t("swap.buttons.refreshPrice")}
            </button>

            <p className="mt-4 text-xs leading-5 text-slate-500">{t(currentTab.helperKey)}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2">
            <Icon icon="mdi:shield-check" width="14" />
            {t("swap.tags.audit")}
          </span>
          <span className="inline-flex items-center gap-2">
            <Icon icon="mdi:speedometer" width="14" />
            {t("swap.tags.fastConfirm")}
          </span>
          <span className="inline-flex items-center gap-2">
            <Icon icon="mdi:swap-horizontal-circle-outline" width="14" />
            {t("swap.tags.crossChain")}
          </span>
        </div>
      </div>
    </section>
  );
}
