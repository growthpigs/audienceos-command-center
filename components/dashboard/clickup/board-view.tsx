"use client"

import { MoreHorizontal, Plus } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  status: "todo" | "in_progress" | "done" | "blocked"
  priority: "low" | "medium" | "high" | "urgent"
  assignee?: {
    name: string
    initials: string
    color: string
  }
  client?: string
  dueDate?: string
  tags?: string[]
}

interface BoardViewProps {
  tasks?: Task[]
  onTaskClick?: (task: Task) => void
  onAddTask?: (status: Task["status"]) => void
}

const defaultTasks: Task[] = [
  {
    id: "1",
    title: "Complete DNS setup for RTA Outdoor Living",
    status: "in_progress",
    priority: "high",
    assignee: { name: "Luke Thompson", initials: "LT", color: "bg-emerald-500" },
    client: "RTA Outdoor Living",
    dueDate: "2025-01-03",
    tags: ["Installation", "Technical"],
  },
  {
    id: "2",
    title: "Review quarterly metrics report",
    status: "todo",
    priority: "medium",
    assignee: { name: "Alex Smith", initials: "AS", color: "bg-blue-500" },
    client: "Terren",
    dueDate: "2025-01-06",
    tags: ["Review"],
  },
  {
    id: "3",
    title: "Pixel installation verification",
    status: "in_progress",
    priority: "high",
    assignee: { name: "Jordan Fields", initials: "JF", color: "bg-purple-500" },
    client: "Alo Yoga",
    dueDate: "2025-01-07",
    tags: ["Technical", "Verification"],
  },
  {
    id: "4",
    title: "Prepare launch checklist",
    status: "done",
    priority: "urgent",
    assignee: { name: "Luke Thompson", initials: "LT", color: "bg-emerald-500" },
    client: "Glow Recipe",
    dueDate: "2025-01-08",
    tags: ["Launch"],
  },
  {
    id: "5",
    title: "Resolve support ticket #4521",
    status: "blocked",
    priority: "high",
    assignee: { name: "Sam Lee", initials: "SL", color: "bg-amber-500" },
    client: "Beardbrand",
    dueDate: "2025-01-04",
    tags: ["Support", "Urgent"],
  },
  {
    id: "6",
    title: "Monthly performance report",
    status: "todo",
    priority: "medium",
    assignee: { name: "Alex Smith", initials: "AS", color: "bg-blue-500" },
    client: "MVMT Watches",
    dueDate: "2025-01-10",
    tags: ["Report"],
  },
  {
    id: "7",
    title: "Client onboarding call",
    status: "todo",
    priority: "medium",
    assignee: { name: "Jordan Fields", initials: "JF", color: "bg-purple-500" },
    client: "Ruggable",
    dueDate: "2025-01-05",
    tags: ["Onboarding", "Meeting"],
  },
  {
    id: "8",
    title: "Data layer audit",
    status: "in_progress",
    priority: "high",
    assignee: { name: "Luke Thompson", initials: "LT", color: "bg-emerald-500" },
    client: "V Shred",
    dueDate: "2025-01-04",
    tags: ["Audit", "Technical"],
  },
]

const columns: { id: Task["status"]; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "bg-gray-500" },
  { id: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { id: "done", label: "Done", color: "bg-emerald-500" },
  { id: "blocked", label: "Blocked", color: "bg-red-500" },
]

function getPriorityBadge(priority: Task["priority"]) {
  switch (priority) {
    case "urgent":
      return { label: "Urgent", class: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" }
    case "high":
      return { label: "High", class: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" }
    case "medium":
      return { label: "Medium", class: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" }
    case "low":
      return { label: "Low", class: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400" }
  }
}

function TaskCard({ task, onClick }: { task: Task; onClick?: () => void }) {
  const priorityBadge = getPriorityBadge(task.priority)

  return (
    <Card
      className="bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2">
        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 2).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0 font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h4 className="text-sm font-medium text-foreground line-clamp-2">{task.title}</h4>

        {/* Client */}
        {task.client && (
          <p className="text-xs text-muted-foreground">{task.client}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <Badge variant="secondary" className={cn("text-[9px] px-1.5 py-0", priorityBadge.class)}>
            {priorityBadge.label}
          </Badge>

          <div className="flex items-center gap-2">
            {task.dueDate && (
              <span className="text-[10px] text-muted-foreground">
                {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
            {task.assignee && (
              <Avatar className={cn("h-5 w-5", task.assignee.color)}>
                <AvatarFallback className={cn(task.assignee.color, "text-[8px] font-medium text-white")}>
                  {task.assignee.initials}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BoardColumn({
  column,
  tasks,
  onTaskClick,
  onAddTask,
}: {
  column: typeof columns[0]
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onAddTask?: () => void
}) {
  return (
    <div className="flex-1 min-w-[280px] max-w-[320px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", column.color)} />
          <h3 className="text-sm font-medium text-foreground">{column.label}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {tasks.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
        ))}

        {/* Add Card Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-8 text-xs text-muted-foreground hover:text-foreground justify-start gap-1.5"
          onClick={onAddTask}
        >
          <Plus className="h-3 w-3" />
          Add task
        </Button>
      </div>
    </div>
  )
}

export function BoardView({ tasks = defaultTasks, onTaskClick, onAddTask }: BoardViewProps) {
  const getTasksByStatus = (status: Task["status"]) => tasks.filter(t => t.status === status)

  return (
    <div className="space-y-4">
      {/* Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            tasks={getTasksByStatus(column.id)}
            onTaskClick={onTaskClick}
            onAddTask={() => onAddTask?.(column.id)}
          />
        ))}
      </div>
    </div>
  )
}
