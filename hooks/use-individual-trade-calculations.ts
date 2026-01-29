import { useMemo } from "react"
import { calculateGradeAdjustedRisk } from "@/lib/utils"

interface TradeFormData {
  asset: string
  tradeType: "Long" | "Short"
  entryPrice: number
  exitPrice: number
  stopLoss: number
  positionSize: number
  idealRiskAmount: number
  grade?: string
  date: string
  time: string
}

interface TradeCalculationSettings {
  assetFees: Record<string, number>
  accountBalance: number
  riskDeviationTolerance: number
}

export function useIndividualTradeCalculations(
  formData: TradeFormData,
  settings: TradeCalculationSettings
) {
  return useMemo(() => {
    const fee = settings.assetFees[formData.asset] || 0
    
    // Use the ideal risk amount from the form as-is (user may have already adjusted for grade)
    const idealRisk = formData.idealRiskAmount
    
    // Calculate risk amount based on stop loss distance
    const isLong = formData.tradeType === "Long"
    const stopLossDistance = isLong 
      ? Math.abs(formData.entryPrice - formData.stopLoss)
      : Math.abs(formData.stopLoss - formData.entryPrice)
    
    const riskAmount = stopLossDistance * formData.positionSize
    const actualRiskAmount = riskAmount + fee
    
    // Calculate P&L
    const priceChange = isLong 
      ? formData.exitPrice - formData.entryPrice
      : formData.entryPrice - formData.exitPrice
    const pnl = (priceChange * formData.positionSize) - fee
    
    // Calculate R-Multiple based on actual risk
    const rMultiple = riskAmount > 0 ? pnl / riskAmount : 0
    
    // Calculate Expected R based on ideal risk
    const expectedR = idealRisk > 0 ? pnl / idealRisk : 0
    
    // Calculate risk as percentage of account
    const riskPercent = (actualRiskAmount / settings.accountBalance) * 100
    
    // Calculate risk deviation based on ideal risk
    const riskDeviation = idealRisk > 0 
      ? ((actualRiskAmount - idealRisk) / idealRisk) * 100 
      : 0
    
    // Risk flags based on adjusted ideal risk
    const isOverRisked = Math.abs(riskDeviation) > settings.riskDeviationTolerance && riskDeviation > 0
    const isUnderRisked = Math.abs(riskDeviation) > settings.riskDeviationTolerance && riskDeviation < 0
    
    // Determine outcome
    const outcome = pnl > 0.01 ? "Win" : pnl < -0.01 ? "Loss" : "Breakeven"
    
    // Calculate duration (placeholder - would need more sophisticated calculation)
    const duration = "1h 30m" // This would be calculated based on entry/exit times
    
    return {
      rMultiple,
      pnl,
      fee,
      riskAmount,
      actualRiskAmount,
      riskPercent,
      riskDeviation,
      expectedR,
      isOverRisked,
      isUnderRisked,
      duration,
      outcome: outcome as "Win" | "Loss" | "Breakeven",
      idealRisk, // Include the ideal risk amount used in calculations
      session: "", // Will be calculated separately
      dayOfWeek: "", // Will be calculated separately
    }
  }, [formData, settings])
}
