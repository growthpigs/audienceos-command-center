"use client"

import { useState } from "react"
import { Hash, Link2, Loader2, Unlink, AlertCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSlackChannel } from "@/hooks/use-slack-channel"
import { useIntegrations } from "@/hooks/use-integrations"
import { fetchWithCsrf } from "@/lib/csrf"
import { toastSuccess, toastError } from "@/lib/toast-helpers"

interface SlackChannel {
  id: string
  name: string
  is_private: boolean
  linked_to: { client_id: string; client_name: string } | null
}

interface SlackChannelLinkerProps {
  clientId: string
}

export function SlackChannelLinker({ clientId }: SlackChannelLinkerProps) {
  const { channel, isLoading: channelLoading, linkChannel, unlinkChannel } = useSlackChannel(clientId)
  const { integrations, isLoading: integrationsLoading } = useIntegrations()

  const [popoverOpen, setPopoverOpen] = useState(false)
  const [channels, setChannels] = useState<SlackChannel[]>([])
  const [channelsLoading, setChannelsLoading] = useState(false)
  const [channelsError, setChannelsError] = useState<string | null>(null)
  const [linking, setLinking] = useState(false)
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false)
  const [unlinking, setUnlinking] = useState(false)
  const [reassignChannel, setReassignChannel] = useState<SlackChannel | null>(null)

  const slackConnected = integrations.some(
    (i) => i.provider === "slack" && i.is_connected
  )

  const fetchChannels = async () => {
    setChannelsLoading(true)
    setChannelsError(null)
    try {
      const res = await fetch("/api/v1/slack/channels", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to load channels")
      const { data } = await res.json()
      setChannels(data || [])
    } catch {
      setChannelsError("Failed to load channels")
      setChannels([])
    } finally {
      setChannelsLoading(false)
    }
  }

  const handleOpenPopover = (open: boolean) => {
    setPopoverOpen(open)
    if (open) {
      fetchChannels()
    }
  }

  const handleSelectChannel = async (ch: SlackChannel) => {
    // If channel is linked to another client, show reassign confirmation
    if (ch.linked_to) {
      setReassignChannel(ch)
      return
    }

    setLinking(true)
    const ok = await linkChannel(ch.id, ch.name)
    setLinking(false)
    setPopoverOpen(false)

    if (ok) {
      toastSuccess(`Linked #${ch.name}`)
    } else {
      toastError("Failed to link channel")
    }
  }

  const handleReassign = async () => {
    if (!reassignChannel?.linked_to) return

    setLinking(true)
    // Step 1: Unlink from the other client
    const unlinkRes = await fetchWithCsrf(
      `/api/v1/clients/${reassignChannel.linked_to.client_id}/slack-channel`,
      { method: "DELETE" }
    )

    if (!unlinkRes.ok) {
      setLinking(false)
      setReassignChannel(null)
      toastError("Failed to unlink from other client")
      return
    }

    // Step 2: Link to this client
    const ok = await linkChannel(reassignChannel.id, reassignChannel.name)
    setLinking(false)
    setReassignChannel(null)
    setPopoverOpen(false)

    if (ok) {
      toastSuccess(`Reassigned #${reassignChannel.name}`)
    } else {
      toastError("Failed to link channel")
    }
  }

  const handleUnlink = async () => {
    setUnlinking(true)
    const ok = await unlinkChannel()
    setUnlinking(false)
    setUnlinkDialogOpen(false)

    if (ok) {
      toastSuccess("Channel unlinked")
    } else {
      toastError("Failed to unlink channel")
    }
  }

  // Loading state
  if (channelLoading || integrationsLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading Slack channel...
        </div>
      </Card>
    )
  }

  // State A: Slack not connected
  if (!slackConnected) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Slack Channel</p>
              <p className="text-xs text-muted-foreground">Connect Slack to link channels.</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "/integrations"}
          >
            Connect Slack
          </Button>
        </div>
      </Card>
    )
  }

  // State C: Channel linked
  if (channel) {
    return (
      <>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{channel.slack_channel_name}</span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                {channel.message_count} messages synced
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setUnlinkDialogOpen(true)}
            >
              <Unlink className="h-3.5 w-3.5 mr-1" />
              Unlink
            </Button>
          </div>
        </Card>

        <Dialog open={unlinkDialogOpen} onOpenChange={setUnlinkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unlink Slack Channel</DialogTitle>
              <DialogDescription>
                This will stop syncing messages from #{channel.slack_channel_name}.
                The channel will not be archived — you can re-link it later.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUnlinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleUnlink} disabled={unlinking}>
                {unlinking && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Unlink
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // State B: Slack connected, no channel linked
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No channel linked.</p>
        </div>

        <Popover open={popoverOpen} onOpenChange={handleOpenPopover}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" disabled={linking}>
              {linking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <Hash className="h-3.5 w-3.5 mr-1" />
              )}
              Link Channel
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="end">
            <Command>
              <CommandInput placeholder="Search channels..." />
              <CommandList>
                {channelsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : channelsError ? (
                  <div className="flex flex-col items-center gap-2 py-6 px-4">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="text-xs text-muted-foreground">{channelsError}</p>
                    <Button variant="ghost" size="sm" onClick={fetchChannels}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  </div>
                ) : channels.length === 0 ? (
                  <CommandEmpty>No channels found.</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {channels.map((ch) => (
                      <CommandItem
                        key={ch.id}
                        value={ch.name}
                        onSelect={() => handleSelectChannel(ch)}
                        className="cursor-pointer"
                      >
                        <Hash className={cn("h-3.5 w-3.5", ch.linked_to && "text-muted-foreground/50")} />
                        <span className={cn("flex-1 truncate", ch.linked_to && "text-muted-foreground/70")}>
                          {ch.name}
                        </span>
                        {ch.linked_to && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 ml-1 shrink-0">
                            {ch.linked_to.client_name}
                          </Badge>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {reassignChannel && (
        <Dialog open={!!reassignChannel} onOpenChange={(open) => !open && setReassignChannel(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reassign Channel</DialogTitle>
              <DialogDescription>
                #{reassignChannel.name} is currently linked to{" "}
                <span className="font-medium text-foreground">
                  {reassignChannel.linked_to?.client_name}
                </span>
                . This will unlink it from that client and link it here instead.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReassignChannel(null)}>
                Cancel
              </Button>
              <Button onClick={handleReassign} disabled={linking}>
                {linking && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Reassign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
