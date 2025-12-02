import type { TradingSession } from "@/types/trade"

export const DEFAULT_TRADING_SESSIONS: TradingSession[] = [
  {
    name: "Day Open",
    startTime: "00:00",
    endTime: "07:00",
    color: "#6366f1", // Indigo
    description: "Early Asian session",
  },
  {
    name: "London",
    startTime: "07:00",
    endTime: "13:00",
    color: "#10b981", // Emerald
    description: "London trading session",
  },
  {
    name: "New York",
    startTime: "13:00",
    endTime: "20:00",
    color: "#f59e0b", // Amber
    description: "New York trading session",
  },
  {
    name: "N/A",
    startTime: "20:00",
    endTime: "23:59",
    color: "#6b7280", // Gray
    description: "Low activity period",
  },
]

export function getTradingSession(time: string, sessions: TradingSession[]): TradingSession {
  // Ensure sessions is a valid array
  const validSessions = Array.isArray(sessions) && sessions.length > 0 ? sessions : DEFAULT_TRADING_SESSIONS
  
  const timeMinutes = timeToMinutes(time)

  for (const session of validSessions) {
    const startMinutes = timeToMinutes(session.startTime)
    const endMinutes = timeToMinutes(session.endTime)

    // Handle sessions that cross midnight
    if (startMinutes > endMinutes) {
      if (timeMinutes >= startMinutes || timeMinutes <= endMinutes) {
        return session
      }
    } else {
      if (timeMinutes >= startMinutes && timeMinutes <= endMinutes) {
        return session
      }
    }
  }

  // Fallback to first session if no match
  return validSessions[0] || DEFAULT_TRADING_SESSIONS[0]
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

export function getDayOfWeek(date: string): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const dateObj = new Date(date + "T00:00:00Z") // Force UTC
  return days[dateObj.getUTCDay()]
}

export function formatSessionTime(session: TradingSession): string {
  return `${session.startTime} - ${session.endTime} UTC`
}
