export const APP_CONFIG = {
  // Local Storage Keys
  STORAGE_KEYS: {
    TRADES: 'trading-journal-trades',
    SETTINGS: 'trading-journal-settings',
    BALANCE_ADJUSTMENTS: 'trading-journal-balance-adjustments',
    FILTERS: 'trading-journal-filters',
    UI_PREFERENCES: 'trading-journal-ui-preferences',
  },
  
  // Performance Thresholds
  PERFORMANCE: {
    SLOW_RENDER_THRESHOLD: 16, // ms
    LARGE_LIST_THRESHOLD: 1000, // items
    DEBOUNCE_DELAY: 300, // ms
    THROTTLE_DELAY: 100, // ms
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    MAX_PAGE_SIZE: 500,
  },
  
  // File Upload
  FILE_UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['text/csv', 'application/json', 'image/png', 'image/jpeg'],
  },
  
  // Trading
  TRADING: {
    DEFAULT_RISK_TOLERANCE: 10, // percent
    MIN_RISK_AMOUNT: 0.01,
    MAX_RISK_AMOUNT: 10000,
    DEFAULT_ACCOUNT_BALANCE: 100,
    GRADE_OPTIONS: ['A++++', 'A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F'],
    GRADE_RISK_MULTIPLIERS: {
      'B': 0.5,
      'A': 0.8,
      'A+': 1.0,
      'A++': 1.25,
      'A+++': 2.0,
      'A++++': 2.5,
      'C': 0.3,
      'D': 0.1,
      'E': 0.05,
      'F': 0.01,
    },
    TIMEFRAMES: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'],
  },
  
  // UI
  UI: {
    TOAST_DURATION: 5000, // ms
    ANIMATION_DURATION: 200, // ms
    SIDEBAR_WIDTH: '16rem',
    SIDEBAR_WIDTH_MOBILE: '18rem',
    SIDEBAR_WIDTH_ICON: '3rem',
  },
  
  // Validation
  VALIDATION: {
    MIN_ASSET_NAME_LENGTH: 1,
    MAX_ASSET_NAME_LENGTH: 10,
    MIN_SYSTEM_NAME_LENGTH: 1,
    MAX_SYSTEM_NAME_LENGTH: 50,
    MIN_NOTES_LENGTH: 0,
    MAX_NOTES_LENGTH: 1000,
  },
} as const

export const ASSET_TYPES = {
  FOREX: 'Forex',
  CRYPTO: 'Crypto',
  STOCKS: 'Stocks',
  COMMODITIES: 'Commodities',
  INDICES: 'Indices',
} as const

export const TRADE_OUTCOMES = {
  WIN: 'Win',
  LOSS: 'Loss',
  BREAKEVEN: 'Breakeven',
} as const

export const TRADE_TYPES = {
  LONG: 'Long',
  SHORT: 'Short',
} as const

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export const DEFAULT_TRADING_SYSTEMS = [
  'Z-score',
  'EMT',
  'NYC Breakout',
  'London Open',
  'Scalping',
  'Swing Trading',
  'Mean Reversion',
  'Momentum',
  'Breakout',
  'Other',
] as const

export const DEFAULT_ASSET_FEES = {
  BTC: 16,
  ETH: 1.3,
  Gold: 11,
  XAU: 11,
} as const
