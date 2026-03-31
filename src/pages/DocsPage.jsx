import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

const sectionKeys = [
  "background",
  "assets",
  "tokenomics",
  "releaseRules",
  "fundYield",
  "gdlIncentive",
];

export default function DocsPage() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden px-4 py-10 md:py-14">
      <div className="governance-grid pointer-events-none absolute inset-0 opacity-25" />
      <div className="pointer-events-none absolute inset-x-0 top-[-60px] h-[240px] bg-[radial-gradient(circle_at_top,rgba(252,213,53,0.18),rgba(252,213,53,0)_70%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="governance-panel rounded-[32px] p-6 md:p-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#fcd535]/20 bg-[#fcd535]/8 px-4 py-2 text-xs font-medium tracking-[0.12em] text-[#f0cd54]">
            <Icon icon="mdi:file-document-multiple-outline" width="14" />
            {t("docs.badge")}
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-6xl">{t("docs.title")}</h1>
          <p className="mt-4 max-w-4xl text-base leading-7 text-slate-300">{t("docs.subtitle")}</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {sectionKeys.map((key) => {
            const points = t(`docs.sections.${key}.points`, { returnObjects: true });
            const pointList = Array.isArray(points) ? points : [];

            return (
              <article key={key} className="governance-panel rounded-[28px] p-5 md:p-6">
                <h2 className="text-2xl font-semibold text-white">{t(`docs.sections.${key}.title`)}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{t(`docs.sections.${key}.summary`)}</p>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-400">
                  {pointList.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#fcd535]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="governance-panel-soft rounded-[24px] p-5 md:p-6">
            <p className="text-sm font-semibold text-[#f0cd54]">{t("docs.formulas.fund.title")}</p>
            <p className="mt-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3 font-mono text-sm text-emerald-300">
              {t("docs.formulas.fund.expression")}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{t("docs.formulas.fund.note")}</p>
          </article>
          <article className="governance-panel-soft rounded-[24px] p-5 md:p-6">
            <p className="text-sm font-semibold text-[#f0cd54]">{t("docs.formulas.gdl.title")}</p>
            <p className="mt-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3 font-mono text-sm text-emerald-300">
              {t("docs.formulas.gdl.expression")}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{t("docs.formulas.gdl.note")}</p>
          </article>
        </div>

        <div className="governance-panel mt-6 rounded-[28px] p-5 md:p-6">
          <p className="text-sm leading-7 text-slate-300">{t("docs.whitepaperNote")}</p>
        </div>
      </div>
    </section>
  );
}
