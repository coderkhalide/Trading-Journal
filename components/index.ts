// ==========================================
// TRADING JOURNAL COMPONENTS - INDEX
// ==========================================
// This file exports the clean, refactored components as primary exports.
// Always import from this index to get the latest, maintained versions.

// ==========================================
// PRIMARY EXPORTS - CLEAN, REFACTORED COMPONENTS
// ==========================================
// These are the main components you should use in your application

export { TradesList } from "./features/trades/trades-list-refactored"
export { AnalyticsDashboard } from "./features/analytics/analytics-dashboard-refactored"
export { RiskManagementSection } from "./trade-form/risk-management-section-refactored"
export { TradeEntryForm } from "./trade-entry-form" // Keep original for now due to complex dependencies

// ==========================================
// MODULAR TRADE COMPONENTS
// ==========================================
// Use these for building custom trade management interfaces

export { TradeTable } from "./features/trades/trade-table"
export { TradeFilters } from "./features/trades/trade-filters"
export { TradeActions } from "./features/trades/trade-actions"

// ==========================================
// SHARED COMPONENTS
// ==========================================
// Reusable components for common UI patterns

export { SortButton } from "./shared/sort-button"
export { PaginationControls } from "./shared/pagination-controls"

// ==========================================
// ANALYTICS COMPONENTS
// ==========================================
// Modular analytics and reporting components

export { StatsCard } from "./features/analytics/stats-card"
export { PerformanceChart } from "./features/analytics/performance-chart"
export { SystemAnalysis } from "./features/analytics/system-analysis"

// ==========================================
// MODULAR TRADE FORM COMPONENTS
// ==========================================
// Use these for building custom trade entry forms

export { RiskModeToggle } from "./trade-form/risk-mode-toggle"
export { RiskInputFields } from "./trade-form/risk-input-fields"
export { RiskStatusDisplay } from "./trade-form/risk-status-display"
export { RiskAnalysisDisplay } from "./trade-form/risk-analysis-display"
export { RiskWarnings } from "./trade-form/risk-warnings"

// ==========================================
// LEGACY EXPORTS - DEPRECATED
// ==========================================
// Old messy components - avoid using these in new development
// These are provided for backward compatibility only

export { TradesList as TradesListLegacy } from "./trades-list-legacy"
export { AnalyticsDashboard as AnalyticsDashboardLegacy } from "./analytics-dashboard-legacy"
export { RiskManagementSection as RiskManagementSectionLegacy } from "./trade-form/risk-management-section-legacy"
