"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Calculator } from "lucide-react"
import type { Trade, Settings } from "@/types/trade"
import { BasicInfoSection } from "./trade-form/basic-info-section"
import { TradeDetailsSection } from "./trade-form/trade-details-section"
import { PriceLevelsSection } from "./trade-form/price-levels-section"
import { CalculationResults } from "./trade-form/calculation-results"
import { TagsSection } from "./trade-form/tags-section"
import { RiskManagementSection } from "./trade-form/risk-management-section-legacy"
import { JournalEditor } from "./journal-editor"
import { getTradingSession, getDayOfWeek, DEFAULT_TRADING_SESSIONS } from "@/utils/trading-sessions"
import { BrokerPasteInput } from "./broker-paste-input"
import { getGradeRiskMultiplier, calculateGradeAdjustedRisk } from "@/lib/utils"

interface TradeEntryFormProps {
  onSubmit: (trade: Omit<Trade, "id">) => void
  onCancel: () => void
  initialData?: Trade
  settings: Settings
}

interface ParsedBrokerData {
  asset: string
  tradeType: "Long" | "Short"
  entryPrice: number
  exitPrice: number
  stopLoss: number
  positionSize: number
  pnl: number
  fee: number
  ticket: string
  openTime: string
  closeTime: string
  openDate: string
  closeDate: string
}

const GRADES = ["A++++", "A+++", "A++", "A+", "A", "B", "C", "D", "E", "F"]

export function TradeEntryForm({ onSubmit, onCancel, initialData, settings }: TradeEntryFormProps) {
  const safeTradingSystems = settings?.tradingSystems || [
    "Z-score",
    "EMT",
    "NYC Breakout",
    "London Open",
    "Scalping",
    "Swing Trading",
    "Mean Reversion",
    "Momentum",
    "Breakout",
    "Other",
  ]

  const safeAssetFees = settings?.assetFees || { BTC: 16, ETH: 1.3, Gold: 11 }
  const safeAccountBalance = settings?.accountBalance || 10000
  const riskTolerance = settings?.riskDeviationTolerance || 10
  const defaultIdealRisk = settings?.defaultIdealRisk || 100
  const availableAssets = Object.keys(safeAssetFees)

  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split("T")[0],
    time: initialData?.time || new Date().toTimeString().slice(0, 5),
    endDate: initialData?.endDate || new Date().toISOString().split("T")[0],
    endTime: initialData?.endTime || new Date().toTimeString().slice(0, 5),
    asset: initialData?.asset || "",
    tradeType: initialData?.tradeType || ("Long" as "Long" | "Short"),
    entryPrice: initialData?.entryPrice || 0,
    exitPrice: initialData?.exitPrice || 0,
    stopLoss: initialData?.stopLoss || 0,
    positionSize: initialData?.positionSize || 0,
    system: initialData?.system || "",
    timeframe: initialData?.timeframe || "",
    notes: initialData?.notes || "",
    tags: initialData?.tags || ([] as string[]),
    screenshot: initialData?.screenshot || "",
    grade: initialData?.grade || "",
    ticket: initialData?.ticket || "",
    idealRiskAmount: initialData?.idealRiskAmount || defaultIdealRisk,
  } as Omit<Trade, "id">)

  const [hasClose, setHasClose] = useState(initialData?.endDate ? true : false)

  // Risk mode toggle state
  const [riskModeState, setRiskModeState] = useState<{
    useGradeAdjusted: boolean
    applyFunction: (() => void) | null
  }>({ useGradeAdjusted: false, applyFunction: null })

  const [calculatedValues, setCalculatedValues] = useState({
    rMultiple: initialData?.rMultiple || 0,
    pnl: initialData?.pnl || 0,
    fee: initialData?.fee || 0,
    riskAmount: initialData?.riskAmount || 0,
    actualRiskAmount: initialData?.actualRiskAmount || 0,
    riskPercent: initialData?.riskPercent || 0,
    riskDeviation: initialData?.riskDeviation || 0,
    expectedR: initialData?.expectedR || 0,
    isOverRisked: initialData?.isOverRisked || false,
    isUnderRisked: initialData?.isUnderRisked || false,
    duration: initialData?.duration || "",
    outcome: initialData?.outcome || ("Breakeven" as "Win" | "Loss" | "Breakeven"),
    session: initialData?.session || "",
    dayOfWeek: initialData?.dayOfWeek || "",
  })

  // Reference to store if we should auto-apply risk mode
  const [shouldAutoApplyRisk, setShouldAutoApplyRisk] = useState(false)

  // Auto-update ideal risk when system changes - but don't automatically apply grade adjustments
  useEffect(() => {
    if (formData.system && settings?.systemIdealRisk) {
      const baseSystemRisk = settings.systemIdealRisk[formData.system] || defaultIdealRisk
      
      // Only update if current amount appears to be a default (not user-customized)
      const isLikelyDefault = formData.idealRiskAmount === defaultIdealRisk || 
                              Object.values(settings.systemIdealRisk || {}).includes(formData.idealRiskAmount)
      
      if (isLikelyDefault && baseSystemRisk !== formData.idealRiskAmount) {
        setFormData((prev) => ({ ...prev, idealRiskAmount: baseSystemRisk }))
      }
    }
  }, [formData.system, settings?.systemIdealRisk, defaultIdealRisk])

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCalculatedChange = (field: string, value: any) => {
    setCalculatedValues((prev) => ({ ...prev, [field]: value }))
  }

  const calculateTradeMetrics = () => {
    // Apply the current risk mode selection first
    if (riskModeState.applyFunction) {
      riskModeState.applyFunction()
    }

    const { entryPrice, exitPrice, stopLoss, positionSize, tradeType, asset, time, date, idealRiskAmount } = formData

    if (!entryPrice || !exitPrice || !stopLoss || !positionSize) return

    // Detect trading session and day of week
    const tradingSessions = settings?.tradingSessions || DEFAULT_TRADING_SESSIONS
    const session = getTradingSession(time, tradingSessions)
    const dayOfWeek = getDayOfWeek(date)

    // Calculate basic risk metrics
    const riskPerUnit = Math.abs(entryPrice - stopLoss)
    const riskAmount = riskPerUnit * positionSize

    const assetKey = asset.replace(/USD|USDT|\/.*/, "").toUpperCase()
    const feeRate = safeAssetFees[assetKey] || 0
    const fee = positionSize * feeRate

    // Calculate actual risk including fees
    // This represents the total amount at risk if stop loss is hit
    const actualRiskAmount = riskAmount + fee

    // Calculate P&L
    const profitAmount = tradeType === "Long" ? exitPrice - entryPrice : entryPrice - exitPrice
    const pnl = profitAmount * positionSize - fee // This is NET P&L (after fees)

    // Calculate R-multiples
    const rMultiple = riskAmount > 0 ? (profitAmount * positionSize) / riskAmount : 0
    const expectedR = idealRiskAmount > 0 ? pnl / idealRiskAmount : 0 // Use the form's ideal risk amount

    // Calculate risk deviation based on ideal risk from form
    const riskDeviation = idealRiskAmount > 0 ? ((actualRiskAmount - idealRiskAmount) / idealRiskAmount) * 100 : 0

    // Determine risk status
    const isOverRisked = Math.abs(riskDeviation) > riskTolerance && riskDeviation > 0
    const isUnderRisked = Math.abs(riskDeviation) > riskTolerance && riskDeviation < 0

    const riskPercent = safeAccountBalance > 0 ? (actualRiskAmount / safeAccountBalance) * 100 : 0

    let outcome: "Win" | "Loss" | "Breakeven" = "Breakeven"
    if (rMultiple > 0.1) outcome = "Win"
    else if (rMultiple < -0.1) outcome = "Loss"

    setCalculatedValues({
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
      duration: "",
      outcome,
      session: session.name,
      dayOfWeek,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Auto-detect session and day if not already calculated
    const tradingSessions = settings?.tradingSessions || DEFAULT_TRADING_SESSIONS
    const session = getTradingSession(formData.time, tradingSessions)
    const dayOfWeek = getDayOfWeek(formData.date)

    const trade: Omit<Trade, "id"> = {
      ...formData,
      ...calculatedValues,
      takeProfit: 0, // Remove take profit - not used
      session: calculatedValues.session || session.name,
      dayOfWeek: calculatedValues.dayOfWeek || dayOfWeek,
    }

    onSubmit(trade)
  }

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
    }
  }

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  // Handle risk mode toggle state change from RiskManagementSection
  const handleRiskModeToggleChange = (useGradeAdjusted: boolean, applyFunction: () => void) => {
    setRiskModeState({ useGradeAdjusted, applyFunction })
  }

  const calculateIdealStopLoss = (
    entryPrice: number,
    tradeType: "Long" | "Short",
    positionSize: number,
    idealRiskAmount: number,
    fee: number = 0,
  ): number => {
    if (!entryPrice || !positionSize || !idealRiskAmount) return entryPrice

    // Adjust risk amount to account for fees
    // We want: total loss (price loss + fee) = ideal risk
    // So: price loss = ideal risk - fee
    const adjustedRiskAmount = Math.max(0, idealRiskAmount - fee)
    
    // Calculate the risk per unit needed to achieve adjusted risk
    const riskPerUnit = adjustedRiskAmount / positionSize

    // Calculate ideal stop loss based on trade direction
    if (tradeType === "Long") {
      return entryPrice - riskPerUnit
    } else {
      return entryPrice + riskPerUnit
    }
  }

  const handleBrokerPaste = (data: ParsedBrokerData) => {
    // Calculate ideal stop loss based on ideal risk amount, accounting for fees
    const idealStopLoss = calculateIdealStopLoss(
      data.entryPrice,
      data.tradeType,
      data.positionSize,
      formData.idealRiskAmount,
      data.fee,
    )

    setFormData((prev) => ({
      ...prev,
      asset: data.asset,
      tradeType: data.tradeType,
      entryPrice: data.entryPrice,
      exitPrice: data.exitPrice,
      stopLoss: idealStopLoss, // Use calculated ideal stop loss
      positionSize: data.positionSize,
      ticket: data.ticket,
      date: data.openDate,
      time: data.openTime,
      isClosed: true,
      closeDate: data.closeDate,
      closeTime: data.closeTime,
    }))

    // Auto-calculate with the pasted data
    setTimeout(() => {
      calculateTradeMetrics()
    }, 100)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{initialData ? "Edit Trade" : "Add New Trade"}</CardTitle>
              <CardDescription>Enter your trade details for analysis</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Quick Entry from Broker */}
            {!initialData && <BrokerPasteInput onParsedData={handleBrokerPaste} />}

            <BasicInfoSection formData={formData} onChange={handleFieldChange} availableAssets={availableAssets} />

            <TradeDetailsSection
              formData={formData}
              onChange={handleFieldChange}
              tradingSystems={safeTradingSystems}
              grades={GRADES}
            />

            <PriceLevelsSection formData={formData} onChange={handleFieldChange} />

            <RiskManagementSection
              formData={{ ...formData, ...calculatedValues }}
              onChange={handleCalculatedChange}
              settings={settings}
              onToggleStateChange={handleRiskModeToggleChange}
            />

            <div className="flex justify-center">
              <Button type="button" onClick={calculateTradeMetrics} className="gap-2">
                <Calculator className="h-4 w-4" />
                Calculate Risk, Fee & P&L
              </Button>
            </div>

            <CalculationResults results={calculatedValues} />

            <TagsSection selectedTags={formData.tags} onAddTag={addTag} onRemoveTag={removeTag} />

            <JournalEditor
              value={formData.notes}
              onChange={(value) => handleFieldChange("notes", value)}
              placeholder="Document your trade analysis, emotions, market conditions, and lessons learned..."
            />

            <div>
              <Label htmlFor="screenshot">Screenshot URL</Label>
              <Input
                id="screenshot"
                type="url"
                placeholder="Paste image URL or upload to image hosting service"
                value={formData.screenshot}
                onChange={(e) => handleFieldChange("screenshot", e.target.value)}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                {initialData ? "Update Trade" : "Add Trade"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
