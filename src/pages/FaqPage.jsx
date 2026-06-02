import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

export default function FaqPage() {
  const { t } = useTranslation();
  const items = t("faq.items", { returnObjects: true });

  return (
    <section className="relative overflow-hidden px-4 py-14 md:py-20">
      <div className="governance-grid pointer-events-none absolute inset-0 opacity-25" />
      <div className="pointer-events-none absolute inset-x-0 top-[-80px] h-[260px] bg-[radial-gradient(circle_at_top,rgba(252,213,53,0.16),rgba(252,213,53,0)_70%)]" />

      <div className="relative mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f0cd54]">{t("faq.badge")}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-6xl">{t("faq.title")}</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">{t("faq.subtitle")}</p>

        <div className="mt-10 space-y-3">
          {items.map((item, index) => (
            <details key={item.question} className="group glass-card overflow-hidden rounded-2xl p-0" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-white md:px-6">
                <span>{item.question}</span>
                <Icon icon="mdi:chevron-down" width="22" className="mt-0.5 shrink-0 text-[#fcd535] transition group-open:rotate-180" />
              </summary>
              <div className="border-t border-white/10 px-5 py-4 md:px-6">
                <p className="text-sm leading-7 text-slate-400">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
