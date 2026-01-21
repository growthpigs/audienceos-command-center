"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users, Target, DollarSign, Calendar } from "lucide-react"

export function AnalyticsHub() {
  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-orange-500" />
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your marketing performance and ROI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Last 30 days</Badge>
        </div>
      </div>

      {/* RevOS Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-gradient-to-r from-orange-500/10 to-green-500/10 border-orange-500/30">
          RevOS Feature
        </Badge>
        <Badge variant="secondary">Coming Soon</Badge>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <CardDescription>Total Leads</CardDescription>
            </div>
            <CardTitle className="text-2xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              0% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-500" />
              <CardDescription>Conversion Rate</CardDescription>
            </div>
            <CardTitle className="text-2xl">0%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              0% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <CardDescription>Revenue Generated</CardDescription>
            </div>
            <CardTitle className="text-2xl">$0</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              0% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              <CardDescription>Meetings Booked</CardDescription>
            </div>
            <CardTitle className="text-2xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              0% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lead Generation Trend</CardTitle>
            <CardDescription>Leads captured over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 text-muted-foreground border-2 border-dashed rounded-lg">
              Chart will appear after RevOS integration
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Campaign Performance</CardTitle>
            <CardDescription>Comparison across campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 text-muted-foreground border-2 border-dashed rounded-lg">
              Chart will appear after RevOS integration
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Notice */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">RevOS Integration Pending</CardTitle>
          <CardDescription>
            Full analytics with conversion tracking, ROI calculations, and performance insights
            will be available once RevOS is fully integrated into the unified platform.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
