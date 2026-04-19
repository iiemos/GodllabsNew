import { Contract, isAddress } from "ethers";
import gdlTokenAbi from "../abi/GDLToken.json";
import godlTokenAbi from "../abi/GODLToken.json";
import goldStakingAbi from "../abi/GoldStakingProtocol.json";
import lpStakingAbi from "../abi/LpStakingProtocol.json";
import usgdTokenAbi from "../abi/USGDToken.json";
import { ADDRESSES } from "./config";
import { erc20Abi } from "./erc20Abi";

export const routerV2Abi = [
  {
    type: "function",
    name: "getAmountsOut",
    stateMutability: "view",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "path", type: "address[]" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "swapExactTokensForTokens",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "addLiquidity",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "amountADesired", type: "uint256" },
      { name: "amountBDesired", type: "uint256" },
      { name: "amountAMin", type: "uint256" },
      { name: "amountBMin", type: "uint256" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [
      { name: "amountA", type: "uint256" },
      { name: "amountB", type: "uint256" },
      { name: "liquidity", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "removeLiquidity",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "liquidity", type: "uint256" },
      { name: "amountAMin", type: "uint256" },
      { name: "amountBMin", type: "uint256" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [
      { name: "amountA", type: "uint256" },
      { name: "amountB", type: "uint256" },
    ],
  },
];

export const pairAbi = [
  {
    type: "function",
    name: "token0",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "token1",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "getReserves",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "reserve0", type: "uint112" },
      { name: "reserve1", type: "uint112" },
      { name: "blockTimestampLast", type: "uint32" },
    ],
  },
];

const contractCodeCache = new Map();

function buildAddressError(label, address) {
  const error = new Error(`[${label}] invalid contract address: ${String(address || "")}`);
  error.code = "INVALID_CONTRACT_ADDRESS";
  error.meta = { label, address };
  return error;
}

function buildNoCodeError(label, address, chainId) {
  const chainPart = Number.isFinite(chainId) ? ` chainId=${chainId}` : " chainId=unknown";
  const error = new Error(
    `[${label}] no contract code at ${address}.${chainPart}. Check contract address/network/ABI version.`,
  );
  error.code = "CONTRACT_CODE_NOT_FOUND";
  error.meta = { label, address, chainId };
  return error;
}

async function resolveChainId(provider) {
  try {
    const network = await provider.getNetwork();
    return Number(network.chainId);
  } catch {
    return null;
  }
}

export async function assertContractCode(provider, address, label) {
  if (!provider?.getCode) {
    const error = new Error("Provider does not support getCode");
    error.code = "INVALID_PROVIDER";
    throw error;
  }

  if (!address || !isAddress(address)) {
    throw buildAddressError(label, address);
  }

  const chainId = await resolveChainId(provider);
  const cacheKey = `${Number.isFinite(chainId) ? chainId : "unknown"}:${String(address).toLowerCase()}`;
  if (contractCodeCache.has(cacheKey)) return;

  const code = await provider.getCode(address);
  if (!code || code === "0x") {
    throw buildNoCodeError(label, address, chainId);
  }

  contractCodeCache.set(cacheKey, true);
}

export async function validateCoreContractAddresses(provider, options = {}) {
  const includeRouter = Boolean(options.includeRouter);

  const checks = [
    assertContractCode(provider, ADDRESSES.goldProxy, "GoldStakingProtocol Proxy"),
    assertContractCode(provider, ADDRESSES.lpProxy, "LpStakingProtocol Proxy"),
    assertContractCode(provider, ADDRESSES.godl, "GODL Token"),
    assertContractCode(provider, ADDRESSES.gdl, "GDL Token"),
    assertContractCode(provider, ADDRESSES.usgd, "USGD Token"),
    assertContractCode(provider, ADDRESSES.usdt, "USDT Token"),
  ];

  if (includeRouter) {
    checks.push(assertContractCode(provider, ADDRESSES.routerV2, "Pancake RouterV2"));
  }

  await Promise.all(checks);
}

export function createCoreContracts(runner) {
  return {
    gold: new Contract(ADDRESSES.goldProxy, goldStakingAbi, runner),
    lp: new Contract(ADDRESSES.lpProxy, lpStakingAbi, runner),
    godl: new Contract(ADDRESSES.godl, godlTokenAbi, runner),
    usgd: new Contract(ADDRESSES.usgd, usgdTokenAbi, runner),
    gdl: new Contract(ADDRESSES.gdl, gdlTokenAbi, runner),
    usdt: new Contract(ADDRESSES.usdt, erc20Abi, runner),
    router: new Contract(ADDRESSES.routerV2, routerV2Abi, runner),
  };
}

export function createErc20Contract(address, runner) {
  return new Contract(address, erc20Abi, runner);
}

export function createPairContract(address, runner) {
  return new Contract(address, pairAbi, runner);
}
