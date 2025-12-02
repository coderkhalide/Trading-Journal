"use client"

import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface CalculationResultsProps {
  results: {
    rMultiple: number
    pnl: number
    riskAmount: number
    riskPercent: number
    fee: number
    outcome: "Win" | "Loss" | "Breakeven"
  }
}

export function CalculationResults({ results }: CalculationResultsProps) {
  if (results.rMultiple === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Calculated Results</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted rounded-lg">
        <div className="text-center">
          <Label className="text-sm text-muted-foreground">R-Multiple</Label>
          <div className={`text-xl font-bold ${results.rMultiple >= 0 ? "text-green-600" : "text-red-600"}`}>
            {results.rMultiple}R
          </div>
        </div>
        <div className="text-center">
          <Label className="text-sm text-muted-foreground">P&L</Label>
          <div className={`text-xl font-bold ${results.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
            ${results.pnl}
          </div>
        </div>
        <div className="text-center">
          <Label className="text-sm text-muted-foreground">Risk Amount</Label>
          <div className="text-xl font-bold text-orange-600">${results.riskAmount}</div>
        </div>
        <div className="text-center">
          <Label className="text-sm text-muted-foreground">Risk %</Label>
          <div className="text-xl font-bold text-orange-600">{results.riskPercent}%</div>
        </div>
        <div className="text-center">
          <Label className="text-sm text-muted-foreground">Fee</Label>
          <div className="text-xl font-bold text-red-600">${results.fee}</div>
        </div>
      </div>
      <div className="text-center">
        <Badge
          variant={results.outcome === "Win" ? "default" : results.outcome === "Loss" ? "destructive" : "secondary"}
          className="text-lg px-4 py-2"
        >
          {results.outcome}
        </Badge>
      </div>
    </div>
  )
}
