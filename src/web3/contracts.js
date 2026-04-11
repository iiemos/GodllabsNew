import { Contract } from "ethers";
import goldStakingAbi from "../../合约配置/GoldStakingProtocol.json";
import lpStakingAbi from "../../合约配置/LpStakingProtocol.json";
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

export function createCoreContracts(runner) {
  return {
    gold: new Contract(ADDRESSES.goldProxy, goldStakingAbi, runner),
    lp: new Contract(ADDRESSES.lpProxy, lpStakingAbi, runner),
    godl: new Contract(ADDRESSES.godl, erc20Abi, runner),
    usgd: new Contract(ADDRESSES.usgd, erc20Abi, runner),
    gdl: new Contract(ADDRESSES.gdl, erc20Abi, runner),
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
