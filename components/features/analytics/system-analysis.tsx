"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import type { Trade } from "@/types/trade"

interface SystemAnalysisProps {
  trades: Trade[]
}

export function SystemAnalysis({ trades }: SystemAnalysisProps) {
  // Calculate system performance
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
    {} as Record<string, { trades: number; totalR: number; wins: number }>
  )

  const systemPerformanceData = Object.entries(systemStats)
    .map(([system, data]) => ({
      system: system.length > 10 ? system.substring(0, 10) + "..." : system,
      avgR: data.totalR / data.trades,
      winRate: (data.wins / data.trades) * 100,
      trades: data.trades,
    }))
    .sort((a, b) => b.avgR - a.avgR)
    .slice(0, 6) // Show top 6 systems

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            avgR: {
              label: "Avg R-Multiple",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={systemPerformanceData}>
              <XAxis dataKey="system" />
              <YAxis />
              <ChartTooltip
                content={<ChartTooltipContent />}
                labelFormatter={(value) => `System: ${value}`}
              />
              <Bar dataKey="avgR" fill="var(--color-avgR)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
