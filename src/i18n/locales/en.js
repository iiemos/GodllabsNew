const en = {
  meta: {
    homeTitle: "GODL Labs — Institutional Gold RWA",
  },
  common: {
    status: {
      active: "Active",
      ended: "Ended",
      completed: "Completed",
    },
  },
  notification: {
    title: {
      error: "Error",
      success: "Success",
      info: "Info",
    },
  },
  header: {
    nav: {
      home: "Home",
      fund: "Stake",
      defi: "DeFi Mining",
      governance: "Governance",
      lab: "Lab",
      portfolio: "Portfolio",
      swap: "Swap",
      docs: "Documentation",
      faq: "FAQ",
      bridge: "Bridge",
    },
    bridgeComingSoon: "Cross-chain bridge is not available yet",
    governanceComingSoon: "Governance is not available yet",
    wallet: {
      connect: "Connect Wallet",
      connecting: "Connecting...",
      disconnect: "Disconnect wallet",
      connected: "Wallet connected:",
      extensionMissing: "Wallet extension not detected, please install MetaMask or Phantom (EVM)",
      connectCancelled: "You cancelled the wallet connection request",
      connectFailed: "Wallet connection failed, please try again",
      networkChanged: "Network switched, please confirm current chain",
      disconnected: "Wallet disconnected",
      sessionDisconnected: "Wallet disconnected (frontend session)",
    },
    language: {
      label: "Language",
      en: "English",
      zh: "简体中文",
      shortEn: "EN",
      shortZh: "中",
    },
    menu: {
      toggle: "Toggle menu",
    },
  },
  footer: {
    followUs: "Follow us on:",
    sectionsTitle: "Sections",
    informationTitle: "Information",
    contactTitle: "Contact Us",
    sectionLinks: {
      overview: "Protocol Overview",
      tokenomics: "Tokenomics",
      security: "Audit & Security",
      faq: "FAQ",
    },
    infoLinks: {
      fund: "Stake",
      faq: "FAQ",
      defi: "DeFi Mining",
      governance: "Governance",
      docs: "Docs",
      portfolio: "Asset Dashboard",
      swap: "Swap Center",
      contact: "Contact Us",
      start: "Stake Now",
    },
    contactDescription:
      "Get updates on staking openings, audit milestones, and protocol announcements. Project notifications only — no marketing.",
    investorTitle: "Investors & Partnerships",
    investorDescription:
      "For institutional inquiries, data-room access, and partnership discussions.",
    emailPlaceholder: "Enter your email",
    submit: "Submit",
    copyright: "© 2026 GODL LABS All rights reserved",
    domain: "GODL.IO",
    poweredBy: "Powered by",
  },
  contact: {
    badge: "Contact",
    title: "Contact Us",
    description:
      "For partnerships, staking inquiries, or technical support, please leave your email and requirement details. This page is frontend demo only.",
    fields: {
      name: "Name",
      email: "Email",
      message: "Requirement Details",
    },
    placeholders: {
      name: "Enter your name",
      email: "Enter your email address",
      message: "Describe your cooperation direction, budget timeline, or questions",
    },
    note: "After submission, our team will reply by email within 1-3 business days.",
    submit: "Submit Information",
    submitted: "Submitted (frontend demo). Thank you for contacting us. We will reply soon.",
  },
  faq: {
    badge: "FAQ",
    title: "Frequently Asked Questions",
    subtitle: "Confirmed answers for investors, partners, and whitelisted staking participants.",
    items: [
      {
        question: "What is GODL Labs?",
        answer:
          "GODL Labs is an institutional-grade gold-backed RWA platform built on Binance Smart Chain. We connect physical gold mining assets to digital finance through a three-token ecosystem: GODL (gold asset token), USGD (gold-backed stablecoin), and GDL (governance token).",
      },
      {
        question: "What is the GODL token?",
        answer:
          "GODL is a gold asset token pegged 1:1 to projected troy ounces of mine output, capped at 160,000 tokens. It tracks the London gold price and generates up to 31% APY staking yield, paid monthly in USDT, sourced from real mining revenue.",
      },
      {
        question: "Where does the yield come from?",
        answer:
          "The 31% APY comes from two sources: (1) actual gold mine revenue — 46,000 oz/yr projected production from our JORC-audited Tanzania reserve — and (2) the Wynson Asset Management gold-hedged AI fund (SFC-regulated, Hong Kong), which uses a Delta-neutral systematic hedging strategy across LBMA and COMEX. This is real mining and fund cash flow, not inflationary token issuance.",
      },
      {
        question: "Who holds the physical gold?",
        answer:
          "Ferrari Vault (GCC) is the sole physical gold custodian for the project, covering full transport logistics from mine to the ALTENEEN REFINERY through to vault storage. Physical gold is insured up to $225M by Ferrari Gold insurance.",
      },
      {
        question: "What is Standard Chartered's role?",
        answer:
          "Standard Chartered serves as the tokenisation agent for the GODL token — responsible for minting, digital custody, and distribution of the RWA token on BSC. Standard Chartered is not the physical gold custodian. They are also pursuing direct investments into our Hong Kong asset manager and further RWA tokenisation arrangements.",
      },
      {
        question: "Who audited the gold reserve?",
        answer:
          "Our Tanzania mine (1M oz, 4.15 g/t grade) has been independently audited under the JORC Code (2012) by GMRCS. Mining licence E734429 is held by JICUN INTERNATIONAL COMPANY (T) LTD. A fresh 2026 JORC update is in progress. We do have 2 other mines as part as our portfolio in Brazil and Bolivia, currently being audited.",
      },
      {
        question: "What is USGD?",
        answer:
          "USGD is our gold-backed stablecoin, 150% overcollateralised by physical gold reserves. It serves as the settlement and subscription currency within the GODL Labs ecosystem. USGD is pegged to USDT and will go live at TGE.",
      },
      {
        question: "What is GDL?",
        answer:
          "GDL is the governance and incentive token with a fixed supply of 1 billion tokens. 5% of net ecosystem profits fund a GDL buyback-and-burn mechanism. GDL holders participate in protocol governance decisions.",
      },
      {
        question: "When is TGE?",
        answer: "TGE is targeted for September 2026 onwards for our GDL token.",
      },
      {
        question: "Are you VARA licensed?",
        answer:
          "Our Dubai exchange entity, Fraktiq DMCC, has received pre-approval for a VARA licence, which is currently in the final stages of formalisation. We are not claiming an active licence at this stage — the process is on track.",
      },
      {
        question: "Is the smart contract audited?",
        answer:
          "A CertiK smart contract audit is currently in progress. A ROMA.US real asset audit follows upon CertiK completion. Results will be published publicly.",
      },
      {
        question: "What is the corporate structure?",
        answer:
          "Wynson Global Opportunities Fund SPC (Cayman, HoldCo) → GODL Labs Ltd (Cayman, operations) → GODL Protocol Foundation (GDL token issuer) + Fraktiq DMCC (Dubai exchange layer, VARA pre-approved) + JICUN INTERNATIONAL COMPANY (T) LTD (Tanzania, mining licence E734429). Wynson Asset Management Ltd (Hong Kong, SFC-regulated) manages the gold-hedged AI fund.",
      },
      {
        question: "How do I stake?",
        answer:
          "Connect your whitelisted wallet on the /stake page. Choose your lock cycle — 3 months (15% APY), 6 months (21% APY), or 12 months (31% APY). Enter the number of GODL tokens to stake. Your principal is locked in USDT value at the time of staking. Yield accrues monthly and is settled in USDT at maturity along with your principal.",
      },
      {
        question: "How can I invest or partner with GODL Labs?",
        answer:
          "For institutional inquiries, data-room access, and partnership discussions, please contact us at partnerships@godl.io.",
      },
    ],
  },
  lab: {
    title: "Lab",
  },
  portfolio: {
    badge: "Asset Dashboard",
    title: "Asset Overview",
    description:
      "Displays balances of USDT, USGD, GDL, GODL and staked principal, with transaction history retained. Staking yield is handled on the staking page.",
    goSwap: "GODL Access",
    refresh: "Refresh",
    connectHint: "Connect wallet to view your on-chain balances and recent staking records.",
    connectWallet: "Connect Wallet",
    connectFailed: "Wallet connection failed. Please try again later.",
    loadFailed: "Failed to load portfolio data",
    switchNetwork: "Please switch to BSC (ChainId={{chainId}}) to view on-chain assets",
    loading: "Loading on-chain portfolio data...",
    emptyRecords: "No on-chain staking records",
    balances: {
      usdt: "USDT",
      usgd: "USGD",
      gdl: "GDL",
      godl: "GODL",
      fundShares: "Staked Principal",
    },
    recordsTitle: "Record Details",
    recentCount: "Latest {{count}}",
    table: {
      time: "Time",
      type: "Type",
      token: "Token",
      amount: "Amount",
      status: "Status",
    },
    recordTypes: {
      fundSubscribe: "Gold Staking",
      rewardClaim: "Reward Claim",
      lpMining: "LP Mining",
      swap: "Swap",
    },
  },
  swap: {
    title: "Swap Center",
    subtitle: "Swap channels are being staged for launch.",
    locked: {
      badge: "Coming Soon",
      title: "Swap Center Coming Soon",
      subtitle: "The GODL access and token swap channels are retained as product pages while liquidity, pricing, and compliance checks are completed.",
      description: "USDT-to-GODL access will reopen after the contract-side minting and pricing flow is finalized.",
      stats: [
        { label: "Status", value: "Coming Soon", note: "Preview structure only" },
        { label: "Settlement", value: "USDT", note: "USGD channel pending" },
        { label: "Reference", value: "XAUT / PAXG", note: "Live pricing integration pending" },
      ],
      routes: [{ label: "USDT ↔ GODL" }, { label: "USDT ↔ USGD" }, { label: "USGD ↔ GDL" }],
    },
    tabs: {
      usdtUsgd: {
        label: "USDT ↔ USGD",
        helper: "Quotes and execution are derived from on-chain pools and router output in real time.",
      },
      usgdGodl: {
        label: "USGD ↔ GODL",
        helper: "Pricing is calculated from live pool reserves and router path results.",
      },
      usgdGdl: {
        label: "USGD ↔ GDL",
        helper: "Pricing is calculated from the GDL/USGD pool reserves and router outputs.",
      },
    },
    settings: {
      title: "Trade Settings",
      slippageTolerance: "Slippage Tolerance",
      customSlippage: "Custom slippage",
      currentSlippage: "Current slippage: {{value}}%",
    },
    fields: {
      from: "From",
      to: "To",
      balance: "Balance",
    },
    stats: {
      exchangeRate: "Exchange Rate",
      priceImpact: "Price Impact",
      liquidityFee: "Liquidity Fee",
      minimumReceived: "Minimum Received",
    },
    tx: {
      success: "Swap Successful",
      pending: "Transaction Processing",
      hashLabel: "Tx",
    },
    buttons: {
      confirmSwap: "Confirm Swap",
      processing: "Processing...",
      refreshPrice: "Refresh Price",
      refreshing: "Refreshing...",
      max: "MAX",
    },
    tags: {
      audit: "Security Audit",
      fastConfirm: "Fast Confirmation",
      crossChain: "Cross-chain Expansion",
    },
    notifications: {
      priceRefreshed: "Price data refreshed",
      invalidAmount: "Please enter a valid amount",
      insufficientBalance: "Insufficient balance, available {{balance}} {{token}}",
      requestProcessing: "Swap request processing...",
      swapSuccess: "{{from}} → {{to}} swap successful",
      loadQuoteFailed: "Failed to load swap quote",
      loadTokenBalanceFailed: "Failed to load token balances",
      loadPairAddressFailed: "Failed to load pair addresses",
      refreshFailed: "Failed to refresh price",
      connectWalletFirst: "Please connect your wallet first",
      switchNetwork: "Please switch to BSC (ChainId={{chainId}})",
      contractCheckFailed: "Contract validation failed",
      missingRoute: "Swap route configuration is missing",
      unlimitedApprove: "Approving unlimited {{token}} allowance...",
      swapFailed: "Swap failed",
      networkMismatch: "Detected wallet network is not the target BSC network. Please switch before submitting transactions.",
    },
  },
  farms: {
    title: "Farms",
    subtitle: "Stake LP tokens to earn.",
    panelTabs: {
      farm: "Liquidity Mining",
      fund: "Gold Staking",
    },
    filterBy: "Filter by",
    onlyStaked: "Staked only",
    empty: "No matching items. Please adjust filters.",
    statusFilter: {
      active: "Active",
      ended: "Ended",
    },
    categoryLabel: {
      farm: "Farm Type",
      fund: "Fund Type",
    },
    metricLabel: {
      farm: "Weight",
      fund: "Cycle",
    },
    table: {
      pool: "Pool",
      fee: "Fee",
      earned: "Earned",
      apr: "APR",
      stakedLiquidity: "Staked Liquidity",
      available: "Available",
      staked: "Staked",
    },
    detail: {
      status: "Status",
      earned: "Earned",
      apr: "APR",
      stakedLiquidity: "Staked Liquidity",
      available: "Available",
      staked: "Staked",
      earn: "Earn",
    },
    actions: {
      subscribeNow: "Subscribe Now",
      addLiquidity: "Add Liquidity",
      viewFundWhitepaper: "View fund whitepaper",
      viewYieldDetails: "View yield details",
      viewContract: "View contract",
      addPairLp: "Add {{pair}} LP",
      viewPairInfo: "View pair info",
      claimReward: "Claim Reward",
      cannotAdd: "Cannot add liquidity under current status",
      noClaim: "No claimable rewards under current status",
      details: "Details",
      hide: "Hide",
    },
    notifications: {
      actionOpened: "{{pair}} entry opened (frontend demo)",
      rewardClaimed: "{{pair}} rewards claimed (frontend demo)",
      categoryFilter: "{{category}} filter entry (frontend demo)",
    },
    rewardTokens: {
      gdlPlusFee: "GDL + Fees",
      usgdPlusGdl: "USGD + GDL",
    },
    fundPairs: {
      m3: "GODL Fund · 3 Months",
      m6: "GODL Fund · 6 Months",
      m12: "GODL Fund · 12 Months",
      vip: "GODL Fund · Pro Strategy",
    },
    fundTypes: {
      short: "Short Cycle",
      medium: "Medium Cycle",
      long: "Long Cycle",
      strategy: "Strategy Pool",
    },
    farmTypes: {
      stable: "Stable Pool",
      growth: "Growth Pool",
      volatile: "Volatile Pool",
    },
    fundMetric: {
      d90: "90d",
      d180: "180d",
      d365: "365d",
    },
  },
  governance: {
    badge: "Governance",
    title: "Governance Data",
    description: "Review proposals, voting metrics, and governance staking activity.",
    comingSoon: "Governance is coming soon",
    publishProposal: "Publish Proposal",
    overview: {
      levelTitle: "Governance Tier",
      levelNote: "Weight Level",
      participantsTitle: "Participating Wallets",
      participantsNote: "Active Addresses",
      liveTitle: "Live Proposals",
      liveNote: "Awaiting Votes",
      endedTitle: "Closed Proposals",
      endedNote: "Archived",
    },
    listTitle: "Proposal Voting",
    myVotingPower: "My voting power: {{value}}",
    stakeTitle: "GDL Governance Staking",
    stakeFields: {
      wallet: "Wallet Balance",
      staked: "Staked GDL",
      weight: "Current Voting Weight",
      amount: "Stake Amount",
    },
    amountPlaceholder: "Enter staking amount",
    stakeButton: "Stake",
    unstakeButton: "Redeem",
    stakeHint:
      "Staked GDL can participate in proposal voting, and voting power scales with the staked amount. Approved proposals move into execution.",
    memberTitle: "Governance Participants",
    memberCount: "{{count}} addresses",
    memberLevel: "Governance tier {{level}}",
    memberScore: "Governance score {{score}}",
    proposal: {
      idLabel: "Proposal ID:",
      proposerLabel: "Proposer:",
      deadlineLabel: "Deadline:",
      support: "Support",
      oppose: "Oppose",
      supportAction: "Support",
      opposeAction: "Oppose",
    },
    proposals: {
      poolLaunch: "Launch the GDL/USGD second mining pool",
      poolLaunchSummary: "Open the second mining pool in line with the whitepaper plan, with weight set to 3 and a day-one cap.",
      feeAdjust: "USGD/GODL swap fee parameter",
      feeAdjustSummary: "Set the swap fee to 0.3% for buyback and burn of GDL.",
    },
    voteAction: {
      support: "support",
      oppose: "oppose",
    },
    notifications: {
      publishSoon: "Proposal publishing form is not connected yet. This is a frontend demo.",
      invalidAmount: "Please enter a valid GDL amount.",
      insufficientWallet: "Insufficient wallet balance. Available: {{balance}} GDL.",
      insufficientStaked: "Insufficient staked amount. Redeemable: {{balance}} GDL.",
      stakeSuccess: "{{amount}} GDL staked. Voting power updated.",
      unstakeSuccess: "{{amount}} GDL redeemed. Voting power updated.",
      proposalClosed: "This proposal is closed and can no longer receive votes.",
      voteSuccess: "You cast a {{action}} vote for {{title}} (frontend demo).",
    },
  },
  defi: {
    title: "DeFi Mining",
    subtitle: "Liquidity mining pool management and yield tracking.",
    locked: {
      badge: "Coming Soon",
      title: "DeFi Mining Coming Soon",
      description:
        "The liquidity mining page is reserved. Pool details and write actions will open after strategy, audit, and liquidity parameters are finalized.",
      stats: [
        { label: "Pool Count", value: "3", note: "USGD/USDT, GODL/USGD, and GDL/USGD" },
        { label: "Status", value: "Coming Soon", note: "Preview structure only" },
        { label: "Reward Asset", value: "GDL", note: "Final emission settings follow on-chain configuration" },
      ],
      pools: [
        {
          pid: 0,
          pair: "USGD-USDT LP",
          tokens: ["usgd", "usdt"],
          status: "Coming Soon",
          metrics: [
            { label: "Pool Weight", value: "--" },
            { label: "Total Staked", value: "-- LP" },
            { label: "Estimated Daily Reward", value: "-- GDL/day" },
            { label: "Estimated APY", value: "--" },
            { label: "Claimable Reward", value: "-- GDL" },
          ],
        },
        {
          pid: 1,
          pair: "GODL-USGD LP",
          tokens: ["godl", "usgd"],
          status: "Coming Soon",
          metrics: [
            { label: "Pool Weight", value: "--" },
            { label: "Total Staked", value: "-- LP" },
            { label: "Estimated Daily Reward", value: "-- GDL/day" },
            { label: "Estimated APY", value: "--" },
            { label: "Claimable Reward", value: "-- GDL" },
          ],
        },
      ],
    },
    summary: {
      poolCount: "Pool Count",
      activeCount: "Active Pools",
      totalTvl: "Total TVL",
      avgApy: "Average APY",
    },
    statusFilter: {
      active: "Active",
      ended: "Ended",
      all: "All",
    },
    onlyStaked: "Staked only",
    empty: "No pools under current filters.",
    fields: {
      fee: "Fee",
      apr: "APR",
      tvl: "TVL",
      volume24h: "24H Volume",
      rewardRate: "Reward Rate",
      available: "Available",
      staked: "Staked",
    },
    chart: {
      title: "Liquidity Line Chart",
      current: "Current Liquidity",
      high: "Range High",
      low: "Range Low",
      trend: "Range Trend",
    },
    actions: {
      addLiquidity: "Add Liquidity",
      claimGdl: "Claim Reward",
      details: "Details",
      hide: "Hide",
      viewPoolDetails: "View Pool Details",
      viewPairInfo: "View Pair Info",
      viewContract: "View Contract",
    },
    linkTarget: {
      pool: "pool details",
      pair: "pair info",
      contract: "contract info",
    },
    notifications: {
      addLiquidityOpened: "{{pair}} add-liquidity entry opened (frontend demo).",
      claimedReward: "{{pair}} reward claimed: {{amount}} (frontend demo).",
      noClaimAvailable: "No claimable reward right now.",
      linkOpened: "{{pair}} {{target}} entry opened (frontend demo).",
    },
    page: {
      errors: {
        loadData: "Failed to load farming data",
        connectWalletFirst: "Please connect your wallet first",
        switchNetwork: "Please switch to BSC (ChainId={{chainId}})",
        paused: "Farming contract is paused",
        blacklisted: "Current address is blacklisted",
        notWhitelisted: "Current address is not in whitelist",
        notStarted: "Mining has not started yet. Please try again later",
        poolDisabled: "This pool is disabled and cannot be operated now",
        poolLpTokenMisconfigured: "Pool LP token config is invalid ({{address}}). Please ask admin to fix pool config before retrying",
        invalidAmount: "Please enter a valid amount",
        insufficientAmount: "Insufficient amount. Please check the input value",
        invalidPid: "Invalid pool id",
        emissionCapReached: "Emission cap reached. Action is temporarily unavailable",
        poolHasStake: "This pool still has staked positions. Action is unavailable now",
        zeroAddress: "Invalid address parameter. Please refresh and retry",
        poolTokenOperationFailed: "LP token operation failed. Please check pool config and allowance status",
        notListed: "Current address is not allowed to operate this pool",
        actionNotAllowed: "Current state does not allow write operation",
        poolActionFailed: "{{pair}} action failed",
        missingTokenAddress: "Token address is missing. Cannot add liquidity",
        loadLiquidityData: "Failed to load liquidity data",
        invalidLiquidityAmount: "Please enter valid liquidity amounts",
        insufficientBalance: "Insufficient balance. Available {{balanceA}} {{tokenA}} / {{balanceB}} {{tokenB}}",
        addLiquidityFailed: "Add liquidity failed",
        removeLiquidityFailed: "Remove liquidity failed",
        insufficientLpBalance: "Insufficient LP balance. Available {{balance}} {{symbol}}",
        insufficientStakedAmount: "Insufficient staked amount. Available {{amount}} {{symbol}}",
      },
      notices: {
        approvingPool: "Approving {{pair}}",
        depositSuccess: "{{pair}} deposit successful",
        withdrawSuccess: "{{pair}} withdrawal successful",
        decompressSuccess: "{{pair}} decompression successful",
        noClaimableReward: "No claimable rewards right now",
        claimSuccess: "{{pair}} reward claim successful",
        approvingToken: "Approving {{symbol}}...",
        submittingAddLiquidity: "Submitting add-liquidity transaction for {{pair}}...",
        addLiquiditySuccess: "{{pair}} liquidity added successfully",
        submittingRemoveLiquidity: "Submitting remove-liquidity transaction for {{pair}}...",
        removeLiquiditySuccess: "{{pair}} liquidity removed successfully",
      },
      warnings: {
        networkMismatch: "Detected wallet network is not the target BSC network. Please switch before submitting transactions.",
      },
      summary: {
        totalStakedLp: "Total Staked LP",
        dailyEmission: "Current Daily Emission",
        emittedTotal: "Total Emitted",
      },
      fields: {
        poolWeight: "Pool Weight",
        totalStaked: "Total Staked",
        dailyReward: "Estimated Daily Reward",
        estimatedApy: "Estimated APY",
        claimableReward: "Claimable Reward",
        availableLp: "Available LP",
        stakedLp: "Staked LP",
        amountInput: "Amount (for deposit)",
        decompressHint: "Decompression withdraws staked LP by amount and keeps rewards claimable.",
      },
      actions: {
        refresh: "Refresh",
        processing: "Processing...",
        deposit: "Deposit",
        decompress: "Decompress",
        claim: "Claim ({{amount}})",
        confirmDecompress: "Confirm Decompress",
        addLiquidity: "Add Liquidity",
        removeLiquidity: "Remove Liquidity",
        close: "Close",
        cancel: "Cancel",
        submitting: "Submitting...",
        confirmAddLiquidity: "Confirm Add Liquidity",
        confirmRemoveLiquidity: "Confirm Remove Liquidity",
      },
      status: {
        poolDisabled: "Disabled",
      },
      states: {
        loading: "Loading on-chain farming pool data...",
      },
      decompress: {
        subtitle: "Position",
        title: "Decompress Staked Position",
        currentStaked: "Current Staked",
        amountInput: "Decompress Amount",
        maxHint: "Click MAX to fill the full staked amount",
      },
      liquidity: {
        title: "Add Liquidity",
        removeTitle: "Remove Liquidity",
        loading: "Loading pool and balance data...",
        autoRatio: "Auto-match by pool ratio",
        ratioLoading: "Loading pool ratio",
        availableBalance: "Available",
        expectedReceiveA: "Estimated {{symbol}} Receive",
        expectedReceiveB: "Estimated {{symbol}} Receive",
      },
    },
  },
  fund: {
    title: "GODL Staking",
    subtitle:
      "Stake GODL into fixed lock cycles. Principal is locked in USDT value at stake time, yield accrues monthly, and principal plus accrued yield are settled in USDT at maturity.",
    summary: {
      principal: "Staked Principal (USDT)",
      yield: "Estimated Yield (USDT)",
      gdlAirdrop: "Ecosystem Campaigns Pending",
    },
    products: {
      fund3m: "GODL Staking · 3 Months",
      fund6m: "GODL Staking · 6 Months",
      fund12m: "GODL Staking · 12 Months",
    },
    fields: {
      cycle: "Cycle",
      days: "days",
      apr: "APR",
      principal: "Staking Principal",
      fundYield: "Staking Yield",
      maturityDate: "Maturity Date",
      redeemTotal: "Redeemable on Maturity",
      airdropTotal: "Campaign Allocation",
      airdropReleased: "Released",
      airdropClaimed: "Claimed",
      airdropClaimable: "Claimable Now",
    },
    claims: {
      maturityTitle: "Maturity Claim: Principal + Accrued Yield",
      airdropTitle: "Ecosystem Campaigns Pending",
    },
    actions: {
      redeemAll: "Redeem on Maturity",
      redeemLocked: "Not Matured Yet",
      redeemed: "Redeemed",
      claimAirdrop: "Campaign Pending",
    },
    notifications: {
      redeemNotMatured: "This staking position is not matured yet. Maturity date: {{date}}.",
      redeemSuccess: "{{plan}} redeemed successfully. Total: {{amount}} USDT (frontend demo).",
      alreadyRedeemed: "This staking position has already been redeemed.",
      noAirdropAvailable: "No campaign allocation is open at the moment.",
      airdropClaimed: "Campaign allocation claimed: {{amount}} (frontend demo).",
    },
    page: {
      errors: {
        loadData: "Failed to load staking contract data",
        connectWalletFirst: "Please connect your wallet first",
        switchNetwork: "Please switch to BSC (ChainId={{chainId}})",
        paused: "Protocol is paused. Writes are disabled",
        blacklisted: "Current address is blacklisted",
        notWhitelisted: "Current address is not in whitelist",
        demoMode: "Demo mode is enabled. This build does not connect to contract addresses or submit on-chain transactions.",
        privateAccess:
          "GODL staking is currently in private access. Please join the waitlist to be notified when your wallet is approved.",
        invalidGodlAmount: "Please enter a valid GODL amount",
        minPurchase: "Minimum stake is {{amount}} GODL",
        minSubscribe: "Minimum stake is {{amount}} GODL",
        actionNotAllowed: "Current state does not allow write operation",
        purchaseFailed: "Stake failed",
        subscribeFailed: "Stake failed",
        gdlClaimFailed: "Campaign claim failed",
        maturedClaimFailed: "Matured claim failed",
      },
      notices: {
        approvingGodl: "Approving GODL...",
        purchaseSuccessWithId: "Stake successful, ID #{{id}}",
        purchaseSuccess: "Stake successful",
        subscribeSuccessWithId: "Stake successful, ID #{{id}}",
        subscribeSuccess: "Stake successful",
        gdlClaimSuccess: "Campaign claim successful",
        maturedClaimSuccess: "Matured claim successful",
      },
      warnings: {
        networkMismatch: "Detected wallet network is not the target BSC network. Please switch before submitting transactions.",
      },
      header: {
        contractMode: "Gold Staking (Live Contract)",
        currentPrice: "Current GODL Reference Price",
        gdlPrice: "GDL Settlement Price",
        godlBalance: "GODL Balance",
      },
      fields: {
        godlAmount: "GODL Amount to Stake",
        subscribedGodl: "Staked GODL",
        subscribedPrincipal: "Staked Principal",
        upfrontFee: "Upfront Fee",
        maturityTime: "Maturity Time",
        claimablePrincipal: "Claimable Principal",
        claimableYield: "Claimable Yield",
        claimedPrincipal: "Claimed Principal",
        claimedYield: "Claimed Yield",
        claimedPrincipalAndYield: "Claimed Principal + Yield",
        claimableGdlValue: "Claimable Campaign Value",
        claimableTotalWithGdl: "Claimable Total Value",
        claimableGdl: "Claimable Campaign Allocation",
        gdlBonusCapUsd: "Campaign Cap Value",
        claimedGdlValueUsd: "Claimed Campaign Value",
        releaseStep: "Release Step Interval",
      },
      estimates: {
        principal: "Estimated Principal",
        upfrontFee: "Estimated Upfront Fee",
        principalOut: "Principal + Yield at Maturity (After Fee)",
        yieldTotal: "Estimated Total Yield",
        gdlBonusUsd: "Campaign Value",
        gdlBonus: "Estimated Campaign Allocation",
        totalWithGdlBonus: "Total Maturity Value",
      },
      summary: {
        principal: "My Current Staked Principal",
        pendingGdl: "My Current Claimable Campaign Allocation",
        weeklyClaimable: "Current Yield Claimable (USDT)",
        maturedClaimable: "My Current Claimable Yield",
        maturedWithGdl: "Currently Claimable",
      },
      actions: {
        goSwapGodl: "Get GODL",
        godlAccessPending: "GODL access channel pending",
        refresh: "Refresh",
        processing: "Processing...",
        approveAndPurchase: "Approve & Stake",
        approveAndSubscribe: "Approve & Stake",
        claimed: "Claimed",
        claimMatured: "Claim Matured Payout",
        claimGdl: "Claim Campaign Allocation",
        claimWeekly: "Claim Yield",
      },
      states: {
        loading: "Loading on-chain staking data...",
        connectToView: "Connect wallet to view your staking positions",
        empty: "No staking records",
      },
      labels: {
        recordTitle: "Staking Record",
        term: "Term",
        months: "months",
        termMonths: "{{months}} months",
      },
      status: {
        maturedDone: "Matured Claim Completed",
        ongoing: "Ongoing",
      },
      filters: {
        ongoing: "Ongoing",
        completed: "Completed",
      },
      sections: {
        maturedClaim: "Matured Claim (Principal + Remaining Yield)",
        gdlClaim: "Campaign Claim",
        weeklyClaim: "Yield Claim (USDT)",
      },
    },
  },
  docs: {
    badge: "Project Documentation",
    title: "Documentation & Whitepaper",
    subtitle:
      "An overview of GODL Labs, covering project background, underlying gold assets, tokenomics, redemption rules, yield mechanics, and GDL governance.",
    whitepaperButton: "Download Whitepaper (PDF)",
    whitepaperPending: "Whitepaper PDF link pending",
    sections: {
      background: {
        title: "Project Background",
        summary:
          "GODL Labs bridges audited Tanzanian gold reserves and decentralized finance through a regulated, transparent, on-chain framework.",
        points: [
          "Mining-asset ownership recorded and verified on-chain.",
          "Yield powered by real mining revenue — not synthetic emissions.",
          "Every yield calculation is traceable and independently verifiable.",
        ],
      },
      assets: {
        title: "Underlying Assets",
        summary:
          "Tanzanian gold mining assets under license E734429, with independent reserve audits and regulated physical custody, with additional Brazilian mining assets.",
        points: [
          "Mining rights and reserves verified by independent auditors.",
          "Asset position disclosed at governance-level transparency.",
          "Resource expansion governed by strict compliance and risk-control rules.",
        ],
      },
      tokenomics: {
        title: "Tokenomics",
        summary: "Three tokens with clearly separated roles — settlement, asset representation, and governance.",
        points: [
          "USGD — planned 1:1 stable settlement asset for later platform flows; early staking is displayed and settled in USDT.",
          "GODL — gold-anchored asset token, initial issuance cap of 160,000. The gateway asset users hold to participate in the staking program.",
          "GDL — governance token with a fixed supply of 1 billion and buyback-and-burn funded by mining revenue.",
        ],
      },
      releaseRules: {
        title: "Redemption Rules",
        summary: "Staking yield and ecosystem incentives follow separate release paths to keep accounting clean and transparent.",
        points: [
          "Staking yield is redeemed together with principal at maturity, in USDT.",
          "GDL ecosystem incentives are released in batches as part of later marketing campaigns.",
          "All releases and claims are independently trackable on-chain.",
        ],
      },
      fundYield: {
        title: "Staking Yield Calculation",
        summary:
          "At the moment of staking, Standard Chartered's trading desk hedges the gold price and locks your principal in USDT value for the lock period. Yield then accrues monthly based on annualized rate and lock duration. All payouts settle in USDT.",
        points: [
          "Principal is locked in USDT value at stake time via a Standard Chartered hedge, and is not affected by gold-price movements during the lock period.",
          "Annualized rates are prorated by cycle length (3, 6, or 12 months).",
          "At maturity, principal and accrued yield are redeemed together in USDT.",
        ],
      },
      gdlIncentive: {
        title: "GDL Ecosystem Incentives",
        summary: "GDL ecosystem incentives are introduced in later phases through marketing campaigns and airdrops to early supporters.",
        points: [
          "Claim mechanics, eligibility windows, and release schedules will be published ahead of each campaign.",
          "Independent of staking mechanics — GDL claims do not affect staking maturity or redemption.",
        ],
      },
    },
    formulas: {
      fund: {
        title: "Staking Redemption Formula",
        expression: "Maturity Redemption = Principal × (1 + APR × Lock Days / 365)",
        note: "Triggered at maturity. Principal (USDT value locked at stake time) and accrued yield are returned together in USDT.",
      },
      gdl: {
        title: "GDL Campaign Mechanics",
        note: "GDL claim mechanics will be detailed at the launch of each ecosystem campaign.",
      },
    },
  },
  home: {
    trustLogos: ["VARA", "OJK", "TMC", "MoM", "CAYMAN", "AUDIT"],
    confirmedPartners: [
      { name: "BitGo", role: "Custody" },
      { name: "ALTENEEN REFINERY", role: "Gold refining" },
      { name: "Ferrari Vault", role: "Physical custody" },
      { name: "CertiK", role: "Smart-contract audit" },
    ],
    protocolMetrics: [
      {
        label: "Total Value Locked (TVL)",
        value: "Live at TGE",
        note: "Real-time aggregate of stakings, settled on-chain",
      },
      {
        label: "Top APY",
        value: "31%",
        note: "12-month staking cycle",
      },
      {
        label: "GODL Issuance Cap",
        value: "160,000",
        note: "Initial gold-anchored issuance baseline",
      },
      {
        label: "USGD Supply",
        value: "Live at TGE",
        note: "1:1 stable settlement asset, pegged to USDT",
      },
    ],
    institutionalPillars: [
      {
        title: "Audited Mining Reserves",
        description:
          "Backed by Tanzanian gold mining assets under license E734429, with independent reserve audits and on-chain proof of holdings.",
      },
      {
        title: "Layered Yield Structure",
        description: "Three staking cycles — 3, 6, and 12 months — with annualized returns of 15% / 21% / 31%.",
      },
      {
        title: "Real-World Asset Framework",
        description:
          "A modular system connecting physical gold ownership, on-chain circulation, and transparent yield distribution.",
      },
    ],
    tokenRows: [
      {
        symbol: "USGD",
        icon: "mdi:shield-check-outline",
        summary:
          "Planned overcollateralized stablecoin pegged 1:1 to USDT and backed 1.5:1 by gold reserves. Designed for future platform settlement and yield flows.",
        detail:
          "Liquidity-anchored and built for cross-border flows. Early staking displays and settles through USDT while the USGD channel remains pending.",
      },
      {
        symbol: "GODL",
        icon: "mdi:gold",
        summary:
          "Gold-anchored asset token, with an initial issuance cap of 160,000 mapped 1:1 to authorized gold ounces.",
        detail:
          "The gateway asset for the GODL Labs staking program. Underlying value references audited Tanzanian gold reserves under mining license E734429, with additional resource backing from Brazilian mining assets.",
      },
      {
        symbol: "GDL",
        icon: "mdi:alpha-g-circle-outline",
        summary: "Governance and ecosystem token, with a fixed supply of 1 billion.",
        detail:
          "Allocated across community, foundation, team, and compliance programs. A portion of net mining revenue funds an ongoing buyback-and-burn mechanism.",
      },
    ],
    helpCards: [
      {
        icon: "mdi:shield-lock-outline",
        leading: "Custody",
        title: "Audited Reserves & Regulated Custody",
        description:
          "Reserves and ledger data are verified by independent auditors. Physical gold is held at Ferrari Vault and refined by ALTENEEN REFINERY. GODL custody and tokenization are handled by Standard Chartered; GDL token custody by BitGo. Vault assets insured up to $225M.",
      },
      {
        icon: "mdi:radar",
        leading: "Security",
        title: "Smart-Contract Security & Risk Controls",
        description:
          "Smart contracts audited by CertiK. Multi-source price oracles, layered access permissions, and continuous on-chain monitoring eliminate single points of failure.",
      },
    ],
    securityOpsCards: [
      {
        title: "Build Asset Verification Dashboard",
        image: "/static/create.png",
        icon: "mdi:check-decagram",
      },
      {
        title: "Run Instant Analytics",
        image: "/static/run.png",
        icon: "mdi:check-decagram",
      },
      {
        title: "Diagnose Every Metric Shift",
        image: "/static/shift.png",
        icon: "mdi:check-decagram",
      },
    ],
    testimonialCards: [
      {
        quote:
          "Tanzanian mining assets have completed third-party geological and reserve verification, supporting the on-chain mapping baseline.",
        name: "Geological Audit",
        company: "Independent Verifier",
        gradient: "from-[#111827] to-[#334155]",
      },
      {
        quote:
          "The regulatory framework is built with multi-jurisdiction coordination, covering asset rights, cross-border circulation, and disclosure requirements.",
        name: "Compliance Track",
        company: "Multi-jurisdiction",
        gradient: "from-[#0f172a] to-[#1e3a8a]",
      },
      {
        quote:
          "RWA and DeFi modules are combined to increase transparency and liquidity efficiency for gold assets.",
        name: "Protocol Layer",
        company: "Asset Digitization",
        gradient: "from-[#1f2937] to-[#52525b]",
      },
      {
        quote:
          "Governance and incentive coordination supports long-term ecosystem growth while maintaining risk constraints.",
        name: "Governance Engine",
        company: "GDL Network",
        gradient: "from-[#172554] to-[#312e81]",
      },
    ],
    comparisonRows: [
      {
        aligno: "Direct ownership of audited Tanzanian gold reserves, recorded on-chain",
        other: "Token narrative without physical asset backing",
      },
      {
        aligno: "Built for multi-jurisdiction compliance, with named institutional auditors",
        other: "Ambiguous regulatory positioning and high legal interpretation costs",
      },
      {
        aligno: "USGD pegged 1:1 to USDT, stabilized by deep on-chain liquidity",
        other: "Price volatility and limited settlement reliability",
      },
      {
        aligno: "Yield tied directly to real mining revenue, not synthetic emissions",
        other: "Fragmented yield logic, often subsidized rather than earned",
      },
      {
        aligno: "Closed loop across assets, technology, compliance, and capital",
        other: "Information silos with limited risk transparency",
      },
    ],
    projectCards: [
      {
        title: "Regulatory Alignment",
        desc: "Working across multiple jurisdictions to align on virtual-asset and mining-rights frameworks, with active dialogue across the GCC, East Africa, and Asia.",
        icon: "mdi:bank-check",
      },
      {
        title: "Physical Asset Backing",
        desc: "Audited Tanzanian gold reserves under license E734429, refined by ALTENEEN REFINERY and held in regulated custody at Ferrari Vault, Dubai.",
        icon: "mdi:factory",
      },
      {
        title: "Custody Infrastructure",
        desc: "GODL token custody and tokenization are handled by Standard Chartered, while GDL token custody is supported by BitGo.",
        icon: "mdi:pickaxe",
      },
      {
        title: "Cross-Border Settlement",
        desc: "On-chain settlement and modular smart contracts enable efficient, transparent gold-backed liquidity across regions and counterparties.",
        icon: "mdi:earth",
      },
    ],
    assetProof: {
      badge: "Asset Proof",
      title: "Underlying Asset Proof",
      description:
        "Publishes the mining license baseline, redacted credential scans, mine-area location, and reserve verification approach so investors can review the asset chain quickly.",
      licenseNo: "License No.: E734429",
      scanTitle: "Redacted Credential Scan",
      scanNote: "Sensitive fields are redacted. Formal files follow audit disclosure and compliance materials.",
      items: [
        {
          label: "License No.",
          value: "E734429",
        },
        {
          label: "Mine Area Location",
          value: "Compliant Tanzanian mining-rights area; coordinates and boundaries follow audit disclosure.",
        },
        {
          label: "Credential Scan",
          value: "Business, mining-rights, and cooperation files keep redacted scan entries.",
        },
        {
          label: "Reserve Verification",
          value: "Mining rights, reserves, refining, and custody materials are verified in layers and added to on-chain disclosure cadence.",
        },
      ],
    },
    team: {
      members: [
        {
          name: "Lucie Colomb",
          role: "Chief Executive Officer",
          image: "/team/lucie-colomb.png",
          bio:
            "Lucie is an executive and growth strategist with over a decade across finance, Web3, and emerging technology. She has worked across Web3, luxury, fintech, AI, and political campaign clients before moving into leadership roles at the frontier of AI and blockchain. At GODL Labs, she leads execution across token strategy, partnerships, community growth, go-to-market planning, investor communications, and operational coordination.",
        },
        {
          name: "Sidharth Sogani",
          role: "Chief Strategy Officer",
          image: "/team/sidharth-sogani.png",
          bio:
            "Sidharth is the founder and CEO of CREBACO Global, a blockchain and cryptocurrency research, consulting, intelligence, and rating firm. Since 2017, he has consulted on 157+ projects across legal, technical, financial, and due-diligence dimensions. He brings deep experience in GCC digital-asset fund management, policy frameworks, token research, market-entry strategy, and institutional blockchain advisory.",
        },
        {
          name: "Avin Garg",
          role: "Growth & Marketing Lead",
          image: "/team/d16dad15-e10e.png",
          bio:
            "Avin Garg has been active in the digital asset industry for over six years, with experience across token launches, growth strategy, and ecosystem expansion. His expertise revolves around building scalable marketing flywheels, identifying industry trends, and driving narrative-led growth across DeFi, AI, and RWA sectors. He currently oversees growth strategy, partnerships, and marketing execution across multiple digital asset initiatives.",
        },
        {
          name: "Brian Ho",
          role: "CFO",
          image: "/team/brian-ho.png",
          bio:
            "Brian has over a decade of senior banking, wealth management, and corporate finance experience, including HSBC Hong Kong and CFO or board advisory roles across energy, commodities, and real estate. He brings hands-on experience in budgeting, cost-benefit analysis, forecasting, capital raising, treasury planning, compliance coordination, investor reporting, and cross-border financial structures.",
        },
        {
          name: "Sean Demosthenous",
          role: "Strategic Advisor",
          image: "/team/sean.png",
          bio:
            "Sean began his career at Lloyd's of London, executed over $7 billion in credit default swaps, and brokered international energy commodities across global markets. He is a partner at Rythm Capital, has been involved in over $100 million in capital raises and deal flow across three continents, and advises GODL Labs on institutional capital formation, strategic partnerships, commodity markets, and blockchain yield design.",
        },
      ],
    },
    plans: {
      howItWorks: {
        title: "How it works:",
        steps: [
          {
            title: "Stake your GODL",
            description:
              "Standard Chartered's trading desk hedges the gold price at the moment you stake, locking your principal in USDT value for the entire lock period.",
          },
          {
            title: "Earn yield in USDT",
            description:
              "Yield accrues monthly over your chosen lock period of 3, 6, or 12 months, and is distributed at maturity.",
          },
          {
            title: "Redeem at maturity",
            description:
              "Receive your USDT principal plus your remaining accrued yield. Your principal is not affected by gold-price movements during the lock period.",
          },
        ],
        note: "Don't hold GODL yet? GODL acquisition opens after the USDT pricing and oracle flow is finalized.",
      },
      planCards: [
        {
          cycle: "3-Month Cycle",
          apy: "15%",
          description: "Short-cycle staking option balancing liquidity with stable annualized yield.",
          items: [
            "Lock term: 3 months (on-chain governed)",
            "Monthly yield accrual",
            "Maturity payout: principal + accrued yield in USDT",
          ],
        },
        {
          cycle: "6-Month Cycle",
          apy: "21%",
          description: "Mid-cycle staking option offering a stronger yield-to-duration balance.",
          items: [
            "Lock term: 6 months (on-chain governed)",
            "Monthly yield accrual",
            "Maturity payout: principal + accrued yield in USDT",
          ],
        },
        {
          cycle: "12-Month Cycle",
          apy: "31%",
          badge: "Featured",
          highlight: true,
          description: "Long-cycle staking option with our highest annualized yield.",
          items: [
            "Lock term: 12 months (on-chain governed)",
            "Monthly yield accrual",
            "Maturity payout: principal + accrued yield in USDT",
          ],
        },
      ],
    },
    faqItems: [
      {
        id: "faq-peg",
        question: "How does USGD maintain the 1:1 target exchange rate with USDT?",
        answer:
          "USGD maintains the peg target through reserve management, liquidity depth maintenance, and market-making strategies. Displayed rates, pool depth, and swap channels are synchronized in the Swap module for timely tracking of deviation and recovery.",
      },
      {
        id: "faq-gold",
        question: "How is the mapping between GODL and underlying gold assets defined?",
        answer:
          "As the gold-anchored mapping unit, GODL is constrained by mining-asset ownership proof, audit disclosures, and issuance rules. Core parameters are updated in project announcements and audit disclosures, while the frontend shows currently active parameters.",
      },
      {
        id: "faq-yield",
        question: "How can I view staking yield and maturity redemption rules?",
        answer:
          "The staking page shows APY, lock cycle, USDT reference principal, and maturity claim values. Ecosystem incentives are not part of the early staking phase and will be disclosed separately if launched.",
      },
      {
        id: "faq-farm",
        question: "How are APY, TVL, and reward claims calculated independently for DeFi pools?",
        answer:
          "APY, TVL, and rewards are calculated per pool independently without aggregation. List and card modes show the same pool dataset, and claiming rewards only affects the current pool’s claimable value.",
      },
    ],
    hero: {
      badge: "GODL LABS · Institutional Gold RWA",
      description:
        "Institutional-grade gold tokenization backed by audited Tanzanian mining reserves. A regulated, transparent, and on-chain framework bridging real-world gold and decentralized finance.",
      launch: "Stake Now",
      farmsLink: "Stake",
      portfolioLink: "Asset Dashboard",
      contactLink: "Contact Us",
      previewAlt: "GODL asset dashboard preview",
      trustNetwork: "Ecosystem & infrastructure partners",
    },
    heroPreview: {
      chainLive: "BSC Live",
      reserveMapping: "Reserve Mapping",
    },
    sectionHeadings: {
      overviewBase: "Protocol",
      overviewHighlight: "Snapshot",
      overviewSubtitle: "Live operating metrics across asset scale, yield, and token supply.",
      tokenomicsBase: "Three-Token",
      tokenomicsHighlight: "Architecture",
      tokenomicsSubtitle: "USGD, GODL, and GDL each play a distinct role in the GODL Labs ecosystem: settlement, asset representation, and governance.",
      matrixBase: "What GODL Labs",
      matrixHighlight: "Delivers",
      matrixSubtitle: "A four-pillar framework spanning assets, yield, strategy, and security.",
      yieldBase: "How Yield Is",
      yieldHighlight: "Generated",
      yieldSubtitle:
        "GODL staking yield is anchored to two real-world engines: audited gold mine revenue and a regulated AI gold hedge fund.",
      auditBase: "Audit and Partnership",
      auditHighlight: "Endorsements",
      auditSubtitle: "A multi-layer validation system for asset authenticity, regulatory path, and protocol execution.",
      whyBase: "Why",
      whyHighlight: "GODL Labs",
      whySubtitle: "A side-by-side view of how GODL Labs compares to the traditional gold-token model.",
      securityBase: "Audit &",
      securityHighlight: "Custody",
      securitySubtitle: "Independent audits, regulated custody partners, and transparent on-chain verification — the foundation of institutional-grade trust.",
      partnerBase: "Strategic",
      partnerHighlight: "Partnerships",
      partnerSubtitle: "A network of regulated custody, audit, and refining partners spanning the GCC, East Africa, and global crypto infrastructure.",
      teamBase: "Core Team and",
      teamHighlight: "Advisor Network",
      teamSubtitle: "Highlights execution, strategy, finance, marketing, and institutional advisory resources behind the official site.",
      plansBase: "GODL Staking",
      plansHighlight: "Plans",
      plansSubtitle:
        "Three lock cycles, each anchored to real mining-revenue yield. Stake your GODL, Standard Chartered's trading desk hedges the gold price the moment you stake, locking your principal in USDT value for the entire lock period. Yield accrues monthly and is settled through Standard Chartered. At maturity, you receive your principal plus accrued yield in USDT. Retail minimum: $500. Institutional minimum: $1,000,000. Parameters are governed on-chain.",
      faqBase: "FAQ and",
      faqHighlight: "Clarifications",
      faqSubtitle: "Core explanations on stable anchoring, asset mapping, reward release, and mining rules.",
      finalBase: "Enter",
      finalHighlight: "Stake Now",
    },
    yieldSources: {
      cards: [
        {
          title: "Gold Mining Revenue",
          label: "Primary yield engine",
          icon: "mdi:pickaxe",
          description:
            "46,000 oz/yr projected production from the Tanzania JORC-audited reserve under licence E734429. Mine revenue is the primary source of GODL staking yield.",
        },
        {
          title: "AI Gold Hedge Fund",
          label: "Secondary yield layer",
          icon: "mdi:chart-timeline-variant-shimmer",
          description:
            "Managed by Wynson Asset Management, an SFC-regulated Hong Kong entity. The Wynson Cayman gold-hedged AI fund runs a systematic Delta-neutral hedging strategy across London LBMA and New York COMEX gold markets, with an audited track record that reinforces staking returns.",
        },
      ],
    },
    blocks: {
      featureTitleBase: "Institution-grade",
      featureTitleHighlight: "Asset Management Framework",
      featureDescription:
        "Through collaboration across ownership proof, yield strategies, and risk control, gold RWA forms an executable loop from underlying assets to on-chain circulation.",
      matrixTopLeftTitle: "Audited Mining Assets",
      matrixTopLeftDescription:
        "Tanzanian gold mining assets under license E734429, with independent reserve audits and physical custody at ALTENEEN REFINERY and Ferrari Vault.",
      matrixBottomLeftTitle: "Aligned Investment Strategy",
      matrixBottomLeftDescription:
        "Staking terms, redemption rules, and on-chain governance are designed in lockstep to balance yield, liquidity, and long-term sustainability.",
      matrixTopRightTitle: "Structured Yield",
      matrixTopRightDescription:
        "Three staking cycles — 3, 6, and 12 months — delivering annualized returns of 15% / 21% / 31%, anchored to real mining revenue.",
      matrixBottomRightTitle: "Audit & Security",
      matrixBottomRightDescription:
        "Smart contracts audited by CertiK. Reserve and asset audits by independent firms. Multi-source pricing oracles and on-chain risk controls protect every layer of the protocol.",
      dataPlatformTitleBase: "A global",
      dataPlatformTitleHighlight: "RWA asset-management infrastructure",
      dataPlatformTitleSuffix: "for cross-border coordination",
      dataPlatformDescription:
        "Built on a protocol-middleware-application full-stack architecture, and combined with anti-manipulation oracle feeds plus on/off-chain attestations, it makes asset ownership, staking operations, and cross-border settlement traceable, auditable, and executable.",
      launchTitleBase: "Start your",
      launchTitleHighlight: "gold staking program",
      launchDescription:
        "Enter the staking page to view APY, lock cycles, USDT reference principal, and maturity claim status.",
      launchButton: "Stake Now",
      whyTraditional: "Traditional Model",
      planFreeCycle: "3-Month Cycle",
      planFreeDescription: "Suitable for conservative allocation with transparent and traceable release rules.",
      planProCycle: "12-Month Cycle",
      planProIncludeGdl: "USDT settlement",
      planProDescription: "Long-term allocation plan with USDT-settled principal and accrued yield at maturity.",
      planButton: "Stake",
      frontEndDemo: "Frontend Demo",
      planMidIntro: "Mid-cycle (6 months) can be configured with a 21% APY plan:",
      finalDescription:
        "You can enter the staking page to view lock cycles, or open the asset dashboard to check balances and records.",
      finalButtonPrimary: "Stake Now",
      finalButtonSecondary: "Asset Dashboard",
      contactCardTitle: "Contact Us",
      contactCardDescription: "Fill in your email to receive notifications on staking openings, audit milestones, and protocol announcements.",
      contactCardEmailPlaceholder: "Enter your email",
      contactCardSubmit: "Submit Email",
      contactCardOpenFull: "Open full contact page",
      tokenProfile: "Token Profile",
    },
  },
};

export default en;
