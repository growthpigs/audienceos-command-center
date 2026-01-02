"use client"

import { useState, useEffect, useMemo } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"
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
  GripVertical,
  RefreshCw,
  CheckCircle,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useTicketStore,
  TICKET_STATUSES,
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_CATEGORY_LABELS,
  type Ticket,
  type TicketStatus,
  type TicketPriority,
  type TicketCategory,
} from "@/stores/ticket-store"
import { useTicketSubscription, useTicketNotesSubscription } from "@/hooks/use-ticket-subscription"
import { toast } from "sonner"

// Priority styling
function getPriorityColor(priority: TicketPriority) {
  switch (priority) {
    case "critical":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30"
    case "high":
      return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30"
    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30"
    case "low":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
    default:
      return "bg-muted text-muted-foreground"
  }
}

// Status styling
function getStatusColor(status: TicketStatus) {
  switch (status) {
    case "new":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30"
    case "in_progress":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30"
    case "waiting_client":
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30"
    case "resolved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
    default:
      return "bg-muted text-muted-foreground"
  }
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return `${Math.floor(diffDays / 30)}mo ago`
}

// Draggable Ticket Card
interface DraggableTicketCardProps {
  ticket: Ticket
  onClick: () => void
  isDragOverlay?: boolean
}

function DraggableTicketCard({ ticket, onClick, isDragOverlay = false }: DraggableTicketCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket.id,
    data: { ticket },
  })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined

  if (isDragOverlay) {
    return (
      <div className="bg-card border border-border rounded-md p-3 cursor-grabbing transition-all shadow-lg ring-2 ring-primary/50 scale-105">
        <TicketCardContent ticket={ticket} />
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card border border-border rounded-md p-3 cursor-grab transition-all hover:border-primary/50 hover:bg-card/80 touch-none shadow-sm",
        isDragging && "opacity-30"
      )}
      onClick={(e) => {
        if (!isDragging) onClick()
      }}
    >
      <div className="flex items-start gap-1.5" {...attributes} {...listeners}>
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 cursor-grab mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <TicketCardContent ticket={ticket} />
        </div>
      </div>
    </div>
  )
}

// Shared ticket card content
function TicketCardContent({ ticket }: { ticket: Ticket }) {
  const assigneeName = ticket.assignee
    ? `${ticket.assignee.first_name} ${ticket.assignee.last_name}`
    : "Unassigned"
  const assigneeInitials = ticket.assignee
    ? `${ticket.assignee.first_name[0]}${ticket.assignee.last_name[0]}`
    : "?"

  return (
    <>
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="font-mono">#{ticket.number}</span>
        </div>
        <Badge variant="outline" className={cn("text-[9px] px-1 py-0 shrink-0", getPriorityColor(ticket.priority))}>
          {TICKET_PRIORITY_LABELS[ticket.priority]}
        </Badge>
      </div>

      <h4 className="text-[11px] font-medium text-foreground line-clamp-2 mb-1.5">{ticket.title}</h4>

      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-5 h-5 rounded bg-secondary flex items-center justify-center shrink-0">
          <span className="text-[9px] font-medium text-secondary-foreground">
            {ticket.client?.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground truncate">{ticket.client?.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Avatar className="h-4 w-4 bg-primary">
            <AvatarFallback className="text-[8px] text-primary-foreground bg-primary">
              {assigneeInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-[10px] text-muted-foreground">{formatRelativeTime(ticket.created_at)}</span>
        </div>
        <Badge variant="outline" className={cn("text-[9px] px-1 py-0", getStatusColor(ticket.status))}>
          {TICKET_STATUS_LABELS[ticket.status]}
        </Badge>
      </div>
    </>
  )
}

// Droppable Column
interface DroppableColumnProps {
  status: TicketStatus
  tickets: Ticket[]
  onTicketClick: (ticket: Ticket) => void
}

function DroppableColumn({ status, tickets, onTicketClick }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  return (
    <div className="w-full md:flex-shrink-0 md:w-64">
      <Card
        className={cn(
          "bg-secondary/30 border-border transition-colors duration-200 shadow-sm",
          isOver && "border-primary bg-primary/5 ring-2 ring-primary/20"
        )}
      >
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-[11px] font-medium flex items-center justify-between">
            <span className="text-foreground">{TICKET_STATUS_LABELS[status]}</span>
            <Badge variant="secondary" className="bg-muted text-muted-foreground text-[9px] px-1 py-0">
              {tickets.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent ref={setNodeRef} className="p-2 space-y-2 min-h-[350px]">
          {tickets.map((ticket) => (
            <DraggableTicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => onTicketClick(ticket)}
            />
          ))}
          {tickets.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-[11px]">No tickets</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Ticket Detail Sheet
interface TicketDetailSheetProps {
  ticket: Ticket | null
  isOpen: boolean
  onClose: () => void
}

function TicketDetailSheet({ ticket, isOpen, onClose }: TicketDetailSheetProps) {
  const [noteInput, setNoteInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { notes, isLoadingNotes, fetchNotes, addNote, resolveTicket, reopenTicket } = useTicketStore()
  const [showResolveDialog, setShowResolveDialog] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [timeSpent, setTimeSpent] = useState("")

  useEffect(() => {
    if (ticket?.id) {
      fetchNotes(ticket.id)
    }
  }, [ticket?.id, fetchNotes])

  // Subscribe to realtime note updates
  useTicketNotesSubscription(ticket?.id ?? null)

  if (!ticket) return null

  const handleAddNote = async () => {
    if (!noteInput.trim()) return

    setIsSubmitting(true)
    const result = await addNote(ticket.id, noteInput, true)
    setIsSubmitting(false)

    if (result) {
      setNoteInput("")
      toast.success("Note added")
    } else {
      toast.error("Failed to add note")
    }
  }

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      toast.error("Resolution notes are required")
      return
    }

    setIsSubmitting(true)
    const success = await resolveTicket(ticket.id, {
      resolution_notes: resolutionNotes,
      time_spent_minutes: timeSpent ? parseInt(timeSpent) : undefined,
    })
    setIsSubmitting(false)

    if (success) {
      setShowResolveDialog(false)
      setResolutionNotes("")
      setTimeSpent("")
      toast.success("Ticket resolved")
      onClose()
    } else {
      toast.error("Failed to resolve ticket")
    }
  }

  const handleReopen = async () => {
    setIsSubmitting(true)
    const success = await reopenTicket(ticket.id)
    setIsSubmitting(false)

    if (success) {
      toast.success("Ticket reopened")
    } else {
      toast.error("Failed to reopen ticket")
    }
  }

  const assigneeName = ticket.assignee
    ? `${ticket.assignee.first_name} ${ticket.assignee.last_name}`
    : "Unassigned"

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="bg-card border-border w-full sm:max-w-[500px] overflow-y-auto p-0">
          <div className="p-4">
            <SheetHeader className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground font-mono">#{ticket.number}</span>
                <Badge variant="outline" className={cn("text-[9px] px-1 py-0", getStatusColor(ticket.status))}>
                  {TICKET_STATUS_LABELS[ticket.status]}
                </Badge>
                <Badge variant="outline" className={cn("text-[9px] px-1 py-0", getPriorityColor(ticket.priority))}>
                  {TICKET_PRIORITY_LABELS[ticket.priority]}
                </Badge>
              </div>
              <SheetTitle className="text-foreground text-left text-[14px] font-semibold">{ticket.title}</SheetTitle>
              <SheetDescription className="text-left text-[11px]">
                {ticket.client?.name} • Assigned to {assigneeName}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-4 space-y-4">
              {/* Client Context */}
              <div className="p-3 rounded-md bg-secondary/30 border border-border space-y-2">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="text-[11px] font-medium text-foreground">Client Context</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground">Category</p>
                    <p className="text-[11px] font-medium text-foreground">
                      {TICKET_CATEGORY_LABELS[ticket.category]}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground">Created</p>
                    <p className="text-[11px] font-medium text-foreground">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {ticket.due_date && (
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">Due Date</p>
                      <p className="text-[11px] font-medium text-foreground">
                        {new Date(ticket.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {ticket.time_spent_minutes && (
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">Time Spent</p>
                      <p className="text-[11px] font-medium text-foreground">
                        {Math.floor(ticket.time_spent_minutes / 60)}h {ticket.time_spent_minutes % 60}m
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-[11px] font-medium text-foreground">Issue Description</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{ticket.description}</p>
              </div>

              {/* Resolution Notes (if resolved) */}
              {ticket.status === "resolved" && ticket.resolution_notes && (
                <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[11px] font-medium text-foreground">Resolution</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{ticket.resolution_notes}</p>
                  {ticket.resolved_at && (
                    <p className="text-[10px] text-muted-foreground">
                      Resolved on {new Date(ticket.resolved_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* AI Suggestion Panel */}
              <div className="p-3 rounded-md bg-muted/50 border border-border space-y-2">
                <div className="flex items-center gap-1.5">
                  <Brain className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-[11px] font-medium text-foreground">AI Assistance</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  AI-powered suggestions require Knowledge Base integration.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <Button size="sm" variant="outline" className="text-[10px] h-6 bg-transparent px-2" disabled>
                    <Sparkles className="h-2.5 w-2.5 mr-1" />
                    Suggest Solution
                  </Button>
                  <Button size="sm" variant="outline" className="text-[10px] h-6 bg-transparent px-2" disabled>
                    Draft Response
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[11px] font-medium text-foreground">Internal Notes</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{notes.length} notes</span>
                </div>

                <div className="space-y-2 max-h-[150px] overflow-y-auto">
                  {isLoadingNotes ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : notes.length > 0 ? (
                    notes.map((note) => {
                      const authorName = note.author
                        ? `${note.author.first_name} ${note.author.last_name}`
                        : "Unknown"
                      const authorInitials = note.author
                        ? `${note.author.first_name[0]}${note.author.last_name[0]}`
                        : "?"

                      return (
                        <div key={note.id} className="flex gap-2">
                          <Avatar className="h-5 w-5 shrink-0 bg-primary">
                            <AvatarFallback className="text-[8px] text-primary-foreground bg-primary">
                              {authorInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-medium text-foreground">{authorName}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {formatRelativeTime(note.created_at)}
                              </span>
                              {!note.is_internal && (
                                <Badge variant="outline" className="text-[8px] px-1 py-0">
                                  Client-facing
                                </Badge>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5 break-words">
                              {note.content}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-[11px] text-muted-foreground text-center py-3">No notes yet</p>
                  )}
                </div>

                {/* Note input */}
                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="Add an internal note..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="flex-1 bg-secondary border-border h-7 text-[11px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleAddNote()
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    className="h-7 w-7 p-0 bg-primary text-primary-foreground shrink-0"
                    onClick={handleAddNote}
                    disabled={isSubmitting || !noteInput.trim()}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-3 border-t border-border">
                {ticket.status === "resolved" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent h-8 text-[11px]"
                    onClick={handleReopen}
                    disabled={isSubmitting}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Reopen Ticket
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent h-8 text-[11px]">
                      Escalate
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-[11px]"
                      onClick={() => setShowResolveDialog(true)}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      Mark Resolved
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Resolution Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="bg-card border-border sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-foreground text-[14px] font-semibold">Resolve Ticket #{ticket.number}</DialogTitle>
            <DialogDescription className="text-[11px]">
              Please provide resolution notes. This will be recorded in the ticket history.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="resolution" className="text-foreground text-[11px]">
                Resolution Notes <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="resolution"
                placeholder="Describe how the issue was resolved..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="bg-secondary border-border min-h-[80px] text-[11px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time" className="text-foreground text-[11px]">
                Time Spent (minutes)
              </Label>
              <Input
                id="time"
                type="number"
                placeholder="Optional"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                className="bg-secondary border-border h-8 text-[11px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-[11px]"
              onClick={handleResolve}
              disabled={isSubmitting || !resolutionNotes.trim()}
            >
              {isSubmitting ? "Resolving..." : "Resolve Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Create Ticket Modal
interface CreateTicketModalProps {
  isOpen: boolean
  onClose: () => void
  clients: Array<{ id: string; name: string }>
  users: Array<{ id: string; name: string }>
}

function CreateTicketModal({ isOpen, onClose, clients, users }: CreateTicketModalProps) {
  const { createTicket } = useTicketStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    client_id: "",
    title: "",
    description: "",
    category: "general" as TicketCategory,
    priority: "medium" as TicketPriority,
    assignee_id: "",
  })

  const handleSubmit = async () => {
    if (!formData.client_id || !formData.title || !formData.description) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    const result = await createTicket({
      ...formData,
      assignee_id: formData.assignee_id || null,
    })
    setIsSubmitting(false)

    if (result) {
      toast.success(`Ticket #${result.number} created`)
      setFormData({
        client_id: "",
        title: "",
        description: "",
        category: "general",
        priority: "medium",
        assignee_id: "",
      })
      onClose()
    } else {
      toast.error("Failed to create ticket")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-foreground text-[14px] font-semibold">Create New Ticket</DialogTitle>
          <DialogDescription className="text-[11px]">Add a new support ticket</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-3">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-foreground text-[11px]">
              Title <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Describe the issue..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-secondary border-border h-8 text-[11px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-foreground text-[11px]">
                Client <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
              >
                <SelectTrigger className="bg-secondary border-border h-8 text-[11px]">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id} className="text-[11px]">
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground text-[11px]">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as TicketPriority })}
              >
                <SelectTrigger className="bg-secondary border-border h-8 text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" className="text-[11px]">Low</SelectItem>
                  <SelectItem value="medium" className="text-[11px]">Medium</SelectItem>
                  <SelectItem value="high" className="text-[11px]">High</SelectItem>
                  <SelectItem value="critical" className="text-[11px]">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-foreground text-[11px]">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as TicketCategory })}
              >
                <SelectTrigger className="bg-secondary border-border h-8 text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical" className="text-[11px]">Technical</SelectItem>
                  <SelectItem value="billing" className="text-[11px]">Billing</SelectItem>
                  <SelectItem value="campaign" className="text-[11px]">Campaign</SelectItem>
                  <SelectItem value="general" className="text-[11px]">General</SelectItem>
                  <SelectItem value="escalation" className="text-[11px]">Escalation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground text-[11px]">Assignee</Label>
              <Select
                value={formData.assignee_id}
                onValueChange={(value) => setFormData({ ...formData, assignee_id: value })}
              >
                <SelectTrigger className="bg-secondary border-border h-8 text-[11px]">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="text-[11px]">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="text-[11px]">
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-foreground text-[11px]">
              Description <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide more details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-secondary border-border min-h-[80px] text-[11px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground h-8 text-[11px]"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Main View Component
export function SupportTicketsView() {
  const {
    tickets,
    isLoading,
    error,
    viewMode,
    filters,
    selectedTicket,
    fetchTickets,
    getFilteredTickets,
    getTicketsByStatus,
    changeStatus,
    setViewMode,
    setFilter,
    selectTicket,
    getNewTicketCount,
  } = useTicketStore()

  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)

  // Derive clients and users from tickets - in production, fetch from API
  const clients = useMemo(() => {
    return tickets.reduce((acc, ticket) => {
      if (ticket.client && !acc.find((c) => c.id === ticket.client?.id)) {
        acc.push({ id: ticket.client.id, name: ticket.client.name })
      }
      return acc
    }, [] as Array<{ id: string; name: string }>)
  }, [tickets])

  const users = useMemo(() => {
    return tickets.reduce((acc, ticket) => {
      if (ticket.assignee && !acc.find((u) => u.id === ticket.assignee?.id)) {
        acc.push({
          id: ticket.assignee.id,
          name: `${ticket.assignee.first_name} ${ticket.assignee.last_name}`,
        })
      }
      return acc
    }, [] as Array<{ id: string; name: string }>)
  }, [tickets])

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Subscribe to realtime ticket updates
  useTicketSubscription()

  // Fetch tickets on mount
  useEffect(() => {
    fetchTickets()

    // TODO: Fetch clients and users from API
    // For now, extract unique clients from tickets
  }, [fetchTickets])


  const filteredTickets = getFilteredTickets()

  const handleTicketClick = (ticket: Ticket) => {
    selectTicket(ticket)
    setIsDetailSheetOpen(true)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const ticket = tickets.find((t) => t.id === event.active.id)
    if (ticket) {
      setActiveTicket(ticket)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTicket(null)

    if (!over) return

    const ticketId = active.id as string
    const newStatus = over.id as TicketStatus

    const draggedTicket = tickets.find((t) => t.id === ticketId)
    if (!draggedTicket || draggedTicket.status === newStatus) return

    // Special handling for resolved status
    if (newStatus === "resolved") {
      selectTicket(draggedTicket)
      setIsDetailSheetOpen(true)
      toast.info("Use the resolve button to add resolution notes")
      return
    }

    const success = await changeStatus(ticketId, newStatus)
    if (success) {
      toast.success(`Ticket moved to ${TICKET_STATUS_LABELS[newStatus]}`)
    } else {
      toast.error("Failed to update ticket status")
    }
  }

  if (isLoading && tickets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          {TICKET_STATUSES.map((status) => (
            <div key={status} className="w-full md:flex-shrink-0 md:w-72">
              <Card className="bg-secondary/30 border-border">
                <CardHeader className="py-3 px-4">
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent className="p-2 space-y-2 min-h-[400px]">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Failed to load tickets</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => fetchTickets()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Support Tickets</h1>
          <p className="text-[12px] text-muted-foreground">Track and resolve client issues</p>
        </div>

        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-[11px]"
          onClick={() => setIsNewTicketOpen(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Ticket
        </Button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-secondary rounded-md p-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 px-2", viewMode === "kanban" && "bg-background")}
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 px-2", viewMode === "list" && "bg-background")}
              onClick={() => setViewMode("list")}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Filter by Priority */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <Select
              value={filters.priority}
              onValueChange={(value) => setFilter("priority", value as TicketPriority | "all")}
            >
              <SelectTrigger className="w-[120px] bg-secondary border-border h-7 text-[10px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[11px]">All Priorities</SelectItem>
                <SelectItem value="critical" className="text-[11px]">Critical</SelectItem>
                <SelectItem value="high" className="text-[11px]">High</SelectItem>
                <SelectItem value="medium" className="text-[11px]">Medium</SelectItem>
                <SelectItem value="low" className="text-[11px]">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            className="pl-8 bg-secondary border-border h-8 text-[11px]"
          />
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col gap-4 md:flex-row md:overflow-x-auto md:pb-4">
            {TICKET_STATUSES.map((status) => {
              const statusTickets = filteredTickets.filter((t) => t.status === status)
              return (
                <DroppableColumn
                  key={status}
                  status={status}
                  tickets={statusTickets}
                  onTicketClick={handleTicketClick}
                />
              )
            })}
          </div>

          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            }}
          >
            {activeTicket ? (
              <DraggableTicketCard ticket={activeTicket} onClick={() => {}} isDragOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground">#</th>
                    <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground">Ticket</th>
                    <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground">Client</th>
                    <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground">Priority</th>
                    <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground">Assignee</th>
                    <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => {
                    const assigneeName = ticket.assignee
                      ? `${ticket.assignee.first_name} ${ticket.assignee.last_name}`
                      : "Unassigned"
                    const assigneeInitials = ticket.assignee
                      ? `${ticket.assignee.first_name[0]}${ticket.assignee.last_name[0]}`
                      : "?"

                    return (
                      <tr
                        key={ticket.id}
                        className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleTicketClick(ticket)}
                      >
                        <td className="py-2 px-3">
                          <span className="text-[10px] text-muted-foreground font-mono">#{ticket.number}</span>
                        </td>
                        <td className="py-2 px-3">
                          <p className="text-[11px] font-medium text-foreground line-clamp-1">{ticket.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {TICKET_CATEGORY_LABELS[ticket.category]}
                          </p>
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-[11px] text-foreground">{ticket.client?.name}</span>
                        </td>
                        <td className="py-2 px-3">
                          <Badge variant="outline" className={cn("text-[9px] px-1 py-0", getStatusColor(ticket.status))}>
                            {TICKET_STATUS_LABELS[ticket.status]}
                          </Badge>
                        </td>
                        <td className="py-2 px-3">
                          <Badge variant="outline" className={cn("text-[9px] px-1 py-0", getPriorityColor(ticket.priority))}>
                            {TICKET_PRIORITY_LABELS[ticket.priority]}
                          </Badge>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-4 w-4 bg-primary">
                              <AvatarFallback className="text-[8px] text-primary-foreground bg-primary">
                                {assigneeInitials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] text-foreground">{assigneeName}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(ticket.created_at)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-muted-foreground text-[11px]">
                        No tickets found
                      </td>
                    </tr>
                  )}
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
        onClose={() => {
          setIsDetailSheetOpen(false)
          selectTicket(null)
        }}
      />

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        clients={clients}
        users={users}
      />
    </div>
  )
}
