"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Play,
  Edit2,
  Zap,
  Brain,
  Mail,
  Database,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Sparkles,
  PlusCircle,
  FileText,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

function SlackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  )
}

function PipedriveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
    </svg>
  )
}

function MetaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

interface WorkflowNode {
  id: string
  type: "trigger" | "ai" | "action" | "condition"
  label: string
  icon: any
  config?: Record<string, any>
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: "onboarding" | "monitoring" | "triage"
  nodes: WorkflowNode[]
}

interface ActiveWorkflow {
  id: string
  name: string
  description: string
  icon: any
  trigger: string
  stats: { runs: number; lastRun: string }
  status: "active" | "inactive"
  nodes: WorkflowNode[]
}

interface ExecutionLog {
  id: string
  workflowName: string
  timestamp: string
  status: "success" | "failed"
  duration: number
  details: string
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "t1",
    name: "Tech Onboarding Handoff",
    description: "When Client submits Intake Form → Create Slack Channel → Create GDrive Folder → Draft Welcome Email",
    category: "onboarding",
    nodes: [
      { id: "n1", type: "trigger", label: "Form Submitted", icon: FileText, config: { form: "Tech Intake" } },
      {
        id: "n2",
        type: "action",
        label: "Create Slack Channel",
        icon: SlackIcon,
        config: { channelName: "#client-{name}" },
      },
      {
        id: "n3",
        type: "action",
        label: "Create GDrive Folder",
        icon: Database,
        config: { folderName: "Client {name}" },
      },
      { id: "n4", type: "action", label: "Draft Welcome Email", icon: Mail, config: { template: "welcome" } },
    ],
  },
  {
    id: "t2",
    name: "Stuck Pipeline Monitor",
    description: "When Client is in Install > 5 days → Alert Team in Slack",
    category: "monitoring",
    nodes: [
      { id: "n1", type: "trigger", label: "Daily Pipeline Scan", icon: Clock, config: { schedule: "daily_9am" } },
      {
        id: "n2",
        type: "condition",
        label: "Check Days in Stage",
        icon: AlertTriangle,
        config: { condition: "days > 5 AND stage = Installation" },
      },
      {
        id: "n3",
        type: "action",
        label: "Send Slack Alert",
        icon: SlackIcon,
        config: { channel: "#fulfillment", message: "⚠️ {client} stuck" },
      },
    ],
  },
  {
    id: "t3",
    name: "Urgent Ticket Triage (AI)",
    description: "New Slack Message → AI Analyze Sentiment → If Negative, Escalates to SMS",
    category: "triage",
    nodes: [
      {
        id: "n1",
        type: "trigger",
        label: "New Slack Message",
        icon: SlackIcon,
        config: { channels: ["all-client-channels"] },
      },
      {
        id: "n2",
        type: "ai",
        label: "AI Sentiment Analysis",
        icon: Brain,
        config: {
          model: "gpt-4o",
          prompt:
            "Analyze this message for urgency and sentiment. Return JSON with urgency_score (1-10) and sentiment (positive/neutral/negative).",
        },
      },
      {
        id: "n3",
        type: "condition",
        label: "Check Urgency",
        icon: AlertTriangle,
        config: { condition: "urgency_score > 7" },
      },
      { id: "n4", type: "action", label: "Create High Priority Ticket", icon: FileText, config: { priority: "high" } },
      {
        id: "n5",
        type: "action",
        label: "Send SMS Alert",
        icon: MessageSquare,
        config: { recipient: "Luke", message: "🚨 Urgent from {client}" },
      },
    ],
  },
]

const activeWorkflows: ActiveWorkflow[] = [
  {
    id: "w1",
    name: "Daily Pixel Health Check",
    description: "Monitor Meta Ads API for zero-event clients",
    icon: Sparkles,
    trigger: "Daily at 8 AM",
    stats: { runs: 14, lastRun: "2m ago" },
    status: "active",
    nodes: [
      { id: "n1", type: "trigger", label: "Daily Schedule", icon: Clock, config: { time: "08:00" } },
      { id: "n2", type: "action", label: "Check Meta API", icon: Database, config: { endpoint: "/events" } },
      {
        id: "n3",
        type: "condition",
        label: "If Events = 0",
        icon: AlertTriangle,
        config: { condition: "events == 0" },
      },
      {
        id: "n4",
        type: "action",
        label: "Create Ticket",
        icon: FileText,
        config: { priority: "high", title: "Zero Events Detected" },
      },
    ],
  },
  {
    id: "w2",
    name: "New Client Setup",
    description: "Automated onboarding workflow with AI plan generation",
    icon: Users,
    trigger: "Onboarding Complete",
    stats: { runs: 3, lastRun: "1h ago" },
    status: "active",
    nodes: [
      { id: "n1", type: "trigger", label: "Onboarding Complete", icon: CheckCircle2 },
      {
        id: "n2",
        type: "ai",
        label: "AI Generate Install Plan",
        icon: Brain,
        config: {
          model: "gpt-4o",
          prompt:
            "Based on client tech stack: {shopify_url}, {gtm_id}, {pixel_id}, generate a step-by-step installation checklist in JSON format.",
        },
      },
      {
        id: "n3",
        type: "action",
        label: "Slack Notify",
        icon: SlackIcon,
        config: { channel: "#fulfillment", message: "New client {name} ready for install" },
      },
    ],
  },
  {
    id: "w3",
    name: "Urgent Triage Bot",
    description: "Real-time urgent keyword detection with SMS alerts",
    icon: AlertTriangle,
    trigger: 'Slack keyword: "Urgent"',
    stats: { runs: 1, lastRun: "3d ago" },
    status: "active",
    nodes: [
      {
        id: "n1",
        type: "trigger",
        label: "Slack Message Scan",
        icon: SlackIcon,
        config: { keywords: ["Urgent", "Broken", "Down"] },
      },
      {
        id: "n2",
        type: "ai",
        label: "AI Analyze Urgency",
        icon: Brain,
        config: { model: "claude-3.5-sonnet", prompt: "Rate urgency 1-10 and extract key issue." },
      },
      { id: "n3", type: "action", label: "Create High Priority Ticket", icon: FileText, config: { assignee: "Luke" } },
      { id: "n4", type: "action", label: "SMS Alert", icon: MessageSquare, config: { to: "Luke" } },
    ],
  },
]

const executionLogs: ExecutionLog[] = [
  {
    id: "e1",
    workflowName: "Daily Pixel Health Check",
    timestamp: "2m ago",
    status: "success",
    duration: 1.2,
    details: "Checked 12 clients, all healthy",
  },
  {
    id: "e2",
    workflowName: "New Client Setup",
    timestamp: "1h ago",
    status: "success",
    duration: 3.5,
    details: "Created plan for RTA Outdoor Living",
  },
  {
    id: "e3",
    workflowName: "Urgent Triage Bot",
    timestamp: "3d ago",
    status: "success",
    duration: 0.8,
    details: "Escalated ticket #T002 to Luke",
  },
  {
    id: "e4",
    workflowName: "Daily Pixel Health Check",
    timestamp: "1d ago",
    status: "failed",
    duration: 0.3,
    details: "Meta API rate limit exceeded",
  },
]

export function AutomationsView() {
  const { toast } = useToast()
  const [workflows, setWorkflows] = useState(activeWorkflows)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null)
  const [showBuilder, setShowBuilder] = useState(false)
  const [builderNodes, setBuilderNodes] = useState<WorkflowNode[]>([])
  const [workflowName, setWorkflowName] = useState("")

  const toggleWorkflow = (id: string) => {
    setWorkflows(
      workflows.map((w) => (w.id === id ? { ...w, status: w.status === "active" ? "inactive" : "active" } : w)),
    )
    toast({ title: "Workflow updated", description: "Status changed successfully" })
  }

  const startFromTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template)
    setBuilderNodes(template.nodes)
    setWorkflowName(template.name)
    setShowTemplateModal(false)
    setShowBuilder(true)
  }

  const startFromScratch = () => {
    setBuilderNodes([{ id: "n1", type: "trigger", label: "Select Trigger", icon: Zap }])
    setWorkflowName("New Workflow")
    setShowTemplateModal(false)
    setShowBuilder(true)
  }

  const addNode = (type: "action" | "ai" | "condition") => {
    const newNode: WorkflowNode = {
      id: `n${builderNodes.length + 1}`,
      type,
      label: type === "ai" ? "AI Processor" : type === "action" ? "New Action" : "New Condition",
      icon: type === "ai" ? Brain : type === "action" ? Zap : AlertTriangle,
    }
    setBuilderNodes([...builderNodes, newNode])
  }

  const removeNode = (id: string) => {
    setBuilderNodes(builderNodes.filter((n) => n.id !== id))
  }

  const getNodeBorderColor = (type: string) => {
    switch (type) {
      case "trigger":
        return "border-blue-500/50 bg-blue-500/5"
      case "ai":
        return "border-purple-500/50 bg-purple-500/10"
      case "action":
        return "border-emerald-500/50 bg-emerald-500/5"
      case "condition":
        return "border-amber-500/50 bg-amber-500/5"
      default:
        return "border-border"
    }
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workflow Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">No-code automation builder for technical fulfillment</p>
        </div>
        <Button onClick={() => setShowTemplateModal(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Automation
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates Library</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
        </TabsList>

        {/* Active Workflows Tab */}
        <TabsContent value="active" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((workflow) => {
              const Icon = workflow.icon
              return (
                <Card
                  key={workflow.id}
                  className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <Icon className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">{workflow.name}</CardTitle>
                          <CardDescription className="text-xs mt-0.5">{workflow.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 text-blue-400" />
                        <span className="text-xs font-medium text-blue-400">TRIGGER</span>
                      </div>
                      <p className="text-sm text-foreground font-mono pl-5">{workflow.trigger}</p>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Run <span className="font-semibold text-foreground">{workflow.stats.runs}</span> times · Last{" "}
                        {workflow.stats.lastRun}
                      </div>
                      <Switch
                        checked={workflow.status === "active"}
                        onCheckedChange={() => toggleWorkflow(workflow.id)}
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full opacity-0 group-hover:opacity-100 transition-opacity bg-transparent"
                      onClick={() => {
                        setBuilderNodes(workflow.nodes)
                        setWorkflowName(workflow.name)
                        setShowBuilder(true)
                      }}
                    >
                      <Edit2 className="h-3 w-3 mr-2" />
                      Edit Workflow
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Templates Library Tab */}
        <TabsContent value="templates" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Start from Scratch Card */}
            <Card
              className="bg-card border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all cursor-pointer"
              onClick={startFromScratch}
            >
              <CardContent className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="p-4 rounded-full bg-secondary">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">Build Custom Workflow</h3>
                  <p className="text-xs text-muted-foreground mt-1">Start from scratch</p>
                </div>
              </CardContent>
            </Card>

            {/* Template Cards */}
            {workflowTemplates.map((template) => (
              <Card
                key={template.id}
                className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => startFromTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <Badge variant="outline" className="w-fit text-xs mb-2">
                    {template.category}
                  </Badge>
                  <CardTitle className="text-base font-semibold">{template.name}</CardTitle>
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {template.nodes.length} steps configured
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full opacity-0 group-hover:opacity-100 transition-opacity bg-transparent"
                    >
                      <Sparkles className="h-3 w-3 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Execution Logs Tab */}
        <TabsContent value="logs" className="space-y-4 mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Recent Executions</CardTitle>
              <CardDescription>Live workflow execution history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {executionLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {log.status === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{log.workflowName}</p>
                        <p className="text-xs text-muted-foreground">{log.details}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                      <p className="text-xs text-muted-foreground">{log.duration}s</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Selector Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-2xl bg-background border-border">
          <DialogHeader>
            <DialogTitle>Choose a Starting Point</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Card
              className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all cursor-pointer"
              onClick={startFromScratch}
            >
              <CardContent className="flex flex-col items-center justify-center py-8 space-y-2">
                <Plus className="h-8 w-8 text-muted-foreground" />
                <h3 className="font-semibold">Start from Scratch</h3>
                <p className="text-xs text-muted-foreground text-center">Build a custom workflow</p>
              </CardContent>
            </Card>
            {workflowTemplates.map((template) => (
              <Card
                key={template.id}
                className="border-border hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => startFromTemplate(template)}
              >
                <CardHeader>
                  <Badge variant="outline" className="w-fit text-xs mb-1">
                    {template.category}
                  </Badge>
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Workflow Builder Sheet */}
      <Sheet open={showBuilder} onOpenChange={setShowBuilder}>
        <SheetContent side="right" className="w-full sm:max-w-[800px] bg-background border-border overflow-y-auto">
          <SheetHeader className="pb-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-foreground">{workflowName}</SheetTitle>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Play className="h-3 w-3 mr-2" />
                Save & Activate
              </Button>
            </div>
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="mt-2"
              placeholder="Workflow name"
            />
          </SheetHeader>

          {/* Node Builder */}
          <div className="space-y-4 pb-6">
            {builderNodes.map((node, idx) => {
              const Icon = node.icon
              return (
                <div key={node.id} className="relative">
                  {/* Connection Line */}
                  {idx < builderNodes.length - 1 && (
                    <div className="absolute left-8 top-[calc(100%+0.5rem)] w-0.5 h-4 bg-border z-0" />
                  )}

                  {/* Node Card */}
                  <Card className={cn("relative z-10 border-2", getNodeBorderColor(node.type))}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-secondary shrink-0">
                          <Icon className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                node.type === "trigger" && "border-blue-500/50 text-blue-400",
                                node.type === "ai" && "border-purple-500/50 text-purple-400",
                                node.type === "action" && "border-emerald-500/50 text-emerald-400",
                                node.type === "condition" && "border-amber-500/50 text-amber-400",
                              )}
                            >
                              {node.type.toUpperCase()}
                            </Badge>
                            {idx > 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => removeNode(node.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>

                          <Input
                            value={node.label}
                            onChange={(e) => {
                              setBuilderNodes(
                                builderNodes.map((n) => (n.id === node.id ? { ...n, label: e.target.value } : n)),
                              )
                            }}
                            placeholder="Node label"
                          />

                          {/* AI Node Special Config */}
                          {node.type === "ai" && (
                            <div className="space-y-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                              <div className="flex items-center gap-2">
                                <Brain className="h-4 w-4 text-purple-400" />
                                <span className="text-xs font-semibold text-purple-400">AI AGENT CONFIGURATION</span>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">Model</Label>
                                <Select defaultValue="gpt-4o">
                                  <SelectTrigger className="bg-background">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                    <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">System Prompt</Label>
                                <Textarea
                                  placeholder="You are a tracking engineer analyzing client data..."
                                  className="font-mono text-xs bg-background min-h-[120px]"
                                  defaultValue={node.config?.prompt}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">Output Variable</Label>
                                <Input placeholder="analysis_result" className="font-mono text-xs" />
                              </div>
                            </div>
                          )}

                          {/* Standard Action Config */}
                          {node.type === "action" && node.config && (
                            <div className="space-y-2">
                              {Object.entries(node.config).map(([key, value]) => (
                                <div key={key} className="p-2 rounded bg-secondary/50 border border-border">
                                  <span className="text-xs text-muted-foreground">{key}: </span>
                                  <code className="text-xs text-foreground font-mono">{String(value)}</code>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Add Node Button */}
                  {idx === builderNodes.length - 1 && (
                    <div className="flex items-center justify-center mt-4 gap-2">
                      <Button variant="outline" size="sm" onClick={() => addNode("action")}>
                        <PlusCircle className="h-3 w-3 mr-2" />
                        Action
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addNode("ai")}
                        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                      >
                        <Brain className="h-3 w-3 mr-2" />
                        AI Agent
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addNode("condition")}>
                        <AlertTriangle className="h-3 w-3 mr-2" />
                        Condition
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
