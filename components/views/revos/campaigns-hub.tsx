"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, Plus, TrendingUp, Users, Mail, MessageSquare } from "lucide-react"

export function CampaignsHub() {
  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Target className="w-6 h-6 text-orange-500" />
            Campaigns
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your marketing campaigns
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {/* RevOS Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-gradient-to-r from-orange-500/10 to-green-500/10 border-orange-500/30">
          RevOS Feature
        </Badge>
        <Badge variant="secondary">Coming Soon</Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Campaigns</CardDescription>
            <CardTitle className="text-2xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Leads</CardDescription>
            <CardTitle className="text-2xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversion Rate</CardDescription>
            <CardTitle className="text-2xl">0%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Messages Sent</CardDescription>
            <CardTitle className="text-2xl">0</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Campaign Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:border-orange-500/50 transition-colors cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              LinkedIn Outreach
            </CardTitle>
            <CardDescription>
              Automated connection requests and follow-ups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Not configured</Badge>
          </CardContent>
        </Card>

        <Card className="hover:border-orange-500/50 transition-colors cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="w-5 h-5 text-orange-500" />
              Email Sequences
            </CardTitle>
            <CardDescription>
              Multi-step email campaigns with AI personalization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Not configured</Badge>
          </CardContent>
        </Card>

        <Card className="hover:border-orange-500/50 transition-colors cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              Content Distribution
            </CardTitle>
            <CardDescription>
              Schedule and publish across multiple channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Not configured</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Integration Notice */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">RevOS Integration Pending</CardTitle>
          <CardDescription>
            This feature will be available once RevOS is fully integrated into the unified platform.
            Campaign management, lead tracking, and AI-powered outreach will be accessible here.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
