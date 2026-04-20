# 前端对接文档（260418）


> 适用合约：`GoldStakingProtocol`、`LpStakingProtocol`（代理地址）
>
> 本文已按当前新方法更新。旧版 `subscribe/subscriptions/nextSubscriptionId` 已废弃，统一使用 `purchase/purchases/nextPurchaseId`。


## 1. 合约与地址


| 模块 | 说明 |
|---|---|
| `GOLD_PROXY_ADDRESS` | `GoldStakingProtocol` 代理地址 |
| `LP_PROXY_ADDRESS` | `LpStakingProtocol` 代理地址 |
| `USGD_TOKEN_ADDRESS` | USGD token |
| `GODL_TOKEN_ADDRESS` | GODL token |
| `GDL_TOKEN_ADDRESS` | GDL token |


---


## 2. GoldStakingProtocol 对接


### 2.1 核心业务规则（前端必须知道）


- 认购入口是 `purchase`，不是 `subscribe`。
- GDL 奖励是 **3 秒步进释放**，通过 `pendingGdl(purchaseId)` 随时查询。
- 到期收益通过 `claimMatured` 一次性领取 USGD（本金+收益）。
- 用户领取 GDL 时，按链上 DEX 实时价格折算，且受 `gdlBonusCapUsdE18` 价值上限约束。


### 2.2 用户常用读方法（view）


- `nextPurchaseId() -> uint256`
- `purchases(uint256 purchaseId) -> (owner, godlAmount, usgdPrincipalGross, upfrontFeeUsgd, termType, startAt, endAt, gdlBonusCapUsdE18, maturedClaimed, settlementAdjustmentUsgd, claimedGdlValueUsdE18)`
- `termConfigs(uint256 termType) -> (duration, yieldDuration, months, apyBps, gdlBonusBps)`
- `pendingMatured(uint256 purchaseId) -> (usgdPrincipalOut, usgdYieldOut)`
- `pendingGdl(uint256 purchaseId) -> (gdlOut)`
- `MIN_PURCHASE_GODL()`
- `GDL_RELEASE_STEP_SECONDS()`（当前为 3）
- `gdlBonusMultiplierBps()`
- `whitelistMode()` / `whitelisted(address)` / `blacklisted(address)` / `paused()`
- `feeTreasury()` / `pancakeRouter()` / `maxSlippageBps()` / `gdlUsgdPair()`


### 2.3 用户写方法（需签名）


- `purchase(uint256 godlAmount, uint256 termType) returns (uint256 purchaseId)`
  - 2 参数版默认按合约内 5% 滑点估算。
- `purchase(uint256 godlAmount, uint256 termType, uint256 minUsgdOut) returns (uint256 purchaseId)`
  - 3 参数版可由前端自定义 `minUsgdOut`。
- `claimGdl(uint256 purchaseId) returns (uint256 gdlOut)`
- `claimMatured(uint256 purchaseId) returns (uint256 usgdPrincipalOut, uint256 usgdYieldOut)`


调用前置：


- 先 `GODL.approve(goldProxy, godlAmount)`。
- `purchase` 最小数量：`godlAmount >= MIN_PURCHASE_GODL`（当前 0.1 GODL）。


### 2.4 管理后台方法（管理员角色）


- `setFeeTreasury(address)`
- `setTermConfig(termType, duration, months, apyBps, gdlBonusBps)`
- `setTermConfigWithYieldDuration(termType, duration, yieldDuration, months, apyBps, gdlBonusBps)`
- `setGdlBonusMultiplierBps(uint256)`
- `setSettlementAdjustmentUsgd(purchaseId, int256 adjustmentUsgd)`
- `setWhitelistMode(bool)` / `setWhitelisted(address,bool)` / `setBlacklisted(address,bool)`
- `setPancakeRouter(address)` / `setMaxSlippageBps(uint256)` / `setGdlUsgdPair(address)`
- `pause()` / `unpause()`
- `transferUsgdOwnership(address newOwner)`（把 USGD owner 权限从 Gold 转出）


### 2.5 关键事件（前端监听）


- `Purchased(purchaseId, user, godlAmount, usgdPrincipalGross, upfrontFeeUsgd, termType, endAt)`
- `GdlClaimed(purchaseId, user, gdlOut, valueUsdE18)`
- `MaturedClaimed(purchaseId, user, usgdPrincipalOut, usgdYield)`
- `SettlementAdjustmentUpdated(purchaseId, adjustmentUsgd)`
- `TermConfigUpdated(termType, duration, months, apyBps, gdlBonusBps)`


### 2.6 常见错误（前端映射）


- `InsufficientAmount`：认购数量太小（低于最小值）
- `InvalidTerm`：期限非法（非 0/1/2）
- `SlippageExceeded`：滑点超限
- `NotMatured`：未到期
- `AlreadyMaturedClaimed`：到期收益已领
- `NotPurchaseOwner` / `PurchaseNotFound`：订单归属或订单不存在
- `NotListed`：白黑名单限制
- `ZeroAmount`：可领取为 0


### 2.7 前端最小流程示例（ethers v6）


```ts
// 1) approve GODL
await godl.approve(goldProxy, godlAmount);


// 2) purchase（建议用3参数版）
const tx = await gold.purchase(godlAmount, termType, minUsgdOut);
const rc = await tx.wait();
const ev = rc.logs.find((l: any) => l.fragment?.name === "Purchased");
const purchaseId = ev?.args?.purchaseId;


// 3) 查询可领GDL（3秒步进）
const gdlPending = await gold.pendingGdl(purchaseId);


// 4) 到期后领取USGD
const [p, y] = await gold.pendingMatured(purchaseId);
if (p > 0n || y > 0n) await (await gold.claimMatured(purchaseId)).wait();
```


---


## 3. LpStakingProtocol 对接


### 3.1 用户常用读方法（view）


- `pools(uint8 pid) -> (lpToken, allocPoint, accRewardPerShare, lastRewardTime, totalStaked)`，pid 仅 `0/1/2`
- `users(uint8 pid, address user) -> (amount, rewardDebt, pendingCredit)`
- `pendingMining(uint8 pid, address user) -> uint256`
- `poolEnabled(uint8 pid) -> bool`
- `pendingBurnableFromDisabledPools() -> uint256`
- `dailyEmission(uint256 dayIndex) -> uint256`
- `startTimestamp()` / `emittedTotal()` / `EMISSION_CAP()`
- `whitelistMode()` / `whitelisted(address)` / `blacklisted(address)` / `paused()`


### 3.2 用户写方法（需签名）


- `deposit(uint8 pid, uint256 amount)`
- `withdraw(uint8 pid, uint256 amount)`
- `claim(uint8 pid) returns (uint256 rewardOut)`
- `emergencyWithdraw(uint8 pid)`（放弃未领奖励）
- `updatePool(uint8 pid)` / `massUpdatePools()` / `syncDay()`（一般由后台/keeper调用）


调用前置：


- 对应 LP token 先 `approve(lpProxy, amount)`。


### 3.3 关键事件


- `Deposited(user, pid, amount)`
- `Withdrawn(user, pid, amount)`
- `Claimed(user, pid, amount)`
- `SyncDay(at)`
- `PoolEnabledUpdated(pid, enabled)`
- `EmissionParamsUpdated(dailyEmissionRate, dailyDecayRate)`
- `PoolAllocPointsUpdated(alloc0, alloc1, alloc2)`
- `DisabledPoolRewardsBurned(amount, burnAddress)`


### 3.4 常见错误


- `InvalidPid`：pid 非 0/1/2
- `PoolDisabled`：矿池被关闭
- `NotStarted`：挖矿未开始
- `ZeroAmount`：金额为 0
- `InsufficientAmount`：提取数量超过已质押
- `NotListed`：白黑名单限制


### 3.5 管理后台方法（管理员角色）


- `setEmissionParams(uint256 dailyEmission, uint256 dailyDecay)`
- `setPoolAllocPoints(uint256[3] allocPoints)`（总和必须 10000）
- `setPoolEnabled(uint8 pid, bool enabled)`（关闭池要求当前池无质押）
- `burnDisabledPoolAccrued()`（把关闭池累计奖励转入 `0x...dEaD`）


---


## 4. 与旧版接口差异（重点给前端）


- `subscribe` -> `purchase`
- `subscriptions` -> `purchases`
- `nextSubscriptionId` -> `nextPurchaseId`
- 事件 `Subscribed` -> `Purchased`
- 错误 `NotSubscriptionOwner` -> `NotPurchaseOwner`
- 新增后台方法：`transferUsgdOwnership(address)`（配合 USGD owner 交接）
- GDL 奖励改为 3 秒步进释放（`GDL_RELEASE_STEP_SECONDS=3`）


---


## 5. 页面接入 Checklist


- Gold认购页：`termConfigs + router报价 + purchase(3参数版)`
- Gold订单页：`purchases + pendingGdl + pendingMatured + claim`
- LP矿池页：`pools + users + pendingMining + deposit/withdraw/claim`
- 权限控制：统一读取 `paused/whitelist/blacklist`
- 监听事件：`Purchased/GdlClaimed/MaturedClaimed/Deposited/Claimed`



