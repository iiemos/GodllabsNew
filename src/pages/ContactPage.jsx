import { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

export default function ContactPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300">
          <Icon icon="mdi:email-outline" width="14" />
          {t("contact.badge")}
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">{t("contact.title")}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{t("contact.description")}</p>
      </div>

      <form
        className="glass-card mt-8 rounded-2xl p-5 md:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-slate-300">{t("contact.fields.name")}</span>
            <input
              type="text"
              placeholder={t("contact.placeholders.name")}
              className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-[#fcd535]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">{t("contact.fields.email")}</span>
            <input
              type="email"
              required
              placeholder={t("contact.placeholders.email")}
              className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-[#fcd535]"
            />
          </label>
        </div>

        <label className="mt-4 block space-y-2">
          <span className="text-sm text-slate-300">{t("contact.fields.message")}</span>
          <textarea
            rows={5}
            placeholder={t("contact.placeholders.message")}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-[#fcd535]"
          />
        </label>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">{t("contact.note")}</p>
          <button
            type="submit"
            className="morgan-btn-primary inline-flex h-10 items-center justify-center px-6 text-sm font-semibold"
          >
            {t("contact.submit")}
          </button>
        </div>

        {submitted && <p className="mt-4 text-sm text-emerald-300">{t("contact.submitted")}</p>}
      </form>
    </section>
  );
}
