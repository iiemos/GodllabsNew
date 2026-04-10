import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../components/Notification";
import { useWallet } from "../contexts/WalletContext";
import { ADDRESSES, GOLD_TERM_OPTIONS, TBSC_CHAIN_ID } from "../web3/config";
import { createCoreContracts } from "../web3/contracts";
import { getReadProvider, isExpectedChain } from "../web3/client";
import {
  formatBps,
  formatCountdown,
  formatTimestamp,
  formatTokenAmount,
  parseTokenAmount,
  toErrorMessage,
} from "../web3/format";

const ONE_E18 = 10n ** 18n;
const ZERO_PENDING_MATURED = { principal: 0n, yieldAmount: 0n, gdl: 0n };

function estimateSubscription(godlAmount, price, termMonths, apyBps, gdlBonusBps, gdlPrice) {
  if (godlAmount <= 0n || price <= 0n) {
    return { principal: 0n, upfrontFee: 0n, yieldTotal: 0n, principalOut: 0n, gdlBonusUsd: 0n, gdlOut: 0n };
  }

  const principal = (godlAmount * price) / ONE_E18;
  const upfrontFee = (principal * 200n * BigInt(termMonths)) / (12n * 10000n);
  const durationDays = termMonths === 3 ? 90n : termMonths === 6 ? 180n : 365n;
  const yieldTotal = (principal * BigInt(apyBps) * durationDays) / (365n * 10000n);
  const principalOut = principal - upfrontFee;
  const gdlBonusUsd = (yieldTotal * BigInt(gdlBonusBps)) / 10000n;
  const gdlOut = gdlPrice > 0n ? (gdlBonusUsd * ONE_E18) / gdlPrice : 0n;

  return { principal, upfrontFee, yieldTotal, principalOut, gdlBonusUsd, gdlOut };
}

function normalizeTermConfig(termConfig) {
  return {
    duration: termConfig.duration,
    months: Number(termConfig.months),
    apyBps: Number(termConfig.apyBps),
    gdlBonusBps: Number(termConfig.gdlBonusBps),
  };
}

export default function FundPage() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { address, chainId, connect, getSigner } = useWallet();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [claimingWeeklyId, setClaimingWeeklyId] = useState("");
  const [claimingMaturedId, setClaimingMaturedId] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [selectedTermType, setSelectedTermType] = useState(0);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [countdownTick, setCountdownTick] = useState(0);

  const [fundState, setFundState] = useState({
    paused: false,
    whitelistMode: false,
    whitelisted: true,
    blacklisted: false,
    weeklyClaimInterval: 0n,
    minSubscribe: parseTokenAmount("0.1"),
    price: 0n,
    gdlPrice: 0n,
    terms: {},
    subscriptions: [],
  });

  useEffect(() => {
    const timer = window.setInterval(() => setCountdownTick((prev) => prev + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const reloadFundData = useCallback(async () => {
    setLoading(true);
    const readProvider = getReadProvider();
    const contracts = createCoreContracts(readProvider);

    try {
      const [
        paused,
        whitelistMode,
        price,
        gdlPrice,
        weeklyClaimInterval,
        nextSubscriptionId,
        minSubscribe,
        rawTerms,
      ] = await Promise.all([
        contracts.gold.paused(),
        contracts.gold.whitelistMode(),
        contracts.gold.subscriptionGodlPriceUsdE18(),
        contracts.gold.gdlPriceUsdE18(),
        contracts.gold.weeklyClaimInterval(),
        contracts.gold.nextSubscriptionId(),
        contracts.gold.MIN_SUBSCRIBE_GODL().catch(() => parseTokenAmount("0.1")),
        Promise.all(GOLD_TERM_OPTIONS.map(async ({ termType }) => [termType, await contracts.gold.termConfigs(termType)])),
      ]);

      const terms = Object.fromEntries(rawTerms.map(([termType, termConfig]) => [termType, normalizeTermConfig(termConfig)]));

      let whitelisted = true;
      let blacklisted = false;
      let subscriptions = [];

      if (address) {
        [whitelisted, blacklisted] = await Promise.all([
          contracts.gold.whitelisted(address),
          contracts.gold.blacklisted(address),
        ]);

        const ids = [];
        for (let id = 1n; id < nextSubscriptionId; id += 1n) {
          ids.push(id);
        }

        if (ids.length > 0) {
          const subscriptionRecords = await Promise.all(
            ids.map(async (id) => ({
              id,
              detail: await contracts.gold.subscriptions(id),
            })),
          );

          const ownerLower = address.toLowerCase();
          const ownedSubscriptions = subscriptionRecords.filter(
            (item) => item.detail.owner && String(item.detail.owner).toLowerCase() === ownerLower,
          );

          const pendingRecords = await Promise.all(
            ownedSubscriptions.map(async ({ id }) => {
              const [pendingWeekly, pendingMatured] = await Promise.all([
                contracts.gold.pendingWeekly(id),
                contracts.gold.pendingMatured(id),
              ]);
              return {
                id,
                pendingWeekly,
                pendingMatured: {
                  principal: pendingMatured.usgdPrincipalOut,
                  yieldAmount: pendingMatured.usgdYieldOut,
                  gdl: pendingMatured.gdlOut,
                },
              };
            }),
          );

          const pendingMap = new Map(pendingRecords.map((item) => [item.id.toString(), item]));

          subscriptions = ownedSubscriptions
            .map(({ id, detail }) => {
              const pending = pendingMap.get(id.toString());
              return {
                id,
                owner: detail.owner,
                godlAmount: detail.godlAmount,
                usgdPrincipalGross: detail.usgdPrincipalGross,
                upfrontFeeUsgd: detail.upfrontFeeUsgd,
                termType: Number(detail.termType),
                startAt: detail.startAt,
                endAt: detail.endAt,
                lastClaimAt: detail.lastClaimAt,
                claimedUsgd: detail.claimedUsgd,
                gdlBonusCapUsdE18: detail.gdlBonusCapUsdE18,
                maturedClaimed: detail.maturedClaimed,
                settlementAdjustmentUsgd: detail.settlementAdjustmentUsgd,
                pendingWeekly: pending?.pendingWeekly ?? 0n,
                pendingMatured: pending?.pendingMatured ?? ZERO_PENDING_MATURED,
              };
            })
            .sort((a, b) => Number(b.id - a.id));
        }
      }

      setFundState({
        paused,
        whitelistMode,
        whitelisted,
        blacklisted,
        weeklyClaimInterval,
        minSubscribe,
        price,
        gdlPrice,
        terms,
        subscriptions,
      });
    } catch (error) {
      notify({ type: "error", message: toErrorMessage(error, "读取基金合约数据失败") });
    } finally {
      setLoading(false);
    }
  }, [address, notify]);

  useEffect(() => {
    reloadFundData();
  }, [reloadFundData, refreshNonce]);

  const activeTerm = fundState.terms[selectedTermType] ?? {
    months: 3,
    apyBps: 0,
    gdlBonusBps: 0,
  };

  const parsedAmount = useMemo(() => {
    try {
      return parseTokenAmount(amountInput);
    } catch {
      return 0n;
    }
  }, [amountInput]);

  const estimate = useMemo(
    () =>
      estimateSubscription(
        parsedAmount,
        fundState.price,
        activeTerm.months ?? 3,
        activeTerm.apyBps ?? 0,
        activeTerm.gdlBonusBps ?? 0,
        fundState.gdlPrice,
      ),
    [activeTerm.apyBps, activeTerm.gdlBonusBps, activeTerm.months, fundState.gdlPrice, fundState.price, parsedAmount],
  );

  const totals = useMemo(() => {
    return fundState.subscriptions.reduce(
      (acc, subscription) => {
        acc.principal += subscription.usgdPrincipalGross;
        acc.weekly += subscription.pendingWeekly;
        acc.maturedUsgd += subscription.pendingMatured.principal + subscription.pendingMatured.yieldAmount;
        acc.maturedGdl += subscription.pendingMatured.gdl;
        return acc;
      },
      { principal: 0n, weekly: 0n, maturedUsgd: 0n, maturedGdl: 0n },
    );
  }, [fundState.subscriptions]);

  const canWrite = useMemo(() => {
    if (!address) return false;
    if (!isExpectedChain(chainId)) return false;
    if (fundState.paused) return false;
    if (fundState.blacklisted) return false;
    if (fundState.whitelistMode && !fundState.whitelisted) return false;
    return true;
  }, [address, chainId, fundState.blacklisted, fundState.paused, fundState.whitelistMode, fundState.whitelisted]);

  const writeBlockReason = useMemo(() => {
    if (!address) return "请先连接钱包";
    if (!isExpectedChain(chainId)) return `请切换到 BSC Testnet（ChainId=${TBSC_CHAIN_ID}）`;
    if (fundState.paused) return "协议已暂停，暂不可写入";
    if (fundState.blacklisted) return "当前地址在黑名单中";
    if (fundState.whitelistMode && !fundState.whitelisted) return "当前地址不在白名单中";
    return "";
  }, [address, chainId, fundState.blacklisted, fundState.paused, fundState.whitelistMode, fundState.whitelisted]);

  const ensureSigner = useCallback(async () => {
    let currentAddress = address;
    if (!currentAddress) {
      currentAddress = await connect();
    }
    if (!currentAddress) return null;

    const signer = await getSigner();
    if (!signer) return null;

    const network = await signer.provider.getNetwork();
    if (Number(network.chainId) !== TBSC_CHAIN_ID) {
      notify({ type: "error", message: `请切换到 BSC Testnet（ChainId=${TBSC_CHAIN_ID}）` });
      return null;
    }

    return { signer, currentAddress };
  }, [address, connect, getSigner, notify]);

  const handleSubscribe = async () => {
    if (submitting) return;

    let amount;
    try {
      amount = parseTokenAmount(amountInput);
    } catch {
      notify({ type: "error", message: "请输入有效的 GODL 数量" });
      return;
    }

    if (amount <= 0n) {
      notify({ type: "error", message: "请输入有效的 GODL 数量" });
      return;
    }

    if (amount < fundState.minSubscribe) {
      notify({
        type: "error",
        message: `最低认购 ${formatTokenAmount(fundState.minSubscribe)} GODL`,
      });
      return;
    }

    const signerContext = await ensureSigner();
    if (!signerContext) return;

    if (!canWrite) {
      notify({ type: "error", message: writeBlockReason || "当前状态不可执行写入" });
      return;
    }

    setSubmitting(true);
    try {
      const contracts = createCoreContracts(signerContext.signer);
      const allowance = await contracts.godl.allowance(signerContext.currentAddress, ADDRESSES.goldProxy);

      if (allowance < amount) {
        notify({ type: "info", message: "正在进行 GODL 授权..." });
        const approveTx = await contracts.godl.approve(ADDRESSES.goldProxy, amount);
        await approveTx.wait();
      }

      const tx = await contracts.gold.subscribe(amount, selectedTermType);
      const receipt = await tx.wait();
      const subscribedLog = receipt.logs.find((log) => log.fragment?.name === "Subscribed");
      const subId = subscribedLog?.args?.subscriptionId;

      notify({
        type: "success",
        message: subId ? `认购成功，订阅编号 #${subId}` : "认购成功",
      });

      setAmountInput("");
      setRefreshNonce((prev) => prev + 1);
    } catch (error) {
      notify({ type: "error", message: toErrorMessage(error, "认购失败") });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaimWeekly = async (subscriptionId) => {
    if (claimingWeeklyId) return;

    const signerContext = await ensureSigner();
    if (!signerContext) return;

    if (!canWrite) {
      notify({ type: "error", message: writeBlockReason || "当前状态不可执行写入" });
      return;
    }

    setClaimingWeeklyId(subscriptionId.toString());
    try {
      const contracts = createCoreContracts(signerContext.signer);
      const tx = await contracts.gold.claimWeekly(subscriptionId);
      await tx.wait();
      notify({ type: "success", message: `周收益领取成功 #${subscriptionId}` });
      setRefreshNonce((prev) => prev + 1);
    } catch (error) {
      notify({ type: "error", message: toErrorMessage(error, "领取周收益失败") });
    } finally {
      setClaimingWeeklyId("");
    }
  };

  const handleClaimMatured = async (subscriptionId) => {
    if (claimingMaturedId) return;

    const signerContext = await ensureSigner();
    if (!signerContext) return;

    if (!canWrite) {
      notify({ type: "error", message: writeBlockReason || "当前状态不可执行写入" });
      return;
    }

    setClaimingMaturedId(subscriptionId.toString());
    try {
      const contracts = createCoreContracts(signerContext.signer);
      const tx = await contracts.gold.claimMatured(subscriptionId);
      await tx.wait();
      notify({ type: "success", message: `到期收益领取成功 #${subscriptionId}` });
      setRefreshNonce((prev) => prev + 1);
    } catch (error) {
      notify({ type: "error", message: toErrorMessage(error, "到期领取失败") });
    } finally {
      setClaimingMaturedId("");
    }
  };

  return (
    <section className="relative overflow-hidden px-4 py-10 md:py-14">
      <div className="governance-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-[-80px] h-[260px] bg-[radial-gradient(circle_at_top,rgba(252,213,53,0.18),rgba(252,213,53,0)_70%)]" />

      <div className="relative mx-auto max-w-6xl">
        <h1 className="text-4xl font-semibold tracking-tight text-[#fcd535] md:text-6xl">{t("fund.title")}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{t("fund.subtitle")}</p>

        {!isExpectedChain(chainId) && address && (
          <div className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            检测到当前钱包网络非 BSC Testnet，请切换后再执行交易。
          </div>
        )}

        <article className="governance-panel mt-6 rounded-[28px] p-5 md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">GoldStakingProtocol</p>
              <p className="text-xl font-semibold text-white">基金认购（真实合约）</p>
              <p className="text-sm text-slate-400">
                当前认购价: <span className="font-semibold text-[#fcd535]">{formatTokenAmount(fundState.price)} USGD / GODL</span>
              </p>
              <p className="text-sm text-slate-400">
                GDL 结算价: <span className="font-semibold text-[#f0cd54]">{formatTokenAmount(fundState.gdlPrice)} USGD / GDL</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRefreshNonce((prev) => prev + 1)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-200 transition hover:border-white/25 hover:text-white"
            >
              <Icon icon="mdi:refresh" width="16" />
              刷新
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {GOLD_TERM_OPTIONS.map(({ termType, label }) => {
              const config = fundState.terms[termType];
              const active = selectedTermType === termType;

              return (
                <button
                  key={termType}
                  type="button"
                  onClick={() => setSelectedTermType(termType)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    active ? "border-[#fcd535]/40 bg-[#fcd535]/12" : "border-white/10 bg-white/5 hover:border-white/25"
                  }`}
                >
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    APY {config ? formatBps(config.apyBps) : "-"} / GDL Bonus{" "}
                    {config ? `${(config.gdlBonusBps / 10000).toFixed(2)}x` : "-"}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px]">
            <label className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs text-slate-500">认购 GODL 数量</p>
              <input
                type="number"
                min="0"
                step="any"
                value={amountInput}
                onChange={(event) => setAmountInput(event.target.value)}
                placeholder="0.0"
                className="mt-1 h-8 w-full bg-transparent text-lg font-semibold text-white outline-none placeholder:text-slate-500"
              />
            </label>

            <button
              type="button"
              onClick={handleSubscribe}
              disabled={submitting || !amountInput}
              className={`h-full min-h-[72px] rounded-2xl text-sm font-semibold transition ${
                submitting || !amountInput
                  ? "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
                  : "morgan-btn-primary border-0 text-[#111111]"
              }`}
            >
              {submitting ? "处理中..." : "授权并认购"}
            </button>
          </div>

          <div className="mt-4 grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300 md:grid-cols-3">
            <p>
              预估本金: <span className="font-semibold text-white">{formatTokenAmount(estimate.principal)} USGD</span>
            </p>
            <p>
              预估前置费: <span className="font-semibold text-rose-300">{formatTokenAmount(estimate.upfrontFee)} USGD</span>
            </p>
            <p>
              到期本金(扣费后): <span className="font-semibold text-[#f0cd54]">{formatTokenAmount(estimate.principalOut)} USGD</span>
            </p>
            <p>
              预估总收益: <span className="font-semibold text-emerald-300">{formatTokenAmount(estimate.yieldTotal)} USGD</span>
            </p>
            <p>
              GDL 奖励价值: <span className="font-semibold text-emerald-300">{formatTokenAmount(estimate.gdlBonusUsd)} USGD</span>
            </p>
            <p>
              预估 GDL 奖励: <span className="font-semibold text-[#fcd535]">{formatTokenAmount(estimate.gdlOut)} GDL</span>
            </p>
          </div>

          {!canWrite && <p className="mt-3 text-xs text-amber-300">{writeBlockReason}</p>}
        </article>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="governance-panel-soft rounded-3xl p-5">
            <p className="text-sm text-slate-500">认购本金（USGD）</p>
            <p className="mt-2 text-3xl font-semibold text-white">{formatTokenAmount(totals.principal)} USGD</p>
          </article>
          <article className="governance-panel-soft rounded-3xl p-5">
            <p className="text-sm text-slate-500">当前可领周收益（USGD）</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">{formatTokenAmount(totals.weekly)} USGD</p>
          </article>
          <article className="governance-panel-soft rounded-3xl p-5">
            <p className="text-sm text-slate-500">当前可领到期收益</p>
            <p className="mt-2 text-xl font-semibold text-[#fcd535]">
              {formatTokenAmount(totals.maturedUsgd)} USGD / {formatTokenAmount(totals.maturedGdl)} GDL
            </p>
          </article>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="governance-panel rounded-[28px] px-6 py-10 text-center text-slate-400">正在读取链上认购数据...</div>
          ) : !address ? (
            <div className="governance-panel rounded-[28px] px-6 py-10 text-center text-slate-400">连接钱包后可查看你的认购记录</div>
          ) : fundState.subscriptions.length === 0 ? (
            <div className="governance-panel rounded-[28px] px-6 py-10 text-center text-slate-400">暂无认购记录</div>
          ) : (
            fundState.subscriptions.map((subscription) => {
              const termConfig = fundState.terms[subscription.termType];
              const nextWeeklyAt = Number(subscription.lastClaimAt) + Number(fundState.weeklyClaimInterval);
              const weeklyReady = subscription.pendingWeekly > 0n;
              const maturedReady =
                subscription.pendingMatured.principal > 0n ||
                subscription.pendingMatured.yieldAmount > 0n ||
                subscription.pendingMatured.gdl > 0n;
              const maturedDone = subscription.maturedClaimed;
              const isClaimingWeekly = claimingWeeklyId === subscription.id.toString();
              const isClaimingMatured = claimingMaturedId === subscription.id.toString();

              return (
                <article key={subscription.id.toString()} className="governance-panel overflow-hidden rounded-[28px]">
                  <div className="border-b border-white/10 p-5 md:p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-white">Subscription #{subscription.id.toString()}</h2>
                        <p className="mt-2 text-sm text-slate-400">
                          期限: {termConfig?.months ?? "-"} 个月 · APY: {termConfig ? formatBps(termConfig.apyBps) : "-"} · GDL Bonus:{" "}
                          {termConfig ? `${(termConfig.gdlBonusBps / 10000).toFixed(2)}x` : "-"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold ${
                          maturedDone
                            ? "border border-white/15 bg-white/5 text-slate-300"
                            : "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        }`}
                      >
                        {maturedDone ? "已完成到期领取" : "进行中"}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
                    <div className="governance-panel-soft rounded-3xl p-5">
                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <Icon icon="mdi:bank-transfer" width="16" className="text-[#fcd535]" />
                        到期领取（本金 + 剩余收益 + GDL）
                      </p>
                      <div className="mt-4 space-y-2 text-sm text-slate-400">
                        <p>
                          认购 GODL: <span className="font-semibold text-white">{formatTokenAmount(subscription.godlAmount)} GODL</span>
                        </p>
                        <p>
                          认购本金:{" "}
                          <span className="font-semibold text-white">{formatTokenAmount(subscription.usgdPrincipalGross)} USGD</span>
                        </p>
                        <p>
                          前置费用:{" "}
                          <span className="font-semibold text-rose-300">{formatTokenAmount(subscription.upfrontFeeUsgd)} USGD</span>
                        </p>
                        <p>
                          到期时间: <span className="font-semibold text-slate-200">{formatTimestamp(subscription.endAt)}</span>
                        </p>
                        <p>
                          可领本金:{" "}
                          <span className="font-semibold text-[#f0cd54]">
                            {formatTokenAmount(subscription.pendingMatured.principal)} USGD
                          </span>
                        </p>
                        <p>
                          可领收益:{" "}
                          <span className="font-semibold text-emerald-300">
                            {formatTokenAmount(subscription.pendingMatured.yieldAmount)} USGD
                          </span>
                        </p>
                        <p>
                          可领GDL:{" "}
                          <span className="font-semibold text-[#fcd535]">{formatTokenAmount(subscription.pendingMatured.gdl)} GDL</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleClaimMatured(subscription.id)}
                        disabled={!maturedReady || maturedDone || isClaimingMatured || !canWrite}
                        className={`mt-5 h-12 w-full rounded-2xl text-sm font-semibold transition ${
                          maturedReady && !maturedDone && !isClaimingMatured && canWrite
                            ? "morgan-btn-primary border-0 text-[#111111]"
                            : "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
                        }`}
                      >
                        {isClaimingMatured ? "处理中..." : maturedDone ? "已领取" : "领取到期收益"}
                      </button>
                    </div>

                    <div className="governance-panel-soft rounded-3xl p-5">
                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <Icon icon="mdi:calendar-clock-outline" width="16" className="text-[#fcd535]" />
                        周收益领取（USGD）
                      </p>

                      <div className="mt-4 space-y-2 text-sm text-slate-400">
                        <p>
                          已领周收益:{" "}
                          <span className="font-semibold text-slate-200">{formatTokenAmount(subscription.claimedUsgd)} USGD</span>
                        </p>
                        <p>
                          当前可领:{" "}
                          <span className="font-semibold text-[#f0cd54]">{formatTokenAmount(subscription.pendingWeekly)} USGD</span>
                        </p>
                        <p>
                          上次领取: <span className="font-semibold text-slate-200">{formatTimestamp(subscription.lastClaimAt)}</span>
                        </p>
                        <p>
                          下一次可领: <span className="font-semibold text-slate-200">{formatTimestamp(nextWeeklyAt)}</span>
                        </p>
                        <p>
                          距下一次可领:{" "}
                          <span key={countdownTick} className="font-semibold text-emerald-300">
                            {formatCountdown(nextWeeklyAt)}
                          </span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleClaimWeekly(subscription.id)}
                        disabled={!weeklyReady || isClaimingWeekly || !canWrite}
                        className={`mt-5 h-12 w-full rounded-2xl text-sm font-semibold transition ${
                          weeklyReady && !isClaimingWeekly && canWrite
                            ? "border border-[#fcd535]/35 bg-[#fcd535]/10 text-[#f0cd54] hover:bg-[#fcd535]/15"
                            : "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
                        }`}
                      >
                        {isClaimingWeekly ? "处理中..." : "领取周收益"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
