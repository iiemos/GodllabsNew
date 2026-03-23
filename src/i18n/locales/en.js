const en = {
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
      farms: "Farms",
      portfolio: "Portfolio",
      swap: "Swap",
      bridge: "Bridge",
    },
    bridgeComingSoon: "Cross-chain bridge is not available yet",
    wallet: {
      connect: "Connect Wallet",
      connecting: "Connecting...",
      disconnect: "Disconnect wallet",
      connected: "Wallet connected:",
      extensionMissing: "Wallet extension not detected, please install MetaMask",
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
      farms: "Farms",
      portfolio: "Asset Dashboard",
      swap: "Swap Center",
      contact: "Contact Us",
      start: "Launch Program",
    },
    contactDescription:
      "Leave your email to get first-hand updates on fund openings, liquidity mining, and audit progress. Project notifications only.",
    emailPlaceholder: "Enter your email",
    submit: "Submit",
    copyright: "© 2026 GODL LABS All rights reserved",
    poweredBy: "Powered by",
  },
  contact: {
    badge: "Contact",
    title: "Contact Us",
    description:
      "For partnerships, fund subscription inquiries, or technical support, please leave your email and requirement details. This page is frontend demo only.",
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
  portfolio: {
    badge: "Asset Dashboard",
    title: "Asset Overview",
    description:
      "Displays balances of USDT, USGD, GDL, GODL and fund shares, with transaction history retained. Yield is handled independently per pool, so one-click claim is not provided here.",
    goSwap: "Go to Swap Center",
    balances: {
      usdt: "USDT",
      usgd: "USGD",
      gdl: "GDL",
      godl: "GODL",
      fundShares: "Fund Shares",
    },
    recordsTitle: "Record Details",
    recentCount: "Latest 4",
    table: {
      time: "Time",
      type: "Type",
      token: "Token",
      amount: "Amount",
      status: "Status",
    },
    recordTypes: {
      fundSubscribe: "Fund Subscription",
      rewardClaim: "Reward Claim",
      lpMining: "LP Mining",
      swap: "Swap",
    },
  },
  swap: {
    title: "Swap Center",
    subtitle: "Based on SwapView structure, supports dual pair switching and trade parameter settings (frontend demo)",
    tabs: {
      usdtUsgd: {
        label: "USDT ↔ USGD",
        helper: "Frontend demo follows the 1:1 stable target. Actual execution depends on on-chain liquidity pools.",
      },
      usgdGodl: {
        label: "USGD ↔ GODL",
        helper: "Converted by referenced gold-related price feeds. Current values are for page demo only.",
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
      swapSuccess: "{{from}} → {{to}} swap successful (frontend demo)",
    },
  },
  farms: {
    title: "Farms",
    subtitle: "Stake LP tokens to earn.",
    panelTabs: {
      farm: "Liquidity Mining",
      fund: "Fund Subscription",
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
  home: {
    trustLogos: ["VARA", "OJK", "TMC", "MoM", "CAYMAN", "AUDIT"],
    protocolMetrics: [
      {
        label: "Total Value Locked (TVL)",
        value: "$128.6M",
        note: "Real-time aggregate of funds and liquidity pools",
      },
      {
        label: "Top APY",
        value: "30%",
        note: "12-month fund cycle",
      },
      {
        label: "Current GODL Supply",
        value: "500,000 oz",
        note: "Gold-anchored asset metric",
      },
      {
        label: "USGD Supply",
        value: "XXX",
        note: "Targeted 1:1 stability vs USDT",
      },
    ],
    institutionalPillars: [
      {
        title: "Premium Mining Assets",
        description:
          "Backed by compliant Tanzanian mining assets, with reserve verification by independent institutions and on-chain notarization.",
      },
      {
        title: "High Yield Structure",
        description: "Fund cycles of 3/6/12 months aligned with annualized ranges of 13% / 19% / 30%.",
      },
      {
        title: "Advanced Investment Strategy",
        description:
          "RWA + DeFi coordination modularizes ownership proof, circulation, and yield distribution for gold assets.",
      },
    ],
    tokenRows: [
      {
        symbol: "USGD",
        icon: "mdi:shield-check-outline",
        summary:
          "Stablecoin targeting a 1:1 exchange rate with USDT for platform payments, subscriptions, and settlement.",
        detail:
          "Anchoring is supported by liquidity and strategy scripts, serving cross-border settlement, fund subscriptions, and value transfer across gold RWA flows.",
      },
      {
        symbol: "GODL",
        icon: "mdi:gold",
        summary: "Gold-anchored token mapped to fund-share value, with an initial issuance baseline of 160,000.",
        detail:
          "Underlying value references Tanzanian mining assets, including 2,300 tons of proven reserves and 3,500 tons of undeveloped long-term potential.",
      },
      {
        symbol: "GDL",
        icon: "mdi:alpha-g-circle-outline",
        summary: "Governance token for liquidity incentives, governance voting, and ecosystem coordination.",
        detail:
          "Allocated across ecosystem incentives, foundation, team, and compliance-audit programs to close the loop between governance and incentives.",
      },
    ],
    helpCards: [
      {
        icon: "mdi:shield-lock-outline",
        leading: "Compliance",
        title: "Audit & Custody",
        description:
          "Underlying assets, reserves, and key ledger data are audited by rules to form traceable dual verification both on-chain and off-chain.",
      },
      {
        icon: "mdi:radar",
        leading: "Security",
        title: "Risk Control System",
        description:
          "Multi-source pricing, layered permissions, and on-chain monitoring work together to reduce single-point and operational risks.",
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
        aligno: "Real gold mining asset ownership with on-chain notarization",
        other: "Token narrative only, lacking physical asset backing",
      },
      {
        aligno: "Multi-jurisdiction regulatory path with audit coordination",
        other: "Ambiguous compliance boundaries with high interpretation costs",
      },
      {
        aligno: "USGD/USDT stability target with liquidity mechanisms",
        other: "High volatility and weak settlement stability",
      },
      {
        aligno: "Fund subscription + mining incentive linkage",
        other: "Fragmented yield logic without coordinated loop",
      },
      {
        aligno: "Four-dimensional loop: asset, tech, compliance, capital",
        other: "Information silos with opaque risk exposure",
      },
    ],
    projectCards: [
      {
        title: "Regulatory Coordination",
        desc: "Builds cross-regional compliance communication around virtual-asset and mining regulation frameworks.",
        icon: "mdi:bank-check",
      },
      {
        title: "Asset Backing",
        desc: "Uses Tanzanian gold mining assets as core support to strengthen token value mapping and credibility.",
        icon: "mdi:pickaxe",
      },
      {
        title: "Cross-border Circulation",
        desc: "Improves efficiency and transparency of asset circulation through on-chain settlement and modular contracts.",
        icon: "mdi:earth",
      },
    ],
    plans: {
      freeItems: [
        "Subscription range: 500 - 5000 USGD",
        "Lock period: 3 months",
        "Annualized yield: 13%",
        "Yield released linearly by rules",
        "On-chain status query supported",
      ],
      proItems: [
        "Lock period: 12 months",
        "Annualized yield: 30%",
        "Extra GDL incentive multiplier: 1.6x",
        "Fits long-term asset allocation strategy",
        "Yield and incentives are trackable separately",
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
        question: "How can I view fund subscription yield and GDL incentive release rules?",
        answer:
          "The fund page shows APY and release cadence by cycle, while the portfolio page shows subscription, claim, and swap records. Yield release and incentive release are tracked separately for clear principal-yield and governance-incentive visibility.",
      },
      {
        id: "faq-farm",
        question: "How are APY, TVL, and reward claims calculated independently for DeFi pools?",
        answer:
          "APY, TVL, and rewards are calculated per pool independently without aggregation. List and card modes show the same pool dataset, and claiming rewards only affects the current pool’s claimable value.",
      },
    ],
    hero: {
      badge: "GODL LABS · RWA + DeFi",
      description:
        "Built on Tanzanian gold mining assets to create a compliant, transparent, and sustainable gold RWA asset management and liquidity ecosystem.",
      launch: "Launch Program",
      farmsLink: "Fund Page",
      portfolioLink: "Asset Dashboard",
      contactLink: "Contact Us",
      previewAlt: "By Template dashboard",
      trustNetwork: "Regulatory and audit coordination network",
    },
    sectionHeadings: {
      overviewBase: "Protocol Core",
      overviewHighlight: "Dashboard",
      overviewSubtitle: "Homepage highlights key operating metrics focused on asset scale, yield capability, and supply baseline.",
      tokenomicsBase: "Three-token System and",
      tokenomicsHighlight: "Asset Mapping",
      tokenomicsSubtitle: "One-row-per-token structure with token identity on the left and role/utility on the right.",
      matrixBase: "Institution-grade Asset Management",
      matrixHighlight: "Capability Matrix",
      matrixSubtitle: "Builds a sustainable RWA operating framework across resources, yield, strategy, and security.",
      auditBase: "Audit and Partnership",
      auditHighlight: "Endorsements",
      auditSubtitle: "A multi-layer validation system for asset authenticity, regulatory path, and protocol execution.",
      whyBase: "Why Choose",
      whyHighlight: "GODL RWA",
      whySubtitle: "A side-by-side model comparison highlights structural advantages from real-asset anchoring and compliance framework.",
      securityBase: "Audit and",
      securityHighlight: "Security",
      securitySubtitle: "From reserve verification to risk control, forming a verifiable, traceable, and executable multi-layer security system.",
      partnerBase: "Strategic Cooperation and",
      partnerHighlight: "Ecosystem Synergy",
      partnerSubtitle: "Advancing collaboration across regulation, assets, and circulation to expand cross-border asset-management networks.",
      plansBase: "Gold Fund",
      plansHighlight: "Subscription Plans",
      plansSubtitle: "Subscription range 500-5000 USGD with yield and incentives configured by cycle.",
      faqBase: "FAQ and",
      faqHighlight: "Clarifications",
      faqSubtitle: "Core explanations on stable anchoring, asset mapping, reward release, and mining rules.",
      finalBase: "Enter",
      finalHighlight: "Launch Program",
    },
    blocks: {
      featureTitleBase: "Institution-grade",
      featureTitleHighlight: "Asset Management Framework",
      featureDescription:
        "Through collaboration across ownership proof, yield strategies, and risk control, gold RWA forms an executable loop from underlying assets to on-chain circulation.",
      matrixTopLeftTitle: "Premium Mining Assets",
      matrixTopLeftDescription:
        "Leverages Tanzanian mining resource endowment and compliance verification to provide physical foundations for on-chain asset mapping.",
      matrixBottomLeftTitle: "Advanced Investment Strategy",
      matrixBottomLeftDescription:
        "Fund subscription, release rules, and governance incentives are designed in coordination for long-term sustainability and risk constraints.",
      matrixTopRightTitle: "High Yield Structure",
      matrixTopRightDescription:
        "Layered 3/6/12-month yield structure supports visualized yield curves and state tracking.",
      matrixBottomRightTitle: "Audit and Security Assurance",
      matrixBottomRightDescription:
        "Multi-source oracles, reserve audits, on-chain risk control, and governance mechanisms form the protection system.",
      dataPlatformTitleBase: "A global",
      dataPlatformTitleHighlight: "RWA asset-management infrastructure",
      dataPlatformTitleSuffix: "for cross-border coordination",
      dataPlatformDescription:
        "Built on a protocol-middleware-application full-stack architecture, and combined with anti-manipulation oracle feeds plus on/off-chain attestations, it makes asset ownership, fund operations, and cross-border settlement traceable, auditable, and executable.",
      launchTitleBase: "Launch your",
      launchTitleHighlight: "gold fund program",
      launchDescription:
        "Enter the farms page to view APY, TVL, and cycles by category, and manage reward claims independently per pool.",
      launchButton: "Launch Program",
      whyTraditional: "Traditional Model",
      planFreeCycle: "3-Month Cycle",
      planFreeDescription: "Suitable for conservative allocation with transparent and traceable release rules.",
      planProCycle: "12-Month Cycle",
      planProIncludeGdl: "Includes GDL incentives",
      planProDescription: "Long-term allocation plan with dual-track release for yield and incentives.",
      planButton: "Launch Program",
      frontEndDemo: "Frontend Demo",
      planMidIntro: "Mid-cycle (6 months) can be configured with a 19% APY plan:",
      finalDescription:
        "You can enter the fund page to view subscription plans, or open the asset dashboard to check balances, records, and swap entry.",
      finalButtonPrimary: "Launch Program",
      finalButtonSecondary: "Asset Dashboard",
      contactCardTitle: "Contact Us",
      contactCardDescription: "Fill in your email to receive notifications on fund openings, mining updates, and audit disclosures.",
      contactCardEmailPlaceholder: "Enter your email",
      contactCardSubmit: "Submit Email",
      contactCardOpenFull: "Open full contact page",
      tokenProfile: "Token Profile",
    },
  },
};

export default en;
