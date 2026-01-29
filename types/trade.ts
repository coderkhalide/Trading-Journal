export interface Trade {
  id: string
  date: string
  time: string
  endDate?: string // Optional for trades that are still open
  endTime?: string // Optional for trades that are still open
  asset: string
  tradeType: "Long" | "Short"
  entryPrice: number
  exitPrice: number
  stopLoss: number
  takeProfit: number // Keep for backward compatibility but not used
  positionSize: number
  riskPercent: number
  rMultiple: number
  pnl: number
  fee: number
  riskAmount: number
  idealRiskAmount: number // New: Expected risk amount for this trade
  actualRiskAmount: number // New: Actual risk including fees
  riskDeviation: number // New: Percentage deviation from ideal
  expectedR: number // New: R calculated based on ideal risk
  isOverRisked: boolean // New: Whether trade exceeded risk tolerance
  isUnderRisked: boolean // New: Whether trade was under-risked
  duration: string
  system: string
  timeframe: string
  notes: string
  tags: string[]
  screenshot?: string
  outcome: "Win" | "Loss" | "Breakeven"
  grade: string
  ticket?: string
  session: string
  dayOfWeek: string
}

export interface TradeStats {
  totalTrades: number
  winRate: number
  totalPnL: number
  averageR: number
  averageExpectedR: number // New: Average based on expected R
  expectedValue: number // New: Expected Value (EV) - same as averageExpectedR
  profitFactor: number
  expectancy: number
  expectedExpectancy: number // New: Expectancy based on expected R
  totalR: number
  totalExpectedR: number // New: Total expected R
  winningTrades: number
  losingTrades: number
  largestWin: number
  largestLoss: number
  totalFees: number
  totalRisk: number
  totalIdealRisk: number // New: Total ideal risk
  overRiskedTrades: number // New: Count of over-risked trades
  underRiskedTrades: number // New: Count of under-risked trades
  avgRiskDeviation: number // New: Average risk deviation
}

export interface FilterOptions {
  system?: string
  systems?: string[] // New: Multi-select systems
  timeframe?: string
  timeframes?: string[] // New: Multi-select timeframes
  outcome?: string
  dateFrom?: string
  dateTo?: string
  tags?: string[]
  grade?: string
  grades?: string[] // New: Multi-select grades
  session?: string
  sessions?: string[] // New: Multi-select sessions
  dayOfWeek?: string
  daysOfWeek?: string[] // New: Multi-select days of week
  riskDeviation?: "over" | "under" | "good" // New: Filter by risk deviation
  minR?: number // New: Minimum R-multiple filter
  maxR?: number // New: Maximum R-multiple filter
  minPnL?: number // New: Minimum P&L filter
  maxPnL?: number // New: Maximum P&L filter
}

export interface TradingSession {
  name: string
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  color: string
  description: string
}

export interface Settings {
  accountBalance: number
  assetFees: Record<string, number>
  tradingSystems: string[]
  tradingSessions: TradingSession[]
  riskDeviationTolerance: number // New: Percentage tolerance for risk deviation (default 10%)
  systemIdealRisk: Record<string, number> // New: Ideal risk amount per system
  defaultIdealRisk: number // New: Default ideal risk amount
}

export interface BrokerTrade {
  ticket: string
  opening_time_utc: string
  closing_time_utc: string
  type: string
  lots: string
  symbol: string
  opening_price: string
  closing_price: string
  stop_loss: string
  take_profit: string
  commission_usd: string
  profit_usd: string
  close_reason: string
}

export interface BalanceAdjustment {
  id: string
  amount: number
  reason: string
  type: "add" | "subtract"
  date: string
  time: string
  notes?: string
}
