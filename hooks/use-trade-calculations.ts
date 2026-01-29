import { useMemo } from 'react'
import type { Trade, TradeStats, Settings } from '@/types/trade'

export function useTradeCalculations(trades: Trade[], settings: Settings) {
  return useMemo(() => {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalPnL: 0,
        averageR: 0,
        averageExpectedR: 0,
        expectedValue: 0,
        profitFactor: 0,
        expectancy: 0,
        expectedExpectancy: 0,
        totalR: 0,
        totalExpectedR: 0,
        winningTrades: 0,
        losingTrades: 0,
        largestWin: 0,
        largestLoss: 0,
        totalFees: 0,
        totalRisk: 0,
        totalIdealRisk: 0,
        overRiskedTrades: 0,
        underRiskedTrades: 0,
        avgRiskDeviation: 0,
      } as TradeStats
    }

    const winningTrades = trades.filter(t => t.outcome === 'Win').length
    const losingTrades = trades.filter(t => t.outcome === 'Loss').length
    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0)
    const totalFees = trades.reduce((sum, trade) => sum + (trade.fee || 0), 0)
    const netPnL = totalPnL - totalFees
    const totalR = trades.reduce((sum, trade) => sum + trade.rMultiple, 0)
    const totalExpectedR = trades.reduce((sum, trade) => sum + (trade.expectedR || 0), 0)
    
    // Calculate net expected R (after fees)
    const netExpectedR = trades.reduce((sum, trade) => {
      const netPnLForTrade = trade.pnl - (trade.fee || 0)
      const idealRisk = trade.idealRiskAmount || 100
      return sum + (idealRisk > 0 ? netPnLForTrade / idealRisk : 0)
    }, 0)
    
    const winningPnL = trades.filter(t => t.outcome === 'Win').reduce((sum, t) => sum + t.pnl, 0)
    const losingPnL = Math.abs(trades.filter(t => t.outcome === 'Loss').reduce((sum, t) => sum + t.pnl, 0))
    
    const stats: TradeStats = {
      totalTrades: trades.length,
      winRate: trades.length > 0 ? (winningTrades / trades.length) * 100 : 0,
      totalPnL: netPnL, // Use net P&L instead of gross
      averageR: trades.length > 0 ? totalR / trades.length : 0,
      averageExpectedR: trades.length > 0 ? netExpectedR / trades.length : 0, // Use net expected R
      expectedValue: trades.length > 0 ? netExpectedR / trades.length : 0, // Use net expected R
      profitFactor: losingPnL > 0 ? winningPnL / losingPnL : winningPnL > 0 ? 999 : 0,
      expectancy: trades.length > 0 ? netPnL / trades.length : 0, // Use net P&L
      expectedExpectancy: trades.length > 0 ? netExpectedR / trades.length : 0, // Use net expected R
      totalR,
      totalExpectedR: netExpectedR, // Use net expected R
      winningTrades,
      losingTrades,
      largestWin: Math.max(...trades.map(t => t.pnl), 0),
      largestLoss: Math.min(...trades.map(t => t.pnl), 0),
      totalFees,
      totalRisk: trades.reduce((sum, trade) => sum + (trade.riskAmount || 0), 0),
      totalIdealRisk: trades.reduce((sum, trade) => sum + (trade.idealRiskAmount || 0), 0),
      overRiskedTrades: trades.filter(t => t.isOverRisked).length,
      underRiskedTrades: trades.filter(t => t.isUnderRisked).length,
      avgRiskDeviation: trades.length > 0 ? trades.reduce((sum, t) => sum + (t.riskDeviation || 0), 0) / trades.length : 0,
    }

    return stats
  }, [trades, settings])
}
