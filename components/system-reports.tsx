"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis } from "recharts"
import { TrendingUp, TrendingDown, Target, AlertTriangle, Award, Calendar } from "lucide-react"
import type { Trade } from "@/types/trade"

interface SystemReportsProps {
  trades: Trade[]
}

export function SystemReports({ trades }: SystemReportsProps) {
  const [selectedSystem, setSelectedSystem] = useState<string>("all")

  // Get all systems
  const allSystems = [...new Set(trades.map((t) => t.system).filter(Boolean))]

  // Filter trades by selected system
  const systemTrades = selectedSystem === "all" ? trades : trades.filter((t) => t.system === selectedSystem)

  const systems = selectedSystem === "all" ? allSystems : [selectedSystem]

  // Calculate comprehensive system statistics
  const systemStats = systems
    .map((system) => {
      const systemTrades = trades.filter((t) => t.system === system)

      if (systemTrades.length === 0) return null

      const wins = systemTrades.filter((t) => t.expectedR > 0)
      const losses = systemTrades.filter((t) => t.expectedR < 0)
      const breakevens = systemTrades.filter((t) => t.expectedR === 0)

      const totalExpectedR = systemTrades.reduce((sum, t) => sum + (t.expectedR || 0), 0)
      const totalR = systemTrades.reduce((sum, t) => sum + t.rMultiple, 0)
      const totalPnL = systemTrades.reduce((sum, t) => sum + t.pnl, 0)
      const totalFees = systemTrades.reduce((sum, t) => sum + t.fee, 0)
      const totalRisk = systemTrades.reduce((sum, t) => sum + t.riskAmount, 0)
      const totalIdealRisk = systemTrades.reduce((sum, t) => sum + (t.idealRiskAmount || 0), 0)

      const winRate = (wins.length / systemTrades.length) * 100
      const avgExpectedR = totalExpectedR / systemTrades.length
      const avgR = totalR / systemTrades.length
      const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + (t.expectedR || 0), 0) / wins.length : 0
      const avgLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + (t.expectedR || 0), 0) / losses.length : 0

      // Expected Value (EV) - average expected R per trade
      const expectedValue = avgExpectedR

      // Risk management analysis
      const overRiskedTrades = systemTrades.filter((t) => t.isOverRisked).length
      const underRiskedTrades = systemTrades.filter((t) => t.isUnderRisked).length
      const goodRiskTrades = systemTrades.length - overRiskedTrades - underRiskedTrades
      const riskManagementScore = (goodRiskTrades / systemTrades.length) * 100

      // Grade analysis
      const gradeDistribution = systemTrades.reduce(
        (acc, t) => {
          acc[t.grade] = (acc[t.grade] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const highGradeTrades = systemTrades.filter((t) => ["A++++", "A+++", "A++", "A+", "A"].includes(t.grade)).length
      const qualityScore = (highGradeTrades / systemTrades.length) * 100

      // Timeframe analysis
      const timeframeStats = systemTrades.reduce(
        (acc, t) => {
          if (!acc[t.timeframe]) {
            acc[t.timeframe] = { trades: 0, totalExpectedR: 0, wins: 0 }
          }
          acc[t.timeframe].trades++
          acc[t.timeframe].totalExpectedR += t.expectedR || 0
          if ((t.expectedR || 0) > 0) acc[t.timeframe].wins++
          return acc
        },
        {} as Record<string, any>,
      )

      const bestTimeframe = Object.entries(timeframeStats)
        .map(([tf, stats]) => ({
          timeframe: tf,
          avgExpectedR: stats.totalExpectedR / stats.trades,
          trades: stats.trades,
        }))
        .sort((a, b) => b.avgExpectedR - a.avgExpectedR)[0]

      // Session analysis
      const sessionStats = systemTrades.reduce(
        (acc, t) => {
          if (!acc[t.session]) {
            acc[t.session] = { trades: 0, totalExpectedR: 0, wins: 0 }
          }
          acc[t.session].trades++
          acc[t.session].totalExpectedR += t.expectedR || 0
          if ((t.expectedR || 0) > 0) acc[t.session].wins++
          return acc
        },
        {} as Record<string, any>,
      )

      const bestSession = Object.entries(sessionStats)
        .map(([session, stats]) => ({
          session,
          avgExpectedR: stats.totalExpectedR / stats.trades,
          trades: stats.trades,
        }))
        .sort((a, b) => b.avgExpectedR - a.avgExpectedR)[0]

      // Monthly performance
      const monthlyStats = systemTrades.reduce(
        (acc, t) => {
          const month = t.date.substring(0, 7)
          if (!acc[month]) {
            acc[month] = { trades: 0, totalExpectedR: 0, totalPnL: 0 }
          }
          acc[month].trades++
          acc[month].totalExpectedR += t.expectedR || 0
          acc[month].totalPnL += t.pnl
          return acc
        },
        {} as Record<string, any>,
      )

      const monthlyData = Object.entries(monthlyStats)
        .map(([month, stats]) => ({ month, ...stats }))
        .sort((a, b) => a.month.localeCompare(b.month))

      // Streaks analysis
      let currentWinStreak = 0
      let currentLossStreak = 0
      let maxWinStreak = 0
      let maxLossStreak = 0

      systemTrades
        .sort((a, b) => new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime())
        .forEach((trade) => {
          if ((trade.expectedR || 0) > 0) {
            currentWinStreak++
            currentLossStreak = 0
            maxWinStreak = Math.max(maxWinStreak, currentWinStreak)
          } else if ((trade.expectedR || 0) < 0) {
            currentLossStreak++
            currentWinStreak = 0
            maxLossStreak = Math.max(maxLossStreak, currentLossStreak)
          }
        })

      return {
        system,
        totalTrades: systemTrades.length,
        wins: wins.length,
        losses: losses.length,
        breakevens: breakevens.length,
        winRate,
        avgExpectedR,
        avgR,
        avgWin,
        avgLoss,
        expectedValue,
        totalExpectedR,
        totalR,
        totalPnL,
        totalFees,
        totalRisk,
        totalIdealRisk,
        overRiskedTrades,
        underRiskedTrades,
        goodRiskTrades,
        riskManagementScore,
        gradeDistribution,
        qualityScore,
        timeframeStats,
        bestTimeframe,
        sessionStats,
        bestSession,
        monthlyData,
        maxWinStreak,
        maxLossStreak,
        largestWin: Math.max(...systemTrades.map((t) => t.expectedR || 0), 0),
        largestLoss: Math.min(...systemTrades.map((t) => t.expectedR || 0), 0),
      }
    })
    .filter(Boolean)

  const chartConfig = {
    totalExpectedR: { label: "Total Expected R", color: "hsl(var(--chart-1))" },
    avgExpectedR: { label: "Avg Expected R", color: "hsl(var(--chart-2))" },
    winRate: { label: "Win Rate", color: "hsl(var(--chart-3))" },
    totalPnL: { label: "Total P&L", color: "hsl(var(--chart-4))" },
    trades: { label: "Trades", color: "hsl(var(--chart-5))" },
  }

  if (systemStats.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No System Data Available</h3>
        <p className="text-muted-foreground">Add trades to see system-specific reports</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* System Selector */}
      <Card>
        <CardHeader>
          <CardTitle>System Analysis</CardTitle>
          <CardDescription>Select a system for detailed analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedSystem} onValueChange={setSelectedSystem}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select system" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Systems Comparison</SelectItem>
              {allSystems.map((system) => (
                <SelectItem key={system} value={system}>
                  {system}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedSystem !== "all" ? (
        // Detailed Single System Analysis
        systemStats.map((stats) => (
          <div key={stats.system} className="space-y-6">
            {/* System Header */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Award className="h-6 w-6 text-blue-600" />
                  {stats.system} System Report
                </CardTitle>
                <CardDescription>Comprehensive analysis of {stats.totalTrades} trades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{stats.totalTrades}</div>
                    <div className="text-sm text-muted-foreground">Total Trades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.winRate.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold ${stats.expectedValue >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {stats.expectedValue.toFixed(2)}R
                    </div>
                    <div className="text-sm text-muted-foreground">Expected Value (EV)</div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold ${stats.avgExpectedR >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {stats.avgExpectedR.toFixed(2)}R
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Expected R</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${stats.totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${stats.totalPnL.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total P&L</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{stats.riskManagementScore.toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Risk Mgmt</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expected Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stats.expectedValue >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {stats.expectedValue.toFixed(3)}R
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Avg Win: {stats.avgWin.toFixed(2)}R | Avg Loss: {stats.avgLoss.toFixed(2)}R
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
                  <Target className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.maxWinStreak}</div>
                  <p className="text-xs text-muted-foreground">Max Loss Streak: {stats.maxLossStreak}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Largest Win</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.largestWin.toFixed(2)}R</div>
                  <p className="text-xs text-muted-foreground">Best single trade (Expected R)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Largest Loss</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.largestLoss.toFixed(2)}R</div>
                  <p className="text-xs text-muted-foreground">Worst single trade (Expected R)</p>
                </CardContent>
              </Card>
            </div>

            {/* Risk Management Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Management Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">{stats.goodRiskTrades}</div>
                    <div className="text-sm text-muted-foreground">Good Risk Trades</div>
                    <div className="text-xs text-green-600">
                      {((stats.goodRiskTrades / stats.totalTrades) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-red-600">{stats.overRiskedTrades}</div>
                    <div className="text-sm text-muted-foreground">Over-Risked</div>
                    <div className="text-xs text-red-600">
                      {((stats.overRiskedTrades / stats.totalTrades) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600">{stats.underRiskedTrades}</div>
                    <div className="text-sm text-muted-foreground">Under-Risked</div>
                    <div className="text-xs text-orange-600">
                      {((stats.underRiskedTrades / stats.totalTrades) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Risk Management Score:</span>
                    <span
                      className={`text-xl font-bold ${stats.riskManagementScore >= 80 ? "text-green-600" : stats.riskManagementScore >= 60 ? "text-yellow-600" : "text-red-600"}`}
                    >
                      {stats.riskManagementScore.toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Total Risk: ${stats.totalRisk.toFixed(2)} | Ideal Risk: ${stats.totalIdealRisk.toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Trade Quality Distribution</CardTitle>
                <CardDescription>Breakdown of trade grades for {stats.system}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                  {Object.entries(stats.gradeDistribution)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([grade, count]) => (
                      <div key={grade} className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-sm text-muted-foreground">Grade {grade}</div>
                        <div className="text-xs text-muted-foreground">
                          {((count / stats.totalTrades) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Quality Score (A grades):</span>
                    <span
                      className={`text-xl font-bold ${stats.qualityScore >= 70 ? "text-green-600" : stats.qualityScore >= 50 ? "text-yellow-600" : "text-red-600"}`}
                    >
                      {stats.qualityScore.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best Performing Contexts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Best Timeframe</CardTitle>
                  <CardDescription>Most profitable timeframe for {stats.system}</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.bestTimeframe ? (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{stats.bestTimeframe.timeframe}</div>
                      <div className="text-lg text-muted-foreground">
                        {stats.bestTimeframe.avgExpectedR.toFixed(2)}R average
                      </div>
                      <div className="text-sm text-muted-foreground">{stats.bestTimeframe.trades} trades</div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">No timeframe data</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Best Session</CardTitle>
                  <CardDescription>Most profitable session for {stats.system}</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.bestSession ? (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{stats.bestSession.session}</div>
                      <div className="text-lg text-muted-foreground">
                        {stats.bestSession.avgExpectedR.toFixed(2)}R average
                      </div>
                      <div className="text-sm text-muted-foreground">{stats.bestSession.trades} trades</div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">No session data</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Monthly Performance Chart */}
            {stats.monthlyData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Monthly Performance - {stats.system}
                  </CardTitle>
                  <CardDescription>Expected R performance by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full overflow-hidden">
                    <BarChart data={stats.monthlyData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="totalExpectedR" fill="var(--color-totalExpectedR)" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Timeframe Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Timeframe Analysis - {stats.system}</CardTitle>
                <CardDescription>Performance breakdown by timeframe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.timeframeStats).map(([timeframe, data]) => (
                    <div key={timeframe} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{timeframe}</h4>
                        <p className="text-sm text-muted-foreground">{data.trades} trades</p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-bold ${(data.totalExpectedR / data.trades) >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {(data.totalExpectedR / data.trades).toFixed(2)}R
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {((data.wins / data.trades) * 100).toFixed(1)}% WR
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Session Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Session Analysis - {stats.system}</CardTitle>
                <CardDescription>Performance breakdown by trading session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.sessionStats).map(([session, data]) => (
                    <div key={session} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{session}</h4>
                        <p className="text-sm text-muted-foreground">{data.trades} trades</p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-bold ${(data.totalExpectedR / data.trades) >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {(data.totalExpectedR / data.trades).toFixed(2)}R
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {((data.wins / data.trades) * 100).toFixed(1)}% WR
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))
      ) : (
        // System Comparison View
        <Card>
          <CardHeader>
            <CardTitle>System Comparison</CardTitle>
            <CardDescription>Compare Expected Value (EV) and performance across all systems</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full overflow-hidden">
              <BarChart data={systemStats}>
                <XAxis dataKey="system" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="avgExpectedR" fill="var(--color-avgExpectedR)" />
              </BarChart>
            </ChartContainer>

            <div className="mt-6 space-y-4">
              {systemStats.map((stats) => (
                <div key={stats.system} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{stats.system}</h4>
                    <p className="text-sm text-muted-foreground">{stats.totalTrades} trades</p>
                  </div>
                  <div className="grid grid-cols-4 gap-8 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground">EV</div>
                      <div className={`font-bold ${stats.expectedValue >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {stats.expectedValue.toFixed(3)}R
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                      <div className="font-bold">{stats.winRate.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Expected R</div>
                      <div className={`font-bold ${stats.totalExpectedR >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {stats.totalExpectedR.toFixed(1)}R
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Risk Mgmt</div>
                      <div className="font-bold">{stats.riskManagementScore.toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
