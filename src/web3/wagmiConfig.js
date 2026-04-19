import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createConnector, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { bsc, bscTestnet } from "wagmi/chains";
import { TBSC_CHAIN_ID, TBSC_RPC_URL } from "./config";

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000000";

function getInjectedProvider(filter) {
  if (typeof window === "undefined") return undefined;
  const providers = [];

  if (window.ethereum) {
    if (Array.isArray(window.ethereum.providers)) {
      providers.push(...window.ethereum.providers);
    } else {
      providers.push(window.ethereum);
    }
  }

  if (window.phantom?.ethereum) {
    providers.push(window.phantom.ethereum);
  }

  return providers.find((provider) => filter(provider)) || undefined;
}

function getMetaMaskProvider() {
  return getInjectedProvider((provider) => provider?.isMetaMask);
}

function getPhantomProvider() {
  return getInjectedProvider((provider) => provider?.isPhantom);
}

function createInjectedWallet({ id, name, rdns, providerResolver }) {
  return () => ({
    id,
    name,
    rdns,
    iconUrl: "/static/logo.png",
    iconBackground: "#111111",
    installed: typeof window !== "undefined" ? Boolean(providerResolver()) : undefined,
    createConnector: (walletDetails) =>
      createConnector((config) => ({
        ...injected({
          shimDisconnect: true,
          target: {
            id,
            name,
            provider: providerResolver,
          },
        })(config),
        ...walletDetails,
      })),
  });
}

const metaMaskWallet = createInjectedWallet({
  id: "metaMask",
  name: "MetaMask",
  rdns: "io.metamask",
  providerResolver: getMetaMaskProvider,
});

const phantomWallet = createInjectedWallet({
  id: "phantom",
  name: "Phantom",
  rdns: "app.phantom",
  providerResolver: getPhantomProvider,
});

export const wagmiConfig = getDefaultConfig({
  appName: "GODL Labs",
  appDescription: "GODL Labs DApp",
  appUrl: "https://godl.io",
  projectId: walletConnectProjectId,
  chains: [TBSC_CHAIN_ID === 56 ? bsc : bscTestnet],
  wallets: [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, phantomWallet],
    },
  ],
  transports: {
    [TBSC_CHAIN_ID]: http(TBSC_RPC_URL),
  },
  ssr: false,
});
