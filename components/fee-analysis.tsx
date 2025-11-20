"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DollarSign, TrendingDown, AlertTriangle, Target, Lightbulb } from "lucide-react"
import type { Trade } from "@/types/trade"

interface FeeAnalysisProps {
  trades: Trade[]
}

export function FeeAnalysis({ trades }: FeeAnalysisProps) {
  const feeAnalysis = useMemo(() => {
    const closedTrades = trades.filter((trade) => trade.exitPrice > 0)

    if (closedTrades.length === 0) {
      return {
        totalFees: 0,
        totalGrossPnL: 0,
        totalNetPnL: 0,
        feeImpactPercent: 0,
        averageFeePerTrade: 0,
        assetFeeBreakdown: [],
        systemFeeBreakdown: [],
        monthlyFeeData: [],
        highFeeTrades: [],
        feeOptimizationTips: [],
      }
    }

    const totalFees = closedTrades.reduce((sum, trade) => sum + (trade.fee || 0), 0)
    const totalNetPnL = closedTrades.reduce((sum, trade) => sum + trade.pnl, 0) // pnl field now contains net P&L
    const totalGrossPnL = totalNetPnL + totalFees // Calculate gross from net + fees
    const feeImpactPercent = totalGrossPnL !== 0 ? (totalFees / Math.abs(totalGrossPnL)) * 100 : 0
    const averageFeePerTrade = totalFees / closedTrades.length

    // Asset fee breakdown
    const assetFees = closedTrades.reduce(
      (acc, trade) => {
        const asset = trade.asset
        if (!acc[asset]) {
          acc[asset] = { totalFees: 0, tradeCount: 0, totalVolume: 0 }
        }
        acc[asset].totalFees += trade.fee || 0
        acc[asset].tradeCount += 1
        acc[asset].totalVolume += trade.positionSize * trade.entryPrice
        return acc
      },
      {} as Record<string, { totalFees: number; tradeCount: number; totalVolume: number }>,
    )

    const assetFeeBreakdown = Object.entries(assetFees)
      .map(([asset, data]) => ({
        asset,
        totalFees: data.totalFees,
        averageFee: data.totalFees / data.tradeCount,
        tradeCount: data.tradeCount,
        feePercentage: (data.totalFees / totalFees) * 100,
        feeEfficiency: data.totalVolume > 0 ? (data.totalFees / data.totalVolume) * 100 : 0,
      }))
      .sort((a, b) => b.totalFees - a.totalFees)

    // System fee breakdown
    const systemFees = closedTrades.reduce(
      (acc, trade) => {
        const system = trade.system
        if (!acc[system]) {
          acc[system] = { totalFees: 0, tradeCount: 0, totalPnL: 0 }
        }
        acc[system].totalFees += trade.fee || 0
        acc[system].tradeCount += 1
        acc[system].totalPnL += trade.pnl
        return acc
      },
      {} as Record<string, { totalFees: number; tradeCount: number; totalPnL: number }>,
    )

    const systemFeeBreakdown = Object.entries(systemFees)
      .map(([system, data]) => ({
        system,
        totalFees: data.totalFees,
        averageFee: data.totalFees / data.tradeCount,
        tradeCount: data.tradeCount,
        netPnL: data.totalPnL,
        feeImpact: data.totalPnL !== 0 ? (data.totalFees / Math.abs(data.totalPnL)) * 100 : 0,
      }))
      .sort((a, b) => b.feeImpact - a.feeImpact)

    // Monthly fee trends
    const monthlyFees = closedTrades.reduce(
      (acc, trade) => {
        const month = trade.date.substring(0, 7) // YYYY-MM
        if (!acc[month]) {
          acc[month] = { fees: 0, trades: 0, pnl: 0 }
        }
        acc[month].fees += trade.fee || 0
        acc[month].trades += 1
        acc[month].pnl += trade.pnl
        return acc
      },
      {} as Record<string, { fees: number; trades: number; pnl: number }>,
    )

    const monthlyFeeData = Object.entries(monthlyFees)
      .map(([month, data]) => ({
        month,
        fees: data.fees,
        averageFeePerTrade: data.fees / data.trades,
        feeImpact: data.pnl !== 0 ? (data.fees / Math.abs(data.pnl)) * 100 : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // High fee trades (top 10% by fee amount)
    const sortedByFee = [...closedTrades].sort((a, b) => (b.fee || 0) - (a.fee || 0))
    const highFeeThreshold = Math.ceil(closedTrades.length * 0.1)
    const highFeeTrades = sortedByFee.slice(0, Math.max(5, highFeeThreshold))

    // Fee optimization tips
    const feeOptimizationTips = []

    if (feeImpactPercent > 50) {
      feeOptimizationTips.push(
        "🚨 Fees are eating over 50% of your profits! Consider reducing trade frequency or increasing position sizes.",
      )
    }

    if (averageFeePerTrade > 20) {
      feeOptimizationTips.push(
        "💡 Your average fee per trade is high. Consider consolidating smaller trades or switching to lower-fee assets.",
      )
    }

    const mostExpensiveAsset = assetFeeBreakdown[0]
    if (mostExpensiveAsset && mostExpensiveAsset.feePercentage > 40) {
      feeOptimizationTips.push(
        `📊 ${mostExpensiveAsset.asset} accounts for ${mostExpensiveAsset.feePercentage.toFixed(1)}% of your fees. Consider diversifying or reducing frequency.`,
      )
    }

    const worstSystem = systemFeeBreakdown[0]
    if (worstSystem && worstSystem.feeImpact > 80) {
      feeOptimizationTips.push(
        `⚠️ ${worstSystem.system} system has ${worstSystem.feeImpact.toFixed(1)}% fee impact. Review if this strategy is fee-efficient.`,
      )
    }

    if (feeOptimizationTips.length === 0) {
      feeOptimizationTips.push(
        "✅ Your fee management looks reasonable! Keep monitoring for optimization opportunities.",
      )
    }

    return {
      totalFees,
      totalGrossPnL,
      totalNetPnL,
      feeImpactPercent,
      averageFeePerTrade,
      assetFeeBreakdown,
      systemFeeBreakdown,
      monthlyFeeData,
      highFeeTrades,
      feeOptimizationTips,
    }
  }, [trades])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  return (
    <div className="space-y-6">
      {/* Fee Impact Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(feeAnalysis.totalFees)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(feeAnalysis.averageFeePerTrade)} per trade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Impact</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${feeAnalysis.feeImpactPercent > 50 ? "text-red-600" : feeAnalysis.feeImpactPercent > 25 ? "text-orange-600" : "text-green-600"}`}
            >
              {feeAnalysis.feeImpactPercent.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Of gross P&L consumed by fees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross P&L</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${feeAnalysis.totalGrossPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(feeAnalysis.totalGrossPnL)}
            </div>
            <p className="text-xs text-muted-foreground">Before fees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${feeAnalysis.totalNetPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(feeAnalysis.totalNetPnL)}
            </div>
            <p className="text-xs text-muted-foreground">After fees</p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Impact Alert */}
      {feeAnalysis.feeImpactPercent > 50 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>High Fee Impact Warning:</strong> Fees are consuming {feeAnalysis.feeImpactPercent.toFixed(1)}% of
            your gross profits. This significantly impacts your net returns. Consider optimizing your trading frequency
            and position sizes.
          </AlertDescription>
        </Alert>
      )}

      {/* Asset Fee Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fee Breakdown by Asset</CardTitle>
            <CardDescription>Which assets cost you the most in fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feeAnalysis.assetFeeBreakdown.map((asset, index) => (
                <div key={asset.asset} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{asset.asset}</Badge>
                      <span className="text-sm text-muted-foreground">{asset.tradeCount} trades</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(asset.totalFees)}</div>
                      <div className="text-xs text-muted-foreground">{asset.feePercentage.toFixed(1)}% of total</div>
                    </div>
                  </div>
                  <Progress value={asset.feePercentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Fee Impact</CardTitle>
            <CardDescription>How fees affect each trading system's profitability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feeAnalysis.systemFeeBreakdown.map((system) => (
                <div key={system.system} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{system.system}</div>
                      <div className="text-xs text-muted-foreground">
                        {system.tradeCount} trades • Net: {formatCurrency(system.netPnL)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(system.totalFees)}</div>
                      <div
                        className={`text-xs ${system.feeImpact > 50 ? "text-red-600" : system.feeImpact > 25 ? "text-orange-600" : "text-green-600"}`}
                      >
                        {system.feeImpact.toFixed(1)}% impact
                      </div>
                    </div>
                  </div>
                  <Progress value={Math.min(system.feeImpact, 100)} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Fee Trends */}
      {feeAnalysis.monthlyFeeData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Fee Trends</CardTitle>
            <CardDescription>Track your fee patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                fees: {
                  label: "Total Fees",
                  color: "hsl(var(--chart-1))",
                },
                averageFeePerTrade: {
                  label: "Avg Fee/Trade",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[250px] sm:h-[300px] w-full overflow-hidden"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={feeAnalysis.monthlyFeeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="fees" stroke="var(--color-fees)" strokeWidth={2} name="Total Fees" />
                  <Line
                    type="monotone"
                    dataKey="averageFeePerTrade"
                    stroke="var(--color-averageFeePerTrade)"
                    strokeWidth={2}
                    name="Avg Fee/Trade"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* High Fee Trades Alert */}
      {feeAnalysis.highFeeTrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Highest Fee Trades
            </CardTitle>
            <CardDescription>Your most expensive trades by fee amount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feeAnalysis.highFeeTrades.map((trade) => (
                <div key={trade.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {trade.asset} {trade.tradeType}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {trade.date} • {trade.system} • {trade.positionSize} lots
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">{formatCurrency(trade.fee || 0)}</div>
                    <div className="text-sm text-muted-foreground">P&L: {formatCurrency(trade.pnl)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fee Optimization Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            Fee Optimization Tips
          </CardTitle>
          <CardDescription>Actionable insights to reduce your fee impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {feeAnalysis.feeOptimizationTips.map((tip, index) => (
              <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
