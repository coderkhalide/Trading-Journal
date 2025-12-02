"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface TagsSectionProps {
  selectedTags: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
}

const COMMON_TAGS = [
  "Perfect Setup",
  "Impulsive",
  "News Impact",
  "FOMO",
  "Revenge Trade",
  "Disciplined",
  "Early Exit",
  "Late Entry",
  "Oversize",
  "Undersize",
]

export function TagsSection({ selectedTags, onAddTag, onRemoveTag }: TagsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Tags</h3>
      <div>
        <Label>Common Tags</Label>
        <div className="flex flex-wrap gap-2 mt-2 mb-3">
          {COMMON_TAGS.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => (selectedTags.includes(tag) ? onRemoveTag(tag) : onAddTag(tag))}
            >
              {tag}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onRemoveTag(tag)} />
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
