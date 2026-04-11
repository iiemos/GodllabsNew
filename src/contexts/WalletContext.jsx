import { useConnectModal } from "@rainbow-me/rainbowkit";
import { BrowserProvider } from "ethers";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useConnect, useConnection, useDisconnect } from "wagmi";

const WalletContext = createContext(null);

function createNoProviderError() {
  const error = new Error("No wallet connector");
  error.code = "NO_PROVIDER";
  return error;
}

function createInitialProviderState() {
  return null;
}

export function WalletProvider({ children }) {
  const connection = useConnection();
  const { openConnectModal } = useConnectModal();
  const { isPending: connectPending } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const [browserProvider, setBrowserProvider] = useState(createInitialProviderState);

  const address = connection.address ?? "";
  const chainId = typeof connection.chainId === "number" ? connection.chainId : null;
  const isConnecting = connectPending || connection.isConnecting || connection.isReconnecting;

  const latestAddressRef = useRef(address);

  useEffect(() => {
    latestAddressRef.current = address;
  }, [address]);

  useEffect(() => {
    const connector = connection.connector;
    let cancelled = false;

    if (!connector?.getProvider) {
      setBrowserProvider(null);
      return undefined;
    }

    connector
      .getProvider()
      .then((provider) => {
        if (cancelled) return;
        if (provider?.request) {
          setBrowserProvider(new BrowserProvider(provider));
          return;
        }
        setBrowserProvider(null);
      })
      .catch(() => {
        if (!cancelled) {
          setBrowserProvider(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [connection.connector]);

  const waitForConnectedAddress = useCallback(async () => {
    if (typeof window === "undefined") return "";

    return new Promise((resolve) => {
      const startedAt = Date.now();
      const timeoutMs = 20_000;
      const timer = window.setInterval(() => {
        const current = latestAddressRef.current;
        if (current) {
          window.clearInterval(timer);
          resolve(current);
          return;
        }

        if (Date.now() - startedAt >= timeoutMs) {
          window.clearInterval(timer);
          resolve("");
        }
      }, 200);
    });
  }, []);

  const connect = useCallback(async () => {
    if (latestAddressRef.current) {
      return latestAddressRef.current;
    }

    if (!openConnectModal) {
      throw createNoProviderError();
    }

    openConnectModal();
    return waitForConnectedAddress();
  }, [openConnectModal, waitForConnectedAddress]);

  const disconnect = useCallback(() => {
    disconnectAsync().catch(() => {});
  }, [disconnectAsync]);

  const getBrowserProvider = useCallback(() => {
    return browserProvider;
  }, [browserProvider]);

  const getSigner = useCallback(async () => {
    let provider = browserProvider;
    if (!provider && connection.connector?.getProvider) {
      try {
        const rawProvider = await connection.connector.getProvider();
        if (rawProvider?.request) {
          provider = new BrowserProvider(rawProvider);
        }
      } catch {}
    }

    if (!provider) return null;
    try {
      return await provider.getSigner();
    } catch {
      return null;
    }
  }, [browserProvider, connection.connector]);

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
