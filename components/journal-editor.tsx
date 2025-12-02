"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  Eye,
  Edit,
  Hash,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  Brain,
} from "lucide-react"
import ReactMarkdown from "react-markdown"

interface JournalEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const TEMPLATES = {
  analysis: `## Trade Analysis

### Setup
- **Pattern**: 
- **Confluence**: 
- **Risk/Reward**: 

### Execution
- **Entry Reason**: 
- **Exit Strategy**: 
- **Position Size Logic**: 

### Outcome
- **What Worked**: 
- **What Didn't**: 
- **Lessons Learned**: `,

  emotions: `## Emotional State

### Before Trade
- **Mindset**: 
- **Confidence Level**: 
- **External Factors**: 

### During Trade
- **Stress Level**: 
- **Decision Making**: 
- **Discipline**: 

### After Trade
- **Satisfaction**: 
- **Regrets**: 
- **Next Steps**: `,

  market: `## Market Conditions

### Technical Environment
- **Trend**: 
- **Volatility**: 
- **Key Levels**: 

### Fundamental Backdrop
- **News Events**: 
- **Economic Data**: 
- **Market Sentiment**: 

### Session Characteristics
- **Volume**: 
- **Liquidity**: 
- **Typical Behavior**: `,
}

const QUICK_TAGS = [
  { label: "Confident", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  { label: "Uncertain", icon: AlertTriangle, color: "bg-yellow-100 text-yellow-800" },
  { label: "FOMO", icon: TrendingUp, color: "bg-red-100 text-red-800" },
  { label: "Patient", icon: Target, color: "bg-blue-100 text-blue-800" },
  { label: "Disciplined", icon: Brain, color: "bg-purple-100 text-purple-800" },
  { label: "Rushed", icon: TrendingDown, color: "bg-orange-100 text-orange-800" },
]

export function JournalEditor({ value, onChange, placeholder }: JournalEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")

  const insertText = (before: string, after = "", placeholder = "") => {
    const textarea = document.getElementById("journal-textarea") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const textToInsert = selectedText || placeholder

    const newValue = value.substring(0, start) + before + textToInsert + after + value.substring(end)
    onChange(newValue)

    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }

  const insertTemplate = (template: string) => {
    const newValue = value + (value ? "\n\n" : "") + template
    onChange(newValue)
  }

  const insertQuickTag = (tag: string) => {
    const tagText = `**${tag}**: `
    const newValue = value + (value ? "\n" : "") + tagText
    onChange(newValue)
  }

  const insertLink = () => {
    const url = prompt("Enter URL:")
    if (url) {
      insertText("[", `](${url})`, "Link text")
    }
  }

  const insertImage = () => {
    const url = prompt("Enter image URL:")
    if (url) {
      insertText("![", `](${url})`, "Alt text")
    }
  }

  return (
    <div className="space-y-4">
      <Label>Trade Journal & Notes</Label>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="edit" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Quick Templates */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertTemplate(TEMPLATES.analysis)}
              className="text-xs"
            >
              Analysis
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertTemplate(TEMPLATES.emotions)}
              className="text-xs"
            >
              Emotions
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertTemplate(TEMPLATES.market)}
              className="text-xs"
            >
              Market
            </Button>
          </div>
        </div>

        <TabsContent value="edit" className="space-y-4">
          {/* Formatting Toolbar */}
          <Card>
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-1">
                {/* Text Formatting */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText("# ", "", "Heading")}
                  title="Heading"
                >
                  <Hash className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText("**", "**", "bold text")}
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText("*", "*", "italic text")}
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText("~~", "~~", "strikethrough")}
                  title="Strikethrough"
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText("`", "`", "code")}
                  title="Code"
                >
                  <Code className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6" />

                {/* Lists and Quotes */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText("> ", "", "quote")}
                  title="Quote"
                >
                  <Quote className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText("- ", "", "list item")}
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText("1. ", "", "list item")}
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6" />

                {/* Links and Images */}
                <Button type="button" variant="ghost" size="sm" onClick={insertLink} title="Insert Link">
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={insertImage} title="Insert Image">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Emotional Tags */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Quick Emotional Tags</Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => (
                <Button
                  key={tag.label}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertQuickTag(tag.label)}
                  className="gap-1 h-7 text-xs"
                >
                  <tag.icon className="h-3 w-3" />
                  {tag.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <Textarea
            id="journal-textarea"
            placeholder={
              placeholder || "Document your trade analysis, emotions, market conditions, and lessons learned..."
            }
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={12}
            className="font-mono text-sm resize-none"
          />

          <div className="text-xs text-muted-foreground">
            Supports Markdown formatting. Use the toolbar above or type markdown directly.
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardContent className="p-4">
              {value ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      img: ({ src, alt }) => (
                        <img
                          src={src || "/placeholder.svg"}
                          alt={alt}
                          className="max-w-full h-auto rounded-lg border"
                        />
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {value}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-muted-foreground italic">
                  No content to preview. Switch to Edit tab to add content.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
