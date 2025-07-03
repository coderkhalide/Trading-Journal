"use client"

import { useState, useMemo } from "react"
import type { Trade, FilterOptions } from "@/types/trade"

interface UseTradeFiltersProps {
  trades: Trade[]
  initialFilters?: FilterOptions
}

export function useTradeFilters({ trades, initialFilters = {} }: UseTradeFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FilterOptions>(initialFilters)
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({})

  // Get unique values for filter dropdowns
  const filterOptions = useMemo(() => ({
    systems: [...new Set(trades.map((t) => t.system).filter(Boolean))],
    timeframes: [...new Set(trades.map((t) => t.timeframe).filter(Boolean))],
    sessions: [...new Set(trades.map((t) => t.session).filter(Boolean))],
    days: [...new Set(trades.map((t) => t.dayOfWeek).filter(Boolean))],
    grades: [...new Set(trades.map((t) => t.grade).filter(Boolean))],
    tags: [...new Set(trades.flatMap((t) => t.tags))],
  }), [trades])

  // Combine basic and advanced filters
  const allFilters = useMemo(() => ({ ...filters, ...advancedFilters }), [filters, advancedFilters])

  // Filter trades based on search and filters
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const matchesSearch =
        !searchTerm ||
        trade.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.system.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesSystem = !allFilters.system || trade.system === allFilters.system
      const matchesTimeframe = !allFilters.timeframe || trade.timeframe === allFilters.timeframe
      const matchesOutcome = !allFilters.outcome || trade.outcome === allFilters.outcome
      const matchesGrade = !allFilters.grade || trade.grade === allFilters.grade
      const matchesSession = !allFilters.session || trade.session === allFilters.session
      const matchesDay = !allFilters.dayOfWeek || trade.dayOfWeek === allFilters.dayOfWeek

      // Advanced filters
      const matchesDateFrom = !allFilters.dateFrom || trade.date >= allFilters.dateFrom
      const matchesDateTo = !allFilters.dateTo || trade.date <= allFilters.dateTo
      const matchesRiskDeviation =
        !allFilters.riskDeviation ||
        (allFilters.riskDeviation === "over" && trade.isOverRisked) ||
        (allFilters.riskDeviation === "under" && trade.isUnderRisked) ||
        (allFilters.riskDeviation === "good" && !trade.isOverRisked && !trade.isUnderRisked)

      const matchesTags =
        !allFilters.tags || allFilters.tags.length === 0 || allFilters.tags.some((tag) => trade.tags.includes(tag))

      const matchesMinR = allFilters.minR === undefined || trade.rMultiple >= allFilters.minR
      const matchesMaxR = allFilters.maxR === undefined || trade.rMultiple <= allFilters.maxR
      const matchesMinPnL = allFilters.minPnL === undefined || trade.pnl >= allFilters.minPnL
      const matchesMaxPnL = allFilters.maxPnL === undefined || trade.pnl <= allFilters.maxPnL

      return (
        matchesSearch &&
        matchesSystem &&
        matchesTimeframe &&
        matchesOutcome &&
        matchesGrade &&
        matchesSession &&
        matchesDay &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesRiskDeviation &&
        matchesTags &&
        matchesMinR &&
        matchesMaxR &&
        matchesMinPnL &&
        matchesMaxPnL
      )
    })
  }, [trades, searchTerm, allFilters])

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    advancedFilters,
    setAdvancedFilters,
    allFilters,
    filteredTrades,
    filterOptions,
  }
}
