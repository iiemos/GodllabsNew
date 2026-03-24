import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../components/Notification";

const panelTabs = [
  { id: "farm" },
  { id: "fund" },
];

const farmItems = [
  {
    id: "farm-godl-usgd-1",
    mode: "farm",
    pair: "GODL-USGD LP",
    typeKey: "stable",
    tokens: ["godl", "usgd"],
    fee: "0.01%",
    apy: "48.94%",
    tvl: "$4,412,229",
    metric: "178.2x",
    available: "12.5 LP",
    staked: "2.4 LP",
    rewardTokenKey: "gdlPlusFee",
    status: "active",
    earnedBase: 1.24,
  },
  {
    id: "farm-godl-usgd-2",
    mode: "farm",
    pair: "GODL-USGD LP",
    typeKey: "stable",
    tokens: ["godl", "usgd"],
    fee: "0.05%",
    apy: "27.47%",
    tvl: "$724,228",
    metric: "24.3x",
    available: "0 LP",
    staked: "0 LP",
    rewardTokenKey: "gdlPlusFee",
    status: "active",
    earnedBase: 0.26,
  },
  {
    id: "farm-usgd-gdl-1",
    mode: "farm",
    pair: "USGD-GDL LP",
    typeKey: "growth",
    tokens: ["usgd", "gdl"],
    fee: "0.01%",
    apy: "41.00%",
    tvl: "$1,078,464",
    metric: "7.8x",
    available: "2.2 LP",
    staked: "0.8 LP",
    rewardTokenKey: "gdlPlusFee",
    status: "active",
    earnedBase: 0.41,
  },
  {
    id: "farm-usgd-gdl-2",
    mode: "farm",
    pair: "USGD-GDL LP",
    typeKey: "growth",
    tokens: ["usgd", "gdl"],
    fee: "0.05%",
    apy: "26.32%",
    tvl: "$31,385",
    metric: "0.6x",
    available: "0 LP",
    staked: "0 LP",
    rewardTokenKey: "gdlPlusFee",
    status: "ended",
    earnedBase: 0.04,
  },
  {
    id: "farm-godl-gdl-1",
    mode: "farm",
    pair: "GODL-GDL LP",
    typeKey: "volatile",
    tokens: ["godl", "gdl"],
    fee: "0.05%",
    apy: "31.58%",
    tvl: "$13,425,323",
    metric: "41.9x",
    available: "1.1 LP",
    staked: "0.3 LP",
    rewardTokenKey: "gdlPlusFee",
    status: "active",
    earnedBase: 0.57,
  },
  {
    id: "farm-godl-gdl-2",
    mode: "farm",
    pair: "GODL-GDL LP",
    typeKey: "volatile",
    tokens: ["godl", "gdl"],
    fee: "0.05%",
    apy: "25.35%",
    tvl: "$7,082,584",
    metric: "18.6x",
    available: "0 LP",
    staked: "0 LP",
    rewardTokenKey: "gdlPlusFee",
    status: "active",
    earnedBase: 0.12,
  },
  {
    id: "farm-gdl-usgd-1",
    mode: "farm",
    pair: "GDL-USGD LP",
    typeKey: "volatile",
    tokens: ["gdl", "usgd"],
    fee: "0.05%",
    apy: "36.11%",
    tvl: "$924,907",
    metric: "35.3x",
    available: "3.7 LP",
    staked: "0 LP",
    rewardTokenKey: "gdlPlusFee",
    status: "active",
    earnedBase: 0.32,
  },
  {
    id: "farm-gdl-usgd-2",
    mode: "farm",
    pair: "GDL-USGD LP",
    typeKey: "growth",
    tokens: ["gdl", "usgd"],
    fee: "0.25%",
    apy: "3.66%",
    tvl: "$3,232,113",
    metric: "2.9x",
    available: "0 LP",
    staked: "0 LP",
    rewardTokenKey: "gdlPlusFee",
    status: "ended",
    earnedBase: 0.01,
  },
];

const fundItems = [
  {
    id: "fund-3m",
    mode: "fund",
    pairKey: "m3",
    typeKey: "short",
    tokens: ["godl", "usgd"],
    fee: "0.00%",
    apy: "13.00%",
    tvl: "$28,400,000",
    metricKey: "d90",
    available: "2,000 USGD",
    staked: "1,000 USGD",
    rewardTokenKey: "usgdPlusGdl",
    status: "active",
    earnedBase: 2.14,
  },
  {
    id: "fund-6m",
    mode: "fund",
    pairKey: "m6",
    typeKey: "medium",
    tokens: ["godl", "usgd"],
    fee: "0.00%",
    apy: "19.00%",
    tvl: "$36,900,000",
    metricKey: "d180",
    available: "0 USGD",
    staked: "2,500 USGD",
    rewardTokenKey: "usgdPlusGdl",
    status: "active",
    earnedBase: 4.38,
  },
  {
    id: "fund-12m",
    mode: "fund",
    pairKey: "m12",
    typeKey: "long",
    tokens: ["godl", "usgd"],
    fee: "0.00%",
    apy: "30.00%",
    tvl: "$52,700,000",
    metricKey: "d365",
    available: "300 USGD",
    staked: "0 USGD",
    rewardTokenKey: "usgdPlusGdl",
    status: "ended",
    earnedBase: 1.03,
  },
  {
    id: "fund-vip",
    mode: "fund",
    pairKey: "vip",
    typeKey: "strategy",
    tokens: ["godl", "usgd"],
    fee: "0.10%",
    apy: "16.50%",
    tvl: "$12,140,000",
    metricKey: "d180",
    available: "500 USGD",
    staked: "900 USGD",
    rewardTokenKey: "usgdPlusGdl",
    status: "active",
    earnedBase: 2.42,
  },
];

const farmActionMockStates = [
  { id: "farm-godl-usgd-1", status: "active", showAddLiquidity: true, showClaimReward: true },
  { id: "farm-godl-usgd-2", status: "active", showAddLiquidity: true, showClaimReward: false },
  { id: "farm-usgd-gdl-1", status: "active", showAddLiquidity: true, showClaimReward: true },
  { id: "farm-usgd-gdl-2", status: "ended", showAddLiquidity: false, showClaimReward: false },
  { id: "farm-godl-gdl-1", status: "active", showAddLiquidity: true, showClaimReward: true },
  { id: "farm-godl-gdl-2", status: "active", showAddLiquidity: true, showClaimReward: false },
  { id: "farm-gdl-usgd-1", status: "active", showAddLiquidity: true, showClaimReward: false },
  { id: "farm-gdl-usgd-2", status: "ended", showAddLiquidity: false, showClaimReward: true },
];

const farmActionStateMap = Object.fromEntries(farmActionMockStates.map((item) => [item.id, item]));

const tokenVisualMap = {
  usgd: { icon: "mdi:shield-check", bg: "bg-cyan-500", text: "text-white" },
  godl: { icon: "mdi:gold", bg: "bg-amber-500", text: "text-white" },
  gdl: { icon: "mdi:chart-donut-variant", bg: "bg-orange-500", text: "text-white" },
};

const parseAmount = (value) => Number(String(value).replace(/[^\d.]/g, "")) || 0;

function formatEarned(value) {
  if (value <= 0) return "0";
  if (value < 0.0001) return "0.0001";
  return value.toFixed(4);
}

function getPairText(item, t) {
  return item.pairKey ? t(`farms.fundPairs.${item.pairKey}`) : item.pair;
}

function getMetricText(item, t) {
  return item.metricKey ? t(`farms.fundMetric.${item.metricKey}`) : item.metric;
}

function getDetailLinks(item, t) {
  if (item.mode === "fund") {
    return [
      t("farms.actions.viewFundWhitepaper"),
      t("farms.actions.viewYieldDetails"),
      t("farms.actions.viewContract"),
    ];
  }

  const pairLabel = getPairText(item, t).replace(/\s*LP$/i, "");
  return [
    t("farms.actions.addPairLp", { pair: pairLabel }),
    t("farms.actions.viewPairInfo"),
    t("farms.actions.viewContract"),
  ];
}

function resolveItemActions(item, earnedValue) {
  if (item.mode === "farm") {
    const mockState = farmActionStateMap[item.id];
    if (mockState) {
      return {
        status: mockState.status,
        showAdd: mockState.showAddLiquidity,
        showClaim: mockState.showClaimReward,
        canClaimNow: mockState.showClaimReward && earnedValue > 0,
      };
    }
  }

  const showAdd = item.status === "active";
  const showClaim = parseAmount(item.staked) > 0 || earnedValue > 0;
  return {
    status: item.status,
    showAdd,
    showClaim,
    canClaimNow: showClaim && earnedValue > 0,
  };
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

function ListRow({ item, metricLabel, earnedValue, expanded, onToggle, onAction, onClaim, t }) {
  const isFund = item.mode === "fund";
  const pairText = getPairText(item, t);
  const metricText = getMetricText(item, t);
  const rewardTokenText = t(`farms.rewardTokens.${item.rewardTokenKey}`);
  const mainActionText = isFund ? t("farms.actions.subscribeNow") : t("farms.actions.addLiquidity");
  const detailLinks = getDetailLinks(item, t);
  const actions = resolveItemActions(item, earnedValue);

  const handleRowToggle = (event) => {
    if (event.target.closest("button,a,input,select,textarea,label")) return;
    onToggle();
  };

  return (
    <article className="border-b border-white/10 last:border-b-0">
      <div
        className="grid min-w-[980px] cursor-pointer grid-cols-[2.4fr_0.8fr_0.8fr_0.9fr_1.2fr_0.8fr_0.8fr_0.8fr_0.3fr] items-center gap-3 px-5 py-4 text-sm"
        onClick={handleRowToggle}
      >
        <div className="flex items-center gap-3">
          <TokenStack tokens={item.tokens} />
          <p className="font-semibold text-[#f0cd54]">{pairText}</p>
        </div>

        <span className="inline-flex w-fit rounded-full border border-[#fcd535]/50 bg-[#fcd535]/10 px-2 py-0.5 text-xs font-semibold text-[#f0cd54]">
          {item.fee}
        </span>

        <div>
          <p className="text-[11px] text-slate-500">{t("farms.detail.earned")}</p>
          <p className="font-semibold text-slate-200">{formatEarned(earnedValue)}</p>
        </div>

        <div>
          <p className="text-[11px] text-slate-500">{t("farms.detail.apr")}</p>
          <p className="font-semibold text-[#fcd535]">{item.apy}</p>
        </div>

        <div>
          <p className="text-[11px] text-slate-500">{t("farms.detail.stakedLiquidity")}</p>
          <p className="font-semibold text-slate-200">{item.tvl}</p>
        </div>

        <div>
          <p className="text-[11px] text-slate-500">{metricLabel}</p>
          <p className="font-semibold text-slate-200">{metricText}</p>
        </div>

        <div>
          <p className="text-[11px] text-slate-500">{t("farms.detail.available")}</p>
          <p className="font-semibold text-slate-300">{item.available}</p>
        </div>

        <div>
          <p className="text-[11px] text-slate-500">{t("farms.detail.staked")}</p>
          <p className="font-semibold text-slate-300">{item.staked}</p>
        </div>

        <button type="button" onClick={onToggle} className="text-[#fcd535] transition hover:brightness-110">
          <Icon icon={expanded ? "mdi:chevron-up" : "mdi:chevron-down"} width="20" />
        </button>
      </div>

      {expanded && (
        <div className="grid min-w-[980px] grid-cols-[1fr_2fr_1fr] gap-4 border-t border-white/10 bg-black/20 px-5 py-4">
          <div className="space-y-1 text-sm text-[#fcd535]">
            {detailLinks.map((text) => (
              <button key={text} type="button" onClick={onAction} className="block text-left transition hover:text-[#f0cd54]">
                {text}
              </button>
            ))}
          </div>

          <div className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs text-slate-500">
              {t("farms.detail.status")}: {t(`common.status.${actions.status}`)}
            </p>
            {actions.showAdd ? (
              <button type="button" onClick={onAction} className="morgan-btn-primary inline-flex h-10 w-full items-center justify-center text-sm font-semibold">
                {mainActionText}
              </button>
            ) : (
              <p className="pt-1 text-xs text-slate-400">{t("farms.actions.cannotAdd")}</p>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-slate-300">
              {t("farms.detail.stakedLiquidity")}:
              <span className="ml-1 font-semibold text-white">{item.tvl}</span>
            </p>
            <p className="text-slate-300">
              {metricLabel}:
              <span className="ml-1 font-semibold text-white">{metricText}</span>
            </p>
            <p className="text-slate-300">
              {t("farms.detail.earn")}:
              <span className="ml-1 text-slate-300">{rewardTokenText}</span>
            </p>
            {actions.showClaim ? (
              <button
                type="button"
                onClick={onClaim}
                disabled={!actions.canClaimNow}
                className={`morgan-btn-secondary inline-flex h-9 items-center justify-center px-4 text-xs font-semibold ${actions.canClaimNow ? "" : "cursor-not-allowed opacity-55"}`}
              >
                {t("farms.actions.claimReward")}
              </button>
            ) : (
              <p className="text-xs text-slate-400">{t("farms.actions.noClaim")}</p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function FarmCard({ item, metricLabel, earnedValue, expanded, onToggle, onAction, onClaim, t }) {
  const isFund = item.mode === "fund";
  const pairText = getPairText(item, t);
  const metricText = getMetricText(item, t);
  const rewardTokenText = t(`farms.rewardTokens.${item.rewardTokenKey}`);
  const mainActionText = isFund ? t("farms.actions.subscribeNow") : t("farms.actions.addLiquidity");
  const detailLinks = getDetailLinks(item, t);
  const actions = resolveItemActions(item, earnedValue);

  const handleCardToggle = (event) => {
    if (event.target.closest("button,a,input,select,textarea,label")) return;
    onToggle();
  };

  return (
    <article className="glass-card cursor-pointer overflow-hidden rounded-3xl" onClick={handleCardToggle}>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <TokenStack tokens={item.tokens} />
          <div className="text-right">
            <p className="font-semibold text-[#f0cd54]">{pairText.replace(/\s*LP$/i, "")}</p>
            <div className="mt-1 flex items-center justify-end gap-1.5">
              <span className="inline-flex rounded-full border border-[#fcd535]/50 bg-[#fcd535]/10 px-2 py-0.5 text-xs font-semibold text-[#f0cd54]">{item.fee}</span>
              <span className="inline-flex rounded-full border border-[#fcd535]/35 bg-[#fcd535]/5 px-2 py-0.5 text-xs font-semibold text-[#f0cd54]">{metricText}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <p className="text-slate-400">
            {t("farms.detail.apr")}:
            <span className="ml-1 font-semibold text-[#fcd535]">{item.apy}</span>
          </p>
          <p className="text-right text-slate-400">
            {t("farms.detail.earned")}:
            <span className="ml-1 font-semibold text-slate-200">{formatEarned(earnedValue)}</span>
          </p>
        </div>

        <p className="text-xs text-slate-500">
          {t("farms.detail.earn")}:
          <span className="ml-1 text-slate-300">{rewardTokenText}</span>
        </p>

        <p className="text-xs text-slate-500">
          {t("farms.detail.status")}: {t(`common.status.${actions.status}`)}
        </p>

        {actions.showAdd ? (
          <button type="button" onClick={onAction} className="morgan-btn-primary inline-flex h-10 w-full items-center justify-center text-sm font-semibold">
            {mainActionText}
          </button>
        ) : (
          <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-center text-xs text-slate-400">{t("farms.actions.cannotAdd")}</div>
        )}
      </div>

      <div className="flex justify-center border-t border-white/10 px-4 py-3 text-center">
        <button type="button" onClick={onToggle} className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-[#fcd535]">
          {expanded ? t("farms.actions.hide") : t("farms.actions.details")}
          <Icon icon={expanded ? "mdi:chevron-up" : "mdi:chevron-down"} width="16" />
        </button>
      </div>

      {expanded && (
        <div className="grid gap-3 border-t border-white/10 bg-black/20 px-4 py-4 text-sm sm:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-slate-300">
              {t("farms.detail.stakedLiquidity")}:
              <span className="ml-1 font-semibold text-white">{item.tvl}</span>
            </p>
            <p className="text-slate-300">
              {metricLabel}:
              <span className="ml-1 font-semibold text-white">{metricText}</span>
            </p>
            {actions.showClaim ? (
              <button
                type="button"
                onClick={onClaim}
                disabled={!actions.canClaimNow}
                className={`morgan-btn-secondary mt-2 inline-flex h-9 items-center justify-center px-4 text-xs font-semibold ${actions.canClaimNow ? "" : "cursor-not-allowed opacity-55"}`}
              >
                {t("farms.actions.claimReward")}
              </button>
            ) : (
              <p className="mt-2 text-xs text-slate-400">{t("farms.actions.noClaim")}</p>
            )}
          </div>

          <div className="space-y-1 text-[#fcd535]">
            {detailLinks.map((text) => (
              <button key={text} type="button" onClick={onAction} className="block text-left text-sm transition hover:text-[#f0cd54]">
                {text}
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export default function FarmsPage() {
  const { notify } = useNotification();
  const { t } = useTranslation();
  const [panelTab, setPanelTab] = useState("farm");
  const [viewMode, setViewMode] = useState("list");
  const [statusFilter, setStatusFilter] = useState("active");
  const [onlyStaked, setOnlyStaked] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const allItems = useMemo(() => [...farmItems, ...fundItems], []);
  const [earnedMap, setEarnedMap] = useState(() =>
    Object.fromEntries(allItems.map((item, index) => [item.id, item.earnedBase + index * 0.03])),
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setEarnedMap((prev) => {
        const next = { ...prev };
        for (const item of allItems) {
          if (item.status === "active") {
            next[item.id] = (next[item.id] ?? 0) + Math.random() * 0.015;
          }
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [allItems]);

  const currentItems = panelTab === "farm" ? farmItems : fundItems;
  const metricLabel = t(`farms.metricLabel.${panelTab}`);
  const categoryLabel = t(`farms.categoryLabel.${panelTab}`);

  const typeCount = useMemo(() => new Set(currentItems.map((item) => item.typeKey)).size, [currentItems]);

  const filteredItems = useMemo(() => {
    let result = currentItems;

    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }

    if (onlyStaked) {
      result = result.filter((item) => parseAmount(item.staked) > 0);
    }

    return result;
  }, [currentItems, onlyStaked, statusFilter]);

  const handleToggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleAction = (item) => {
    notify({
      type: "info",
      message: t("farms.notifications.actionOpened", { pair: getPairText(item, t) }),
    });
  };

  const handleClaim = (item) => {
    setEarnedMap((prev) => ({ ...prev, [item.id]: 0 }));
    notify({
      type: "success",
      message: t("farms.notifications.rewardClaimed", { pair: getPairText(item, t) }),
    });
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div>
        <h1 className="text-5xl font-bold tracking-tight text-[#fcd535] md:text-6xl">{t("farms.title")}</h1>
        <p className="mt-3 text-2xl font-semibold text-slate-100">{t("farms.subtitle")}</p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {panelTabs.map((tab) => {
            const active = tab.id === panelTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setPanelTab(tab.id);
                  setExpandedId(null);
                }}
                className={`rounded-full px-4 py-2 text-sm transition ${active ? "morgan-btn-primary border-0 text-[#111111]" : "bg-white/8 text-slate-300 hover:bg-white/14"}`}
              >
                {t(`farms.panelTabs.${tab.id}`)}
              </button>
            );
          })}
        </div>

        <div className="mt-7 hidden items-center text-xs font-semibold tracking-wide text-slate-500 lg:flex">
          <p>{t("farms.filterBy")}</p>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-lg bg-black/25 p-1">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`inline-flex h-8 w-8 items-center justify-center rounded ${viewMode === "card" ? "morgan-btn-primary border-0 text-[#111111]" : "bg-white/8 text-slate-400 hover:bg-white/14"}`}
            >
              <Icon icon="mdi:view-grid-outline" width="16" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex h-8 w-8 items-center justify-center rounded ${viewMode === "list" ? "morgan-btn-primary border-0 text-[#111111]" : "bg-white/8 text-slate-400 hover:bg-white/14"}`}
            >
              <Icon icon="mdi:view-list-outline" width="16" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-4 py-1.5 text-sm ${statusFilter === "active" ? "morgan-btn-primary border-0 text-[#111111]" : "morgan-btn-secondary text-slate-300"}`}
          >
            {t("farms.statusFilter.active")}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("ended")}
            className={`px-4 py-1.5 text-sm ${statusFilter === "ended" ? "morgan-btn-primary border-0 text-[#111111]" : "morgan-btn-secondary text-slate-300"}`}
          >
            {t("farms.statusFilter.ended")}
          </button>

          <button
            type="button"
            className="morgan-btn-secondary inline-flex px-4 py-1.5 text-sm text-slate-300"
            onClick={() =>
              notify({
                type: "info",
                message: t("farms.notifications.categoryFilter", { category: categoryLabel }),
              })
            }
          >
            {categoryLabel}({typeCount})
          </button>

          <label className="inline-flex items-center gap-2 px-2 text-sm text-slate-300">
            <button
              type="button"
              onClick={() => setOnlyStaked((prev) => !prev)}
              className={`relative h-6 w-11 rounded-full transition ${onlyStaked ? "bg-[#fcd535]" : "bg-white/15"}`}
            >
              <span
                className={`absolute top-[2px] h-5 w-5 rounded-full bg-white transition ${onlyStaked ? "left-[22px]" : "left-[2px]"}`}
              />
            </button>
            {t("farms.onlyStaked")}
          </label>
        </div>
      </div>

      {filteredItems.length === 0 && (
        <div className="glass-card mt-6 rounded-2xl px-6 py-10 text-center">
          <p className="text-slate-300">{t("farms.empty")}</p>
        </div>
      )}

      {viewMode === "list" && filteredItems.length > 0 && (
        <div className="glass-card mt-6 overflow-hidden rounded-[24px]">
          <div className="overflow-x-auto">
            <div className="grid min-w-[980px] grid-cols-[2.4fr_0.8fr_0.8fr_0.9fr_1.2fr_0.8fr_0.8fr_0.8fr_0.3fr] gap-3 border-b border-white/10 px-5 py-3 text-xs font-semibold text-slate-500">
              <p>{t("farms.table.pool")}</p>
              <p>{t("farms.table.fee")}</p>
              <p>{t("farms.table.earned")}</p>
              <p>{t("farms.table.apr")}</p>
              <p>{t("farms.table.stakedLiquidity")}</p>
              <p>{metricLabel}</p>
              <p>{t("farms.table.available")}</p>
              <p>{t("farms.table.staked")}</p>
              <p />
            </div>

            {filteredItems.map((item) => (
              <ListRow
                key={item.id}
                item={item}
                metricLabel={metricLabel}
                earnedValue={earnedMap[item.id] ?? 0}
                expanded={expandedId === item.id}
                onToggle={() => handleToggleExpand(item.id)}
                onAction={() => handleAction(item)}
                onClaim={() => handleClaim(item)}
                t={t}
              />
            ))}
          </div>
        </div>
      )}

      {viewMode === "card" && filteredItems.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <FarmCard
              key={item.id}
              item={item}
              metricLabel={metricLabel}
              earnedValue={earnedMap[item.id] ?? 0}
              expanded={expandedId === item.id}
              onToggle={() => handleToggleExpand(item.id)}
              onAction={() => handleAction(item)}
              onClaim={() => handleClaim(item)}
              t={t}
            />
          ))}
        </div>
      )}
    </section>
  );
}
