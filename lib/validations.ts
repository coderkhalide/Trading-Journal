import { z } from 'zod'

export const TradeSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  asset: z.string().min(1, 'Asset is required'),
  tradeType: z.enum(['Long', 'Short']),
  entryPrice: z.number().positive('Entry price must be positive'),
  exitPrice: z.number().positive('Exit price must be positive'),
  stopLoss: z.number().positive('Stop loss must be positive'),
  takeProfit: z.number().positive('Take profit must be positive'),
  positionSize: z.number().positive('Position size must be positive'),
  riskPercent: z.number().min(0).max(100, 'Risk percent must be between 0 and 100'),
  idealRiskAmount: z.number().positive('Ideal risk amount must be positive'),
  system: z.string().min(1, 'Trading system is required'),
  timeframe: z.string().min(1, 'Timeframe is required'),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  screenshot: z.string().optional(),
  grade: z.string().min(1, 'Grade is required'),
  ticket: z.string().optional(),
  session: z.string().min(1, 'Session is required'),
})

export const SettingsSchema = z.object({
  accountBalance: z.number().positive('Account balance must be positive'),
  assetFees: z.record(z.string(), z.number().min(0, 'Fee must be non-negative')),
  tradingSystems: z.array(z.string().min(1, 'System name cannot be empty')),
  tradingSessions: z.array(z.object({
    name: z.string().min(1, 'Session name is required'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format'),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color'),
    description: z.string(),
  })),
  riskDeviationTolerance: z.number().min(0).max(100, 'Risk deviation tolerance must be between 0 and 100'),
  systemIdealRisk: z.record(z.string(), z.number().positive()),
  defaultIdealRisk: z.number().positive('Default ideal risk must be positive'),
})

export const FilterOptionsSchema = z.object({
  system: z.string().optional(),
  systems: z.array(z.string()).optional(),
  timeframe: z.string().optional(),
  timeframes: z.array(z.string()).optional(),
  outcome: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
  grade: z.string().optional(),
  grades: z.array(z.string()).optional(),
  session: z.string().optional(),
  sessions: z.array(z.string()).optional(),
  dayOfWeek: z.string().optional(),
  daysOfWeek: z.array(z.string()).optional(),
  riskDeviation: z.enum(['over', 'under', 'good']).optional(),
  minR: z.number().optional(),
  maxR: z.number().optional(),
  minPnL: z.number().optional(),
  maxPnL: z.number().optional(),
})

export type TradeFormData = z.infer<typeof TradeSchema>
export type SettingsFormData = z.infer<typeof SettingsSchema>
export type FilterFormData = z.infer<typeof FilterOptionsSchema>
