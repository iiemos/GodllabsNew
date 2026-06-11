import { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const glowCardStyle = {
  borderStyle: "solid",
  borderTopWidth: "0.774860143661499px",
  borderRightWidth: "0.774860143661499px",
  borderBottomWidth: "0.774860143661499px",
  borderLeftWidth: "0.774860143661499px",
  borderColor: "rgba(255, 255, 255, 0.16)",
  backgroundColor: "rgba(255, 255, 255, 0.03)",
  borderRadius: "10.85px",
  boxShadow: "rgba(0, 0, 0, 0.25) 0px 8.91089px 14.2962px 0px, rgba(255, 255, 255, 0.09) 7px 4px 26px 0px inset",
};

function SectionHeading({ title, subtitle, id }) {
  return (
    <div id={id} className="mx-auto max-w-2xl text-center">
      <h2 className="text-3xl font-semibold leading-tight text-white md:text-5xl">{title}</h2>
      <p className="mt-4 text-sm leading-6 text-slate-400 md:text-base">{subtitle}</p>
    </div>
  );
}

function CardBaseBackground() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/static/card_dian.svg')] bg-center bg-no-repeat opacity-35"
        style={{ backgroundSize: "min(320px, 62%) auto" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[url('/static/card_bai.png')] bg-cover bg-center opacity-55" />
    </>
  );
}

function HeroDashboardPreview({ t }) {
  const balances = [
    { label: "USDT", value: "Live at TGE", icon: "mdi:currency-usd-circle-outline" },
    { label: "GODL", value: "160,000", iconSrc: "/static/gold.svg" },
    { label: t("portfolio.balances.fundShares"), value: "58,900.00", icon: "solar:pie-chart-2-bold" },
    { label: t("fund.page.estimates.yieldTotal"), value: "31% APY", icon: "mdi:chart-line" },
  ];
  const records = [
    { type: "fundSubscribe", token: "GODL", amount: "-12.50" },
    { type: "rewardClaim", token: "USDT", amount: "+486.20" },
    { type: "swap", token: "USDT", amount: "+8,240.00" },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#07090d] p-4 text-left text-slate-100 md:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,rgba(252,213,53,0.18),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_34%)]" />

      <div className="relative flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <img src="/static/logo.png" alt="GODL logo" className="h-9 w-9 object-contain" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f0cd54]">GODL LABS</p>
            <p className="text-lg font-semibold text-white">{t("portfolio.title")}</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
          {t("home.heroPreview.chainLive")}
        </div>
      </div>

      <div className="relative mt-4 grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
        <div>
          <div className="grid grid-cols-2 gap-3">
            {balances.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-[#fcd535]">
                    {item.iconSrc ? (
                      <img src={item.iconSrc} alt="" className="h-6 w-6 object-contain" />
                    ) : (
                      <Icon icon={item.icon} width="22" />
                    )}
                  </span>
                </div>
                <p className="mt-3 text-xl font-semibold text-white md:text-2xl">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{t("portfolio.recordsTitle")}</p>
              <p className="text-xs text-slate-500">{t("portfolio.recentCount", { count: records.length })}</p>
            </div>
            <div className="mt-3 space-y-2">
              {records.map((record) => (
                <div key={`${record.type}-${record.token}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2 text-xs">
                  <span className="text-slate-300">{t(`portfolio.recordTypes.${record.type}`)}</span>
                  <span className="text-slate-400">{record.token}</span>
                  <span className={record.amount.startsWith("+") ? "font-semibold text-emerald-300" : "font-semibold text-[#f0cd54]"}>
                    {record.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-[#fcd535]/20 bg-[#fcd535]/10 p-4">
            <div className="flex items-center gap-2 text-[#f0cd54]">
              <Icon icon="mdi:shield-check-outline" width="18" />
              <p className="text-sm font-semibold">{t("home.assetProof.badge")}</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">TZ-MIN-2026-***</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">{t("home.assetProof.scanNote")}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{t("home.heroPreview.reserveMapping")}</p>
            <div className="mt-4 space-y-3">
              {["GODL", "USGD", "GDL"].map((symbol, index) => (
                <div key={symbol}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{symbol}</span>
                    <span className="text-[#f0cd54]">{[78, 64, 42][index]}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full bg-[#fcd535]" style={{ width: `${[78, 64, 42][index]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const heroCanvasRef = useRef(null);
  const heroPreviewRef = useRef(null);

  // const confirmedPartners = t("home.confirmedPartners", { returnObjects: true });
  const protocolMetrics = t("home.protocolMetrics", { returnObjects: true });
  const institutionalPillars = t("home.institutionalPillars", { returnObjects: true });
  const tokenRows = t("home.tokenRows", { returnObjects: true });
  const helpCards = t("home.helpCards", { returnObjects: true });
  const assetProofItems = t("home.assetProof.items", { returnObjects: true });
  const comparisonRows = t("home.comparisonRows", { returnObjects: true });
  const projectCards = t("home.projectCards", { returnObjects: true });
  const yieldSourceCards = t("home.yieldSources.cards", { returnObjects: true });
  const teamMembers = t("home.team.members", { returnObjects: true });
  const planCards = t("home.plans.planCards", { returnObjects: true });
  const stakingSteps = t("home.plans.howItWorks.steps", { returnObjects: true });

  useEffect(() => {
    const canvas = heroCanvasRef.current;
    const container = canvas?.parentElement;
    if (!(canvas instanceof HTMLCanvasElement) || !(container instanceof HTMLElement)) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return undefined;
    }

    let width = 0;
    let height = 0;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let followTargetX = 0;
    let followTargetY = 0;
    let followX = 0;
    let followY = 0;

    const particles = [];
    const particleCount = 140;

    const createParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.12,
      radius: 0.4 + Math.random() * 1.3,
      alpha: 0.18 + Math.random() * 0.55,
      twinkle: Math.random() * Math.PI * 2,
      depth: 0.45 + Math.random() * 0.8,
    });

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      pointerX = width * 0.5;
      pointerY = height * 0.5;

      if (particles.length === 0) {
        for (let i = 0; i < particleCount; i += 1) {
          particles.push(createParticle());
        }
      }
    };

    const onPointerMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const dx = x - pointerX;
      const dy = y - pointerY;
      pointerX = x;
      pointerY = y;

      followTargetX = Math.max(-2.6, Math.min(2.6, dx * 0.13));
      followTargetY = Math.max(-2, Math.min(2, dy * 0.1));
    };

    const onPointerLeave = () => {
      followTargetX = 0;
      followTargetY = 0;
    };

    const draw = (time) => {
      if (document.hidden) {
        frame = 0;
        return;
      }

      context.clearRect(0, 0, width, height);
      followX += (followTargetX - followX) * 0.08;
      followY += (followTargetY - followY) * 0.08;
      followTargetX *= 0.94;
      followTargetY *= 0.94;

      for (const point of particles) {
        point.x += point.vx + followX * point.depth;
        point.y += point.vy + followY * point.depth;

        if (point.x < -4) point.x = width + 4;
        if (point.x > width + 4) point.x = -4;
        if (point.y < -4) point.y = height + 4;
        if (point.y > height + 4) point.y = -4;

        const shimmer = 0.12 * Math.sin(time * 0.0014 + point.twinkle);
        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(255,255,255,${Math.max(0.06, point.alpha + shimmer)})`;
        context.fill();
      }

      frame = window.requestAnimationFrame(draw);
    };

    const startAnimation = () => {
      if (frame !== 0 || document.hidden) return;
      frame = window.requestAnimationFrame(draw);
    };

    const stopAnimation = () => {
      if (frame === 0) return;
      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    resize();
    startAnimation();

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    window.addEventListener("resize", resize);
    container.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerleave", onPointerLeave);
    const onVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation();
      } else {
        startAnimation();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopAnimation();
    };
  }, []);

  useEffect(() => {
    const preview = heroPreviewRef.current;
    if (!(preview instanceof HTMLElement)) {
      return undefined;
    }

    const onScroll = () => {
      const progress = Math.min(Math.max(window.scrollY / 420, 0), 1);
      const rotateX = 40 - 40 * progress;
      const opacity = 0.5 + 0.5 * progress;
      const scaleY = 0.7 + 0.3 * progress;

      preview.style.opacity = opacity.toFixed(3);
      preview.style.transform = `translateX(-50%) perspective(1192px) rotateX(${rotateX.toFixed(1)}deg) scaleY(${scaleY.toFixed(3)})`;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <section className="relative overflow-hidden px-4 pb-32 pt-8 md:pb-40 md:pt-14">
        <canvas ref={heroCanvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

        <div
          className="pointer-events-none absolute left-1/2 top-[4px] h-[620px] w-[min(92vw,860px)] -translate-x-1/2 bg-[url('/static/bgc.svg')] bg-contain bg-no-repeat opacity-90"
          style={{ filter: "blur(19px)" }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[4px] w-[316px] -translate-x-1/2 bg-[#fcd535]"
          style={{
            mask: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 49.50556024774775%, rgba(0, 0, 0, 0) 100%) add",
            WebkitMask:
              "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 49.50556024774775%, rgba(0, 0, 0, 0) 100%) add",
          }}
        />
        <div className="pointer-events-none absolute left-1/2 top-10 h-[420px] w-[min(122vw,1080px)] -translate-x-1/2 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:112px_112px]" />

        <div className="relative mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-sm font-medium text-[#f0cd54]">
            <Icon icon="mdi:star-four-points" width="13" />
            {t("home.hero.badge")}
          </div>

          <div className="relative mx-auto mt-7 max-w-4xl px-8 py-6 md:px-12 md:py-8">
            <div className="pointer-events-none absolute left-0 top-0 h-12 w-12 -translate-x-1/2 -translate-y-1/2">
              <span className="absolute left-1/2 top-1/2 h-px w-10 bg-white/35" />
              <span className="absolute left-1/2 top-1/2 h-10 w-px bg-white/35" />
              <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 bg-[#fcd535] shadow-[0_0_14px_rgba(252,213,53,0.32)]" />
            </div>
            <div className="pointer-events-none absolute right-0 top-0 h-12 w-12 translate-x-1/2 -translate-y-1/2">
              <span className="absolute right-1/2 top-1/2 h-px w-10 bg-white/35" />
              <span className="absolute left-1/2 top-1/2 h-10 w-px bg-white/35" />
              <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 bg-[#fcd535] shadow-[0_0_14px_rgba(252,213,53,0.32)]" />
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 h-12 w-12 -translate-x-1/2 translate-y-1/2">
              <span className="absolute left-1/2 top-1/2 h-px w-10 bg-white/35" />
              <span className="absolute bottom-1/2 left-1/2 h-10 w-px bg-white/35" />
              <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 bg-[#fcd535] shadow-[0_0_14px_rgba(252,213,53,0.32)]" />
            </div>
            <div className="pointer-events-none absolute bottom-0 right-0 h-12 w-12 translate-x-1/2 translate-y-1/2">
              <span className="absolute right-1/2 top-1/2 h-px w-10 bg-white/35" />
              <span className="absolute bottom-1/2 left-1/2 h-10 w-px bg-white/35" />
              <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 bg-[#fcd535] shadow-[0_0_14px_rgba(252,213,53,0.32)]" />
            </div>

            <h1 className="mx-auto max-w-4xl text-6xl font-semibold leading-none text-[#fcd535] md:text-8xl">GODL LABS</h1>

            <p className="mx-auto mt-12 max-w-xl text-sm leading-snug text-slate-300 sm:text-base md:text-[20px]">
              {t("home.hero.description")}
            </p>
          </div>

          <Link
            to="/stake"
            className="mt-9 inline-flex rounded-full border border-[#fcd535] bg-black/45 px-8 py-3 text-sm font-semibold text-white transition hover:bg-black/60"
            style={{ boxShadow: "rgba(0, 0, 0, 0.3) 0px 0px 2px 3px inset, rgba(252, 213, 53, 0.16) 0px 0px 4px 8px inset" }}
          >
            {t("home.hero.launch")}
          </Link>

          <div className="relative mx-auto mt-7 h-[320px] w-full max-w-[900px] md:h-[390px]">
            <div
              ref={heroPreviewRef}
              className="absolute left-1/2 top-0 z-0 h-full w-[min(820px,88vw)] overflow-hidden rounded-[22px] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
              style={{
                opacity: 0.5,
                transform: "translateX(-50%) perspective(1192px) rotateX(40deg) scaleY(0.7)",
                transformOrigin: "center top",
              }}
            >
              <HeroDashboardPreview t={t} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent backdrop-blur-[2px] md:h-24" />
            </div>
          </div>

          {/* <div className="relative z-10 mx-auto mt-10 max-w-5xl">
            <p className="text-sm text-slate-300">{t("home.hero.trustNetwork")}</p>
            <div className="marquee-mask mt-7 overflow-hidden py-2">
              <ul className="marquee-track flex w-max items-center gap-8 md:gap-12">
                {[...confirmedPartners, ...confirmedPartners].map((partner, index) => (
                  <li key={`${partner.name}-${index}`} className="flex h-[72px] min-w-[190px] flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 backdrop-blur-sm">
                    <span className="text-sm font-semibold text-slate-100">{partner.name}</span>
                    <span className="mt-1 text-xs text-slate-500">{partner.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div> */}
        </div>
      </section>

      <section id="pricing" className="px-4 pb-32 md:pb-40">
        <SectionHeading
          title={
            <>
              {t("home.sectionHeadings.plansBase")} <span className="text-[#fcd535]">{t("home.sectionHeadings.plansHighlight")}</span>
            </>
          }
          subtitle={t("home.sectionHeadings.plansSubtitle")}
        />

        <div className="glass-card mx-auto mt-10 max-w-6xl rounded-[24px] p-5 md:p-6">
          <p className="text-sm font-semibold text-[#f0cd54]">{t("home.plans.howItWorks.title")}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {stakingSteps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fcd535] text-sm font-semibold text-[#111111]">
                  {index + 1}
                </span>
                <p className="mt-3 text-sm font-semibold text-white">{step.title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">{t("home.plans.howItWorks.note")}</p>
        </div>

        <div className="mx-auto mt-8 grid max-w-6xl gap-5 lg:grid-cols-3">
          {planCards.map((plan) => (
            <article
              key={plan.cycle}
              className={`glass-card relative min-h-[520px] overflow-hidden rounded-[28px] p-6 md:p-7 ${
                plan.highlight ? "border border-[#fcd535]/45" : ""
              }`}
            >
              <div
                className={`pointer-events-none absolute inset-0 ${
                  plan.highlight
                    ? "bg-[radial-gradient(circle_at_76%_88%,rgba(252,213,53,0.24),rgba(252,213,53,0)_50%)]"
                    : "bg-[radial-gradient(circle_at_24%_86%,rgba(252,213,53,0.18),rgba(252,213,53,0)_50%)]"
                }`}
              />
              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-[17px] font-medium ${plan.highlight ? "text-slate-100" : "text-slate-300"}`}>{plan.cycle}</p>
                  {plan.badge ? (
                    <span className="inline-flex rounded-full border border-[#fcd535]/40 bg-[#fcd535]/12 px-2.5 py-1 text-[11px] font-semibold text-[#f8de7a]">
                      {plan.badge}
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 text-[52px] font-semibold leading-none text-[#fcd535]">
                  {plan.apy}
                  <span className="ml-1 text-[30px] text-slate-200">APY</span>
                </p>
                <p className="mt-3 text-[15px] text-slate-400">{plan.description}</p>

                <Link
                  to="/stake"
                  className={`mt-8 inline-flex h-12 w-full items-center justify-center text-sm font-semibold ${
                    plan.highlight ? "morgan-btn-primary" : "morgan-btn-secondary"
                  }`}
                >
                  {t("home.blocks.planButton")}
                </Link>

                <ul className={`mt-11 space-y-3.5 text-[15px] leading-6 ${plan.highlight ? "text-slate-200" : "text-slate-300"}`}>
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className={`mt-[2px] h-1.5 w-1.5 rounded-full ${plan.highlight ? "bg-slate-200/90" : "bg-slate-300/80"}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-32 md:pb-40" id="overview">
        <SectionHeading
          title={
            <>
              {t("home.sectionHeadings.overviewBase")} <span className="text-[#fcd535]">{t("home.sectionHeadings.overviewHighlight")}</span>
            </>
          }
          subtitle={t("home.sectionHeadings.overviewSubtitle")}
        />

        <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-4">
          {protocolMetrics.map((metric) => (
            <article
              key={metric.label}
              className="glass-card rounded-2xl p-5"
            >
              <p className="text-xs text-slate-500">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-[#fcd535]">{metric.value}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{metric.note}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-3">
          {institutionalPillars.map((pillar) => (
            <article
              key={pillar.title}
              className="glass-card rounded-2xl p-6"
            >
              <p className="text-xl font-semibold text-white">{pillar.title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-32 md:pb-40" id="tokenomics">
        <SectionHeading
          title={
            <>
              {t("home.sectionHeadings.tokenomicsBase")} <span className="text-[#fcd535]">{t("home.sectionHeadings.tokenomicsHighlight")}</span>
            </>
          }
          subtitle={t("home.sectionHeadings.tokenomicsSubtitle")}
        />

        <div className="mx-auto mt-12 max-w-6xl space-y-3">
          {tokenRows.map((token) => (
            <article
              key={token.symbol}
              className="glass-card flex flex-col gap-4 rounded-2xl p-5 text-left md:block"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#fcd535]">
                  <Icon icon={token.icon} width="24" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{token.symbol}</p>
                  <p className="text-xs text-slate-500">{t("home.blocks.tokenProfile")}</p>
                </div>
              </div>
              <div className="space-y-1 text-left md:mt-4">
                <p className="text-sm text-slate-200">{token.summary}</p>
                <p className="text-xs leading-5 text-slate-400">{token.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-32 md:pb-40" id="team">
        <SectionHeading
          title={
            <>
              {t("home.sectionHeadings.teamBase")} <span className="text-[#fcd535]">{t("home.sectionHeadings.teamHighlight")}</span>
            </>
          }
          subtitle={t("home.sectionHeadings.teamSubtitle")}
        />

        <div className="mx-auto mt-12 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {teamMembers.map((member, index) => (
            <article
              key={member.name}
              className={`glass-card overflow-hidden rounded-[20px] text-left lg:col-span-2 ${index === 3 ? "lg:col-start-2" : ""}`}
            >
              <div className="aspect-square overflow-hidden bg-black/25">
                <img src={member.image} alt={member.name} className="h-full w-full object-contain object-center" />
              </div>
              <div className="p-5">
                <p className="text-xl font-semibold text-white">{member.name}</p>
                <p className="mt-1 text-sm font-semibold text-[#f0cd54]">{member.role}</p>
                <p className="mt-4 text-sm leading-6 text-slate-400">{member.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-32 md:pb-40">
        <SectionHeading
          title={
            <>
              {t("home.sectionHeadings.matrixBase")} <span className="text-[#fcd535]">{t("home.sectionHeadings.matrixHighlight")}</span>
            </>
          }
          subtitle={t("home.sectionHeadings.matrixSubtitle")}
        />

        <div className="mx-auto mt-12 grid max-w-6xl gap-4 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="grid gap-4">
            <article className="relative min-h-[360px] overflow-hidden p-6 md:p-7" style={glowCardStyle}>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(252,213,53,0.14),rgba(252,213,53,0)_42%),radial-gradient(circle_at_90%_80%,rgba(255,255,255,0.08),rgba(255,255,255,0)_55%)]" />
              <CardBaseBackground />
              <div className="relative z-10 flex h-full flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-[540px]">
                  <h4 className="text-2xl font-semibold text-white">{t("home.blocks.matrixTopLeftTitle")}</h4>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{t("home.blocks.matrixTopLeftDescription")}</p>
                </div>

                <div className="relative flex w-full flex-1 items-center justify-center md:w-auto md:justify-end">
                  <div className="pointer-events-none absolute h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(252,213,53,0.14),rgba(252,213,53,0)_68%)] blur-xl md:h-[300px] md:w-[300px]" />
                  <div className="globe">
                    <div className="globe-track">
                      <img src="/static/earth.svg" alt="" className="globe-map" />
                      <img src="/static/earth.svg" alt="" className="globe-map" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="relative min-h-[200px] overflow-hidden p-6 md:p-7" style={glowCardStyle}>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(255,255,255,0.1),rgba(255,255,255,0)_42%),radial-gradient(circle_at_68%_70%,rgba(252,213,53,0.1),rgba(252,213,53,0)_52%)]" />
              <CardBaseBackground />
              <div className="relative z-10 flex h-full items-center gap-5">
                <span className="inline-flex h-[86px] w-[86px] shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-black/30 text-[#fcd535] shadow-[0_0_18px_rgba(252,213,53,0.12)]">
                  <Icon icon="mdi:calendar-month" width="44" />
                </span>
                <div>
                  <h4 className="text-2xl font-semibold text-white">{t("home.blocks.matrixBottomLeftTitle")}</h4>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{t("home.blocks.matrixBottomLeftDescription")}</p>
                </div>
              </div>
            </article>
          </div>

          <div className="grid gap-4 lg:grid-rows-2">
            <article className="relative min-h-[220px] overflow-hidden p-6 md:p-7" style={glowCardStyle}>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.08),rgba(255,255,255,0)_45%),radial-gradient(circle_at_20%_82%,rgba(252,213,53,0.1),rgba(252,213,53,0)_52%)]" />
              <CardBaseBackground />
                <div className="relative z-10 flex h-full items-center gap-5">
                <div className="flex shrink-0 items-end gap-2">
                  <div className="h-12 w-4 rounded-full bg-[rgba(217,217,217,0.08)] shadow-[0_11px_27px_rgba(0,0,0,0.52)]" />
                  <div className="h-20 w-4 rounded-full bg-gradient-to-b from-[#f0cd54] to-[#a57a10] shadow-[0_0_16px_rgba(252,213,53,0.24)]" />
                  <div className="h-16 w-4 rounded-full bg-[rgba(217,217,217,0.08)] shadow-[0_11px_27px_rgba(0,0,0,0.52)]" />
                </div>
                <div>
                  <h4 className="text-2xl font-semibold text-white">{t("home.blocks.matrixTopRightTitle")}</h4>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{t("home.blocks.matrixTopRightDescription")}</p>
                </div>
              </div>
            </article>

            <article className="relative min-h-[220px] overflow-hidden p-6 md:p-7" style={glowCardStyle}>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_88%,rgba(252,213,53,0.11),rgba(252,213,53,0)_52%),radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.07),rgba(255,255,255,0)_45%)]" />
              <CardBaseBackground />
              <div className="relative z-10 flex h-full flex-col">
                <h4 className="text-2xl font-semibold text-white">{t("home.blocks.matrixBottomRightTitle")}</h4>
                <p className="mt-3 text-sm leading-6 text-slate-400">{t("home.blocks.matrixBottomRightDescription")}</p>
                <div className="mt-6 flex flex-1 items-end justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white">A</span>
                      <span className="h-[2px] w-16 bg-gradient-to-r from-[#fcd535]/70 to-transparent" />
                    </div>
                    <div className="ml-6 flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white">B</span>
                      <span className="h-[2px] w-16 bg-gradient-to-r from-[#fcd535]/70 to-transparent" />
                    </div>
                  </div>
                  <div className="relative flex h-[118px] w-[118px] items-center justify-center rounded-[26px] border border-white/10 bg-white/5">
                    <div className="absolute inset-0 rounded-[26px] bg-[radial-gradient(circle_at_50%_40%,rgba(252,213,53,0.22),rgba(252,213,53,0)_60%)]" />
                    <Icon icon="mdi:lightning-bolt" className="relative text-[72px] text-[#fcd535]" />
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="px-4 pb-32 md:pb-40">
        <SectionHeading
          title={
            <>
              {t("home.sectionHeadings.yieldBase")} <span className="text-[#fcd535]">{t("home.sectionHeadings.yieldHighlight")}</span>
            </>
          }
          subtitle={t("home.sectionHeadings.yieldSubtitle")}
        />

        <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-2">
          {yieldSourceCards.map((card) => (
            <article key={card.title} className="glass-card relative overflow-hidden rounded-[24px] p-6 text-left md:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_18%,rgba(252,213,53,0.18),rgba(252,213,53,0)_44%)]" />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#fcd535]">
                    <Icon icon={card.icon} width="25" />
                  </div>
                  <span className="rounded-full border border-[#fcd535]/30 bg-[#fcd535]/10 px-3 py-1 text-xs font-semibold text-[#f0cd54]">
                    {card.label}
                  </span>
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-white">{card.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">{card.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="why-aligno" className="px-4 pb-32 md:pb-40">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-semibold text-white md:text-5xl">
            {t("home.sectionHeadings.whyBase")} <span className="text-[#fcd535]">{t("home.sectionHeadings.whyHighlight")}</span>？
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 md:text-base">
            {t("home.sectionHeadings.whySubtitle")}
          </p>
        </div>

        <div className="glass-card relative mx-auto mt-10 max-w-6xl overflow-hidden rounded-[20px]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_92%,rgba(252,213,53,0.2),rgba(252,213,53,0)_32%),radial-gradient(circle_at_80%_92%,rgba(252,213,53,0.16),rgba(252,213,53,0)_30%)]" />
          <div className="grid grid-cols-2 items-center border-b border-white/10">
            <div className="flex items-center gap-3 px-6 py-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Icon icon="mdi:play-box" width="16" className="text-white" />
              </span>
              <p className="text-[28px] font-medium text-[#fcd535] md:text-[34px]">GODL</p>
            </div>
            <p className="px-6 py-4 text-right text-[28px] font-medium text-slate-100 md:text-[34px]">{t("home.blocks.whyTraditional")}</p>
          </div>
          {comparisonRows.map((row) => (
            <div key={`${row.aligno}-${row.other}`} className="grid grid-cols-2 border-b border-white/10 last:border-0">
              <p className="flex items-center gap-2 px-6 py-4 text-sm text-slate-200">
                <Icon icon="mdi:check" width="14" className="text-slate-100" />
                {row.aligno}
              </p>
              <p className="flex items-center gap-2 px-6 py-4 text-sm text-slate-400">
                <Icon icon="mdi:close" width="14" className="text-slate-500" />
                {row.other}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="security" className="px-4 pb-32 md:pb-40">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-semibold text-white md:text-5xl">
            {t("home.sectionHeadings.securityBase")} <span className="text-[#fcd535]">{t("home.sectionHeadings.securityHighlight")}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 md:text-base">
            {t("home.sectionHeadings.securitySubtitle")}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-2">
          {helpCards.map((card, index) => (
            <article
              key={card.title}
              className="glass-card relative overflow-hidden rounded-[20px] p-8 text-center"
            >
              {index === 0 && (
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(252,213,53,0.24),rgba(252,213,53,0)_45%)]" />
              )}
              <div className="relative mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#fcd535]">
                <Icon icon={card.icon} width="22" />
              </div>
              <h4 className="relative mt-6 text-[31px] font-medium leading-tight text-white">
                <span className="mr-2 text-[#fcd535]">{card.leading}</span>
                {card.title}
              </h4>
              <p className="relative mx-auto mt-4 max-w-[360px] text-sm leading-6 text-slate-400">{card.description}</p>
            </article>
          ))}
        </div>

        <div className="glass-card mx-auto mt-5 max-w-6xl overflow-hidden rounded-[24px]">
          <div className="p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f0cd54]">{t("home.assetProof.badge")}</p>
            <h3 className="mt-3 text-3xl font-semibold text-white">{t("home.assetProof.title")}</h3>
            <p className="mt-4 text-sm leading-6 text-slate-400">{t("home.assetProof.description")}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {assetProofItems.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-100">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-32 md:pb-40">
        <SectionHeading
          title={
            <>
              {t("home.sectionHeadings.partnerBase")} <span className="text-[#fcd535]">{t("home.sectionHeadings.partnerHighlight")}</span>
            </>
          }
          subtitle={t("home.sectionHeadings.partnerSubtitle")}
        />

        <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4">
          {projectCards.map((card) => (
            <article key={card.title} className="glass-card rounded-3xl p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-[#fcd535]">
                <Icon icon={card.icon} width="20" />
              </div>
              <h4 className="mt-5 text-xl font-semibold text-white">{card.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-400">{card.desc}</p>
            </article>
          ))}
        </div>
      </section>

    </>
  );
}
