"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getGradeRiskMultiplier, formatGradeWithRisk } from "@/lib/utils"

interface TradeDetailsSectionProps {
  formData: {
    tradeType: "Long" | "Short"
    system: string
    timeframe: string
    grade: string
    idealRiskAmount?: number
  }
  onChange: (field: string, value: string) => void
  tradingSystems: string[]
  grades: string[]
  baseIdealRisk?: number
}

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1D", "1W"]

export function TradeDetailsSection({ formData, onChange, tradingSystems, grades, baseIdealRisk = 100 }: TradeDetailsSectionProps) {
  const gradeMultiplier = formData.grade ? getGradeRiskMultiplier(formData.grade) : 1
  const adjustedIdealRisk = baseIdealRisk * gradeMultiplier

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold">Trade Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="tradeType">Trade Type</Label>
          <Select value={formData.tradeType} onValueChange={(value: "Long" | "Short") => onChange("tradeType", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Long">Long</SelectItem>
              <SelectItem value="Short">Short</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="system">Trading System</Label>
          <Select
            value={formData.system || "placeholder"}
            onValueChange={(value) => onChange("system", value === "placeholder" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select system" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              <SelectItem value="placeholder" disabled>
                Select system
              </SelectItem>
              {tradingSystems.map((system) => (
                <SelectItem key={system} value={system}>
                  {system}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="timeframe">Timeframe</Label>
          <Select
            value={formData.timeframe || "placeholder"}
            onValueChange={(value) => onChange("timeframe", value === "placeholder" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="placeholder" disabled>
                Select timeframe
              </SelectItem>
              {TIMEFRAMES.map((tf) => (
                <SelectItem key={tf} value={tf}>
                  {tf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="grade">Grade</Label>
          <Select
            value={formData.grade || "placeholder"}
            onValueChange={(value) => onChange("grade", value === "placeholder" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              <SelectItem value="placeholder" disabled>
                Select grade
              </SelectItem>
              {grades.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {formatGradeWithRisk(grade)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grade-based Risk Display */}
      {formData.grade && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-blue-800">Grade: {formData.grade}</p>
                <Badge 
                  variant={gradeMultiplier >= 1 ? "default" : "secondary"}
                  className={gradeMultiplier >= 1 ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                >
                  {gradeMultiplier}x multiplier
                </Badge>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Adjusted ideal risk: ${adjustedIdealRisk.toFixed(2)} (Base: ${baseIdealRisk})
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
