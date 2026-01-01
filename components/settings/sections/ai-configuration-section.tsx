"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useSettingsStore } from "@/stores/settings-store"
import { Bot, Sparkles, MessageSquare, Zap, BarChart3, CheckCircle2, Loader2 } from "lucide-react"
import type { TokenUsageStats } from "@/types/settings"

// Mock token usage for demo
const MOCK_TOKEN_USAGE: TokenUsageStats = {
  current_usage: 32450,
  limit: 50000,
  percent_used: 64.9,
  usage_by_feature: {
    "Chat Assistant": 18500,
    "Draft Replies": 8200,
    "Alert Analysis": 3750,
    "Document RAG": 2000,
  },
  daily_usage: [
    { date: "2024-12-25", tokens: 4200 },
    { date: "2024-12-26", tokens: 5100 },
    { date: "2024-12-27", tokens: 4800 },
    { date: "2024-12-28", tokens: 6200 },
    { date: "2024-12-29", tokens: 5300 },
    { date: "2024-12-30", tokens: 4100 },
    { date: "2024-12-31", tokens: 2750 },
  ],
}

// AI Features that can be toggled
const AI_FEATURES = [
  {
    id: "chat_assistant",
    name: "Chat Assistant",
    description: "Interactive AI chat for questions and tasks",
    icon: MessageSquare,
  },
  {
    id: "draft_replies",
    name: "Draft Replies",
    description: "AI-generated response drafts for emails and messages",
    icon: Sparkles,
  },
  {
    id: "alert_analysis",
    name: "Alert Analysis",
    description: "AI-powered client risk detection and suggestions",
    icon: Zap,
  },
  {
    id: "document_rag",
    name: "Document Search",
    description: "AI search across your knowledge base",
    icon: BarChart3,
  },
]

export function AIConfigurationSection() {
  const { toast } = useToast()
  const {
    tokenUsage,
    setTokenUsage,
    isLoadingTokenUsage,
    setLoadingTokenUsage,
    setHasUnsavedChanges,
  } = useSettingsStore()

  // Local form state
  const [assistantName, setAssistantName] = useState("Chi")
  const [responseTone, setResponseTone] = useState<"professional" | "casual" | "technical">("professional")
  const [responseLength, setResponseLength] = useState<"brief" | "detailed" | "comprehensive">("detailed")
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>(AI_FEATURES.map((f) => f.id))
  const [isSaving, setIsSaving] = useState(false)

  // Load token usage on mount
  useEffect(() => {
    setTokenUsage(MOCK_TOKEN_USAGE)
  }, [setTokenUsage])

  const handleFeatureToggle = (featureId: string) => {
    setEnabledFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((f) => f !== featureId) : [...prev, featureId]
    )
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setHasUnsavedChanges(false)
    toast({
      title: "AI settings saved",
      description: "Your AI configuration has been updated.",
    })
  }

  const usagePercent = tokenUsage?.percent_used || 0

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Configuration
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Customize AI behavior and monitor usage
        </p>
      </div>

      {/* Token Usage Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Token Usage This Month</span>
            <span className="text-sm font-normal text-muted-foreground">
              Resets Jan 1
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {tokenUsage?.current_usage.toLocaleString()} / {tokenUsage?.limit.toLocaleString()} tokens
              </span>
              <span
                className={
                  usagePercent > 90
                    ? "text-red-500 font-medium"
                    : usagePercent > 75
                      ? "text-amber-500"
                      : "text-emerald-500"
                }
              >
                {usagePercent.toFixed(1)}% used
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  usagePercent > 90
                    ? "bg-red-500"
                    : usagePercent > 75
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Usage by Feature */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(tokenUsage?.usage_by_feature || {}).map(([feature, tokens]) => (
              <div key={feature} className="flex items-center justify-between p-2 rounded bg-muted/50">
                <span className="text-sm">{feature}</span>
                <span className="text-sm text-muted-foreground">{tokens.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Behavior Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">AI Behavior</CardTitle>
          <CardDescription>Configure how the AI assistant responds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Assistant Name */}
          <div className="space-y-2">
            <Label htmlFor="assistant-name">Assistant Name</Label>
            <Input
              id="assistant-name"
              value={assistantName}
              onChange={(e) => {
                setAssistantName(e.target.value)
                setHasUnsavedChanges(true)
              }}
              placeholder="Chi"
              className="bg-secondary border-border max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              The name used when the AI introduces itself
            </p>
          </div>

          {/* Response Tone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Response Tone</Label>
              <Select
                value={responseTone}
                onValueChange={(value: "professional" | "casual" | "technical") => {
                  setResponseTone(value)
                  setHasUnsavedChanges(true)
                }}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Response Length</Label>
              <Select
                value={responseLength}
                onValueChange={(value: "brief" | "detailed" | "comprehensive") => {
                  setResponseLength(value)
                  setHasUnsavedChanges(true)
                }}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Brief</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Features Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">AI Features</CardTitle>
          <CardDescription>Enable or disable specific AI capabilities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {AI_FEATURES.map((feature) => {
            const Icon = feature.icon
            const isEnabled = enabledFeatures.includes(feature.id)

            return (
              <div
                key={feature.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border"
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${isEnabled ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <p className="text-sm font-medium">{feature.name}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => handleFeatureToggle(feature.id)}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
