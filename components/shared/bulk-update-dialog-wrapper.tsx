"use client"

import { BulkUpdateDialog as BulkUpdateForm } from "../bulk-update-dialog"
import type { Trade, Settings } from "@/types/trade"

interface BulkUpdateDialogWrapperProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (updates: Partial<Trade>) => void
  selectedTrades: Trade[]
  settings: Settings
}

export function BulkUpdateDialogWrapper({
  open,
  onOpenChange,
  onUpdate,
  selectedTrades,
  settings
}: BulkUpdateDialogWrapperProps) {
  return (
    <BulkUpdateForm
      selectedTrades={selectedTrades}
      onUpdate={onUpdate}
      onCancel={() => onOpenChange(false)}
      settings={settings}
    />
  )
}
