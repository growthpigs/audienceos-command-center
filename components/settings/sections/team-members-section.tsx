"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSettingsStore } from "@/stores/settings-store"
import { Users, UserPlus, Search, MoreHorizontal, Mail, Shield, Clock } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { TeamMember, UserInvitation } from "@/types/settings"

// Mock data for demo
const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "1",
    agency_id: "demo",
    email: "luke@audienceos.com",
    first_name: "Luke",
    last_name: "Wilson",
    role: "admin",
    avatar_url: null,
    is_active: true,
    last_active_at: new Date().toISOString(),
    created_at: "2024-01-01T00:00:00Z",
    full_name: "Luke Wilson",
    client_count: 12,
  },
  {
    id: "2",
    agency_id: "demo",
    email: "sarah@audienceos.com",
    first_name: "Sarah",
    last_name: "Johnson",
    role: "user",
    avatar_url: null,
    is_active: true,
    last_active_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: "2024-03-15T00:00:00Z",
    full_name: "Sarah Johnson",
    client_count: 8,
  },
  {
    id: "3",
    agency_id: "demo",
    email: "mike@audienceos.com",
    first_name: "Mike",
    last_name: "Chen",
    role: "user",
    avatar_url: null,
    is_active: true,
    last_active_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: "2024-06-20T00:00:00Z",
    full_name: "Mike Chen",
    client_count: 5,
  },
]

const MOCK_INVITATIONS: UserInvitation[] = [
  {
    id: "inv-1",
    agency_id: "demo",
    email: "newuser@example.com",
    role: "user",
    token: "abc123",
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    accepted_at: null,
    created_by: "1",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    is_expired: false,
    inviter_name: "Luke Wilson",
  },
]

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function formatLastActive(dateString: string | null): string {
  if (!dateString) return "Never"
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return "Just now"
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`
  return `${Math.floor(diff / 86400000)} days ago`
}

export function TeamMembersSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  // In production, this would come from the store
  const teamMembers = MOCK_TEAM_MEMBERS
  const invitations = MOCK_INVITATIONS

  // Filter members by search
  const filteredMembers = teamMembers.filter((member) => {
    const search = searchQuery.toLowerCase()
    return (
      member.first_name.toLowerCase().includes(search) ||
      member.last_name.toLowerCase().includes(search) ||
      member.email.toLowerCase().includes(search)
    )
  })

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your agency's team and access permissions
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-secondary border-border"
        />
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-amber-500" />
              Pending Invitations ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{invitation.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Invited by {invitation.inviter_name} • Expires in 6 days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {invitation.role}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      Resend
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members List */}
      <Card className="bg-card border-border">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">
            Active Members ({filteredMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y divide-border">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-primary/20">
                    <AvatarFallback className="bg-primary/20 text-primary font-medium text-sm">
                      {getInitials(member.first_name, member.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {member.first_name} {member.last_name}
                      </p>
                      {member.role === "admin" && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {member.client_count} clients
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock className="h-3 w-3" />
                      {formatLastActive(member.last_active_at)}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit User</DropdownMenuItem>
                      <DropdownMenuItem>Change Role</DropdownMenuItem>
                      <DropdownMenuItem>View Activity</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Deactivate User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
