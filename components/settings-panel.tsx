"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Target, DollarSign } from "lucide-react"
import type { Settings } from "@/types/trade"
import { SessionSettings } from "./session-settings"
import { DEFAULT_TRADING_SESSIONS } from "@/utils/trading-sessions"

interface SettingsPanelProps {
  settings: Settings
  onSave: (settings: Settings) => void
  onCancel: () => void
}

export function SettingsPanel({ settings, onSave, onCancel }: SettingsPanelProps) {
  const [formData, setFormData] = useState<Settings>({
    ...settings,
    riskDeviationTolerance: settings.riskDeviationTolerance || 10,
    systemIdealRisk: settings.systemIdealRisk || {},
    defaultIdealRisk: settings.defaultIdealRisk || 100,
  })
  const [newAsset, setNewAsset] = useState("")
  const [newFee, setNewFee] = useState("")
  const [newSystem, setNewSystem] = useState("")
  const [newSystemRisk, setNewSystemRisk] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onCancel()
  }

  const addAssetFee = () => {
    if (newAsset && newFee) {
      setFormData((prev) => ({
        ...prev,
        assetFees: {
          ...prev.assetFees,
          [newAsset.toUpperCase()]: Number(newFee),
        },
      }))
      setNewAsset("")
      setNewFee("")
    }
  }

  const removeAssetFee = (asset: string) => {
    setFormData((prev) => {
      const newFees = { ...prev.assetFees }
      delete newFees[asset]
      return {
        ...prev,
        assetFees: newFees,
      }
    })
  }

  const addTradingSystem = () => {
    if (newSystem && !formData.tradingSystems.includes(newSystem)) {
      setFormData((prev) => ({
        ...prev,
        tradingSystems: [...prev.tradingSystems, newSystem],
      }))
      setNewSystem("")
    }
  }

  const removeTradingSystem = (system: string) => {
    setFormData((prev) => ({
      ...prev,
      tradingSystems: prev.tradingSystems.filter((s) => s !== system),
      systemIdealRisk: Object.fromEntries(Object.entries(prev.systemIdealRisk).filter(([key]) => key !== system)),
    }))
  }

  const updateSystemIdealRisk = (system: string, risk: number) => {
    setFormData((prev) => ({
      ...prev,
      systemIdealRisk: {
        ...prev.systemIdealRisk,
        [system]: risk,
      },
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure your account, risk management, and trading systems</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Account Balance */}
            <div>
              <Label htmlFor="accountBalance">Initial Account Balance ($)</Label>
              <Input
                id="accountBalance"
                type="number"
                step="0.01"
                value={formData.accountBalance}
                onChange={(e) => setFormData((prev) => ({ ...prev, accountBalance: Number(e.target.value) }))}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                This is your starting balance for calculating risk percentages
              </p>
            </div>

            {/* Risk Management Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Risk Management
                </CardTitle>
                <CardDescription>Configure risk deviation tolerance and ideal risk amounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="riskTolerance">Risk Deviation Tolerance (%)</Label>
                    <Input
                      id="riskTolerance"
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      value={formData.riskDeviationTolerance}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, riskDeviationTolerance: Number(e.target.value) }))
                      }
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Acceptable deviation from ideal risk (default: 10%)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="defaultIdealRisk">Default Ideal Risk ($)</Label>
                    <Input
                      id="defaultIdealRisk"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.defaultIdealRisk}
                      onChange={(e) => setFormData((prev) => ({ ...prev, defaultIdealRisk: Number(e.target.value) }))}
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">Default 1R amount for new trades</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System-Specific Ideal Risk */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  System-Specific Ideal Risk
                </CardTitle>
                <CardDescription>Set different ideal risk amounts for each trading system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {formData.tradingSystems.map((system) => (
                    <div key={system} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <Label className="font-medium">{system}</Label>
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={`$${formData.defaultIdealRisk}`}
                          value={formData.systemIdealRisk[system] || ""}
                          onChange={(e) => updateSystemIdealRisk(system, Number(e.target.value))}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${formData.systemIdealRisk[system] || formData.defaultIdealRisk} per 1R
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Leave blank to use default ideal risk. Different systems can have different risk amounts based on
                  their characteristics.
                </p>
              </CardContent>
            </Card>

            {/* Asset Fees */}
            <div>
              <Label>Asset Fees</Label>
              <p className="text-sm text-muted-foreground mb-3">Configure fees per lot for different assets</p>

              <div className="flex gap-2 mb-3">
                <Input placeholder="Asset (e.g., BTC)" value={newAsset} onChange={(e) => setNewAsset(e.target.value)} />
                <Input
                  placeholder="Fee per lot"
                  type="number"
                  step="0.01"
                  value={newFee}
                  onChange={(e) => setNewFee(e.target.value)}
                />
                <Button type="button" onClick={addAssetFee}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(formData.assetFees).map(([asset, fee]) => (
                  <Badge key={asset} variant="secondary" className="gap-1">
                    {asset}: ${fee}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeAssetFee(asset)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Trading Systems */}
            <div>
              <Label>Trading Systems</Label>
              <p className="text-sm text-muted-foreground mb-3">Manage your trading systems/strategies</p>

              <div className="flex gap-2 mb-3">
                <Input placeholder="System name" value={newSystem} onChange={(e) => setNewSystem(e.target.value)} />
                <Button type="button" onClick={addTradingSystem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tradingSystems.map((system) => (
                  <Badge key={system} variant="secondary" className="gap-1">
                    {system}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTradingSystem(system)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Trading Sessions */}
            <SessionSettings
              sessions={formData.tradingSessions || DEFAULT_TRADING_SESSIONS}
              onUpdate={(sessions) => setFormData((prev) => ({ ...prev, tradingSessions: sessions }))}
            />

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Save Settings
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
