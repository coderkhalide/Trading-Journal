"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, TrendingUp, TrendingDown, Target, DollarSign, Upload, Download, Settings } from "lucide-react"
import { TradeEntryForm, TradesList, AnalyticsDashboard } from "@/components/index"
import { AdvancedAnalytics } from "@/components/advanced-analytics"
import { SessionAnalytics } from "@/components/session-analytics"
import { SystemReports } from "@/components/system-reports"
import { SettingsPanel } from "@/components/settings-panel"
import { ImportDialog } from "@/components/import-dialog"
import { BalanceAdjuster } from "@/components/balance-adjuster"
import type { Trade, TradeStats, Settings as SettingsType, BalanceAdjustment } from "@/types/trade"
import { recalculateTradeMetrics } from "@/utils/trade-calculations"
import { FeeAnalysis } from "@/components/fee-analysis"

const DEFAULT_SETTINGS: SettingsType = {
  accountBalance: 100,
  assetFees: {
    BTC: 16,
    ETH: 1.3,
    Gold: 11,
    XAU: 11,
  },
  tradingSystems: [
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
  ],
  tradingSessions: [
    { name: "Day Open", startTime: "00:00", endTime: "06:59", color: "#3B82F6", description: "Day Open Session" },
    { name: "London", startTime: "07:00", endTime: "12:59", color: "#10B981", description: "London Session" },
    { name: "New York", startTime: "13:00", endTime: "19:59", color: "#F59E0B", description: "New York Session" },
    { name: "N/A", startTime: "20:00", endTime: "23:59", color: "#EF4444", description: "N/A Session" },
  ],
  riskDeviationTolerance: 10,
  systemIdealRisk: {},
  defaultIdealRisk: 1,
}

export default function TradingJournal() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [balanceAdjustments, setBalanceAdjustments] = useState<BalanceAdjustment[]>([])
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS)
  const [showTradeForm, setShowTradeForm] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showBalanceAdjuster, setShowBalanceAdjuster] = useState(false)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTrades = localStorage.getItem("trading-journal-trades")
    const savedSettings = localStorage.getItem("trading-journal-settings")
    const savedAdjustments = localStorage.getItem("trading-journal-balance-adjustments")

    if (savedTrades) {
      try {
        setTrades(JSON.parse(savedTrades))
      } catch (error) {
        console.error("Error loading trades:", error)
      }
    }

    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings })
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }

    if (savedAdjustments) {
      try {
        setBalanceAdjustments(JSON.parse(savedAdjustments))
      } catch (error) {
        console.error("Error loading balance adjustments:", error)
      }
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("trading-journal-trades", JSON.stringify(trades))
  }, [trades])

  useEffect(() => {
    localStorage.setItem("trading-journal-settings", JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem("trading-journal-balance-adjustments", JSON.stringify(balanceAdjustments))
  }, [balanceAdjustments])

  const addTrade = (tradeData: Omit<Trade, "id">) => {
    const newTrade: Trade = {
      ...tradeData,
      id: Date.now().toString(),
    }
    setTrades((prev) => [newTrade, ...prev])
    setShowTradeForm(false)
  }

  const updateTrade = (updatedTrade: Trade) => {
    setTrades((prev) => prev.map((trade) => (trade.id === updatedTrade.id ? updatedTrade : trade)))
  }

  const deleteTrade = (id: string) => {
    setTrades((prev) => prev.filter((trade) => trade.id !== id))
  }

  const handleBulkUpdate = (tradeIds: string[], updates: Partial<Trade>) => {
    setTrades((prev) =>
      prev.map((trade) => {
        if (!tradeIds.includes(trade.id)) return trade

        let updatedTrade = { ...trade }

        // Apply field updates
        if (updates.system) updatedTrade.system = updates.system
        if (updates.timeframe) updatedTrade.timeframe = updates.timeframe
        if (updates.grade) updatedTrade.grade = updates.grade
        if (updates.idealRiskAmount) updatedTrade.idealRiskAmount = updates.idealRiskAmount

        // Handle tag updates
        if (updates.addTags && updates.addTags.length > 0) {
          const newTags = [...new Set([...updatedTrade.tags, ...updates.addTags])]
          updatedTrade.tags = newTags
        }
        if (updates.removeTags && updates.removeTags.length > 0) {
          updatedTrade.tags = updatedTrade.tags.filter((tag) => !updates.removeTags!.includes(tag))
        }

        // Recalculate metrics if requested
        if (updates.recalculateMetrics) {
          updatedTrade = recalculateTradeMetrics(updatedTrade, settings)
        }

        return updatedTrade
      }),
    )
  }

  const handleImportTrades = (importedTrades: Omit<Trade, "id">[], duplicates?: string[]) => {
    const newTrades = importedTrades.map(trade => ({
      ...trade,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }))

    if (duplicates && duplicates.length > 0) {
      alert(`${duplicates.length} duplicate trades were skipped based on ticket numbers.`)
    }

    setTrades((prev) => [...newTrades, ...prev])
    setShowImportDialog(false)
  }

  const handleImportData = (data: any) => {
    if (data.trades) {
      handleImportTrades(data.trades)
    }
    if (data.settings) {
      setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
    }
    if (data.balanceAdjustments) {
      setBalanceAdjustments(data.balanceAdjustments)
    }
    setShowImportDialog(false)
  }

  const exportAllData = () => {
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      trades,
      settings,
      balanceAdjustments,
      stats: calculateStats(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `trading-journal-complete-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const addBalanceAdjustment = (adjustment: Omit<BalanceAdjustment, "id">) => {
    const newAdjustment: BalanceAdjustment = {
      ...adjustment,
      id: Date.now().toString(),
    }
    setBalanceAdjustments((prev) => [newAdjustment, ...prev])
    setShowBalanceAdjuster(false)
  }

  const deleteBalanceAdjustment = (id: string) => {
    setBalanceAdjustments((prev) => prev.filter((adj) => adj.id !== id))
  }

  const calculateStats = (): TradeStats => {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalPnL: 0,
        averageR: 0,
        averageExpectedR: 0,
        expectedValue: 0,
        profitFactor: 0,
        expectancy: 0,
        expectedExpectancy: 0,
        totalR: 0,
        totalExpectedR: 0,
        winningTrades: 0,
        losingTrades: 0,
        largestWin: 0,
        largestLoss: 0,
        totalFees: 0,
        totalRisk: 0,
        totalIdealRisk: 0,
        overRiskedTrades: 0,
        underRiskedTrades: 0,
        avgRiskDeviation: 0,
      }
    }

    const totalTrades = trades.length
    const winningTrades = trades.filter((t) => t.pnl > 0).length // Count winning trades based on net P&L
    const losingTrades = trades.filter((t) => t.pnl < 0).length // Count losing trades based on net P&L
    const winRate = (winningTrades / totalTrades) * 100

    const totalNetPnL = trades.reduce((sum, t) => sum + t.pnl, 0) // pnl field contains net P&L
    const totalFees = trades.reduce((sum, t) => sum + t.fee, 0)
    const totalGrossPnL = totalNetPnL + totalFees // Calculate gross P&L for fee analysis
    const totalR = trades.reduce((sum, t) => sum + t.rMultiple, 0)
    const totalExpectedR = trades.reduce((sum, t) => sum + (t.expectedR || 0), 0) // Sum of expected R values
    
    const totalRisk = trades.reduce((sum, t) => sum + t.riskAmount, 0)
    const totalIdealRisk = trades.reduce((sum, t) => sum + (t.idealRiskAmount || 0), 0)

    const averageR = totalR / totalTrades
    const averageExpectedR = totalExpectedR / totalTrades
    const expectedValue = averageExpectedR // Expected Value is the average Expected R

    const grossProfit = trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0)
    const grossLoss = Math.abs(trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Number.POSITIVE_INFINITY : 0

    const expectancy = totalNetPnL / totalTrades // Expectancy is average net P&L per trade
    const expectedExpectancy = averageExpectedR

    const largestWin = Math.max(...trades.map((t) => t.pnl), 0)
    const largestLoss = Math.min(...trades.map((t) => t.pnl), 0)

    const overRiskedTrades = trades.filter((t) => t.isOverRisked).length
    const underRiskedTrades = trades.filter((t) => t.isUnderRisked).length
    const avgRiskDeviation = trades.reduce((sum, t) => sum + (t.riskDeviation || 0), 0) / totalTrades

    return {
      totalTrades,
      winRate,
      totalPnL: totalNetPnL, // Net P&L for account balance calculations
      averageR,
      averageExpectedR,
      expectedValue,
      profitFactor,
      expectancy, // Average net P&L per trade
      expectedExpectancy,
      totalR,
      totalExpectedR,
      winningTrades,
      losingTrades,
      largestWin,
      largestLoss,
      totalFees,
      totalRisk,
      totalIdealRisk,
      overRiskedTrades,
      underRiskedTrades,
      avgRiskDeviation,
    }
  }

  const stats = calculateStats()

  // Calculate adjusted account balance
  const balanceAdjustmentTotal = balanceAdjustments.reduce((sum, adj) => {
    return sum + (adj.type === "add" ? adj.amount : -adj.amount)
  }, 0)
  const netTradingPnL = stats.totalPnL // stats.totalPnL contains net P&L
  const adjustedAccountBalance = settings.accountBalance + balanceAdjustmentTotal + netTradingPnL

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Trading Journal</h1>
            <p className="text-muted-foreground">Track and analyze your trading performance</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowBalanceAdjuster(true)} variant="outline" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Balance
            </Button>
            <Button onClick={() => setShowImportDialog(true)} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button onClick={exportAllData} variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export All
            </Button>
            <Button onClick={() => setShowSettings(true)} variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Button onClick={() => setShowTradeForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Trade
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${adjustedAccountBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {netTradingPnL >= 0 ? "+" : ""}${netTradingPnL.toFixed(2)} net P&L from trading
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expected Value (EV)</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.expectedValue >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stats.expectedValue.toFixed(3)}R
              </div>
              <p className="text-xs text-muted-foreground">Average expected return per trade</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.winningTrades}W / {stats.losingTrades}L
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expected R</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.totalExpectedR >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stats.totalExpectedR.toFixed(1)}R
              </div>
              <p className="text-xs text-muted-foreground">
                Cumulative expected return based on actual risk
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrades}</div>
              <p className="text-xs text-muted-foreground">
                Risk Management:{" "}
                {stats.totalTrades > 0
                  ? (
                    ((stats.totalTrades - stats.overRiskedTrades - stats.underRiskedTrades) / stats.totalTrades) *
                    100
                  ).toFixed(0)
                  : 0}
                % good
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="trades" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="systems">Systems</TabsTrigger>
            <TabsTrigger value="fee-analysis">Fee Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="trades">
            <TradesList
              trades={trades}
              onDeleteTrade={deleteTrade}
              onUpdateTrade={updateTrade}
              onBulkUpdate={handleBulkUpdate}
              settings={settings}
            />
          </TabsContent>

          <TabsContent value="dashboard">
            <AnalyticsDashboard trades={trades} stats={stats} settings={settings} />
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedAnalytics trades={trades} stats={stats} />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionAnalytics trades={trades} settings={settings} />
          </TabsContent>

          <TabsContent value="systems">
            <SystemReports trades={trades} settings={settings} />
          </TabsContent>
          <TabsContent value="fee-analysis">
            <FeeAnalysis trades={trades} />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {showTradeForm && (
          <TradeEntryForm onSubmit={addTrade} onCancel={() => setShowTradeForm(false)} settings={settings} />
        )}

        {showImportDialog && (
          <ImportDialog
            onImport={handleImportTrades}
            onCancel={() => setShowImportDialog(false)}
            settings={settings}
            existingTrades={trades}
          />
        )}

        {showSettings && (
          <SettingsPanel settings={settings} onSave={setSettings} onCancel={() => setShowSettings(false)} />
        )}

        {showBalanceAdjuster && (
          <BalanceAdjuster
            currentBalance={adjustedAccountBalance}
            adjustments={balanceAdjustments}
            onAddAdjustment={addBalanceAdjustment}
            onDeleteAdjustment={deleteBalanceAdjustment}
            onCancel={() => setShowBalanceAdjuster(false)}
          />
        )}
      </div>
    </div>
  )
}
