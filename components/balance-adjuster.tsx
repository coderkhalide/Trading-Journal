"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { X, DollarSign, Plus, Minus, Trash2 } from "lucide-react"

// Import the type from the main types file
import type { BalanceAdjustment } from "@/types/trade"

interface BalanceAdjusterProps {
  currentBalance: number
  adjustments: BalanceAdjustment[]
  onAddAdjustment: (adjustment: Omit<BalanceAdjustment, "id">) => void
  onDeleteAdjustment: (id: string) => void
  onCancel: () => void
}

const COMMON_REASONS = [
  "Missing trade data",
  "Broker fee adjustment",
  "Swap/rollover charges",
  "Deposit",
  "Withdrawal",
  "Interest earned",
  "Correction",
  "Other",
]

export function BalanceAdjuster({ currentBalance, adjustments, onAddAdjustment, onDeleteAdjustment, onCancel }: BalanceAdjusterProps) {
  const [formData, setFormData] = useState({
    amount: 0,
    reason: "",
    type: "add" as "add" | "subtract",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.amount <= 0) return

    const adjustment: Omit<BalanceAdjustment, "id"> = {
      amount: formData.amount,
      reason: formData.reason || "Manual adjustment",
      type: formData.type,
      date: formData.date,
      time: formData.time,
      notes: formData.notes,
    }

    onAddAdjustment(adjustment)
    
    // Reset form after successful submission
    setFormData({
      amount: 0,
      reason: "",
      type: "add",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      notes: "",
    })
  }

  const newBalance = formData.type === "add" ? currentBalance + formData.amount : currentBalance - formData.amount

  // Calculate total adjustments
  const totalAdjustments = adjustments.reduce((sum, adj) => {
    return adj.type === "add" ? sum + adj.amount : sum - adj.amount
  }, 0)

  const baseBalance = currentBalance - totalAdjustments

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Balance Adjuster
              </CardTitle>
              <CardDescription>Manually adjust your account balance to match your broker</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Side - Add New Adjustment */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Add New Adjustment</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current Balance Display */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Balance:</span>
                      <span className="font-medium">${baseBalance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Adjustments:</span>
                      <span className={`font-medium ${totalAdjustments >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ${totalAdjustments >= 0 ? "+" : ""}${totalAdjustments.toFixed(2)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Balance:</span>
                      <span className="text-lg font-bold">${currentBalance.toFixed(2)}</span>
                    </div>
                    {formData.amount > 0 && (
                      <>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">New Balance:</span>
                          <span
                            className={`text-lg font-bold ${newBalance >= currentBalance ? "text-green-600" : "text-red-600"}`}
                          >
                            ${newBalance.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Adjustment Type */}
                <div>
                  <Label>Adjustment Type</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={formData.type === "add" ? "default" : "outline"}
                      onClick={() => setFormData((prev) => ({ ...prev, type: "add" }))}
                      className="flex-1 gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add to Balance
                    </Button>
                    <Button
                      type="button"
                      variant={formData.type === "subtract" ? "destructive" : "outline"}
                      onClick={() => setFormData((prev) => ({ ...prev, type: "subtract" }))}
                      className="flex-1 gap-2"
                    >
                      <Minus className="h-4 w-4" />
                      Subtract from Balance
                    </Button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                    placeholder="Enter adjustment amount"
                    required
                  />
                </div>

                {/* Reason */}
                <div>
                  <Label>Reason for Adjustment</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {COMMON_REASONS.map((reason) => (
                      <Button
                        key={reason}
                        type="button"
                        variant={formData.reason === reason ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData((prev) => ({ ...prev, reason }))}
                      >
                        {reason}
                      </Button>
                    ))}
                  </div>
                  {formData.reason && (
                    <Badge variant="secondary" className="gap-1">
                      {formData.reason}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setFormData((prev) => ({ ...prev, reason: "" }))}
                      />
                    </Badge>
                  )}
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional details about this adjustment..."
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1" disabled={formData.amount <= 0}>
                    Apply Adjustment
                  </Button>
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Side - Existing Adjustments */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Balance History ({adjustments.length})</h3>
              
              {adjustments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No balance adjustments yet</p>
                  <p className="text-sm">Add your first adjustment to the left</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {adjustments
                      .sort((a, b) => {
                        const dateTimeA = new Date(`${a.date} ${a.time}`)
                        const dateTimeB = new Date(`${b.date} ${b.time}`)
                        return dateTimeB.getTime() - dateTimeA.getTime()
                      })
                      .map((adjustment) => (
                        <Card key={adjustment.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant={adjustment.type === "add" ? "default" : "destructive"}
                                  className="gap-1"
                                >
                                  {adjustment.type === "add" ? <Plus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                                  {adjustment.type === "add" ? "+" : "-"}${adjustment.amount.toFixed(2)}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {adjustment.date} at {adjustment.time}
                                </span>
                              </div>
                              <p className="font-medium">{adjustment.reason}</p>
                              {adjustment.notes && (
                                <p className="text-sm text-muted-foreground mt-1">{adjustment.notes}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteAdjustment(adjustment.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
