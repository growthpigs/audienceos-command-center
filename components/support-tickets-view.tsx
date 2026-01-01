"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  LayoutGrid,
  List,
  Filter,
  Search,
  Sparkles,
  Brain,
  Send,
  MessageSquare,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  mockTickets,
  ticketStatuses,
  owners,
  mockClients,
  type SupportTicket,
  type TicketStatus,
} from "@/lib/mock-data"

function getPriorityColor(priority: string) {
  switch (priority) {
    case "High":
      return "bg-rose-500/20 text-rose-400 border-rose-500/30"
    case "Medium":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    case "Low":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getStatusColor(status: TicketStatus) {
  switch (status) {
    case "New":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "In Progress":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    case "Waiting on Client":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    case "Resolved":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getSentimentColor(sentiment: string) {
  switch (sentiment) {
    case "Frustrated":
      return "text-rose-400"
    case "Concerned":
      return "text-amber-400"
    case "Neutral":
      return "text-muted-foreground"
    case "Satisfied":
      return "text-emerald-400"
    default:
      return "text-muted-foreground"
  }
}

const mockTicketNotes = [
  {
    id: "1",
    sender: "Luke",
    message: "Checked GTM container, pixel ID looks correct but firing incorrectly.",
    timestamp: "2h ago",
  },
  {
    id: "2",
    sender: "Jeff",
    message: "Client mentioned they recently updated their theme. Could be related.",
    timestamp: "1h ago",
  },
  {
    id: "3",
    sender: "Garrett",
    message: "I'll reach out to their dev team to confirm theme changes.",
    timestamp: "30m ago",
  },
]

interface TicketCardProps {
  ticket: SupportTicket
  onClick: () => void
}

function TicketCard({ ticket, onClick }: TicketCardProps) {
  const owner = owners.find((o) => o.name === ticket.assignee)

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={onClick}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-foreground line-clamp-2">{ticket.title}</h4>
          <Badge variant="outline" className={cn("text-xs shrink-0", getPriorityColor(ticket.priority))}>
            {ticket.priority}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-secondary-foreground">{ticket.clientName.slice(0, 2)}</span>
          </div>
          <span className="text-xs text-muted-foreground truncate">{ticket.clientName}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className={cn("h-5 w-5", owner?.color)}>
              <AvatarFallback className={cn(owner?.color, "text-[10px] text-white")}>{owner?.avatar}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{ticket.createdAt}</span>
          </div>
          {ticket.source.includes("AI") && (
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] text-primary">AI</span>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">{ticket.source}</p>
      </CardContent>
    </Card>
  )
}

interface TicketDetailSheetProps {
  ticket: SupportTicket | null
  isOpen: boolean
  onClose: () => void
}

function TicketDetailSheet({ ticket, isOpen, onClose }: TicketDetailSheetProps) {
  const [noteInput, setNoteInput] = useState("")

  if (!ticket) return null

  const client = mockClients.find((c) => c.name === ticket.clientName)

  // Mock data for client context
  const clientSentiment =
    ticket.priority === "High" ? "Frustrated" : ticket.priority === "Medium" ? "Concerned" : "Neutral"
  const lastInstallStep = client?.tasks.filter((t) => t.completed).pop()?.name || "Initial Setup"

  // Mock AI root cause analysis
  const aiRootCause = ticket.title.toLowerCase().includes("pixel")
    ? "Pixel ID mismatch in GTM container. The Meta Pixel configured in GTM (ID: 1234567890) doesn't match the Pixel ID in the client's Meta Business Manager (ID: 9876543210)."
    : ticket.title.toLowerCase().includes("roas")
      ? "Conversion tracking disrupted after recent theme update. Server-side events are not firing correctly due to modified checkout flow."
      : "Issue requires further investigation. Recommend checking integration logs and client's recent platform changes."

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-card border-border w-full sm:max-w-[600px] overflow-y-auto p-0">
        <div className="p-6">
          <SheetHeader className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">#{ticket.id}</span>
              <Badge variant="outline" className={cn("text-xs", getStatusColor(ticket.status))}>
                {ticket.status}
              </Badge>
              <Badge variant="outline" className={cn("text-xs", getPriorityColor(ticket.priority))}>
                {ticket.priority}
              </Badge>
            </div>
            <SheetTitle className="text-foreground text-left text-lg">{ticket.title}</SheetTitle>
            <SheetDescription className="text-left">
              {ticket.clientName} • Assigned to {ticket.assignee}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-sm font-medium text-foreground">Client Context</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Current Sentiment</p>
                  <p className={cn("text-sm font-medium truncate", getSentimentColor(clientSentiment))}>
                    {clientSentiment}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Last Install Step</p>
                  <p className="text-sm font-medium text-foreground truncate">{lastInstallStep}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Health Status</p>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      client?.health === "Green" && "text-emerald-400",
                      client?.health === "Yellow" && "text-amber-400",
                      client?.health === "Red" && "text-rose-400",
                      client?.health === "Blocked" && "text-rose-400",
                    )}
                  >
                    {client?.health || "Unknown"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Days in Stage</p>
                  <p className="text-sm font-medium text-foreground">{client?.daysInStage || 0} days</p>
                </div>
              </div>
            </div>

            {/* Issue Description */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Issue Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {ticket.description ||
                  `${ticket.title}. The client reported this issue via ${ticket.source}. This ticket has been assigned to ${ticket.assignee} for resolution.`}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">AI Root Cause Analysis</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed break-words">{aiRootCause}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button size="sm" variant="outline" className="text-xs h-8 bg-transparent">
                  View Related SOPs
                </Button>
                <Button size="sm" variant="outline" className="text-xs h-8 bg-transparent">
                  Generate Fix Steps
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-foreground">Internal Notes</span>
                </div>
                <span className="text-xs text-muted-foreground">{mockTicketNotes.length} notes</span>
              </div>

              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {mockTicketNotes.map((note) => {
                  const noteOwner = owners.find((o) => o.name === note.sender)
                  return (
                    <div key={note.id} className="flex gap-3">
                      <Avatar className={cn("h-7 w-7 shrink-0", noteOwner?.color)}>
                        <AvatarFallback className={cn(noteOwner?.color, "text-xs text-white")}>
                          {noteOwner?.avatar || note.sender[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground">{note.sender}</span>
                          <span className="text-xs text-muted-foreground">{note.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 break-words">{note.message}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Note input */}
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Add an internal note..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="flex-1 bg-secondary border-border h-9"
                />
                <Button size="sm" className="h-9 bg-primary text-primary-foreground shrink-0">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button variant="outline" className="flex-1 bg-transparent">
                Escalate
              </Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">Mark Resolved</Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function SupportTicketsView() {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
  const [filterAssignee, setFilterAssignee] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)

  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesAssignee = filterAssignee === "all" || ticket.assignee === filterAssignee
    const matchesSearch =
      searchQuery === "" ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesAssignee && matchesSearch
  })

  const getTicketsByStatus = (status: TicketStatus) => filteredTickets.filter((t) => t.status === status)

  const handleTicketClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setIsDetailSheetOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground">Track and resolve client issues</p>
        </div>

        <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Ticket</DialogTitle>
              <DialogDescription>Add a new support ticket manually</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">
                  Title
                </Label>
                <Input id="title" placeholder="Describe the issue..." className="bg-secondary border-border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Client</Label>
                  <Select>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rta">RTA Outdoor Living</SelectItem>
                      <SelectItem value="vshred">V Shred</SelectItem>
                      <SelectItem value="beardbrand">Beardbrand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Priority</Label>
                  <Select>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Assignee</Label>
                <Select>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {owners.map((owner) => (
                      <SelectItem key={owner.name} value={owner.name}>
                        {owner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide more details..."
                  className="bg-secondary border-border min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewTicketOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-primary text-primary-foreground" onClick={() => setIsNewTicketOpen(false)}>
                Create Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-secondary rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 px-3", viewMode === "kanban" && "bg-background")}
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 px-3", viewMode === "list" && "bg-background")}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter by Assignee */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-[150px] bg-secondary border-border h-9">
                <SelectValue placeholder="Filter by assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {owners.map((owner) => (
                  <SelectItem key={owner.name} value={owner.name}>
                    {owner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary border-border h-9"
          />
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ticketStatuses.map((status) => {
            const statusTickets = getTicketsByStatus(status)
            return (
              <div key={status} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-xs", getStatusColor(status))}>
                      {status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{statusTickets.length}</span>
                  </div>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {statusTickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} onClick={() => handleTicketClick(ticket)} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Ticket</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Client</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Priority</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Assignee</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => {
                    const owner = owners.find((o) => o.name === ticket.assignee)
                    return (
                      <tr
                        key={ticket.id}
                        className="border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                        onClick={() => handleTicketClick(ticket)}
                      >
                        <td className="p-4">
                          <p className="text-sm font-medium text-foreground">{ticket.title}</p>
                          <p className="text-xs text-muted-foreground">{ticket.source}</p>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-foreground">{ticket.clientName}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={cn("text-xs", getStatusColor(ticket.status))}>
                            {ticket.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={cn("text-xs", getPriorityColor(ticket.priority))}>
                            {ticket.priority}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Avatar className={cn("h-5 w-5", owner?.color)}>
                              <AvatarFallback className={cn(owner?.color, "text-[10px] text-white")}>
                                {owner?.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-foreground">{ticket.assignee}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">{ticket.createdAt}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ticket Detail Sheet */}
      <TicketDetailSheet
        ticket={selectedTicket}
        isOpen={isDetailSheetOpen}
        onClose={() => setIsDetailSheetOpen(false)}
      />
    </div>
  )
}
