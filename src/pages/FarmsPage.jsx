import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../components/Notification";
import { useWallet } from "../contexts/WalletContext";
import { ADDRESSES, LP_POOLS, TBSC_CHAIN_ID } from "../web3/config";
import { getReadProvider, isExpectedChain } from "../web3/client";
import { createCoreContracts, createErc20Contract } from "../web3/contracts";
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

function formatNumberish(value) {
  return Number(value ?? 0).toLocaleString("en-US");
}

export default function FarmsPage() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { address, chainId, connect, getSigner } = useWallet();
  
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("active");
  const [onlyStaked, setOnlyStaked] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [amountInputs, setAmountInputs] = useState({});
  const [actionState, setActionState] = useState({ type: "", pid: -1 });

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

  useEffect(() => {
    if (chainId != null) {
      console.log("当前链id,", chainId);
    }
  }, [chainId]);

  const loadFarmData = useCallback(async () => {
    setLoading(true);
    const readProvider = getReadProvider();
    const contracts = createCoreContracts(readProvider);

    try {
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
          const poolInfo = await contracts.lp.pools(meta.pid);
          const lpTokenAddress = String(poolInfo.lpToken);
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
      notify({ type: "error", message: toErrorMessage(error, "读取挖矿数据失败") });
    } finally {
      setLoading(false);
    }
  }, [address, notify]);

  useEffect(() => {
    loadFarmData();
  }, [loadFarmData, refreshNonce]);

  const canWrite = useMemo(() => {
    if (!address) return false;
    if (!isExpectedChain(chainId)) return false;
    if (farmState.paused) return false;
    if (farmState.blacklisted) return false;
    if (farmState.whitelistMode && !farmState.whitelisted) return false;
    return true;
  }, [address, chainId, farmState.blacklisted, farmState.paused, farmState.whitelistMode, farmState.whitelisted]);

  const writeBlockReason = useMemo(() => {
    if (!address) return "请先连接钱包";
    if (!isExpectedChain(chainId)) return `请切换到 BSC Testnet（ChainId=${TBSC_CHAIN_ID}）`;
    if (farmState.paused) return "挖矿合约已暂停";
    if (farmState.blacklisted) return "当前地址在黑名单中";
    if (farmState.whitelistMode && !farmState.whitelisted) return "当前地址不在白名单中";
    return "";
  }, [address, chainId, farmState.blacklisted, farmState.paused, farmState.whitelistMode, farmState.whitelisted]);

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

  const handleAmountChange = (pid, value) => {
    setAmountInputs((prev) => ({ ...prev, [pid]: value }));
  };

  const executePoolAction = useCallback(
    async (pool, action) => {
      const rawInput = amountInputs[pool.pid];
      let amount = 0n;
      if (action !== "claim") {
        try {
          amount = parseTokenAmount(rawInput, pool.lpDecimals);
        } catch {
          notify({ type: "error", message: "请输入有效数量" });
          return;
        }
        if (amount <= 0n) {
          notify({ type: "error", message: "请输入有效数量" });
          return;
        }
      }

      const signerContext = await ensureSigner();
      if (!signerContext) return;

      if (!canWrite) {
        notify({ type: "error", message: writeBlockReason || "当前状态不可执行写入" });
        return;
      }

      setActionState({ type: action, pid: pool.pid });
      try {
        const contracts = createCoreContracts(signerContext.signer);
        const lpToken = createErc20Contract(pool.lpTokenAddress, signerContext.signer);

        if (action === "deposit") {
          const allowance = await lpToken.allowance(signerContext.currentAddress, ADDRESSES.lpProxy);
          if (allowance < amount) {
            notify({ type: "info", message: `正在授权 ${pool.pair}` });
            const approveTx = await lpToken.approve(ADDRESSES.lpProxy, amount);
            await approveTx.wait();
          }

          const tx = await contracts.lp.deposit(pool.pid, amount);
          await tx.wait();
          notify({ type: "success", message: `${pool.pair} 质押成功` });
        } else if (action === "withdraw") {
          const tx = await contracts.lp.withdraw(pool.pid, amount);
          await tx.wait();
          notify({ type: "success", message: `${pool.pair} 提取成功` });
        } else if (action === "claim") {
          if (pool.pending <= 0n) {
            notify({ type: "info", message: "当前没有可领取奖励" });
            return;
          }
          const tx = await contracts.lp.claim(pool.pid);
          await tx.wait();
          notify({ type: "success", message: `${pool.pair} 奖励领取成功` });
        }

        setAmountInputs((prev) => ({ ...prev, [pool.pid]: "" }));
        setRefreshNonce((prev) => prev + 1);
      } catch (error) {
        notify({ type: "error", message: toErrorMessage(error, `${pool.pair} 操作失败`) });
      } finally {
        setActionState({ type: "", pid: -1 });
      }
    },
    [amountInputs, canWrite, ensureSigner, notify, writeBlockReason],
  );

  const handleAddLiquidity = (pool) => {
    const [tokenA, tokenB] = pool.tokens;
    const tokenAAddress = tokenAddressByKey[tokenA];
    const tokenBAddress = tokenAddressByKey[tokenB];
    const url = `https://pancakeswap.finance/add/${tokenAAddress}/${tokenBAddress}?chain=bscTestnet`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenContract = (pool) => {
    window.open(`https://testnet.bscscan.com/address/${pool.lpTokenAddress}`, "_blank", "noopener,noreferrer");
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

  return (
    <section className="relative overflow-hidden px-4 py-10 md:py-14">
      <div className="governance-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-[-80px] h-[260px] bg-[radial-gradient(circle_at_top,rgba(252,213,53,0.18),rgba(252,213,53,0)_70%)]" />

      <div className="relative mx-auto max-w-6xl">
        <h1 className="text-4xl font-semibold tracking-tight text-[#fcd535] md:text-6xl">{t("defi.title")}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{t("defi.subtitle")}</p>

        {!isExpectedChain(chainId) && address && (
          <div className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            检测到当前钱包网络非 BSC Testnet，请切换后再执行交易。
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
            <p className="text-sm text-slate-500">总质押 LP</p>
            <p className="mt-2 text-3xl font-semibold text-[#fcd535]">{formatTokenAmount(summary.totalStaked)} LP</p>
            <p className="mt-1 text-xs text-slate-500">
              当前日产出: {formatTokenAmount(farmState.currentDailyEmission)} GDL · 已释放:{" "}
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
            刷新
          </button>
        </div>

        {!canWrite && <p className="mt-4 text-xs text-amber-300">{writeBlockReason}</p>}

        {loading ? (
          <div className="governance-panel mt-6 rounded-3xl px-6 py-10 text-center text-slate-300">正在读取链上矿池数据...</div>
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
                          pool.status === "active"
                            ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                            : "border border-white/15 bg-white/5 text-slate-300"
                        }`}
                      >
                        {t(`common.status.${pool.status}`)}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                        <p className="text-xs text-slate-500">allocPoint</p>
                        <p className="mt-1 text-lg font-semibold text-[#fcd535]">{formatNumberish(pool.allocPoint)}</p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                        <p className="text-xs text-slate-500">总质押</p>
                        <p className="mt-1 text-lg font-semibold text-white">{formatTokenAmount(pool.totalStaked, pool.lpDecimals)} LP</p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                        <p className="text-xs text-slate-500">日产出估算</p>
                        <p className="mt-1 text-lg font-semibold text-emerald-300">{formatTokenAmount(pool.dailyReward)} GDL/day</p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                        <p className="text-xs text-slate-500">可领奖励</p>
                        <p className="mt-1 text-lg font-semibold text-sky-300">{pendingLabel} GDL</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                      <p className="rounded-xl border border-white/8 bg-black/20 px-4 py-2 text-slate-400">
                        可用 LP:{" "}
                        <span className="ml-1 font-semibold text-slate-200">
                          {formatTokenAmount(pool.walletBalance, pool.lpDecimals)} {pool.lpSymbol}
                        </span>
                      </p>
                      <p className="rounded-xl border border-white/8 bg-black/20 px-4 py-2 text-slate-400">
                        已质押:{" "}
                        <span className="ml-1 font-semibold text-slate-200">
                          {formatTokenAmount(pool.stakedAmount, pool.lpDecimals)} {pool.lpSymbol}
                        </span>
                      </p>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <p className="text-xs text-slate-500">数量（用于质押/提取）</p>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={inputValue}
                        onChange={(event) => handleAmountChange(pool.pid, event.target.value)}
                        placeholder="0.0"
                        className="mt-1 h-8 w-full bg-transparent text-lg font-semibold text-white outline-none placeholder:text-slate-500"
                      />
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      <button
                        type="button"
                        onClick={() => executePoolAction(pool, "deposit")}
                        disabled={actionType === "deposit" || !inputValue || !canWrite}
                        className={`h-12 rounded-2xl text-sm font-semibold transition ${
                          actionType === "deposit" || !inputValue || !canWrite
                            ? "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
                            : "morgan-btn-primary border-0 text-[#111111]"
                        }`}
                      >
                        {actionType === "deposit" ? "处理中..." : "质押"}
                      </button>

                      <button
                        type="button"
                        onClick={() => executePoolAction(pool, "withdraw")}
                        disabled={actionType === "withdraw" || !inputValue || !canWrite}
                        className={`h-12 rounded-2xl text-sm font-semibold transition ${
                          actionType === "withdraw" || !inputValue || !canWrite
                            ? "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
                            : "border border-[#fcd535]/35 bg-[#fcd535]/10 text-[#f0cd54] hover:bg-[#fcd535]/15"
                        }`}
                      >
                        {actionType === "withdraw" ? "处理中..." : "提取"}
                      </button>

                      <button
                        type="button"
                        onClick={() => executePoolAction(pool, "claim")}
                        disabled={actionType === "claim" || pool.pending <= 0n || !canWrite}
                        className={`h-12 rounded-2xl text-sm font-semibold transition ${
                          actionType === "claim" || pool.pending <= 0n || !canWrite
                            ? "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
                            : "border border-emerald-400/35 bg-emerald-400/12 text-emerald-300 hover:bg-emerald-400/18"
                        }`}
                      >
                        {actionType === "claim" ? "处理中..." : `领取 (${pendingLabel})`}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddLiquidity(pool)}
                        className="h-12 rounded-2xl border border-white/10 bg-black/25 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:text-white"
                      >
                        添加流动性
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenContract(pool)}
                        className="h-12 rounded-2xl border border-white/10 bg-black/25 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:text-white"
                      >
                        查看合约
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
