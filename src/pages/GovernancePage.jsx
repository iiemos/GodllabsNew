import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

export default function GovernancePage() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden px-4 py-10 md:py-14">
      <div className="governance-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-[-80px] h-[260px] bg-[radial-gradient(circle_at_top,rgba(252,213,53,0.18),rgba(252,213,53,0)_70%)]" />

      <div className="relative mx-auto max-w-5xl">
        <h1 className="text-4xl font-semibold tracking-tight text-[#fcd535] md:text-6xl">{t("governance.title")}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{t("governance.description")}</p>

        <article className="governance-panel mt-8 rounded-[28px] p-6 text-center md:p-10">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-[#fcd535]/30 bg-[#fcd535]/10 text-[#fcd535]">
            <Icon icon="mdi:clock-outline" width="30" />
          </div>
          <p className="mt-5 text-2xl font-semibold text-white md:text-3xl">{t("governance.comingSoon")}</p>
        </article>
      </div>
    </section>
  );
}
