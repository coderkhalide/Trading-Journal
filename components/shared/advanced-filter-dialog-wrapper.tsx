"use client"

import { AdvancedFilterDialog as AdvancedFilterForm } from "../advanced-filter-dialog"
import type { Trade, FilterOptions } from "@/types/trade"

interface AdvancedFilterDialogWrapperProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  trades: Trade[]
}

export function AdvancedFilterDialogWrapper({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  trades
}: AdvancedFilterDialogWrapperProps) {
  return (
    <AdvancedFilterForm
      trades={trades}
      currentFilters={filters}
      onApplyFilters={onFiltersChange}
      onCancel={() => onOpenChange(false)}
    />
  )
}
