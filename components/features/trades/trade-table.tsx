"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { SortButton } from "@/components/shared/sort-button"
import { TradeActions } from "./trade-actions"
import type { Trade } from "@/types/trade"
import type { SortField, SortDirection } from "@/hooks/use-trade-sorting"

interface TradeTableProps {
  trades: Trade[]
  selectedTrades: string[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onSelectTrade: (tradeId: string) => void
  onSelectAllOnPage: () => void
  onEditTrade: (trade: Trade) => void
  onViewTrade: (trade: Trade) => void
  onDeleteTrade: (id: string) => void
}

export function TradeTable({
  trades,
  selectedTrades,
  sortField,
  sortDirection,
  onSort,
  onSelectTrade,
  onSelectAllOnPage,
  onEditTrade,
  onViewTrade,
  onDeleteTrade,
}: TradeTableProps) {
  const allSelected = trades.length > 0 && trades.every((trade) => selectedTrades.includes(trade.id))
  const someSelected = trades.some((trade) => selectedTrades.includes(trade.id))

  const getOutcomeBadgeVariant = (outcome: string) => {
    switch (outcome) {
      case "Win":
        return "default"
      case "Loss":
        return "destructive"
      case "Breakeven":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRiskBadgeVariant = (trade: Trade) => {
    if (trade.isOverRisked) return "destructive"
    if (trade.isUnderRisked) return "secondary"
    return "outline"
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAllOnPage}
                ref={(checkbox) => {
                  if (checkbox) {
                    (checkbox as any).indeterminate = someSelected && !allSelected
                  }
                }}
              />
            </TableHead>
            <TableHead>
              <SortButton field="date" currentSortField={sortField} sortDirection={sortDirection} onSort={onSort}>
                Date/Time
              </SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="asset" currentSortField={sortField} sortDirection={sortDirection} onSort={onSort}>
                Asset
              </SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="system" currentSortField={sortField} sortDirection={sortDirection} onSort={onSort}>
                System
              </SortButton>
            </TableHead>
            {/* <TableHead>
              <SortButton field="rMultiple" currentSortField={sortField} sortDirection={sortDirection} onSort={onSort}>
                R-Multiple
              </SortButton>
            </TableHead> */}
            <TableHead>
              <SortButton field="expectedR" currentSortField={sortField} sortDirection={sortDirection} onSort={onSort}>
                Expected R
              </SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="pnl" currentSortField={sortField} sortDirection={sortDirection} onSort={onSort}>
                P&L
              </SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="riskPercent" currentSortField={sortField} sortDirection={sortDirection} onSort={onSort}>
                Risk %
              </SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="grade" currentSortField={sortField} sortDirection={sortDirection} onSort={onSort}>
                Grade
              </SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="outcome" currentSortField={sortField} sortDirection={sortDirection} onSort={onSort}>
                Outcome
              </SortButton>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell>
                <Checkbox
                  checked={selectedTrades.includes(trade.id)}
                  onCheckedChange={() => onSelectTrade(trade.id)}
                />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{trade.date}</div>
                  <div className="text-sm text-muted-foreground">
                    <span>{trade.time}</span>
                    {trade.duration && (
                      <span className="ml-2">
                        <span className="text-xs text-muted-foreground">{trade.duration}</span>
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-medium">{trade.asset}</TableCell>
              <TableCell>{trade.system}</TableCell>
              {/* <TableCell>
                <Badge variant={trade.rMultiple >= 0 ? "default" : "destructive"}>
                  {trade.rMultiple.toFixed(2)}R
                </Badge>
              </TableCell> */}
              <TableCell>
                {trade.expectedR ? (
                  <Badge variant={trade.expectedR >= 0 ? "default" : "destructive"}>
                    {trade.expectedR.toFixed(2)}R
                  </Badge>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <span className={trade.pnl >= 0 ? "text-green-600" : "text-red-600"}>
                  <div className="font-medium">${trade.pnl}</div>
                  <div className="text-xs text-muted-foreground">
                    Gross: ${(trade.pnl + (trade.fee || 0)).toFixed(2)}
                  </div>
                </span>
              </TableCell>
              <TableCell>
                <div className="space-x-2 flex">
                  <div>{trade.riskPercent.toFixed(2)}%</div>
                  <Badge variant={getRiskBadgeVariant(trade)} className="text-xs">
                    {trade.isOverRisked ? "Over" : trade.isUnderRisked ? "Under" : "Good"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                {trade.grade && <Badge variant="outline"
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
                >{trade.grade}</Badge>}
              </TableCell>
              <TableCell>
                <Badge variant={getOutcomeBadgeVariant(trade.outcome)}>{trade.outcome}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <TradeActions
                  trade={trade}
                  onEdit={() => onEditTrade(trade)}
                  onView={() => onViewTrade(trade)}
                  onDelete={() => onDeleteTrade(trade.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
