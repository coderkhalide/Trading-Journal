import type { Trade, Settings, BalanceAdjustment } from '@/types/trade'
import { APP_CONFIG } from './constants'

export interface ExportData {
  trades: Trade[]
  settings: Settings
  balanceAdjustments: BalanceAdjustment[]
  exportDate: string
  version: string
}

export function exportToJSON(
  trades: Trade[],
  settings: Settings,
  balanceAdjustments: BalanceAdjustment[]
): string {
  const exportData: ExportData = {
    trades,
    settings,
    balanceAdjustments,
    exportDate: new Date().toISOString(),
    version: '1.0.0',
  }
  
  return JSON.stringify(exportData, null, 2)
}

export function exportToCSV(trades: Trade[]): string {
  if (trades.length === 0) {
    return ''
  }
  
  const headers = [
    'Date',
    'Time',
    'Asset',
    'Trade Type',
    'Entry Price',
    'Exit Price',
    'Stop Loss',
    'Take Profit',
    'Position Size',
    'Risk %',
    'R Multiple',
    'Expected R',
    'P&L',
    'Fee',
    'Risk Amount',
    'Ideal Risk Amount',
    'Risk Deviation',
    'Duration',
    'System',
    'Timeframe',
    'Notes',
    'Tags',
    'Outcome',
    'Grade',
    'Ticket',
    'Session',
    'Day of Week',
  ]
  
  const rows = trades.map(trade => [
    trade.date,
    trade.time,
    trade.asset,
    trade.tradeType,
    trade.entryPrice,
    trade.exitPrice,
    trade.stopLoss,
    trade.takeProfit,
    trade.positionSize,
    trade.riskPercent,
    trade.rMultiple,
    trade.expectedR || 0,
    trade.pnl,
    trade.fee || 0,
    trade.riskAmount || 0,
    trade.idealRiskAmount || 0,
    trade.riskDeviation || 0,
    trade.duration,
    trade.system,
    trade.timeframe,
    `"${trade.notes.replace(/"/g, '""')}"`, // Escape quotes in notes
    `"${trade.tags.join(', ')}"`,
    trade.outcome,
    trade.grade,
    trade.ticket || '',
    trade.session,
    trade.dayOfWeek,
  ])
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadJSONExport(
  trades: Trade[],
  settings: Settings,
  balanceAdjustments: BalanceAdjustment[]
): void {
  const content = exportToJSON(trades, settings, balanceAdjustments)
  const filename = `trading-journal-export-${new Date().toISOString().split('T')[0]}.json`
  downloadFile(content, filename, 'application/json')
}

export function downloadCSVExport(trades: Trade[]): void {
  const content = exportToCSV(trades)
  const filename = `trading-journal-trades-${new Date().toISOString().split('T')[0]}.csv`
  downloadFile(content, filename, 'text/csv')
}

export function validateFileSize(file: File): boolean {
  return file.size <= APP_CONFIG.FILE_UPLOAD.MAX_FILE_SIZE
}

export function validateFileType(file: File): boolean {
  return (APP_CONFIG.FILE_UPLOAD.ALLOWED_TYPES as readonly string[]).includes(file.type)
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
