"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TicketIcon, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  useTicketStore,
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  type TicketCategory,
  type TicketPriority,
} from "@/stores/ticket-store"
import { usePipelineStore } from "@/stores/pipeline-store"
import { useSettingsStore } from "@/stores/settings-store"

interface AddTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddTicketModal({
  isOpen,
  onClose,
  onSuccess,
}: AddTicketModalProps) {
  const { toast } = useToast()
  const { createTicket, fetchTickets } = useTicketStore()
  const { clients } = usePipelineStore()
  const { teamMembers, fetchTeamMembers } = useSettingsStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [title, setTitle] = useState("")
  const [clientId, setClientId] = useState("")
  const [category, setCategory] = useState<TicketCategory>("general")
  const [priority, setPriority] = useState<TicketPriority>("medium")
  const [description, setDescription] = useState("")
  const [assigneeId, setAssigneeId] = useState("")
  const [dueDate, setDueDate] = useState("")

  // Load team members when modal opens
  useEffect(() => {
    if (isOpen && teamMembers.length === 0) {
      fetchTeamMembers()
    }
  }, [isOpen, teamMembers.length, fetchTeamMembers])

  // Reset form to initial state
  const resetForm = () => {
    setTitle("")
    setClientId("")
    setCategory("general")
    setPriority("medium")
    setDescription("")
    setAssigneeId("")
    setDueDate("")
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!title.trim()) {
      setError("Title is required")
      return
    }
    if (!clientId) {
      setError("Client is required")
      return
    }

    setIsSubmitting(true)

    try {
      const ticket = await createTicket({
        title: title.trim(),
        client_id: clientId,
        category,
        priority,
        description: description.trim(),
        assignee_id: assigneeId || null,
        due_date: dueDate || null,
      })

      if (!ticket) {
        throw new Error("Failed to create ticket")
      }

      toast({
        title: "Ticket created",
        description: `"${title}" has been added to support tickets.`,
        variant: "default",
      })

      // Reset form and close
      resetForm()

      // Refresh ticket list
      await fetchTickets()

      onClose()
      onSuccess?.()
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create ticket. Please try again."
      setError(errorMessage)
      toast({
        title: "Error creating ticket",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TicketIcon className="h-4 w-4" />
            Add Ticket
          </DialogTitle>
          <DialogDescription>
            Create a new support ticket. It will be added with &quot;New&quot; status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="ticket-title" className="text-sm">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ticket-title"
              type="text"
              placeholder="Brief description of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="h-9"
              autoFocus
            />
          </div>

          {/* Client and Category - two column */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ticket-client" className="text-sm">
                Client <span className="text-red-500">*</span>
              </Label>
              <Select
                value={clientId}
                onValueChange={setClientId}
                disabled={isSubmitting}
              >
                <SelectTrigger id="ticket-client" className="h-9">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-category" className="text-sm">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as TicketCategory)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="ticket-category" className="h-9">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(TICKET_CATEGORY_LABELS) as [TicketCategory, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority and Assignee - two column */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ticket-priority" className="text-sm">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as TicketPriority)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="ticket-priority" className="h-9">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(TICKET_PRIORITY_LABELS) as [TicketPriority, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-assignee" className="text-sm">
                Assignee
              </Label>
              <Select
                value={assigneeId}
                onValueChange={setAssigneeId}
                disabled={isSubmitting}
              >
                <SelectTrigger id="ticket-assignee" className="h-9">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="ticket-due-date" className="text-sm">
              Due Date
            </Label>
            <Input
              id="ticket-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isSubmitting}
              className="h-9"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="ticket-description" className="text-sm">
              Description
            </Label>
            <Textarea
              id="ticket-description"
              placeholder="Detailed description of the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-2 py-2 px-3 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-500">{error}</p>
            </div>
          )}

          {/* Actions */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !clientId}
              className="h-9 gap-1.5"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Add Ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
