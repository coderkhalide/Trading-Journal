"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Upload, FileText, Download, AlertTriangle } from "lucide-react"
import type { Trade, Settings, BrokerTrade } from "@/types/trade"
import { getTradingSession, getDayOfWeek, DEFAULT_TRADING_SESSIONS } from "@/utils/trading-sessions"

interface ImportDialogProps {
  onImport: (trades: Omit<Trade, "id">[], duplicates?: string[]) => void
  onCancel: () => void
  settings: Settings
  existingTrades: Trade[]
}

export function ImportDialog({ onImport, onCancel, settings, existingTrades }: ImportDialogProps) {
  const [csvData, setCsvData] = useState("")
  const [jsonData, setJsonData] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewTrades, setPreviewTrades] = useState<Omit<Trade, "id">[]>([])
  const [duplicates, setDuplicates] = useState<string[]>([])
  const [defaultIdealRisk, setDefaultIdealRisk] = useState(settings.defaultIdealRisk || 100)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "csv" | "json") => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        if (type === "csv") {
          setCsvData(text)
        } else {
          setJsonData(text)
        }
      }
      reader.readAsText(file)
    }
  }

  const parseBrokerCSV = (csvText: string): BrokerTrade[] => {
    try {
      const lines = csvText.trim().split("\n")
      if (lines.length < 2) {
        throw new Error("CSV must have at least a header row and one data row")
      }
      
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
      
      console.log("CSV Headers:", headers)

      return lines.slice(1).map((line, index) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
        const trade: any = {}

        headers.forEach((header, index) => {
          trade[header] = values[index] || ""
        })

        console.log(`Trade ${index + 1}:`, trade)
        return trade as BrokerTrade
      })
    } catch (error) {
      console.error("Error parsing CSV:", error)
      throw error
    }
  }

  const convertBrokerTradeToTrade = (brokerTrade: BrokerTrade): Omit<Trade, "id"> => {
    try {
      console.log("Converting broker trade:", brokerTrade)
      
      const openingDate = new Date(brokerTrade.opening_time_utc)
      const closingDate = new Date(brokerTrade.closing_time_utc)

      if (isNaN(openingDate.getTime()) || isNaN(closingDate.getTime())) {
        throw new Error(`Invalid date format in trade ${brokerTrade.ticket}`)
      }

      // Extract asset name (remove USD suffix)
      const asset = brokerTrade.symbol.replace(/USD$|USDT$/, "")

      // Calculate duration
      const durationMs = closingDate.getTime() - openingDate.getTime()
      const totalSeconds = Math.floor(durationMs / 1000)
      const days = Math.floor(totalSeconds / (24 * 60 * 60))
      const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
      const seconds = totalSeconds % 60
      
      // Format duration string
      let duration = ""
      if (days > 0) duration += `${days}d `
      if (hours > 0) duration += `${hours}h `
      if (minutes > 0) duration += `${minutes}m `
      if (seconds > 0 || duration === "") duration += `${seconds}s`
      duration = duration.trim()

      // Get date and time in UTC - extract directly from the original UTC string
      const date = brokerTrade.opening_time_utc.split("T")[0]
      const time = openingDate.toTimeString().slice(0, 5)

      // Get End date and time in UTC - extract directly from the original UTC string
      const endDate = brokerTrade.closing_time_utc.split("T")[0]
      const endTime = closingDate.toTimeString().slice(0, 5)

      // Detect trading session and day of week
      const tradingSessions = settings?.tradingSessions && Array.isArray(settings.tradingSessions) && settings.tradingSessions.length > 0 
        ? settings.tradingSessions 
        : DEFAULT_TRADING_SESSIONS
      const session = getTradingSession(time, tradingSessions)
      const dayOfWeek = getDayOfWeek(date)

      // Calculate risk amount
      const entryPrice = Number(brokerTrade.opening_price)
      const stopLoss = Number(brokerTrade.stop_loss)
      const positionSize = Number(brokerTrade.lots)
      
      if (isNaN(entryPrice) || isNaN(stopLoss) || isNaN(positionSize)) {
        throw new Error(`Invalid numeric values in trade ${brokerTrade.ticket}`)
      }
      
      const riskPerUnit = Math.abs(entryPrice - stopLoss)
      const riskAmount = riskPerUnit * positionSize

      // Calculate fee
      const assetKey = asset.toUpperCase()
      const feeRate = settings?.assetFees?.[assetKey] || 0
      const fee = Math.abs(Number(brokerTrade.commission_usd)) || positionSize * feeRate

      // Calculate actual risk including fees
      const actualRiskAmount = riskAmount + fee

      // Calculate P&L and R-multiple
      const grossPnL = Number(brokerTrade.profit_usd) // profit_usd is the gross profit (before fees)
      const netPnL = grossPnL - fee // Calculate net profit: Gross - Fee gives net profit
      const pnl = netPnL // Store NET P&L in pnl field (what trader actually received)
      
      // R-multiple should be based on the original risk (without fees) for consistency
      const rMultiple = riskAmount > 0 ? netPnL / riskAmount : 0

      // Use default ideal risk for imported trades
      const idealRiskAmount = defaultIdealRisk

      // For imported trades, recalculate what the actual risk should have been
      // The ideal stop loss should be set so that: (ideal risk - fee) = price risk
      // This way, if stop loss is hit: price loss + fee = ideal risk
      const idealPriceRisk = Math.max(0, idealRiskAmount - fee)
      const tradeDirection = brokerTrade.type === "buy" ? "Long" : "Short"
      const idealStopLoss = tradeDirection === "Long" 
        ? entryPrice - (idealPriceRisk / positionSize)
        : entryPrice + (idealPriceRisk / positionSize)

      console.log(`Trade ${brokerTrade.ticket}: Ideal Risk: ${idealRiskAmount}, Ideal Price Risk: ${idealPriceRisk}, Ideal Stop: ${idealStopLoss.toFixed(2)}, Actual Stop: ${stopLoss}, Actual Risk: ${actualRiskAmount}`)

      // Expected R should be based on ideal risk (what we wanted to risk)
      const expectedR = idealRiskAmount > 0 ? netPnL / idealRiskAmount : 0
      const riskDeviation = idealRiskAmount > 0 ? ((actualRiskAmount - idealRiskAmount) / idealRiskAmount) * 100 : 0

      console.log(`Trade ${brokerTrade.ticket}: Expected R: ${expectedR}, R-Multiple: ${rMultiple}`)

      // Determine risk status
      const riskTolerance = settings?.riskDeviationTolerance || 10
      const isOverRisked = Math.abs(riskDeviation) > riskTolerance && riskDeviation > 0
      const isUnderRisked = Math.abs(riskDeviation) > riskTolerance && riskDeviation < 0

      // Calculate risk percentage
      const riskPercent = (settings?.accountBalance || 0) > 0 ? (actualRiskAmount / (settings?.accountBalance || 1)) * 100 : 0

      // Determine outcome
      let outcome: "Win" | "Loss" | "Breakeven" = "Breakeven"
      if (rMultiple > 0.1) outcome = "Win"
      else if (rMultiple < -0.1) outcome = "Loss"

      // Determine grade based on outcome and close reason
      let grade = "C"
      if (brokerTrade.close_reason === "tp") grade = "A"
      else if (brokerTrade.close_reason === "sl") grade = outcome === "Win" ? "B+" : "D"
      else grade = "C"

      const convertedTrade = {
        date,
        time,
        endDate,
        endTime,
        asset,
        tradeType: (brokerTrade.type === "buy" ? "Long" : "Short") as "Long" | "Short",
        entryPrice,
        exitPrice: Number(brokerTrade.closing_price),
        stopLoss,
        takeProfit: Number(brokerTrade.take_profit) || 0,
        positionSize,
        riskPercent: Number(riskPercent.toFixed(2)),
        rMultiple: Number(rMultiple.toFixed(2)),
        pnl: Number(pnl.toFixed(2)),
        fee: Number(fee.toFixed(2)),
        riskAmount: Number(riskAmount.toFixed(2)),
        idealRiskAmount,
        actualRiskAmount: Number(actualRiskAmount.toFixed(2)),
        riskDeviation: Number(riskDeviation.toFixed(2)),
        expectedR: Number(expectedR.toFixed(2)),
        isOverRisked,
        isUnderRisked,
        duration,
        system: "Imported",
        timeframe: "",
        notes: `Imported from broker. Close reason: ${brokerTrade.close_reason}`,
        tags: ["Imported"],
        outcome,
        grade,
        ticket: brokerTrade.ticket,
        session: session.name,
        dayOfWeek,
      } as Omit<Trade, "id">
      
      console.log("Converted trade:", convertedTrade)
      return convertedTrade
    } catch (error) {
      console.error("Error converting broker trade:", error)
      throw error
    }
  }

  const checkForDuplicates = (
    newTrades: Omit<Trade, "id">[],
  ): { trades: Omit<Trade, "id">[]; duplicates: string[] } => {
    const duplicateTickets: string[] = []
    const uniqueTrades: Omit<Trade, "id">[] = []

    newTrades.forEach((trade) => {
      if (trade.ticket) {
        const isDuplicate = existingTrades?.some((existing) => existing.ticket === trade.ticket)
        if (isDuplicate) {
          duplicateTickets.push(trade.ticket)
        } else {
          uniqueTrades.push(trade)
        }
      } else {
        uniqueTrades.push(trade)
      }
    })

    return { trades: uniqueTrades, duplicates: duplicateTickets }
  }

  const processCSV = () => {
    if (!csvData.trim()) return

    setIsProcessing(true)

    try {
      console.log("Processing CSV data:", csvData.substring(0, 200) + "...")
      
      const brokerTrades = parseBrokerCSV(csvData)
      console.log("Parsed broker trades:", brokerTrades.length)
      
      const convertedTrades = brokerTrades.map((trade, index) => {
        try {
          return convertBrokerTradeToTrade(trade)
        } catch (error) {
          console.error(`Error converting trade ${index + 1}:`, error)
          const errorMessage = error instanceof Error ? error.message : String(error)
          throw new Error(`Error converting trade ${index + 1}: ${errorMessage}`)
        }
      })
      
      console.log("Converted trades:", convertedTrades.length)
      
      const { trades: uniqueTrades, duplicates: foundDuplicates } = checkForDuplicates(convertedTrades)

      setPreviewTrades(uniqueTrades)
      setDuplicates(foundDuplicates)
      
      console.log("=== IMPORT SUMMARY ===")
      console.log("Total CSV rows processed:", brokerTrades.length)
      console.log("Successfully converted trades:", convertedTrades.length)
      console.log("Unique trades after duplicate check:", uniqueTrades.length)
      console.log("Duplicates found:", foundDuplicates.length)
      console.log("Duplicate tickets:", foundDuplicates)
      console.log("======================")
      
      if (foundDuplicates.length > 0) {
        alert(`Found ${foundDuplicates.length} duplicate trades that will be skipped: ${foundDuplicates.join(", ")}`)
      }
    } catch (error) {
      console.error("Error processing CSV:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      alert(`Error processing CSV: ${errorMessage}. Please check the format and try again.`)
    }

    setIsProcessing(false)
  }

  const processJSON = () => {
    if (!jsonData.trim()) return

    setIsProcessing(true)

    try {
      const parsedData = JSON.parse(jsonData)
      let trades: Omit<Trade, "id">[] = []

      if (Array.isArray(parsedData)) {
        trades = parsedData
      } else if (parsedData.trades && Array.isArray(parsedData.trades)) {
        trades = parsedData.trades
      } else {
        throw new Error("Invalid JSON format")
      }

      const { trades: uniqueTrades, duplicates: foundDuplicates } = checkForDuplicates(trades)
      setPreviewTrades(uniqueTrades)
      setDuplicates(foundDuplicates)
    } catch (error) {
      console.error("Error processing JSON:", error)
      alert("Error processing JSON. Please check the format.")
    }

    setIsProcessing(false)
  }

  const handleImport = () => {
    if (previewTrades.length > 0) {
      onImport(previewTrades, duplicates)
    }
  }

  const exportSampleJSON = () => {
    const sampleTrade = {
      date: "2025-01-01",
      time: "10:00",
      asset: "BTC",
      tradeType: "Long",
      entryPrice: 50000,
      exitPrice: 51000,
      stopLoss: 49500,
      takeProfit: 52000,
      positionSize: 0.1,
      riskPercent: 1.0,
      rMultiple: 1.0,
      pnl: 100,
      fee: 5,
      riskAmount: 50,
      idealRiskAmount: 100,
      actualRiskAmount: 55,
      riskDeviation: -45,
      expectedR: 1.0,
      isOverRisked: false,
      isUnderRisked: true,
      duration: "2h",
      system: "Breakout",
      timeframe: "1h",
      notes: "Sample trade",
      tags: ["Sample"],
      outcome: "Win",
      grade: "A",
      ticket: "12345",
      session: "London",
      dayOfWeek: "Monday",
    }

    const sampleData = {
      trades: [sampleTrade],
      settings: settings,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "trading-journal-sample.json"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Import Trades</CardTitle>
              <CardDescription>Import trades from CSV or JSON files</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="csv" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="csv">CSV Import</TabsTrigger>
              <TabsTrigger value="json">JSON Import/Export</TabsTrigger>
            </TabsList>

            <TabsContent value="csv" className="space-y-6">
              {/* Default Ideal Risk Setting */}
              <div>
                <Label htmlFor="defaultIdealRisk">Default Ideal Risk Amount ($)</Label>
                <Input
                  id="defaultIdealRisk"
                  type="number"
                  step="0.01"
                  value={defaultIdealRisk}
                  onChange={(e) => setDefaultIdealRisk(Number(e.target.value))}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This will be used as the ideal risk amount for all imported trades
                </p>
              </div>

              {/* File Upload */}
              <div>
                <Label htmlFor="csvFile">Upload CSV File</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e, "csv")}
                  className="mt-1"
                />
              </div>

              {/* Manual CSV Input */}
              <div>
                <Label htmlFor="csvData">Or Paste CSV Data</Label>
                <Textarea
                  id="csvData"
                  placeholder="Paste your CSV data here..."
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={8}
                  className="mt-1 font-mono text-sm"
                />
              </div>

              {/* Process Button */}
              <div className="flex justify-center">
                <Button onClick={processCSV} disabled={!csvData.trim() || isProcessing} className="gap-2">
                  <FileText className="h-4 w-4" />
                  {isProcessing ? "Processing..." : "Process CSV"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="json" className="space-y-6">
              {/* JSON Export/Import Instructions */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">JSON Import/Export</h4>
                <p className="text-sm text-blue-700 mb-3">
                  JSON format allows you to backup and restore your complete trading journal data including trades and
                  settings.
                </p>
                <Button onClick={exportSampleJSON} variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Download Sample JSON
                </Button>
              </div>

              {/* File Upload */}
              <div>
                <Label htmlFor="jsonFile">Upload JSON File</Label>
                <Input
                  id="jsonFile"
                  type="file"
                  accept=".json"
                  onChange={(e) => handleFileUpload(e, "json")}
                  className="mt-1"
                />
              </div>

              {/* Manual JSON Input */}
              <div>
                <Label htmlFor="jsonData">Or Paste JSON Data</Label>
                <Textarea
                  id="jsonData"
                  placeholder="Paste your JSON data here..."
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  rows={8}
                  className="mt-1 font-mono text-sm"
                />
              </div>

              {/* Process Button */}
              <div className="flex justify-center">
                <Button onClick={processJSON} disabled={!jsonData.trim() || isProcessing} className="gap-2">
                  <FileText className="h-4 w-4" />
                  {isProcessing ? "Processing..." : "Process JSON"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Duplicates Warning */}
          {duplicates.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Duplicate Trades Found</span>
              </div>
              <p className="text-sm text-yellow-700 mb-2">
                {duplicates.length} trades with existing ticket IDs were skipped:
              </p>
              <div className="flex flex-wrap gap-1">
                {duplicates.map((ticket) => (
                  <span key={ticket} className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                    {ticket}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {previewTrades.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Preview ({previewTrades.length} trades)
                {duplicates.length > 0 && (
                  <span className="text-yellow-600"> • {duplicates.length} duplicates skipped</span>
                )}
              </h3>
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Asset</th>
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-right">Entry</th>
                      <th className="p-2 text-right">Exit</th>
                      <th className="p-2 text-right">P&L</th>
                      <th className="p-2 text-right">R</th>
                      <th className="p-2 text-right">Expected R</th>
                      <th className="p-2 text-left">Grade</th>
                      <th className="p-2 text-left">Ticket</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewTrades.slice(0, 10).map((trade, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{trade.date}</td>
                        <td className="p-2">{trade.asset}</td>
                        <td className="p-2">{trade.tradeType}</td>
                        <td className="p-2 text-right">{trade.entryPrice}</td>
                        <td className="p-2 text-right">{trade.exitPrice}</td>
                        <td className={`p-2 text-right ${trade.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                          ${trade.pnl}
                        </td>
                        <td className={`p-2 text-right ${trade.rMultiple >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {trade.rMultiple}R
                        </td>
                        <td className={`p-2 text-right ${trade.expectedR >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {trade.expectedR.toFixed(2)}R
                        </td>
                        <td className="p-2">{trade.grade}</td>
                        <td className="p-2">{trade.ticket}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewTrades.length > 10 && (
                  <p className="p-2 text-center text-muted-foreground">
                    ... and {previewTrades.length - 10} more trades
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Import Actions */}
          <div className="flex gap-4 pt-4">
            <Button onClick={handleImport} disabled={previewTrades.length === 0} className="flex-1 gap-2">
              <Upload className="h-4 w-4" />
              Import {previewTrades.length} Trades
              {duplicates.length > 0 && <span>({duplicates.length} skipped)</span>}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
