"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import {
  Sparkles,
  AlertTriangle,
  Upload,
  CheckCircle2,
  ArrowRight,
  Send,
  Zap,
  Mail,
  TrendingDown,
  TrendingUp,
  FileText,
  Search,
  AlertCircle,
  Clock,
  Filter,
  List,
  LayoutGrid,
} from "lucide-react"
import { cn } from "@/lib/utils"

function SlackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  )
}

function GmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
    </svg>
  )
}

interface AIInsight {
  id: string
  category: "critical" | "approval" | "performance"
  type: "risk" | "communication" | "action" | "performance"
  title: string
  description: string
  client?: string
  action: string
  priority: "high" | "medium" | "low"
  timestamp: string
}

const aiInsights: AIInsight[] = [
  // Critical Risks (Red)
  {
    id: "1",
    category: "critical",
    type: "risk",
    title: "Ad Account Disconnected",
    description: "RTA Outdoor Living's Meta Ads account has been disconnected for 48 hours. No ad data syncing.",
    client: "RTA Outdoor Living",
    action: "Reconnect Now",
    priority: "high",
    timestamp: "2h ago",
  },
  {
    id: "2",
    category: "critical",
    type: "risk",
    title: "Budget Cap Hit",
    description: "Beardbrand hit daily budget cap at 2PM. Campaigns paused for remainder of day.",
    client: "Beardbrand",
    action: "Adjust Budget",
    priority: "high",
    timestamp: "4h ago",
  },
  {
    id: "3",
    category: "critical",
    type: "risk",
    title: "Pixel Firing Errors",
    description: "Brooklinen pixel showing 15% error rate on checkout events since theme update.",
    client: "Brooklinen",
    action: "Investigate",
    priority: "high",
    timestamp: "1h ago",
  },
  // Approvals & Actions (Amber)
  {
    id: "4",
    category: "approval",
    type: "action",
    title: "Approve Weekly Report",
    description: "V Shred weekly performance report ready for review and client delivery.",
    client: "V Shred",
    action: "Review & Send",
    priority: "medium",
    timestamp: "30m ago",
  },
  {
    id: "5",
    category: "approval",
    type: "communication",
    title: "Review Draft Reply",
    description: "AI drafted response to Allbirds iOS tracking question. Needs human approval.",
    client: "Allbirds",
    action: "Review Draft",
    priority: "medium",
    timestamp: "1h ago",
  },
  {
    id: "6",
    category: "approval",
    type: "action",
    title: "Pending Legal Review",
    description: "Bombas legal approval pending for 9 days. Consider escalation to client.",
    client: "Bombas",
    action: "Send Reminder",
    priority: "medium",
    timestamp: "2d ago",
  },
  {
    id: "7",
    category: "approval",
    type: "communication",
    title: "Respond to Client Email",
    description: "3 new emails from Glow Recipe regarding kickoff call agenda. Response needed.",
    client: "Glow Recipe",
    action: "Draft Reply",
    priority: "medium",
    timestamp: "3h ago",
  },
  // Performance Signals (Blue/Green)
  {
    id: "8",
    category: "performance",
    type: "performance",
    title: "ROAS Dropped 10%",
    description: "Beardbrand ROAS dropped from 3.2x to 2.9x over last 7 days. Tracking issue suspected.",
    client: "Beardbrand",
    action: "Review Tracking",
    priority: "medium",
    timestamp: "6h ago",
  },
  {
    id: "9",
    category: "performance",
    type: "performance",
    title: "Traffic Up 20%",
    description: "Gymshark organic traffic increased 20% week-over-week. Campaign attribution looks strong.",
    client: "Gymshark",
    action: "View Report",
    priority: "low",
    timestamp: "1d ago",
  },
  {
    id: "10",
    category: "performance",
    type: "performance",
    title: "CPA Below Target",
    description: "V Shred CPA at $18 vs $25 target. Strong performance on new creative tests.",
    client: "V Shred",
    action: "Scale Budget",
    priority: "low",
    timestamp: "12h ago",
  },
  {
    id: "11",
    category: "performance",
    type: "performance",
    title: "Conversion Rate Improved",
    description: "Terren checkout conversion rate up 15% after landing page optimization.",
    client: "Terren",
    action: "View Details",
    priority: "low",
    timestamp: "1d ago",
  },
]

const contextChips = [
  { label: "Summarize last call", icon: FileText },
  { label: "Draft weekly report", icon: Mail },
  { label: "Find 'Pixel' SOP", icon: Search },
  { label: "Show stuck clients", icon: AlertTriangle },
]

interface FeedHistorySheetProps {
  isOpen: boolean
  onClose: () => void
  insights: AIInsight[]
}

function FeedHistorySheet({ isOpen, onClose, insights }: FeedHistorySheetProps) {
  const [filterClient, setFilterClient] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  const filteredInsights = insights.filter((insight) => {
    const matchesClient = filterClient === "all" || insight.client === filterClient
    const matchesCategory = filterCategory === "all" || insight.category === filterCategory
    return matchesClient && matchesCategory
  })

  const uniqueClients = [...new Set(insights.map((i) => i.client).filter(Boolean))]

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-card border-border w-full sm:max-w-[540px] overflow-y-auto p-0">
        <div className="p-4">
          <SheetHeader>
            <SheetTitle className="text-foreground text-[14px] font-semibold">Feed History</SheetTitle>
            <SheetDescription className="text-[11px]">View all AI-generated insights and alerts</SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-3">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
                <Select value={filterClient} onValueChange={setFilterClient}>
                  <SelectTrigger className="w-[120px] bg-secondary border-border h-7 text-[10px]">
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-[11px]">All Clients</SelectItem>
                    {uniqueClients.map((client) => (
                      <SelectItem key={client} value={client!} className="text-[11px]">
                        {client}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[110px] bg-secondary border-border h-7 text-[10px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[11px]">All Categories</SelectItem>
                  <SelectItem value="critical" className="text-[11px]">Critical Risks</SelectItem>
                  <SelectItem value="approval" className="text-[11px]">Approvals</SelectItem>
                  <SelectItem value="performance" className="text-[11px]">Performance</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center bg-secondary rounded-md p-0.5 ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-6 px-1.5", viewMode === "list" && "bg-background")}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-6 px-1.5", viewMode === "grid" && "bg-background")}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Insights List */}
            <div className={cn("space-y-2", viewMode === "grid" && "grid grid-cols-2 gap-2 space-y-0")}>
              {filteredInsights.map((insight) => (
                <div
                  key={insight.id}
                  className={cn(
                    "p-2 rounded-md border transition-colors cursor-pointer hover:border-primary/50",
                    insight.category === "critical" && "bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20",
                    insight.category === "approval" && "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20",
                    insight.category === "performance" && "bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20",
                  )}
                >
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-medium text-foreground">{insight.title}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 break-words">{insight.description}</p>
                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                      <span className="text-[9px] text-muted-foreground">{insight.client}</span>
                      <span className="text-[9px] text-muted-foreground">•</span>
                      <span className="text-[9px] text-muted-foreground">{insight.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function IntelligenceView() {
  const [assistantInput, setAssistantInput] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const criticalRisks = aiInsights.filter((i) => i.category === "critical")
  const approvals = aiInsights.filter((i) => i.category === "approval")
  const performanceSignals = aiInsights.filter((i) => i.category === "performance")

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Intelligence Center</h1>
          <p className="text-[12px] text-muted-foreground">AI-powered insights and unified communications</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={() => setIsHistoryOpen(true)}>
          <Clock className="h-3 w-3 mr-1.5" />
          View History
        </Button>
      </div>

      {/* Pulse Check Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Sync Status Cards */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
                  <GmailIcon className="h-3.5 w-3.5 text-rose-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-foreground truncate">Gmail Sync</p>
                  <p className="text-[10px] text-muted-foreground">Last sync: 2m ago</p>
                </div>
              </div>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded bg-purple-50 dark:bg-emerald-500/10 shrink-0">
                  <SlackIcon className="h-3.5 w-3.5 text-[#4A154B]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-foreground truncate">Slack Sync</p>
                  <p className="text-[10px] text-muted-foreground">Active</p>
                </div>
              </div>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-500/10 shrink-0">
                  <Zap className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-foreground truncate">Ad Accounts</p>
                  <p className="text-[10px] text-muted-foreground">12 Connected</p>
                </div>
              </div>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Upload Zone */}
        <Card
          className={cn(
            "border-border border-dashed cursor-pointer transition-colors shadow-sm",
            isDragging && "border-primary bg-primary/5",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-muted shrink-0">
                <Upload className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-foreground truncate">Upload Assets</p>
                <p className="text-[10px] text-muted-foreground">Drop PDFs/CSVs here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Panel A: Critical Risks (Red Theme) */}
        <Card className="bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="flex items-center gap-1.5 text-foreground text-[12px] font-medium">
              <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span className="truncate">Critical Risks</span>
              <Badge variant="outline" className="ml-auto bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30 text-[9px] shrink-0">
                {criticalRisks.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-[10px]">Requires immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3">
            {criticalRisks.map((insight) => (
              <div
                key={insight.id}
                className="p-2 rounded bg-card border border-rose-200 dark:border-rose-500/20 hover:border-rose-300 dark:hover:border-rose-500/40 transition-colors cursor-pointer"
              >
                <div className="space-y-0.5">
                  <p className="text-[11px] font-medium text-foreground">{insight.title}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 break-words">{insight.description}</p>
                  <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                    <span className="text-[9px] text-rose-600 dark:text-rose-400">{insight.client}</span>
                    <span className="text-[9px] text-muted-foreground">• {insight.timestamp}</span>
                  </div>
                </div>
                <Button size="sm" className="w-full mt-2 bg-rose-600 hover:bg-rose-700 text-white h-6 text-[10px]">
                  {insight.action}
                  <ArrowRight className="h-2.5 w-2.5 ml-1" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Panel B: Approvals & Actions (Amber Theme) */}
        <Card className="bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="flex items-center gap-1.5 text-foreground text-[12px] font-medium">
              <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span className="truncate">Approvals & Actions</span>
              <Badge variant="outline" className="ml-auto bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 text-[9px] shrink-0">
                {approvals.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-[10px]">Needs human input</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3">
            {approvals.map((insight) => (
              <div
                key={insight.id}
                className="p-2 rounded bg-card border border-amber-200 dark:border-amber-500/20 hover:border-amber-300 dark:hover:border-amber-500/40 transition-colors cursor-pointer"
              >
                <div className="space-y-0.5">
                  <p className="text-[11px] font-medium text-foreground">{insight.title}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 break-words">{insight.description}</p>
                  <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                    <span className="text-[9px] text-amber-600 dark:text-amber-400">{insight.client}</span>
                    <span className="text-[9px] text-muted-foreground">• {insight.timestamp}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 border-amber-300 text-amber-700 dark:border-amber-500/30 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/10 h-6 text-[10px] bg-transparent"
                >
                  {insight.action}
                  <ArrowRight className="h-2.5 w-2.5 ml-1" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Panel C: Performance Signals (Blue/Green Theme) */}
        <Card className="bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="flex items-center gap-1.5 text-foreground text-[12px] font-medium">
              <TrendingUp className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span className="truncate">Performance Signals</span>
              <Badge variant="outline" className="ml-auto bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30 text-[9px] shrink-0">
                {performanceSignals.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-[10px]">KPI trends and opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3">
            {performanceSignals.map((insight) => (
              <div
                key={insight.id}
                className="p-2 rounded bg-card border border-blue-200 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/40 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-1.5">
                  {insight.title.toLowerCase().includes("dropped") || insight.title.toLowerCase().includes("down") ? (
                    <TrendingDown className="h-3 w-3 text-rose-500 mt-0.5 shrink-0" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                  )}
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-foreground">{insight.title}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 break-words">{insight.description}</p>
                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                      <span className="text-[9px] text-blue-600 dark:text-blue-400">{insight.client}</span>
                      <span className="text-[9px] text-muted-foreground">• {insight.timestamp}</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 border-blue-300 text-blue-700 dark:border-blue-500/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/10 h-6 text-[10px] bg-transparent"
                >
                  {insight.action}
                  <ArrowRight className="h-2.5 w-2.5 ml-1" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Section */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="flex items-center gap-1.5 text-foreground text-[12px] font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            AI Assistant
          </CardTitle>
          <CardDescription className="text-[10px]">Ask questions about clients, draft messages, or find SOPs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-3 pb-3">
          {/* Context Chips */}
          <div className="flex flex-wrap gap-1.5">
            {contextChips.map((chip) => (
              <Button
                key={chip.label}
                variant="outline"
                size="sm"
                className="h-6 text-[10px] border-border bg-secondary/50 hover:bg-secondary px-2"
              >
                <chip.icon className="h-3 w-3 mr-1" />
                {chip.label}
              </Button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask about client status, draft a response, or find an SOP..."
              value={assistantInput}
              onChange={(e) => setAssistantInput(e.target.value)}
              className="flex-1 bg-secondary border-border h-8 text-[11px]"
            />
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 h-8 w-8 p-0">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feed History Sheet */}
      <FeedHistorySheet isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} insights={aiInsights} />
    </div>
  )
}
