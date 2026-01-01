"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, CheckCircle2, XCircle, RefreshCw, ExternalLink, Building2, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { mockClients } from "@/lib/mock-data"

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

function MetaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.239.76-.896 1.395-1.86 1.996-2.593l.992 1.393c.481.673 1.064 1.358 1.72 2.038 1.252 1.297 2.375 1.986 3.68 1.986 1.776 0 2.898-.768 3.594-1.927.245-.392.476-.903.627-1.621.136-.604.21-1.267.21-1.973 0-2.566-.703-5.24-2.044-7.306-1.188-1.833-2.903-3.113-4.871-3.113-.87 0-1.712.26-2.477.723-.652.39-1.27.928-1.834 1.608-.564-.68-1.181-1.217-1.834-1.608-.765-.463-1.606-.723-2.477-.723z" />
    </svg>
  )
}

function GoogleAdsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
    </svg>
  )
}

function ZoomIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.585 4.585C2.048 4.585 0 6.633 0 9.17v5.66c0 2.537 2.048 4.585 4.585 4.585h9.83c2.537 0 4.585-2.048 4.585-4.585V14l5 3.75V6.25L19 10V9.17c0-2.537-2.048-4.585-4.585-4.585h-9.83z" />
    </svg>
  )
}

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  connected: boolean
  lastSync?: string
}

interface ConfigModalState {
  isOpen: boolean
  integrationId: string | null
  integrationName: string
}

export function IntegrationsView() {
  const { toast } = useToast()

  const [scopeView, setScopeView] = useState<"agency" | "client">("agency")
  const [selectedClient, setSelectedClient] = useState<string>(mockClients[0]?.id || "")

  const [configModal, setConfigModal] = useState<ConfigModalState>({
    isOpen: false,
    integrationId: null,
    integrationName: "",
  })
  const [connectionTested, setConnectionTested] = useState(false)

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "slack",
      name: "Slack",
      description: "Sync client channels and messages",
      icon: <SlackIcon className="h-6 w-6 text-[#4A154B]" />,
      connected: true,
      lastSync: "2 minutes ago",
    },
    {
      id: "gmail",
      name: "Gmail",
      description: "Import client email communications",
      icon: <GmailIcon className="h-6 w-6 text-rose-500" />,
      connected: true,
      lastSync: "5 minutes ago",
    },
    {
      id: "meta",
      name: "Meta Ads",
      description: "Pull ad performance metrics",
      icon: <MetaIcon className="h-6 w-6 text-blue-500" />,
      connected: true,
      lastSync: "1 hour ago",
    },
    {
      id: "google-ads",
      name: "Google Ads",
      description: "Import Google advertising data",
      icon: <GoogleAdsIcon className="h-6 w-6 text-amber-500" />,
      connected: true,
      lastSync: "1 hour ago",
    },
    {
      id: "zoom",
      name: "Zoom",
      description: "Sync meeting recordings and transcripts",
      icon: <ZoomIcon className="h-6 w-6 text-blue-600" />,
      connected: false,
    },
  ])

  const [aiSettings, setAiSettings] = useState({
    autoTag: true,
    draftReplies: true,
    flagNegative: true,
  })

  const toggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, connected: !i.connected, lastSync: i.connected ? undefined : "Just now" } : i,
      ),
    )
    const integration = integrations.find((i) => i.id === id)
    toast({
      title: integration?.connected ? "Disconnected" : "Connected",
      description: `${integration?.name} has been ${integration?.connected ? "disconnected" : "connected"}.`,
    })
  }

  const openConfigModal = (integration: Integration) => {
    setConfigModal({
      isOpen: true,
      integrationId: integration.id,
      integrationName: integration.name,
    })
    setConnectionTested(false)
  }

  const handleTestConnection = () => {
    setConnectionTested(true)
    toast({
      title: "Connection Successful",
      description: `${configModal.integrationName} connection verified.`,
    })
  }

  const selectedClientData = mockClients.find((c) => c.id === selectedClient)

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="text-muted-foreground">Manage your connected services and AI settings</p>
        </div>

        <div className="flex items-center bg-secondary rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 px-3 gap-2", scopeView === "agency" && "bg-background")}
            onClick={() => setScopeView("agency")}
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Agency View</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 px-3 gap-2", scopeView === "client" && "bg-background")}
            onClick={() => setScopeView("client")}
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Client View</span>
          </Button>
        </div>
      </div>

      {scopeView === "client" && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Label className="text-foreground shrink-0">Select Client:</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-[280px] bg-secondary border-border">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-primary">{client.logo}</span>
                        </div>
                        {client.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedClientData && (
                <span className="text-xs text-muted-foreground">
                  Stage: <span className="text-foreground">{selectedClientData.stage}</span>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Cards Grid - Made cards clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <Card
            key={integration.id}
            className={cn(
              "bg-card border-border transition-all cursor-pointer",
              "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
            )}
            onClick={() => openConfigModal(integration)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">{integration.icon}</div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{integration.name}</h4>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {integration.connected ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-emerald-500">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Disconnected</span>
                    </>
                  )}
                </div>
                <Switch
                  checked={integration.connected}
                  onCheckedChange={() => toggleConnection(integration.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {integration.connected && integration.lastSync && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Last sync: {integration.lastSync}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        openConfigModal(integration)
                      }}
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={configModal.isOpen} onOpenChange={(open) => setConfigModal((prev) => ({ ...prev, isOpen: open }))}>
        <DialogContent className="bg-card border-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Configure {configModal.integrationName}
              {scopeView === "client" && selectedClientData && (
                <span className="text-muted-foreground font-normal"> for {selectedClientData.name}</span>
              )}
            </DialogTitle>
            <DialogDescription>
              {scopeView === "agency"
                ? "Configure agency-wide integration settings"
                : `Set up ${configModal.integrationName} specifically for ${selectedClientData?.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Meta Ads specific config */}
            {configModal.integrationId === "meta" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="adAccountId" className="text-foreground">
                    Ad Account ID
                  </Label>
                  <Input
                    id="adAccountId"
                    placeholder="act_123456789"
                    className="bg-secondary border-border"
                    defaultValue={
                      scopeView === "client" && selectedClientData ? "act_" + selectedClientData.id + "12345" : ""
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Select Pixel</Label>
                  <Select defaultValue={selectedClientData?.metaPixelId || "pixel1"}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Choose a pixel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={selectedClientData?.metaPixelId || "pixel1"}>
                        {selectedClientData?.metaPixelId || "Primary Pixel"} (Production)
                      </SelectItem>
                      <SelectItem value="pixel2">Pixel 98765432 (Testing)</SelectItem>
                      <SelectItem value="pixel3">Pixel 55667788 (Legacy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enable Daily ROAS Sync</p>
                    <p className="text-xs text-muted-foreground">Automatically pull ROAS data every 24 hours</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </>
            )}

            {/* Slack specific config */}
            {configModal.integrationId === "slack" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="channelId" className="text-foreground">
                    Default Channel
                  </Label>
                  <Select defaultValue="channel1">
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="channel1">
                        #client-{selectedClientData?.name.toLowerCase().replace(/\s+/g, "-") || "general"}
                      </SelectItem>
                      <SelectItem value="channel2">#support-tickets</SelectItem>
                      <SelectItem value="channel3">#team-alerts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Sync Message History</p>
                    <p className="text-xs text-muted-foreground">Import last 30 days of messages</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </>
            )}

            {/* Gmail specific config */}
            {configModal.integrationId === "gmail" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="emailFilter" className="text-foreground">
                    Email Filter
                  </Label>
                  <Input
                    id="emailFilter"
                    placeholder="from:client@example.com"
                    className="bg-secondary border-border"
                    defaultValue={
                      scopeView === "client"
                        ? `from:*@${selectedClientData?.name.toLowerCase().replace(/\s+/g, "")}.com`
                        : ""
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Auto-archive synced emails</p>
                    <p className="text-xs text-muted-foreground">Move processed emails to archive folder</p>
                  </div>
                  <Switch />
                </div>
              </>
            )}

            {/* Google Ads specific config */}
            {configModal.integrationId === "google-ads" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="customerId" className="text-foreground">
                    Customer ID
                  </Label>
                  <Input id="customerId" placeholder="123-456-7890" className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Campaign Scope</Label>
                  <Select defaultValue="all">
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Campaigns</SelectItem>
                      <SelectItem value="search">Search Only</SelectItem>
                      <SelectItem value="display">Display Only</SelectItem>
                      <SelectItem value="shopping">Shopping Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Zoom specific config */}
            {configModal.integrationId === "zoom" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="zoomEmail" className="text-foreground">
                    Zoom Account Email
                  </Label>
                  <Input id="zoomEmail" placeholder="user@audienceos.com" className="bg-secondary border-border" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Auto-transcribe recordings</p>
                    <p className="text-xs text-muted-foreground">Generate AI summaries from call recordings</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </>
            )}

            {/* Test Connection Button */}
            <div className="pt-2">
              <Button
                variant="outline"
                className={cn(
                  "w-full border-border",
                  connectionTested && "border-emerald-500 bg-emerald-500/10 text-emerald-400",
                )}
                onClick={handleTestConnection}
              >
                {connectionTested ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Connection Verified
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigModal((prev) => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground"
              onClick={() => {
                setConfigModal((prev) => ({ ...prev, isOpen: false }))
                toast({
                  title: "Configuration Saved",
                  description: `${configModal.integrationName} settings have been updated.`,
                })
              }}
            >
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">AI Settings</CardTitle>
          <CardDescription>Configure how AudienceOS Intelligence processes your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Auto-tag incoming messages</p>
              <p className="text-xs text-muted-foreground">
                Automatically categorize messages as Urgent, Bug, Feedback, etc.
              </p>
            </div>
            <Switch
              checked={aiSettings.autoTag}
              onCheckedChange={(checked) => setAiSettings((prev) => ({ ...prev, autoTag: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Draft replies automatically</p>
              <p className="text-xs text-muted-foreground">Generate suggested responses for client messages</p>
            </div>
            <Switch
              checked={aiSettings.draftReplies}
              onCheckedChange={(checked) => setAiSettings((prev) => ({ ...prev, draftReplies: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Flag negative sentiment</p>
              <p className="text-xs text-muted-foreground">
                Alert when client messages indicate frustration or urgency
              </p>
            </div>
            <Switch
              checked={aiSettings.flagNegative}
              onCheckedChange={(checked) => setAiSettings((prev) => ({ ...prev, flagNegative: checked }))}
            />
          </div>

          <div className="pt-4 border-t border-border">
            <Button variant="outline" className="border-border bg-transparent">
              <ExternalLink className="h-4 w-4 mr-2" />
              Manage SOPs for AI Training
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
