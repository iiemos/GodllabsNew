import { JsonRpcProvider } from "ethers";
import { TBSC_CHAIN_ID, TBSC_RPC_URL } from "./config";

let sharedReadProvider;

export function getReadProvider() {
  if (!sharedReadProvider) {
    sharedReadProvider = new JsonRpcProvider(TBSC_RPC_URL, {
      chainId: TBSC_CHAIN_ID,
      name: "bsc-testnet",
    });
  }
  return sharedReadProvider;
}

export function isExpectedChain(chainId) {
  return Number(chainId) === TBSC_CHAIN_ID;
}
