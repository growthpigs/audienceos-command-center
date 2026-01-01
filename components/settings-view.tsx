"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Bell, Clock, Mail, MessageSquare, Shield, CheckCircle2 } from "lucide-react"

export function SettingsView() {
  const { toast } = useToast()

  const [alertPreferences, setAlertPreferences] = useState({
    stuckClientAlert: true,
    dailyDigest: true,
    slackNotifications: true,
    riskAlerts: true,
  })

  const handleSaveChanges = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
      duration: 3000,
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and notification preferences</p>
      </div>

      {/* Profile Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Profile
          </CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Name
              </Label>
              <Input id="name" defaultValue="Luke" className="bg-secondary border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-foreground">
                Role
              </Label>
              <Input
                id="role"
                defaultValue="Head of Fulfillment"
                className="bg-secondary border-border text-foreground"
                disabled
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              defaultValue="luke@audienceos.com"
              className="bg-secondary border-border text-foreground"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Alert Preferences
          </CardTitle>
          <CardDescription>Configure when and how you receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stuck Client Alert */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Stuck Client Alerts</p>
                <p className="text-xs text-muted-foreground">Alert me when a client is stuck for &gt; 4 days</p>
              </div>
            </div>
            <Switch
              checked={alertPreferences.stuckClientAlert}
              onCheckedChange={(checked) => setAlertPreferences((prev) => ({ ...prev, stuckClientAlert: checked }))}
            />
          </div>

          {/* Daily Digest */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Daily Digest via Email</p>
                <p className="text-xs text-muted-foreground">Receive a summary of all client activity each morning</p>
              </div>
            </div>
            <Switch
              checked={alertPreferences.dailyDigest}
              onCheckedChange={(checked) => setAlertPreferences((prev) => ({ ...prev, dailyDigest: checked }))}
            />
          </div>

          {/* Slack Notifications */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Slack Notifications for New Installs</p>
                <p className="text-xs text-muted-foreground">
                  Get notified in Slack when a new client install completes
                </p>
              </div>
            </div>
            <Switch
              checked={alertPreferences.slackNotifications}
              onCheckedChange={(checked) => setAlertPreferences((prev) => ({ ...prev, slackNotifications: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Additional Notifications</CardTitle>
          <CardDescription>Configure other notification types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Client at Risk Alerts</p>
              <p className="text-xs text-muted-foreground">Get notified when a client status changes to red</p>
            </div>
            <Switch
              checked={alertPreferences.riskAlerts}
              onCheckedChange={(checked) => setAlertPreferences((prev) => ({ ...prev, riskAlerts: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Goals Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Goals & Targets</CardTitle>
          <CardDescription>Set your KPI targets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="install-target" className="text-foreground">
                Install Time Target (days)
              </Label>
              <Input
                id="install-target"
                type="number"
                defaultValue="7"
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-target" className="text-foreground">
                Weekly Support Hours Target
              </Label>
              <Input
                id="support-target"
                type="number"
                defaultValue="5"
                className="bg-secondary border-border text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" className="border-border bg-transparent">
          Cancel
        </Button>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSaveChanges}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
