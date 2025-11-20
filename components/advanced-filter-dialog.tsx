"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Filter, BarChart3 } from "lucide-react"
import type { Trade, FilterOptions } from "@/types/trade"

interface AdvancedFilterDialogProps {
  trades: Trade[]
  currentFilters: FilterOptions
  onApplyFilters: (filters: FilterOptions) => void
  onCancel: () => void
}

export function AdvancedFilterDialog({ trades, currentFilters, onApplyFilters, onCancel }: AdvancedFilterDialogProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters)
  const [showReport, setShowReport] = useState(false)

  // Get unique values from trades
  const uniqueSystems = [...new Set(trades.map((t) => t.system).filter(Boolean))]
  const uniqueTimeframes = [...new Set(trades.map((t) => t.timeframe).filter(Boolean))]
  const uniqueSessions = [...new Set(trades.map((t) => t.session).filter(Boolean))]
  const uniqueDays = [...new Set(trades.map((t) => t.dayOfWeek).filter(Boolean))].sort()
  const uniqueGrades = [...new Set(trades.map((t) => t.grade).filter(Boolean))].sort()
  const allTags = [...new Set(trades.flatMap((t) => t.tags))].sort()

  const handleApply = () => {
    onApplyFilters(filters)
    if (showReport) {
      generateReport()
    }
  }

  const handleClear = () => {
    setFilters({})
  }

  const toggleMultiSelect = (field: keyof FilterOptions, value: string) => {
    const currentValues = (filters[field] as string[]) || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]

    setFilters((prev) => ({
      ...prev,
      [field]: newValues.length > 0 ? newValues : undefined,
    }))
  }

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag) ? currentTags.filter((t) => t !== tag) : [...currentTags, tag]

    setFilters((prev) => ({ ...prev, tags: newTags.length > 0 ? newTags : undefined }))
  }

  const generateReport = () => {
    // This will be handled by the parent component
    console.log("Generating report with filters:", filters)
  }

  // Preview filtered results
  const previewTrades = trades.filter((trade) => {
    const matchesSystems = !filters.systems || filters.systems.length === 0 || filters.systems.includes(trade.system)
    const matchesTimeframes =
      !filters.timeframes || filters.timeframes.length === 0 || filters.timeframes.includes(trade.timeframe)
    const matchesOutcome = !filters.outcome || trade.outcome === filters.outcome
    const matchesGrades = !filters.grades || filters.grades.length === 0 || filters.grades.includes(trade.grade)
    const matchesSessions =
      !filters.sessions || filters.sessions.length === 0 || filters.sessions.includes(trade.session)
    const matchesDays =
      !filters.daysOfWeek || filters.daysOfWeek.length === 0 || filters.daysOfWeek.includes(trade.dayOfWeek)
    const matchesDateFrom = !filters.dateFrom || trade.date >= filters.dateFrom
    const matchesDateTo = !filters.dateTo || trade.date <= filters.dateTo
    const matchesRiskDeviation =
      !filters.riskDeviation ||
      (filters.riskDeviation === "over" && trade.isOverRisked) ||
      (filters.riskDeviation === "under" && trade.isUnderRisked) ||
      (filters.riskDeviation === "good" && !trade.isOverRisked && !trade.isUnderRisked)
    const matchesTags =
      !filters.tags || filters.tags.length === 0 || filters.tags.some((tag) => trade.tags.includes(tag))
    const matchesMinR = filters.minR === undefined || (trade.expectedR || 0) >= filters.minR
    const matchesMaxR = filters.maxR === undefined || (trade.expectedR || 0) <= filters.maxR
    const matchesMinPnL = filters.minPnL === undefined || trade.pnl >= filters.minPnL
    const matchesMaxPnL = filters.maxPnL === undefined || trade.pnl <= filters.maxPnL

    return (
      matchesSystems &&
      matchesTimeframes &&
      matchesOutcome &&
      matchesGrades &&
      matchesSessions &&
      matchesDays &&
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

  // Calculate preview stats
  const previewStats = {
    totalTrades: previewTrades.length,
    winRate:
      previewTrades.length > 0
        ? (previewTrades.filter((t) => (t.expectedR || 0) > 0).length / previewTrades.length) * 100
        : 0,
    avgExpectedR:
      previewTrades.length > 0
        ? previewTrades.reduce((sum, t) => sum + (t.expectedR || 0), 0) / previewTrades.length
        : 0,
    totalPnL: previewTrades.reduce((sum, t) => sum + t.pnl, 0),
    expectedValue:
      previewTrades.length > 0
        ? previewTrades.reduce((sum, t) => sum + (t.expectedR || 0), 0) / previewTrades.length
        : 0,
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Filter & Report Generator
              </CardTitle>
              <CardDescription>Filter trades and generate detailed reports</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value || undefined }))}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value || undefined }))}
              />
            </div>
          </div>

          {/* Multi-Select Trading Systems */}
          <div>
            <Label>Trading Systems (Select multiple)</Label>
            <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
              {uniqueSystems.map((system) => (
                <Badge
                  key={system}
                  variant={filters.systems?.includes(system) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleMultiSelect("systems", system)}
                >
                  {system}
                </Badge>
              ))}
            </div>
            {filters.systems && filters.systems.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">Selected: {filters.systems.join(", ")}</p>
            )}
          </div>

          {/* Multi-Select Timeframes */}
          <div>
            <Label>Timeframes (Select multiple)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {uniqueTimeframes.map((tf) => (
                <Badge
                  key={tf}
                  variant={filters.timeframes?.includes(tf) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleMultiSelect("timeframes", tf)}
                >
                  {tf}
                </Badge>
              ))}
            </div>
            {filters.timeframes && filters.timeframes.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">Selected: {filters.timeframes.join(", ")}</p>
            )}
          </div>

          {/* Multi-Select Grades */}
          <div>
            <Label>Grades (Select multiple)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {uniqueGrades.map((grade) => (
                <Badge
                  key={grade}
                  variant={filters.grades?.includes(grade) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleMultiSelect("grades", grade)}
                >
                  {grade}
                </Badge>
              ))}
            </div>
            {filters.grades && filters.grades.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">Selected: {filters.grades.join(", ")}</p>
            )}
          </div>

          {/* Multi-Select Sessions */}
          <div>
            <Label>Trading Sessions (Select multiple)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {uniqueSessions.map((session) => (
                <Badge
                  key={session}
                  variant={filters.sessions?.includes(session) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleMultiSelect("sessions", session)}
                >
                  {session}
                </Badge>
              ))}
            </div>
            {filters.sessions && filters.sessions.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">Selected: {filters.sessions.join(", ")}</p>
            )}
          </div>

          {/* Multi-Select Days of Week */}
          <div>
            <Label>Days of Week (Select multiple)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {uniqueDays.map((day) => (
                <Badge
                  key={day}
                  variant={filters.daysOfWeek?.includes(day) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleMultiSelect("daysOfWeek", day)}
                >
                  {day}
                </Badge>
              ))}
            </div>
            {filters.daysOfWeek && filters.daysOfWeek.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">Selected: {filters.daysOfWeek.join(", ")}</p>
            )}
          </div>

          {/* Outcome Filter */}
          <div>
            <Label>Outcome</Label>
            <div className="flex gap-2 mt-2">
              {["Win", "Loss", "Breakeven"].map((outcome) => (
                <Badge
                  key={outcome}
                  variant={filters.outcome === outcome ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      outcome: prev.outcome === outcome ? undefined : (outcome as any),
                    }))
                  }
                >
                  {outcome}
                </Badge>
              ))}
            </div>
          </div>

          {/* Risk Management Filter */}
          <div>
            <Label>Risk Management</Label>
            <div className="flex gap-2 mt-2">
              {[
                { key: "good", label: "Good Risk" },
                { key: "over", label: "Over-Risked" },
                { key: "under", label: "Under-Risked" },
              ].map(({ key, label }) => (
                <Badge
                  key={key}
                  variant={filters.riskDeviation === key ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      riskDeviation: prev.riskDeviation === key ? undefined : (key as any),
                    }))
                  }
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Expected R Range */}
          <div>
            <Label>Expected R Range</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Min Expected R"
                  value={filters.minR || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, minR: e.target.value ? Number(e.target.value) : undefined }))
                  }
                />
              </div>
              <div>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Max Expected R"
                  value={filters.maxR || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, maxR: e.target.value ? Number(e.target.value) : undefined }))
                  }
                />
              </div>
            </div>
          </div>

          {/* P&L Range */}
          <div>
            <Label>P&L Range ($)</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Min P&L"
                  value={filters.minPnL || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, minPnL: e.target.value ? Number(e.target.value) : undefined }))
                  }
                />
              </div>
              <div>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Max P&L"
                  value={filters.maxPnL || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, maxPnL: e.target.value ? Number(e.target.value) : undefined }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <Label>Tags (Select multiple)</Label>
            <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={filters.tags?.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {filters.tags && filters.tags.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">Selected: {filters.tags.join(", ")}</p>
            )}
          </div>

          {/* Preview Results */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Filter Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{previewStats.totalTrades}</div>
                  <div className="text-sm text-muted-foreground">Trades</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{previewStats.winRate.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </div>
                <div>
                  <div
                    className={`text-2xl font-bold ${previewStats.expectedValue >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {previewStats.expectedValue.toFixed(3)}R
                  </div>
                  <div className="text-sm text-muted-foreground">Expected Value</div>
                </div>
                <div>
                  <div
                    className={`text-2xl font-bold ${previewStats.avgExpectedR >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {previewStats.avgExpectedR.toFixed(2)}R
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Expected R</div>
                </div>
                <div>
                  <div
                    className={`text-2xl font-bold ${previewStats.totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    ${previewStats.totalPnL.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total P&L</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Report Option */}
          <div className="flex items-center space-x-2">
            <Checkbox id="generateReport" checked={showReport} onCheckedChange={setShowReport} />
            <Label htmlFor="generateReport">Generate detailed report after applying filters</Label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button onClick={handleApply} className="flex-1">
              Apply Filters ({previewStats.totalTrades} trades)
            </Button>
            <Button onClick={handleClear} variant="outline">
              Clear All
            </Button>
            <Button variant="outline">
              Clear All
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
