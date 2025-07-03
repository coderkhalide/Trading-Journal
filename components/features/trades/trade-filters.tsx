"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import type { FilterOptions } from "@/types/trade"

interface TradeFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  filterOptions: {
    systems: string[]
    timeframes: string[]
    sessions: string[]
    days: string[]
  }
  onShowAdvancedFilters: () => void
}

export function TradeFilters({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  filterOptions,
  onShowAdvancedFilters,
}: TradeFiltersProps) {
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? "" : value,
    })
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search trades..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Basic filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Select value={filters.system || "all"} onValueChange={(value) => handleFilterChange("system", value)}>
          <SelectTrigger>
            <SelectValue placeholder="System" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Systems</SelectItem>
            {filterOptions.systems.map((system) => (
              <SelectItem key={system} value={system}>
                {system}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.timeframe || "all"} onValueChange={(value) => handleFilterChange("timeframe", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Timeframes</SelectItem>
            {filterOptions.timeframes.map((timeframe) => (
              <SelectItem key={timeframe} value={timeframe}>
                {timeframe}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.outcome || "all"} onValueChange={(value) => handleFilterChange("outcome", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            <SelectItem value="Win">Win</SelectItem>
            <SelectItem value="Loss">Loss</SelectItem>
            <SelectItem value="Breakeven">Breakeven</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={onShowAdvancedFilters} className="w-full">
          <Filter className="h-4 w-4 mr-2" />
          Advanced
        </Button>
      </div>
    </div>
  )
}
