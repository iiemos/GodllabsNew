import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNotification } from "../components/Notification";
import { useWallet } from "../contexts/WalletContext";
import { createCoreContracts, validateCoreContractAddresses } from "../web3/contracts";
import { getReadProvider, isExpectedChain } from "../web3/client";
import { TBSC_CHAIN_ID } from "../web3/config";
import { formatTimestamp, formatTokenAmount, toErrorMessage } from "../web3/format";

const BALANCE_CARD_META = [
  { key: "usdt", iconSrc: "/static/usdt.svg", symbol: "USDT" },
  { key: "usgd", iconSrc: "/static/usgd.svg", symbol: "USGD" },
  { key: "gdl", icon: "mynaui:letter-g-waves-solid", symbol: "GDL" },
  { key: "godl", iconSrc: "/static/gold.svg", symbol: "GODL" },
  { key: "fundShares", icon: "solar:pie-chart-2-bold", symbol: "USGD" },
];

const EMPTY_BALANCES = {
  usdt: 0n,
  usgd: 0n,
  gdl: 0n,
  godl: 0n,
  fundShares: 0n,
};

export default function Portfolio() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { address, chainId, connect } = useWallet();

  const [loading, setLoading] = useState(true);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [balances, setBalances] = useState(EMPTY_BALANCES);
  const [records, setRecords] = useState([]);

  const loadPortfolioData = useCallback(async () => {
    if (!address) {
      setBalances(EMPTY_BALANCES);
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const readProvider = getReadProvider();
    const contracts = createCoreContracts(readProvider);

    try {
      await validateCoreContractAddresses(readProvider);

      const [usdtBalance, usgdBalance, gdlBalance, godlBalance, nextPurchaseId] = await Promise.all([
        contracts.usdt.balanceOf(address).catch(() => 0n),
        contracts.usgd.balanceOf(address).catch(() => 0n),
        contracts.gdl.balanceOf(address).catch(() => 0n),
        contracts.godl.balanceOf(address).catch(() => 0n),
        contracts.gold.nextPurchaseId().catch(() => 1n),
      ]);

      const lookback = 120n;
      const startId = nextPurchaseId > lookback ? nextPurchaseId - lookback : 1n;
      const ids = [];
      for (let id = startId; id < nextPurchaseId; id += 1n) {
        ids.push(id);
      }

      let ownedPurchases = [];
      if (ids.length > 0) {
        const purchaseRows = await Promise.all(
          ids.map(async (id) => {
            try {
              const detail = await contracts.gold.purchases(id);
              return { id, detail };
            } catch {
              return null;
            }
          }),
        );

        const ownerLower = address.toLowerCase();
        ownedPurchases = purchaseRows
          .filter(Boolean)
          .filter((row) => row.detail.owner && String(row.detail.owner).toLowerCase() === ownerLower)
          .sort((a, b) => Number(b.id - a.id));
      }

      const totalFundShares = ownedPurchases.reduce((sum, row) => sum + (row.detail.usgdPrincipalGross ?? 0n), 0n);

      const latestRecords = ownedPurchases.slice(0, 8).map((row) => ({
        time: formatTimestamp(row.detail.startAt),
        typeKey: "fundSubscribe",
        token: "GODL",
        amount: `-${formatTokenAmount(row.detail.godlAmount, 18, 6)}`,
        statusKey: row.detail.maturedClaimed ? "completed" : "active",
      }));

      setBalances({
        usdt: usdtBalance,
        usgd: usgdBalance,
        gdl: gdlBalance,
        godl: godlBalance,
        fundShares: totalFundShares,
      });
      setRecords(latestRecords);
    } catch (error) {
      notify({ type: "error", message: toErrorMessage(error, t("portfolio.loadFailed")) });
      setBalances(EMPTY_BALANCES);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [address, notify, t]);

  useEffect(() => {
    loadPortfolioData();
  }, [loadPortfolioData, refreshNonce]);

  const canRefresh = useMemo(() => Boolean(address), [address]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch {
      notify({ type: "error", message: t("portfolio.connectFailed") });
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300">
              <Icon icon="mdi:view-dashboard-outline" width="14" />
              {t("portfolio.badge")}
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">{t("portfolio.title")}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{t("portfolio.description")}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/swap" className="morgan-btn-secondary inline-flex h-10 items-center justify-center px-4 text-sm">
              {t("portfolio.goSwap")}
            </Link>
            <button
              type="button"
              onClick={() => setRefreshNonce((prev) => prev + 1)}
              disabled={!canRefresh}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm transition ${
                canRefresh ? "border-white/10 bg-white/5 text-slate-200 hover:border-white/25 hover:text-white" : "cursor-not-allowed border-white/10 bg-white/5 text-slate-500"
              }`}
            >
              <Icon icon="mdi:refresh" width="15" />
              {t("portfolio.refresh")}
            </button>
          </div>
        </div>
      </div>

      {!address && (
        <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{t("portfolio.connectHint")}</span>
            <button type="button" onClick={handleConnect} className="morgan-btn-secondary inline-flex h-9 items-center px-3 text-xs">
              {t("portfolio.connectWallet")}
            </button>
          </div>
        </div>
      )}

      {address && !isExpectedChain(chainId) && (
        <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {t("portfolio.switchNetwork", { chainId: TBSC_CHAIN_ID })}
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {BALANCE_CARD_META.map((item) => (
          <article key={item.key} className="glass-card min-h-[136px] rounded-2xl p-3">
            <div className="flex h-11 w-11 items-center justify-center text-[#fcd535]">
              {item.iconSrc ? (
                <img src={item.iconSrc} alt={`${t(`portfolio.balances.${item.key}`)} icon`} className="h-8 w-8 object-contain" />
              ) : (
                <Icon icon={item.icon} width="28" />
              )}
            </div>
            <p className="mt-2 text-xs text-slate-400">{t(`portfolio.balances.${item.key}`)}</p>
            <p className="mt-0.5 text-lg font-semibold text-white">{loading ? "--" : formatTokenAmount(balances[item.key], 18, 6)}</p>
            <p className="mt-0.5 text-xs text-slate-500">{item.symbol}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="flex items-center justify-center text-xl font-semibold text-white">
          <Icon icon="solar:checklist-minimalistic-bold" className="mr-2 text-[#fcd535]" />
          {t("portfolio.recordsTitle")}
        </h2>
        <p className="text-xs text-slate-500">{t("portfolio.recentCount", { count: records.length })}</p>
      </div>

      <div className="glass-card mt-3 rounded-2xl p-5 md:p-6">
        {loading ? (
          <p className="text-sm text-slate-400">{t("portfolio.loading")}</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-slate-400">{t("portfolio.emptyRecords")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">{t("portfolio.table.time")}</th>
                  <th className="px-3 py-2 font-medium">{t("portfolio.table.type")}</th>
                  <th className="px-3 py-2 font-medium">{t("portfolio.table.token")}</th>
                  <th className="px-3 py-2 font-medium">{t("portfolio.table.amount")}</th>
                  <th className="px-3 py-2 font-medium">{t("portfolio.table.status")}</th>
                </tr>
              </thead>
              <tbody>
                {records.map((row, index) => (
                  <tr key={`${row.time}-${row.typeKey}-${index}`} className="border-t border-white/10 text-slate-300">
                    <td className="px-3 py-3">{row.time}</td>
                    <td className="px-3 py-3">{t(`portfolio.recordTypes.${row.typeKey}`)}</td>
                    <td className="px-3 py-3">{row.token}</td>
                    <td className="px-3 py-3">{row.amount}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          row.statusKey === "completed"
                            ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                            : "border border-amber-400/30 bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {t(`common.status.${row.statusKey}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
