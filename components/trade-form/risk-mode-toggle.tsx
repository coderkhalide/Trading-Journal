"use client"

import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

interface RiskModeToggleProps {
  useGradeAdjustedRisk: boolean
  onToggleChange: (value: boolean) => void
  onApply: () => void
  gradeMultiplier: number
  gradeAdjustedIdealRisk: number
  systemBaseRisk: number
  hasGradeAndSystem: boolean
}

export function RiskModeToggle({
  useGradeAdjustedRisk,
  onToggleChange,
  onApply,
  gradeMultiplier,
  gradeAdjustedIdealRisk,
  systemBaseRisk,
  hasGradeAndSystem,
}: RiskModeToggleProps) {
  if (!hasGradeAndSystem) return null

  return (
    <div className="space-y-3">
      {/* Toggle Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label htmlFor="risk-mode-switch" className="text-sm">
            {useGradeAdjustedRisk ? "Grade-Adjusted" : "Base System"} Risk
          </Label>
          <Switch
            id="risk-mode-switch"
            checked={useGradeAdjustedRisk}
            onCheckedChange={onToggleChange}
          />
        </div>
        <Button
          type="button"
          onClick={onApply}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700"
        >
          Apply
        </Button>
      </div>

      {/* Risk Mode Info */}
      <div className={`p-3 rounded-lg border ${
        useGradeAdjustedRisk ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center gap-2">
          <Info className={`h-4 w-4 ${
            useGradeAdjustedRisk ? 'text-green-600' : 'text-blue-600'
          }`} />
          <p className={`text-sm font-medium ${
            useGradeAdjustedRisk ? 'text-green-800' : 'text-blue-800'
          }`}>
            Current Mode: {useGradeAdjustedRisk ? 'Grade-Adjusted Risk' : 'Base System Risk'}
          </p>
          {useGradeAdjustedRisk && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {gradeMultiplier}x multiplier
            </Badge>
          )}
        </div>
        <p className={`text-xs mt-1 ${
          useGradeAdjustedRisk ? 'text-green-600' : 'text-blue-600'
        }`}>
          Target risk: ${useGradeAdjustedRisk ? gradeAdjustedIdealRisk.toFixed(2) : systemBaseRisk}
          {useGradeAdjustedRisk && ` (Base: $${systemBaseRisk})`}
        </p>
      </div>
    </div>
  )
}
