"use client"

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SortField, SortDirection } from "@/hooks/use-trade-sorting"

interface SortButtonProps {
  field: SortField
  currentSortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  children: React.ReactNode
  className?: string
}

export function SortButton({ field, currentSortField, sortDirection, onSort, children, className }: SortButtonProps) {
  const getSortIcon = () => {
    if (currentSortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  return (
    <Button variant="ghost" className={`h-8 p-2 ${className}`} onClick={() => onSort(field)}>
      {children}
      {getSortIcon()}
    </Button>
  )
}
