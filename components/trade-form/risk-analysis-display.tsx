"use client"

import { Label } from "@/components/ui/label"

interface RiskAnalysisDisplayProps {
  idealRiskAmount: number
  expectedR: number
  rMultiple: number
}

export function RiskAnalysisDisplay({ idealRiskAmount, expectedR, rMultiple }: RiskAnalysisDisplayProps) {
  if (idealRiskAmount <= 0) return null

  const riskEfficiency = idealRiskAmount > 0 && rMultiple !== 0 
    ? ((expectedR / rMultiple) * 100) 
    : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
      <div className="text-center">
        <Label className="text-sm text-muted-foreground">Expected R</Label>
        <div className={`text-xl font-bold ${expectedR >= 0 ? "text-green-600" : "text-red-600"}`}>
          {expectedR.toFixed(2)}R
        </div>
        <p className="text-xs text-muted-foreground">Based on ideal risk</p>
      </div>

      <div className="text-center">
        <Label className="text-sm text-muted-foreground">Actual R</Label>
        <div className={`text-xl font-bold ${rMultiple >= 0 ? "text-green-600" : "text-red-600"}`}>
          {rMultiple.toFixed(2)}R
        </div>
        <p className="text-xs text-muted-foreground">Based on actual risk</p>
      </div>

      <div className="text-center">
        <Label className="text-sm text-muted-foreground">Risk Efficiency</Label>
        <div className="text-xl font-bold text-blue-600">
          {riskEfficiency.toFixed(0)}%
        </div>
        <p className="text-xs text-muted-foreground">Expected vs Actual</p>
      </div>
    </div>
  )
}
