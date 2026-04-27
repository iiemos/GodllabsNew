import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { formatUnits } from "ethers";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNotification } from "../components/Notification";
import { useWallet } from "../contexts/WalletContext";
import { ADDRESSES, GOLD_TERM_OPTIONS, TBSC_CHAIN_ID } from "../web3/config";
import { createCoreContracts, validateCoreContractAddresses } from "../web3/contracts";
import { getReadProvider, isExpectedChain } from "../web3/client";
import { formatBps, formatTimestamp, formatTokenAmount, parseTokenAmount, toErrorMessage } from "../web3/format";

const ONE_E18 = 10n ** 18n;
const ZERO_PENDING_MATURED = { principal: 0n, yieldAmount: 0n };
const DEFAULT_GDL_BONUS_MULTIPLIER_BPS = 10000;
const FIXED_GDL_BONUS_BPS_BY_MONTH = Object.freeze({
  3: 3000,
  6: 6000,
  12: 12000,
});

function toPositiveInt(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.floor(parsed);
}

function getEffectiveGdlBonusBps(termMonths, rawGdlBonusBps, gdlBonusMultiplierBps = DEFAULT_GDL_BONUS_MULTIPLIER_BPS) {
  const months = toPositiveInt(termMonths);
  const fixedBps = FIXED_GDL_BONUS_BPS_BY_MONTH[months];
  if (typeof fixedBps === "number") return fixedBps;

  const rawBps = toPositiveInt(rawGdlBonusBps);
  const multiplierBps = toPositiveInt(gdlBonusMultiplierBps);
  if (!rawBps || !multiplierBps) return 0;
  return Number((BigInt(rawBps) * BigInt(multiplierBps)) / 10000n);
}

function getContractConfiguredGdlBonusBps(rawGdlBonusBps, gdlBonusMultiplierBps = DEFAULT_GDL_BONUS_MULTIPLIER_BPS) {
  const rawBps = toPositiveInt(rawGdlBonusBps);
  const multiplierBps = toPositiveInt(gdlBonusMultiplierBps);
  if (!rawBps || !multiplierBps) return 0;
  return Number((BigInt(rawBps) * BigInt(multiplierBps)) / 10000n);
}

function normalizeRewardUsdForDisplay(usdValue, termMonths, rawGdlBonusBps, gdlBonusMultiplierBps = DEFAULT_GDL_BONUS_MULTIPLIER_BPS) {
  if (usdValue <= 0n) return 0n;
  const displayBps = getEffectiveGdlBonusBps(termMonths, rawGdlBonusBps, gdlBonusMultiplierBps);
  const contractBps = getContractConfiguredGdlBonusBps(rawGdlBonusBps, gdlBonusMultiplierBps);
  if (!displayBps || !contractBps || displayBps === contractBps) return usdValue;
  return (usdValue * BigInt(displayBps)) / BigInt(contractBps);
}

function convertGdlToUsd(gdlAmount, spotGdlPrice) {
  if (gdlAmount <= 0n || spotGdlPrice <= 0n) return 0n;
  return (gdlAmount * spotGdlPrice) / ONE_E18;
}

function toInputAmount(value, decimals = 18) {
  const raw = formatUnits(value ?? 0n, decimals);
  if (!raw.includes(".")) return raw;
  return raw.replace(/\.?0+$/, "");
}

function estimatePurchase(godlAmount, spotGodlPrice, termDuration, yieldDuration, termMonths, apyBps, gdlBonusBps, spotGdlPrice) {
  if (godlAmount <= 0n || spotGodlPrice <= 0n) {
    return { principal: 0n, upfrontFee: 0n, yieldTotal: 0n, maturityOut: 0n, gdlBonusUsd: 0n, gdlOut: 0n, totalWithGdlBonus: 0n };
  }

  const principal = (godlAmount * spotGodlPrice) / ONE_E18;
  const effectiveYieldDuration = yieldDuration > 0n ? yieldDuration : termDuration;
  const durationDays = effectiveYieldDuration > 0n ? effectiveYieldDuration / 86400n : termMonths === 3 ? 90n : termMonths === 6 ? 180n : 365n;
  const upfrontFee = (principal * 200n * BigInt(termMonths)) / (12n * 10000n);
  const yieldTotal = (principal * BigInt(apyBps) * durationDays) / (365n * 10000n);
  const principalOut = principal - upfrontFee;
  const maturityOut = principalOut + yieldTotal;
  const gdlBonusUsd = (yieldTotal * BigInt(gdlBonusBps)) / 10000n;
  const gdlOut = spotGdlPrice > 0n ? (gdlBonusUsd * ONE_E18) / spotGdlPrice : 0n;
  const totalWithGdlBonus = maturityOut + gdlBonusUsd;

  return { principal, upfrontFee, yieldTotal, maturityOut, gdlBonusUsd, gdlOut, totalWithGdlBonus };
}

function normalizeTermConfig(termConfig) {
  const duration = termConfig?.duration ?? termConfig?.[0] ?? 0n;
  const yieldDuration = termConfig?.yieldDuration ?? termConfig?.[1] ?? duration;
  const months = Number(termConfig?.months ?? termConfig?.[2] ?? 0);
  const apyBps = Number(termConfig?.apyBps ?? termConfig?.[3] ?? 0);
  const gdlBonusBps = Number(termConfig?.gdlBonusBps ?? termConfig?.[4] ?? 0);

  return {
    duration,
    yieldDuration,
    months,
    apyBps,
    gdlBonusBps,
  };
}

function normalizePendingMaturedResult(pendingMatured) {
  return {
    principal: pendingMatured?.[0] ?? pendingMatured?.usgdPrincipalOut ?? pendingMatured?.usgdOut ?? 0n,
    yieldAmount: pendingMatured?.[1] ?? pendingMatured?.usgdYieldOut ?? 0n,
  };
}

function normalizeClaimedMaturedResult(claimedMatured) {
  return {
    principal: claimedMatured?.[0] ?? claimedMatured?.usgdPrincipalOut ?? 0n,
    yieldAmount: claimedMatured?.[1] ?? claimedMatured?.usgdYield ?? 0n,
  };
}

function normalizePendingGdlResult(pendingGdl) {
  if (typeof pendingGdl === "bigint") return pendingGdl;
  return pendingGdl?.[0] ?? pendingGdl?.gdlOut ?? 0n;
}

function resolveDisplayedPayoutPrincipal(purchase) {
  const claimedPrincipal = purchase.claimedMatured?.principal ?? 0n;
  if (claimedPrincipal > 0n) return claimedPrincipal;
  const pendingPrincipal = purchase.pendingMatured?.principal ?? 0n;
  if (pendingPrincipal > 0n) return pendingPrincipal;
  return purchase.usgdPrincipalGross ?? 0n;
}

function resolveDisplayedPayoutYield(purchase) {
  const claimedYield = purchase.claimedMatured?.yieldAmount ?? 0n;
  if (claimedYield > 0n) return claimedYield;
  return purchase.pendingMatured?.yieldAmount ?? 0n;
}

export default function FundPage() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { address, chainId, connect, getSigner } = useWallet();
  const pageT = useCallback((key, options) => t(`fund.page.${key}`, options), [t]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [claimingMaturedId, setClaimingMaturedId] = useState("");
  const [claimingGdlId, setClaimingGdlId] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [selectedTermType, setSelectedTermType] = useState(0);
  const [recordFilter, setRecordFilter] = useState("ongoing");
  const [refreshNonce, setRefreshNonce] = useState(0);
  const purchaseIdsRef = useRef([]);
  const pendingRefreshRef = useRef(false);

  const [fundState, setFundState] = useState({
    paused: false,
    blacklisted: false,
    godlBalance: 0n,
    minPurchase: parseTokenAmount("0.1"),
    releaseStepSeconds: 0n,
    spotGodlPrice: 0n,
    spotGdlPrice: 0n,
    gdlBonusMultiplierBps: DEFAULT_GDL_BONUS_MULTIPLIER_BPS,
    terms: {},
    purchases: [],
  });

  const loadSpotPrice = useCallback(async (router, tokenIn, tokenOut) => {
    try {
      const amounts = await router.getAmountsOut(ONE_E18, [tokenIn, tokenOut]);
      return amounts?.[amounts.length - 1] ?? 0n;
    } catch {
      return 0n;
    }
  }, []);

  const reloadFundData = useCallback(async () => {
    setLoading(true);
    const readProvider = getReadProvider();
    const contracts = createCoreContracts(readProvider);

    try {
      await validateCoreContractAddresses(readProvider, { includeRouter: true });

      const [paused, minPurchase, releaseStepSeconds, gdlBonusMultiplier, nextPurchaseId, rawTerms, spotGodlPrice, spotGdlPrice] =
        await Promise.all([
          contracts.gold.paused(),
          contracts.gold.MIN_PURCHASE_GODL().catch(() => parseTokenAmount("0.1")),
          contracts.gold.GDL_RELEASE_STEP_SECONDS().catch(() => 0n),
          contracts.gold.gdlBonusMultiplierBps().catch(() => 10000n),
          contracts.gold.nextPurchaseId(),
          Promise.all(GOLD_TERM_OPTIONS.map(async ({ termType }) => [termType, await contracts.gold.termConfigs(termType)])),
          loadSpotPrice(contracts.router, ADDRESSES.godl, ADDRESSES.usgd),
          loadSpotPrice(contracts.router, ADDRESSES.gdl, ADDRESSES.usgd),
        ]);

      const terms = Object.fromEntries(rawTerms.map(([termType, termConfig]) => [termType, normalizeTermConfig(termConfig)]));

      let blacklisted = false;
      let godlBalance = 0n;
      let purchases = [];

      if (address) {
        [blacklisted, godlBalance] = await Promise.all([contracts.gold.blacklisted(address), contracts.godl.balanceOf(address).catch(() => 0n)]);

        const ids = [];
        for (let id = 1n; id < nextPurchaseId; id += 1n) {
          ids.push(id);
        }

        if (ids.length > 0) {
          const purchaseRecords = await Promise.all(
            ids.map(async (id) => ({
              id,
              detail: await contracts.gold.purchases(id),
            })),
          );

          const ownerLower = address.toLowerCase();
          const ownedPurchases = purchaseRecords.filter(
            (item) => item.detail.owner && String(item.detail.owner).toLowerCase() === ownerLower,
          );

          const pendingRecords = await Promise.all(
            ownedPurchases.map(async ({ id }) => {
              const [pendingMatured, pendingGdl] = await Promise.all([
                contracts.gold.pendingMatured(id),
                contracts.gold.pendingGdl(id),
              ]);
              return {
                id,
                pendingMatured: normalizePendingMaturedResult(pendingMatured),
                pendingGdl: normalizePendingGdlResult(pendingGdl),
              };
            }),
          );

          const pendingMap = new Map(pendingRecords.map((item) => [item.id.toString(), item]));
          const claimedMaturedRecords = await Promise.all(
            ownedPurchases
              .filter(({ detail }) => detail.maturedClaimed)
              .map(async ({ id }) => {
                try {
                  const logs = await contracts.gold.queryFilter(contracts.gold.filters.MaturedClaimed(id));
                  const latestLog = logs[logs.length - 1];
                  const claimedMatured = normalizeClaimedMaturedResult(latestLog?.args);
                  return [id.toString(), claimedMatured];
                } catch {
                  return [id.toString(), ZERO_PENDING_MATURED];
                }
              }),
          );
          const claimedMaturedMap = new Map(claimedMaturedRecords);

          purchases = ownedPurchases
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
                gdlBonusCapUsdE18: detail.gdlBonusCapUsdE18,
                maturedClaimed: detail.maturedClaimed,
                settlementAdjustmentUsgd: detail.settlementAdjustmentUsgd,
                claimedGdlValueUsdE18: detail.claimedGdlValueUsdE18,
                claimedMatured: claimedMaturedMap.get(id.toString()) ?? ZERO_PENDING_MATURED,
                pendingMatured: pending?.pendingMatured ?? ZERO_PENDING_MATURED,
                pendingGdl: pending?.pendingGdl ?? 0n,
              };
            })
            .sort((a, b) => Number(b.id - a.id));
        }
      }

      setFundState({
        paused,
        blacklisted,
        godlBalance,
        minPurchase,
        releaseStepSeconds,
        spotGodlPrice,
        spotGdlPrice,
        gdlBonusMultiplierBps: toPositiveInt(gdlBonusMultiplier) || DEFAULT_GDL_BONUS_MULTIPLIER_BPS,
        terms,
        purchases,
      });
    } catch (error) {
      notify({ type: "error", message: toErrorMessage(error, pageT("errors.loadData")) });
    } finally {
      setLoading(false);
    }
  }, [address, loadSpotPrice, notify, pageT]);

  useEffect(() => {
    reloadFundData();
  }, [reloadFundData, refreshNonce]);

  useEffect(() => {
    purchaseIdsRef.current = fundState.purchases.map((purchase) => purchase.id);
  }, [fundState.purchases]);

  const refreshPendingRewards = useCallback(async () => {
    if (!address) return;

    const ids = purchaseIdsRef.current;
    if (!ids.length) return;

    const readProvider = getReadProvider();
    const contracts = createCoreContracts(readProvider);

    const entries = await Promise.all(
      ids.map(async (id) => {
        try {
          const [pendingMatured, pendingGdl] = await Promise.all([contracts.gold.pendingMatured(id), contracts.gold.pendingGdl(id)]);
          return [
            id.toString(),
            {
              pendingMatured: normalizePendingMaturedResult(pendingMatured),
              pendingGdl: normalizePendingGdlResult(pendingGdl),
            },
          ];
        } catch {
          return [id.toString(), null];
        }
      }),
    );

    const pendingMap = new Map(entries.filter(([, value]) => value !== null));
    if (pendingMap.size === 0) return;

    setFundState((prev) => ({
      ...prev,
      purchases: prev.purchases.map((purchase) => {
        const next = pendingMap.get(purchase.id.toString());
        if (!next) return purchase;
        return {
          ...purchase,
          pendingMatured: next.pendingMatured,
          pendingGdl: next.pendingGdl,
        };
      }),
    }));
  }, [address]);

  useEffect(() => {
    if (!address || fundState.purchases.length === 0 || typeof document === "undefined") return undefined;

    const runRefresh = async () => {
      if (document.hidden || pendingRefreshRef.current) return;
      pendingRefreshRef.current = true;
      try {
        await refreshPendingRewards();
      } finally {
        pendingRefreshRef.current = false;
      }
    };

    runRefresh().catch(() => {});
    const timer = window.setInterval(() => {
      runRefresh().catch(() => {});
    }, 15000);
    const onWake = () => {
      runRefresh().catch(() => {});
    };

    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
    };
  }, [address, fundState.purchases.length, refreshPendingRewards]);

  const activeTerm = fundState.terms[selectedTermType] ?? {
    duration: 0n,
    yieldDuration: 0n,
    months: 3,
    apyBps: 0,
    gdlBonusBps: 0,
  };

  const activeTermEffectiveGdlBonusBps = useMemo(
    () =>
      getEffectiveGdlBonusBps(
        activeTerm.months ?? 0,
        activeTerm.gdlBonusBps ?? 0,
        fundState.gdlBonusMultiplierBps ?? DEFAULT_GDL_BONUS_MULTIPLIER_BPS,
      ),
    [activeTerm.gdlBonusBps, activeTerm.months, fundState.gdlBonusMultiplierBps],
  );

  const parsedAmount = useMemo(() => {
    try {
      return parseTokenAmount(amountInput);
    } catch {
      return 0n;
    }
  }, [amountInput]);

  const handleAdjustPurchaseAmount = useCallback((direction) => {
    const step = parseTokenAmount("0.1");
    setAmountInput((prev) => {
      let current = 0n;
      try {
        current = parseTokenAmount(prev || "0");
      } catch {
        current = 0n;
      }
      const next = direction === "up" ? current + step : current > step ? current - step : 0n;
      return toInputAmount(next, 18);
    });
  }, []);

  const handleSetPurchaseMax = useCallback(() => {
    setAmountInput(toInputAmount(fundState.godlBalance, 18));
  }, [fundState.godlBalance]);

  const estimate = useMemo(
    () =>
      estimatePurchase(
        parsedAmount,
        fundState.spotGodlPrice,
        activeTerm.duration ?? 0n,
        activeTerm.yieldDuration ?? 0n,
        activeTerm.months ?? 3,
        activeTerm.apyBps ?? 0,
        activeTermEffectiveGdlBonusBps,
        fundState.spotGdlPrice,
      ),
    [
      activeTerm.apyBps,
      activeTerm.duration,
      activeTermEffectiveGdlBonusBps,
      activeTerm.months,
      activeTerm.yieldDuration,
      fundState.spotGdlPrice,
      fundState.spotGodlPrice,
      parsedAmount,
    ],
  );

  const totals = useMemo(() => {
    const nowTs = BigInt(Math.floor(Date.now() / 1000));
    return fundState.purchases.reduce(
      (acc, purchase) => {
        const termConfig = fundState.terms[purchase.termType];
        const settledPrincipal = purchase.maturedClaimed
          ? resolveDisplayedPayoutPrincipal(purchase)
          : purchase.pendingMatured.principal;
        const settledYield = purchase.maturedClaimed
          ? resolveDisplayedPayoutYield(purchase)
          : purchase.pendingMatured.yieldAmount;
        const adjustedGdlBonusCapUsd = normalizeRewardUsdForDisplay(
          purchase.gdlBonusCapUsdE18,
          termConfig?.months ?? 0,
          termConfig?.gdlBonusBps ?? 0,
          fundState.gdlBonusMultiplierBps,
        );
        const adjustedClaimedGdlValueUsd = normalizeRewardUsdForDisplay(
          purchase.claimedGdlValueUsdE18,
          termConfig?.months ?? 0,
          termConfig?.gdlBonusBps ?? 0,
          fundState.gdlBonusMultiplierBps,
        );
        const pendingGdlUsdRaw = convertGdlToUsd(purchase.pendingGdl, fundState.spotGdlPrice);
        const pendingGdlUsd = normalizeRewardUsdForDisplay(
          pendingGdlUsdRaw,
          termConfig?.months ?? 0,
          termConfig?.gdlBonusBps ?? 0,
          fundState.gdlBonusMultiplierBps,
        );
        const capRemainingGdlUsd =
          adjustedGdlBonusCapUsd > adjustedClaimedGdlValueUsd ? adjustedGdlBonusCapUsd - adjustedClaimedGdlValueUsd : 0n;
        const displayClaimableGdlUsd = nowTs >= (purchase.endAt ?? 0n) ? capRemainingGdlUsd : pendingGdlUsd;

        if (!purchase.maturedClaimed) {
          acc.principal += purchase.usgdPrincipalGross;
        }
        acc.maturedUsgd += settledPrincipal + settledYield;
        acc.pendingGdl += purchase.pendingGdl;
        acc.pendingGdlUsd += displayClaimableGdlUsd;
        acc.maturedWithGdlValue += settledPrincipal + settledYield + displayClaimableGdlUsd;
        acc.adjustedGdlBonusCapUsd += adjustedGdlBonusCapUsd;
        return acc;
      },
      { principal: 0n, maturedUsgd: 0n, pendingGdl: 0n, pendingGdlUsd: 0n, maturedWithGdlValue: 0n, adjustedGdlBonusCapUsd: 0n },
    );
  }, [fundState.gdlBonusMultiplierBps, fundState.purchases, fundState.spotGdlPrice, fundState.terms]);

  const filteredPurchases = useMemo(() => {
    if (recordFilter === "completed") {
      return fundState.purchases.filter((purchase) => purchase.maturedClaimed);
    }
    return fundState.purchases.filter((purchase) => !purchase.maturedClaimed);
  }, [fundState.purchases, recordFilter]);

  const canWrite = useMemo(() => {
    if (!address) return false;
    if (!isExpectedChain(chainId)) return false;
    if (fundState.paused) return false;
    if (fundState.blacklisted) return false;
    return true;
  }, [address, chainId, fundState.blacklisted, fundState.paused]);

  const writeBlockReason = useMemo(() => {
    if (!address) return pageT("errors.connectWalletFirst");
    if (!isExpectedChain(chainId)) return pageT("errors.switchNetwork", { chainId: TBSC_CHAIN_ID });
    if (fundState.paused) return pageT("errors.paused");
    if (fundState.blacklisted) return pageT("errors.blacklisted");
    return "";
  }, [address, chainId, fundState.blacklisted, fundState.paused, pageT]);

  const ensureSigner = useCallback(async () => {
    let currentAddress = address;
    if (!currentAddress) {
      try {
        currentAddress = await connect();
      } catch (error) {
        notify({ type: "error", message: toErrorMessage(error, pageT("errors.connectWalletFirst")) });
        return null;
      }
    }
    if (!currentAddress) return null;

    const signer = await getSigner();
    if (!signer) return null;

    const network = await signer.provider.getNetwork();
    if (Number(network.chainId) !== TBSC_CHAIN_ID) {
      notify({ type: "error", message: pageT("errors.switchNetwork", { chainId: TBSC_CHAIN_ID }) });
      return null;
    }

    try {
      await validateCoreContractAddresses(getReadProvider(), { includeRouter: true });
    } catch (error) {
      notify({ type: "error", message: toErrorMessage(error, pageT("errors.actionNotAllowed")) });
      return null;
    }

    return { signer, currentAddress };
  }, [address, connect, getSigner, notify, pageT]);

  const handlePurchase = async () => {
    if (submitting) return;

    let amount;
    try {
      amount = parseTokenAmount(amountInput);
    } catch {
      notify({ type: "error", message: pageT("errors.invalidGodlAmount") });
      return;
    }

    if (amount <= 0n) {
      notify({ type: "error", message: pageT("errors.invalidGodlAmount") });
      return;
    }

    if (amount < fundState.minPurchase) {
      notify({
        type: "error",
        message: pageT("errors.minPurchase", { amount: formatTokenAmount(fundState.minPurchase) }),
      });
      return;
    }

    const signerContext = await ensureSigner();
    if (!signerContext) return;

    if (!canWrite) {
      notify({ type: "error", message: writeBlockReason || pageT("errors.actionNotAllowed") });
      return;
    }

    setSubmitting(true);
    try {
      const contracts = createCoreContracts(signerContext.signer);
      const allowance = await contracts.godl.allowance(signerContext.currentAddress, ADDRESSES.goldProxy);

      if (allowance < amount) {
        notify({ type: "info", message: pageT("notices.approvingGodl") });
        if (allowance > 0n) {
          const resetApproveTx = await contracts.godl.approve(ADDRESSES.goldProxy, 0n);
          await resetApproveTx.wait();
        }
        const approveTx = await contracts.godl.approve(ADDRESSES.goldProxy, amount);
        await approveTx.wait();
      }

      let minUsgdOut = 0n;
      try {
        const quote = await contracts.router.getAmountsOut(amount, [ADDRESSES.godl, ADDRESSES.usgd]);
        const expectedOut = quote?.[quote.length - 1] ?? 0n;
        minUsgdOut = expectedOut > 0n ? (expectedOut * 9500n) / 10000n : 0n;
      } catch {}

      const tx =
        minUsgdOut > 0n
          ? await contracts.gold["purchase(uint256,uint256,uint256)"](amount, selectedTermType, minUsgdOut)
          : await contracts.gold["purchase(uint256,uint256)"](amount, selectedTermType);

      await tx.wait();
      notify({ type: "success", message: pageT("notices.purchaseSuccess") });

      setAmountInput("");
      setRefreshNonce((prev) => prev + 1);
    } catch (error) {
      notify({ type: "error", message: toErrorMessage(error, pageT("errors.purchaseFailed")) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaimMatured = async (purchaseId) => {
    if (claimingMaturedId) return;

    const signerContext = await ensureSigner();
    if (!signerContext) return;

    if (!canWrite) {
      notify({ type: "error", message: writeBlockReason || pageT("errors.actionNotAllowed") });
      return;
    }

    setClaimingMaturedId(purchaseId.toString());
    try {
      const contracts = createCoreContracts(signerContext.signer);
      const tx = await contracts.gold.claimMatured(purchaseId);
      await tx.wait();
      notify({ type: "success", message: pageT("notices.maturedClaimSuccess") });
      setRefreshNonce((prev) => prev + 1);
    } catch (error) {
      notify({ type: "error", message: toErrorMessage(error, pageT("errors.maturedClaimFailed")) });
    } finally {
      setClaimingMaturedId("");
    }
  };

  const handleClaimGdl = async (purchaseId) => {
    if (claimingGdlId) return;

    const signerContext = await ensureSigner();
    if (!signerContext) return;

    if (!canWrite) {
      notify({ type: "error", message: writeBlockReason || pageT("errors.actionNotAllowed") });
      return;
    }

    setClaimingGdlId(purchaseId.toString());
    try {
      const contracts = createCoreContracts(signerContext.signer);
      const tx = await contracts.gold.claimGdl(purchaseId);
      await tx.wait();
      notify({ type: "success", message: pageT("notices.gdlClaimSuccess") });
      setRefreshNonce((prev) => prev + 1);
    } catch (error) {
      notify({ type: "error", message: toErrorMessage(error, pageT("errors.gdlClaimFailed")) });
    } finally {
      setClaimingGdlId("");
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
            {pageT("warnings.networkMismatch")}
          </div>
        )}

        <article className="governance-panel mt-6 rounded-[28px] p-5 md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">GoldStakingProtocol</p>
              <p className="text-xl font-semibold text-white">{pageT("header.contractMode")}</p>
              <p className="text-sm text-slate-400">
                {pageT("header.currentPrice")}: {" "}
                <span className="font-semibold text-[#fcd535]">
                  {fundState.spotGodlPrice > 0n ? `${formatTokenAmount(fundState.spotGodlPrice)} USGD / GODL` : "-"}
                </span>
              </p>
              <p className="text-sm text-slate-400">
                {pageT("header.gdlPrice")}: {" "}
                <span className="font-semibold text-[#f0cd54]">
                  {fundState.spotGdlPrice > 0n ? `${formatTokenAmount(fundState.spotGdlPrice)} USGD / GDL` : "-"}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {GOLD_TERM_OPTIONS.map(({ termType, label }) => {
              const config = fundState.terms[termType];
              const active = selectedTermType === termType;
              const termLabel = config?.months ? pageT("labels.termMonths", { months: config.months }) : label;
              const displayGdlBonusBps = config
                ? getEffectiveGdlBonusBps(
                    config.months ?? 0,
                    config.gdlBonusBps ?? 0,
                    fundState.gdlBonusMultiplierBps ?? DEFAULT_GDL_BONUS_MULTIPLIER_BPS,
                  )
                : 0;

              return (
                <button
                  key={termType}
                  type="button"
                  onClick={() => setSelectedTermType(termType)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    active ? "border-[#fcd535]/40 bg-[#fcd535]/12" : "border-white/10 bg-white/5 hover:border-white/25"
                  }`}
                >
                  <p className="text-sm font-semibold text-white">{termLabel}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    APY {config ? formatBps(config.apyBps) : "-"} / GDL Bonus {config ? `${(displayGdlBonusBps / 10000).toFixed(2)}x` : "-"}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px]">
            <label className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500">{pageT("fields.godlAmount")}</p>
                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleAdjustPurchaseAmount("down")}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-200 transition hover:border-white/30 hover:text-white"
                  >
                    <Icon icon="mdi:minus" width="14" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustPurchaseAmount("up")}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-200 transition hover:border-white/30 hover:text-white"
                  >
                    <Icon icon="mdi:plus" width="14" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSetPurchaseMax}
                    className="rounded-md border border-[#fcd535]/30 bg-[#fcd535]/10 px-2 py-0.5 text-[11px] font-semibold text-[#f0cd54] transition hover:bg-[#fcd535]/18"
                  >
                    MAX
                  </button>
                </div>
              </div>
              <input
                type="number"
                min="0"
                step="any"
                value={amountInput}
                onChange={(event) => setAmountInput(event.target.value)}
                placeholder="0.0"
                className="no-number-spin mt-1 h-8 w-full bg-transparent text-lg font-semibold text-white outline-none placeholder:text-slate-500"
              />
            </label>

            <button
              type="button"
              onClick={handlePurchase}
              disabled={submitting || !amountInput}
              className={`h-full min-h-[72px] rounded-2xl text-sm font-semibold transition ${
                submitting || !amountInput
                  ? "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
                  : "morgan-btn-primary border-0 text-[#111111]"
              }`}
            >
              {submitting ? pageT("actions.processing") : pageT("actions.approveAndPurchase")}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
            <div className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#fcd535]/25 bg-[#fcd535]/10 px-3 text-sm text-[#f0cd54]">
              <span className="text-xs text-slate-300">{pageT("header.godlBalance")}</span>
              <span className="font-semibold">
                {address ? `${formatTokenAmount(fundState.godlBalance, 18, 6)} GODL` : "--"}
              </span>
            </div>

            <Link
              to="/swap?route=usgd-godl"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[#fcd535]/35 bg-[#fcd535]/12 px-3 text-xs font-semibold text-[#f0cd54] transition hover:bg-[#fcd535]/20"
            >
              {pageT("actions.goSwapGodl")}
            </Link>

            <button
              type="button"
              onClick={() => setRefreshNonce((prev) => prev + 1)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-200 transition hover:border-white/25 hover:text-white"
            >
              <Icon icon="mdi:refresh" width="16" />
              {pageT("actions.refresh")}
            </button>
          </div>

          <div className="mt-4 grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300 md:grid-cols-3">
            <p>
              {pageT("estimates.principal")}: <span className="font-semibold text-white">{formatTokenAmount(estimate.principal)} USGD</span>
            </p>
            <p>
              {pageT("estimates.upfrontFee")}:{" "}
              <span className="font-semibold text-rose-300">{formatTokenAmount(estimate.upfrontFee)} USGD</span>
            </p>
            <p>
              {pageT("estimates.principalOut")}:{" "}
              <span className="font-semibold text-[#f0cd54]">{formatTokenAmount(estimate.maturityOut)} USGD</span>
            </p>
            <p>
              {pageT("estimates.yieldTotal")}:{" "}
              <span className="font-semibold text-emerald-300">{formatTokenAmount(estimate.yieldTotal)} USGD</span>
            </p>
            <p>
              {pageT("estimates.gdlBonusUsd")}:{" "}
              <span className="font-semibold text-emerald-300">{formatTokenAmount(estimate.gdlBonusUsd)} USGD</span>
            </p>
            <p>
              {pageT("estimates.gdlBonus")}: <span className="font-semibold text-[#fcd535]">{formatTokenAmount(estimate.gdlOut)} GDL</span>
            </p>
            <p>
              {pageT("estimates.totalWithGdlBonus")}:{" "}
              <span className="font-semibold text-[#fcd535]">{formatTokenAmount(estimate.totalWithGdlBonus)} USGD</span>
            </p>
          </div>

          {!canWrite && <p className="mt-3 text-xs text-amber-300">{writeBlockReason}</p>}
        </article>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="governance-panel-soft rounded-3xl p-5">
            <p className="text-sm text-slate-500">{pageT("summary.principal")}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{formatTokenAmount(totals.principal)} USGD</p>
            <p className="mt-2 text-xs text-slate-500">
              {pageT("fields.gdlBonusCapUsd")}: {formatTokenAmount(totals.adjustedGdlBonusCapUsd)} USGD
            </p>
          </article>
          <article className="governance-panel-soft rounded-3xl p-5">
            <p className="text-sm text-slate-500">{pageT("summary.pendingGdl")}</p>
            <p className="mt-2 text-3xl font-semibold text-[#fcd535]">{formatTokenAmount(totals.pendingGdl)} GDL</p>
            <p className="mt-2 text-xs text-slate-500">
              {pageT("estimates.gdlBonusUsd")}: {formatTokenAmount(totals.pendingGdlUsd)} USGD
            </p>
          </article>
          <article className="governance-panel-soft rounded-3xl p-5">
            <p className="text-sm text-slate-500">{pageT("summary.maturedWithGdl")}</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">{formatTokenAmount(totals.maturedWithGdlValue)} USGD</p>
            <p className="mt-2 text-xs text-slate-500">
              {pageT("summary.maturedClaimable")}: {formatTokenAmount(totals.maturedUsgd)} USGD
            </p>
          </article>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRecordFilter("ongoing")}
            className={`px-4 py-1.5 text-sm ${
              recordFilter === "ongoing" ? "morgan-btn-primary border-0 text-[#111111]" : "morgan-btn-secondary text-slate-300"
            }`}
          >
            {pageT("filters.ongoing")}
          </button>
          <button
            type="button"
            onClick={() => setRecordFilter("completed")}
            className={`px-4 py-1.5 text-sm ${
              recordFilter === "completed" ? "morgan-btn-primary border-0 text-[#111111]" : "morgan-btn-secondary text-slate-300"
            }`}
          >
            {pageT("filters.completed")}
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="governance-panel rounded-[28px] px-6 py-10 text-center text-slate-400">{pageT("states.loading")}</div>
          ) : !address ? (
            <div className="governance-panel rounded-[28px] px-6 py-10 text-center text-slate-400">{pageT("states.connectToView")}</div>
          ) : filteredPurchases.length === 0 ? (
            <div className="governance-panel rounded-[28px] px-6 py-10 text-center text-slate-400">{pageT("states.empty")}</div>
          ) : (
            filteredPurchases.map((purchase) => {
              const termConfig = fundState.terms[purchase.termType];
              const nowTs = BigInt(Math.floor(Date.now() / 1000));
              const effectiveBonusBps = getEffectiveGdlBonusBps(
                termConfig?.months ?? 0,
                termConfig?.gdlBonusBps ?? 0,
                fundState.gdlBonusMultiplierBps ?? DEFAULT_GDL_BONUS_MULTIPLIER_BPS,
              );
              const adjustedGdlBonusCapUsd = normalizeRewardUsdForDisplay(
                purchase.gdlBonusCapUsdE18,
                termConfig?.months ?? 0,
                termConfig?.gdlBonusBps ?? 0,
                fundState.gdlBonusMultiplierBps,
              );
              const adjustedClaimedGdlValueUsd = normalizeRewardUsdForDisplay(
                purchase.claimedGdlValueUsdE18,
                termConfig?.months ?? 0,
                termConfig?.gdlBonusBps ?? 0,
                fundState.gdlBonusMultiplierBps,
              );
              const pendingGdlValueUsd = normalizeRewardUsdForDisplay(
                convertGdlToUsd(purchase.pendingGdl, fundState.spotGdlPrice),
                termConfig?.months ?? 0,
                termConfig?.gdlBonusBps ?? 0,
                fundState.gdlBonusMultiplierBps,
              );
              const capRemainingGdlValueUsd =
                adjustedGdlBonusCapUsd > adjustedClaimedGdlValueUsd ? adjustedGdlBonusCapUsd - adjustedClaimedGdlValueUsd : 0n;
              const displayClaimableGdlValueUsd = nowTs >= (purchase.endAt ?? 0n) ? capRemainingGdlValueUsd : pendingGdlValueUsd;
              const displayedPayoutPrincipal = purchase.maturedClaimed
                ? resolveDisplayedPayoutPrincipal(purchase)
                : purchase.pendingMatured.principal;
              const displayedPayoutYield = purchase.maturedClaimed
                ? resolveDisplayedPayoutYield(purchase)
                : purchase.pendingMatured.yieldAmount;
              const subscribedPrincipal = purchase.usgdPrincipalGross ?? 0n;
              const claimableTotalWithGdl =
                (purchase.maturedClaimed
                  ? displayedPayoutPrincipal + displayedPayoutYield
                  : purchase.pendingMatured.principal + purchase.pendingMatured.yieldAmount) + displayClaimableGdlValueUsd;
              const claimedPrincipal = purchase.maturedClaimed ? displayedPayoutPrincipal : 0n;
              const claimedYield = purchase.maturedClaimed ? displayedPayoutYield : 0n;
              const claimedPrincipalAndYield = claimedPrincipal + claimedYield;
              const maturedReady =
                !purchase.maturedClaimed && (purchase.pendingMatured.principal > 0n || purchase.pendingMatured.yieldAmount > 0n);
              const gdlReady = purchase.pendingGdl > 0n;
              const isClaimingMatured = claimingMaturedId === purchase.id.toString();
              const isClaimingGdl = claimingGdlId === purchase.id.toString();

              return (
                <article key={purchase.id.toString()} className="governance-panel overflow-hidden rounded-[28px]">
                  <div className="border-b border-white/10 p-5 md:p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-white">{pageT("labels.recordTitle")}</h2>
                        <p className="mt-2 text-sm text-slate-400">
                          {pageT("labels.term")}: {termConfig?.months ?? "-"} {pageT("labels.months")} · APY:{" "}
                          {termConfig ? formatBps(termConfig.apyBps) : "-"} · GDL Bonus:{" "}
                          {termConfig ? `${(effectiveBonusBps / 10000).toFixed(2)}x` : "-"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold ${
                          purchase.maturedClaimed
                            ? "border border-white/15 bg-white/5 text-slate-300"
                            : "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        }`}
                      >
                        {purchase.maturedClaimed ? pageT("status.maturedDone") : pageT("status.ongoing")}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
                    <div className="governance-panel-soft rounded-3xl p-5">
                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <Icon icon="mdi:bank-transfer" width="16" className="text-[#fcd535]" />
                        {pageT("sections.maturedClaim")}
                      </p>
                      <div className="mt-4 space-y-2 text-sm text-slate-400">
                        <p>
                          {pageT("fields.subscribedGodl")}:{" "}
                          <span className="font-semibold text-white">{formatTokenAmount(purchase.godlAmount)} GODL</span>
                        </p>
                        <p>
                          {pageT("fields.subscribedPrincipal")}:{" "}
                          <span className="font-semibold text-white">{formatTokenAmount(subscribedPrincipal)} USGD</span>
                        </p>
                        <p>
                          {pageT("fields.upfrontFee")}:{" "}
                          <span className="font-semibold text-rose-300">{formatTokenAmount(purchase.upfrontFeeUsgd)} USGD</span>
                        </p>
                        <p>
                          {pageT("fields.maturityTime")}: <span className="font-semibold text-slate-200">{formatTimestamp(purchase.endAt)}</span>
                        </p>
                        {purchase.maturedClaimed ? (
                          <>
                            <p>
                              {pageT("fields.claimedPrincipal")}:{" "}
                              <span className="font-semibold text-[#f0cd54]">{formatTokenAmount(claimedPrincipal)} USGD</span>
                            </p>
                            <p>
                              {pageT("fields.claimedYield")}:{" "}
                              <span className="font-semibold text-emerald-300">{formatTokenAmount(claimedYield)} USGD</span>
                            </p>
                            <p>
                              {pageT("fields.claimedPrincipalAndYield")}:{" "}
                              <span className="font-semibold text-emerald-300">{formatTokenAmount(claimedPrincipalAndYield)} USGD</span>
                            </p>
                          </>
                        ) : (
                          <>
                            <p>
                              {pageT("fields.claimablePrincipal")}:{" "}
                              <span className="font-semibold text-[#f0cd54]">{formatTokenAmount(purchase.pendingMatured.principal)} USGD</span>
                            </p>
                            <p>
                              {pageT("fields.claimableYield")}:{" "}
                              <span className="font-semibold text-emerald-300">{formatTokenAmount(purchase.pendingMatured.yieldAmount)} USGD</span>
                            </p>
                          </>
                        )}
                        <p>
                          {pageT("fields.claimableGdlValue")}:{" "}
                          <span className="font-semibold text-[#f0cd54]">{formatTokenAmount(displayClaimableGdlValueUsd)} USGD</span>
                        </p>
                        <p>
                          {pageT("fields.claimableTotalWithGdl")}:{" "}
                          <span className="font-semibold text-[#fcd535]">{formatTokenAmount(claimableTotalWithGdl)} USGD</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleClaimMatured(purchase.id)}
                        disabled={!maturedReady || isClaimingMatured || !canWrite}
                        className={`mt-5 h-12 w-full rounded-2xl text-sm font-semibold transition ${
                          maturedReady && !isClaimingMatured && canWrite
                            ? "morgan-btn-primary border-0 text-[#111111]"
                            : "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
                        }`}
                      >
                        {isClaimingMatured ? pageT("actions.processing") : pageT("actions.claimMatured")}
                      </button>
                    </div>

                    <div className="governance-panel-soft rounded-3xl p-5">
                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <Icon icon="mdi:cash-plus" width="16" className="text-[#fcd535]" />
                        {pageT("sections.gdlClaim")}
                      </p>

                      <div className="mt-4 space-y-2 text-sm text-slate-400">
                        <p>
                          {pageT("fields.gdlBonusCapUsd")}:{" "}
                          <span className="font-semibold text-slate-200">{formatTokenAmount(adjustedGdlBonusCapUsd)} USGD</span>
                        </p>
                        <p>
                          {pageT("fields.claimedGdlValueUsd")}:{" "}
                          <span className="font-semibold text-slate-200">{formatTokenAmount(adjustedClaimedGdlValueUsd)} USGD</span>
                        </p>
                        <p>
                          {pageT("fields.claimableGdl")}:{" "}
                          <span className="font-semibold text-[#f0cd54]">{formatTokenAmount(purchase.pendingGdl)} GDL</span>
                        </p>
                        <p>
                          {pageT("fields.releaseStep")}: <span className="font-semibold text-slate-200">{String(fundState.releaseStepSeconds)}s</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleClaimGdl(purchase.id)}
                        disabled={!gdlReady || isClaimingGdl || !canWrite}
                        className={`mt-5 h-12 w-full rounded-2xl text-sm font-semibold transition ${
                          gdlReady && !isClaimingGdl && canWrite
                            ? "border border-[#fcd535]/35 bg-[#fcd535]/10 text-[#f0cd54] hover:bg-[#fcd535]/15"
                            : "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
                        }`}
                      >
                        {isClaimingGdl ? pageT("actions.processing") : pageT("actions.claimGdl")}
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
