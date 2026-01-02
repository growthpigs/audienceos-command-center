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
    <div className="space-y-4">
      {/* Section Header */}
      <div>
        <h2 className="text-[12px] font-medium text-foreground flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5" />
          Notifications
        </h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Configure how and when you receive alerts
        </p>
      </div>

      {/* Email Notifications */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-[11px] font-medium flex items-center gap-1.5">
            <Mail className="h-3 w-3" />
            Email Notifications
          </CardTitle>
          <CardDescription className="text-[10px]">
            Choose which events trigger email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 px-3 pb-3">
          {/* Alert Emails */}
          <div className="flex items-center justify-between p-2.5 rounded-md bg-secondary/30 border border-border">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium">Risk Alerts</p>
                <p className="text-[9px] text-muted-foreground">
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
              className="scale-90"
            />
          </div>

          {/* Ticket Emails */}
          <div className="flex items-center justify-between p-2.5 rounded-md bg-secondary/30 border border-border">
            <div className="flex items-start gap-2">
              <Ticket className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium">Support Tickets</p>
                <p className="text-[9px] text-muted-foreground">
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
              className="scale-90"
            />
          </div>

          {/* Mention Emails */}
          <div className="flex items-center justify-between p-2.5 rounded-md bg-secondary/30 border border-border">
            <div className="flex items-start gap-2">
              <AtSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium">Mentions</p>
                <p className="text-[9px] text-muted-foreground">
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
              className="scale-90"
            />
          </div>
        </CardContent>
      </Card>

      {/* Slack Integration */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-[11px] font-medium flex items-center gap-1.5">
            <MessageSquare className="h-3 w-3" />
            Slack Notifications
          </CardTitle>
          <CardDescription className="text-[10px]">Send notifications to a Slack channel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-3 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium">Enable Slack Notifications</p>
              <p className="text-[9px] text-muted-foreground">
                Send alerts to your connected Slack workspace
              </p>
            </div>
            <Switch
              checked={slackEnabled}
              onCheckedChange={(checked) => {
                setSlackEnabled(checked)
                handleChange()
              }}
              className="scale-90"
            />
          </div>

          {slackEnabled && (
            <div className="space-y-1">
              <Label htmlFor="slack-channel" className="text-[10px]">Slack Channel</Label>
              <Input
                id="slack-channel"
                value={slackChannel}
                onChange={(e) => {
                  setSlackChannel(e.target.value)
                  handleChange()
                }}
                placeholder="#alerts"
                className="bg-secondary border-border max-w-xs h-7 text-[11px]"
              />
              <p className="text-[9px] text-muted-foreground">
                Enter the channel name or ID to receive notifications
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Digest Mode */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-[11px] font-medium flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Daily Digest
          </CardTitle>
          <CardDescription className="text-[10px]">
            Receive a summary instead of real-time notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-3 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium">Enable Digest Mode</p>
              <p className="text-[9px] text-muted-foreground">
                Bundle non-urgent notifications into a daily summary
              </p>
            </div>
            <Switch
              checked={digestMode}
              onCheckedChange={(checked) => {
                setDigestMode(checked)
                handleChange()
              }}
              className="scale-90"
            />
          </div>

          {digestMode && (
            <div className="space-y-1">
              <Label htmlFor="digest-time" className="text-[10px]">Delivery Time</Label>
              <Input
                id="digest-time"
                type="time"
                value={digestTime}
                onChange={(e) => {
                  setDigestTime(e.target.value)
                  handleChange()
                }}
                className="bg-secondary border-border max-w-xs h-7 text-[11px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-[11px] font-medium flex items-center gap-1.5">
            <VolumeX className="h-3 w-3" />
            Quiet Hours
          </CardTitle>
          <CardDescription className="text-[10px]">Pause notifications during specific times</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-3 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium">Enable Quiet Hours</p>
              <p className="text-[9px] text-muted-foreground">
                No notifications will be sent during quiet hours
              </p>
            </div>
            <Switch
              checked={quietHoursEnabled}
              onCheckedChange={(checked) => {
                setQuietHoursEnabled(checked)
                handleChange()
              }}
              className="scale-90"
            />
          </div>

          {quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <div className="space-y-1">
                <Label htmlFor="quiet-start" className="text-[10px]">Start Time</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={quietStart}
                  onChange={(e) => {
                    setQuietStart(e.target.value)
                    handleChange()
                  }}
                  className="bg-secondary border-border h-7 text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="quiet-end" className="text-[10px]">End Time</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={quietEnd}
                  onChange={(e) => {
                    setQuietEnd(e.target.value)
                    handleChange()
                  }}
                  className="bg-secondary border-border h-7 text-[11px]"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <Button variant="outline" disabled={isSaving} className="h-7 text-[10px] bg-transparent">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="h-7 text-[10px]">
          {isSaving ? (
            <>
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3 w-3 mr-1.5" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
