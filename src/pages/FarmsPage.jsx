import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { MaxUint256, formatUnits } from "ethers";
import { useTranslation } from "react-i18next";
import { useNotification } from "../components/Notification";
import { useWallet } from "../contexts/WalletContext";
import { ADDRESSES, LP_POOLS, TBSC_CHAIN_ID } from "../web3/config";
import { getReadProvider, isExpectedChain } from "../web3/client";
import { assertContractCode, createCoreContracts, createErc20Contract, createPairContract, validateCoreContractAddresses } from "../web3/contracts";
import { formatTokenAmount, parseTokenAmount, toErrorMessage } from "../web3/format";

const tokenVisualMap = {
  usgd: { icon: "mdi:shield-check", bg: "bg-cyan-500", text: "text-white" },
  usdt: { icon: "mdi:currency-usd", bg: "bg-emerald-500", text: "text-white" },
  godl: { icon: "mdi:gold", bg: "bg-amber-500", text: "text-white" },
  gdl: { icon: "mdi:chart-donut-variant", bg: "bg-orange-500", text: "text-white" },
};

const tokenAddressByKey = {
  usdt: ADDRESSES.usdt,
  usgd: ADDRESSES.usgd,
  godl: ADDRESSES.godl,
  gdl: ADDRESSES.gdl,
};

function createInitialLiquidityState() {
  return {
    open: false,
    mode: "add",
    loading: false,
    submitting: false,
    pool: null,
    tokenAKey: "",
    tokenBKey: "",
    tokenAAddress: "",
    tokenBAddress: "",
    tokenASymbol: "",
    tokenBSymbol: "",
    tokenADecimals: 18,
    tokenBDecimals: 18,
    balanceA: 0n,
    balanceB: 0n,
    reserveA: 0n,
    reserveB: 0n,
    amountA: "",
    amountB: "",
    lpBalance: 0n,
    totalLpSupply: 0n,
    lpAmount: "",
    expectedOutA: 0n,
    expectedOutB: 0n,
  };
}

function toInputAmount(value, decimals) {
  const raw = formatUnits(value ?? 0n, decimals);
  if (!raw.includes(".")) return raw;
  return raw.replace(/\.?0+$/, "");
}

function TokenStack({ tokens }) {
  const shownTokens = tokens.slice(0, 2);
  return (
    <div className="relative flex h-10 w-[56px] items-center">
      {shownTokens.map((token, index) => {
        const visual = tokenVisualMap[token] ?? tokenVisualMap.usgd;
        return (
          <span
            key={`${token}-${index}`}
            className={`absolute flex h-9 w-9 items-center justify-center rounded-full border border-black/30 ${visual.bg} ${visual.text}`}
            style={{ left: `${index * 16}px`, zIndex: shownTokens.length - index }}
          >
            <Icon icon={visual.icon} width="18" />
          </span>
        );
      })}
    </div>
  );
}

function formatPoolWeight(allocPoint) {
  const raw = Number(allocPoint ?? 0n);
  if (!Number.isFinite(raw)) return "-";
  const weight = raw / 1000;
  if (!Number.isFinite(weight)) return "-";
  return `${weight.toLocaleString("en-US", { maximumFractionDigits: 2 })}x`;
}

function estimatePoolApy(dailyReward, totalStaked, lpDecimals) {
  if (!dailyReward || dailyReward <= 0n || !totalStaked || totalStaked <= 0n) return null;

  const yearlyReward = Number(formatUnits(dailyReward * 365n, 18));
  const stakedLp = Number(formatUnits(totalStaked, lpDecimals));
  if (!Number.isFinite(yearlyReward) || !Number.isFinite(stakedLp) || stakedLp <= 0) {
    return null;
  }

  const apyPercent = (yearlyReward / stakedLp) * 100;
  return Number.isFinite(apyPercent) ? apyPercent : null;
}

export default function FarmsPage() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { address, chainId, connect, getSigner } = useWallet();
  const pageT = useCallback((key, options) => t(`defi.page.${key}`, options), [t]);

  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("active");
  const [onlyStaked, setOnlyStaked] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [amountInputs, setAmountInputs] = useState({});
  const [actionState, setActionState] = useState({ type: "", pid: -1 });
  const [liquidityState, setLiquidityState] = useState(createInitialLiquidityState);
  const pendingRefreshRef = useRef(false);

  const [farmState, setFarmState] = useState({
    paused: false,
    whitelistMode: false,
    whitelisted: true,
    blacklisted: false,
    startTimestamp: 0n,
    emittedTotal: 0n,
    currentDailyEmission: 0n,
    pools: [],
  });

  const loadFarmData = useCallback(async () => {
    setLoading(true);
    const readProvider = getReadProvider();
    const contracts = createCoreContracts(readProvider);

    try {
      await validateCoreContractAddresses(readProvider);
      const [paused, whitelistMode, startTimestamp, emittedTotal] = await Promise.all([
        contracts.lp.paused(),
        contracts.lp.whitelistMode(),
        contracts.lp.startTimestamp(),
        contracts.lp.emittedTotal(),
      ]);

      const nowTs = Math.floor(Date.now() / 1000);
      const startTs = Number(startTimestamp);
      const dayIndex = nowTs > startTs ? Math.floor((nowTs - startTs) / 86400) : 0;
      const currentDailyEmission = await contracts.lp.dailyEmission(dayIndex);

      let whitelisted = true;
      let blacklisted = false;

      if (address) {
        [whitelisted, blacklisted] = await Promise.all([
          contracts.lp.whitelisted(address),
          contracts.lp.blacklisted(address),
        ]);
      }

      const pools = await Promise.all(
        LP_POOLS.map(async (meta) => {
          const [poolInfo, poolEnabled] = await Promise.all([contracts.lp.pools(meta.pid), contracts.lp.poolEnabled(meta.pid).catch(() => true)]);
          const lpTokenAddress = String(poolInfo.lpToken);
          await assertContractCode(readProvider, lpTokenAddress, `${meta.pair} LP Token`);
          const lpTokenContract = createErc20Contract(lpTokenAddress, readProvider);
          const [lpDecimals, lpSymbol] = await Promise.all([
            lpTokenContract.decimals().catch(() => 18),
            lpTokenContract.symbol().catch(() => "LP"),
          ]);

          let walletBalance = 0n;
          let stakedAmount = 0n;
          let pending = 0n;

          if (address) {
            const [balance, user, pendingMining] = await Promise.all([
              lpTokenContract.balanceOf(address),
              contracts.lp.users(meta.pid, address),
              contracts.lp.pendingMining(meta.pid, address),
            ]);
            walletBalance = balance;
            stakedAmount = user.amount;
            pending = pendingMining;
          }

          return {
            ...meta,
            lpTokenAddress,
            lpSymbol,
            lpDecimals: Number(lpDecimals),
            allocPoint: poolInfo.allocPoint,
            totalStaked: poolInfo.totalStaked,
            poolEnabled,
            walletBalance,
            stakedAmount,
            pending,
            status: poolInfo.allocPoint > 0n ? "active" : "ended",
          };
        }),
      );

      const totalAlloc = pools.reduce((sum, pool) => sum + pool.allocPoint, 0n);
      const normalizedPools = pools.map((pool) => ({
        ...pool,
        dailyReward: totalAlloc > 0n ? (currentDailyEmission * pool.allocPoint) / totalAlloc : 0n,
        estimatedApy: estimatePoolApy(totalAlloc > 0n ? (currentDailyEmission * pool.allocPoint) / totalAlloc : 0n, pool.totalStaked, pool.lpDecimals),
      }));

      setFarmState({
        paused,
        whitelistMode,
        whitelisted,
        blacklisted,
        startTimestamp,
        emittedTotal,
        currentDailyEmission,
        pools: normalizedPools,
      });
    } catch (error) {
      notify({ type: "error", message: toErrorMessage(error, pageT("errors.loadData")) });
    } finally {
      setLoading(false);
    }
  }, [address, notify, pageT]);

  useEffect(() => {
    loadFarmData();
  }, [loadFarmData, refreshNonce]);

  const poolPids = useMemo(() => farmState.pools.map((pool) => pool.pid), [farmState.pools]);

  const refreshPendingRewards = useCallback(async () => {
    if (!address || poolPids.length === 0) return;

    const readProvider = getReadProvider();
    const contracts = createCoreContracts(readProvider);
    const entries = await Promise.all(
      poolPids.map(async (pid) => {
        try {
          const pending = await contracts.lp.pendingMining(pid, address);
          return [pid, pending];
        } catch {
          return [pid, null];
        }
      }),
    );

    const pendingMap = new Map(entries.filter(([, pending]) => pending !== null));
    if (pendingMap.size === 0) return;

    setFarmState((prev) => ({
      ...prev,
      pools: prev.pools.map((pool) => (pendingMap.has(pool.pid) ? { ...pool, pending: pendingMap.get(pool.pid) } : pool)),
    }));
  }, [address, poolPids]);

  useEffect(() => {
    if (!address || poolPids.length === 0 || typeof document === "undefined") return undefined;

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
  }, [address, poolPids.length, refreshPendingRewards]);

  const canWrite = useMemo(() => {
    if (!address) return false;
    if (!isExpectedChain(chainId)) return false;
    if (farmState.paused) return false;
    if (farmState.blacklisted) return false;
    if (farmState.whitelistMode && !farmState.whitelisted) return false;
    return true;
  }, [address, chainId, farmState.blacklisted, farmState.paused, farmState.whitelistMode, farmState.whitelisted]);

  const writeBlockReason = useMemo(() => {
    if (!address) return pageT("errors.connectWalletFirst");
    if (!isExpectedChain(chainId)) return pageT("errors.switchNetwork", { chainId: TBSC_CHAIN_ID });
    if (farmState.paused) return pageT("errors.paused");
    if (farmState.blacklisted) return pageT("errors.blacklisted");
    if (farmState.whitelistMode && !farmState.whitelisted) return pageT("errors.notWhitelisted");
    return "";
  }, [address, chainId, farmState.blacklisted, farmState.paused, farmState.whitelistMode, farmState.whitelisted, pageT]);

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

  const handleAmountChange = (pid, value) => {
    setAmountInputs((prev) => ({ ...prev, [pid]: value }));
  };

  const handleAdjustAmount = useCallback((pool, direction) => {
    const step = parseTokenAmount("0.1", pool.lpDecimals);
    setAmountInputs((prev) => {
      let current = 0n;
      try {
        current = parseTokenAmount(prev[pool.pid] || "0", pool.lpDecimals);
      } catch {
        current = 0n;
      }

      const next = direction === "up" ? current + step : current > step ? current - step : 0n;
      return { ...prev, [pool.pid]: toInputAmount(next, pool.lpDecimals) };
    });
  }, []);

  const handleSetStakeMax = useCallback((pool) => {
    setAmountInputs((prev) => ({
      ...prev,
      [pool.pid]: toInputAmount(pool.walletBalance, pool.lpDecimals),
    }));
  }, []);

  const executePoolAction = useCallback(
    async (pool, action) => {
      const rawInput = amountInputs[pool.pid];
      let amount = 0n;
      if (action !== "claim" && action !== "emergencyWithdraw") {
        try {
          amount = parseTokenAmount(rawInput, pool.lpDecimals);
        } catch {
          notify({ type: "error", message: pageT("errors.invalidAmount") });
          return;
        }
        if (amount <= 0n) {
          notify({ type: "error", message: pageT("errors.invalidAmount") });
          return;
        }
      }

      const signerContext = await ensureSigner();
      if (!signerContext) return;

      if (!canWrite) {
        notify({ type: "error", message: writeBlockReason || pageT("errors.actionNotAllowed") });
        return;
      }
      if (!pool.poolEnabled) {
        notify({ type: "error", message: pageT("errors.poolDisabled") });
        return;
      }

      setActionState({ type: action, pid: pool.pid });
      try {
        const contracts = createCoreContracts(signerContext.signer);
        const lpToken = createErc20Contract(pool.lpTokenAddress, signerContext.signer);

        if (action === "deposit") {
          const allowance = await lpToken.allowance(signerContext.currentAddress, ADDRESSES.lpProxy);
          if (allowance < amount) {
            notify({ type: "info", message: pageT("notices.approvingPool", { pair: pool.pair }) });
            const approveTx = await lpToken.approve(ADDRESSES.lpProxy, amount);
            await approveTx.wait();
          }

          const tx = await contracts.lp.deposit(pool.pid, amount);
          await tx.wait();
          notify({ type: "success", message: pageT("notices.depositSuccess", { pair: pool.pair }) });
        } else if (action === "withdraw") {
          const tx = await contracts.lp.withdraw(pool.pid, amount);
          await tx.wait();
          notify({ type: "success", message: pageT("notices.withdrawSuccess", { pair: pool.pair }) });
        } else if (action === "claim") {
          if (pool.pending <= 0n) {
            notify({ type: "info", message: pageT("notices.noClaimableReward") });
            return;
          }
          const tx = await contracts.lp.claim(pool.pid);
          await tx.wait();
          notify({ type: "success", message: pageT("notices.claimSuccess", { pair: pool.pair }) });
        } else if (action === "emergencyWithdraw") {
          if (pool.stakedAmount <= 0n) {
            notify({ type: "info", message: pageT("notices.noStakedAmount") });
            return;
          }
          const tx = await contracts.lp.emergencyWithdraw(pool.pid);
          await tx.wait();
          notify({ type: "success", message: pageT("notices.emergencyWithdrawSuccess", { pair: pool.pair }) });
        }

        setAmountInputs((prev) => ({ ...prev, [pool.pid]: "" }));
        setRefreshNonce((prev) => prev + 1);
      } catch (error) {
        notify({ type: "error", message: toErrorMessage(error, pageT("errors.poolActionFailed", { pair: pool.pair })) });
      } finally {
        setActionState({ type: "", pid: -1 });
      }
    },
    [amountInputs, canWrite, ensureSigner, notify, pageT, writeBlockReason],
  );

  const closeLiquidityModal = useCallback(() => {
    setLiquidityState(createInitialLiquidityState());
  }, []);

  useEffect(() => {
    if (!liquidityState.open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeLiquidityModal();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeLiquidityModal, liquidityState.open]);

  const openLiquidityModal = useCallback(
    async (pool, mode = "add") => {
      const [tokenAKey, tokenBKey] = pool.tokens;
      const tokenAAddress = tokenAddressByKey[tokenAKey];
      const tokenBAddress = tokenAddressByKey[tokenBKey];

      if (!tokenAAddress || !tokenBAddress) {
        notify({ type: "error", message: pageT("errors.missingTokenAddress") });
        return;
      }

      setLiquidityState({
        ...createInitialLiquidityState(),
        open: true,
        mode,
        loading: true,
        pool,
        tokenAKey,
        tokenBKey,
        tokenAAddress,
        tokenBAddress,
      });

      const provider = getReadProvider();
      try {
        await Promise.all([
          assertContractCode(provider, tokenAAddress, `${tokenAKey.toUpperCase()} Token`),
          assertContractCode(provider, tokenBAddress, `${tokenBKey.toUpperCase()} Token`),
          assertContractCode(provider, pool.lpTokenAddress, `${pool.pair} LP Pair`),
        ]);

        const tokenAContract = createErc20Contract(tokenAAddress, provider);
        const tokenBContract = createErc20Contract(tokenBAddress, provider);
        const lpTokenContract = createErc20Contract(pool.lpTokenAddress, provider);
        const pairContract = createPairContract(pool.lpTokenAddress, provider);

        const [tokenADecimals, tokenASymbol, tokenBDecimals, tokenBSymbol, tokenABalance, tokenBBalance, lpBalance, totalLpSupply, token0, reserves] =
          await Promise.all([
          tokenAContract.decimals().catch(() => 18),
          tokenAContract.symbol().catch(() => tokenAKey.toUpperCase()),
          tokenBContract.decimals().catch(() => 18),
          tokenBContract.symbol().catch(() => tokenBKey.toUpperCase()),
          address ? tokenAContract.balanceOf(address).catch(() => 0n) : 0n,
          address ? tokenBContract.balanceOf(address).catch(() => 0n) : 0n,
          address ? lpTokenContract.balanceOf(address).catch(() => 0n) : 0n,
          lpTokenContract.totalSupply().catch(() => 0n),
          pairContract.token0().catch(() => tokenAAddress),
          pairContract.getReserves().catch(() => ({ reserve0: 0n, reserve1: 0n })),
          ]);

        const token0Lower = String(token0).toLowerCase();
        const reserveA = token0Lower === tokenAAddress.toLowerCase() ? reserves.reserve0 : reserves.reserve1;
        const reserveB = token0Lower === tokenAAddress.toLowerCase() ? reserves.reserve1 : reserves.reserve0;

        setLiquidityState((prev) => ({
          ...prev,
          loading: false,
          tokenASymbol,
          tokenBSymbol,
          tokenADecimals: Number(tokenADecimals),
          tokenBDecimals: Number(tokenBDecimals),
          balanceA: tokenABalance,
          balanceB: tokenBBalance,
          lpBalance,
          totalLpSupply,
          reserveA,
          reserveB,
        }));
      } catch (error) {
        setLiquidityState((prev) => ({ ...prev, loading: false }));
        notify({ type: "error", message: toErrorMessage(error, pageT("errors.loadLiquidityData")) });
      }
    },
    [address, notify, pageT],
  );

  const handleAddLiquidity = (pool) => {
    openLiquidityModal(pool, "add").catch(() => {});
  };

  const handleRemoveLiquidity = (pool) => {
    openLiquidityModal(pool, "remove").catch(() => {});
  };

  useEffect(() => {
    if (!address || !liquidityState.open || !liquidityState.pool) return;
    openLiquidityModal(liquidityState.pool, liquidityState.mode).catch(() => {});
  }, [address, liquidityState.mode, liquidityState.open, liquidityState.pool, openLiquidityModal]);

  const handleLiquidityAmountAChange = (value) => {
    setLiquidityState((prev) => {
      const next = { ...prev, amountA: value };
      if (!value) return { ...next, amountB: "" };

      try {
        const amountA = parseTokenAmount(value, prev.tokenADecimals);
        if (amountA <= 0n || prev.reserveA <= 0n || prev.reserveB <= 0n) {
          return { ...next, amountB: "" };
        }
        const amountB = (amountA * prev.reserveB) / prev.reserveA;
        return { ...next, amountB: toInputAmount(amountB, prev.tokenBDecimals) };
      } catch {
        return { ...next, amountB: "" };
      }
    });
  };

  const handleLiquidityAmountBChange = (value) => {
    setLiquidityState((prev) => {
      const next = { ...prev, amountB: value };
      if (!value) return { ...next, amountA: "" };

      try {
        const amountB = parseTokenAmount(value, prev.tokenBDecimals);
        if (amountB <= 0n || prev.reserveA <= 0n || prev.reserveB <= 0n) {
          return { ...next, amountA: "" };
        }
        const amountA = (amountB * prev.reserveA) / prev.reserveB;
        return { ...next, amountA: toInputAmount(amountA, prev.tokenADecimals) };
      } catch {
        return { ...next, amountA: "" };
      }
    });
  };

  const handleLiquiditySetMaxA = () => {
    setLiquidityState((prev) => {
      const amountA = prev.balanceA;
      const amountAInput = toInputAmount(amountA, prev.tokenADecimals);
      if (amountA <= 0n || prev.reserveA <= 0n || prev.reserveB <= 0n) {
        return { ...prev, amountA: amountAInput, amountB: "" };
      }

      const amountB = (amountA * prev.reserveB) / prev.reserveA;
      return {
        ...prev,
        amountA: amountAInput,
        amountB: toInputAmount(amountB, prev.tokenBDecimals),
      };
    });
  };

  const handleLiquiditySetMaxB = () => {
    setLiquidityState((prev) => {
      const amountB = prev.balanceB;
      const amountBInput = toInputAmount(amountB, prev.tokenBDecimals);
      if (amountB <= 0n || prev.reserveA <= 0n || prev.reserveB <= 0n) {
        return { ...prev, amountB: amountBInput, amountA: "" };
      }

      const amountA = (amountB * prev.reserveA) / prev.reserveB;
      return {
        ...prev,
        amountB: amountBInput,
        amountA: toInputAmount(amountA, prev.tokenADecimals),
      };
    });
  };

  const handleLpAmountChange = (value) => {
    setLiquidityState((prev) => {
      const next = { ...prev, lpAmount: value };
      if (!value) {
        return { ...next, expectedOutA: 0n, expectedOutB: 0n };
      }

      try {
        const lpAmount = parseTokenAmount(value, prev.pool?.lpDecimals ?? 18);
        if (lpAmount <= 0n || prev.totalLpSupply <= 0n || prev.reserveA <= 0n || prev.reserveB <= 0n) {
          return { ...next, expectedOutA: 0n, expectedOutB: 0n };
        }

        return {
          ...next,
          expectedOutA: (lpAmount * prev.reserveA) / prev.totalLpSupply,
          expectedOutB: (lpAmount * prev.reserveB) / prev.totalLpSupply,
        };
      } catch {
        return { ...next, expectedOutA: 0n, expectedOutB: 0n };
      }
    });
  };

  const handleSetMaxLiquidity = () => {
    setLiquidityState((prev) => {
      const lpAmount = prev.lpBalance;
      if (lpAmount <= 0n || prev.totalLpSupply <= 0n || prev.reserveA <= 0n || prev.reserveB <= 0n) {
        return {
          ...prev,
          lpAmount: toInputAmount(lpAmount, prev.pool?.lpDecimals ?? 18),
          expectedOutA: 0n,
          expectedOutB: 0n,
        };
      }

      return {
        ...prev,
        lpAmount: toInputAmount(lpAmount, prev.pool?.lpDecimals ?? 18),
        expectedOutA: (lpAmount * prev.reserveA) / prev.totalLpSupply,
        expectedOutB: (lpAmount * prev.reserveB) / prev.totalLpSupply,
      };
    });
  };

  const handleConfirmAddLiquidity = async () => {
    if (liquidityState.submitting || !liquidityState.pool) return;

    let amountA = 0n;
    let amountB = 0n;

    try {
      amountA = parseTokenAmount(liquidityState.amountA, liquidityState.tokenADecimals);
      amountB = parseTokenAmount(liquidityState.amountB, liquidityState.tokenBDecimals);
    } catch {
      notify({ type: "error", message: pageT("errors.invalidLiquidityAmount") });
      return;
    }

    if (amountA <= 0n || amountB <= 0n) {
      notify({ type: "error", message: pageT("errors.invalidLiquidityAmount") });
      return;
    }

    if (amountA > liquidityState.balanceA || amountB > liquidityState.balanceB) {
      notify({
        type: "error",
        message: pageT("errors.insufficientBalance", {
          balanceA: formatTokenAmount(liquidityState.balanceA, liquidityState.tokenADecimals, 6),
          tokenA: liquidityState.tokenASymbol,
          balanceB: formatTokenAmount(liquidityState.balanceB, liquidityState.tokenBDecimals, 6),
          tokenB: liquidityState.tokenBSymbol,
        }),
      });
      return;
    }

    const signerContext = await ensureSigner();
    if (!signerContext) return;

    const snapshot = liquidityState;
    setLiquidityState((prev) => ({ ...prev, submitting: true }));

    let succeeded = false;
    try {
      const contracts = createCoreContracts(signerContext.signer);
      const tokenAContract = createErc20Contract(snapshot.tokenAAddress, signerContext.signer);
      const tokenBContract = createErc20Contract(snapshot.tokenBAddress, signerContext.signer);

      const [allowanceA, allowanceB] = await Promise.all([
        tokenAContract.allowance(signerContext.currentAddress, ADDRESSES.routerV2),
        tokenBContract.allowance(signerContext.currentAddress, ADDRESSES.routerV2),
      ]);

      if (allowanceA < amountA) {
        notify({ type: "info", message: pageT("notices.approvingToken", { symbol: snapshot.tokenASymbol }) });
        const approveATx = await tokenAContract.approve(ADDRESSES.routerV2, MaxUint256);
        await approveATx.wait();
      }

      if (allowanceB < amountB) {
        notify({ type: "info", message: pageT("notices.approvingToken", { symbol: snapshot.tokenBSymbol }) });
        const approveBTx = await tokenBContract.approve(ADDRESSES.routerV2, MaxUint256);
        await approveBTx.wait();
      }

      const amountAMin = (amountA * 9900n) / 10000n;
      const amountBMin = (amountB * 9900n) / 10000n;
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 20 * 60);

      notify({ type: "info", message: pageT("notices.submittingAddLiquidity", { pair: snapshot.pool.pair }) });
      const tx = await contracts.router.addLiquidity(
        snapshot.tokenAAddress,
        snapshot.tokenBAddress,
        amountA,
        amountB,
        amountAMin,
        amountBMin,
        signerContext.currentAddress,
        deadline,
      );
      await tx.wait();

      succeeded = true;
      notify({ type: "success", message: pageT("notices.addLiquiditySuccess", { pair: snapshot.pool.pair }) });
      setRefreshNonce((prev) => prev + 1);
      closeLiquidityModal();
    } catch (error) {
      notify({ type: "error", message: toErrorMessage(error, pageT("errors.addLiquidityFailed")) });
    } finally {
      if (!succeeded) {
        setLiquidityState((prev) => ({ ...prev, submitting: false }));
      }
    }
  };

  const handleConfirmRemoveLiquidity = async () => {
    if (liquidityState.submitting || !liquidityState.pool) return;

    let liquidityAmount = 0n;
    try {
      liquidityAmount = parseTokenAmount(liquidityState.lpAmount, liquidityState.pool.lpDecimals);
    } catch {
      notify({ type: "error", message: pageT("errors.invalidLiquidityAmount") });
      return;
    }

    if (liquidityAmount <= 0n) {
      notify({ type: "error", message: pageT("errors.invalidLiquidityAmount") });
      return;
    }
    if (liquidityAmount > liquidityState.lpBalance) {
      notify({
        type: "error",
        message: pageT("errors.insufficientLpBalance", {
          balance: formatTokenAmount(liquidityState.lpBalance, liquidityState.pool.lpDecimals, 6),
          symbol: liquidityState.pool.lpSymbol,
        }),
      });
      return;
    }

    const signerContext = await ensureSigner();
    if (!signerContext) return;

    const snapshot = liquidityState;
    setLiquidityState((prev) => ({ ...prev, submitting: true }));

    let succeeded = false;
    try {
      const contracts = createCoreContracts(signerContext.signer);
      const lpTokenContract = createErc20Contract(snapshot.pool.lpTokenAddress, signerContext.signer);
      const allowance = await lpTokenContract.allowance(signerContext.currentAddress, ADDRESSES.routerV2);

      if (allowance < liquidityAmount) {
        notify({ type: "info", message: pageT("notices.approvingPool", { pair: snapshot.pool.pair }) });
        const approveTx = await lpTokenContract.approve(ADDRESSES.routerV2, MaxUint256);
        await approveTx.wait();
      }

      const amountAMin = snapshot.expectedOutA > 0n ? (snapshot.expectedOutA * 9900n) / 10000n : 0n;
      const amountBMin = snapshot.expectedOutB > 0n ? (snapshot.expectedOutB * 9900n) / 10000n : 0n;
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 20 * 60);

      notify({ type: "info", message: pageT("notices.submittingRemoveLiquidity", { pair: snapshot.pool.pair }) });
      const tx = await contracts.router.removeLiquidity(
        snapshot.tokenAAddress,
        snapshot.tokenBAddress,
        liquidityAmount,
        amountAMin,
        amountBMin,
        signerContext.currentAddress,
        deadline,
      );
      await tx.wait();

      succeeded = true;
      notify({ type: "success", message: pageT("notices.removeLiquiditySuccess", { pair: snapshot.pool.pair }) });
      setRefreshNonce((prev) => prev + 1);
      closeLiquidityModal();
    } catch (error) {
      notify({ type: "error", message: toErrorMessage(error, pageT("errors.removeLiquidityFailed")) });
    } finally {
      if (!succeeded) {
        setLiquidityState((prev) => ({ ...prev, submitting: false }));
      }
    }
  };

  const filteredPools = useMemo(() => {
    let result = farmState.pools;
    if (statusFilter !== "all") {
      result = result.filter((pool) => pool.status === statusFilter);
    }
    if (onlyStaked) {
      result = result.filter((pool) => pool.stakedAmount > 0n);
    }
    return result;
  }, [farmState.pools, onlyStaked, statusFilter]);

  const summary = useMemo(() => {
    return farmState.pools.reduce(
      (acc, pool) => {
        acc.poolCount += 1;
        if (pool.status === "active") acc.activeCount += 1;
        acc.totalStaked += pool.totalStaked;
        return acc;
      },
      { poolCount: 0, activeCount: 0, totalStaked: 0n },
    );
  }, [farmState.pools]);

  const liquidityRatioText = useMemo(() => {
    if (liquidityState.reserveA <= 0n || liquidityState.reserveB <= 0n) return pageT("liquidity.ratioLoading");

    const reserveA = Number(formatUnits(liquidityState.reserveA, liquidityState.tokenADecimals));
    const reserveB = Number(formatUnits(liquidityState.reserveB, liquidityState.tokenBDecimals));
    if (!Number.isFinite(reserveA) || !Number.isFinite(reserveB) || reserveA <= 0 || reserveB <= 0) {
      return pageT("liquidity.ratioLoading");
    }

    const ratio = reserveB / reserveA;
    return `1 ${liquidityState.tokenASymbol} ≈ ${ratio.toLocaleString("en-US", { maximumFractionDigits: 6 })} ${liquidityState.tokenBSymbol}`;
  }, [
    liquidityState.reserveA,
    liquidityState.reserveB,
    liquidityState.tokenADecimals,
    liquidityState.tokenASymbol,
    liquidityState.tokenBDecimals,
    liquidityState.tokenBSymbol,
    pageT,
  ]);

  return (
    <section className="relative overflow-hidden px-4 py-10 md:py-14">
      <div className="governance-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-[-80px] h-[260px] bg-[radial-gradient(circle_at_top,rgba(252,213,53,0.18),rgba(252,213,53,0)_70%)]" />

      <div className="relative mx-auto max-w-6xl">
        <h1 className="text-4xl font-semibold tracking-tight text-[#fcd535] md:text-6xl">{t("defi.title")}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{t("defi.subtitle")}</p>

        {!isExpectedChain(chainId) && address && (
          <div className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {pageT("warnings.networkMismatch")}
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="governance-panel-soft rounded-3xl p-5">
            <p className="text-sm text-slate-500">{t("defi.summary.poolCount")}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{summary.poolCount}</p>
          </article>
          <article className="governance-panel-soft rounded-3xl p-5">
            <p className="text-sm text-slate-500">{t("defi.summary.activeCount")}</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">{summary.activeCount}</p>
          </article>
          <article className="governance-panel-soft rounded-3xl p-5">
            <p className="text-sm text-slate-500">{pageT("summary.totalStakedLp")}</p>
            <p className="mt-2 text-3xl font-semibold text-[#fcd535]">{formatTokenAmount(summary.totalStaked)} LP</p>
            <p className="mt-1 text-xs text-slate-500">
              {pageT("summary.dailyEmission")}: {formatTokenAmount(farmState.currentDailyEmission)} GDL · {pageT("summary.emittedTotal")}:{" "}
              {formatTokenAmount(farmState.emittedTotal)} GDL
            </p>
          </article>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-4 py-1.5 text-sm ${statusFilter === "active" ? "morgan-btn-primary border-0 text-[#111111]" : "morgan-btn-secondary text-slate-300"}`}
          >
            {t("defi.statusFilter.active")}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("ended")}
            className={`px-4 py-1.5 text-sm ${statusFilter === "ended" ? "morgan-btn-primary border-0 text-[#111111]" : "morgan-btn-secondary text-slate-300"}`}
          >
            {t("defi.statusFilter.ended")}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-1.5 text-sm ${statusFilter === "all" ? "morgan-btn-primary border-0 text-[#111111]" : "morgan-btn-secondary text-slate-300"}`}
          >
            {t("defi.statusFilter.all")}
          </button>

          <label className="ml-1 inline-flex items-center gap-2 px-2 text-sm text-slate-300">
            <button
              type="button"
              onClick={() => setOnlyStaked((prev) => !prev)}
              className={`relative h-6 w-11 rounded-full transition ${onlyStaked ? "bg-[#fcd535]" : "bg-white/15"}`}
            >
              <span className={`absolute top-[2px] h-5 w-5 rounded-full bg-white transition ${onlyStaked ? "left-[22px]" : "left-[2px]"}`} />
            </button>
            {t("defi.onlyStaked")}
          </label>

          <button
            type="button"
            onClick={() => setRefreshNonce((prev) => prev + 1)}
            className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-200 transition hover:border-white/25 hover:text-white"
          >
            <Icon icon="mdi:refresh" width="16" />
            {pageT("actions.refresh")}
          </button>
        </div>

        {!canWrite && <p className="mt-4 text-xs text-amber-300">{writeBlockReason}</p>}

        {loading ? (
          <div className="governance-panel mt-6 rounded-3xl px-6 py-10 text-center text-slate-300">{pageT("states.loading")}</div>
        ) : filteredPools.length === 0 ? (
          <div className="governance-panel mt-6 rounded-3xl px-6 py-10 text-center">
            <p className="text-slate-300">{t("defi.empty")}</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredPools.map((pool) => {
              const actionType = actionState.pid === pool.pid ? actionState.type : "";
              const inputValue = amountInputs[pool.pid] ?? "";
              const pendingLabel = formatTokenAmount(pool.pending);

              return (
                <article key={pool.pid} className="governance-panel overflow-hidden rounded-[28px]">
                  <div className="p-5 md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-center gap-3">
                        <TokenStack tokens={pool.tokens} />
                        <div>
                          <p className="text-xl font-semibold text-[#f0cd54]">{pool.pair}</p>
                          <p className="mt-1 text-sm text-slate-400">
                            PID {pool.pid} · LP: {pool.lpTokenAddress.slice(0, 8)}...{pool.lpTokenAddress.slice(-6)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold ${
                          pool.status === "active" && pool.poolEnabled
                            ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                            : "border border-amber-400/30 bg-amber-500/10 text-amber-200"
                        }`}
                      >
                        {pool.poolEnabled ? t(`common.status.${pool.status}`) : pageT("status.poolDisabled")}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                        <p className="text-xs text-slate-500">{pageT("fields.poolWeight")}</p>
                        <p className="mt-1 text-lg font-semibold text-[#fcd535]">{formatPoolWeight(pool.allocPoint)}</p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                        <p className="text-xs text-slate-500">{pageT("fields.totalStaked")}</p>
                        <p className="mt-1 text-lg font-semibold text-white">{formatTokenAmount(pool.totalStaked, pool.lpDecimals)} LP</p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                        <p className="text-xs text-slate-500">{pageT("fields.dailyReward")}</p>
                        <p className="mt-1 text-lg font-semibold text-emerald-300">{formatTokenAmount(pool.dailyReward)} GDL/day</p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                        <p className="text-xs text-slate-500">{pageT("fields.estimatedApy")}</p>
                        <p className="mt-1 text-lg font-semibold text-cyan-300">
                          {pool.estimatedApy === null ? "--" : `${pool.estimatedApy.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                        <p className="text-xs text-slate-500">{pageT("fields.claimableReward")}</p>
                        <p className="mt-1 text-lg font-semibold text-sky-300">{pendingLabel} GDL</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                      <p className="rounded-xl border border-white/8 bg-black/20 px-4 py-2 text-slate-400">
                        {pageT("fields.availableLp")}:{" "}
                        <span className="ml-1 font-semibold text-slate-200">
                          {formatTokenAmount(pool.walletBalance, pool.lpDecimals)} {pool.lpSymbol}
                        </span>
                      </p>
                      <p className="rounded-xl border border-white/8 bg-black/20 px-4 py-2 text-slate-400">
                        {pageT("fields.stakedLp")}:{" "}
                        <span className="ml-1 font-semibold text-slate-200">
                          {formatTokenAmount(pool.stakedAmount, pool.lpDecimals)} {pool.lpSymbol}
                        </span>
                      </p>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-500">{pageT("fields.amountInput")}</p>
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAdjustAmount(pool, "down")}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-200 transition hover:border-white/30 hover:text-white"
                          >
                            <Icon icon="mdi:minus" width="14" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustAmount(pool, "up")}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-200 transition hover:border-white/30 hover:text-white"
                          >
                            <Icon icon="mdi:plus" width="14" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStakeMax(pool)}
                            className="rounded-md border border-[#fcd535]/30 bg-[#fcd535]/10 px-2 py-0.5 text-[11px] font-semibold text-[#f0cd54] transition hover:bg-[#fcd535]/18"
                          >
                            MAX
                          </button>
                        </div>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={inputValue}
                        onChange={(event) => handleAmountChange(pool.pid, event.target.value)}
                        placeholder="0.0"
                        className="mt-1 h-8 w-full bg-transparent text-lg font-semibold text-white outline-none placeholder:text-slate-500"
                      />
                    </div>

                    {!pool.poolEnabled && <p className="mt-3 text-xs text-amber-300">{pageT("errors.poolDisabled")}</p>}

                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                      <button
                        type="button"
                        onClick={() => executePoolAction(pool, "deposit")}
                        disabled={actionType === "deposit" || !inputValue || !canWrite || !pool.poolEnabled}
                        className={`h-12 rounded-2xl text-sm font-semibold transition ${
                          actionType === "deposit" || !inputValue || !canWrite || !pool.poolEnabled
                            ? "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
                            : "morgan-btn-primary border-0 text-[#111111]"
                        }`}
                      >
                        {actionType === "deposit" ? pageT("actions.processing") : pageT("actions.deposit")}
                      </button>

                      <button
                        type="button"
                        onClick={() => executePoolAction(pool, "withdraw")}
                        disabled={actionType === "withdraw" || !inputValue || !canWrite || !pool.poolEnabled}
                        className={`h-12 rounded-2xl text-sm font-semibold transition ${
                          actionType === "withdraw" || !inputValue || !canWrite || !pool.poolEnabled
                            ? "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
                            : "border border-[#fcd535]/35 bg-[#fcd535]/10 text-[#f0cd54] hover:bg-[#fcd535]/15"
                        }`}
                      >
                        {actionType === "withdraw" ? pageT("actions.processing") : pageT("actions.withdraw")}
                      </button>

                      <button
                        type="button"
                        onClick={() => executePoolAction(pool, "claim")}
                        disabled={actionType === "claim" || pool.pending <= 0n || !canWrite || !pool.poolEnabled}
                        className={`h-12 rounded-2xl text-sm font-semibold transition ${
                          actionType === "claim" || pool.pending <= 0n || !canWrite || !pool.poolEnabled
                            ? "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
                            : "border border-emerald-400/35 bg-emerald-400/12 text-emerald-300 hover:bg-emerald-400/18"
                        }`}
                      >
                        {actionType === "claim" ? pageT("actions.processing") : pageT("actions.claim", { amount: pendingLabel })}
                      </button>

                      <button
                        type="button"
                        onClick={() => executePoolAction(pool, "emergencyWithdraw")}
                        disabled={actionType === "emergencyWithdraw" || pool.stakedAmount <= 0n || !canWrite || !pool.poolEnabled}
                        className={`h-12 rounded-2xl text-sm font-semibold transition ${
                          actionType === "emergencyWithdraw" || pool.stakedAmount <= 0n || !canWrite || !pool.poolEnabled
                            ? "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
                            : "border border-rose-400/35 bg-rose-400/12 text-rose-300 hover:bg-rose-400/18"
                        }`}
                      >
                        {actionType === "emergencyWithdraw" ? pageT("actions.processing") : pageT("actions.emergencyWithdraw")}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddLiquidity(pool)}
                        className="h-12 rounded-2xl border border-white/10 bg-black/25 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:text-white"
                      >
                        {pageT("actions.addLiquidity")}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveLiquidity(pool)}
                        className="h-12 rounded-2xl border border-white/10 bg-black/25 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:text-white"
                      >
                        {pageT("actions.removeLiquidity")}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {liquidityState.open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6">
          <button type="button" aria-label={pageT("actions.close")} onClick={closeLiquidityModal} className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

          <div className="governance-panel relative z-10 w-full max-w-xl overflow-hidden rounded-[28px]">
            <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(252,213,53,0.22)_0%,rgba(252,213,53,0)_72%)] blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(240,205,84,0.18)_0%,rgba(240,205,84,0)_74%)] blur-2xl" />

            <div className="relative p-5 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Liquidity</p>
                  <h2 className="mt-1 text-2xl font-semibold text-[#f0cd54]">
                    {liquidityState.mode === "remove" ? pageT("liquidity.removeTitle") : pageT("liquidity.title")}
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">{liquidityState.pool?.pair ?? "-"}</p>
                </div>

                <button
                  type="button"
                  onClick={closeLiquidityModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-white/25 hover:text-white"
                >
                  <Icon icon="mdi:close" width="18" />
                </button>
              </div>

              {liquidityState.loading ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-10 text-center text-sm text-slate-300">
                  {pageT("liquidity.loading")}
                </div>
              ) : (
                <>
                  <div className="mt-5 rounded-2xl border border-[#fcd535]/25 bg-[#fcd535]/10 px-4 py-3 text-sm text-[#f0cd54]">
                    <p className="font-medium">{pageT("liquidity.autoRatio")}</p>
                    <p className="mt-1 text-xs text-slate-300">{liquidityRatioText}</p>
                  </div>

                  {liquidityState.mode === "remove" ? (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{liquidityState.pool?.lpSymbol || "LP"}</span>
                          <button
                            type="button"
                            onClick={handleSetMaxLiquidity}
                            className="rounded-md border border-[#fcd535]/30 bg-[#fcd535]/10 px-2 py-0.5 text-[11px] font-semibold text-[#f0cd54] transition hover:bg-[#fcd535]/18"
                          >
                            MAX
                          </button>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={liquidityState.lpAmount}
                          onChange={(event) => handleLpAmountChange(event.target.value)}
                          placeholder="0.0"
                          className="mt-2 h-9 w-full bg-transparent text-lg font-semibold text-white outline-none placeholder:text-slate-500"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          {pageT("liquidity.availableBalance")}:{" "}
                          {formatTokenAmount(liquidityState.lpBalance, liquidityState.pool?.lpDecimals ?? 18, 6)} {liquidityState.pool?.lpSymbol}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                          <p className="text-xs text-slate-500">{pageT("liquidity.expectedReceiveA", { symbol: liquidityState.tokenASymbol })}</p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {formatTokenAmount(liquidityState.expectedOutA, liquidityState.tokenADecimals, 6)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                          <p className="text-xs text-slate-500">{pageT("liquidity.expectedReceiveB", { symbol: liquidityState.tokenBSymbol })}</p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {formatTokenAmount(liquidityState.expectedOutB, liquidityState.tokenBDecimals, 6)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{liquidityState.tokenASymbol || "Token A"}</span>
                          <button
                            type="button"
                            onClick={handleLiquiditySetMaxA}
                            className="rounded-md border border-[#fcd535]/30 bg-[#fcd535]/10 px-2 py-0.5 text-[11px] font-semibold text-[#f0cd54] transition hover:bg-[#fcd535]/18"
                          >
                            MAX
                          </button>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={liquidityState.amountA}
                          onChange={(event) => handleLiquidityAmountAChange(event.target.value)}
                          placeholder="0.0"
                          className="mt-2 h-9 w-full bg-transparent text-lg font-semibold text-white outline-none placeholder:text-slate-500"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          {pageT("liquidity.availableBalance")}: {formatTokenAmount(liquidityState.balanceA, liquidityState.tokenADecimals, 6)}{" "}
                          {liquidityState.tokenASymbol}
                        </p>
                      </div>

                      <div className="flex justify-center text-[#f0cd54]">
                        <Icon icon="mdi:plus-circle-outline" width="22" />
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{liquidityState.tokenBSymbol || "Token B"}</span>
                          <button
                            type="button"
                            onClick={handleLiquiditySetMaxB}
                            className="rounded-md border border-[#fcd535]/30 bg-[#fcd535]/10 px-2 py-0.5 text-[11px] font-semibold text-[#f0cd54] transition hover:bg-[#fcd535]/18"
                          >
                            MAX
                          </button>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={liquidityState.amountB}
                          onChange={(event) => handleLiquidityAmountBChange(event.target.value)}
                          placeholder="0.0"
                          className="mt-2 h-9 w-full bg-transparent text-lg font-semibold text-white outline-none placeholder:text-slate-500"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          {pageT("liquidity.availableBalance")}: {formatTokenAmount(liquidityState.balanceB, liquidityState.tokenBDecimals, 6)}{" "}
                          {liquidityState.tokenBSymbol}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={closeLiquidityModal}
                      className="h-12 rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:text-white"
                    >
                      {pageT("actions.cancel")}
                    </button>
                    <button
                      type="button"
                      onClick={liquidityState.mode === "remove" ? handleConfirmRemoveLiquidity : handleConfirmAddLiquidity}
                      disabled={
                        liquidityState.submitting ||
                        (liquidityState.mode === "remove" ? !liquidityState.lpAmount : !liquidityState.amountA || !liquidityState.amountB)
                      }
                      className={`h-12 rounded-2xl text-sm font-semibold transition ${
                        liquidityState.submitting ||
                        (liquidityState.mode === "remove" ? !liquidityState.lpAmount : !liquidityState.amountA || !liquidityState.amountB)
                          ? "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
                          : "morgan-btn-primary border-0 text-[#111111]"
                      }`}
                    >
                      {liquidityState.submitting
                        ? pageT("actions.submitting")
                        : liquidityState.mode === "remove"
                          ? pageT("actions.confirmRemoveLiquidity")
                          : pageT("actions.confirmAddLiquidity")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
