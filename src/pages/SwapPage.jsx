import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatUnits } from "ethers";
import { useNotification } from "../components/Notification";
import { useWallet } from "../contexts/WalletContext";
import { ADDRESSES, SWAP_ROUTES, TBSC_CHAIN_ID, TOKEN_ORDER } from "../web3/config";
import { getReadProvider, isExpectedChain } from "../web3/client";
import { assertContractCode, createCoreContracts, createErc20Contract, createPairContract, validateCoreContractAddresses } from "../web3/contracts";
import { clampSlippage, formatTokenAmount, parseTokenAmount, toErrorMessage } from "../web3/format";

const tokenUiMeta = {
  USDT: { icon: "mdi:currency-usd-circle-outline", chipClass: "bg-emerald-500/20 text-emerald-300" },
  USGD: { icon: "mdi:shield-check-outline", chipClass: "bg-sky-500/20 text-sky-300" },
  GODL: { icon: "mdi:gold", chipClass: "bg-amber-500/20 text-amber-300" },
  GDL: { icon: "mdi:chart-donut-variant", chipClass: "bg-orange-500/20 text-orange-300" },
};

function calcRateString(amountIn, inDecimals, amountOut, outDecimals, inSymbol, outSymbol) {
  if (amountIn <= 0n || amountOut <= 0n) {
    return `1 ${inSymbol} ≈ - ${outSymbol}`;
  }
  const scaled = (amountOut * 10n ** 18n * 10n ** BigInt(inDecimals)) / (amountIn * 10n ** BigInt(outDecimals));
  const value = Number(scaled) / 1e18;
  return `1 ${inSymbol} ≈ ${value.toLocaleString("en-US", { maximumFractionDigits: 8 })} ${outSymbol}`;
}

export default function SwapPage() {
  const location = useLocation();
  const { notify } = useNotification();
  const { t } = useTranslation();
  const { address, chainId, connect, getSigner } = useWallet();

  const [activeTab, setActiveTab] = useState(SWAP_ROUTES[0].id);
  const [amount, setAmount] = useState("");
  const [isReversed, setIsReversed] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [customSlippage, setCustomSlippage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [tokenState, setTokenState] = useState({});
  const [routePairs, setRoutePairs] = useState({});
  const [quoteState, setQuoteState] = useState({
    amountOut: 0n,
    reserveRate: "",
    reserveIn: 0n,
    reserveOut: 0n,
  });

  const settingsWrapRef = useRef(null);

  const tokenMap = useMemo(() => Object.fromEntries(TOKEN_ORDER.map((item) => [item.key, item])), []);

  const currentRoute = useMemo(() => SWAP_ROUTES.find((item) => item.id === activeTab) ?? SWAP_ROUTES[0], [activeTab]);

  const fromKey = isReversed ? currentRoute.toKey : currentRoute.fromKey;
  const toKey = isReversed ? currentRoute.fromKey : currentRoute.toKey;

  const fromToken = tokenState[fromKey] ?? {
    symbol: tokenMap[fromKey]?.symbol ?? fromKey.toUpperCase(),
    decimals: tokenMap[fromKey]?.defaultDecimals ?? 18,
    balance: 0n,
    address: tokenMap[fromKey]?.address ?? "",
  };
  const toToken = tokenState[toKey] ?? {
    symbol: tokenMap[toKey]?.symbol ?? toKey.toUpperCase(),
    decimals: tokenMap[toKey]?.defaultDecimals ?? 18,
    balance: 0n,
    address: tokenMap[toKey]?.address ?? "",
  };

  const fromUi = tokenUiMeta[fromToken.symbol] ?? tokenUiMeta.USGD;
  const toUi = tokenUiMeta[toToken.symbol] ?? tokenUiMeta.USGD;

  const slippageValue = clampSlippage(slippage);
  const slippageBps = BigInt(Math.floor(slippageValue * 100));
  const minimumReceived = quoteState.amountOut > 0n ? (quoteState.amountOut * (10000n - slippageBps)) / 10000n : 0n;

  const estimateText = quoteState.amountOut > 0n ? formatTokenAmount(quoteState.amountOut, toToken.decimals, 6) : "";
  const minimumReceivedText = formatTokenAmount(minimumReceived, toToken.decimals, 6);

  const exchangeRateText = useMemo(() => {
    if (quoteState.amountOut > 0n) {
      let parsedIn = 0n;
      try {
        parsedIn = parseTokenAmount(amount || "0", fromToken.decimals);
      } catch {
        parsedIn = 0n;
      }
      return calcRateString(parsedIn, fromToken.decimals, quoteState.amountOut, toToken.decimals, fromToken.symbol, toToken.symbol);
    }
    return quoteState.reserveRate || `1 ${fromToken.symbol} ≈ - ${toToken.symbol}`;
  }, [amount, fromToken.decimals, fromToken.symbol, quoteState.amountOut, quoteState.reserveRate, toToken.decimals, toToken.symbol]);

  const loadTokensAndBalances = useCallback(async () => {
    const provider = getReadProvider();
    await validateCoreContractAddresses(provider, { includeRouter: true });

    const entries = await Promise.all(
      TOKEN_ORDER.map(async (token) => {
        const contract = createErc20Contract(token.address, provider);
        const [decimals, symbol, balance] = await Promise.all([
          contract.decimals().catch(() => token.defaultDecimals ?? 18),
          contract.symbol().catch(() => token.symbol),
          address ? contract.balanceOf(address).catch(() => 0n) : 0n,
        ]);

        return [
          token.key,
          {
            symbol: symbol || token.symbol,
            decimals: Number(decimals),
            balance,
            address: token.address,
          },
        ];
      }),
    );

    setTokenState(Object.fromEntries(entries));
  }, [address]);

  const loadRoutePairs = useCallback(async () => {
    const provider = getReadProvider();
    await validateCoreContractAddresses(provider, { includeRouter: true });
    const contracts = createCoreContracts(provider);

    const entries = await Promise.all(
      SWAP_ROUTES.map(async (route) => {
        let pairAddress = route.pairAddressFallback || "";
        if (typeof route.poolPid === "number") {
          try {
            const poolInfo = await contracts.lp.pools(route.poolPid);
            if (poolInfo?.lpToken) {
              pairAddress = String(poolInfo.lpToken);
            }
          } catch {}
        }
        return [route.id, pairAddress];
      }),
    );

    setRoutePairs(Object.fromEntries(entries));
  }, []);

  const fetchQuoteAndRate = useCallback(
    async (nextAmount) => {
      const provider = getReadProvider();
      const contracts = createCoreContracts(provider);
      const routePairAddress = routePairs[currentRoute.id] || currentRoute.pairAddressFallback || "";

      const fromAddress = tokenMap[fromKey]?.address;
      const toAddress = tokenMap[toKey]?.address;
      const fromDecimals = tokenState[fromKey]?.decimals ?? tokenMap[fromKey]?.defaultDecimals ?? 18;
      const toDecimals = tokenState[toKey]?.decimals ?? tokenMap[toKey]?.defaultDecimals ?? 18;
      const fromSymbol = tokenState[fromKey]?.symbol ?? tokenMap[fromKey]?.symbol ?? fromKey.toUpperCase();
      const toSymbol = tokenState[toKey]?.symbol ?? tokenMap[toKey]?.symbol ?? toKey.toUpperCase();

      if (!fromAddress || !toAddress) {
        setQuoteState({ amountOut: 0n, reserveRate: "", reserveIn: 0n, reserveOut: 0n });
        return;
      }

      setQuoteLoading(true);
      try {
        let reserveIn = 0n;
        let reserveOut = 0n;
        let reserveRate = "";

        if (routePairAddress) {
          await assertContractCode(provider, routePairAddress, `Swap Pair (${currentRoute.id})`);
          const pair = createPairContract(routePairAddress, provider);
          try {
            const [token0, reserves] = await Promise.all([pair.token0(), pair.getReserves()]);
            const reserve0 = reserves.reserve0;
            const reserve1 = reserves.reserve1;
            const lowerToken0 = String(token0).toLowerCase();
            const lowerFrom = fromAddress.toLowerCase();
            const lowerTo = toAddress.toLowerCase();

            reserveIn = lowerToken0 === lowerFrom ? reserve0 : reserve1;
            reserveOut = lowerToken0 === lowerTo ? reserve0 : reserve1;
            reserveRate = calcRateString(
              reserveIn,
              fromDecimals,
              reserveOut,
              toDecimals,
              fromSymbol,
              toSymbol,
            );
          } catch {}
        }

        let amountOut = 0n;
        if (nextAmount && Number(nextAmount) > 0) {
          let amountIn;
          try {
            amountIn = parseTokenAmount(nextAmount, fromDecimals);
          } catch {
            amountIn = 0n;
          }

          if (amountIn > 0n) {
            const amounts = await contracts.router.getAmountsOut(amountIn, [fromAddress, toAddress]);
            amountOut = amounts[amounts.length - 1];
          }
        }

        setQuoteState({ amountOut, reserveRate, reserveIn, reserveOut });
      } catch (error) {
        setQuoteState({ amountOut: 0n, reserveRate: "", reserveIn: 0n, reserveOut: 0n });
        notify({ type: "error", message: toErrorMessage(error, "读取兑换报价失败") });
      } finally {
        setQuoteLoading(false);
      }
    },
    [currentRoute.id, currentRoute.pairAddressFallback, fromKey, notify, routePairs, toKey, tokenMap, tokenState],
  );

  useEffect(() => {
    loadTokensAndBalances().catch((error) => {
      notify({ type: "error", message: toErrorMessage(error, "读取代币余额失败") });
    });
    loadRoutePairs().catch((error) => {
      notify({ type: "error", message: toErrorMessage(error, "读取交易对地址失败") });
    });
  }, [loadRoutePairs, loadTokensAndBalances, notify, refreshNonce]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchQuoteAndRate(amount).catch(() => {});
    }, 250);
    return () => window.clearTimeout(timer);
  }, [amount, fetchQuoteAndRate, refreshNonce]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (showSettings && settingsWrapRef.current && !settingsWrapRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [showSettings]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setIsReversed(false);
    setAmount("");
    setTransactionStatus("");
    setTransactionHash("");
    setQuoteState({ amountOut: 0n, reserveRate: "", reserveIn: 0n, reserveOut: 0n });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const routeFromQuery = params.get("route");
    if (!routeFromQuery) return;

    const targetRoute = SWAP_ROUTES.find((item) => item.id === routeFromQuery);
    if (!targetRoute) return;

    setActiveTab(targetRoute.id);
    setIsReversed(false);
    setAmount("");
    setTransactionStatus("");
    setTransactionHash("");
    setQuoteState({ amountOut: 0n, reserveRate: "", reserveIn: 0n, reserveOut: 0n });
  }, [location.search]);

  const handleToggleDirection = () => {
    setIsReversed((prev) => !prev);
    setAmount("");
    setTransactionStatus("");
    setTransactionHash("");
    setQuoteState({ amountOut: 0n, reserveRate: "", reserveIn: 0n, reserveOut: 0n });
  };

  const handleSetMax = () => {
    setAmount(formatUnits(fromToken.balance, fromToken.decimals));
  };

  const handleRefreshPrice = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await loadTokensAndBalances();
      await loadRoutePairs();
      await fetchQuoteAndRate(amount);
      notify({ type: "success", message: t("swap.notifications.priceRefreshed") });
    } catch (error) {
      notify({ type: "error", message: toErrorMessage(error, "刷新价格失败") });
    } finally {
      setIsRefreshing(false);
    }
  };

  const ensureSigner = useCallback(async () => {
    let currentAddress = address;
    if (!currentAddress) {
      try {
        currentAddress = await connect();
      } catch (error) {
        notify({ type: "error", message: toErrorMessage(error, "请先连接钱包") });
        return null;
      }
    }
    if (!currentAddress) return null;

    const signer = await getSigner();
    if (!signer) return null;

    const network = await signer.provider.getNetwork();
    if (Number(network.chainId) !== TBSC_CHAIN_ID) {
      notify({ type: "error", message: `请切换到 BSC Testnet（ChainId=${TBSC_CHAIN_ID}）` });
      return null;
    }

    try {
      await validateCoreContractAddresses(getReadProvider(), { includeRouter: true });
    } catch (error) {
      notify({ type: "error", message: toErrorMessage(error, "合约地址校验失败") });
      return null;
    }

    return { signer, currentAddress };
  }, [address, connect, getSigner, notify]);

  const handleConfirmSwap = async () => {
    if (isProcessing) return;

    let amountIn;
    try {
      amountIn = parseTokenAmount(amount, fromToken.decimals);
    } catch {
      notify({ type: "error", message: t("swap.notifications.invalidAmount") });
      return;
    }

    if (amountIn <= 0n) {
      notify({ type: "error", message: t("swap.notifications.invalidAmount") });
      return;
    }

    if (amountIn > fromToken.balance) {
      notify({
        type: "error",
        message: t("swap.notifications.insufficientBalance", {
          balance: formatTokenAmount(fromToken.balance, fromToken.decimals, 6),
          token: fromToken.symbol,
        }),
      });
      return;
    }

    const signerContext = await ensureSigner();
    if (!signerContext) return;

    const fromAddress = tokenMap[fromKey]?.address;
    const toAddress = tokenMap[toKey]?.address;
    if (!fromAddress || !toAddress) {
      notify({ type: "error", message: "兑换路径配置缺失" });
      return;
    }

    setIsProcessing(true);
    setTransactionStatus("pending");
    setTransactionHash("");
    notify({ type: "info", message: t("swap.notifications.requestProcessing") });

    try {
      const contracts = createCoreContracts(signerContext.signer);
      const fromTokenContract = createErc20Contract(fromAddress, signerContext.signer);

      const quoteAmounts = await contracts.router.getAmountsOut(amountIn, [fromAddress, toAddress]);
      const expectedOut = quoteAmounts[quoteAmounts.length - 1];
      const amountOutMin = (expectedOut * (10000n - slippageBps)) / 10000n;
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 20 * 60);

      const allowance = await fromTokenContract.allowance(signerContext.currentAddress, ADDRESSES.routerV2);
      if (allowance < amountIn) {
        notify({ type: "info", message: `正在授权 ${fromToken.symbol}...` });
        const approveTx = await fromTokenContract.approve(ADDRESSES.routerV2, amountIn);
        await approveTx.wait();
      }

      const tx = await contracts.router.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        [fromAddress, toAddress],
        signerContext.currentAddress,
        deadline,
      );

      setTransactionHash(tx.hash);
      await tx.wait();
      setTransactionStatus("success");
      notify({ type: "success", message: t("swap.notifications.swapSuccess", { from: fromToken.symbol, to: toToken.symbol }) });

      setAmount("");
      setRefreshNonce((prev) => prev + 1);
    } catch (error) {
      setTransactionStatus("");
      notify({ type: "error", message: toErrorMessage(error, "兑换失败") });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="relative overflow-hidden px-4 py-12 md:py-16">
      <div className="relative mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">{t("swap.title")}</h1>
          <p className="mt-2 text-sm text-slate-400">{t("swap.subtitle")}</p>
        </div>

        {!isExpectedChain(chainId) && address && (
          <div className="mx-auto mt-4 max-w-[520px] rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            检测到当前钱包网络非 BSC Testnet，请切换后再执行交易。
          </div>
        )}

        <div className="relative mx-auto mt-8 w-full max-w-[520px] overflow-hidden rounded-3xl border border-white/15 bg-white/[0.03] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:p-6">
          <div className="pointer-events-none absolute -left-24 -top-24 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(252,213,53,0.18)_0%,rgba(252,213,53,0)_70%)] blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(252,213,53,0.16)_0%,rgba(252,213,53,0)_72%)] blur-2xl" />

          <div className="relative z-10">
            <div>
              {SWAP_ROUTES.map((tab) => {
                const active = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectTab(tab.id)}
                    className={`mx-1 rounded-full px-4 py-2 text-sm transition ${
                      active
                        ? "morgan-btn-primary border-0 font-semibold text-[#111111] shadow-[0_10px_18px_rgba(0,0,0,0.44)]"
                        : "morgan-btn-secondary border border-transparent bg-transparent text-slate-300 hover:text-white"
                    }`}
                  >
                    {t(tab.labelKey)}
                  </button>
                );
              })}
            </div>

            <div ref={settingsWrapRef} className="relative mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettings((prev) => !prev)}
                className="morgan-btn-secondary inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-300"
              >
                <Icon icon="mdi:settings" width="16" />
              </button>
              {showSettings && (
                <div
                  className="glass-card absolute right-0 top-11 z-20 w-[280px] rounded-xl p-4 shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.90)", borderColor: "rgba(252, 213, 53, 0.38)" }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{t("swap.settings.title")}</p>
                    <button type="button" onClick={() => setShowSettings(false)} className="text-slate-400 transition hover:text-white">
                      <Icon icon="mdi:close" width="16" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">{t("swap.settings.slippageTolerance")}</p>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {[0.1, 0.5, 1.0, 2.0].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setSlippage(item);
                          setCustomSlippage("");
                        }}
                        className={`rounded-lg px-2 py-1.5 text-xs transition ${
                          slippage === item && customSlippage === ""
                            ? "morgan-btn-primary border-0 text-[#111111]"
                            : "morgan-btn-secondary text-slate-300 hover:text-white"
                        }`}
                      >
                        {item}%
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={customSlippage}
                      onChange={(event) => {
                        const value = event.target.value;
                        setCustomSlippage(value);
                        if (value !== "") {
                          const parsed = Number(value);
                          if (!Number.isNaN(parsed)) {
                            setSlippage(parsed);
                          }
                        }
                      }}
                      placeholder={t("swap.settings.customSlippage")}
                      className="h-6 w-full bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-500"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">{t("swap.settings.currentSlippage", { value: slippageValue })}</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-[#fcd535]/50">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>{t("swap.fields.from")}</span>
                <span>
                  {t("swap.fields.balance")}: {formatTokenAmount(fromToken.balance, fromToken.decimals, 6)} {fromToken.symbol}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.00"
                  className="no-number-spin h-10 w-full bg-transparent text-3xl font-bold text-white outline-none placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={handleSetMax}
                  className="morgan-btn-secondary rounded-md px-2 py-1 text-[10px] font-semibold text-slate-100"
                >
                  {t("swap.buttons.max")}
                </button>
                <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 ${fromUi.chipClass}`}>
                  <Icon icon={fromUi.icon} width="16" />
                  <span className="text-sm font-semibold">{fromToken.symbol}</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex h-6 items-center justify-center">
              <button
                type="button"
                onClick={handleToggleDirection}
                className="swap-switch-btn morgan-btn-secondary inline-flex h-9 w-9 items-center justify-center rounded-xl border-2 text-[#fcd535]"
              >
                <Icon icon="mdi:swap-vertical" width="17" className="swap-switch-icon" />
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-[#fcd535]/50">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>{t("swap.fields.to")}</span>
                <span>
                  {t("swap.fields.balance")}: {formatTokenAmount(toToken.balance, toToken.decimals, 6)} {toToken.symbol}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={estimateText}
                  placeholder="0.00"
                  className="h-10 w-full bg-transparent text-3xl font-bold text-white outline-none placeholder:text-white/20"
                />
                <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 ${toUi.chipClass}`}>
                  <Icon icon={toUi.icon} width="16" />
                  <span className="text-sm font-semibold">{toToken.symbol}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2 px-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t("swap.stats.exchangeRate")}</span>
                <span className="text-slate-300">{exchangeRateText}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pool reserves</span>
                <span className="text-slate-300">
                  {formatTokenAmount(quoteState.reserveIn, fromToken.decimals, 4)} / {formatTokenAmount(quoteState.reserveOut, toToken.decimals, 4)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t("swap.stats.priceImpact")}</span>
                <span className="text-emerald-400">≤ {slippageValue.toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t("swap.stats.liquidityFee")}</span>
                <span className="text-slate-300">Pancake V2 Fee</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t("swap.stats.minimumReceived")}</span>
                <span className="text-slate-300">
                  {minimumReceivedText} {toToken.symbol}
                </span>
              </div>
            </div>

            {transactionStatus && (
              <div
                className={`mt-5 rounded-xl border px-3 py-2 text-sm ${
                  transactionStatus === "success"
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                    : "border-sky-500/30 bg-sky-500/15 text-sky-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon icon={transactionStatus === "success" ? "mdi:check-circle" : "mdi:clock-outline"} width="16" />
                  <span>{t(`swap.tx.${transactionStatus}`)}</span>
                </div>
                {transactionHash && <p className="mt-1 truncate text-xs opacity-80">{t("swap.tx.hashLabel")}: {transactionHash}</p>}
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirmSwap}
              disabled={!amount || isProcessing || quoteLoading}
              className={`morgan-btn-primary mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold ${
                !amount || isProcessing || quoteLoading ? "cursor-not-allowed opacity-55" : ""
              }`}
            >
              <Icon icon={isProcessing ? "mdi:refresh" : "mdi:check-circle"} className={isProcessing ? "animate-spin" : ""} width="16" />
              {isProcessing ? t("swap.buttons.processing") : "Confirm Swap (Exact In)"}
            </button>

            <button
              type="button"
              onClick={handleRefreshPrice}
              disabled={isRefreshing}
              className="morgan-btn-secondary mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl text-xs font-semibold"
            >
              <Icon icon="mdi:refresh" className={isRefreshing || quoteLoading ? "animate-spin" : ""} width="14" />
              {isRefreshing ? t("swap.buttons.refreshing") : t("swap.buttons.refreshPrice")}
            </button>

            <p className="mt-4 text-xs leading-5 text-slate-500">{t(currentRoute.helperKey)}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2">
            <Icon icon="mdi:shield-check" width="14" />
            {t("swap.tags.audit")}
          </span>
          <span className="inline-flex items-center gap-2">
            <Icon icon="mdi:speedometer" width="14" />
            {t("swap.tags.fastConfirm")}
          </span>
          <span className="inline-flex items-center gap-2">
            <Icon icon="mdi:swap-horizontal-circle-outline" width="14" />
            RouterV2 exact-in
          </span>
        </div>
      </div>
    </section>
  );
}
