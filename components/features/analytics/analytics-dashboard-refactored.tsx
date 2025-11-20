"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, LineChart, Line } from "recharts"
import type { Trade, TradeStats, Settings } from "@/types/trade"
import { TrendingUp, TrendingDown, Target, BarChart3 } from "lucide-react"

interface AnalyticsDashboardProps {
  trades: Trade[]
  stats: TradeStats
  settings: Settings
}

export function AnalyticsDashboard({ trades, stats, settings }: AnalyticsDashboardProps) {
  // Prepare data for charts
  const rMultipleDistribution = trades.reduce(
    (acc, trade) => {
      const bucket = Math.floor(trade.rMultiple)
      const key = bucket >= 3 ? "3+" : bucket <= -3 ? "-3+" : bucket.toString()
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const rDistributionData = Object.entries(rMultipleDistribution)
    .map(([range, count]) => ({ range: `${range}R`, count }))
    .sort((a, b) => {
      const aNum = a.range === "3+R" ? 3 : a.range === "-3+R" ? -3 : Number.parseInt(a.range)
      const bNum = b.range === "3+R" ? 3 : b.range === "-3+R" ? -3 : Number.parseInt(b.range)
      return aNum - bNum
    })

  // System performance
  const systemStats = trades.reduce(
    (acc, trade) => {
      if (!acc[trade.system]) {
        acc[trade.system] = { trades: 0, totalR: 0, wins: 0 }
      }
      acc[trade.system].trades++
      acc[trade.system].totalR += trade.rMultiple
      if (trade.rMultiple > 0) acc[trade.system].wins++
      return acc
    },
    {} as Record<string, { trades: number; totalR: number; wins: number }>,
  )

  const systemPerformanceData = Object.entries(systemStats)
    .map(([system, data]) => ({
      system,
      avgR: data.totalR / data.trades,
      winRate: (data.wins / data.trades) * 100,
      trades: data.trades,
    }))
    .sort((a, b) => b.avgR - a.avgR)

  // Timeframe performance
  const timeframeStats = trades.reduce(
    (acc, trade) => {
      if (!acc[trade.timeframe]) {
        acc[trade.timeframe] = { trades: 0, totalR: 0, wins: 0 }
      }
      acc[trade.timeframe].trades++
      acc[trade.timeframe].totalR += trade.rMultiple
      if (trade.rMultiple > 0) acc[trade.timeframe].wins++
      return acc
    },
    {} as Record<string, { trades: number; totalR: number; wins: number }>,
  )

  const timeframePerformanceData = Object.entries(timeframeStats).map(([timeframe, data]) => ({
    timeframe,
    avgR: data.totalR / data.trades,
    winRate: (data.wins / data.trades) * 100,
    trades: data.trades,
  }))

  // Expected R equity curve data
  const expectedREquityCurveData = trades
    .sort((a, b) => new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime())
    .reduce(
      (acc, trade, index) => {
        const prevEquity = index === 0 ? 0 : acc[index - 1].equity
        const expectedR = trade.expectedR || 0
        acc.push({
          trade: index + 1,
          equity: prevEquity + expectedR,
          date: trade.date,
        })
        return acc
      },
      [] as { trade: number; equity: number; date: string }[],
    )

  // Account balance growth data - shows progression from initial balance
  const sortedTrades = trades.sort((a, b) => new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime())
  const accountBalanceData = sortedTrades.reduce(
    (acc, trade, index) => {
      const prevBalance = index === 0 ? settings.accountBalance : acc[index - 1].balance
      const newBalance = prevBalance + trade.pnl
      acc.push({
        trade: index + 1,
        balance: newBalance,
        date: trade.date,
      })
      return acc
    },
    [] as { trade: number; balance: number; date: string }[],
  )

  // Monthly performance
  const monthlyStats = trades.reduce(
    (acc, trade) => {
      const month = trade.date.substring(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { trades: 0, totalR: 0, pnl: 0 }
      }
      acc[month].trades++
      acc[month].totalR += trade.rMultiple
      acc[month].pnl += trade.pnl
      return acc
    },
    {} as Record<string, { trades: number; totalR: number; pnl: number }>,
  )

  const monthlyData = Object.entries(monthlyStats)
    .map(([month, data]) => ({
      month,
      totalR: data.totalR,
      pnl: data.pnl,
      trades: data.trades,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  const chartConfig = {
    count: {
      label: "Count",
      color: "hsl(var(--chart-1))",
    },
    avgR: {
      label: "Avg R",
      color: "hsl(var(--chart-2))",
    },
    winRate: {
      label: "Win Rate",
      color: "hsl(var(--chart-3))",
    },
    equity: {
      label: "Expected R",
      color: "hsl(var(--chart-4))",
    },
    balance: {
      label: "Account Balance",
      color: "hsl(var(--chart-5))",
    },
    totalR: {
      label: "Total R",
      color: "hsl(var(--chart-1))",
    },
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No Data Available</h3>
        <p className="text-muted-foreground">Add some trades to see your analytics dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Advanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.profitFactor === Number.POSITIVE_INFINITY ? "∞" : stats.profitFactor.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Gross Profit / Gross Loss</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expectancy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.expectancy >= 0 ? "text-green-600" : "text-red-600"}`}>
              {stats.expectancy.toFixed(2)}R
            </div>
            <p className="text-xs text-muted-foreground">Average R per trade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Largest Win</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.largestWin.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Best single trade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Largest Loss</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${stats.largestLoss.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Worst single trade</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Charts - Responsive Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Expected R Equity Curve */}
        <Card>
          <CardHeader>
            <CardTitle>Equity Curve (Expected R)</CardTitle>
            <CardDescription>Your cumulative Expected R performance over time</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full overflow-hidden">
              <LineChart data={expectedREquityCurveData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="trade" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="equity" stroke="var(--color-equity)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Account Balance Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Account Balance Growth</CardTitle>
            <CardDescription>Your account balance progression over time</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full overflow-hidden">
              <LineChart data={accountBalanceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="trade" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="balance" stroke="var(--color-balance)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Charts - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* R-Multiple Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>R-Multiple Distribution</CardTitle>
            <CardDescription>How your trades are distributed across R-multiples</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full overflow-hidden">
              <BarChart data={rDistributionData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="range" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>Average R-multiple by trading system</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full overflow-hidden">
              <BarChart data={systemPerformanceData} layout="horizontal" margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  dataKey="system" 
                  type="category" 
                  width={80} 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="avgR" fill="var(--color-avgR)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card className="md:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Total R-multiple by month</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full overflow-hidden">
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 60 }}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="totalR" fill="var(--color-totalR)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tables - Responsive Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* System Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>System Breakdown</CardTitle>
            <CardDescription>Performance metrics by trading system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {systemPerformanceData.map((system) => (
                <div key={system.system} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium truncate">{system.system}</h4>
                    <p className="text-sm text-muted-foreground">{system.trades} trades</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className={`font-bold ${system.avgR >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {system.avgR.toFixed(2)}R
                    </div>
                    <div className="text-sm text-muted-foreground">{system.winRate.toFixed(1)}% WR</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeframe Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Timeframe Analysis</CardTitle>
            <CardDescription>Performance across different timeframes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {timeframePerformanceData.map((tf) => (
                <div key={tf.timeframe} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium truncate">{tf.timeframe}</h4>
                    <p className="text-sm text-muted-foreground">{tf.trades} trades</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className={`font-bold ${tf.avgR >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {tf.avgR.toFixed(2)}R
                    </div>
                    <div className="text-sm text-muted-foreground">{tf.winRate.toFixed(1)}% WR</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
