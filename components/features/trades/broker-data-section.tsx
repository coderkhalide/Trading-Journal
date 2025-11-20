"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BrokerPasteInput } from "../../broker-paste-input"

interface ParsedBrokerData {
  asset: string
  tradeType: "Long" | "Short"
  entryPrice: number
  exitPrice: number
  stopLoss: number
  positionSize: number
  pnl: number
  fee: number
  ticket: string
  openTime: string
  closeTime: string
  openDate: string
  closeDate: string
}

interface BrokerDataSectionProps {
  onDataParsed: (data: ParsedBrokerData) => void
}

export function BrokerDataSection({ onDataParsed }: BrokerDataSectionProps) {
  const [showBrokerInput, setShowBrokerInput] = useState(false)

  const handleBrokerDataParsed = (data: ParsedBrokerData) => {
    onDataParsed(data)
    setShowBrokerInput(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quick Import</CardTitle>
          <Button 
            variant="outline" 
            onClick={() => setShowBrokerInput(!showBrokerInput)}
          >
            {showBrokerInput ? "Hide" : "Import from Broker"}
          </Button>
        </div>
      </CardHeader>
      {showBrokerInput && (
        <CardContent>
          <BrokerPasteInput onParsedData={handleBrokerDataParsed} />
        </CardContent>
      )}
    </Card>
  )
}
