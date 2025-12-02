"use client"

import { Label } from "@/components/ui/label"
import { AlertTriangle, CheckCircle, TrendingDown } from "lucide-react"

interface RiskStatusDisplayProps {
  isOverRisked: boolean
  isUnderRisked: boolean
  riskDeviation: number
}

export function RiskStatusDisplay({ isOverRisked, isUnderRisked, riskDeviation }: RiskStatusDisplayProps) {
  const getRiskStatus = () => {
    if (isOverRisked) {
      return {
        status: "Over-Risked",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: AlertTriangle,
      }
    } else if (isUnderRisked) {
      return {
        status: "Under-Risked",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        icon: TrendingDown,
      }
    } else {
      return {
        status: "Good Risk",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: CheckCircle,
      }
    }
  }

  const riskStatus = getRiskStatus()
  const StatusIcon = riskStatus.icon

  return (
    <div>
      <Label>Risk Deviation</Label>
      <div className={`p-3 rounded-lg border ${riskStatus.bgColor} ${riskStatus.borderColor}`}>
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-4 w-4 ${riskStatus.color}`} />
          <span className={`font-medium ${riskStatus.color}`}>{riskStatus.status}</span>
        </div>
        <p className={`text-sm ${riskStatus.color} mt-1`}>
          {riskDeviation > 0 ? "+" : ""}
          {riskDeviation.toFixed(1)}%
        </p>
      </div>
    </div>
  )
}
