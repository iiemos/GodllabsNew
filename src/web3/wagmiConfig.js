import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createConnector, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { bsc, bscTestnet } from "wagmi/chains";
import { TBSC_CHAIN_ID, TBSC_RPC_URL } from "./config";

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000000";

function getMetaMaskProvider() {
  if (typeof window === "undefined") return undefined;
  const ethereum = window.ethereum;
  if (!ethereum) return undefined;

  const providers = Array.isArray(ethereum.providers) ? ethereum.providers : [ethereum];
  return providers.find((provider) => provider?.isMetaMask) || undefined;
}

const metaMaskOnlyWallet = () => ({
  id: "metamask-only",
  name: "MetaMask",
  rdns: "io.metamask",
  iconUrl: "/static/logo.png",
  iconBackground: "#111111",
  installed: typeof window !== "undefined" ? Boolean(getMetaMaskProvider()) : undefined,
  createConnector: (walletDetails) =>
    createConnector((config) => ({
      ...injected({
        shimDisconnect: true,
        target: {
          id: "metaMask",
          name: "MetaMask",
          provider: getMetaMaskProvider,
        },
      })(config),
      ...walletDetails,
    })),
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
      wallets: [metaMaskOnlyWallet],
    },
  ],
  transports: {
    [TBSC_CHAIN_ID]: http(TBSC_RPC_URL),
  },
  ssr: false,
});
