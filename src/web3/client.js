import { JsonRpcProvider } from "ethers";
import { DEMO_MODE, TBSC_CHAIN_ID, TBSC_RPC_URL } from "./config";

let sharedReadProvider;

export function getReadProvider() {
  if (DEMO_MODE) {
    throw new Error("Read provider is disabled in demo mode.");
  }

  if (!sharedReadProvider) {
    const networkName = TBSC_CHAIN_ID === 56 ? "bsc" : "bsc-testnet";
    sharedReadProvider = new JsonRpcProvider(TBSC_RPC_URL, {
      chainId: TBSC_CHAIN_ID,
      name: networkName,
    });
  }
  return sharedReadProvider;
}

export function isExpectedChain(chainId) {
  return Number(chainId) === TBSC_CHAIN_ID;
}
