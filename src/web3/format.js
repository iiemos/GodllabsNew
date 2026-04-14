import { formatUnits, parseUnits } from "ethers";

export function formatTokenAmount(value, decimals = 18, digits = 4) {
  try {
    const numeric = Number(formatUnits(value ?? 0n, decimals));
    return numeric.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    });
  } catch {
    return "0";
  }
}

export function parseTokenAmount(value, decimals = 18) {
  const raw = String(value ?? "").trim();
  if (!raw) return 0n;
  return parseUnits(raw, decimals);
}

export function formatBps(bps) {
  const value = Number(bps ?? 0n) / 100;
  return `${value.toFixed(2)}%`;
}

export function formatTimestamp(unixSeconds) {
  const value = Number(unixSeconds ?? 0);
  if (!value) return "-";
  return new Date(value * 1000).toLocaleString();
}

export function formatCountdown(targetTimestamp) {
  const now = Math.floor(Date.now() / 1000);
  const diff = Number(targetTimestamp ?? 0) - now;
  if (diff <= 0) return "00:00:00";

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return days > 0 ? `${days}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
}

export function toErrorMessage(error, fallback = "Transaction failed") {
  const candidates = [
    error?.shortMessage,
    error?.reason,
    error?.data?.message,
    error?.error?.message,
    error?.message,
  ].filter(Boolean);

  if (!candidates.length) return fallback;

  const text = String(candidates[0]);
  const lower = text.toLowerCase();
  const revertedPrefix = "execution reverted: ";
  const index = text.toLowerCase().indexOf(revertedPrefix);
  if (index >= 0) {
    return text.slice(index + revertedPrefix.length).trim() || fallback;
  }

  if (
    lower.includes("could not decode result data") ||
    lower.includes("bad_data") ||
    lower.includes("missing revert data in call exception")
  ) {
    const label = error?.meta?.label ? ` ${error.meta.label}` : "";
    const address = error?.meta?.address ? ` ${error.meta.address}` : "";
    const chain = Number.isFinite(error?.meta?.chainId) ? ` chainId=${error.meta.chainId}` : "";
    return `合约返回数据无法解析，通常是地址/网络/ABI 不匹配导致。${label}${address}${chain}`.trim();
  }

  return text;
}

export function clampSlippage(slippage) {
  const value = Number(slippage);
  if (!Number.isFinite(value)) return 0.5;
  if (value < 0.01) return 0.01;
  if (value > 50) return 50;
  return value;
}
