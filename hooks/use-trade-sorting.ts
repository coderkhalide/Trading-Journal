"use client"

import { useState, useMemo } from "react"
import type { Trade } from "@/types/trade"

type SortField = "date" | "asset" | "system" | "rMultiple" | "expectedR" | "pnl" | "riskPercent" | "grade" | "outcome"
type SortDirection = "asc" | "desc"

interface UseTradeSortingProps {
  trades: Trade[]
  initialSortField?: SortField
  initialSortDirection?: SortDirection
}

export function useTradeSorting({ trades, initialSortField = "date", initialSortDirection = "desc" }: UseTradeSortingProps) {
  const [sortField, setSortField] = useState<SortField>(initialSortField)
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle special cases
      if (sortField === "date") {
        aValue = new Date(a.date + " " + a.time).getTime()
        bValue = new Date(b.date + " " + b.time).getTime()
      } else if (sortField === "expectedR") {
        aValue = a.expectedR || 0
        bValue = b.expectedR || 0
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [trades, sortField, sortDirection])

  return {
    sortField,
    sortDirection,
    sortedTrades,
    handleSort,
  }
}

export type { SortField, SortDirection }
