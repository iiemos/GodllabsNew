import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { labCopy } from "./labCopy";

const GOLD_MIN = 2500;
const GOLD_MAX = 7000;
const GOLD_ENTRY = 4500;
const GODL_SUPPLY = 160000;
const ANNUAL_OZ = 46000;

const tabConfig = [
  { key: "ecosystem", icon: "mdi:orbit" },
  { key: "godl", icon: "mdi:gold" },
  { key: "usgd", icon: "mdi:currency-usd" },
  { key: "gdl", icon: "mdi:home-analytics", soon: true },
  { key: "faq", icon: "mdi:frequently-asked-questions" },
];

const tierOptions = [
  { months: 3, rate: 0.15 },
  { months: 6, rate: 0.21 },
  { months: 12, rate: 0.31 },
];

const yearOptions = [1, 2, 3, 4, 5];

function formatCurrency(value, options = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
  }).format(value);
}

function formatMillion(value) {
  return `${formatCurrency(value / 1_000_000)}M`;
}

function formatSigned(value) {
  const abs = formatCurrency(Math.abs(value));
  return value >= 0 ? `+${abs}` : `-${abs}`;
}

function goldSliderBackground(goldPrice) {
  const percent = ((goldPrice - GOLD_MIN) / (GOLD_MAX - GOLD_MIN)) * 100;
  return `linear-gradient(to right, #fcd535 0%, #fcd535 ${percent}%, rgba(255,255,255,0.12) ${percent}%, rgba(255,255,255,0.12) 100%)`;
}

function KpiCard({ label, value, note, tone = "default" }) {
  const toneClass = {
    default: "border-white/10 bg-white/[0.045] text-white",
    gold: "border-[#fcd535]/30 bg-[#fcd535]/10 text-[#f0cd54]",
    green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    blue: "border-sky-400/25 bg-sky-400/10 text-sky-300",
    amber: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  }[tone];

  return (
    <article className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
    </article>
  );
}

function SectionLabel({ children }) {
  return <p className="mb-3 mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{children}</p>;
}

function PanelCard({ children, className = "" }) {
  return <article className={`rounded-[24px] border border-white/10 bg-white/[0.045] p-5 ${className}`}>{children}</article>;
}

function FlowStep({ number, title, children }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fcd535] text-xs font-bold text-black">
        {number}
      </span>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-400">{children}</p>
      </div>
    </div>
  );
}

function MetricRow({ label, value, tone = "default" }) {
  const color = tone === "green" ? "text-emerald-300" : tone === "gold" ? "text-[#f0cd54]" : "text-white";
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3 text-sm last:border-b-0">
      <span className="text-slate-400">{label}</span>
      <span className={`text-right font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function EcosystemPanel({ goldPrice, annualRevenue, copy }) {
  const { ecosystem, units } = copy;
  const kpis = ecosystem.kpis;

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <KpiCard label={kpis.reserve[0]} value={kpis.reserve[1]} note={kpis.reserve[2]} tone="gold" />
        <KpiCard label={kpis.projection[0]} value={kpis.projection[1]} note={kpis.projection[2]} />
        <KpiCard label={kpis.revenue[0]} value={formatMillion(annualRevenue)} note={units.atPerOz(formatCurrency(goldPrice))} tone="green" />
        <KpiCard label={kpis.fdv[0]} value={kpis.fdv[1]} note={kpis.fdv[2]} tone="blue" />
        <KpiCard label={kpis.raise[0]} value={kpis.raise[1]} note={kpis.raise[2]} />
        <KpiCard label={kpis.contracts[0]} value={kpis.contracts[1]} note={kpis.contracts[2]} />
      </div>

      <SectionLabel>{ecosystem.mineTitle}</SectionLabel>
      <div className="grid gap-3 md:grid-cols-2">
        <PanelCard className="border-emerald-400/20 bg-emerald-400/10">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-white">Tanzania</h3>
            <span className="rounded-md border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">
              {ecosystem.tanzaniaStatus}
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-emerald-300">
            {formatMillion(annualRevenue)} {units.annualEstimate}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{ecosystem.tanzaniaDescription}</p>
        </PanelCard>
        <PanelCard className="border-amber-400/20 bg-amber-400/10">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-white">Brazil</h3>
            <span className="rounded-md border border-amber-400/25 bg-amber-400/10 px-2 py-1 text-xs text-amber-300">
              {ecosystem.brazilStatus}
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-amber-300">{ecosystem.brazilValue}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{ecosystem.brazilDescription}</p>
        </PanelCard>
      </div>

      <SectionLabel>{ecosystem.workTitle}</SectionLabel>
      <div className="grid gap-3 md:grid-cols-2">
        {ecosystem.workCards.map(([title, description], index) => {
          const highlighted = index < 2 || index > 3;
          return (
            <PanelCard key={title} className={highlighted ? "border-[#fcd535]/20 bg-[#fcd535]/10" : ""}>
              <h3 className={`font-semibold ${highlighted ? "text-[#f0cd54]" : "text-white"}`}>{title}</h3>
              <p className={`mt-2 text-sm leading-6 ${highlighted ? "text-slate-300" : "text-slate-400"}`}>{description}</p>
            </PanelCard>
          );
        })}
      </div>

      <SectionLabel>{ecosystem.infrastructureTitle}</SectionLabel>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ecosystem.infrastructureItems.map(([role, name]) => (
          <PanelCard key={role} className="rounded-2xl p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{role}</p>
            <p className="mt-2 font-semibold text-white">{name}</p>
          </PanelCard>
        ))}
      </div>
    </>
  );
}

function GodlPanel({ goldPrice, annualRevenue, marketCap, copy }) {
  const { godl, units } = copy;
  const [selectedMonths, setSelectedMonths] = useState(tierOptions[0].months);
  const [investment, setInvestment] = useState(100000);
  const [years, setYears] = useState(1);

  const selectedTier = useMemo(
    () => tierOptions.find((tier) => tier.months === selectedMonths) ?? tierOptions[0],
    [selectedMonths],
  );

  const calc = useMemo(() => {
    const annualYield = investment * selectedTier.rate;
    const monthlyYield = annualYield / 12;
    const totalYield = annualYield * years;
    const totalReturn = investment + totalYield;
    const tokensOwned = investment / GOLD_ENTRY;
    const tokenValueAtExit = tokensOwned * goldPrice;
    const tokenDelta = tokenValueAtExit - investment;
    const tokenDeltaPct = investment > 0 ? (tokenDelta / investment) * 100 : 0;
    const grandTotal = tokenValueAtExit + totalYield;

    return { annualYield, monthlyYield, totalYield, totalReturn, tokenDelta, tokenDeltaPct, grandTotal };
  }, [goldPrice, investment, selectedTier.rate, years]);

  const priceDiff = goldPrice - GOLD_ENTRY;
  const priceDiffPct = (priceDiff / GOLD_ENTRY) * 100;

  return (
    <>
      <PanelCard className="border-[#fcd535]/25 bg-[#fcd535]/10">
        <div className="flex items-center gap-2 text-[#f0cd54]">
          <Icon icon="mdi:star-four-points-circle" width="18" />
          <h2 className="font-semibold">{godl.introTitle}</h2>
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-300">{godl.introDescription}</p>
      </PanelCard>

      <div className="mt-4 rounded-2xl border border-sky-400/25 bg-sky-400/10 p-4 text-sm leading-6 text-sky-200">
        <strong>{godl.regulatedLabel}</strong> {godl.regulatedDescription}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <KpiCard label={godl.kpis.price[0]} value={formatCurrency(goldPrice)} note={godl.kpis.price[1]} tone="gold" />
        <KpiCard label={godl.kpis.supply[0]} value={godl.kpis.supply[1]} note={godl.kpis.supply[2]} />
        <KpiCard label={godl.kpis.marketCap[0]} value={formatMillion(marketCap)} note={units.atPerOz(formatCurrency(goldPrice))} tone="green" />
        <KpiCard label={godl.kpis.maxYield[0]} value={godl.kpis.maxYield[1]} note={godl.kpis.maxYield[2]} tone="amber" />
        <KpiCard label={godl.kpis.custody[0]} value={godl.kpis.custody[1]} note={godl.kpis.custody[2]} tone="blue" />
        <KpiCard label={godl.kpis.swap[0]} value={godl.kpis.swap[1]} note={godl.kpis.swap[2]} />
      </div>

      <SectionLabel>{godl.yieldTitle}</SectionLabel>
      <div className="space-y-3">
        {godl.flowSteps.map(([title, description], index) => (
          <FlowStep key={title} number={String(index + 1)} title={title}>
            {description}
          </FlowStep>
        ))}
      </div>

      <SectionLabel>{godl.calculatorTitle}</SectionLabel>
      <div className="grid gap-3 md:grid-cols-3">
        {tierOptions.map((tier) => {
          const active = tier.months === selectedTier.months;
          return (
            <button
              key={tier.months}
              type="button"
              onClick={() => setSelectedMonths(tier.months)}
              className={`rounded-[24px] border p-5 text-center transition ${
                active ? "border-[#fcd535]/45 bg-[#fcd535]/12" : "border-white/10 bg-white/[0.045] hover:border-[#fcd535]/30"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {godl.lockLabel(tier.months)}
              </p>
              <p className={`mt-2 text-4xl font-semibold ${active ? "text-[#f0cd54]" : "text-emerald-300"}`}>
                {Math.round(tier.rate * 100)}%
              </p>
              <p className="mt-1 text-xs text-slate-500">{godl.annualized}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.25fr]">
        <PanelCard>
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500" htmlFor="lab-investment">
            {godl.investmentUsd}
          </label>
          <div className="mt-3 flex items-center rounded-2xl border border-white/10 bg-black/25 px-4">
            <span className="text-slate-500">$</span>
            <input
              id="lab-investment"
              type="number"
              min="1000"
              step="1000"
              value={investment}
              onChange={(event) => setInvestment(Math.max(0, Number(event.target.value) || 0))}
              className="no-number-spin h-12 w-full bg-transparent px-2 text-xl font-semibold text-[#f0cd54] outline-none"
            />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{godl.investmentPeriod}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {yearOptions.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setYears(year)}
                className={`rounded-xl border px-3 py-2 text-sm transition ${
                  years === year ? "border-[#fcd535]/40 bg-[#fcd535]/12 text-[#f0cd54]" : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
                }`}
              >
                {units.year(year)}
              </button>
            ))}
          </div>
        </PanelCard>

        <PanelCard>
          <MetricRow label={godl.metrics.investment} value={formatCurrency(investment)} />
          <MetricRow
            label={godl.metrics.stakingTier}
            value={godl.tierShortLabel(selectedTier.months, Math.round(selectedTier.rate * 100))}
          />
          <MetricRow label={godl.metrics.period} value={units.year(years)} />
          <MetricRow label={godl.metrics.entryPrice} value={`${formatCurrency(GOLD_ENTRY)} ${units.perOz}`} tone="gold" />
          <MetricRow label={godl.metrics.annualYield} value={formatCurrency(calc.annualYield)} tone="green" />
          <MetricRow label={godl.metrics.monthlyPayment} value={`${formatCurrency(calc.monthlyYield)} ${units.perMonth}`} tone="green" />
          <MetricRow label={godl.metrics.totalYield} value={formatCurrency(calc.totalYield)} tone="green" />
          <MetricRow label={godl.metrics.totalReturn} value={formatCurrency(calc.totalReturn)} tone="green" />
        </PanelCard>
      </div>

      <SectionLabel>{godl.priceScenarioTitle}</SectionLabel>
      <PanelCard className="border-[#fcd535]/20 bg-[#fcd535]/10">
        <p className="text-sm leading-6 text-slate-300">{godl.priceScenarioDescription(formatCurrency(GOLD_ENTRY))}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <KpiCard label={godl.scenarioCards.entry[0]} value={`${formatCurrency(GOLD_ENTRY)} ${units.perOz}`} note={godl.scenarioCards.entry[1]} tone="gold" />
          <KpiCard label={godl.scenarioCards.exit[0]} value={`${formatCurrency(goldPrice)} ${units.perOz}`} note={godl.scenarioCards.exit[1]} tone="gold" />
          <KpiCard
            label={godl.scenarioCards.delta[0]}
            value={`${formatSigned(priceDiff)} (${priceDiffPct >= 0 ? "+" : ""}${priceDiffPct.toFixed(1)}%)`}
            note={godl.scenarioCards.delta[1]}
            tone={priceDiff >= 0 ? "green" : "amber"}
          />
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <MetricRow
            label={godl.metrics.tokenValueChange}
            value={`${formatSigned(calc.tokenDelta)} (${calc.tokenDeltaPct >= 0 ? "+" : ""}${calc.tokenDeltaPct.toFixed(1)}%)`}
            tone={calc.tokenDelta >= 0 ? "green" : "gold"}
          />
          <MetricRow label={godl.metrics.totalExit} value={formatCurrency(calc.grandTotal)} tone="green" />
        </div>
      </PanelCard>

      <SectionLabel>{godl.sensitivityTitle}</SectionLabel>
      <PanelCard>
        <MetricRow label={godl.sensitivity.spot} value={`${formatCurrency(goldPrice)} ${units.perOz}`} tone="gold" />
        <MetricRow label={godl.sensitivity.godlPrice} value={formatCurrency(goldPrice)} tone="gold" />
        <MetricRow label={godl.sensitivity.marketCap} value={formatMillion(marketCap)} />
        <MetricRow label={godl.sensitivity.revenue} value={formatMillion(annualRevenue)} tone="gold" />
        <MetricRow label={godl.sensitivity.sampleYield} value={godl.sensitivity.sampleYieldValue} tone="green" />
      </PanelCard>
    </>
  );
}

function UsgdPanel({ goldPrice, copy }) {
  const { usgd, units } = copy;
  const backing = 1.5 * (goldPrice / GOLD_ENTRY);
  const buffer = backing - 1;
  const fallPct = backing > 1 ? (1 - 1 / backing) * 100 : 0;
  const backed = backing >= 1;

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <KpiCard label={usgd.kpis.peg[0]} value={usgd.kpis.peg[1]} note={usgd.kpis.peg[2]} tone="blue" />
        <KpiCard label={usgd.kpis.ratio[0]} value={usgd.kpis.ratio[1]} note={usgd.kpis.ratio[2]} tone="green" />
        <KpiCard label={usgd.kpis.standard[0]} value={usgd.kpis.standard[1]} note={usgd.kpis.standard[2]} />
        <KpiCard label={usgd.kpis.issuance[0]} value={usgd.kpis.issuance[1]} note={usgd.kpis.issuance[2]} />
        <KpiCard label={usgd.kpis.prelaunch[0]} value={usgd.kpis.prelaunch[1]} note={usgd.kpis.prelaunch[2]} tone="amber" />
        <KpiCard label={usgd.kpis.chain[0]} value={usgd.kpis.chain[1]} note={usgd.kpis.chain[2]} />
      </div>

      <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
        <strong>{usgd.prelaunchLabel}</strong> {usgd.prelaunchDescription}
      </div>

      <SectionLabel>{usgd.stableTitle}</SectionLabel>
      <div className="grid gap-3 md:grid-cols-2">
        <PanelCard>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-white">USDT / USDC</h3>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">{usgd.fiatTag}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">{usgd.fiatDescription}</p>
        </PanelCard>
        <PanelCard className="border-[#fcd535]/25 bg-[#fcd535]/10">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-[#f0cd54]">USGD</h3>
            <span className="rounded-md border border-[#fcd535]/30 bg-[#fcd535]/10 px-2 py-1 text-xs text-[#f0cd54]">GODL Labs</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-300">{usgd.usgdDescription}</p>
        </PanelCard>
      </div>

      <SectionLabel>{usgd.lifecycleTitle}</SectionLabel>
      <div className="space-y-3">
        {usgd.lifecycle.map(([title, description], index) => (
          <FlowStep key={title} number={String(index + 1)} title={title}>
            {description}
          </FlowStep>
        ))}
      </div>

      <SectionLabel>{usgd.bufferTitle}</SectionLabel>
      <PanelCard>
        <p className="mb-2 text-sm leading-6 text-slate-400">{usgd.bufferDescription}</p>
        <MetricRow label={usgd.metrics.goldPrice} value={`${formatCurrency(goldPrice)} ${units.perOz}`} tone="gold" />
        <MetricRow label={usgd.metrics.backing} value={`$${backing.toFixed(2)}`} />
        <MetricRow
          label={usgd.metrics.buffer}
          value={`$${buffer.toFixed(2)} (${(buffer * 100).toFixed(0)}% ${usgd.metrics.excess})`}
          tone={backed ? "green" : "gold"}
        />
        <MetricRow label={usgd.metrics.fall} value={`${fallPct.toFixed(0)}%`} tone="gold" />
        <MetricRow label={usgd.metrics.status} value={backed ? usgd.metrics.fullyBacked : usgd.metrics.belowTarget} tone={backed ? "green" : "gold"} />
      </PanelCard>
    </>
  );
}

function GdlPanel({ copy }) {
  const { gdl } = copy;

  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center rounded-[28px] border border-amber-400/20 bg-amber-400/10 px-5 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
        <Icon icon="mdi:home-analytics" width="28" />
      </div>
      <h2 className="mt-6 text-3xl font-semibold text-white">{gdl.title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">{gdl.description}</p>
      <div className="mt-8 grid w-full max-w-4xl gap-3 md:grid-cols-4">
        {gdl.kpis.map(([label, value, note], index) => (
          <KpiCard key={label} label={label} value={value} note={note} tone={["default", "blue", "green", "amber"][index]} />
        ))}
      </div>
    </div>
  );
}

function FaqPanel({ copy }) {
  const { faq } = copy;

  return (
    <>
      <p className="text-sm leading-6 text-slate-400">{faq.intro}</p>
      <div className="mt-5 space-y-3">
        {faq.items.map(([question, answer]) => (
          <PanelCard key={question} className="rounded-2xl border-l-4 border-l-[#fcd535]">
            <h3 className="font-semibold text-white">{question}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-400">{answer}</p>
          </PanelCard>
        ))}
      </div>
    </>
  );
}

export default function LabPage() {
  const { i18n } = useTranslation();
  const [goldPrice, setGoldPrice] = useState(GOLD_ENTRY);
  const [activeTab, setActiveTab] = useState("ecosystem");

  const copy = i18n.language?.startsWith("zh") ? labCopy.zh : labCopy.en;
  const annualRevenue = ANNUAL_OZ * goldPrice;
  const marketCap = GODL_SUPPLY * goldPrice;

  return (
    <section className="relative overflow-hidden px-4 py-10 md:py-14">
      <div className="governance-grid pointer-events-none absolute inset-0 opacity-25" />
      <div className="pointer-events-none absolute inset-x-0 top-[-80px] h-[260px] bg-[radial-gradient(circle_at_top,rgba(252,213,53,0.18),rgba(252,213,53,0)_70%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.045] p-5 md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#fcd535]/25 bg-[#fcd535]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#f0cd54]">
                <Icon icon="mdi:flask-outline" width="14" />
                {copy.hero.badge}
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">{copy.hero.title}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 md:text-base">{copy.hero.description}</p>
            </div>
            <div className="rounded-2xl border border-[#fcd535]/25 bg-[#fcd535]/10 p-4 text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.hero.simulatorTitle}</p>
              <p className="mt-2 text-3xl font-semibold text-[#f0cd54]">
                {formatCurrency(goldPrice)} {copy.units.perOz}
              </p>
              <p className="mt-1 text-xs text-slate-500">{copy.hero.simulatorHint}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="text-sm font-semibold text-slate-300">{copy.hero.sliderLabel}</span>
              <span className="text-xs text-slate-500">{formatCurrency(GOLD_MIN)}</span>
              <input
                type="range"
                min={GOLD_MIN}
                max={GOLD_MAX}
                step="50"
                value={goldPrice}
                onChange={(event) => setGoldPrice(Number(event.target.value))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full accent-[#fcd535]"
                style={{ background: goldSliderBackground(goldPrice) }}
                aria-label={copy.hero.sliderAria}
              />
              <span className="text-xs text-slate-500">{formatCurrency(GOLD_MAX)}</span>
              <span className="min-w-[104px] text-right text-sm font-semibold text-[#f0cd54]">
                {formatCurrency(goldPrice)} {copy.units.perOz}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto border-b border-white/10">
          <div className="flex min-w-max gap-2">
            {tabConfig.map((tab) => {
              const active = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "border-[#fcd535] text-[#f0cd54]"
                      : "border-transparent text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <Icon icon={tab.icon} width="16" />
                  {copy.tabs[tab.key]}
                  {tab.soon && (
                    <span className="rounded-md border border-amber-400/25 bg-amber-400/10 px-1.5 py-0.5 text-[10px] text-amber-300">
                      {copy.tabs.soon}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          {activeTab === "ecosystem" && <EcosystemPanel goldPrice={goldPrice} annualRevenue={annualRevenue} copy={copy} />}
          {activeTab === "godl" && <GodlPanel goldPrice={goldPrice} annualRevenue={annualRevenue} marketCap={marketCap} copy={copy} />}
          {activeTab === "usgd" && <UsgdPanel goldPrice={goldPrice} copy={copy} />}
          {activeTab === "gdl" && <GdlPanel copy={copy} />}
          {activeTab === "faq" && <FaqPanel copy={copy} />}
        </div>

        <footer className="mt-10 border-t border-white/10 pt-5 text-center text-xs leading-6 text-slate-500">
          <p>{copy.footer.line1}</p>
          <p>{copy.footer.line2}</p>
        </footer>
      </div>
    </section>
  );
}
