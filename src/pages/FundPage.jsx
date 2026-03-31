import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../components/Notification";

const fundItems = [
  {
    id: "fund3m",
    cycleDays: 90,
    apr: 0.13,
    principal: 2000,
    maturityDate: "2026-06-30",
    status: "active",
    gdlTotal: 880,
    gdlReleased: 350,
    gdlClaimed: 120,
  },
  {
    id: "fund6m",
    cycleDays: 180,
    apr: 0.19,
    principal: 2500,
    maturityDate: "2026-09-30",
    status: "active",
    gdlTotal: 1260,
    gdlReleased: 468,
    gdlClaimed: 180,
  },
  {
    id: "fund12m",
    cycleDays: 365,
    apr: 0.3,
    principal: 3000,
    maturityDate: "2026-01-15",
    status: "ended",
    gdlTotal: 2100,
    gdlReleased: 2100,
    gdlClaimed: 1220,
  },
];

function formatAmount(value, digits = 2) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function calcRedeemTotal(principal, apr, days) {
  return principal * (1 + (apr * days) / 365);
}

export default function FundPage() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [stateMap, setStateMap] = useState(() =>
    Object.fromEntries(
      fundItems.map((item) => [
        item.id,
        {
          gdlClaimed: item.gdlClaimed,
          redeemed: false,
        },
      ]),
    ),
  );

  const totalPrincipal = useMemo(() => fundItems.reduce((sum, item) => sum + item.principal, 0), []);
  const totalFundYield = useMemo(
    () =>
      fundItems.reduce((sum, item) => {
        const total = calcRedeemTotal(item.principal, item.apr, item.cycleDays);
        return sum + (total - item.principal);
      }, 0),
    [],
  );
  const totalGdlRewards = useMemo(() => fundItems.reduce((sum, item) => sum + item.gdlTotal, 0), []);

  const handleRedeem = (item) => {
    const localState = stateMap[item.id];
    if (localState.redeemed) {
      notify({ type: "info", message: t("fund.notifications.alreadyRedeemed") });
      return;
    }

    if (item.status !== "ended") {
      notify({
        type: "info",
        message: t("fund.notifications.redeemNotMatured", { date: item.maturityDate }),
      });
      return;
    }

    const total = calcRedeemTotal(item.principal, item.apr, item.cycleDays);
    setStateMap((prev) => ({
      ...prev,
      [item.id]: {
        ...prev[item.id],
        redeemed: true,
      },
    }));

    notify({
      type: "success",
      message: t("fund.notifications.redeemSuccess", {
        plan: t(`fund.products.${item.id}`),
        amount: formatAmount(total),
      }),
    });
  };

  const handleClaimAirdrop = (item) => {
    const localState = stateMap[item.id];
    const claimable = Math.max(item.gdlReleased - localState.gdlClaimed, 0);
    if (claimable <= 0) {
      notify({ type: "info", message: t("fund.notifications.noAirdropAvailable") });
      return;
    }

    setStateMap((prev) => ({
      ...prev,
      [item.id]: {
        ...prev[item.id],
        gdlClaimed: prev[item.id].gdlClaimed + claimable,
      },
    }));

    notify({
      type: "success",
      message: t("fund.notifications.airdropClaimed", {
        amount: formatAmount(claimable),
      }),
    });
  };

  return (
    <section className="relative overflow-hidden px-4 py-10 md:py-14">
      <div className="governance-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-[-80px] h-[260px] bg-[radial-gradient(circle_at_top,rgba(252,213,53,0.18),rgba(252,213,53,0)_70%)]" />

      <div className="relative mx-auto max-w-6xl">
        <h1 className="text-4xl font-semibold tracking-tight text-[#fcd535] md:text-6xl">{t("fund.title")}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{t("fund.subtitle")}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="governance-panel-soft rounded-3xl p-5">
            <p className="text-sm text-slate-500">{t("fund.summary.principal")}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{formatAmount(totalPrincipal)} USGD</p>
          </article>
          <article className="governance-panel-soft rounded-3xl p-5">
            <p className="text-sm text-slate-500">{t("fund.summary.yield")}</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">{formatAmount(totalFundYield)} USGD</p>
          </article>
          <article className="governance-panel-soft rounded-3xl p-5">
            <p className="text-sm text-slate-500">{t("fund.summary.gdlAirdrop")}</p>
            <p className="mt-2 text-3xl font-semibold text-[#fcd535]">{formatAmount(totalGdlRewards)} GDL</p>
          </article>
        </div>

        <div className="mt-6 space-y-4">
          {fundItems.map((item) => {
            const localState = stateMap[item.id];
            const redeemTotal = calcRedeemTotal(item.principal, item.apr, item.cycleDays);
            const fundYield = redeemTotal - item.principal;
            const claimableAirdrop = Math.max(item.gdlReleased - localState.gdlClaimed, 0);
            const releaseRate = item.gdlTotal > 0 ? (item.gdlReleased / item.gdlTotal) * 100 : 0;
            const canRedeem = item.status === "ended" && !localState.redeemed;

            return (
              <article key={item.id} className="governance-panel overflow-hidden rounded-[28px]">
                <div className="border-b border-white/10 p-5 md:p-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">{t(`fund.products.${item.id}`)}</h2>
                      <p className="mt-2 text-sm text-slate-400">
                        {t("fund.fields.cycle")}: {item.cycleDays} {t("fund.fields.days")} · {t("fund.fields.apr")}:{" "}
                        {(item.apr * 100).toFixed(2)}%
                      </p>
                    </div>
                    <span
                      className={`inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold ${
                        item.status === "ended"
                          ? "border border-white/15 bg-white/5 text-slate-300"
                          : "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      }`}
                    >
                      {t(`common.status.${item.status}`)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
                  <div className="governance-panel-soft rounded-3xl p-5">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <Icon icon="mdi:bank-transfer" width="16" className="text-[#fcd535]" />
                      {t("fund.claims.maturityTitle")}
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-slate-400">
                      <p>
                        {t("fund.fields.principal")}: <span className="font-semibold text-white">{formatAmount(item.principal)} USGD</span>
                      </p>
                      <p>
                        {t("fund.fields.fundYield")}: <span className="font-semibold text-emerald-300">{formatAmount(fundYield)} USGD</span>
                      </p>
                      <p>
                        {t("fund.fields.maturityDate")}: <span className="font-semibold text-slate-200">{item.maturityDate}</span>
                      </p>
                      <p>
                        {t("fund.fields.redeemTotal")}: <span className="font-semibold text-[#f0cd54]">{formatAmount(redeemTotal)} USGD</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRedeem(item)}
                      disabled={!canRedeem}
                      className={`mt-5 h-12 w-full rounded-2xl text-sm font-semibold transition ${
                        canRedeem ? "morgan-btn-primary border-0 text-[#111111]" : "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
                      }`}
                    >
                      {localState.redeemed
                        ? t("fund.actions.redeemed")
                        : canRedeem
                          ? t("fund.actions.redeemAll")
                          : t("fund.actions.redeemLocked")}
                    </button>
                  </div>

                  <div className="governance-panel-soft rounded-3xl p-5">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <Icon icon="mdi:gift-open-outline" width="16" className="text-[#fcd535]" />
                      {t("fund.claims.airdropTitle")}
                    </p>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[#fcd535]"
                        style={{ width: `${Math.min(Math.max(releaseRate, 0), 100)}%` }}
                      />
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-400">
                      <p>
                        {t("fund.fields.airdropTotal")}: <span className="font-semibold text-white">{formatAmount(item.gdlTotal)} GDL</span>
                      </p>
                      <p>
                        {t("fund.fields.airdropReleased")}: <span className="font-semibold text-emerald-300">{formatAmount(item.gdlReleased)} GDL</span>
                      </p>
                      <p>
                        {t("fund.fields.airdropClaimed")}: <span className="font-semibold text-slate-200">{formatAmount(localState.gdlClaimed)} GDL</span>
                      </p>
                      <p>
                        {t("fund.fields.airdropClaimable")}: <span className="font-semibold text-[#f0cd54]">{formatAmount(claimableAirdrop)} GDL</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClaimAirdrop(item)}
                      disabled={claimableAirdrop <= 0}
                      className={`mt-5 h-12 w-full rounded-2xl text-sm font-semibold transition ${
                        claimableAirdrop > 0
                          ? "border border-[#fcd535]/35 bg-[#fcd535]/10 text-[#f0cd54] hover:bg-[#fcd535]/15"
                          : "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
                      }`}
                    >
                      {t("fund.actions.claimAirdrop")}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
