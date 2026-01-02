"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  ExternalLink,
  Plus,
  FileText,
  CheckCircle2,
  Circle,
  AlertCircle,
  Sparkles,
  Video,
  LinkIcon,
  Mail,
  Send,
  Copy,
  Play,
  Eye,
  EyeOff,
  TrendingUp,
} from "lucide-react"
import { mockClients, type Client } from "@/lib/mock-data"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface OnboardingHubViewProps {
  onClientClick?: (client: Client, tab?: string) => void
}

export function OnboardingHubView({ onClientClick }: OnboardingHubViewProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"active" | "journey" | "builder">("active")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showTriggerDialog, setShowTriggerDialog] = useState(false)
  const [newClientName, setNewClientName] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")
  const [newClientTier, setNewClientTier] = useState<"Enterprise" | "Core" | "Starter">("Core")

  const [viewMode, setViewMode] = useState<"agency" | "client">("agency")

  const handleViewAsClient = () => {
    setViewMode(viewMode === "agency" ? "client" : "agency")
  }

  const onboardingClients = mockClients.filter((c) => c.onboardingData)

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
  }

  const handleTriggerOnboarding = () => {
    if (!newClientName || !newClientEmail) {
      toast({
        title: "Missing Information",
        description: "Please enter both client name and email",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Onboarding Triggered",
      description: `Welcome email sent to ${newClientEmail} with onboarding portal link`,
    })

    setShowTriggerDialog(false)
    setNewClientName("")
    setNewClientEmail("")
    setNewClientTier("Core")
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/onboarding/start`
    navigator.clipboard.writeText(link)
    toast({
      title: "Link Copied",
      description: "Onboarding portal link copied to clipboard",
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Onboarding & Intake Hub</h1>
          <p className="text-[12px] text-muted-foreground">Manage client onboarding pipeline and intake forms</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setShowTriggerDialog(true)} className="gap-1.5 h-8 text-[11px]">
            <Plus className="h-3.5 w-3.5" />
            Trigger Onboarding
          </Button>
          <Button size="sm" onClick={handleCopyLink} variant="outline" className="gap-1.5 bg-transparent h-8 text-[11px]">
            <Copy className="h-3.5 w-3.5" />
            Copy Portal Link
          </Button>
          <Button size="sm" onClick={handleViewAsClient} variant="outline" className="gap-1.5 bg-transparent h-8 text-[11px]">
            {viewMode === "agency" ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {viewMode === "agency" ? "View as Client" : "Back to Agency View"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-3 py-1.5 text-[11px] font-medium transition-colors relative ${
            activeTab === "active" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Active Onboardings
          {activeTab === "active" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button
          onClick={() => setActiveTab("journey")}
          className={`px-3 py-1.5 text-[11px] font-medium transition-colors relative ${
            activeTab === "journey" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Client Journey
          {activeTab === "journey" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button
          onClick={() => setActiveTab("builder")}
          className={`px-3 py-1.5 text-[11px] font-medium transition-colors relative ${
            activeTab === "builder" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Form Builder
          {activeTab === "builder" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
      </div>

      {/* Content */}
      {activeTab === "active" ? (
        <ActiveOnboardingsTab
          clients={onboardingClients}
          selectedClient={selectedClient}
          onClientSelect={handleClientSelect}
          onClientClick={onClientClick}
        />
      ) : activeTab === "journey" ? (
        <ClientJourneyTab viewMode={viewMode} />
      ) : (
        <FormBuilderTab />
      )}

      <Dialog open={showTriggerDialog} onOpenChange={setShowTriggerDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-[14px] font-semibold">Trigger New Client Onboarding</DialogTitle>
            <DialogDescription className="text-[11px]">
              Send onboarding portal link to a new client to begin their intake process
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="clientName" className="text-[11px]">Client Name</Label>
              <Input
                id="clientName"
                placeholder="Enter client or company name"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="h-8 text-[11px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clientEmail" className="text-[11px]">Primary Contact Email</Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="contact@clientcompany.com"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                className="h-8 text-[11px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clientTier" className="text-[11px]">Client Tier</Label>
              <Select value={newClientTier} onValueChange={(v) => setNewClientTier(v as "Enterprise" | "Core" | "Starter")}>
                <SelectTrigger id="clientTier" className="h-8 text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Starter" className="text-[11px]">Starter</SelectItem>
                  <SelectItem value="Core" className="text-[11px]">Core</SelectItem>
                  <SelectItem value="Enterprise" className="text-[11px]">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Card className="p-3 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 shadow-sm">
              <div className="flex gap-2">
                <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-[11px] font-medium text-blue-700 dark:text-blue-300">What happens next?</p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400">
                    Client will receive a welcome email with a personalized onboarding portal link to complete their
                    intake form and grant access to their accounts.
                  </p>
                </div>
              </div>
            </Card>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowTriggerDialog(false)} className="h-8 text-[11px] bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleTriggerOnboarding} className="gap-1.5 h-8 text-[11px]">
              <Send className="h-3 w-3" />
              Send Onboarding Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Active Onboardings Tab
function ActiveOnboardingsTab({
  clients,
  selectedClient,
  onClientSelect,
  onClientClick,
}: {
  clients: Client[]
  selectedClient: Client | null
  onClientSelect: (client: Client) => void
  onClientClick?: (client: Client, tab?: string) => void
}) {
  const stages = [
    { id: "intake", label: "Intake Received", icon: FileText },
    { id: "access", label: "Access Verified", icon: CheckCircle2 },
    { id: "pixel", label: "Pixel Install", icon: Sparkles },
    { id: "audit", label: "Audit Complete", icon: LinkIcon },
    { id: "live", label: "Live Support", icon: CheckCircle2 },
  ]

  const getStageStatus = (client: Client, stageId: string) => {
    if (stageId === "intake") {
      return "complete"
    }

    if (stageId === "access") {
      const { metaAccessVerified, gtmAccessVerified, shopifyAccessVerified } = client.onboardingData || {}
      if (metaAccessVerified && gtmAccessVerified && shopifyAccessVerified) return "complete"
      if (!metaAccessVerified || !gtmAccessVerified || !shopifyAccessVerified) return "error"
      return "pending"
    }

    if (stageId === "pixel") {
      if (client.stage === "Installation") return "active"
      if (client.stage === "Audit" || client.stage === "Live") return "complete"
      return "pending"
    }

    if (stageId === "audit") {
      if (client.stage === "Audit") return "active"
      if (client.stage === "Live") return "complete"
      return "pending"
    }

    if (stageId === "live") {
      if (client.stage === "Live") return "complete"
      return "pending"
    }

    return "pending"
  }

  const handleStageClick = (client: Client, stageId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    // Navigate to appropriate tab based on stage
    if (stageId === "access") {
      onClientClick?.(client, "techsetup")
    } else {
      onClientSelect(client)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Client Pipeline Cards */}
      <div className="xl:col-span-2 space-y-3">
        {clients.map((client) => {
          const isSelected = selectedClient?.id === client.id
          return (
            <Card
              key={client.id}
              className={`p-4 cursor-pointer transition-colors shadow-sm ${
                isSelected ? "border-primary ring-1 ring-primary" : "hover:border-muted-foreground/50"
              }`}
              onClick={() => onClientSelect(client)}
            >
              {/* Client Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7 bg-muted">
                    <AvatarFallback className="bg-muted text-foreground text-[10px] font-semibold">{client.logo}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-[12px] font-medium text-foreground">{client.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                        {client.tier}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{client.daysInStage}d in stage</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5 bg-muted border border-border">
                    <AvatarFallback className="bg-muted text-foreground text-[9px]">{client.owner[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] text-muted-foreground">{client.owner}</span>
                </div>
              </div>

              {/* Workflow Stages */}
              <div className="flex items-center gap-1.5">
                {stages.map((stage, idx) => {
                  const status = getStageStatus(client, stage.id)
                  const StageIcon = stage.icon
                  return (
                    <div key={stage.id} className="flex items-center flex-1">
                      <div
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border flex-1 cursor-pointer hover:opacity-80 transition-opacity ${
                          status === "complete"
                            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/50"
                            : status === "error"
                              ? "bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/50"
                              : status === "active"
                                ? "bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/50"
                                : "bg-muted/50 border-border"
                        }`}
                        onClick={(e) => handleStageClick(client, stage.id, e)}
                      >
                        {status === "complete" ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-500 shrink-0" />
                        ) : status === "error" ? (
                          <AlertCircle className="h-3 w-3 text-rose-600 dark:text-rose-500 shrink-0" />
                        ) : (
                          <Circle className="h-3 w-3 text-muted-foreground shrink-0" />
                        )}
                        <span className="text-[10px] font-medium truncate">{stage.label}</span>
                        {stage.id === "access" && status === "error" && (
                          <div className="flex gap-0.5 ml-auto">
                            {!client.onboardingData?.metaAccessVerified && (
                              <Badge variant="outline" className="text-[8px] px-0.5 py-0 border-rose-300 text-rose-600 dark:border-rose-500/50 dark:text-rose-400">
                                FB
                              </Badge>
                            )}
                            {!client.onboardingData?.gtmAccessVerified && (
                              <Badge variant="outline" className="text-[8px] px-0.5 py-0 border-rose-300 text-rose-600 dark:border-rose-500/50 dark:text-rose-400">
                                GA
                              </Badge>
                            )}
                            {!client.onboardingData?.shopifyAccessVerified && (
                              <Badge variant="outline" className="text-[8px] px-0.5 py-0 border-rose-300 text-rose-600 dark:border-rose-500/50 dark:text-rose-400">
                                SH
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Connector */}
                      {idx < stages.length - 1 && <div className="h-px w-3 bg-border shrink-0" />}
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Client Journey Panel */}
      {selectedClient ? (
        <div className="space-y-3">
          <ClientJourneyPanel client={selectedClient} onClientClick={onClientClick} />
        </div>
      ) : (
        <Card className="p-6 flex items-center justify-center h-48 shadow-sm">
          <p className="text-[11px] text-muted-foreground text-center">Select a client to view their journey</p>
        </Card>
      )}
    </div>
  )
}

// Client Journey Panel
function ClientJourneyPanel({
  client,
  onClientClick,
}: {
  client: Client
  onClientClick?: (client: Client, tab?: string) => void
}) {
  return (
    <Card className="p-4 space-y-4 shadow-sm">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <Avatar className="h-5 w-5 bg-muted border border-border">
            <AvatarFallback className="bg-muted text-foreground text-[9px]">{client.owner[0]}</AvatarFallback>
          </Avatar>
          <span className="text-[10px] text-muted-foreground">{client.owner}</span>
        </div>
        <h3 className="text-[12px] font-medium text-foreground">Client Journey</h3>
      </div>

      {/* Welcome Video */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Video className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] font-medium">Welcome Video</span>
          </div>
          <Badge variant="outline" className="text-[9px] px-1 py-0 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/50">
            Completed
          </Badge>
        </div>
        <Card className="p-3 bg-muted/30 shadow-sm">
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-1.5">
                <Video className="h-4 w-4 text-primary" />
              </div>
              <p className="text-[10px] text-muted-foreground">Welcome Video Placeholder</p>
              <p className="text-[9px] text-muted-foreground">Watched by client on Dec 1</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Intake Form */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FileText className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] font-medium">Intake Form</span>
          </div>
          <Badge variant="outline" className="text-[9px] px-1 py-0 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/50">
            Submitted
          </Badge>
        </div>
        <Card className="p-3 bg-muted/30 space-y-1.5 shadow-sm">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Submitted:</span>
            <span className="text-foreground">{client.onboardingData?.submittedAt}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Shopify URL:</span>
            <span className="text-foreground font-mono text-[9px]">{client.onboardingData?.shopifyUrl}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Contact:</span>
            <span className="text-foreground text-[9px]">{client.onboardingData?.contactEmail}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-1.5 bg-transparent h-7 text-[10px]"
            onClick={() => onClientClick?.(client, "techsetup")}
          >
            <ExternalLink className="h-3 w-3 mr-1.5" />
            View Full Details
          </Button>
        </Card>
      </div>

      {/* Access Grant */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <LinkIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] font-medium">Access Grant</span>
          </div>
          <Badge
            variant="outline"
            className={`text-[9px] px-1 py-0 ${
              client.onboardingData?.metaAccessVerified &&
              client.onboardingData?.gtmAccessVerified &&
              client.onboardingData?.shopifyAccessVerified
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/50"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/50"
            }`}
          >
            {client.onboardingData?.metaAccessVerified &&
            client.onboardingData?.gtmAccessVerified &&
            client.onboardingData?.shopifyAccessVerified
              ? "Connected"
              : "Pending"}
          </Badge>
        </div>
        <Card className="p-3 bg-muted/30 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Meta Ads Manager</span>
            {client.onboardingData?.metaAccessVerified ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-500" />
            ) : (
              <Circle className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Google Tag Manager</span>
            {client.onboardingData?.gtmAccessVerified ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-500" />
            ) : (
              <Circle className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Shopify Admin</span>
            {client.onboardingData?.shopifyAccessVerified ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-500" />
            ) : (
              <Circle className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        </Card>
      </div>

      {/* AI Brand Guide Generation - Placeholder for future */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-[11px] font-medium">AI Brand Guide Generation</span>
        </div>
        <Card className="p-3 bg-muted/30 shadow-sm">
          <p className="text-[10px] text-muted-foreground text-center py-1">
            AI analysis will appear here once intake form is complete
          </p>
        </Card>
      </div>
    </Card>
  )
}

// Form Builder Tab
function FormBuilderTab() {
  const [formFields, setFormFields] = useState([
    {
      id: "1",
      label: "Business Name",
      placeholder: "Your company or brand name",
      required: true,
    },
    {
      id: "2",
      label: "Shopify Store URL",
      placeholder: "yourstore.myshopify.com",
      required: true,
    },
    {
      id: "3",
      label: "Primary Contact Email",
      placeholder: "contact@yourbrand.com",
      required: true,
    },
    {
      id: "4",
      label: "Monthly Ad Budget",
      placeholder: "e.g., $10,000 - $50,000",
      required: true,
    },
    {
      id: "5",
      label: "Facebook Ad Account ID",
      placeholder: "act_123456789",
      required: true,
    },
    {
      id: "6",
      label: "Google Ads Customer ID",
      placeholder: "123-456-7890",
      required: true,
    },
    {
      id: "7",
      label: "Google Tag Manager Container ID",
      placeholder: "GTM-XXXXXX",
      required: true,
    },
    {
      id: "8",
      label: "Meta Pixel ID",
      placeholder: "1234567890123456",
      required: true,
    },
    {
      id: "9",
      label: "Klaviyo API Key (if applicable)",
      placeholder: "pk_xxxxxxxxxxxx",
      required: false,
    },
    {
      id: "10",
      label: "Target Audience Description",
      placeholder: "Who are your ideal customers?",
      required: true,
    },
  ])

  const handleToggleRequired = (fieldId: string) => {
    setFormFields((prev) =>
      prev.map((field) => (field.id === fieldId ? { ...field, required: !field.required } : field)),
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4 shadow-sm">
        <h2 className="text-[12px] font-medium mb-1">Intake Form Fields</h2>
        <p className="text-[10px] text-muted-foreground mb-3">Customize the questions clients answer during onboarding</p>

        {/* Form Fields List */}
        <div className="space-y-2">
          {formFields.map((field) => (
            <div key={field.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-md border border-border">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[9px] text-muted-foreground mb-0.5 block">Field Label</Label>
                  <Input
                    value={field.label}
                    className="h-7 text-[11px] bg-background"
                    onChange={(e) =>
                      setFormFields((prev) =>
                        prev.map((f) => (f.id === field.id ? { ...f, label: e.target.value } : f)),
                      )
                    }
                  />
                </div>
                <div>
                  <Label className="text-[9px] text-muted-foreground mb-0.5 block">Placeholder Text</Label>
                  <Input
                    value={field.placeholder}
                    className="h-7 text-[11px] bg-background"
                    onChange={(e) =>
                      setFormFields((prev) =>
                        prev.map((f) => (f.id === field.id ? { ...f, placeholder: e.target.value } : f)),
                      )
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Switch checked={field.required} onCheckedChange={() => handleToggleRequired(field.id)} className="scale-90" />
                <Label className="text-[10px] text-muted-foreground">Required</Label>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full mt-3 gap-1.5 bg-transparent h-8 text-[11px]">
          <Plus className="h-3 w-3" />
          Add Field
        </Button>
      </Card>

      {/* Preview Section */}
      <Card className="p-4 shadow-sm">
        <h2 className="text-[12px] font-medium mb-1">Form Preview</h2>
        <p className="text-[10px] text-muted-foreground mb-3">This is how the form will appear to clients</p>
        <div className="bg-muted/30 rounded-md p-4 space-y-3">
          {formFields.slice(0, 3).map((field) => (
            <div key={field.id}>
              <Label className="text-[10px] mb-1 flex items-center gap-0.5 block">
                {field.label}
                {field.required && <span className="text-rose-500 dark:text-rose-400">*</span>}
              </Label>
              <Input placeholder={field.placeholder} className="bg-background h-7 text-[11px]" disabled />
            </div>
          ))}
          <p className="text-[9px] text-muted-foreground text-center pt-1">+ {formFields.length - 3} more fields...</p>
        </div>
      </Card>
    </div>
  )
}

function ClientJourneyTab({ viewMode }: { viewMode: "agency" | "client" }) {
  const [welcomeVideoUrl, setWelcomeVideoUrl] = useState("https://vimeo.com/123456789")
  const [aiPrompt, setAiPrompt] = useState(
    "Analyze this client's tracking data and provide insights on pixel installation quality, event match quality, and recommended optimizations for their e-commerce conversion tracking.",
  )
  const { toast } = useToast()

  const handleSaveConfiguration = () => {
    toast({
      title: "Configuration Saved",
      description: "Client journey settings have been updated successfully",
    })
  }

  if (viewMode === "agency") {
    return (
      <div className="space-y-4">
        <Card className="p-4 space-y-4 shadow-sm">
          <div>
            <h3 className="text-[12px] font-medium mb-3">Welcome Video Configuration</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="videoUrl" className="text-[11px]">Video URL (Vimeo or YouTube)</Label>
                <Input
                  id="videoUrl"
                  placeholder="https://vimeo.com/..."
                  value={welcomeVideoUrl}
                  onChange={(e) => setWelcomeVideoUrl(e.target.value)}
                  className="h-8 text-[11px]"
                />
                <p className="text-[9px] text-muted-foreground">
                  This welcome video will be shown to clients at the start of their onboarding experience
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[12px] font-medium mb-3">AI Analysis Configuration</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="aiPrompt" className="text-[11px]">Analysis Prompt Template</Label>
                <Textarea
                  id="aiPrompt"
                  rows={5}
                  placeholder="Enter AI prompt for analyzing client intake forms..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="font-mono text-[10px]"
                />
                <p className="text-[9px] text-muted-foreground">
                  This prompt will be used to analyze incoming client data and generate installation recommendations
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              toast({
                title: "Configuration Saved",
                description: "Welcome video and AI prompt have been updated",
              })
            }}
            className="w-full h-8 text-[11px]"
          >
            Save Configuration
          </Button>
        </Card>

        <Card className="p-4 space-y-3 shadow-sm">
          <div>
            <h3 className="text-[12px] font-medium mb-1">AI Analysis Preview</h3>
            <p className="text-[10px] text-muted-foreground">Example output from analyzing client intake forms</p>
          </div>

          <Card className="p-3 bg-muted/30 space-y-3 shadow-sm">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                <span className="text-[11px] font-medium">Tracking Setup Analysis</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">Generated from intake form on Dec 4, 2024</p>

              <div className="space-y-2.5">
                <div>
                  <h4 className="text-[10px] font-medium mb-1.5 text-emerald-700 dark:text-emerald-400">Current Setup</h4>
                  <ul className="space-y-0.5 text-[10px] text-muted-foreground">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                      <span>Shopify store active with standard theme</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                      <span>Meta Pixel present but not firing correctly</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                      <span>GTM container needs migration to GA4</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-[10px] font-medium mb-1.5 text-blue-700 dark:text-blue-400">Recommended Actions</h4>
                  <ul className="space-y-0.5 text-[10px] text-muted-foreground">
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-600 dark:text-blue-400 shrink-0">1.</span>
                      <span>Reinstall Meta Pixel with server-side tracking</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-600 dark:text-blue-400 shrink-0">2.</span>
                      <span>Set up GA4 property and conversion tracking</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-600 dark:text-blue-400 shrink-0">3.</span>
                      <span>Implement enhanced e-commerce tracking</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-600 dark:text-blue-400 shrink-0">4.</span>
                      <span>Configure Klaviyo integration for email attribution</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-[10px] font-medium mb-1.5 text-amber-700 dark:text-amber-400">Potential Issues</h4>
                  <ul className="space-y-0.5 text-[10px] text-muted-foreground">
                    <li className="flex items-start gap-1.5">
                      <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                      <span>Ad blocker detection may impact pixel accuracy</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                      <span>iOS 14+ privacy settings limiting attribution</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full bg-transparent gap-1.5 h-7 text-[10px]">
              <Sparkles className="h-3 w-3" />
              Generate Installation Plan
            </Button>
          </Card>
        </Card>
      </div>
    )
  } else {
    return (
      <div className="space-y-4">
        {/* Welcome Section */}
        <Card className="p-4 space-y-3 shadow-sm">
          <h2 className="text-[14px] font-semibold text-foreground">Welcome to AudienceOS</h2>
          <p className="text-[11px] text-muted-foreground">Your marketing fulfillment command center</p>

          {/* Video Player */}
          <div className="relative aspect-video bg-slate-950 rounded-md border border-border flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Play className="h-5 w-5 text-rose-500" />
              </div>
              <p className="text-[11px] text-slate-300">Welcome Video from Your Fulfillment Lead</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Click to watch</p>
            </div>
          </div>
        </Card>

        {/* Current Tracking Status */}
        <div>
          <h3 className="text-[12px] font-medium text-foreground mb-3">Current Tracking Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="p-3 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Meta Pixel</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              </div>
              <p className="text-lg font-bold text-foreground">98.2%</p>
              <p className="text-[9px] text-muted-foreground">Event Match Quality</p>
            </Card>

            <Card className="p-3 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Google Enhanced</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              </div>
              <p className="text-lg font-bold text-foreground">Active</p>
              <p className="text-[9px] text-muted-foreground">Server-side tracking</p>
            </Card>

            <Card className="p-3 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Ad Spend (30d)</span>
                <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-foreground">$45.2k</p>
              <p className="text-[9px] text-emerald-700 dark:text-emerald-400">+12% vs last month</p>
            </Card>
          </div>
        </div>

        {/* Next Steps */}
        <Card className="p-4 space-y-3 shadow-sm">
          <h3 className="text-[12px] font-medium text-foreground">Next Steps</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-2.5 bg-emerald-50 dark:bg-secondary/30 border border-emerald-200 dark:border-border rounded-md">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-foreground">Pixel Installation Complete</p>
                <p className="text-[9px] text-muted-foreground">Your Meta and Google tracking is live</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-md">
              <Circle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-foreground">Audit in Progress</p>
                <p className="text-[9px] text-muted-foreground">Luke is reviewing your conversion tracking setup</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 bg-secondary/30 border border-border rounded-md">
              <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-foreground">Weekly Sync Call</p>
                <p className="text-[9px] text-muted-foreground">Scheduled for Friday at 2pm EST</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }
}
