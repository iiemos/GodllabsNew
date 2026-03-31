import { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../components/Notification";

const proposalItems = [
  {
    id: "pool-launch",
    titleKey: "poolLaunch",
    summaryKey: "poolLaunchSummary",
    proposalId: "P-240301",
    proposer: "0xA8B4...D901",
    deadline: "2026-03-10 10:00",
    support: 1240.5,
    oppose: 128.3,
    status: "ended",
  },
  {
    id: "fee-adjust",
    titleKey: "feeAdjust",
    summaryKey: "feeAdjustSummary",
    proposalId: "P-240227",
    proposer: "0xB172...3F2C",
    deadline: "2026-03-05 09:30",
    support: 965.2,
    oppose: 401.6,
    status: "ended",
  },
];

const memberItems = [
  { id: "member-1", address: "0x9A67...7508", level: "S4", score: 58900 },
  { id: "member-2", address: "0x9965...A4dc", level: "S2", score: 12322 },
  { id: "member-3", address: "0x14dc...9955", level: "S1", score: 1025 },
];

function getGovernanceLevel(weight) {
  if (weight >= 18) return "S7";
  if (weight >= 12) return "S6";
  if (weight >= 9) return "S5";
  if (weight >= 6) return "S4";
  if (weight >= 3) return "S3";
  if (weight >= 1) return "S2";
  return "S1";
}

function formatNumber(value) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1,
  });
}

function formatMoney(value) {
  return value.toLocaleString("en-US");
}

function ProposalCard({ item, onAction, t }) {
  const totalVotes = item.support + item.oppose;
  const supportRatio = totalVotes > 0 ? (item.support / totalVotes) * 100 : 0;
  const ended = item.status === "ended";

  return (
    <article className="governance-panel-soft rounded-[2rem] p-5 md:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <h3 className="text-2xl font-semibold text-white">{t(`governance.proposals.${item.titleKey}`)}</h3>
            <p className="mt-3 text-base leading-7 text-slate-400">{t(`governance.proposals.${item.summaryKey}`)}</p>
          </div>

          <span className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/8 bg-white/8 px-4 text-sm font-semibold text-slate-200">
            {t(`common.status.${item.status}`)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
          <span>
            {t("governance.proposal.idLabel")} {item.proposalId}
          </span>
          <span>
            {t("governance.proposal.proposerLabel")} {item.proposer}
          </span>
          <span>
            {t("governance.proposal.deadlineLabel")} {item.deadline}
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#22c55e_0%,#4ade80_100%)] shadow-[0_0_20px_rgba(74,222,128,0.28)]"
            style={{ width: `${supportRatio}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-lg font-medium">
          <p className="text-emerald-400">
            {t("governance.proposal.support")}:{formatNumber(item.support)}
          </p>
          <p className="text-rose-400">
            {t("governance.proposal.oppose")}:{formatNumber(item.oppose)}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onAction(item, "support")}
            className={`h-14 rounded-[1.35rem] border text-lg font-semibold transition ${
              ended
                ? "border-white/6 bg-white/8 text-slate-500 hover:border-white/10 hover:text-slate-400"
                : "border-emerald-400/25 bg-emerald-400/10 text-emerald-200 hover:border-emerald-400/45 hover:bg-emerald-400/14"
            }`}
          >
            {t("governance.proposal.supportAction")}
          </button>
          <button
            type="button"
            onClick={() => onAction(item, "oppose")}
            className={`h-14 rounded-[1.35rem] border text-lg font-semibold transition ${
              ended
                ? "border-white/6 bg-white/8 text-slate-500 hover:border-white/10 hover:text-slate-400"
                : "border-rose-400/25 bg-rose-400/10 text-rose-200 hover:border-rose-400/45 hover:bg-rose-400/14"
            }`}
          >
            {t("governance.proposal.opposeAction")}
          </button>
        </div>
      </div>
    </article>
  );
}

function SummaryCard({ icon, title, value, note, accentClass }) {
  return (
    <article className="governance-panel governance-metric rounded-[2rem] p-6 md:p-7">
      <div className="flex h-full flex-col justify-between gap-6">
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${accentClass}`}>
          <Icon icon={icon} width="24" />
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-white">{value}</p>
          </div>
          <p className={`text-xl font-semibold ${accentClass}`}>{note}</p>
        </div>
      </div>
    </article>
  );
}

export default function GovernancePage() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [walletBalance, setWalletBalance] = useState(5000);
  const [stakedBalance, setStakedBalance] = useState(1200);
  const [stakeAmount, setStakeAmount] = useState("100");

  const votingPower = Math.floor(stakedBalance / 100);
  const governanceLevel = getGovernanceLevel(votingPower);
  const activeProposals = proposalItems.filter((item) => item.status === "active").length;
  const endedProposals = proposalItems.filter((item) => item.status === "ended").length;

  const summaryCards = [
    {
      id: "level",
      icon: "mdi:crown-outline",
      title: t("governance.overview.levelTitle"),
      value: governanceLevel,
      note: t("governance.overview.levelNote"),
      accentClass: "text-[#fcd535]",
    },
    {
      id: "participants",
      icon: "mdi:account-group-outline",
      title: t("governance.overview.participantsTitle"),
      value: memberItems.length,
      note: t("governance.overview.participantsNote"),
      accentClass: "text-sky-400",
    },
    {
      id: "active",
      icon: "mdi:vote-outline",
      title: t("governance.overview.liveTitle"),
      value: activeProposals,
      note: t("governance.overview.liveNote"),
      accentClass: "text-emerald-400",
    },
    {
      id: "ended",
      icon: "mdi:archive-outline",
      title: t("governance.overview.endedTitle"),
      value: endedProposals,
      note: t("governance.overview.endedNote"),
      accentClass: "text-amber-300",
    },
  ];

  const handlePublishProposal = () => {
    notify({ type: "info", message: t("governance.notifications.publishSoon") });
  };

  const handleStake = (mode) => {
    const parsedAmount = Number(stakeAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      notify({ type: "error", message: t("governance.notifications.invalidAmount") });
      return;
    }

    if (mode === "stake") {
      if (parsedAmount > walletBalance) {
        notify({
          type: "error",
          message: t("governance.notifications.insufficientWallet", { balance: formatNumber(walletBalance) }),
        });
        return;
      }

      setWalletBalance((current) => Number((current - parsedAmount).toFixed(1)));
      setStakedBalance((current) => Number((current + parsedAmount).toFixed(1)));
      notify({
        type: "success",
        message: t("governance.notifications.stakeSuccess", { amount: formatNumber(parsedAmount) }),
      });
      return;
    }

    if (parsedAmount > stakedBalance) {
      notify({
        type: "error",
        message: t("governance.notifications.insufficientStaked", { balance: formatNumber(stakedBalance) }),
      });
      return;
    }

    setWalletBalance((current) => Number((current + parsedAmount).toFixed(1)));
    setStakedBalance((current) => Number((current - parsedAmount).toFixed(1)));
    notify({
      type: "success",
      message: t("governance.notifications.unstakeSuccess", { amount: formatNumber(parsedAmount) }),
    });
  };

  const handleVoteAction = (proposal, action) => {
    if (proposal.status === "ended") {
      notify({ type: "info", message: t("governance.notifications.proposalClosed") });
      return;
    }

    notify({
      type: "success",
      message: t("governance.notifications.voteSuccess", {
        title: t(`governance.proposals.${proposal.titleKey}`),
        action: t(`governance.voteAction.${action}`),
      }),
    });
  };

  return (
    <section className="relative overflow-hidden px-4 py-8 md:py-12">
      <div className="pointer-events-none absolute inset-0 governance-grid opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[280px] bg-[radial-gradient(circle_at_top,rgba(252,213,53,0.14),rgba(252,213,53,0)_60%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#fcd535]/20 bg-[#fcd535]/8 px-4 py-2 text-sm font-medium text-[#f0cd54]">
              <Icon icon="mdi:star-four-points-circle-outline" width="14" />
              {t("governance.badge")}
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-6xl">{t("governance.title")}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400 md:text-lg">{t("governance.description")}</p>
          </div>

          <button
            type="button"
            onClick={handlePublishProposal}
            className="morgan-btn-secondary inline-flex h-14 items-center justify-center gap-2 self-start rounded-[1.6rem] px-6 text-lg text-white"
          >
            <Icon icon="mdi:file-document-edit-outline" width="20" />
            {t("governance.publishProposal")}
          </button>
        </div>

        <div className="mt-9 grid gap-4 xl:grid-cols-4 md:grid-cols-2">
          {summaryCards.map((card) => (
            <SummaryCard key={card.id} {...card} />
          ))}
        </div>

        <div className="mt-10 h-px bg-[linear-gradient(90deg,rgba(252,213,53,0),rgba(252,213,53,0.55),rgba(252,213,53,0))]" />

        <div className="mt-10 grid gap-7 xl:grid-cols-[minmax(0,1.75fr)_minmax(340px,0.85fr)]">
          <div className="governance-panel rounded-[2.25rem] p-5 md:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-3 text-2xl font-semibold text-white md:text-3xl">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#fcd535]/18 bg-[#fcd535]/8 text-[#fcd535]">
                  <Icon icon="mdi:vote-outline" width="22" />
                </span>
                {t("governance.listTitle")}
              </h2>
              <p className="text-base text-slate-400">{t("governance.myVotingPower", { value: votingPower })}</p>
            </div>

            <div className="mt-6 space-y-5">
              {proposalItems.map((item) => (
                <ProposalCard key={item.id} item={item} onAction={handleVoteAction} t={t} />
              ))}
            </div>
          </div>

          <aside className="governance-panel rounded-[2.25rem] p-5 md:p-7">
            <h2 className="flex items-center gap-3 text-2xl font-semibold text-white md:text-3xl">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#fcd535]/18 bg-[#fcd535]/8 text-[#fcd535]">
                <Icon icon="mdi:wallet-outline" width="22" />
              </span>
              {t("governance.stakeTitle")}
            </h2>

            <div className="mt-8 space-y-5">
              <div className="flex items-center justify-between gap-4 text-lg">
                <span className="text-slate-400">{t("governance.stakeFields.wallet")}</span>
                <span className="font-semibold text-white">{formatNumber(walletBalance)} GDL</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-lg">
                <span className="text-slate-400">{t("governance.stakeFields.staked")}</span>
                <span className="font-semibold text-[#fcd535]">{formatNumber(stakedBalance)} GDL</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-lg">
                <span className="text-slate-400">{t("governance.stakeFields.weight")}</span>
                <span className="font-semibold text-white">{votingPower}</span>
              </div>
            </div>

            <div className="mt-8">
              <input
                type="number"
                min="0"
                step="0.1"
                value={stakeAmount}
                onChange={(event) => setStakeAmount(event.target.value)}
                placeholder={t("governance.amountPlaceholder")}
                className="no-number-spin governance-panel-soft h-16 w-full rounded-[1.5rem] px-5 text-2xl text-white outline-none transition placeholder:text-slate-500 focus:border-[#fcd535]/40"
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => handleStake("stake")} className="morgan-btn-primary h-14 rounded-[1.35rem] px-5 text-lg">
                {t("governance.stakeButton")}
              </button>
              <button
                type="button"
                onClick={() => handleStake("unstake")}
                className="h-14 rounded-[1.35rem] border border-white/10 bg-white/8 px-5 text-lg font-semibold text-white transition hover:border-white/20 hover:bg-white/12"
              >
                {t("governance.unstakeButton")}
              </button>
            </div>

            <div className="governance-panel-soft mt-7 rounded-[1.75rem] p-5 text-base leading-7 text-slate-300">
              {t("governance.stakeHint")}
            </div>
          </aside>
        </div>

        <div className="governance-panel mt-10 rounded-[2.25rem] p-5 md:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-3 text-2xl font-semibold text-white md:text-3xl">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#fcd535]/18 bg-[#fcd535]/8 text-[#fcd535]">
                <Icon icon="mdi:account-group-outline" width="22" />
              </span>
              {t("governance.memberTitle")}
            </h2>
            <p className="text-base text-slate-400">{t("governance.memberCount", { count: memberItems.length })}</p>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {memberItems.map((item) => (
              <article key={item.id} className="governance-panel-soft rounded-[1.85rem] p-5 md:p-6">
                <p className="text-[1.7rem] font-semibold tracking-[0.04em] text-white">{item.address}</p>
                <p className="mt-5 text-lg text-slate-400">{t("governance.memberLevel", { level: item.level })}</p>
                <p className="mt-2 text-lg text-slate-400">{t("governance.memberScore", { score: `$${formatMoney(item.score)}` })}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
