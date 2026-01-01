"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import { type Client, owners } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface ClientListViewProps {
  clients: Client[]
  onClientClick: (client: Client) => void
}

function getHealthBadgeColor(health: string) {
  switch (health) {
    case "Green":
      return "bg-status-green text-emerald-950"
    case "Yellow":
      return "bg-status-yellow text-amber-950"
    case "Red":
      return "bg-status-red text-red-950"
    case "Blocked":
      return "bg-status-blocked text-purple-950"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getBlockerColor(blocker: string) {
  // Placeholder function for determining blocker badge color
  switch (blocker) {
    case "High":
      return "bg-status-high text-red-950"
    case "Medium":
      return "bg-status-medium text-amber-950"
    case "Low":
      return "bg-status-low text-emerald-950"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function ClientListView({ clients, onClientClick }: ClientListViewProps) {
  const [search, setSearch] = useState("")

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.owner.toLowerCase().includes(search.toLowerCase()) ||
      client.stage.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client List</h1>
          <p className="text-muted-foreground">All clients and their current status</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">{filteredClients.length} Clients</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs py-2">Client</TableHead>
                <TableHead className="text-muted-foreground text-xs py-2">Stage</TableHead>
                <TableHead className="text-muted-foreground text-xs py-2">Blocker</TableHead>
                <TableHead className="text-muted-foreground text-xs py-2">Health</TableHead>
                <TableHead className="text-muted-foreground text-xs py-2">Owner</TableHead>
                <TableHead className="text-muted-foreground text-xs py-2 text-right">Days</TableHead>
                <TableHead className="text-muted-foreground text-xs py-2 text-right">Tickets</TableHead>
                <TableHead className="text-muted-foreground text-xs py-2 text-right">Install</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => {
                const owner = owners.find((o) => o.name === client.owner)
                return (
                  <TableRow
                    key={client.id}
                    className="border-border cursor-pointer hover:bg-secondary/50 h-10"
                    onClick={() => onClientClick(client)}
                  >
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-secondary-foreground">{client.logo}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground truncate">{client.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge variant="outline" className="text-[10px] border-border text-foreground px-1.5 py-0">
                        {client.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      {client.blocker ? (
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] px-1.5 py-0", getBlockerColor(client.blocker))}
                        >
                          {client.blocker}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge className={cn("text-[10px] px-1.5 py-0", getHealthBadgeColor(client.health))}>
                        {client.health}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1.5">
                        <Avatar className={cn("h-5 w-5", owner?.color)}>
                          <AvatarFallback className={cn(owner?.color, "text-[10px] text-white")}>
                            {owner?.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-foreground">{client.owner}</span>
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "py-2 text-right text-xs tabular-nums",
                        client.daysInStage > 4 && "text-rose-500 font-semibold",
                      )}
                    >
                      {client.daysInStage}
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs tabular-nums text-foreground">
                      {client.supportTickets}
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs tabular-nums text-foreground">
                      {client.installTime > 0 ? client.installTime : "-"}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
