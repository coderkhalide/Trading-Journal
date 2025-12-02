"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Clipboard, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasteInputProps {
  id: string
  type?: string
  step?: string
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
}

export function PasteInput({
  id,
  type = "text",
  step,
  value,
  onChange,
  placeholder,
  required,
  className,
}: PasteInputProps) {
  const [justPasted, setJustPasted] = useState(false)

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      onChange(text.trim())
      setJustPasted(true)
      setTimeout(() => setJustPasted(false), 1000)
    } catch (err) {
      console.error("Failed to read clipboard:", err)
    }
  }

  return (
    <div className="relative">
      <Input
        id={id}
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={cn("pr-10", className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full w-10 hover:bg-muted/50"
        onClick={handlePaste}
      >
        {justPasted ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Clipboard className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  )
}
