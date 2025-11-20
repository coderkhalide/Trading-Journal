"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getGradeRiskMultiplier, calculateGradeAdjustedRisk } from "@/lib/utils"
import type { Settings } from "@/types/trade"

interface UseRiskManagementProps {
  formData: {
    system: string
    grade: string
    idealRiskAmount: number
  }
  settings: Settings
  baseIdealRisk: number
  onChange: (field: string, value: number) => void
  onApplyRiskMode?: () => void
  onToggleStateChange?: (useGradeAdjusted: boolean, applyFunction: () => void) => void
}

export function useRiskManagement({
  formData,
  settings,
  baseIdealRisk,
  onChange,
  onApplyRiskMode,
  onToggleStateChange,
}: UseRiskManagementProps) {
  const [useGradeAdjustedRisk, setUseGradeAdjustedRisk] = useState(false)
  const lastNotifiedState = useRef<{ useGradeAdjusted: boolean; system: string; grade: string } | null>(null)

  const getIdealRiskForSystem = useCallback((system: string) => {
    return settings.systemIdealRisk?.[system] || settings.defaultIdealRisk || baseIdealRisk
  }, [settings.systemIdealRisk, settings.defaultIdealRisk, baseIdealRisk])

  const gradeMultiplier = formData.grade ? getGradeRiskMultiplier(formData.grade) : 1
  const systemBaseRisk = getIdealRiskForSystem(formData.system)
  const gradeAdjustedIdealRisk = formData.grade 
    ? calculateGradeAdjustedRisk(systemBaseRisk, formData.grade) 
    : systemBaseRisk

  const applySelectedRiskMode = useCallback(() => {
    if (formData.system) {
      const baseRisk = getIdealRiskForSystem(formData.system)
      const targetRisk = useGradeAdjustedRisk && formData.grade 
        ? calculateGradeAdjustedRisk(baseRisk, formData.grade)
        : baseRisk
      
      onChange("idealRiskAmount", targetRisk)
      
      if (onApplyRiskMode) {
        onApplyRiskMode()
      }
    }
  }, [formData.system, formData.grade, useGradeAdjustedRisk, onChange, onApplyRiskMode, getIdealRiskForSystem])

  // Notify parent component when toggle state changes
  useEffect(() => {
    if (onToggleStateChange && formData.grade && formData.system) {
      const currentState = {
        useGradeAdjusted: useGradeAdjustedRisk,
        system: formData.system,
        grade: formData.grade
      }
      
      // Only notify if the state actually changed
      if (!lastNotifiedState.current || 
          lastNotifiedState.current.useGradeAdjusted !== currentState.useGradeAdjusted ||
          lastNotifiedState.current.system !== currentState.system ||
          lastNotifiedState.current.grade !== currentState.grade) {
        
        lastNotifiedState.current = currentState
        onToggleStateChange(useGradeAdjustedRisk, applySelectedRiskMode)
      }
    }
  }, [useGradeAdjustedRisk, formData.grade, formData.system, onToggleStateChange, applySelectedRiskMode])

  return {
    useGradeAdjustedRisk,
    setUseGradeAdjustedRisk,
    gradeMultiplier,
    systemBaseRisk,
    gradeAdjustedIdealRisk,
    applySelectedRiskMode,
  }
}
