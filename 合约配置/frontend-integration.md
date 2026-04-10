# 前端接入文档 — GoldStakingProtocol & LpStakingProtocol


## 一、合约地址（从 `.env` 获取）


| 合约 | 环境变量 |
|------|----------|
| GoldStakingProtocol（代理） | `GOLD_PROXY_ADDRESS` |
| LpStakingProtocol（代理） | `LP_PROXY_ADDRESS` |
| USGD Token | `USGD_TOKEN_ADDRESS` |
| GODL Token | `GODL_TOKEN_ADDRESS` |
| GDL Token | `GDL_TOKEN_ADDRESS` |
| PancakeSwap Router V2 | `0xD99D1c33F9fC3444f8101754aBC46c52416550D1`（testnet） |


---


## 二、GoldStakingProtocol — 黄金基金认购


### 业务流程概览


```
用户持有 GODL
  ↓ approve(goldProxy, amount)
  ↓ subscribe(godlAmount, termType)  → 返回 subscriptionId
  ↓ 等待 weeklyClaimInterval（默认7天 / 测试8分钟）
  ↓ pendingWeekly(subId)             → 查看可领周收益
  ↓ claimWeekly(subId)               → 领取周收益(USGD)
  ↓ 到期后
  ↓ pendingMatured(subId)            → 查看到期可领
  ↓ claimMatured(subId)              → 领取本金(USGD) + 剩余收益(USGD) + GDL奖励
```


---


### 只读方法（view / pure）


#### `subscriptionGodlPriceUsdE18() → uint256`


当前 GODL 认购价格（18 位精度，USGD 计价）。  
前端用于展示"当前认购价"及预估本金。


```js
const price = await gold.subscriptionGodlPriceUsdE18();
// 例：5000000000000000000000n → 5000 USGD/GODL
```


#### `gdlPriceUsdE18() → uint256`


GDL 结算价格（用于到期 GDL 奖励折算）。


```js
const gdlPrice = await gold.gdlPriceUsdE18();
```


#### `termConfigs(uint256 termType) → (uint256 duration, uint256 months, uint256 apyBps, uint256 gdlBonusBps)`


查询期限配置。`termType`: 0=3个月, 1=6个月, 2=12个月。


| 字段 | 含义 |
|------|------|
| `duration` | 锁仓时长（秒） |
| `months` | 月数 |
| `apyBps` | 年化收益率（基点，1500=15%） |
| `gdlBonusBps` | GDL 奖励倍数（基点，8000=0.8x） |


```js
const [duration, months, apyBps, gdlBonusBps] = await gold.termConfigs(0);
// 生产: duration=7776000(90天), months=3, apyBps=1500, gdlBonusBps=8000
```


#### `weeklyClaimInterval() → uint256`


周领最小间隔（秒）。生产=604800（7天），测试=480（8分钟）。


```js
const interval = await gold.weeklyClaimInterval();
```


#### `subscriptions(uint256 subId) → Subscription`


查询订阅详情。返回 12 个字段的元组：


| 索引 | 字段 | 类型 | 含义 |
|------|------|------|------|
| 0 | `owner` | address | 订阅者地址 |
| 1 | `godlAmount` | uint256 | 认购 GODL 数量 |
| 2 | `usgdPrincipalGross` | uint256 | 认购基数（USGD） |
| 3 | `upfrontFeeUsgd` | uint256 | 前置费用（USGD） |
| 4 | `termType` | uint256 | 期限类型(0/1/2) |
| 5 | `startAt` | uint256 | 认购时间戳 |
| 6 | `endAt` | uint256 | 到期时间戳 |
| 7 | `lastClaimAt` | uint256 | 上次领取时间戳 |
| 8 | `claimedUsgd` | uint256 | 已领取周收益总额 |
| 9 | `gdlBonusCapUsdE18` | uint256 | GDL 奖励价值上限 |
| 10 | `maturedClaimed` | bool | 是否已领取到期 |
| 11 | `settlementAdjustmentUsgd` | int256 | 结算调整额 |


```js
const sub = await gold.subscriptions(1);
const owner = sub[0];
const endAt = sub[6];
const isMatured = Date.now() / 1000 >= Number(endAt);
```


#### `nextSubscriptionId() → uint256`


下一个将分配的订阅 ID。前端可用 `[1, nextSubscriptionId)` 遍历用户订阅。


#### `pendingWeekly(uint256 subId) → uint256 usgdOut`


查询当前可领周收益（USGD）。返回 0 表示未到领取间隔或已到期。


```js
const pending = await gold.pendingWeekly(subId);
// pending > 0 时前端可启用"领取"按钮
```


#### `pendingMatured(uint256 subId) → (uint256 usgdPrincipalOut, uint256 usgdYieldOut, uint256 gdlOut)`


查询到期可领取金额。未到期或已领取时三项均为 0。


```js
const [principal, yield_, gdl] = await gold.pendingMatured(subId);
// principal: 到期返还本金(USGD)
// yield_:    到期剩余收益(USGD)
// gdl:       GDL 奖励数量
```


#### `whitelistMode() → bool`


是否开启白名单模式。开启时只有白名单用户可操作。


#### `whitelisted(address) → bool` / `blacklisted(address) → bool`


查询用户是否在白/黑名单中。


#### `paused() → bool`


合约是否处于暂停状态。


#### `feeTreasury() → address`


前置费用和 GODL 归集地址。


---


### 写方法（需签名交易）


#### `subscribe(uint256 godlAmount, uint256 termType) → uint256 subId`


认购黄金基金。


| 参数 | 说明 |
|------|------|
| `godlAmount` | GODL 数量（18 位精度），最低 `0.1 ether` |
| `termType` | 0=3月, 1=6月, 2=12月 |


**前置条件**：用户需先 `GODL.approve(goldProxy, godlAmount)`。


**认购时自动执行**：
- GODL 转入 `feeTreasury`
- 合约从自身 USGD 余额扣除前置费转入 `feeTreasury`


```js
// 1. 授权
await godl.approve(goldProxyAddress, ethers.parseEther("1"));
// 2. 认购（1 GODL, 3个月期）
const tx = await gold.subscribe(ethers.parseEther("1"), 0);
const receipt = await tx.wait();
// 3. 从事件中读取 subscriptionId
const event = receipt.logs.find(l => l.fragment?.name === "Subscribed");
const subId = event.args.subscriptionId;
```


#### `claimWeekly(uint256 subscriptionId) → uint256 usgdOut`


领取周收益（USGD）。


**前置条件**：
- `block.timestamp >= lastClaimAt + weeklyClaimInterval`
- 订阅未到期
- 调用者是订阅所有者


```js
const pending = await gold.pendingWeekly(subId);
if (pending > 0n) {
  const tx = await gold.claimWeekly(subId);
  await tx.wait();
}
```


#### `claimMatured(uint256 subscriptionId) → (uint256 usgdPrincipalOut, uint256 usgdYieldOut, uint256 gdlOut)`


到期领取：本金(USGD) + 剩余收益(USGD) + GDL 奖励。


**前置条件**：
- `block.timestamp >= endAt`
- `maturedClaimed == false`
- 调用者是订阅所有者


```js
const [p, y, g] = await gold.pendingMatured(subId);
if (p > 0n || y > 0n || g > 0n) {
  const tx = await gold.claimMatured(subId);
  await tx.wait();
}
```


---


### 事件


| 事件 | 触发时机 | 关键字段 |
|------|----------|----------|
| `Subscribed(subId, user, godlAmount, principalGross, upfrontFee, termType, endAt)` | 认购成功 | 获取 `subId` 和各项参数 |
| `WeeklyClaimed(subId, user, usgdOut, claimAt)` | 周领成功 | `usgdOut` 本次领取金额 |
| `MaturedClaimed(subId, user, usgdPrincipalOut, usgdYield, gdlOut)` | 到期领取 | 本金/收益/GDL 三笔金额 |
| `SubscriptionPriceUpdated(priceUsdE18)` | keeper 更新认购价 | 用于前端刷新价格展示 |


**监听示例**：


```js
gold.on("Subscribed", (subId, user, godlAmount, principal, fee, termType, endAt) => {
  console.log(`新认购 #${subId}, 用户: ${user}, 到期: ${new Date(Number(endAt) * 1000)}`);
});
```


---


### 错误码


| 错误 | 含义 | 前端处理建议 |
|------|------|-------------|
| `InsufficientAmount` | GODL 数量 < 0.1 | 提示"最低认购 0.1 GODL" |
| `InvalidTerm` | termType 非 0/1/2 | 限制 UI 选项 |
| `WeeklyClaimNotReady` | 未满周领间隔 | 展示倒计时 |
| `NotMatured` | 未到期 | 展示到期倒计时 |
| `AlreadyMaturedClaimed` | 已领取过到期 | 置灰按钮 |
| `NotSubscriptionOwner` | 非订阅所有者 | 不展示该订阅 |
| `InsufficientUsgdLiquidity` | 合约 USGD 不足 | 提示"暂时无法认购" |
| `NotListed` | 黑名单/未在白名单 | 提示"无权限" |


---


### 前端预估计算（链下）


```js
// 预估认购参数（链下展示，无需调合约）
function estimateSubscription(godlAmount, price, termMonths, apyBps, gdlBonusBps, gdlPrice) {
  const principal = godlAmount * price / 1e18;                         // USGD
  const upfrontFee = principal * 200n * BigInt(termMonths) / (12n * 10000n);  // 2% 年化
  const durationDays = termMonths == 3 ? 90 : termMonths == 6 ? 180 : 365;
  const yieldTotal = principal * BigInt(apyBps) * BigInt(durationDays) / (365n * 10000n);
  const principalOut = principal - upfrontFee;
  const gdlBonusUsd = yieldTotal * BigInt(gdlBonusBps) / 10000n;
  const gdlOut = gdlPrice > 0n ? gdlBonusUsd * BigInt(1e18) / gdlPrice : 0n;
  return { principal, upfrontFee, yieldTotal, principalOut, gdlBonusUsd, gdlOut };
}
```


---


## 三、LpStakingProtocol — 流动性挖矿


### 业务流程概览


```
用户持有 LP Token（从 PancakeSwap 添加流动性获取）
  ↓ lpToken.approve(lpProxy, amount)
  ↓ deposit(pid, amount)               → 质押 LP
  ↓ pendingMining(pid, user)            → 查看可领 GDL
  ↓ claim(pid)                          → 领取 GDL 奖励
  ↓ withdraw(pid, amount)               → 提取 LP（同时结算奖励）
  ↓ emergencyWithdraw(pid)              → 紧急提取（放弃未领奖励）
```


### 矿池配置


| pid | LP 对 | 权重(allocPoint) | 日产出系数 |
|-----|-------|-----------------|-----------|
| 0 | USGD/USDT | 1,000 | 0.1 |
| 1 | GODL/USGD | 3,000 | 0.3 |
| 2 | GDL/USGD | 6,000 | 0.6 |


### 奖励机制


- 奖励代币：GDL
- 首日产出：112,000 GDL
- 每日衰减：-300 GDL/天
- 总分配上限：2.7 亿 GDL


---


### 只读方法（view / pure）


#### `pools(uint256 pid) → (address lpToken, uint256 allocPoint, uint256 accRewardPerShare, uint256 lastRewardTime, uint256 totalStaked)`


查询矿池信息。


| 字段 | 含义 |
|------|------|
| `lpToken` | 该池对应的 LP Token 地址 |
| `allocPoint` | 权重 |
| `accRewardPerShare` | 每份 LP 累积奖励（内部精度） |
| `lastRewardTime` | 上次结算时间戳 |
| `totalStaked` | 池内总质押量 |


```js
const [lpToken, allocPoint, , , totalStaked] = await lp.pools(1);
```


#### `users(uint8 pid, address account) → (uint256 amount, uint256 rewardDebt, uint256 pendingCredit)`


查询用户在指定池的质押信息。


| 字段 | 含义 |
|------|------|
| `amount` | 用户已质押 LP 数量 |
| `rewardDebt` | 用于内部奖励计算 |
| `pendingCredit` | 待领取暂存额（内部记账） |


```js
const [staked, , ] = await lp.users(1, userAddress);
```


#### `pendingMining(uint8 pid, address account) → uint256`


查询用户在指定池的可领 GDL 奖励（含未结算部分，view 模拟计算）。


```js
const pending = await lp.pendingMining(1, userAddress);
// pending > 0 时前端可启用"领取"按钮
```


#### `dailyEmission(uint256 dayIndex) → uint256`


查询第 N 天（从 0 开始）的日产出量。


```js
const day0 = await lp.dailyEmission(0);  // 112000e18
const day100 = await lp.dailyEmission(100); // (112000 - 100*300)e18 = 82000e18
```


#### `startTimestamp() → uint256`


挖矿开始时间戳。在此之前不产出奖励。


#### `emittedTotal() → uint256`


已释放的 GDL 总量。前端可用于展示"已释放 / 总分配"进度条。


```js
const emitted = await lp.emittedTotal();
const cap = ethers.parseEther("270000000");
const progress = Number(emitted * 10000n / cap) / 100; // 百分比
```


#### `gdl() → address`


奖励代币地址。


#### `whitelistMode() / whitelisted(address) / blacklisted(address) / paused()`


与 Gold 协议相同的访问控制查询。


---


### 写方法（需签名交易）


#### `deposit(uint8 pid, uint256 amount)`


质押 LP Token 到指定矿池。


**前置条件**：`lpToken.approve(lpProxy, amount)`。


```js
const [lpTokenAddr] = await lp.pools(1);
const lpToken = new ethers.Contract(lpTokenAddr, erc20Abi, signer);


// 1. 授权
await lpToken.approve(lpProxyAddress, ethers.parseEther("100"));
// 2. 质押到 pid=1（GODL/USGD 池）
const tx = await lp.deposit(1, ethers.parseEther("100"));
await tx.wait();
```


#### `withdraw(uint8 pid, uint256 amount)`


从指定矿池提取 LP Token。同时自动结算待领奖励到 `pendingCredit`。


```js
const tx = await lp.withdraw(1, ethers.parseEther("50"));
await tx.wait();
```


#### `claim(uint8 pid) → uint256 rewardOut`


领取指定矿池的 GDL 奖励。


```js
const pending = await lp.pendingMining(1, userAddress);
if (pending > 0n) {
  const tx = await lp.claim(1);
  await tx.wait();
}
```


#### `emergencyWithdraw(uint8 pid)`


紧急提取全部 LP。**会放弃所有未领取的 GDL 奖励**。仅在合约异常时使用。


```js
const tx = await lp.emergencyWithdraw(1);
await tx.wait();
```


---


### 事件


| 事件 | 触发时机 | 关键字段 |
|------|----------|----------|
| `Deposited(user, pid, amount)` | 质押成功 | 用户/池/数量 |
| `Withdrawn(user, pid, amount)` | 提取成功（含紧急提取） | 同上 |
| `Claimed(user, pid, amount)` | 领取奖励 | `amount` 为 GDL 数量 |
| `SyncDay(at)` | keeper 调用 syncDay | 时间戳 |


**监听示例**：


```js
lp.on("Claimed", (user, pid, amount) => {
  console.log(`用户 ${user} 从池 ${pid} 领取 ${ethers.formatEther(amount)} GDL`);
});
```


---


### 错误码


| 错误 | 含义 | 前端处理建议 |
|------|------|-------------|
| `InvalidPid` | pid 不在 0-2 | 限制 UI 选项 |
| `NotStarted` | 挖矿未开始 | 展示倒计时 |
| `ZeroAmount` | 操作数量为 0 或无可领 | 禁用按钮 |
| `InsufficientAmount` | withdraw 数量超出已质押 | 提示"超出可提取" |
| `NotListed` | 黑名单/未在白名单 | 提示"无权限" |


---


## 四、前端接入 Checklist


### 初始化


- [ ] 用 ABI 和代理地址初始化 `ethers.Contract`
- [ ] 读取 `paused()` 状态，暂停时禁用所有写操作
- [ ] 读取 `whitelistMode()` 和 `whitelisted(user)`，判断用户权限


### Gold 认购页


- [ ] 读 `subscriptionGodlPriceUsdE18` 展示当前 GODL 价格
- [ ] 读 `termConfigs(0/1/2)` 展示三档期限与收益率
- [ ] 链下预估本金/费用/收益/GDL 奖励
- [ ] 调 `GODL.approve` → `subscribe`
- [ ] 监听 `Subscribed` 事件获取 `subId`


### Gold 收益页


- [ ] 遍历用户订阅（`subscriptions(1..nextSubscriptionId)` 过滤 `owner == user`）
- [ ] 对每个订阅调 `pendingWeekly(subId)` 展示可领周收益
- [ ] 展示 `lastClaimAt + weeklyClaimInterval` 的倒计时
- [ ] 到期后调 `pendingMatured(subId)` 展示可领本金/收益/GDL
- [ ] 调 `claimWeekly` / `claimMatured`


### LP 挖矿页


- [ ] 读 `pools(0/1/2)` 展示三个矿池信息与 TVL
- [ ] 读 `users(pid, user)` 展示用户已质押数量
- [ ] 读 `pendingMining(pid, user)` 展示可领 GDL
- [ ] 读 `dailyEmission(dayIndex)` 展示当前日产出
- [ ] 读 `emittedTotal()` 展示已释放进度
- [ ] 调 `lpToken.approve` → `deposit`
- [ ] 调 `claim` / `withdraw`


### 入金兑换页


- [ ] USGD ↔ USDT：调用 PancakeSwap Router `swapExactTokensForTokens`
- [ ] USGD ↔ GODL：同上
- [ ] 展示 LP Pair reserves 计算实时汇率