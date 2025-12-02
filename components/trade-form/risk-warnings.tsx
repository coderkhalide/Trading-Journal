"use client"

import { AlertTriangle, TrendingDown } from "lucide-react"

interface RiskWarningsProps {
  isOverRisked: boolean
  isUnderRisked: boolean
  riskDeviation: number
}

export function RiskWarnings({ isOverRisked, isUnderRisked, riskDeviation }: RiskWarningsProps) {
  if (!isOverRisked && !isUnderRisked) return null

  return (
    <div className="space-y-3">
      {isOverRisked && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Over-Risked Trade</span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            You risked {riskDeviation.toFixed(1)}% more than planned. Consider reducing position size or
            adjusting stop loss.
          </p>
        </div>
      )}

      {isUnderRisked && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 text-orange-700">
            <TrendingDown className="h-4 w-4" />
            <span className="font-medium">Under-Risked Trade</span>
          </div>
          <p className="text-sm text-orange-600 mt-1">
            You risked {Math.abs(riskDeviation).toFixed(1)}% less than planned. You might be missing profit
            opportunities.
          </p>
        </div>
      )}
    </div>
  )
}
