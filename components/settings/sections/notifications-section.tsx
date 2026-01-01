"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useSettingsStore } from "@/stores/settings-store"
import {
  Bell,
  Mail,
  MessageSquare,
  Clock,
  VolumeX,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Ticket,
  AtSign,
} from "lucide-react"

export function NotificationsSection() {
  const { toast } = useToast()
  const { setHasUnsavedChanges } = useSettingsStore()

  // Local form state
  const [isSaving, setIsSaving] = useState(false)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [emailTickets, setEmailTickets] = useState(true)
  const [emailMentions, setEmailMentions] = useState(true)
  const [slackEnabled, setSlackEnabled] = useState(false)
  const [slackChannel, setSlackChannel] = useState("")
  const [digestMode, setDigestMode] = useState(false)
  const [digestTime, setDigestTime] = useState("08:00")
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false)
  const [quietStart, setQuietStart] = useState("22:00")
  const [quietEnd, setQuietEnd] = useState("08:00")

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setHasUnsavedChanges(false)
    toast({
      title: "Notification settings saved",
      description: "Your preferences have been updated.",
    })
  }

  const handleChange = () => {
    setHasUnsavedChanges(true)
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Configure how and when you receive alerts
        </p>
      </div>

      {/* Email Notifications */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose which events trigger email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alert Emails */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Risk Alerts</p>
                <p className="text-xs text-muted-foreground">
                  Get notified when clients are flagged as at-risk
                </p>
              </div>
            </div>
            <Switch
              checked={emailAlerts}
              onCheckedChange={(checked) => {
                setEmailAlerts(checked)
                handleChange()
              }}
            />
          </div>

          {/* Ticket Emails */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-start gap-3">
              <Ticket className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Support Tickets</p>
                <p className="text-xs text-muted-foreground">
                  Notifications for new and updated tickets
                </p>
              </div>
            </div>
            <Switch
              checked={emailTickets}
              onCheckedChange={(checked) => {
                setEmailTickets(checked)
                handleChange()
              }}
            />
          </div>

          {/* Mention Emails */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-start gap-3">
              <AtSign className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Mentions</p>
                <p className="text-xs text-muted-foreground">
                  When someone mentions you in a note or comment
                </p>
              </div>
            </div>
            <Switch
              checked={emailMentions}
              onCheckedChange={(checked) => {
                setEmailMentions(checked)
                handleChange()
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Slack Integration */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Slack Notifications
          </CardTitle>
          <CardDescription>Send notifications to a Slack channel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable Slack Notifications</p>
              <p className="text-xs text-muted-foreground">
                Send alerts to your connected Slack workspace
              </p>
            </div>
            <Switch
              checked={slackEnabled}
              onCheckedChange={(checked) => {
                setSlackEnabled(checked)
                handleChange()
              }}
            />
          </div>

          {slackEnabled && (
            <div className="space-y-2">
              <Label htmlFor="slack-channel">Slack Channel</Label>
              <Input
                id="slack-channel"
                value={slackChannel}
                onChange={(e) => {
                  setSlackChannel(e.target.value)
                  handleChange()
                }}
                placeholder="#alerts"
                className="bg-secondary border-border max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Enter the channel name or ID to receive notifications
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Digest Mode */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Daily Digest
          </CardTitle>
          <CardDescription>
            Receive a summary instead of real-time notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable Digest Mode</p>
              <p className="text-xs text-muted-foreground">
                Bundle non-urgent notifications into a daily summary
              </p>
            </div>
            <Switch
              checked={digestMode}
              onCheckedChange={(checked) => {
                setDigestMode(checked)
                handleChange()
              }}
            />
          </div>

          {digestMode && (
            <div className="space-y-2">
              <Label htmlFor="digest-time">Delivery Time</Label>
              <Input
                id="digest-time"
                type="time"
                value={digestTime}
                onChange={(e) => {
                  setDigestTime(e.target.value)
                  handleChange()
                }}
                className="bg-secondary border-border max-w-xs"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <VolumeX className="h-4 w-4" />
            Quiet Hours
          </CardTitle>
          <CardDescription>Pause notifications during specific times</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable Quiet Hours</p>
              <p className="text-xs text-muted-foreground">
                No notifications will be sent during quiet hours
              </p>
            </div>
            <Switch
              checked={quietHoursEnabled}
              onCheckedChange={(checked) => {
                setQuietHoursEnabled(checked)
                handleChange()
              }}
            />
          </div>

          {quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">Start Time</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={quietStart}
                  onChange={(e) => {
                    setQuietStart(e.target.value)
                    handleChange()
                  }}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end">End Time</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={quietEnd}
                  onChange={(e) => {
                    setQuietEnd(e.target.value)
                    handleChange()
                  }}
                  className="bg-secondary border-border"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
