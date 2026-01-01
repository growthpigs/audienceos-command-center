"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Kanban,
  Users,
  Brain,
  Settings,
  ChevronLeft,
  ChevronRight,
  Ticket,
  BookOpen,
  Plug,
  Workflow,
  Inbox,
  Plus,
  UserPlus,
  LifeBuoy,
  FolderKanban,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onQuickCreate?: (type: "client" | "ticket" | "project") => void
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "pipeline", label: "Pipeline", icon: Kanban },
  { id: "clients", label: "Client List", icon: Users },
  { id: "onboarding", label: "Onboarding Hub", icon: Inbox },
  { id: "intelligence", label: "Intelligence Center", icon: Brain },
  { id: "tickets", label: "Support Tickets", icon: Ticket },
  { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
  { id: "automations", label: "Automations", icon: Workflow },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "settings", label: "Settings", icon: Settings },
]

export function Sidebar({ activeView, onViewChange, collapsed, onCollapsedChange, onQuickCreate }: SidebarProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-sidebar-foreground">AudienceOS</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => onCollapsedChange(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Quick Create button with dropdown menu */}
      <div className="px-2 pt-4 pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                "w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold",
                collapsed ? "px-2" : "px-4",
              )}
              size={collapsed ? "icon" : "default"}
            >
              <Plus className={cn("h-5 w-5", !collapsed && "mr-2")} />
              {!collapsed && "Quick Create"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-slate-900 border-slate-800">
            <DropdownMenuItem
              onClick={() => onQuickCreate?.("client")}
              className="flex items-center gap-3 cursor-pointer text-slate-200 focus:bg-slate-800 focus:text-slate-100"
            >
              <UserPlus className="h-4 w-4" />
              <span>New Client</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onQuickCreate?.("ticket")}
              className="flex items-center gap-3 cursor-pointer text-slate-200 focus:bg-slate-800 focus:text-slate-100"
            >
              <LifeBuoy className="h-4 w-4" />
              <span>New Support Ticket</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onQuickCreate?.("project")}
              className="flex items-center gap-3 cursor-pointer text-slate-200 focus:bg-slate-800 focus:text-slate-100"
            >
              <FolderKanban className="h-4 w-4" />
              <span>New Project</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors text-sm",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar className="h-9 w-9 bg-emerald-600">
            <AvatarFallback className="bg-emerald-600 text-emerald-50 font-medium">L</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Luke</p>
              <p className="text-xs text-muted-foreground truncate">Head of Fulfillment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
