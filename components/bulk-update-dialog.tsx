"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus, Edit3, Calculator } from "lucide-react"
import type { Trade, Settings } from "@/types/trade"

interface BulkUpdateDialogProps {
  selectedTrades: Trade[]
  onUpdate: (updates: Partial<Trade>) => void
  onCancel: () => void
  settings: Settings
}

const GRADES = ["A++++", "A+++", "A++", "A+", "A", "B", "C", "D", "E", "F"]
const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1D", "1W"]

export function BulkUpdateDialog({ selectedTrades, onUpdate, onCancel, settings }: BulkUpdateDialogProps) {
  const [updates, setUpdates] = useState<{
    system?: string
    timeframe?: string
    grade?: string
    idealRiskAmount?: number
    tags?: string[]
    addTags?: string[]
    removeTags?: string[]
    recalculateMetrics?: boolean
  }>({})
  const [newTag, setNewTag] = useState("")
  const [updateFields, setUpdateFields] = useState<{
    system: boolean
    timeframe: boolean
    grade: boolean
    idealRiskAmount: boolean
    tags: boolean
    recalculateMetrics: boolean
  }>({
    system: false,
    timeframe: false,
    grade: false,
    idealRiskAmount: false,
    tags: false,
    recalculateMetrics: false,
  })

  const handleFieldToggle = (field: keyof typeof updateFields) => {
    setUpdateFields((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const addTag = () => {
    if (newTag && !updates.addTags?.includes(newTag)) {
      setUpdates((prev) => ({
        ...prev,
        addTags: [...(prev.addTags || []), newTag],
      }))
      setNewTag("")
    }
  }

  const removeAddTag = (tag: string) => {
    setUpdates((prev) => ({
      ...prev,
      addTags: prev.addTags?.filter((t) => t !== tag) || [],
    }))
  }

  const addRemoveTag = (tag: string) => {
    if (!updates.removeTags?.includes(tag)) {
      setUpdates((prev) => ({
        ...prev,
        removeTags: [...(prev.removeTags || []), tag],
      }))
    }
  }

  const removeRemoveTag = (tag: string) => {
    setUpdates((prev) => ({
      ...prev,
      removeTags: prev.removeTags?.filter((t) => t !== tag) || [],
    }))
  }

  // Get all unique tags from selected trades
  const allTags = [...new Set(selectedTrades.flatMap((trade) => trade.tags))]

  const handleSubmit = () => {
    const finalUpdates: Partial<Trade> = {}

    if (updateFields.system && updates.system) {
      finalUpdates.system = updates.system
    }
    if (updateFields.timeframe && updates.timeframe) {
      finalUpdates.timeframe = updates.timeframe
    }
    if (updateFields.grade && updates.grade) {
      finalUpdates.grade = updates.grade
    }
    if (updateFields.idealRiskAmount && updates.idealRiskAmount) {
      finalUpdates.idealRiskAmount = updates.idealRiskAmount
    }
    if (updateFields.tags) {
      finalUpdates.addTags = updates.addTags || []
      finalUpdates.removeTags = updates.removeTags || []
    }
    if (updateFields.recalculateMetrics) {
      finalUpdates.recalculateMetrics = true
    }

    onUpdate(finalUpdates)
  }

  const getSystemIdealRisk = (system: string) => {
    return settings.systemIdealRisk?.[system] || settings.defaultIdealRisk || 100
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Bulk Update Trades
              </CardTitle>
              <CardDescription>Update {selectedTrades.length} selected trades at once</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* System Update */}
          <div className="flex items-center space-x-4">
            <Checkbox
              id="update-system"
              checked={updateFields.system}
              onCheckedChange={() => handleFieldToggle("system")}
            />
            <div className="flex-1">
              <Label htmlFor="system">Trading System</Label>
              <Select
                value={updates.system || ""}
                onValueChange={(value) => setUpdates((prev) => ({ ...prev, system: value }))}
                disabled={!updateFields.system}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select system" />
                </SelectTrigger>
                <SelectContent>
                  {settings.tradingSystems.map((system) => (
                    <SelectItem key={system} value={system}>
                      {system} (${getSystemIdealRisk(system)} ideal risk)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timeframe Update */}
          <div className="flex items-center space-x-4">
            <Checkbox
              id="update-timeframe"
              checked={updateFields.timeframe}
              onCheckedChange={() => handleFieldToggle("timeframe")}
            />
            <div className="flex-1">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select
                value={updates.timeframe || ""}
                onValueChange={(value) => setUpdates((prev) => ({ ...prev, timeframe: value }))}
                disabled={!updateFields.timeframe}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map((tf) => (
                    <SelectItem key={tf} value={tf}>
                      {tf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grade Update */}
          <div className="flex items-center space-x-4">
            <Checkbox
              id="update-grade"
              checked={updateFields.grade}
              onCheckedChange={() => handleFieldToggle("grade")}
            />
            <div className="flex-1">
              <Label htmlFor="grade">Grade</Label>
              <Select
                value={updates.grade || ""}
                onValueChange={(value) => setUpdates((prev) => ({ ...prev, grade: value }))}
                disabled={!updateFields.grade}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ideal Risk Amount Update */}
          <div className="flex items-center space-x-4">
            <Checkbox
              id="update-ideal-risk"
              checked={updateFields.idealRiskAmount}
              onCheckedChange={() => handleFieldToggle("idealRiskAmount")}
            />
            <div className="flex-1">
              <Label htmlFor="idealRiskAmount">Ideal Risk Amount ($)</Label>
              <Input
                id="idealRiskAmount"
                type="number"
                step="0.01"
                placeholder="Enter ideal risk amount"
                value={updates.idealRiskAmount || ""}
                onChange={(e) => setUpdates((prev) => ({ ...prev, idealRiskAmount: Number(e.target.value) }))}
                disabled={!updateFields.idealRiskAmount}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Set the expected 1R amount for selected trades (can be decimal)
              </p>
            </div>
          </div>

          {/* Recalculate Metrics */}
          <div className="flex items-center space-x-4">
            <Checkbox
              id="recalculate-metrics"
              checked={updateFields.recalculateMetrics}
              onCheckedChange={() => handleFieldToggle("recalculateMetrics")}
            />
            <div className="flex-1">
              <Label htmlFor="recalculate-metrics" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Recalculate Risk Metrics
              </Label>
              <p className="text-sm text-muted-foreground">
                Recalculate Expected R, Risk Deviation, and Risk Status based on current ideal risk amounts
              </p>
            </div>
          </div>

          {/* Tags Update */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Checkbox
                id="update-tags"
                checked={updateFields.tags}
                onCheckedChange={() => handleFieldToggle("tags")}
              />
              <Label htmlFor="update-tags">Update Tags</Label>
            </div>

            {updateFields.tags && (
              <div className="space-y-4 pl-8">
                {/* Add Tags */}
                <div>
                  <Label>Add Tags</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Enter tag name"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {updates.addTags?.map((tag) => (
                      <Badge key={tag} variant="default" className="gap-1">
                        +{tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeAddTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Remove Tags */}
                <div>
                  <Label>Remove Tags</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Click on existing tags to remove them from selected trades
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={updates.removeTags?.includes(tag) ? "destructive" : "outline"}
                        className="cursor-pointer"
                        onClick={() => (updates.removeTags?.includes(tag) ? removeRemoveTag(tag) : addRemoveTag(tag))}
                      >
                        {updates.removeTags?.includes(tag) ? "-" : ""}
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Update Summary</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• {selectedTrades.length} trades will be updated</p>
              {updateFields.system && updates.system && <p>• System will be set to: {updates.system}</p>}
              {updateFields.timeframe && updates.timeframe && <p>• Timeframe will be set to: {updates.timeframe}</p>}
              {updateFields.grade && updates.grade && <p>• Grade will be set to: {updates.grade}</p>}
              {updateFields.idealRiskAmount && updates.idealRiskAmount && (
                <p>• Ideal risk will be set to: ${updates.idealRiskAmount}</p>
              )}
              {updateFields.recalculateMetrics && (
                <p>• Risk metrics will be recalculated (Expected R, Risk Deviation, Risk Status)</p>
              )}
              {updateFields.tags && (
                <>
                  {updates.addTags && updates.addTags.length > 0 && <p>• Tags to add: {updates.addTags.join(", ")}</p>}
                  {updates.removeTags && updates.removeTags.length > 0 && (
                    <p>• Tags to remove: {updates.removeTags.join(", ")}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button onClick={handleSubmit} className="flex-1" disabled={!Object.values(updateFields).some(Boolean)}>
              Update {selectedTrades.length} Trades
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
