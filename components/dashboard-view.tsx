"use client"

import { KPICards } from "./kpi-cards"
import { OverviewChart } from "./overview-chart"
import { DataHealthDashboard } from "./data-health-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { type Client, owners, getKPIs } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface DashboardViewProps {
  clients: Client[]
  onClientClick: (client: Client) => void
}

function getHealthColor(health: string) {
  switch (health) {
    case "Green":
      return "text-status-green"
    case "Yellow":
      return "text-status-yellow"
    case "Red":
      return "text-status-red"
    case "Blocked":
      return "text-status-blocked"
    default:
      return "text-muted-foreground"
  }
}

export function DashboardView({ clients, onClientClick }: DashboardViewProps) {
  const kpis = getKPIs(clients)
  const atRiskClients = clients.filter((c) => c.health === "Red" || c.health === "Blocked")

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
        <p className="text-muted-foreground">Real-time overview of client fulfillment operations</p>
      </div>

      {/* KPI Cards */}
      <KPICards {...kpis} />

      {/* Data Health Dashboard with technical metrics */}
      <DataHealthDashboard />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <OverviewChart />
        </div>

        {/* At Risk Clients */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="text-foreground">Clients Needing Attention</span>
              <Badge variant="destructive" className="bg-status-red text-red-950">
                {atRiskClients.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {atRiskClients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">All clients are healthy!</p>
            ) : (
              atRiskClients.map((client) => {
                const owner = owners.find((o) => o.name === client.owner)
                return (
                  <button
                    key={client.id}
                    onClick={() => onClientClick(client)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-secondary-foreground">{client.logo}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{client.statusNote || client.stage}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className={cn("h-5 w-5", owner?.color)}>
                        <AvatarFallback className={cn(owner?.color, "text-xs text-white")}>
                          {owner?.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn("text-xs font-medium", getHealthColor(client.health))}>{client.health}</span>
                    </div>
                  </button>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
