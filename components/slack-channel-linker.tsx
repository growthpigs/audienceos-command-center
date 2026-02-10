"use client"

import { useState } from "react"
import { Hash, Link2, Loader2, Unlink, AlertCircle, RefreshCw, Plus } from "lucide-react"
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
import { useSlackChannels } from "@/hooks/use-slack-channel"
import { useIntegrations } from "@/hooks/use-integrations"
import { fetchWithCsrf } from "@/lib/csrf"
import { toastSuccess, toastError } from "@/lib/toast-helpers"

interface SlackChannel {
  id: string
  name: string
  is_private: boolean
  linked_to: { client_id: string; client_name: string; link_id: string } | null
}

interface SlackChannelLinkerProps {
  clientId: string
}

export function SlackChannelLinker({ clientId }: SlackChannelLinkerProps) {
  const { channels: linkedChannels, isLoading: channelLoading, linkChannel, unlinkChannel } = useSlackChannels(clientId)
  const { integrations, isLoading: integrationsLoading } = useIntegrations()

  const [popoverOpen, setPopoverOpen] = useState(false)
  const [channels, setChannels] = useState<SlackChannel[]>([])
  const [channelsLoading, setChannelsLoading] = useState(false)
  const [channelsError, setChannelsError] = useState<string | null>(null)
  const [linking, setLinking] = useState(false)
  const [unlinkTarget, setUnlinkTarget] = useState<{ id: string; name: string } | null>(null)
  const [unlinking, setUnlinking] = useState(false)
  const [reassignChannel, setReassignChannel] = useState<SlackChannel | null>(null)

  const slackConnected = integrations.some(
    (i) => i.provider === "slack" && i.is_connected
  )

  // Set of slack_channel_ids already linked to THIS client
  const linkedChannelIds = new Set(linkedChannels.map((ch) => ch.slack_channel_id))

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
    // Skip if already linked to this client
    if (linkedChannelIds.has(ch.id)) return

    // If channel is linked to another client, show reassign confirmation
    if (ch.linked_to && ch.linked_to.client_id !== clientId) {
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
    // Step 1: Unlink from the other client (targeted by link_id)
    const unlinkRes = await fetchWithCsrf(
      `/api/v1/clients/${reassignChannel.linked_to.client_id}/slack-channel?linkId=${reassignChannel.linked_to.link_id}`,
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
    if (!unlinkTarget) return
    setUnlinking(true)
    const ok = await unlinkChannel(unlinkTarget.id)
    setUnlinking(false)
    setUnlinkTarget(null)

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
          Loading Slack channels...
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
              <p className="text-sm font-medium text-foreground">Slack Channels</p>
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

  // Channel picker popover (shared between empty and populated states)
  const channelPicker = (
    <Popover open={popoverOpen} onOpenChange={handleOpenPopover}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={linking}>
          {linking ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
          ) : (
            <Plus className="h-3.5 w-3.5 mr-1" />
          )}
          Add Channel
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
                {channels.map((ch) => {
                  const isLinkedHere = linkedChannelIds.has(ch.id)
                  const isLinkedElsewhere = ch.linked_to && ch.linked_to.client_id !== clientId

                  return (
                    <CommandItem
                      key={ch.id}
                      value={ch.name}
                      onSelect={() => handleSelectChannel(ch)}
                      disabled={isLinkedHere}
                      className={cn("cursor-pointer", isLinkedHere && "opacity-50 cursor-not-allowed")}
                    >
                      <Hash className={cn("h-3.5 w-3.5", (isLinkedHere || isLinkedElsewhere) && "text-muted-foreground/50")} />
                      <span className={cn("flex-1 truncate", (isLinkedHere || isLinkedElsewhere) && "text-muted-foreground/70")}>
                        {ch.name}
                      </span>
                      {isLinkedHere && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 ml-1 shrink-0">
                          Already linked
                        </Badge>
                      )}
                      {isLinkedElsewhere && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 ml-1 shrink-0">
                          {ch.linked_to!.client_name}
                        </Badge>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )

  // States B+C merged: Slack connected — show linked channels list + Add Channel
  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Slack Channels{linkedChannels.length > 0 && ` (${linkedChannels.length})`}
            </p>
          </div>
          {channelPicker}
        </div>

        {linkedChannels.length === 0 ? (
          <p className="text-xs text-muted-foreground">No channels linked yet.</p>
        ) : (
          <div className="space-y-2">
            {linkedChannels.map((ch) => (
              <div key={ch.id} className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/30">
                <div className="flex items-center gap-2 min-w-0">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate">
                    {ch.slack_channel_name}
                  </span>
                  {ch.label && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 shrink-0">
                      {ch.label}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 shrink-0">
                    {ch.message_count} msgs
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive shrink-0 h-7 px-2"
                  onClick={() => setUnlinkTarget({ id: ch.id, name: ch.slack_channel_name })}
                >
                  <Unlink className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Unlink confirmation dialog */}
      <Dialog open={!!unlinkTarget} onOpenChange={(open) => !open && setUnlinkTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlink Slack Channel</DialogTitle>
            <DialogDescription>
              This will stop syncing messages from #{unlinkTarget?.name}.
              The channel will not be archived — you can re-link it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlinkTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUnlink} disabled={unlinking}>
              {unlinking && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Unlink
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign confirmation dialog */}
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
    </>
  )
}
