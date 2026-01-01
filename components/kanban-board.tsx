"use client"

import { useState } from "react"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, GripVertical, AlertTriangle, RefreshCw } from "lucide-react"
import { type Client, type Stage, stages, owners } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { StageConfirmModal, isSensitiveStage } from "@/components/stage-confirm-modal"

interface KanbanBoardProps {
  clients: Client[]
  onClientClick: (client: Client) => void
  onClientMove?: (clientId: string, toStage: Stage, notes?: string) => void
}

// Pending move state for confirmation modal
interface PendingMove {
  clientId: string
  client: Client
  fromStage: Stage
  toStage: Stage
}

// Helper functions for styling
function getHealthDotColor(health: string) {
  switch (health) {
    case "Green":
      return "bg-emerald-500"
    case "Yellow":
      return "bg-amber-500"
    case "Red":
      return "bg-rose-500"
    case "Blocked":
      return "bg-purple-500"
    default:
      return "bg-muted"
  }
}

function getHealthBorderColor(health: string) {
  switch (health) {
    case "Green":
      return "border-l-emerald-500"
    case "Yellow":
      return "border-l-amber-500"
    case "Red":
      return "border-l-rose-500"
    case "Blocked":
      return "border-l-purple-500"
    default:
      return "border-l-border"
  }
}

function getTierBadgeStyle(tier: string) {
  switch (tier) {
    case "Enterprise":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    case "Core":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "Starter":
      return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getDaysColor(days: number) {
  if (days > 4) return "text-rose-500 font-semibold bg-rose-500/10 px-2 py-0.5 rounded"
  return "text-muted-foreground"
}

function getBlockerColor(blocker: string | null | undefined) {
  switch (blocker) {
    case "WAITING ON ACCESS":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    case "WAITING ON DNS":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    case "DATA LAYER ERROR":
      return "bg-rose-500/20 text-rose-400 border-rose-500/30"
    case "CODE NOT INSTALLED":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    default:
      return ""
  }
}

// Draggable Client Card Component
interface DraggableClientCardProps {
  client: Client
  onClick: () => void
  isDragOverlay?: boolean
}

function DraggableClientCard({ client, onClick, isDragOverlay = false }: DraggableClientCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: client.id,
    data: { client },
  })

  const owner = owners.find((o) => o.name === client.owner)

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined

  // If this is the overlay version, don't use drag attributes
  if (isDragOverlay) {
    return (
      <div
        className={cn(
          "bg-card border border-border rounded-lg p-3 cursor-grabbing transition-all",
          "border-l-4 shadow-xl ring-2 ring-primary/50 scale-105",
          getHealthBorderColor(client.health)
        )}
      >
        <ClientCardContent client={client} owner={owner} />
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card border border-border rounded-lg p-3 cursor-grab transition-all hover:border-primary/50 hover:bg-card/80",
        "border-l-4 touch-none",
        getHealthBorderColor(client.health),
        isDragging && "opacity-30"
      )}
      onClick={(e) => {
        // Only trigger click if not dragging
        if (!isDragging) onClick()
      }}
    >
      <div className="flex items-start gap-2 mb-3" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/client/${client.id}`}
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded bg-secondary flex items-center justify-center shrink-0 hover:ring-2 hover:ring-primary transition-all"
            >
              <span className="text-xs font-bold text-secondary-foreground">{client.logo}</span>
            </Link>
            <Link
              href={`/client/${client.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-sm text-foreground truncate hover:text-primary transition-colors"
            >
              {client.name}
            </Link>
          </div>
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", getTierBadgeStyle(client.tier))}>
            {client.tier}
          </Badge>
        </div>
      </div>

      <ClientCardContent client={client} owner={owner} />
    </div>
  )
}

// Shared card content (used by both draggable and overlay)
function ClientCardContent({
  client,
  owner,
}: {
  client: Client
  owner: { name: string; avatar: string; color: string } | undefined
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Avatar className={cn("h-6 w-6", owner?.color)}>
            <AvatarFallback className={cn(owner?.color, "text-xs text-white")}>{owner?.avatar}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{client.owner}</span>
        </div>
        <div className={cn("text-sm tabular-nums font-semibold", getDaysColor(client.daysInStage))}>
          {client.daysInStage} {client.daysInStage === 1 ? "Day" : "Days"}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {client.blocker && (
            <Badge
              variant="outline"
              className={cn("text-[10px] px-1.5 py-0 shrink-0", getBlockerColor(client.blocker))}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {client.blocker}
            </Badge>
          )}
          {client.health !== "Blocked" && client.statusNote && (
            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{client.statusNote}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={cn("w-2.5 h-2.5 rounded-full", getHealthDotColor(client.health))} title={client.health} />
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </>
  )
}

// Droppable Column Component
interface DroppableColumnProps {
  stage: Stage
  clients: Client[]
  onClientClick: (client: Client) => void
}

const CARDS_PER_PAGE = 10

function DroppableColumn({ stage, clients, onClientClick }: DroppableColumnProps) {
  const [showAll, setShowAll] = useState(false)
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  })

  const visibleClients = showAll ? clients : clients.slice(0, CARDS_PER_PAGE)
  const hiddenCount = clients.length - CARDS_PER_PAGE
  const hasMore = clients.length > CARDS_PER_PAGE

  return (
    <div className="w-full md:flex-shrink-0 md:w-72">
      <Card className={cn(
        "bg-secondary/30 border-border transition-colors duration-200",
        isOver && "border-primary bg-primary/5 ring-2 ring-primary/20"
      )}>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span className="text-foreground">{stage}</span>
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              {clients.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent ref={setNodeRef} className="p-2 space-y-2 min-h-[400px]">
          {visibleClients.map((client) => (
            <DraggableClientCard
              key={client.id}
              client={client}
              onClick={() => onClientClick(client)}
            />
          ))}

          {/* Show more/less button */}
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>Show less</>
              ) : (
                <>+{hiddenCount} more</>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Main KanbanBoard Component
export function KanbanBoard({ clients, onClientClick, onClientMove }: KanbanBoardProps) {
  const [activeClient, setActiveClient] = useState<Client | null>(null)
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Configure sensors for drag detection
  // PointerSensor requires 8px of movement to start drag (prevents accidental drags)
  // KeyboardSensor enables keyboard-based drag for accessibility
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const getClientsForStage = (stage: Stage) => clients.filter((c) => c.stage === stage)

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const client = clients.find((c) => c.id === active.id)
    if (client) {
      setActiveClient(client)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    setActiveClient(null)

    if (!over) return

    const clientId = active.id as string
    const newStage = over.id as Stage

    // Find the client being dragged
    const draggedClient = clients.find((c) => c.id === clientId)
    if (!draggedClient) return

    // Don't do anything if dropped on the same stage
    if (draggedClient.stage === newStage) return

    // Check if moving to a sensitive stage - show confirmation modal
    if (isSensitiveStage(newStage)) {
      setPendingMove({
        clientId,
        client: draggedClient,
        fromStage: draggedClient.stage,
        toStage: newStage,
      })
      setShowConfirmModal(true)
      return
    }

    // Call the onClientMove callback if provided (non-sensitive move)
    if (onClientMove) {
      onClientMove(clientId, newStage)
    }
  }

  function handleConfirmMove(notes?: string) {
    if (pendingMove && onClientMove) {
      onClientMove(pendingMove.clientId, pendingMove.toStage, notes)
    }
    setPendingMove(null)
    setShowConfirmModal(false)
  }

  function handleCancelMove() {
    setPendingMove(null)
    setShowConfirmModal(false)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Mobile: vertical stack, Desktop: horizontal scroll */}
      <div className="flex flex-col gap-4 md:flex-row md:overflow-x-auto md:pb-4">
        {stages.map((stage) => (
          <DroppableColumn
            key={stage}
            stage={stage}
            clients={getClientsForStage(stage)}
            onClientClick={onClientClick}
          />
        ))}
      </div>

      {/* Drag Overlay - renders the card being dragged */}
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
      }}>
        {activeClient ? (
          <DraggableClientCard
            client={activeClient}
            onClick={() => {}}
            isDragOverlay
          />
        ) : null}
      </DragOverlay>

      {/* Stage Confirmation Modal for sensitive stages */}
      {pendingMove && (
        <StageConfirmModal
          open={showConfirmModal}
          onOpenChange={setShowConfirmModal}
          clientName={pendingMove.client.name}
          fromStage={pendingMove.fromStage}
          toStage={pendingMove.toStage}
          onConfirm={handleConfirmMove}
          onCancel={handleCancelMove}
        />
      )}
    </DndContext>
  )
}

// Skeleton loading state for KanbanBoard
function KanbanCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  )
}

function KanbanColumnSkeleton() {
  return (
    <div className="w-full md:flex-shrink-0 md:w-72">
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="p-2 space-y-2 min-h-[400px]">
          {[1, 2, 3].map((i) => (
            <KanbanCardSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function KanbanBoardSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:overflow-x-auto md:pb-4">
      {stages.map((stage) => (
        <KanbanColumnSkeleton key={stage} />
      ))}
    </div>
  )
}

// Error state for KanbanBoard
interface KanbanBoardErrorProps {
  error: string
  onRetry?: () => void
}

export function KanbanBoardError({ error, onRetry }: KanbanBoardErrorProps) {
  return (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Failed to load pipeline</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        )}
      </div>
    </Card>
  )
}

// Empty state for KanbanBoard
export function KanbanBoardEmpty({ message = "No clients found" }: { message?: string }) {
  return (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl">📋</div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No clients</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </Card>
  )
}
