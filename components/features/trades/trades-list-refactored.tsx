"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Edit3 } from "lucide-react"
import type { Trade, FilterOptions } from "@/types/trade"
import { TradeEntryForm } from "../../trade-entry-form"
import { BulkUpdateDialogWrapper } from "../../shared/bulk-update-dialog-wrapper"
import { AdvancedFilterDialogWrapper } from "../../shared/advanced-filter-dialog-wrapper"
import { TradeFilters } from "./trade-filters"
import { TradeTable } from "./trade-table"
import { PaginationControls } from "../../shared/pagination-controls"
import { useTradeFilters } from "@/hooks/use-trade-filters"
import { useTradeSorting } from "@/hooks/use-trade-sorting"
import { usePagination } from "@/hooks/use-pagination"
import ReactMarkdown from "react-markdown"
import { Badge } from "@/components/ui/badge"

interface TradesListProps {
  trades: Trade[]
  onDeleteTrade: (id: string) => void
  onUpdateTrade: (trade: Trade) => void
  onBulkUpdate: (tradeIds: string[], updates: Partial<Trade>) => void
  settings: any
}

export function TradesList({ trades, onDeleteTrade, onUpdateTrade, onBulkUpdate, settings }: TradesListProps) {
  // State for dialogs and UI
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [viewingTrade, setViewingTrade] = useState<Trade | null>(null)
  const [selectedTrades, setSelectedTrades] = useState<string[]>([])
  const [showBulkUpdate, setShowBulkUpdate] = useState(false)
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)

  // Custom hooks for filtering, sorting, and pagination
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    advancedFilters,
    setAdvancedFilters,
    filteredTrades,
    filterOptions,
  } = useTradeFilters({ trades })

  const { sortField, sortDirection, sortedTrades, handleSort } = useTradeSorting({
    trades: filteredTrades
  })

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    handleItemsPerPageChange,
    goToPage,
  } = usePagination({
    totalItems: sortedTrades.length
  })

  // Get paginated trades
  const paginatedTrades = sortedTrades.slice(startIndex, endIndex)

  // Selection handlers
  const handleSelectTrade = (tradeId: string) => {
    setSelectedTrades((prev) =>
      prev.includes(tradeId)
        ? prev.filter((id) => id !== tradeId)
        : [...prev, tradeId]
    )
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

  // Dialog handlers
  const handleBulkUpdate = (updates: Partial<Trade>) => {
    onBulkUpdate(selectedTrades, updates)
    setSelectedTrades([])
    setShowBulkUpdate(false)
  }

  const handleAdvancedFiltersChange = (newFilters: FilterOptions) => {
    setAdvancedFilters(newFilters)
    setShowAdvancedFilter(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trading Journal</CardTitle>
            <CardDescription>
              {filteredTrades.length} of {trades.length} trades
            </CardDescription>
          </div>
          {selectedTrades.length > 0 && (
            <Button onClick={() => setShowBulkUpdate(true)} variant="outline">
              <Edit3 className="h-4 w-4 mr-2" />
              Bulk Update ({selectedTrades.length})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <TradeFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFiltersChange={setFilters}
          filterOptions={filterOptions}
          onShowAdvancedFilters={() => setShowAdvancedFilter(true)}
        />

        <TradeTable
          trades={paginatedTrades}
          selectedTrades={selectedTrades}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onSelectTrade={handleSelectTrade}
          onSelectAllOnPage={handleSelectAllOnPage}
          onEditTrade={setEditingTrade}
          onViewTrade={setViewingTrade}
          onDeleteTrade={onDeleteTrade}
        />

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={sortedTrades.length}
          onPageChange={goToPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </CardContent>

      {/* Edit Trade Dialog */}
      {editingTrade && (
        <TradeEntryForm
          initialData={editingTrade}
          onSubmit={(updatedTrade: Omit<Trade, "id">) => {
            onUpdateTrade({ ...updatedTrade, id: editingTrade.id })
            setEditingTrade(null)
          }}
          onCancel={() => setEditingTrade(null)}
          settings={settings}
        />
      )}

      {/* View Trade Dialog */}
      {viewingTrade && (
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
                    <p>
                      <strong>Duration:</strong> {viewingTrade.duration || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Performance</h4>
                    <p>
                    <strong>R-Multiple:</strong>{" "}
                    <span className={viewingTrade.rMultiple >= 0 ? "text-green-600" : "text-red-600"}>
                      {viewingTrade.rMultiple}R
                    </span>
                  </p>
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
      )}

      {/* Bulk Update Dialog */}
      {showBulkUpdate && (
        <BulkUpdateDialogWrapper
          open={showBulkUpdate}
          onOpenChange={setShowBulkUpdate}
          onUpdate={handleBulkUpdate}
          selectedTrades={selectedTrades.map(id => trades.find(t => t.id === id)!).filter(Boolean)}
          settings={settings}
        />
      )}

      {/* Advanced Filter Dialog */}
      {showAdvancedFilter && (
        <AdvancedFilterDialogWrapper
          open={showAdvancedFilter}
          onOpenChange={setShowAdvancedFilter}
          filters={advancedFilters}
          onFiltersChange={handleAdvancedFiltersChange}
          trades={trades}
        />
      )}
    </Card>
  )
}
