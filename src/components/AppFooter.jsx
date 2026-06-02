import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const sectionLinks = [
  { key: "overview", hash: "#overview" },
  { key: "tokenomics", hash: "#tokenomics" },
  { key: "security", hash: "#security" },
  { key: "faq", href: "/faq" },
];

const infoLinks = [
  { key: "fund", href: "/stake" },
  { key: "governance", href: "/governance" },
  { key: "docs", href: "/docs" },
  { key: "portfolio", href: "/portfolio" },
  { key: "contact", href: "/contact-us" },
];

const socials = [
  { name: "X", icon: "mdi:twitter", href: "https://x.com/GODLLABS" },
  { name: "YouTube", icon: "mdi:youtube", href: "https://www.youtube.com/@GODLLBAS" },
  { name: "LinkedIn", icon: "mdi:linkedin", href: "https://www.linkedin.com/company/godl-labs/?viewAsMember=true" },
  { name: "Telegram", icon: "mdi:telegram", href: "https://t.me/GODL_LABS" },
];

export default function AppFooter() {
  const { t } = useTranslation();
  const location = useLocation();
  const homePrefix = location.pathname === "/" ? "" : "/";

  return (
    <footer className="border-t border-white/10 bg-black/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="grid gap-9 md:grid-cols-[1.1fr_0.9fr_1fr_1.2fr]">
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
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.name}
                    title={item.name}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-[#fcd535]/50 hover:text-white"
                  >
                    <Icon icon={item.icon} width="17" />
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
                  <Link to={item.href ?? `${homePrefix}${item.hash}`} className="transition hover:text-white">
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
            <p className="text-lg font-medium text-white">{t("footer.investorTitle")}</p>
            <p className="mt-4 text-sm leading-6 text-slate-400">{t("footer.investorDescription")}</p>
            <a href="mailto:partnerships@godl.io" className="mt-4 inline-flex text-sm font-semibold text-[#f0cd54] transition hover:text-white">
              partnerships@godl.io
            </a>
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
