import { useMemo } from 'react'
import type { Trade, FilterOptions } from '@/types/trade'

export function useFilteredTrades(trades: Trade[], filters: FilterOptions) {
  return useMemo(() => {
    return trades.filter(trade => {
      // System filter
      if (filters.systems && filters.systems.length > 0 && !filters.systems.includes(trade.system)) {
        return false
      }
      
      // Timeframe filter
      if (filters.timeframes && filters.timeframes.length > 0 && !filters.timeframes.includes(trade.timeframe)) {
        return false
      }
      
      // Outcome filter
      if (filters.outcome && trade.outcome !== filters.outcome) {
        return false
      }
      
      // Date range filter
      if (filters.dateFrom && trade.date < filters.dateFrom) {
        return false
      }
      
      if (filters.dateTo && trade.date > filters.dateTo) {
        return false
      }
      
      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => trade.tags.includes(tag))
        if (!hasMatchingTag) {
          return false
        }
      }
      
      // Grade filter
      if (filters.grades && filters.grades.length > 0 && !filters.grades.includes(trade.grade)) {
        return false
      }
      
      // Session filter
      if (filters.sessions && filters.sessions.length > 0 && !filters.sessions.includes(trade.session)) {
        return false
      }
      
      // Day of week filter
      if (filters.daysOfWeek && filters.daysOfWeek.length > 0 && !filters.daysOfWeek.includes(trade.dayOfWeek)) {
        return false
      }
      
      // Risk deviation filter
      if (filters.riskDeviation) {
        if (filters.riskDeviation === 'over' && !trade.isOverRisked) return false
        if (filters.riskDeviation === 'under' && !trade.isUnderRisked) return false
        if (filters.riskDeviation === 'good' && (trade.isOverRisked || trade.isUnderRisked)) return false
      }
      
      // R-multiple range filter
      if (filters.minR !== undefined && trade.rMultiple < filters.minR) {
        return false
      }
      
      if (filters.maxR !== undefined && trade.rMultiple > filters.maxR) {
        return false
      }
      
      // P&L range filter
      if (filters.minPnL !== undefined && trade.pnl < filters.minPnL) {
        return false
      }
      
      if (filters.maxPnL !== undefined && trade.pnl > filters.maxPnL) {
        return false
      }
      
      return true
    })
  }, [trades, filters])
}
