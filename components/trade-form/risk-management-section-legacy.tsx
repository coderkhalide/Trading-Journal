"use client"

import React from "react"
import type { Settings } from "@/types/trade"
import { RiskManagementSection as RefactoredRiskSection } from "./risk-management-section-refactored"

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
  onApplyRiskMode?: () => void // Optional callback when apply button is clicked
  onToggleStateChange?: (useGradeAdjusted: boolean, applyFunction: () => void) => void // Expose toggle state and apply function
}

export function RiskManagementSection({ 
  formData, 
  onChange, 
  settings, 
  baseIdealRisk = 100, 
  onApplyRiskMode, 
  onToggleStateChange 
}: RiskManagementSectionProps) {
  // Use the refactored component directly - it has the same API
  return (
    <RefactoredRiskSection
      formData={formData}
      onChange={onChange}
      settings={settings}
      baseIdealRisk={baseIdealRisk}
      onApplyRiskMode={onApplyRiskMode}
      onToggleStateChange={onToggleStateChange}
    />
  )
}
