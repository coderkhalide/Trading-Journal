"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Clock, Calendar, TrendingUp, Target } from "lucide-react"
import { useState } from "react"
import type { Trade, Settings } from "@/types/trade"
import { getTradingSession, getDayOfWeek } from "@/utils/trading-sessions"

interface SessionAnalyticsProps {
  trades: Trade[]
  settings: Settings
}

export function SessionAnalytics({ trades, settings }: SessionAnalyticsProps) {
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  })

  // Filter trades by date range
  const getFilteredTrades = (start?: string, end?: string) => {
    if (!start && !end) return trades
    return trades.filter((trade) => {
      const tradeDate = new Date(trade.date)
      const startDate = start ? new Date(start) : new Date("1900-01-01")
      const endDate = end ? new Date(end) : new Date("2100-01-01")
      return tradeDate >= startDate && tradeDate <= endDate
    })
  }

  const filteredTrades = getFilteredTrades(dateRange.startDate, dateRange.endDate)

  // Session performance analysis
  const sessionStats = filteredTrades.reduce(
    (acc, trade) => {
      const session = getTradingSession(trade.time, settings.tradingSessions)
      const sessionName = session.name

      if (!acc[sessionName]) {
        acc[sessionName] = {
          name: sessionName,
          trades: 0,
          totalR: 0,
          totalExpectedR: 0,
          totalPnL: 0,
          wins: 0,
          losses: 0,
          color: session.color,
          timeRange: `${session.startTime}-${session.endTime}`,
          overRiskedTrades: 0,
          underRiskedTrades: 0,
          goodRiskTrades: 0,
        }
      }

      acc[sessionName].trades++
      acc[sessionName].totalR += trade.rMultiple
      acc[sessionName].totalExpectedR += trade.expectedR || 0
      acc[sessionName].totalPnL += trade.pnl
      if (trade.rMultiple > 0) acc[sessionName].wins++
      else if (trade.rMultiple < 0) acc[sessionName].losses++

      // Risk management stats
      if (trade.isOverRisked) acc[sessionName].overRiskedTrades++
      else if (trade.isUnderRisked) acc[sessionName].underRiskedTrades++
      else acc[sessionName].goodRiskTrades++

      return acc
    },
    {} as Record<string, any>,
  )

  const sessionData = Object.values(sessionStats).map((session: any) => ({
    ...session,
    winRate: session.trades > 0 ? (session.wins / session.trades) * 100 : 0,
    avgR: session.trades > 0 ? session.totalR / session.trades : 0,
    avgExpectedR: session.trades > 0 ? session.totalExpectedR / session.trades : 0,
    riskManagementRate: session.trades > 0 ? (session.goodRiskTrades / session.trades) * 100 : 0,
  }))

  // Day of week analysis
  const dayStats = filteredTrades.reduce(
    (acc, trade) => {
      const dayOfWeek = getDayOfWeek(trade.date)

      if (!acc[dayOfWeek]) {
        acc[dayOfWeek] = {
          day: dayOfWeek,
          trades: 0,
          totalR: 0,
          totalExpectedR: 0,
          totalPnL: 0,
          wins: 0,
          losses: 0,
          overRiskedTrades: 0,
          underRiskedTrades: 0,
          goodRiskTrades: 0,
        }
      }

      acc[dayOfWeek].trades++
      acc[dayOfWeek].totalR += trade.rMultiple
      acc[dayOfWeek].totalExpectedR += trade.expectedR || 0
      acc[dayOfWeek].totalPnL += trade.pnl
      if (trade.rMultiple > 0) acc[dayOfWeek].wins++
      else if (trade.rMultiple < 0) acc[dayOfWeek].losses++

      // Risk management stats
      if (trade.isOverRisked) acc[dayOfWeek].overRiskedTrades++
      else if (trade.isUnderRisked) acc[dayOfWeek].underRiskedTrades++
      else acc[dayOfWeek].goodRiskTrades++

      return acc
    },
    {} as Record<string, any>,
  )

  const dayData = Object.values(dayStats)
    .map((day: any) => ({
      ...day,
      winRate: day.trades > 0 ? (day.wins / day.trades) * 100 : 0,
      avgR: day.trades > 0 ? day.totalR / day.trades : 0,
      avgExpectedR: day.trades > 0 ? day.totalExpectedR / day.trades : 0,
      riskManagementRate: day.trades > 0 ? (day.goodRiskTrades / day.trades) * 100 : 0,
    }))
    .sort((a, b) => {
      const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
    })

  // Session distribution for pie chart
  const sessionDistribution = sessionData.map((session) => ({
    name: session.name,
    value: session.trades,
    color: session.color,
  }))

  // Best and worst performing sessions/days based on Expected R
  const bestSession = sessionData.reduce(
    (best, current) => (current.avgExpectedR > best.avgExpectedR ? current : best),
    sessionData[0] || { avgExpectedR: 0, name: "N/A" },
  )

  const worstSession = sessionData.reduce(
    (worst, current) => (current.avgExpectedR < worst.avgExpectedR ? current : worst),
    sessionData[0] || { avgExpectedR: 0, name: "N/A" },
  )

  const bestDay = dayData.reduce(
    (best, current) => (current.avgExpectedR > best.avgExpectedR ? current : best),
    dayData[0] || { avgExpectedR: 0, day: "N/A" },
  )

  const worstDay = dayData.reduce(
    (worst, current) => (current.avgExpectedR < worst.avgExpectedR ? current : worst),
    dayData[0] || { avgExpectedR: 0, day: "N/A" },
  )

  const chartConfig = {
    trades: { label: "Trades", color: "hsl(var(--chart-1))" },
    avgExpectedR: { label: "Expected R", color: "hsl(var(--chart-2))" },
    winRate: { label: "Win Rate", color: "hsl(var(--chart-3))" },
    totalPnL: { label: "Total P&L", color: "hsl(var(--chart-4))" },
    riskManagementRate: { label: "Risk Mgmt", color: "hsl(var(--chart-5))" },
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No Session Data Available</h3>
        <p className="text-muted-foreground">Add trades to see session-based analytics</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Session Analysis Period
          </CardTitle>
          <CardDescription>Select date range for session analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionStartDate">Start Date</Label>
              <Input
                id="sessionStartDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="sessionEndDate">End Date</Label>
              <Input
                id="sessionEndDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Analyzing {filteredTrades.length} trades
            {dateRange.startDate && dateRange.endDate && (
              <span>
                {" "}
                from {dateRange.startDate} to {dateRange.endDate}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Session</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{bestSession.name}</div>
            <p className="text-xs text-muted-foreground">
              {bestSession.avgExpectedR?.toFixed(2)}R expected • {bestSession.trades} trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Worst Session</CardTitle>
            <Target className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{worstSession.name}</div>
            <p className="text-xs text-muted-foreground">
              {worstSession.avgExpectedR?.toFixed(2)}R expected • {worstSession.trades} trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Day</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{bestDay.day}</div>
            <p className="text-xs text-muted-foreground">
              {bestDay.avgExpectedR?.toFixed(2)}R expected • {bestDay.trades} trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Worst Day</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{worstDay.day}</div>
            <p className="text-xs text-muted-foreground">
              {worstDay.avgExpectedR?.toFixed(2)}R expected • {worstDay.trades} trades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Session Performance</CardTitle>
            <CardDescription>Expected R by trading session (UTC)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full overflow-hidden">
              <BarChart data={sessionData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis
                  dataKey="name"
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
                <Bar dataKey="avgExpectedR" fill="var(--color-avgExpectedR)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Expected R vs Win Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Expected R vs Win Rate by Session</CardTitle>
            <CardDescription>Comparison of expected performance and win rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full overflow-hidden">
              <BarChart data={sessionData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="avgExpectedR" fill="var(--color-avgExpectedR)" />
                <Bar dataKey="winRate" fill="var(--color-winRate)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Day of Week Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Day of Week Performance</CardTitle>
            <CardDescription>Expected R by day of the week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full overflow-hidden">
              <BarChart data={dayData}>
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="avgExpectedR" fill="var(--color-avgExpectedR)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Session Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Distribution by Session</CardTitle>
            <CardDescription>Number of trades per session</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sessionDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {sessionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Session Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Session Analysis</CardTitle>
          <CardDescription>Comprehensive breakdown of performance by session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessionData.map((session) => (
              <div key={session.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: session.color }} />
                  <div>
                    <h4 className="font-semibold">{session.name}</h4>
                    <p className="text-sm text-muted-foreground">{session.timeRange} UTC</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Trades</div>
                    <div className="font-bold">{session.trades}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Expected R</div>
                    <div className={`font-bold ${session.avgExpectedR >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {session.avgExpectedR.toFixed(2)}R
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                    <div className="font-bold">{session.winRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Risk Mgmt</div>
                    <div className="font-bold">{session.riskManagementRate.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
