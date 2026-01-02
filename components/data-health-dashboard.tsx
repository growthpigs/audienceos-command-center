"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
import { Activity, Gauge, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const signalRecoveryData = [
  { name: "Browser Events", value: 8500, color: "#64748b" },
  { name: "Server Events", value: 9775, color: "#10b981" },
]

export function DataHealthDashboard() {
  const { toast } = useToast()

  const handleReauth = () => {
    toast({
      title: "Re-authentication Started",
      description: "Reconnecting to Klaviyo API...",
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Widget A: Signal Recovery */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Signal Recovery
            </CardTitle>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
              +15%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={signalRecoveryData}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {signalRecoveryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground text-center mt-2">+15% Data Recovered via Server-Side</p>
        </CardContent>
      </Card>

      {/* Widget B: Event Match Quality */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            Event Match Quality (EMQ)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-4">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="oklch(0.22 0.005 260)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="oklch(0.72 0.17 162)"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * (1 - 0.82)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-primary">8.2</span>
              <span className="text-xs text-muted-foreground">/10</span>
            </div>
          </div>
          <Badge className="mt-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Excellent (Top 10%)</Badge>
        </CardContent>
      </Card>

      {/* Widget C: API Uptime */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">API Uptime</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-2 rounded bg-secondary/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-foreground">Meta CAPI</span>
            </div>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-xs">
              Active
            </Badge>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-secondary/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-foreground">Google EC</span>
            </div>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-xs">
              Active
            </Badge>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-secondary/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-sm text-foreground">Klaviyo Sync</span>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent" onClick={handleReauth}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Re-auth
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
