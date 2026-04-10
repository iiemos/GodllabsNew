import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BrowserProvider } from "ethers";

const WALLET_STORAGE_KEY = "godl_wallet_address";

const WalletContext = createContext(null);

function getEthereum() {
  if (typeof window === "undefined") return undefined;
  return window.ethereum;
}

function parseChainId(value) {
  if (value == null) return null;
  if (typeof value === "bigint") {
    const fromBigint = Number(value);
    return Number.isFinite(fromBigint) ? fromBigint : null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return null;

    if (raw.startsWith("0x") || raw.startsWith("0X")) {
      const fromHex = Number.parseInt(raw, 16);
      return Number.isFinite(fromHex) ? fromHex : null;
    }

    if (/^\d+$/.test(raw)) {
      const fromDec = Number.parseInt(raw, 10);
      return Number.isFinite(fromDec) ? fromDec : null;
    }
  }

  const fallback = Number(value);
  return Number.isFinite(fallback) ? fallback : null;
}

async function resolveChainId(ethereum) {
  if (!ethereum) return null;

  if (ethereum.request) {
    try {
      const chainHex = await ethereum.request({ method: "eth_chainId" });
      const parsed = parseChainId(chainHex);
      if (parsed != null) return parsed;
    } catch {}
  }

  try {
    const provider = new BrowserProvider(ethereum);
    const network = await provider.getNetwork();
    const parsed = parseChainId(network.chainId);
    if (parsed != null) return parsed;
  } catch {}

  const fromProp = parseChainId(ethereum.chainId);
  if (fromProp != null) return fromProp;

  return null;
}

export function WalletProvider({ children }) {
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState(() => parseChainId(getEthereum()?.chainId));
  const [isConnecting, setIsConnecting] = useState(false);

  const syncFromWallet = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    const [accounts, resolvedChainId] = await Promise.all([
      ethereum.request ? ethereum.request({ method: "eth_accounts" }) : [],
      resolveChainId(ethereum),
    ]);

    const first = Array.isArray(accounts) ? accounts[0] ?? "" : "";
    setAddress(first);
    setChainId(resolvedChainId);

    if (typeof window !== "undefined") {
      if (first) {
        window.localStorage.setItem(WALLET_STORAGE_KEY, first);
      } else {
        window.localStorage.removeItem(WALLET_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedAddress = window.localStorage.getItem(WALLET_STORAGE_KEY);
    if (savedAddress) {
      setAddress(savedAddress);
    }

    const injectedChainId = parseChainId(getEthereum()?.chainId);
    if (injectedChainId != null) {
      setChainId(injectedChainId);
    }

    syncFromWallet().catch(() => {});
  }, [syncFromWallet]);

  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum?.on) return;

    const onAccountsChanged = (accounts) => {
      const first = Array.isArray(accounts) ? accounts[0] ?? "" : "";
      setAddress(first);
      if (typeof window !== "undefined") {
        if (first) {
          window.localStorage.setItem(WALLET_STORAGE_KEY, first);
        } else {
          window.localStorage.removeItem(WALLET_STORAGE_KEY);
        }
      }

      resolveChainId(ethereum).then(setChainId).catch(() => {});
    };

    const onChainChanged = () => {
      resolveChainId(ethereum).then(setChainId).catch(() => {});
    };

    ethereum.on("accountsChanged", onAccountsChanged);
    ethereum.on("chainChanged", onChainChanged);

    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener("accountsChanged", onAccountsChanged);
        ethereum.removeListener("chainChanged", onChainChanged);
      }
    };
  }, []);

  const connect = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum?.request) {
      const missingProviderError = new Error("No injected wallet");
      missingProviderError.code = "NO_PROVIDER";
      throw missingProviderError;
    }

    setIsConnecting(true);
    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const first = Array.isArray(accounts) ? accounts[0] ?? "" : "";
      setAddress(first);
      if (typeof window !== "undefined") {
        if (first) {
          window.localStorage.setItem(WALLET_STORAGE_KEY, first);
        } else {
          window.localStorage.removeItem(WALLET_STORAGE_KEY);
        }
      }

      const resolvedChainId = await resolveChainId(ethereum);
      setChainId(resolvedChainId);

      return first;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(WALLET_STORAGE_KEY);
    }
  }, []);

  const getBrowserProvider = useCallback(() => {
    const ethereum = getEthereum();
    if (!ethereum) return null;
    return new BrowserProvider(ethereum);
  }, []);

  const getSigner = useCallback(async () => {
    const provider = getBrowserProvider();
    if (!provider) return null;
    return provider.getSigner();
  }, [getBrowserProvider]);

  const contextValue = useMemo(
    () => ({
      address,
      chainId,
      isConnecting,
      connect,
      disconnect,
      getBrowserProvider,
      getSigner,
    }),
    [address, chainId, isConnecting, connect, disconnect, getBrowserProvider, getSigner],
  );

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
