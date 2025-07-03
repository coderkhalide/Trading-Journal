"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Settings } from "@/types/trade"
import { useRiskManagement } from "@/hooks/use-risk-management"
import { RiskModeToggle } from "./risk-mode-toggle"
import { RiskInputFields } from "./risk-input-fields"
import { RiskStatusDisplay } from "./risk-status-display"
import { RiskAnalysisDisplay } from "./risk-analysis-display"
import { RiskWarnings } from "./risk-warnings"

interface RiskManagementSectionProps {
  formData: {
    system: string
    grade: string
    idealRiskAmount: number
    riskAmount: number
    fee: number
    actualRiskAmount: number
    riskDeviation: number
    expectedR: number
    isOverRisked: boolean
    isUnderRisked: boolean
    rMultiple?: number
  }
  onChange: (field: string, value: number) => void
  settings: Settings
  baseIdealRisk?: number
  onApplyRiskMode?: () => void
  onToggleStateChange?: (useGradeAdjusted: boolean, applyFunction: () => void) => void
}

export function RiskManagementSection({ 
  formData, 
  onChange, 
  settings, 
  baseIdealRisk = 100, 
  onApplyRiskMode, 
  onToggleStateChange 
}: RiskManagementSectionProps) {
  const {
    useGradeAdjustedRisk,
    setUseGradeAdjustedRisk,
    gradeMultiplier,
    systemBaseRisk,
    gradeAdjustedIdealRisk,
    applySelectedRiskMode,
  } = useRiskManagement({
    formData,
    settings,
    baseIdealRisk,
    onChange,
    onApplyRiskMode,
    onToggleStateChange,
  })

  const hasGradeAndSystem = Boolean(formData.grade && formData.system)
  const rMultiple = formData.rMultiple || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Risk Management</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Mode Toggle */}
        <RiskModeToggle
          useGradeAdjustedRisk={useGradeAdjustedRisk}
          onToggleChange={setUseGradeAdjustedRisk}
          onApply={applySelectedRiskMode}
          gradeMultiplier={gradeMultiplier}
          gradeAdjustedIdealRisk={gradeAdjustedIdealRisk}
          systemBaseRisk={systemBaseRisk}
          hasGradeAndSystem={hasGradeAndSystem}
        />

        {/* Risk Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <RiskInputFields
              formData={formData}
              onChange={onChange}
            />
          </div>
          <div>
            <RiskStatusDisplay
              isOverRisked={formData.isOverRisked}
              isUnderRisked={formData.isUnderRisked}
              riskDeviation={formData.riskDeviation}
            />
          </div>
        </div>

        {/* Risk Analysis */}
        <RiskAnalysisDisplay
          idealRiskAmount={formData.idealRiskAmount}
          expectedR={formData.expectedR}
          rMultiple={rMultiple}
        />

        {/* Risk Warnings */}
        <RiskWarnings
          isOverRisked={formData.isOverRisked}
          isUnderRisked={formData.isUnderRisked}
          riskDeviation={formData.riskDeviation}
        />
      </CardContent>
    </Card>
  )
}
