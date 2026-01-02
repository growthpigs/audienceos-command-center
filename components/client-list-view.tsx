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
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400"
    case "Yellow":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400"
    case "Red":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400"
    case "Blocked":
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getBlockerColor(blocker: string) {
  switch (blocker) {
    case "WAITING ON ACCESS":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400"
    case "WAITING ON DNS":
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400"
    case "DATA LAYER ERROR":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400"
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
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Clients</h1>
          <p className="text-[12px] text-muted-foreground">All clients and their current status</p>
        </div>
        <div className="relative w-48">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-[12px]"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-[11px] font-medium text-muted-foreground">{filteredClients.length} Clients</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-[10px] font-medium py-2 px-4">Client</TableHead>
                <TableHead className="text-muted-foreground text-[10px] font-medium py-2">Stage</TableHead>
                <TableHead className="text-muted-foreground text-[10px] font-medium py-2">Blocker</TableHead>
                <TableHead className="text-muted-foreground text-[10px] font-medium py-2">Health</TableHead>
                <TableHead className="text-muted-foreground text-[10px] font-medium py-2">Owner</TableHead>
                <TableHead className="text-muted-foreground text-[10px] font-medium py-2 text-right">Days</TableHead>
                <TableHead className="text-muted-foreground text-[10px] font-medium py-2 text-right">Tickets</TableHead>
                <TableHead className="text-muted-foreground text-[10px] font-medium py-2 text-right pr-4">Install</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => {
                const owner = owners.find((o) => o.name === client.owner)
                return (
                  <TableRow
                    key={client.id}
                    className="border-border cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onClientClick(client)}
                  >
                    <TableCell className="py-2 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-muted flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-semibold text-muted-foreground">{client.logo}</span>
                        </div>
                        <span className="text-[11px] font-medium text-foreground truncate">{client.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="text-[10px] text-muted-foreground">{client.stage}</span>
                    </TableCell>
                    <TableCell className="py-2">
                      {client.blocker ? (
                        <Badge
                          variant="outline"
                          className={cn("text-[9px] px-1 py-0 font-normal", getBlockerColor(client.blocker))}
                        >
                          {client.blocker}
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/50">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge className={cn("text-[9px] px-1 py-0 font-normal", getHealthBadgeColor(client.health))}>
                        {client.health}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1">
                        <Avatar className={cn("h-4 w-4", owner?.color)}>
                          <AvatarFallback className={cn(owner?.color, "text-[8px] text-white")}>
                            {owner?.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-muted-foreground">{client.owner}</span>
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "py-2 text-right text-[10px] tabular-nums text-muted-foreground",
                        client.daysInStage > 4 && "text-rose-600 dark:text-rose-400 font-medium",
                      )}
                    >
                      {client.daysInStage}
                    </TableCell>
                    <TableCell className="py-2 text-right text-[10px] tabular-nums text-muted-foreground">
                      {client.supportTickets}
                    </TableCell>
                    <TableCell className="py-2 text-right text-[10px] tabular-nums text-muted-foreground pr-4">
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
