import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { APP_CONFIG } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate the ideal risk amount based on grade
 * A+ is the baseline (1.0), other grades are multiplied accordingly
 */
export function calculateGradeAdjustedRisk(
  baseIdealRisk: number,
  grade: string
): number {
  const multipliers = APP_CONFIG.TRADING.GRADE_RISK_MULTIPLIERS as Record<string, number>;
  const multiplier = multipliers[grade] || 1.0;
  return baseIdealRisk * multiplier;
}

/**
 * Get the risk multiplier for a given grade
 */
export function getGradeRiskMultiplier(grade: string): number {
  const multipliers = APP_CONFIG.TRADING.GRADE_RISK_MULTIPLIERS as Record<string, number>;
  return multipliers[grade] || 1.0;
}

/**
 * Format grade display with risk multiplier info
 */
export function formatGradeWithRisk(grade: string): string {
  const multiplier = getGradeRiskMultiplier(grade);
  return `${grade} (${multiplier}x)`;
}

/**
 * Get available grades sorted by risk multiplier (highest to lowest)
 */
export function getGradesOrderedByRisk(): string[] {
  const multipliers = APP_CONFIG.TRADING.GRADE_RISK_MULTIPLIERS as Record<string, number>;
  return Object.entries(multipliers)
    .sort(([, a], [, b]) => b - a)
    .map(([grade]) => grade);
}
