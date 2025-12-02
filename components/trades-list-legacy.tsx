"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Calendar,
  Edit3,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
} from "lucide-react"
import type { Trade, FilterOptions } from "@/types/trade"
import { TradeEntryForm } from "./trade-entry-form"
import { BulkUpdateDialog } from "./bulk-update-dialog"
import { AdvancedFilterDialog } from "./advanced-filter-dialog"
import ReactMarkdown from "react-markdown"

interface TradesListProps {
  trades: Trade[]
  onDeleteTrade: (id: string) => void
  onUpdateTrade: (trade: Trade) => void
  onBulkUpdate: (tradeIds: string[], updates: Partial<Trade>) => void
  settings: any
}

type SortField = "date" | "asset" | "system" | "rMultiple" | "expectedR" | "pnl" | "riskPercent" | "grade" | "outcome"
type SortDirection = "asc" | "desc"

const TRADES_PER_PAGE_OPTIONS = [10, 20, 50, 100]

export function TradesList({ trades, onDeleteTrade, onUpdateTrade, onBulkUpdate, settings }: TradesListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [tradesPerPage, setTradesPerPage] = useState(20)
  const [filters, setFilters] = useState<FilterOptions>({
    system: "",
    timeframe: "",
    outcome: "",
    session: "",
    dayOfWeek: "",
  })
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({})
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [viewingTrade, setViewingTrade] = useState<Trade | null>(null)
  const [selectedTrades, setSelectedTrades] = useState<string[]>([])
  const [showBulkUpdate, setShowBulkUpdate] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Get unique values for filter dropdowns
  const uniqueSystems = [...new Set(trades.map((t) => t.system).filter(Boolean))]
  const uniqueTimeframes = [...new Set(trades.map((t) => t.timeframe).filter(Boolean))]
  const uniqueSessions = [...new Set(trades.map((t) => t.session).filter(Boolean))]
  const uniqueDays = [...new Set(trades.map((t) => t.dayOfWeek).filter(Boolean))]

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  // Combine basic and advanced filters
  const allFilters = { ...filters, ...advancedFilters }

  // Filter trades based on search and filters
  const filteredTrades = trades.filter((trade) => {
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

  // Sort trades
  const sortedTrades = [...filteredTrades].sort((a, b) => {
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

  // Pagination
  const totalPages = Math.ceil(sortedTrades.length / tradesPerPage)
  const startIndex = (currentPage - 1) * tradesPerPage
  const endIndex = startIndex + tradesPerPage
  const paginatedTrades = sortedTrades.slice(startIndex, endIndex)

  // Reset to page 1 when changing trades per page or filters
  const handleTradesPerPageChange = (newPerPage: string) => {
    setTradesPerPage(Number(newPerPage))
    setCurrentPage(1)
  }

  const handleSelectTrade = (tradeId: string) => {
    setSelectedTrades((prev) => (prev.includes(tradeId) ? prev.filter((id) => id !== tradeId) : [...prev, tradeId]))
  }

  const handleSelectAllOnPage = () => {
    const currentPageTradeIds = paginatedTrades.map((trade) => trade.id)
    const allCurrentPageSelected = currentPageTradeIds.every((id) => selectedTrades.includes(id))

    if (allCurrentPageSelected) {
      setSelectedTrades((prev) => prev.filter((id) => !currentPageTradeIds.includes(id)))
    } else {
      setSelectedTrades((prev) => [...new Set([...prev, ...currentPageTradeIds])])
    }
  }

  const handleBulkUpdate = (updates: Partial<Trade>) => {
    onBulkUpdate(selectedTrades, updates)
    setSelectedTrades([])
    setShowBulkUpdate(false)
  }

  const handleAdvancedFilter = (newFilters: FilterOptions) => {
    setAdvancedFilters(newFilters)
    setCurrentPage(1)
    setShowAdvancedFilter(false)
  }

  const clearAllFilters = () => {
    setFilters({
      system: "",
      timeframe: "",
      outcome: "",
      session: "",
      dayOfWeek: "",
    })
    setAdvancedFilters({})
    setSearchTerm("")
    setCurrentPage(1)
  }

  const renderMarkdownPreview = (markdown: string) => {
    if (!markdown) return <span className="text-muted-foreground italic">No notes</span>

    // Simple markdown to HTML conversion for preview
    const html = markdown
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, "<br />")

    return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
  }

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Time",
      "Asset",
      "Type",
      "System",
      "Timeframe",
      "Entry",
      "Exit",
      "Stop Loss",
      "Position Size",
      "Risk %",
      "R-Multiple",
      "Expected R",
      "P&L",
      "Fee",
      "Risk Amount",
      "Ideal Risk",
      "Risk Deviation",
      "Outcome",
      "Grade",
      "Session",
      "Day of Week",
      "Notes",
      "Tags",
    ]

    const csvContent = [
      headers.join(","),
      ...sortedTrades.map((trade) =>
        [
          trade.date,
          trade.time,
          trade.asset,
          trade.tradeType,
          trade.system,
          trade.timeframe,
          trade.entryPrice,
          trade.exitPrice,
          trade.stopLoss,
          trade.positionSize,
          trade.riskPercent,
          trade.rMultiple,
          trade.expectedR || 0,
          trade.pnl,
          trade.fee,
          trade.riskAmount,
          trade.idealRiskAmount || 0,
          trade.riskDeviation || 0,
          trade.outcome,
          trade.grade,
          trade.session,
          trade.dayOfWeek,
          `"${trade.notes.replace(/"/g, '""')}"`,
          `"${trade.tags.join(", ")}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `trading-journal-filtered-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Check if all trades on current page are selected
  const currentPageTradeIds = paginatedTrades.map((trade) => trade.id)
  const allCurrentPageSelected =
    currentPageTradeIds.length > 0 && currentPageTradeIds.every((id) => selectedTrades.includes(id))
  const someCurrentPageSelected = currentPageTradeIds.some((id) => selectedTrades.includes(id))

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    Object.values(allFilters).some(
      (value) => value !== "" && value !== undefined && (Array.isArray(value) ? value.length > 0 : true),
    )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trade History</CardTitle>
            <CardDescription>
              {sortedTrades.length} of {trades.length} trades
              {selectedTrades.length > 0 && (
                <span className="ml-2 text-blue-600">• {selectedTrades.length} selected</span>
              )}
              {hasActiveFilters && <span className="ml-2 text-orange-600">• Filtered</span>}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {selectedTrades.length > 0 && (
              <Button onClick={() => setShowBulkUpdate(true)} variant="outline" className="gap-2">
                <Edit3 className="h-4 w-4" />
                Bulk Update ({selectedTrades.length})
              </Button>
            )}
            <Button onClick={exportToCSV} variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Search and Basic Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trades, systems, assets, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setShowAdvancedFilter(true)} variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filter
            </Button>

            {hasActiveFilters && (
              <Button onClick={clearAllFilters} variant="outline" size="sm">
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.system || "all"}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, system: value === "all" ? "" : value }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="System" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Systems</SelectItem>
              {uniqueSystems.map((system) => (
                <SelectItem key={system} value={system}>
                  {system}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.outcome || "all"}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, outcome: value === "all" ? "" : value }))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Win">Wins</SelectItem>
              <SelectItem value="Loss">Losses</SelectItem>
              <SelectItem value="Breakeven">Breakeven</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.session || "all"}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, session: value === "all" ? "" : value }))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Session" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              {uniqueSessions.map((session) => (
                <SelectItem key={session} value={session}>
                  {session}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trades per page selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select value={tradesPerPage.toString()} onValueChange={handleTradesPerPageChange}>
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRADES_PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">trades per page</span>
          </div>

          <div className="text-sm text-muted-foreground">
            Sorted by {sortField} ({sortDirection === "asc" ? "ascending" : "descending"})
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={allCurrentPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someCurrentPageSelected && !allCurrentPageSelected
                    }}
                    onCheckedChange={handleSelectAllOnPage}
                  />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                  <div className="flex items-center gap-2">Date {getSortIcon("date")}</div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("asset")}>
                  <div className="flex items-center gap-2">Asset {getSortIcon("asset")}</div>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("system")}>
                  <div className="flex items-center gap-2">System {getSortIcon("system")}</div>
                </TableHead>
                <TableHead>TF</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Day</TableHead>
                <TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">Exit</TableHead>
                <TableHead className="text-right">Stop</TableHead>
                {/* <TableHead className="text-right cursor-pointer" onClick={() => handleSort("rMultiple")}>
                  <div className="flex items-center gap-2 justify-end">R {getSortIcon("rMultiple")}</div>
                </TableHead> */}
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("expectedR")}>
                  <div className="flex items-center gap-2 justify-end">Expected R {getSortIcon("expectedR")}</div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("pnl")}>
                  <div className="flex items-center gap-2 justify-end">P&L {getSortIcon("pnl")}</div>
                </TableHead>
                <TableHead>Risk Status</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("outcome")}>
                  <div className="flex items-center gap-2">Outcome {getSortIcon("outcome")}</div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("grade")}>
                  <div className="flex items-center gap-2">Grade {getSortIcon("grade")}</div>
                </TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={18} className="text-center py-8 text-muted-foreground">
                    {hasActiveFilters
                      ? "No trades match your filters."
                      : "No trades found. Add your first trade to get started!"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTrades.map((trade) => (
                  <TableRow key={trade.id} className={selectedTrades.includes(trade.id) ? "bg-muted/50" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTrades.includes(trade.id)}
                        onCheckedChange={() => handleSelectTrade(trade.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {trade.date}
                      </div>
                    </TableCell>
                    <TableCell>{trade.asset}</TableCell>
                    <TableCell>
                      <Badge variant={trade.tradeType === "Long" ? "default" : "secondary"}>{trade.tradeType}</Badge>
                    </TableCell>
                    <TableCell>{trade.system}</TableCell>
                    <TableCell>{trade.timeframe}</TableCell>
                    <TableCell>{trade.session}</TableCell>
                    <TableCell>{trade.dayOfWeek}</TableCell>
                    <TableCell className="text-right">{trade.entryPrice}</TableCell>
                    <TableCell className="text-right">{trade.exitPrice}</TableCell>
                    <TableCell className="text-right">{trade.stopLoss}</TableCell>
                    {/* <TableCell
                      className={`text-right font-medium ${trade.rMultiple >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {trade.rMultiple}R
                    </TableCell> */}
                    <TableCell
                      className={`text-right font-medium ${(trade.expectedR || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {(trade.expectedR || 0).toFixed(2)}R
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${trade.pnl >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      <div className="text-right">
                        <div className="font-medium">${trade.pnl}</div>
                        <div className="text-xs text-muted-foreground">
                          Gross: ${(trade.pnl + (trade.fee || 0)).toFixed(2)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {trade.isOverRisked ? (
                        <Badge variant="destructive" className="text-xs">
                          Over
                        </Badge>
                      ) : trade.isUnderRisked ? (
                        <Badge variant="secondary" className="text-xs">
                          Under
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs">
                          Good
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          trade.outcome === "Win" ? "default" : trade.outcome === "Loss" ? "destructive" : "secondary"
                        }
                      >
                        {trade.outcome}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          trade.grade.startsWith("A")
                            ? "border-green-500 text-green-700"
                            : trade.grade.startsWith("B")
                              ? "border-blue-500 text-blue-700"
                              : trade.grade.startsWith("C")
                                ? "border-yellow-500 text-yellow-700"
                                : trade.grade.startsWith("D")
                                  ? "border-orange-500 text-orange-700"
                                  : "border-red-500 text-red-700"
                        }
                      >
                        {trade.grade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {trade.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {trade.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{trade.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingTrade(trade)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingTrade(trade)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDeleteTrade(trade.id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedTrades.length)} of {sortedTrades.length} trades
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Advanced Filter Dialog */}
      {showAdvancedFilter && (
        <AdvancedFilterDialog
          trades={trades}
          currentFilters={advancedFilters}
          onApplyFilters={handleAdvancedFilter}
          onCancel={() => setShowAdvancedFilter(false)}
        />
      )}

      {/* Edit Trade Dialog */}
      {editingTrade && (
        <TradeEntryForm
          initialData={editingTrade}
          settings={settings}
          onSubmit={(updatedTrade) => {
            onUpdateTrade({ ...updatedTrade, id: editingTrade.id })
            setEditingTrade(null)
          }}
          onCancel={() => setEditingTrade(null)}
        />
      )}

      {/* Bulk Update Dialog */}
      {showBulkUpdate && (
        <BulkUpdateDialog
          selectedTrades={trades.filter((t) => selectedTrades.includes(t.id))}
          onUpdate={handleBulkUpdate}
          onCancel={() => setShowBulkUpdate(false)}
          settings={settings}
        />
      )}

      {/* View Trade Details Dialog */}
      <Dialog open={!!viewingTrade} onOpenChange={() => setViewingTrade(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Trade Details</DialogTitle>
          </DialogHeader>
          {viewingTrade && (
            <div className="space-y-4 overflow-auto max-h-[calc(100vh-350px)]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Basic Info</h4>
                  <p>
                    <strong>Date:</strong> {viewingTrade.date} {viewingTrade.time}
                  </p>
                  <p>
                    <strong>Asset:</strong> {viewingTrade.asset}
                  </p>
                  <p>
                    <strong>Type:</strong> {viewingTrade.tradeType}
                  </p>
                  <p>
                    <strong>System:</strong> {viewingTrade.system}
                  </p>
                  <p>
                    <strong>Timeframe:</strong> {viewingTrade.timeframe}
                  </p>
                  <p>
                    <strong>Session:</strong> {viewingTrade.session}
                  </p>
                  <p>
                    <strong>Day:</strong> {viewingTrade.dayOfWeek}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Performance</h4>
                  {/* <p>
                    <strong>R-Multiple:</strong>{" "}
                    <span className={viewingTrade.rMultiple >= 0 ? "text-green-600" : "text-red-600"}>
                      {viewingTrade.rMultiple}R
                    </span>
                  </p> */}
                  <p>
                    <strong>Expected R:</strong>{" "}
                    <span className={(viewingTrade.expectedR || 0) >= 0 ? "text-green-600" : "text-red-600"}>
                      {(viewingTrade.expectedR || 0).toFixed(2)}R
                    </span>
                  </p>
                  <p>
                    <strong>P&L (Net):</strong>{" "}
                    <span className={viewingTrade.pnl >= 0 ? "text-green-600" : "text-red-600"}>
                      ${viewingTrade.pnl}
                    </span>
                  </p>
                  <p>
                    <strong>P&L (Gross):</strong>{" "}
                    <span className={(viewingTrade.pnl + (viewingTrade.fee || 0)) >= 0 ? "text-green-600" : "text-red-600"}>
                      ${(viewingTrade.pnl + (viewingTrade.fee || 0)).toFixed(2)}
                    </span>
                  </p>
                  <p>
                    <strong>Fee:</strong> ${(viewingTrade.fee || 0).toFixed(2)}
                  </p>
                  <p>
                    <strong>Grade:</strong> {viewingTrade.grade}
                  </p>
                  <p>
                    <strong>Outcome:</strong> {viewingTrade.outcome}
                  </p>
                  <p>
                    <strong>Risk:</strong> {viewingTrade.riskPercent}%
                  </p>
                  <p>
                    <strong>Risk Deviation:</strong>{" "}
                    <span
                      className={
                        viewingTrade.isOverRisked
                          ? "text-red-600"
                          : viewingTrade.isUnderRisked
                            ? "text-orange-600"
                            : "text-green-600"
                      }
                    >
                      {(viewingTrade.riskDeviation || 0).toFixed(1)}%
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Price Levels</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <p>
                    <strong>Entry:</strong> {viewingTrade.entryPrice}
                  </p>
                  <p>
                    <strong>Exit:</strong> {viewingTrade.exitPrice}
                  </p>
                  <p>
                    <strong>Stop Loss:</strong> {viewingTrade.stopLoss}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Risk Management</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <p>
                    <strong>Ideal Risk:</strong> ${viewingTrade.idealRiskAmount || 0}
                  </p>
                  <p>
                    <strong>Actual Risk:</strong> ${viewingTrade.actualRiskAmount || viewingTrade.riskAmount}
                  </p>
                  <p>
                    <strong>Fee:</strong> ${viewingTrade.fee}
                  </p>
                </div>
              </div>

              {viewingTrade.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingTrade.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {viewingTrade.notes && (
                <div className="bg-gray-100 p-5 rounded-lg">
                  <h4 className="font-semibold text-xl text-center">Notes</h4>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        img: ({ src, alt }) => (
                          <img
                            src={src || "/placeholder.svg"}
                            alt={alt}
                            className="max-w-full h-auto rounded-lg border"
                          />
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {viewingTrade.notes}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {viewingTrade.screenshot && (
                <div>
                  <h4 className="font-semibold">Screenshot</h4>
                  <img
                    src={viewingTrade.screenshot || "/placeholder.svg"}
                    alt="Trade screenshot"
                    className="max-w-full h-auto rounded-lg border"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
