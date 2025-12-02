import { useEffect, useRef } from 'react'

interface PerformanceEntry {
  name: string
  duration: number
  timestamp: number
}

export function usePerformanceMonitor(componentName: string, enabled = process.env.NODE_ENV === 'development') {
  const startTime = useRef<number>(0)
  const entries = useRef<PerformanceEntry[]>([])

  useEffect(() => {
    if (!enabled) return

    startTime.current = performance.now()
    
    return () => {
      const duration = performance.now() - startTime.current
      const entry: PerformanceEntry = {
        name: componentName,
        duration,
        timestamp: Date.now(),
      }
      
      entries.current.push(entry)
      
      // Log slow renders (> 16ms for 60fps)
      if (duration > 16) {
        console.warn(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`)
      }
      
      // Keep only last 100 entries to prevent memory leaks
      if (entries.current.length > 100) {
        entries.current = entries.current.slice(-100)
      }
    }
  })

  const getPerformanceData = () => entries.current

  const clearPerformanceData = () => {
    entries.current = []
  }

  return { getPerformanceData, clearPerformanceData }
}
