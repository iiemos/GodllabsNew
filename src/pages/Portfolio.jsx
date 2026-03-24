import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const balances = [
  { key: "usdt", amount: "12,540.23", value: "$12,540.23", iconSrc: "/static/usdt.svg" },
  { key: "usgd", amount: "9,880.10", value: "$9,880.10", iconSrc: "/static/usgd.svg" },
  { key: "gdl", amount: "41,260.52", value: "$4,126.05", icon: "mynaui:letter-g-waves-solid" },
  { key: "godl", amount: "218.67", value: "$12,026.85", iconSrc: "/static/gold.svg" },
  { key: "fundShares", amount: "31.40", value: "$31,400.00", icon: "solar:pie-chart-2-bold" },
];

const records = [
  { time: "2026-03-22 09:38", typeKey: "fundSubscribe", token: "USGD", amount: "-2,000.00", statusKey: "completed" },
  { time: "2026-03-22 08:11", typeKey: "rewardClaim", token: "GDL", amount: "+18.2241", statusKey: "completed" },
  { time: "2026-03-21 22:04", typeKey: "lpMining", token: "USGD/USDT", amount: "+4.9932", statusKey: "completed" },
  { time: "2026-03-21 18:42", typeKey: "swap", token: "USDT → USGD", amount: "1,200.00", statusKey: "completed" },
];

export default function Portfolio() {
  const { t } = useTranslation();

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
          <Link
            to="/swap"
            className="morgan-btn-secondary inline-flex h-10 items-center justify-center px-4 text-sm"
          >
            {t("portfolio.goSwap")}
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {balances.map((item) => (
          <article key={item.key} className="glass-card min-h-[136px] rounded-2xl p-3">
            <div className="flex h-11 w-11 items-center justify-center text-[#fcd535]">
              {item.iconSrc ? (
                <img src={item.iconSrc} alt={`${t(`portfolio.balances.${item.key}`)} icon`} className="h-8 w-8 object-contain" />
              ) : (
                <Icon icon={item.icon} width="28" />
              )}
            </div>
            <p className="mt-2 text-xs text-slate-400">{t(`portfolio.balances.${item.key}`)}</p>
            <p className="mt-0.5 text-lg font-semibold text-white">{item.amount}</p>
            <p className="mt-0.5 text-xs text-slate-500">{item.value}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="flex items-center justify-center text-xl font-semibold text-white">
          <Icon icon="solar:checklist-minimalistic-bold" className="mr-2 text-[#fcd535]" />
          {t("portfolio.recordsTitle")}
        </h2>
        <p className="text-xs text-slate-500">{t("portfolio.recentCount")}</p>
      </div>

      <div className="glass-card mt-3 rounded-2xl p-5 md:p-6">
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
              {records.map((row) => (
                <tr key={`${row.time}-${row.typeKey}`} className="border-t border-white/10 text-slate-300">
                  <td className="px-3 py-3">{row.time}</td>
                  <td className="px-3 py-3">{t(`portfolio.recordTypes.${row.typeKey}`)}</td>
                  <td className="px-3 py-3">{row.token}</td>
                  <td className="px-3 py-3">{row.amount}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">
                      {t(`common.status.${row.statusKey}`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
