"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, AlertTriangle, Clock, Headphones, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardsProps {
  activeOnboardings: number
  clientsAtRisk: number
  avgInstallTime: number
  supportHours: number
}

export function KPICards({ activeOnboardings, clientsAtRisk, avgInstallTime, supportHours }: KPICardsProps) {
  const kpis = [
    {
      title: "Active Onboardings",
      value: activeOnboardings,
      icon: Users,
      trend: "+2 this week",
      trendUp: true,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Clients at Risk",
      value: clientsAtRisk,
      icon: AlertTriangle,
      trend: "Needs attention",
      trendUp: false,
      color: "text-status-red",
      bgColor: "bg-status-red/10",
    },
    {
      title: "Avg Install Time",
      value: `${avgInstallTime} Days`,
      subtitle: "Target: <7 Days",
      icon: Clock,
      trend: avgInstallTime <= 7 ? "On target" : "Above target",
      trendUp: avgInstallTime <= 7,
      color: avgInstallTime <= 7 ? "text-primary" : "text-status-yellow",
      bgColor: avgInstallTime <= 7 ? "bg-primary/10" : "bg-status-yellow/10",
    },
    {
      title: "Support Hours",
      value: `${supportHours}h`,
      subtitle: "Goal: <5h",
      icon: Headphones,
      trend: "North Star Metric",
      trendUp: false,
      color: supportHours <= 5 ? "text-primary" : "text-status-red",
      bgColor: supportHours <= 5 ? "bg-primary/10" : "bg-status-red/10",
      isNorthStar: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <Card key={kpi.title} className={cn("bg-card border-border", kpi.isNorthStar && "ring-1 ring-primary/50")}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className={cn("text-3xl font-bold", kpi.color)}>{kpi.value}</p>
                  {kpi.subtitle && <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>}
                </div>
                <div className={cn("p-2.5 rounded-lg", kpi.bgColor)}>
                  <Icon className={cn("h-5 w-5", kpi.color)} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs">
                {kpi.trendUp ? (
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-status-red" />
                )}
                <span className="text-muted-foreground">{kpi.trend}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
