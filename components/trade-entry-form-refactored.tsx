"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Calculator } from "lucide-react"
import type { Trade, Settings } from "@/types/trade"
import { BasicInfoSection } from "./trade-form/basic-info-section"
import { TradeDetailsSection } from "./trade-form/trade-details-section"
import { PriceLevelsSection } from "./trade-form/price-levels-section"
import { CalculationResults } from "./trade-form/calculation-results"
import { TagsSection } from "./trade-form/tags-section"
import { RiskManagementSection } from "./trade-form/risk-management-section-refactored"
import { JournalEditor } from "./journal-editor"
import { BrokerDataSection } from "./features/trades/broker-data-section"
import { useIndividualTradeCalculations } from "@/hooks/use-individual-trade-calculations"
import { getTradingSession, getDayOfWeek } from "@/utils/trading-sessions"

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
  // Safe defaults
  const safeTradingSystems = settings?.tradingSystems || [
    "Z-score", "EMT", "NYC Breakout", "London Open", "Scalping", 
    "Swing Trading", "Mean Reversion", "Momentum", "Breakout", "Other"
  ]
  const safeAssetFees = settings?.assetFees || { BTC: 16, ETH: 1.3, Gold: 11 }
  const safeAccountBalance = settings?.accountBalance || 10000
  const riskTolerance = settings?.riskDeviationTolerance || 10
  const defaultIdealRisk = settings?.defaultIdealRisk || 100
  const availableAssets = Object.keys(safeAssetFees)

  // Form state
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split("T")[0],
    time: initialData?.time || new Date().toTimeString().slice(0, 5),
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
  })

  // Risk mode toggle state
  const [riskModeState, setRiskModeState] = useState<{
    useGradeAdjusted: boolean
    applyFunction: (() => void) | null
  }>({ useGradeAdjusted: false, applyFunction: null })

  // Use the individual trade calculations hook
  const calculatedValues = useIndividualTradeCalculations(formData, {
    assetFees: safeAssetFees,
    accountBalance: safeAccountBalance,
    riskDeviationTolerance: riskTolerance,
  })

  // Handle broker data import
  const handleBrokerDataParsed = (brokerData: ParsedBrokerData) => {
    setFormData(prev => ({
      ...prev,
      asset: brokerData.asset,
      tradeType: brokerData.tradeType,
      entryPrice: brokerData.entryPrice,
      exitPrice: brokerData.exitPrice,
      stopLoss: brokerData.stopLoss,
      positionSize: brokerData.positionSize,
      ticket: brokerData.ticket,
      date: brokerData.openDate,
      time: brokerData.openTime,
    }))
  }

  // Handle form field updates
  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.asset || !formData.system || !formData.timeframe) {
      alert("Please fill in all required fields (Asset, System, Timeframe)")
      return
    }

    const tradeDateTime = new Date(`${formData.date} ${formData.time}`)
    const session = getTradingSession(tradeDateTime, { /* trading sessions config */ })
    const dayOfWeek = getDayOfWeek(formData.date)

    const trade: Omit<Trade, "id"> = {
      ...formData,
      ...calculatedValues,
      session: session.name,
      dayOfWeek,
    }

    onSubmit(trade)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {initialData ? "Edit Trade" : "Add New Trade"}
          </h2>
          <p className="text-muted-foreground">
            {initialData ? "Update trade details below" : "Enter your trade details below"}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Broker Data Import Section */}
      {!initialData && (
        <BrokerDataSection onDataParsed={handleBrokerDataParsed} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <BasicInfoSection
            date={formData.date}
            time={formData.time}
            asset={formData.asset}
            tradeType={formData.tradeType}
            availableAssets={availableAssets}
            tradingSystems={safeTradingSystems}
            system={formData.system}
            onChange={updateFormField}
          />

          <TradeDetailsSection
            timeframe={formData.timeframe}
            ticket={formData.ticket}
            screenshot={formData.screenshot}
            onChange={updateFormField}
          />

          <PriceLevelsSection
            entryPrice={formData.entryPrice}
            exitPrice={formData.exitPrice}
            stopLoss={formData.stopLoss}
            positionSize={formData.positionSize}
            tradeType={formData.tradeType}
            onChange={updateFormField}
          />

          <RiskManagementSection
            formData={{
              ...formData,
              ...calculatedValues,
            }}
            onChange={updateFormField}
            settings={settings}
            baseIdealRisk={defaultIdealRisk}
            onToggleStateChange={(useGradeAdjusted, applyFunction) => {
              setRiskModeState({ useGradeAdjusted, applyFunction })
            }}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <CalculationResults 
            {...calculatedValues}
            idealRiskAmount={formData.idealRiskAmount}
          />

          <TagsSection
            tags={formData.tags}
            grade={formData.grade}
            grades={GRADES}
            onChange={updateFormField}
          />

          <Card>
            <CardHeader>
              <CardTitle>Trading Notes</CardTitle>
              <CardDescription>
                Document your analysis, setup, and observations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JournalEditor
                value={formData.notes}
                onChange={(value) => updateFormField("notes", value)}
                placeholder="Describe your trade setup, analysis, and observations..."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-2 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Calculator className="h-4 w-4 mr-2" />
          {initialData ? "Update Trade" : "Add Trade"}
        </Button>
      </div>
    </form>
  )
}
