const env = import.meta.env;

const fallbackAddresses = {
  mockUsdt: "0x55d398326f99059fF775485246999027B3197955",
  usgd: "0x4828a032fE584Fe27ce0b6AC7065f60ebbFd45F0",
  godl: "0x01875a9668845DEB2B26010570521073d3f7d4aE",
  gdl: "0xf0474C0f36035E5Fdc72eAd145F8de67ffD6A3Ea",
  goldProxy: "0xd227c98015A8842afF0DA1587Be859B9632DB1F8",
  lpProxy: "0x4Eef4d00d72134f10eA3dfe2405e87667ac22eFB",
  lp0: "0x1C04325D9C975427C83578a4eb26AFdEE678d4D8",
  lp1: "0xBB04AD248F3c178c806c40540FEc6ABaE8978537",
  lp2: "0x891c0E8f18f80B951F38D06e93De81e710B9D721",
  routerV2: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
};

function fromEnv(key, fallbackValue) {
  return env[`VITE_${key}`] || env[key] || fallbackValue;
}

export const TBSC_CHAIN_ID = Number(env.VITE_CHAIN_ID || 56);
export const TBSC_RPC_URL = env.VITE_RPC_URL || "https://bsc-rpc.publicnode.com";
export const BSC_SCAN_BASE_URL = TBSC_CHAIN_ID === 56 ? "https://bscscan.com" : "https://testnet.bscscan.com";

export const ADDRESSES = Object.freeze({
  goldProxy: fromEnv("GOLD_PROXY_ADDRESS", fallbackAddresses.goldProxy),
  lpProxy: fallbackAddresses.lpProxy,
  usgd: fromEnv("USGD_TOKEN_ADDRESS", fallbackAddresses.usgd),
  godl: fromEnv("GODL_TOKEN_ADDRESS", fallbackAddresses.godl),
  gdl: fromEnv("GDL_TOKEN_ADDRESS", fallbackAddresses.gdl),
  usdt: fromEnv("USDT_TOKEN_ADDRESS", fallbackAddresses.mockUsdt),
  lp0: fromEnv("LP0_ADDRESS", fallbackAddresses.lp0),
  lp1: fromEnv("LP1_ADDRESS", fallbackAddresses.lp1),
  lp2: fromEnv("LP2_ADDRESS", fallbackAddresses.lp2),
  routerV2: fromEnv("PANCAKE_ROUTER_V2_ADDRESS", fallbackAddresses.routerV2),
});

export const LP_POOLS = Object.freeze([
  {
    pid: 0,
    pair: "USGD-USDT LP",
    tokens: ["usgd", "usdt"],
    lpAddress: ADDRESSES.lp0,
    coefficient: 0.1,
  },
  {
    pid: 1,
    pair: "GODL-USGD LP",
    tokens: ["godl", "usgd"],
    lpAddress: ADDRESSES.lp1,
    coefficient: 0.3,
  },
  {
    pid: 2,
    pair: "GDL-USGD LP",
    tokens: ["gdl", "usgd"],
    lpAddress: ADDRESSES.lp2,
    coefficient: 0.6,
  },
]);

export const GOLD_TERM_OPTIONS = Object.freeze([
  { termType: 0, label: "3M" },
  { termType: 1, label: "6M" },
  { termType: 2, label: "12M" },
]);

export const TOKEN_ORDER = Object.freeze([
  { key: "usdt", symbol: "USDT", address: ADDRESSES.usdt, defaultDecimals: 18 },
  { key: "usgd", symbol: "USGD", address: ADDRESSES.usgd, defaultDecimals: 18 },
  { key: "godl", symbol: "GODL", address: ADDRESSES.godl, defaultDecimals: 18 },
  { key: "gdl", symbol: "GDL", address: ADDRESSES.gdl, defaultDecimals: 18 },
]);

export const SWAP_ROUTES = Object.freeze([
  {
    id: "usdt-usgd",
    labelKey: "swap.tabs.usdtUsgd.label",
    helperKey: "swap.tabs.usdtUsgd.helper",
    poolPid: 0,
    pairAddressFallback: ADDRESSES.lp0,
    fromKey: "usdt",
    toKey: "usgd",
  },
  {
    id: "usgd-godl",
    labelKey: "swap.tabs.usgdGodl.label",
    helperKey: "swap.tabs.usgdGodl.helper",
    poolPid: 1,
    pairAddressFallback: ADDRESSES.lp1,
    fromKey: "usgd",
    toKey: "godl",
  },
  {
    id: "usgd-gdl",
    labelKey: "swap.tabs.usgdGdl.label",
    helperKey: "swap.tabs.usgdGdl.helper",
    poolPid: 2,
    pairAddressFallback: ADDRESSES.lp2,
    fromKey: "usgd",
    toKey: "gdl",
  },
]);
