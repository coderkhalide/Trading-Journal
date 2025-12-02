import type { Trade, Settings } from '@/types/trade'

export function recalculateTradeMetrics(trade: Trade, settings: Settings): Trade {
  const { entryPrice, exitPrice, stopLoss, positionSize, tradeType, asset, idealRiskAmount } = trade

  if (!entryPrice || !exitPrice || !stopLoss || !positionSize || !idealRiskAmount) {
    return trade
  }

  // Calculate basic risk metrics
  const riskPerUnit = Math.abs(entryPrice - stopLoss)
  const riskAmount = riskPerUnit * positionSize

  const assetKey = asset.replace(/USD|USDT|\/.*/, "").toUpperCase()
  const feeRate = settings.assetFees[assetKey] || 0
  const fee = positionSize * feeRate

  // Calculate actual risk including fees
  const actualRiskAmount = riskAmount + fee

  // Calculate P&L
  const profitAmount = tradeType === "Long" ? exitPrice - entryPrice : entryPrice - exitPrice
  const pnl = profitAmount * positionSize - fee

  // Calculate R-multiples
  const rMultiple = riskAmount > 0 ? (profitAmount * positionSize) / riskAmount : 0
  const expectedR = idealRiskAmount > 0 ? (pnl) / idealRiskAmount : 0

  // Calculate risk deviation
  const riskDeviation = idealRiskAmount > 0 ? ((actualRiskAmount - idealRiskAmount) / idealRiskAmount) * 100 : 0

  // Determine risk status
  const riskTolerance = settings.riskDeviationTolerance || 10
  const isOverRisked = Math.abs(riskDeviation) > riskTolerance && riskDeviation > 0
  const isUnderRisked = Math.abs(riskDeviation) > riskTolerance && riskDeviation < 0

  const riskPercent = settings.accountBalance > 0 ? (actualRiskAmount / settings.accountBalance) * 100 : 0

  let outcome: "Win" | "Loss" | "Breakeven" = "Breakeven"
  if (rMultiple > 0.1) outcome = "Win"
  else if (rMultiple < -0.1) outcome = "Loss"

  return {
    ...trade,
    rMultiple: Number(rMultiple.toFixed(2)),
    expectedR: Number(expectedR.toFixed(2)),
    pnl: Number(pnl.toFixed(2)),
    fee: Number(fee.toFixed(2)),
    riskAmount: Number(riskAmount.toFixed(2)),
    actualRiskAmount: Number(actualRiskAmount.toFixed(2)),
    riskPercent: Number(riskPercent.toFixed(2)),
    riskDeviation: Number(riskDeviation.toFixed(2)),
    isOverRisked,
    isUnderRisked,
    outcome,
  }
}
