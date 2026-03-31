import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../components/Notification";

const timeframeTabs = ["1D", "1W", "1M"];

const poolItems = [
  {
    id: "pool-godl-usgd-001",
    pair: "GODL-USGD LP",
    tokens: ["godl", "usgd"],
    fee: "0.01%",
    apr: "48.94%",
    tvl: 4412229,
    volume24h: 336920,
    available: "12.5 LP",
    staked: "2.4 LP",
    rewardRate: "18.6 GDL/day",
    status: "active",
    claimable: 26.4,
    liquiditySeries: {
      "1D": [4.09, 4.12, 4.18, 4.23, 4.17, 4.22, 4.3, 4.41],
      "1W": [3.58, 3.63, 3.7, 3.82, 3.95, 4.02, 4.16, 4.41],
      "1M": [2.84, 2.95, 3.08, 3.22, 3.38, 3.57, 3.91, 4.41],
    },
  },
  {
    id: "pool-usgd-gdl-002",
    pair: "USGD-GDL LP",
    tokens: ["usgd", "gdl"],
    fee: "0.05%",
    apr: "36.11%",
    tvl: 924907,
    volume24h: 121084,
    available: "3.7 LP",
    staked: "0 LP",
    rewardRate: "9.2 GDL/day",
    status: "active",
    claimable: 0,
    liquiditySeries: {
      "1D": [0.82, 0.81, 0.84, 0.86, 0.87, 0.89, 0.91, 0.92],
      "1W": [0.68, 0.7, 0.73, 0.76, 0.81, 0.86, 0.9, 0.92],
      "1M": [0.54, 0.56, 0.6, 0.64, 0.7, 0.78, 0.86, 0.92],
    },
  },
  {
    id: "pool-godl-gdl-003",
    pair: "GODL-GDL LP",
    tokens: ["godl", "gdl"],
    fee: "0.05%",
    apr: "25.35%",
    tvl: 7082584,
    volume24h: 481337,
    available: "0 LP",
    staked: "0 LP",
    rewardRate: "12.1 GDL/day",
    status: "ended",
    claimable: 4.9,
    liquiditySeries: {
      "1D": [7.4, 7.31, 7.29, 7.25, 7.2, 7.14, 7.1, 7.08],
      "1W": [8.02, 7.91, 7.82, 7.73, 7.61, 7.43, 7.22, 7.08],
      "1M": [9.44, 9.15, 8.84, 8.59, 8.24, 7.9, 7.46, 7.08],
    },
  },
];

const tokenVisualMap = {
  usgd: { icon: "mdi:shield-check", bg: "bg-cyan-500", text: "text-white" },
  godl: { icon: "mdi:gold", bg: "bg-amber-500", text: "text-white" },
  gdl: { icon: "mdi:chart-donut-variant", bg: "bg-orange-500", text: "text-white" },
};

const parseAmount = (value) => Number(String(value).replace(/[^\d.]/g, "")) || 0;

function formatUsd(value, digits = 0) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

function formatNumber(value, digits = 2) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function buildChartPath(values, width, height, pad) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 0.0001);

  const coords = values.map((point, index) => {
    const x = (index / (values.length - 1)) * (width - pad * 2) + pad;
    const y = pad + (1 - (point - min) / range) * (height - pad * 2);
    return [x, y];
  });

  const line = coords.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const end = coords[coords.length - 1];
  const area = `${line} L${end[0]},${height - pad} L${coords[0][0]},${height - pad} Z`;

  return { line, area, coords };
}

function TokenStack({ tokens }) {
  const shownTokens = tokens.slice(0, 2);
  return (
    <div className="relative flex h-10 w-[56px] items-center">
      {shownTokens.map((token, index) => {
        const visual = tokenVisualMap[token] ?? tokenVisualMap.usgd;
        return (
          <span
            key={`${token}-${index}`}
            className={`absolute flex h-9 w-9 items-center justify-center rounded-full border border-black/30 ${visual.bg} ${visual.text}`}
            style={{ left: `${index * 16}px`, zIndex: shownTokens.length - index }}
          >
            <Icon icon={visual.icon} width="18" />
          </span>
        );
      })}
    </div>
  );
}

function LiquidityChart({ pool, t }) {
  const [frame, setFrame] = useState("1D");
  const values = pool.liquiditySeries[frame];
  const width = 640;
  const height = 220;
  const pad = 16;
  const chart = buildChartPath(values, width, height, pad);
  const current = values[values.length - 1];
  const high = Math.max(...values);
  const low = Math.min(...values);
  const trend = ((current - values[0]) / values[0]) * 100;
  const trendUp = trend >= 0;
  const gradientId = `defi-gradient-${pool.id}-${frame}`.replace(/[^a-zA-Z0-9-_]/g, "");

  return (
    <div className="governance-panel-soft rounded-[24px] p-4 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-200">{t("defi.chart.title")}</p>
        <div className="inline-flex items-center gap-1 rounded-full bg-black/35 p-1">
          {timeframeTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFrame(tab)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                frame === tab ? "bg-[#fcd535] text-black" : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(252,213,53,0.36)" />
              <stop offset="90%" stopColor="rgba(252,213,53,0.03)" />
            </linearGradient>
            <filter id="defi-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {[0.25, 0.5, 0.75].map((y) => (
            <line
              key={y}
              x1={0}
              y1={height * y}
              x2={width}
              y2={height * y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          ))}

          <path d={chart.area} fill={`url(#${gradientId})`} />
          <path d={chart.line} stroke="#fcd535" strokeWidth="3" fill="none" filter="url(#defi-glow)" />
          <circle cx={chart.coords[chart.coords.length - 1][0]} cy={chart.coords[chart.coords.length - 1][1]} r="4" fill="#fcd535" />
        </svg>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-white/8 bg-white/5 px-3 py-2">
          <p className="text-xs text-slate-500">{t("defi.chart.current")}</p>
          <p className="mt-1 text-sm font-semibold text-white">{formatUsd(current * 1000000)}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/5 px-3 py-2">
          <p className="text-xs text-slate-500">{t("defi.chart.high")}</p>
          <p className="mt-1 text-sm font-semibold text-emerald-300">{formatUsd(high * 1000000)}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/5 px-3 py-2">
          <p className="text-xs text-slate-500">{t("defi.chart.low")}</p>
          <p className="mt-1 text-sm font-semibold text-rose-300">{formatUsd(low * 1000000)}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/5 px-3 py-2">
          <p className="text-xs text-slate-500">{t("defi.chart.trend")}</p>
          <p className={`mt-1 text-sm font-semibold ${trendUp ? "text-emerald-300" : "text-rose-300"}`}>
            {trendUp ? "+" : ""}
            {formatNumber(trend, 2)}%
          </p>
        </div>
      </div>
    </div>
  );
}

function PoolCard({ pool, claimable, expanded, onToggle, onAddLiquidity, onClaim, onOpenLink, t }) {
  const canAdd = pool.status === "active";
  const canClaim = claimable > 0;

  return (
    <article className="governance-panel overflow-hidden rounded-[28px]">
      <div className="p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-3">
            <TokenStack tokens={pool.tokens} />
            <div>
              <p className="text-xl font-semibold text-[#f0cd54]">{pool.pair}</p>
              <p className="mt-1 text-sm text-slate-400">
                {t("defi.fields.fee")}: {pool.fee}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold ${
              pool.status === "active"
                ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border border-white/15 bg-white/5 text-slate-300"
            }`}
          >
            {t(`common.status.${pool.status}`)}
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
            <p className="text-xs text-slate-500">{t("defi.fields.apr")}</p>
            <p className="mt-1 text-lg font-semibold text-[#fcd535]">{pool.apr}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
            <p className="text-xs text-slate-500">{t("defi.fields.tvl")}</p>
            <p className="mt-1 text-lg font-semibold text-white">{formatUsd(pool.tvl)}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
            <p className="text-xs text-slate-500">{t("defi.fields.volume24h")}</p>
            <p className="mt-1 text-lg font-semibold text-white">{formatUsd(pool.volume24h)}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
            <p className="text-xs text-slate-500">{t("defi.fields.rewardRate")}</p>
            <p className="mt-1 text-lg font-semibold text-sky-300">{pool.rewardRate}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <p className="rounded-xl border border-white/8 bg-black/20 px-4 py-2 text-slate-400">
            {t("defi.fields.available")}: <span className="ml-1 font-semibold text-slate-200">{pool.available}</span>
          </p>
          <p className="rounded-xl border border-white/8 bg-black/20 px-4 py-2 text-slate-400">
            {t("defi.fields.staked")}: <span className="ml-1 font-semibold text-slate-200">{pool.staked}</span>
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_220px]">
          <button
            type="button"
            onClick={() => onAddLiquidity(pool)}
            disabled={!canAdd}
            className={`h-12 rounded-2xl text-sm font-semibold transition ${
              canAdd ? "morgan-btn-primary border-0 text-[#111111]" : "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
            }`}
          >
            {t("defi.actions.addLiquidity")}
          </button>
          <button
            type="button"
            onClick={() => onClaim(pool)}
            disabled={!canClaim}
            className={`h-12 rounded-2xl text-sm font-semibold transition ${
              canClaim
                ? "border border-[#fcd535]/35 bg-[#fcd535]/10 text-[#f0cd54] hover:bg-[#fcd535]/15"
                : "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
            }`}
          >
            {t("defi.actions.claimGdl")} ({formatNumber(claimable, 2)})
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-12 items-center justify-center gap-1 rounded-2xl border border-white/10 bg-black/25 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:text-white"
          >
            {expanded ? t("defi.actions.hide") : t("defi.actions.details")}
            <Icon icon={expanded ? "mdi:chevron-up" : "mdi:chevron-down"} width="16" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/10 bg-black/20 px-5 py-5 md:px-6 md:py-6">
          <LiquidityChart pool={pool} t={t} />

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => onOpenLink(pool, "pool")}
              className="rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-[#fcd535]/40 hover:text-[#f0cd54]"
            >
              {t("defi.actions.viewPoolDetails")}
            </button>
            <button
              type="button"
              onClick={() => onOpenLink(pool, "pair")}
              className="rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-[#fcd535]/40 hover:text-[#f0cd54]"
            >
              {t("defi.actions.viewPairInfo")}
            </button>
            <button
              type="button"
              onClick={() => onOpenLink(pool, "contract")}
              className="rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-[#fcd535]/40 hover:text-[#f0cd54]"
            >
              {t("defi.actions.viewContract")}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default function FarmsPage() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [statusFilter, setStatusFilter] = useState("active");
  const [onlyStaked, setOnlyStaked] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [claimableMap, setClaimableMap] = useState(() =>
    Object.fromEntries(poolItems.map((item) => [item.id, item.claimable])),
  );

  const filteredPools = useMemo(() => {
    let result = poolItems;

    if (statusFilter !== "all") {
      result = result.filter((pool) => pool.status === statusFilter);
    }

    if (onlyStaked) {
      result = result.filter((pool) => parseAmount(pool.staked) > 0);
    }

    return result;
  }, [statusFilter, onlyStaked]);

  const activeCount = useMemo(() => poolItems.filter((item) => item.status === "active").length, []);
  const totalTvl = useMemo(() => poolItems.reduce((total, item) => total + item.tvl, 0), []);
  const avgApy = useMemo(() => {
    const values = poolItems.map((item) => parseAmount(item.apr));
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    return `${avg.toFixed(2)}%`;
  }, []);

  const handleAddLiquidity = (pool) => {
    notify({
      type: "info",
      message: t("defi.notifications.addLiquidityOpened", { pair: pool.pair }),
    });
  };

  const handleClaim = (pool) => {
    const claimable = claimableMap[pool.id] ?? 0;
    if (claimable <= 0) {
      notify({ type: "info", message: t("defi.notifications.noClaimAvailable") });
      return;
    }

    setClaimableMap((prev) => ({ ...prev, [pool.id]: 0 }));
    notify({
      type: "success",
      message: t("defi.notifications.claimedReward", { pair: pool.pair, amount: formatNumber(claimable, 2) }),
    });
  };

  const handleOpenLink = (pool, target) => {
    notify({
      type: "info",
      message: t("defi.notifications.linkOpened", { pair: pool.pair, target: t(`defi.linkTarget.${target}`) }),
    });
  };

  return (
    <section className="relative overflow-hidden px-4 py-10 md:py-14">
      <div className="governance-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-[-80px] h-[260px] bg-[radial-gradient(circle_at_top,rgba(252,213,53,0.18),rgba(252,213,53,0)_70%)]" />

      <div className="relative mx-auto max-w-6xl">
        <h1 className="text-4xl font-semibold tracking-tight text-[#fcd535] md:text-6xl">{t("defi.title")}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{t("defi.subtitle")}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="governance-panel-soft rounded-3xl p-5">
            <p className="text-sm text-slate-500">{t("defi.summary.poolCount")}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{poolItems.length}</p>
          </article>
          <article className="governance-panel-soft rounded-3xl p-5">
            <p className="text-sm text-slate-500">{t("defi.summary.activeCount")}</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">{activeCount}</p>
          </article>
          <article className="governance-panel-soft rounded-3xl p-5">
            <p className="text-sm text-slate-500">{t("defi.summary.totalTvl")}</p>
            <p className="mt-2 text-3xl font-semibold text-[#fcd535]">{formatUsd(totalTvl)}</p>
            <p className="mt-1 text-xs text-slate-500">
              {t("defi.summary.avgApy")}: {avgApy}
            </p>
          </article>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-4 py-1.5 text-sm ${statusFilter === "active" ? "morgan-btn-primary border-0 text-[#111111]" : "morgan-btn-secondary text-slate-300"}`}
          >
            {t("defi.statusFilter.active")}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("ended")}
            className={`px-4 py-1.5 text-sm ${statusFilter === "ended" ? "morgan-btn-primary border-0 text-[#111111]" : "morgan-btn-secondary text-slate-300"}`}
          >
            {t("defi.statusFilter.ended")}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-1.5 text-sm ${statusFilter === "all" ? "morgan-btn-primary border-0 text-[#111111]" : "morgan-btn-secondary text-slate-300"}`}
          >
            {t("defi.statusFilter.all")}
          </button>

          <label className="ml-1 inline-flex items-center gap-2 px-2 text-sm text-slate-300">
            <button
              type="button"
              onClick={() => setOnlyStaked((prev) => !prev)}
              className={`relative h-6 w-11 rounded-full transition ${onlyStaked ? "bg-[#fcd535]" : "bg-white/15"}`}
            >
              <span className={`absolute top-[2px] h-5 w-5 rounded-full bg-white transition ${onlyStaked ? "left-[22px]" : "left-[2px]"}`} />
            </button>
            {t("defi.onlyStaked")}
          </label>
        </div>

        {filteredPools.length === 0 ? (
          <div className="governance-panel mt-6 rounded-3xl px-6 py-10 text-center">
            <p className="text-slate-300">{t("defi.empty")}</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredPools.map((pool) => (
              <PoolCard
                key={pool.id}
                pool={pool}
                claimable={claimableMap[pool.id] ?? 0}
                expanded={expandedId === pool.id}
                onToggle={() => setExpandedId((prev) => (prev === pool.id ? null : pool.id))}
                onAddLiquidity={handleAddLiquidity}
                onClaim={handleClaim}
                onOpenLink={handleOpenLink}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
