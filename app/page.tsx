"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardView } from "@/components/dashboard-view"
import { KanbanBoard } from "@/components/kanban-board"
import { ClientListView } from "@/components/client-list-view"
import { ClientDetailSheet } from "@/components/client-detail-sheet"
import { AIBar } from "@/components/ai-bar"
import { SettingsView } from "@/components/settings-view"
import { IntelligenceView } from "@/components/intelligence-view"
import { SupportTicketsView } from "@/components/support-tickets-view"
import { KnowledgeBaseView } from "@/components/knowledge-base-view"
import { IntegrationsView } from "@/components/integrations-view"
import { AutomationsView } from "@/components/automations-view"
import { OnboardingHubView } from "@/components/onboarding-hub-view"
import { QuickCreateDialogs } from "@/components/quick-create-dialogs"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { mockClients, type Client, type Stage } from "@/lib/mock-data"

export default function CommandCenter() {
  const [activeView, setActiveView] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [defaultTab, setDefaultTab] = useState<string>("overview")
  const [quickCreateType, setQuickCreateType] = useState<"client" | "ticket" | "project" | null>(null)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)

  // Local state for clients (enables optimistic updates)
  const [clients, setClients] = useState<Client[]>(mockClients)
  const { toast } = useToast()

  // Optimistic update handler for drag-drop
  const handleClientMove = (clientId: string, toStage: Stage) => {
    const client = clients.find((c) => c.id === clientId)
    if (!client) return

    const fromStage = client.stage

    // Optimistic update - update UI immediately
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, stage: toStage, daysInStage: 0 }
          : c
      )
    )

    // Show toast notification
    toast({
      title: "Client moved",
      description: `${client.name} moved from ${fromStage} to ${toStage}`,
    })

    // TODO: API call would go here
    // moveClientAPI(clientId, toStage).catch(() => {
    //   // Rollback on error
    //   setClients((prev) =>
    //     prev.map((c) =>
    //       c.id === clientId
    //         ? { ...c, stage: fromStage }
    //         : c
    //     )
    //   )
    //   toast({
    //     title: "Error",
    //     description: "Failed to move client. Changes reverted.",
    //     variant: "destructive",
    //   })
    // })
  }

  const handleClientClick = (client: Client, tab?: string) => {
    setSelectedClient(client)
    setDefaultTab(tab || "overview")
    setIsSheetOpen(true)
  }

  const handleOnboardingClientClick = (client: Client) => {
    handleClientClick(client, "techsetup")
  }

  const handleQuickCreate = (type: "client" | "ticket" | "project") => {
    setQuickCreateType(type)
    setQuickCreateOpen(true)
  }

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView clients={clients} onClientClick={handleClientClick} />
      case "pipeline":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
              <p className="text-muted-foreground">Drag and drop clients between stages</p>
            </div>
            <KanbanBoard
              clients={clients}
              onClientClick={handleClientClick}
              onClientMove={handleClientMove}
            />
          </div>
        )
      case "clients":
        return <ClientListView clients={clients} onClientClick={handleClientClick} />
      case "onboarding":
        return <OnboardingHubView onClientClick={handleOnboardingClientClick} />
      case "intelligence":
        return <IntelligenceView />
      case "tickets":
        return <SupportTicketsView />
      case "knowledge":
        return <KnowledgeBaseView />
      case "automations":
        return <AutomationsView />
      case "integrations":
        return <IntegrationsView />
      case "settings":
        return <SettingsView />
      default:
        return <DashboardView clients={mockClients} onClientClick={handleClientClick} />
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        onQuickCreate={handleQuickCreate}
      />
      <main className="flex-1 overflow-auto p-6 pb-32">{renderView()}</main>
      <ClientDetailSheet
        client={selectedClient}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        defaultTab={defaultTab}
      />
      <QuickCreateDialogs type={quickCreateType} open={quickCreateOpen} onOpenChange={setQuickCreateOpen} />
      <AIBar />
      <Toaster />
    </div>
  )
}
