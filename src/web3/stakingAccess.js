const WHITELIST_VALUES = String(import.meta.env.VITE_STAKING_WHITELIST_ADDRESSES ?? "")
  .split(/[\s,;]+/)
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

const ALLOW_ALL = WHITELIST_VALUES.includes("*");
const WHITELIST = new Set(WHITELIST_VALUES.filter((item) => item !== "*"));

export function isStakingWhitelisted(address) {
  if (!address) return false;
  if (ALLOW_ALL) return true;
  return WHITELIST.has(address.toLowerCase());
}
