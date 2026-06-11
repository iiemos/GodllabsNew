const env = import.meta.env;

const fallbackAddresses = Object.freeze({
  mockUsdt: "",
  usgd: "",
  godl: "",
  gdl: "",
  goldProxy: "",
  lpProxy: "",
  lp0: "",
  lp1: "",
  lp2: "",
  routerV2: "",
});

export const DEMO_MODE = String(env.VITE_DEMO_MODE ?? "true").toLowerCase() !== "false";

function fromEnv(key, fallbackValue) {
  if (DEMO_MODE) return "";
  return env[`VITE_${key}`] || env[key] || fallbackValue;
}

export const TBSC_CHAIN_ID = Number(env.VITE_CHAIN_ID || 56);
export const TBSC_RPC_URL = DEMO_MODE ? "" : env.VITE_RPC_URL || "https://bsc-rpc.publicnode.com";
export const BSC_SCAN_BASE_URL = TBSC_CHAIN_ID === 56 ? "https://bscscan.com" : "https://testnet.bscscan.com";

export const ADDRESSES = Object.freeze({
  goldProxy: fromEnv("GOLD_PROXY_ADDRESS", fallbackAddresses.goldProxy),
  lpProxy: fromEnv("LP_PROXY_ADDRESS", fallbackAddresses.lpProxy),
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
