import { Icon } from "@iconify/react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const sectionLinks = [
  { key: "overview", hash: "#overview" },
  { key: "tokenomics", hash: "#tokenomics" },
  { key: "security", hash: "#security" },
  { key: "faq", hash: "#faq" },
];

const infoLinks = [
  { key: "farms", href: "/farms" },
  { key: "portfolio", href: "/portfolio" },
  { key: "swap", href: "/swap" },
  { key: "contact", href: "/contact-us" },
  { key: "start", href: "/farms" },
];

const socials = [
  { icon: "mdi:instagram", href: "https://instagram.com" },
  { icon: "mdi:facebook", href: "https://facebook.com" },
  { icon: "mdi:youtube", href: "https://youtube.com" },
];

export default function AppFooter() {
  const { t } = useTranslation();
  const location = useLocation();
  const homePrefix = location.pathname === "/" ? "" : "/";

  return (
    <footer className="border-t border-white/10 bg-black/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="grid gap-9 md:grid-cols-[1.1fr_1fr_1fr_1.8fr]">
          <div className="space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Icon icon="mdi:layers-triple" width="22" className="text-white" />
            </div>
            <p className="text-lg font-semibold text-white">GODL LABS</p>
            <div className="space-y-2">
              <p className="text-sm text-slate-400">{t("footer.followUs")}</p>
              <div className="flex items-center gap-3 text-slate-400">
                {socials.map((item) => (
                  <a key={item.icon} href={item.href} target="_blank" rel="noreferrer" className="transition hover:text-white">
                    <Icon icon={item.icon} width="16" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-lg font-medium text-white">{t("footer.sectionsTitle")}</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {sectionLinks.map((item) => (
                <li key={item.key}>
                  <a href={`${homePrefix}${item.hash}`} className="transition hover:text-white">
                    {t(`footer.sectionLinks.${item.key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-lg font-medium text-white">{t("footer.informationTitle")}</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {infoLinks.map((item) => (
                <li key={item.key}>
                  <a href={item.href ?? `${homePrefix}${item.hash}`} className="transition hover:text-white">
                    {t(`footer.infoLinks.${item.key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-lg font-medium text-white">{t("footer.contactTitle")}</p>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">{t("footer.contactDescription")}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                className="h-11 flex-1 rounded-full border border-white/5 bg-white/5 px-5 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-[#df8f68]"
              />
              <button
                type="button"
                className="morgan-btn-primary h-11 px-6 text-sm font-semibold"
              >
                {t("footer.submit")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.copyright")}</p>
          <p className="inline-flex items-center gap-2">
            {t("footer.poweredBy")}
            <span className="inline-flex items-center gap-1 text-slate-300">
              <Icon icon="mdi:star-four-points-circle" width="14" />
              GODL
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
