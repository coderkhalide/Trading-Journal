"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RiskInputFieldsProps {
  formData: {
    idealRiskAmount: number
    actualRiskAmount: number
    riskAmount: number
    fee: number
  }
  onChange: (field: string, value: number) => void
}

export function RiskInputFields({ formData, onChange }: RiskInputFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="idealRiskAmount">Ideal Risk Amount ($)</Label>
        <Input
          id="idealRiskAmount"
          type="number"
          step="0.01"
          value={formData.idealRiskAmount || ""}
          onChange={(e) => onChange("idealRiskAmount", Number(e.target.value))}
          placeholder="Expected risk for this trade"
        />
        <p className="text-xs text-muted-foreground mt-1">
          What you planned to risk (1R equivalent)
        </p>
      </div>

      <div>
        <Label htmlFor="actualRisk">Actual Risk ($)</Label>
        <Input
          id="actualRisk"
          type="number"
          step="0.01"
          value={formData.actualRiskAmount || ""}
          onChange={(e) => onChange("actualRiskAmount", Number(e.target.value))}
          placeholder="Risk + fees"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Risk amount + fees (${formData.riskAmount} + ${formData.fee})
        </p>
      </div>
    </div>
  )
}
