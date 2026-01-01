"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { chartData } from "@/lib/mock-data"

export function OverviewChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">New Clients vs. Completed Installs</CardTitle>
        <CardDescription>Last 30 days performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0.005 260)",
                  border: "1px solid oklch(0.28 0.005 260)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#999" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => <span style={{ color: "#999" }}>{value}</span>}
              />
              <Bar dataKey="newClients" name="New Clients" fill="oklch(0.65 0.15 250)" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="completedInstalls"
                name="Completed Installs"
                fill="oklch(0.72 0.17 162)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
