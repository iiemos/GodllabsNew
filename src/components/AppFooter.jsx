import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const sectionLinks = [
  { key: "overview", hash: "#overview" },
  { key: "tokenomics", hash: "#tokenomics" },
  { key: "security", hash: "#security" },
  { key: "faq", hash: "#faq" },
];

const infoLinks = [
  { key: "fund", href: "/fund" },
  { key: "defi", href: "/defi" },
  { key: "governance", href: "/governance" },
  { key: "docs", href: "/docs" },
  { key: "portfolio", href: "/portfolio" },
  { key: "swap", href: "/swap" },
  { key: "contact", href: "/contact-us" },
  { key: "start", href: "/fund" },
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
            <div className="inline-flex h-12 w-12 items-center justify-center p-1.5">
              <img src="/static/logo.png" alt="GODL logo" className="h-full w-full object-contain" />
            </div>
            <p className="text-lg font-semibold text-white">GODL LABS</p>
            <p className="text-xs tracking-[0.18em] text-slate-500">GODL.IO</p>
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
                  <Link to={`${homePrefix}${item.hash}`} className="transition hover:text-white">
                    {t(`footer.sectionLinks.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-lg font-medium text-white">{t("footer.informationTitle")}</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {infoLinks.map((item) => (
                <li key={item.key}>
                  <Link to={item.href ?? `${homePrefix}${item.hash}`} className="transition hover:text-white">
                    {t(`footer.infoLinks.${item.key}`)}
                  </Link>
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
                className="h-14 min-h-[56px] flex-1 rounded-full border border-white/5 bg-white/5 px-5 text-base text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-[#fcd535] sm:h-11 sm:min-h-[44px] sm:text-sm"
              />
              <button
                type="button"
                className="morgan-btn-primary h-14 min-h-[56px] px-6 text-base font-semibold sm:h-11 sm:min-h-[44px] sm:text-sm"
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
          <div className="inline-flex items-center gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 p-1">
              <img src="/static/logo.png" alt="GODL logo" className="h-full w-full object-contain" />
            </span>
            <span className="text-sm font-semibold tracking-[0.14em] text-slate-200">{t("footer.domain")}</span>
            <p className="inline-flex items-center gap-2">
              {t("footer.poweredBy")}
              <span className="inline-flex items-center gap-1 text-slate-300">
                <Icon icon="mdi:star-four-points-circle" width="14" />
                GODL
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
