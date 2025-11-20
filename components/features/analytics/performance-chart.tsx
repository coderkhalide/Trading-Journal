"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import type { Trade } from "@/types/trade"

interface PerformanceChartProps {
  trades: Trade[]
}

export function PerformanceChart({ trades }: PerformanceChartProps) {
  // Create equity curve data
  const equityCurveData = trades
    .sort((a, b) => new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime())
    .reduce(
      (acc, trade, index) => {
        const prevEquity = index === 0 ? 0 : acc[index - 1].equity
        acc.push({
          trade: index + 1,
          equity: prevEquity + trade.rMultiple,
          date: trade.date,
        })
        return acc
      },
      [] as { trade: number; equity: number; date: string }[]
    )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equity Curve (R-Multiple)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            equity: {
              label: "Equity",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={equityCurveData}>
              <XAxis dataKey="trade" />
              <YAxis />
              <ChartTooltip
                content={<ChartTooltipContent />}
                labelFormatter={(value) => `Trade ${value}`}
              />
              <Line
                type="monotone"
                dataKey="equity"
                stroke="var(--color-equity)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
