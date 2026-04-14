const env = import.meta.env;

const fallbackAddresses = {
  mockUsdt: "0xF5e8F3A4C0a41394bd4F1699B22bCae5E62b6E49",
  usgd: "0x47065d4979cc5Cb8E0B7BE5E4ec8F88969C83746",
  godl: "0xd6ad237E1c2430d1C88a6f43B1f6655425eAa483",
  gdl: "0xebe71b55F31798Ac34E96e1e82D6b726Ad29e026",
  goldProxy: "0x937d0f1413CE78beD34C8Cf2f7c0DEFF729a4462",
  lpProxy: "0x73BAc544A0CaBf141cc763b987AA43666Ca73754",
  lp0: "0x98E744b538d53d8d5eA5e0B5FaeCAD01d2C6b4a3",
  lp1: "0xeA28c0500F9127941071b96Ec4f22dB77d7FAcB3",
  lp2: "0x08eF334B67d6b1A7a9E161830d64bB8a9c264652",
  routerV2: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
};

function fromEnv(key, fallbackValue) {
  return env[`VITE_${key}`] || env[key] || fallbackValue;
}

export const TBSC_CHAIN_ID = Number(env.VITE_CHAIN_ID || 97);
export const TBSC_RPC_URL = env.VITE_RPC_URL || "https://bsc-testnet-rpc.publicnode.com";

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
]);
