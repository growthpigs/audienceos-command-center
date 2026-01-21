"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Send, Plus, Linkedin, Mail, MessageCircle, Clock } from "lucide-react"

export function OutreachHub() {
  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Send className="w-6 h-6 text-orange-500" />
            Outreach
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your multi-channel outreach sequences
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Sequence
        </Button>
      </div>

      {/* RevOS Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-gradient-to-r from-orange-500/10 to-green-500/10 border-orange-500/30">
          RevOS Feature
        </Badge>
        <Badge variant="secondary">Coming Soon</Badge>
      </div>

      {/* Channel Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-blue-600" />
              <CardDescription>LinkedIn</CardDescription>
            </div>
            <CardTitle className="text-2xl">0 sent</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-500" />
              <CardDescription>Email</CardDescription>
            </div>
            <CardTitle className="text-2xl">0 sent</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-500" />
              <CardDescription>Responses</CardDescription>
            </div>
            <CardTitle className="text-2xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <CardDescription>Scheduled</CardDescription>
            </div>
            <CardTitle className="text-2xl">0</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Active Sequences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Sequences</CardTitle>
          <CardDescription>Your running outreach campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No active sequences. Create a new sequence to start reaching out.
          </div>
        </CardContent>
      </Card>

      {/* Integration Notice */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">RevOS Integration Pending</CardTitle>
          <CardDescription>
            This feature will be available once RevOS is fully integrated.
            LinkedIn automation, email sequences, and multi-channel outreach will be accessible here.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
