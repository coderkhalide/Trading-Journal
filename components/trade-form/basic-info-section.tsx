"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BasicInfoSectionProps {
  formData: {
    date: string
    time: string
    asset: string
    ticket: string
  }
  onChange: (field: string, value: string) => void
  availableAssets: string[]
}

export function BasicInfoSection({ formData, onChange, availableAssets }: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => onChange("date", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => onChange("time", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="asset">Asset</Label>
          <Select
            value={formData.asset || "placeholder"}
            onValueChange={(value) => onChange("asset", value === "placeholder" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="placeholder" disabled>
                Select asset
              </SelectItem>
              {availableAssets.map((asset) => (
                <SelectItem key={asset} value={asset}>
                  {asset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="ticket">Ticket (Optional)</Label>
          <Input
            id="ticket"
            placeholder="Broker ticket ID"
            value={formData.ticket}
            onChange={(e) => onChange("ticket", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
