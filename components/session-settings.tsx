"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Clock } from "lucide-react"
import type { TradingSession } from "@/types/trade"

interface SessionSettingsProps {
  sessions: TradingSession[]
  onUpdate: (sessions: TradingSession[]) => void
}

const SESSION_COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f97316", // Orange
]

export function SessionSettings({ sessions, onUpdate }: SessionSettingsProps) {
  const [newSession, setNewSession] = useState({
    name: "",
    startTime: "",
    endTime: "",
    color: SESSION_COLORS[0],
    description: "",
  })

  const addSession = () => {
    if (newSession.name && newSession.startTime && newSession.endTime) {
      onUpdate([...sessions, newSession])
      setNewSession({
        name: "",
        startTime: "",
        endTime: "",
        color: SESSION_COLORS[0],
        description: "",
      })
    }
  }

  const removeSession = (index: number) => {
    onUpdate(sessions.filter((_, i) => i !== index))
  }

  const updateSession = (index: number, field: keyof TradingSession, value: string) => {
    const updatedSessions = sessions.map((session, i) => (i === index ? { ...session, [field]: value } : session))
    onUpdate(updatedSessions)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Trading Sessions (UTC)
        </CardTitle>
        <CardDescription>Configure your trading sessions based on UTC timezone</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Sessions */}
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: session.color }} />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input
                  value={session.name}
                  onChange={(e) => updateSession(index, "name", e.target.value)}
                  placeholder="Session name"
                />
                <Input
                  type="time"
                  value={session.startTime}
                  onChange={(e) => updateSession(index, "startTime", e.target.value)}
                />
                <Input
                  type="time"
                  value={session.endTime}
                  onChange={(e) => updateSession(index, "endTime", e.target.value)}
                />
                <Input
                  value={session.description}
                  onChange={(e) => updateSession(index, "description", e.target.value)}
                  placeholder="Description"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSession(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add New Session */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Add New Session</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sessionName">Session Name</Label>
                <Input
                  id="sessionName"
                  value={newSession.name}
                  onChange={(e) => setNewSession((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., London, New York"
                />
              </div>
              <div>
                <Label htmlFor="sessionDescription">Description</Label>
                <Input
                  id="sessionDescription"
                  value={newSession.description}
                  onChange={(e) => setNewSession((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., European trading session"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time (UTC)</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newSession.startTime}
                  onChange={(e) => setNewSession((prev) => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time (UTC)</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newSession.endTime}
                  onChange={(e) => setNewSession((prev) => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-1">
                  {SESSION_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        newSession.color === color ? "border-gray-800" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewSession((prev) => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={addSession} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Session
            </Button>
          </div>
        </div>

        {/* Session Preview */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Session Overview</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {sessions.map((session, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="justify-center p-2"
                style={{ backgroundColor: session.color + "20", color: session.color }}
              >
                {session.name}: {session.startTime}-{session.endTime}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
