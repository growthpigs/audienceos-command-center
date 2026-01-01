"use client"

import { useState } from "react"
import { mockClients, type Client } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, Clock, Search, ExternalLink, Download, Mail, Filter, Copy } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface OnboardingManagementViewProps {
  onClientClick?: (client: Client) => void
}

export function OnboardingManagementView({ onClientClick }: OnboardingManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  // Filter clients that have onboarding data
  const onboardingClients = mockClients.filter((client) => client.onboardingData)

  const filteredClients = onboardingClients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "complete" &&
        client.onboardingData?.accessGrants.meta &&
        client.onboardingData?.accessGrants.gtm &&
        client.onboardingData?.accessGrants.shopify) ||
      (statusFilter === "pending" &&
        (!client.onboardingData?.accessGrants.meta ||
          !client.onboardingData?.accessGrants.gtm ||
          !client.onboardingData?.accessGrants.shopify))

    return matchesSearch && matchesStatus
  })

  const getAccessStatus = (client: Client) => {
    if (!client.onboardingData) return { label: "No Data", variant: "outline" as const, count: 0 }

    const { meta, gtm, shopify } = client.onboardingData.accessGrants
    const complete = [meta, gtm, shopify].filter(Boolean).length

    if (complete === 3) return { label: "Complete", variant: "default" as const, count: 3 }
    if (complete > 0) return { label: `${complete}/3 Complete`, variant: "secondary" as const, count: complete }
    return { label: "Pending", variant: "outline" as const, count: 0 }
  }

  const handleCopyPortalLink = () => {
    const portalUrl = `${window.location.origin}/onboarding/start`
    navigator.clipboard.writeText(portalUrl)
    toast({
      title: "Link Copied",
      description: "Client portal link copied to clipboard",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Onboarding Portal</h1>
          <p className="text-muted-foreground">Manage client onboarding submissions and access grants</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyPortalLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Portal Link
          </Button>
          <Link href="/onboarding/start" target="_blank">
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Client Portal
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardDescription className="text-muted-foreground">Total Submissions</CardDescription>
            <CardTitle className="text-2xl text-foreground">{onboardingClients.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardDescription className="text-muted-foreground">Complete Access</CardDescription>
            <CardTitle className="text-2xl text-emerald-500">
              {
                onboardingClients.filter(
                  (c) =>
                    c.onboardingData?.accessGrants.meta &&
                    c.onboardingData?.accessGrants.gtm &&
                    c.onboardingData?.accessGrants.shopify,
                ).length
              }
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardDescription className="text-muted-foreground">Pending Access</CardDescription>
            <CardTitle className="text-2xl text-amber-500">
              {
                onboardingClients.filter(
                  (c) =>
                    !c.onboardingData?.accessGrants.meta ||
                    !c.onboardingData?.accessGrants.gtm ||
                    !c.onboardingData?.accessGrants.shopify,
                ).length
              }
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardDescription className="text-muted-foreground">Avg Response Time</CardDescription>
            <CardTitle className="text-2xl text-foreground">2.3 days</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Onboarding Submissions</CardTitle>
          <CardDescription className="text-muted-foreground">
            View and manage all client onboarding data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-background border-border">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="complete">Complete Access</SelectItem>
                <SelectItem value="pending">Pending Access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-foreground">Client</TableHead>
                  <TableHead className="text-foreground">Submitted</TableHead>
                  <TableHead className="text-foreground">Tech Stack</TableHead>
                  <TableHead className="text-foreground">Access Status</TableHead>
                  <TableHead className="text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No onboarding submissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => {
                    const status = getAccessStatus(client)
                    const data = client.onboardingData!

                    return (
                      <TableRow
                        key={client.id}
                        onClick={() => onClientClick?.(client)}
                        className="hover:bg-muted/30 cursor-pointer"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">{client.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{client.name}</p>
                              <p className="text-xs text-muted-foreground">{data.contactEmail}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {data.submittedAt}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <code className="text-xs font-mono text-foreground bg-muted px-2 py-0.5 rounded">
                              {data.shopifyUrl}
                            </code>
                            <div className="flex gap-1">
                              {data.gtmContainerId && (
                                <Badge variant="outline" className="text-xs">
                                  GTM
                                </Badge>
                              )}
                              {data.metaPixelId && (
                                <Badge variant="outline" className="text-xs">
                                  Meta
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <Badge
                              variant={status.variant}
                              className={cn(
                                "w-fit",
                                status.label === "Complete" &&
                                  "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
                                status.label.includes("/3") && "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
                              )}
                            >
                              {status.label === "Complete" ? (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              ) : status.label === "Pending" ? (
                                <Clock className="h-3 w-3 mr-1" />
                              ) : null}
                              {status.label}
                            </Badge>
                            <div className="flex gap-1">
                              {!data.accessGrants.meta && (
                                <Badge variant="outline" className="text-xs text-rose-500">
                                  Meta Pending
                                </Badge>
                              )}
                              {!data.accessGrants.gtm && (
                                <Badge variant="outline" className="text-xs text-rose-500">
                                  GTM Pending
                                </Badge>
                              )}
                              {!data.accessGrants.shopify && (
                                <Badge variant="outline" className="text-xs text-rose-500">
                                  Shopify Pending
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="outline">
                              <Mail className="h-4 w-4 mr-1" />
                              Email
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
