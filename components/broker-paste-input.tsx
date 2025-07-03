"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clipboard, Zap, CheckCircle, AlertCircle } from "lucide-react"

interface BrokerPasteInputProps {
  onParsedData: (data: ParsedBrokerData) => void
}

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

export function BrokerPasteInput({ onParsedData }: BrokerPasteInputProps) {
  const [pasteText, setPasteText] = useState("")
  const [parsedData, setParsedData] = useState<ParsedBrokerData | null>(null)
  const [parseError, setParseError] = useState("")

  const parseBrokerData = (text: string): ParsedBrokerData | null => {
    try {
      const lines = text
        .trim()
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line)

      if (lines.length < 8) {
        throw new Error("Not enough data lines. Expected at least 8 lines.")
      }

      // Extract asset from first line (e.g., "BTC/USD" -> "BTC")
      const assetLine = lines[0]
      const asset = assetLine.replace(/\/USD|\/USDT|\/.*/, "").toUpperCase()

      // Extract trade direction from second line
      const directionLine = lines[1].toLowerCase()
      const tradeType: "Long" | "Short" = directionLine.includes("sell") ? "Short" : "Long"

      // Extract dates and times
      const openDateTime = lines[2] // "01 Jul 09:14:59"
      const closeDateTime = lines[3] // "01 Jul 09:22:58"

      // Parse dates
      const parseDateTime = (dateTimeStr: string) => {
        // Convert "01 Jul 09:14:59" to proper date format
        const parts = dateTimeStr.split(" ")
        if (parts.length < 3) {
          throw new Error(`Invalid date format: ${dateTimeStr}`)
        }

        const [day, month, time] = parts
        const currentYear = new Date().getFullYear()

        const monthMap: Record<string, string> = {
          Jan: "01",
          Feb: "02",
          Mar: "03",
          Apr: "04",
          May: "05",
          Jun: "06",
          Jul: "07",
          Aug: "08",
          Sep: "09",
          Oct: "10",
          Nov: "11",
          Dec: "12",
        }

        const monthNum = monthMap[month] || "01"
        const date = `${currentYear}-${monthNum}-${day.padStart(2, "0")}`
        const timeFormatted = time ? time.substring(0, 5) : "00:00" // HH:MM format

        return { date, time: timeFormatted }
      }

      const openParsed = parseDateTime(openDateTime)
      const closeParsed = parseDateTime(closeDateTime)

      // Extract position size (lot size)
      const positionSize = Number.parseFloat(lines[4])
      if (isNaN(positionSize)) {
        throw new Error(`Invalid position size: ${lines[4]}`)
      }

      // Extract prices
      const entryPrice = Number.parseFloat(lines[5].replace(/,/g, ""))
      const exitPrice = Number.parseFloat(lines[6].replace(/,/g, ""))

      if (isNaN(entryPrice) || isNaN(exitPrice)) {
        throw new Error(`Invalid prices: entry=${lines[5]}, exit=${lines[6]}`)
      }

      // Calculate stop loss based on the trade outcome
      // For now, we'll use the exit price as stop loss for losing trades
      // This will be recalculated properly in the form
      const stopLoss = exitPrice

      // Extract P&L (without fees)
      const pnlLine = lines[7]
      const pnlMatch = pnlLine.match(/[+-]?(\d+\.?\d*)/)
      if (!pnlMatch) {
        throw new Error(`Invalid P&L format: ${pnlLine}`)
      }
      const pnl = Number.parseFloat(pnlMatch[0])

      // Find Position ID (ticket) and Commission
      let ticket = ""
      let fee = 0

      for (let i = 8; i < lines.length; i++) {
        const line = lines[i]

        // Look for Position ID - a line that's just numbers
        if (line.match(/^\d+$/) && !ticket) {
          ticket = line
        }

        // Look for Commission/Fee - look for negative numbers or lines with "Commission"
        if (line.includes("Commission") || line.includes("-")) {
          const nextLine = i + 1 < lines.length ? lines[i + 1] : ""
          const feeMatch = (line + " " + nextLine).match(/-(\d+\.?\d*)/)
          if (feeMatch) {
            fee = Number.parseFloat(feeMatch[1])
          }
        }
      }

      return {
        asset,
        tradeType,
        entryPrice,
        exitPrice,
        stopLoss, // This will be recalculated in the form
        positionSize,
        pnl,
        fee,
        ticket,
        openTime: openParsed.time,
        closeTime: closeParsed.time,
        openDate: openParsed.date,
        closeDate: closeParsed.date,
      }
    } catch (error) {
      console.error("Parse error:", error)
      return null
    }
  }

  const handleParse = () => {
    setParseError("")
    setParsedData(null)

    if (!pasteText.trim()) {
      setParseError("Please paste your broker data first")
      return
    }

    const parsed = parseBrokerData(pasteText)
    if (parsed) {
      setParsedData(parsed)
      setParseError("")
    } else {
      setParseError("Could not parse the broker data. Please check the format and try again.")
    }
  }

  const handleUseData = () => {
    if (parsedData) {
      onParsedData(parsedData)
      // Clear the form after successful use
      setPasteText("")
      setParsedData(null)
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setPasteText(text)
    } catch (err) {
      console.error("Failed to read clipboard:", err)
      setParseError("Failed to read clipboard. Please paste manually.")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Entry from Broker
        </CardTitle>
        <CardDescription>
          Paste your broker trade data to auto-fill the form inputs. This will populate the form fields for you to
          review and adjust before adding the trade.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="broker-paste">Broker Trade Data</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePasteFromClipboard}
              className="gap-1 bg-transparent"
            >
              <Clipboard className="h-3 w-3" />
              Paste from Clipboard
            </Button>
          </div>
          <Textarea
            id="broker-paste"
            placeholder={`Paste your broker data here, for example:

BTC/USD
sell
01 Jul 09:14:59
01 Jul 09:22:58
0.01
106,811.43
106,794.8
+0.16
Position ID
1590998273
Commission, USD
-0.16
Swap, USD
0`}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleParse} disabled={!pasteText.trim()}>
            Parse Data
          </Button>
          {parsedData && (
            <Button onClick={handleUseData} variant="default" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Fill Form with This Data
            </Button>
          )}
        </div>

        {parseError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{parseError}</span>
          </div>
        )}

        {parsedData && (
          <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Data Parsed Successfully</span>
              <span className="text-sm text-green-600">Click "Fill Form with This Data" to populate the form</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Asset</Label>
                <Badge variant="secondary">{parsedData.asset}</Badge>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Direction</Label>
                <Badge variant={parsedData.tradeType === "Long" ? "default" : "destructive"}>
                  {parsedData.tradeType}
                </Badge>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Position Size</Label>
                <div className="text-sm font-mono">{parsedData.positionSize}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Entry Price</Label>
                <div className="text-sm font-mono">${parsedData.entryPrice.toLocaleString()}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Exit Price</Label>
                <div className="text-sm font-mono">${parsedData.exitPrice.toLocaleString()}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">P&L</Label>
                <div className={`text-sm font-mono ${parsedData.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${parsedData.pnl.toFixed(2)}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Fee</Label>
                <div className="text-sm font-mono text-red-600">${parsedData.fee.toFixed(2)}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Ticket</Label>
                <div className="text-sm font-mono">{parsedData.ticket}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Open → Close</Label>
                <div className="text-xs">
                  {parsedData.openDate} {parsedData.openTime}
                  <br />
                  {parsedData.closeDate} {parsedData.closeTime}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
