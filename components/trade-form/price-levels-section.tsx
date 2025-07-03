"use client"

import { Label } from "@/components/ui/label"
import { PasteInput } from "../paste-input"

interface PriceLevelsSectionProps {
  formData: {
    entryPrice: number
    exitPrice: number
    stopLoss: number
    positionSize: number
  }
  onChange: (field: string, value: number) => void
}

export function PriceLevelsSection({ formData, onChange }: PriceLevelsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Price Levels & Position</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="entryPrice">Entry Price</Label>
          <PasteInput
            id="entryPrice"
            type="number"
            step="0.00001"
            value={formData.entryPrice || ""}
            onChange={(value) => onChange("entryPrice", Number(value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="exitPrice">Exit Price</Label>
          <PasteInput
            id="exitPrice"
            type="number"
            step="0.00001"
            value={formData.exitPrice || ""}
            onChange={(value) => onChange("exitPrice", Number(value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="stopLoss">Stop Loss</Label>
          <PasteInput
            id="stopLoss"
            type="number"
            step="0.00001"
            value={formData.stopLoss || ""}
            onChange={(value) => onChange("stopLoss", Number(value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="positionSize">Position Size</Label>
          <PasteInput
            id="positionSize"
            type="number"
            step="0.001"
            value={formData.positionSize || ""}
            onChange={(value) => onChange("positionSize", Number(value))}
            required
          />
        </div>
      </div>
    </div>
  )
}
