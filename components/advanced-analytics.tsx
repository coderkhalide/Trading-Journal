"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { XAxis, YAxis, LineChart, Line, BarChart, Bar } from "recharts"
import { TrendingUp, Target, AlertTriangle, BarChart3, Filter } from "lucide-react"
import { useState } from "react"
import type { Trade, TradeStats, FilterOptions } from "@/types/trade"

interface AdvancedAnalyticsProps {
  trades: Trade[]
  stats: TradeStats
}

export function AdvancedAnalytics({ trades, stats }: AdvancedAnalyticsProps) {
  const [filters, setFilters] = useState<FilterOptions>({})
  const [selectedSystem, setSelectedSystem] = useState<string>("all")

  // Get unique values for filters
  const uniqueSystems = [...new Set(trades.map((t) => t.system).filter(Boolean))]
  const uniqueTimeframes = [...new Set(trades.map((t) => t.timeframe).filter(Boolean))]
  const uniqueSessions = [...new Set(trades.map((t) => t.session).filter(Boolean))]

  // Filter trades based on current filters
  const getFilteredTrades = () => {
    return trades.filter((trade) => {
      const matchesSystem = selectedSystem === "all" || trade.system === selectedSystem
      const matchesTimeframe = !filters.timeframe || trade.timeframe === filters.timeframe
      const matchesSession = !filters.session || trade.session === filters.session
      const matchesDateFrom = !filters.dateFrom || trade.date >= filters.dateFrom
      const matchesDateTo = !filters.dateTo || trade.date <= filters.dateTo

      return matchesSystem && matchesTimeframe && matchesSession && matchesDateFrom && matchesDateTo
    })
  }

  const filteredTrades = getFilteredTrades()

  // Calculate filtered stats
  const getFilteredStats = () => {
    if (filteredTrades.length === 0) return null

    const totalTrades = filteredTrades.length
    const winningTrades = filteredTrades.filter((t) => t.pnl > 0).length
    const losingTrades = filteredTrades.filter((t) => t.pnl < 0).length
    const winRate = (winningTrades / totalTrades) * 100

    const totalExpectedR = filteredTrades.reduce((sum, t) => sum + (t.expectedR || 0), 0)
    const totalPnL = filteredTrades.reduce((sum, t) => sum + t.pnl, 0)
    const expectedValue = totalExpectedR / totalTrades

    const overRiskedTrades = filteredTrades.filter((t) => t.isOverRisked).length
    const underRiskedTrades = filteredTrades.filter((t) => t.isUnderRisked).length
    const riskManagementScore = ((totalTrades - overRiskedTrades - underRiskedTrades) / totalTrades) * 100

    const highGradeTrades = filteredTrades.filter((t) => ["A++++", "A+++", "A++", "A+", "A"].includes(t.grade)).length
    const qualityScore = (highGradeTrades / totalTrades) * 100

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      expectedValue,
      totalExpectedR,
      totalPnL,
      riskManagementScore,
      qualityScore,
      overRiskedTrades,
      underRiskedTrades,
    }
  }

  const filteredStats = getFilteredStats()

  // System comparison data
  const systemComparison = uniqueSystems
    .map((system) => {
      const systemTrades = filteredTrades.filter((t) => t.system === system)
      if (systemTrades.length === 0) return null

      const expectedValue = systemTrades.reduce((sum, t) => sum + (t.expectedR || 0), 0) / systemTrades.length
      const winRate = (systemTrades.filter((t) => t.pnl > 0).length / systemTrades.length) * 100
      const totalPnL = systemTrades.reduce((sum, t) => sum + t.pnl, 0)

      return {
        system,
        expectedValue,
        winRate,
        totalPnL,
        trades: systemTrades.length,
      }
    })
    .filter(Boolean)

  // Timeframe analysis
  const timeframeAnalysis = uniqueTimeframes
    .map((timeframe) => {
      const tfTrades = filteredTrades.filter((t) => t.timeframe === timeframe)
      if (tfTrades.length === 0) return null

      const expectedValue = tfTrades.reduce((sum, t) => sum + (t.expectedR || 0), 0) / tfTrades.length
      const winRate = (tfTrades.filter((t) => t.pnl > 0).length / tfTrades.length) * 100

      return {
        timeframe,
        expectedValue,
        winRate,
        trades: tfTrades.length,
      }
    })
    .filter(Boolean)

  // Session analysis
  const sessionAnalysis = uniqueSessions
    .map((session) => {
      const sessionTrades = filteredTrades.filter((t) => t.session === session)
      if (sessionTrades.length === 0) return null

      const expectedValue = sessionTrades.reduce((sum, t) => sum + (t.expectedR || 0), 0) / sessionTrades.length
      const winRate = (sessionTrades.filter((t) => t.pnl > 0).length / sessionTrades.length) * 100

      return {
        session,
        expectedValue,
        winRate,
        trades: sessionTrades.length,
      }
    })
    .filter(Boolean)

  // Monthly performance
  const monthlyPerformance = filteredTrades.reduce(
    (acc, trade) => {
      const month = trade.date.substring(0, 7)
      if (!acc[month]) {
        acc[month] = { trades: 0, totalExpectedR: 0, totalPnL: 0 }
      }
      acc[month].trades++
      acc[month].totalExpectedR += trade.expectedR || 0
      acc[month].totalPnL += trade.pnl
      return acc
    },
    {} as Record<string, any>,
  )

  const monthlyData = Object.entries(monthlyPerformance)
    .map(([month, data]) => ({
      month,
      expectedValue: data.totalExpectedR / data.trades,
      totalPnL: data.totalPnL,
      trades: data.trades,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  const chartConfig = {
    expectedValue: { label: "Expected Value", color: "hsl(var(--chart-1))" },
    winRate: { label: "Win Rate", color: "hsl(var(--chart-2))" },
    totalPnL: { label: "Total P&L", color: "hsl(var(--chart-3))" },
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No Advanced Analytics Available</h3>
        <p className="text-muted-foreground">Add more trades to unlock detailed performance analysis</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Analytics Filters
          </CardTitle>
          <CardDescription>Filter your analysis by system, timeframe, session, and date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>System</Label>
              <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Systems</SelectItem>
                  {uniqueSystems.map((system) => (
                    <SelectItem key={system} value={system}>
                      {system}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Timeframe</Label>
              <Select
                value={filters.timeframe || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, timeframe: value === "all" ? undefined : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Timeframes</SelectItem>
                  {uniqueTimeframes.map((tf) => (
                    <SelectItem key={tf} value={tf}>
                      {tf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Session</Label>
              <Select
                value={filters.session || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, session: value === "all" ? undefined : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  {uniqueSessions.map((session) => (
                    <SelectItem key={session} value={session}>
                      {session}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>From Date</Label>
              <Input
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value || undefined }))}
              />
            </div>
            <div>
              <Label>To Date</Label>
              <Input
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value || undefined }))}
              />
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Analyzing {filteredTrades.length} of {trades.length} trades
          </div>
        </CardContent>
      </Card>

      {filteredStats && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expected Value (EV)</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${filteredStats.expectedValue >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {filteredStats.expectedValue.toFixed(3)}R
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
                <div className="text-2xl font-bold">{filteredStats.winRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {filteredStats.winningTrades}W / {filteredStats.losingTrades}L
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expected R</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${filteredStats.totalExpectedR >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {filteredStats.totalExpectedR.toFixed(1)}R
                </div>
                <p className="text-xs text-muted-foreground">Cumulative expected return</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Management</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${filteredStats.riskManagementScore >= 80 ? "text-green-600" : filteredStats.riskManagementScore >= 60 ? "text-yellow-600" : "text-red-600"}`}
                >
                  {filteredStats.riskManagementScore.toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">Good risk management rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${filteredStats.qualityScore >= 70 ? "text-green-600" : filteredStats.qualityScore >= 50 ? "text-yellow-600" : "text-red-600"}`}
                >
                  {filteredStats.qualityScore.toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">High-grade trades (A grades)</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Comparison */}
            {systemComparison.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>System Expected Value Comparison</CardTitle>
                  <CardDescription>Expected value by trading system</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full overflow-hidden">
                    <BarChart data={systemComparison}>
                      <XAxis dataKey="system" />
                      <YAxis />
                      <ChartTooltip />
                      <Bar dataKey="expectedValue" fill="var(--color-expectedValue)" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Timeframe Analysis */}
            {timeframeAnalysis.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Timeframe Expected Value</CardTitle>
                  <CardDescription>Performance by timeframe</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full overflow-hidden">
                    <BarChart data={timeframeAnalysis}>
                      <XAxis dataKey="timeframe" />
                      <YAxis />
                      <ChartTooltip />
                      <Bar dataKey="expectedValue" fill="var(--color-expectedValue)" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Session Analysis */}
            {sessionAnalysis.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Session Expected Value</CardTitle>
                  <CardDescription>Performance by trading session</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full overflow-hidden">
                    <BarChart data={sessionAnalysis}>
                      <XAxis dataKey="session" />
                      <YAxis />
                      <ChartTooltip />
                      <Bar dataKey="expectedValue" fill="var(--color-expectedValue)" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Monthly Performance */}
            {monthlyData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Expected Value Trend</CardTitle>
                  <CardDescription>Expected value performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full overflow-hidden">
                    <LineChart data={monthlyData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip />
                      <Line
                        type="monotone"
                        dataKey="expectedValue"
                        stroke="var(--color-expectedValue)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detailed Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Breakdown Table */}
            {systemComparison.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>System Performance Breakdown</CardTitle>
                  <CardDescription>Detailed metrics by system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemComparison.map((system) => (
                      <div key={system.system} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{system.system}</h4>
                          <p className="text-sm text-muted-foreground">{system.trades} trades</p>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${system.expectedValue >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {system.expectedValue.toFixed(3)}R EV
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {system.winRate.toFixed(1)}% WR | ${system.totalPnL.toFixed(0)} P&L
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risk Management Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Management Analysis</CardTitle>
                <CardDescription>Risk deviation breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {filteredStats.totalTrades - filteredStats.overRiskedTrades - filteredStats.underRiskedTrades}
                    </div>
                    <div className="text-sm text-muted-foreground">Good Risk</div>
                    <div className="text-xs text-green-600">
                      {(
                        ((filteredStats.totalTrades -
                          filteredStats.overRiskedTrades -
                          filteredStats.underRiskedTrades) /
                          filteredStats.totalTrades) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{filteredStats.overRiskedTrades}</div>
                    <div className="text-sm text-muted-foreground">Over-Risked</div>
                    <div className="text-xs text-red-600">
                      {((filteredStats.overRiskedTrades / filteredStats.totalTrades) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{filteredStats.underRiskedTrades}</div>
                    <div className="text-sm text-muted-foreground">Under-Risked</div>
                    <div className="text-xs text-orange-600">
                      {((filteredStats.underRiskedTrades / filteredStats.totalTrades) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
