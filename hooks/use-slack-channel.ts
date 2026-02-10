import { useState, useEffect, useCallback } from 'react'
import { fetchWithCsrf } from '@/lib/csrf'

interface SlackChannelData {
  id: string                    // client_slack_channel.id (link row UUID)
  slack_channel_id: string
  slack_channel_name: string
  message_count: number
  label: string | null
}

interface UseSlackChannelsResult {
  channels: SlackChannelData[]
  isLoading: boolean
  linkChannel: (channelId: string, channelName: string, label?: string) => Promise<boolean>
  unlinkChannel: (linkId: string) => Promise<boolean>
  refetch: () => void
}

export function useSlackChannels(clientId: string): UseSlackChannelsResult {
  const [channels, setChannels] = useState<SlackChannelData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchChannels = useCallback(async () => {
    if (!clientId) {
      setChannels([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/v1/clients/${clientId}/slack-channel`, {
        credentials: 'include',
      })
      if (!res.ok) {
        setChannels([])
        return
      }
      const { data } = await res.json()
      // API now always returns an array
      const arr = Array.isArray(data) ? data : []
      setChannels(
        arr
          .filter((d: Record<string, unknown>) => d.is_active !== false)
          .map((d: Record<string, unknown>) => ({
            id: d.id as string,
            slack_channel_id: d.slack_channel_id as string,
            slack_channel_name: d.slack_channel_name as string,
            message_count: (d.message_count as number) ?? 0,
            label: (d.label as string) ?? null,
          }))
      )
    } catch {
      setChannels([])
    } finally {
      setIsLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchChannels()
  }, [fetchChannels])

  const linkChannel = useCallback(async (channelId: string, channelName: string, label?: string): Promise<boolean> => {
    try {
      const body: Record<string, string> = {
        slack_channel_id: channelId,
        slack_channel_name: channelName,
      }
      if (label) body.label = label

      const res = await fetchWithCsrf(`/api/v1/clients/${clientId}/slack-channel`, {
        method: 'POST',
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        return false
      }

      const { data } = await res.json()
      // Append new channel to existing array
      setChannels((prev) => [
        ...prev,
        {
          id: data.id,
          slack_channel_id: data.slack_channel_id,
          slack_channel_name: data.slack_channel_name,
          message_count: data.message_count ?? 0,
          label: data.label ?? null,
        },
      ])
      return true
    } catch {
      return false
    }
  }, [clientId])

  const unlinkChannel = useCallback(async (linkId: string): Promise<boolean> => {
    try {
      const res = await fetchWithCsrf(`/api/v1/clients/${clientId}/slack-channel?linkId=${linkId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        return false
      }

      // Remove the unlinked channel from state
      setChannels((prev) => prev.filter((ch) => ch.id !== linkId))
      return true
    } catch {
      return false
    }
  }, [clientId])

  return {
    channels,
    isLoading,
    linkChannel,
    unlinkChannel,
    refetch: fetchChannels,
  }
}

// Backwards-compatible alias (deprecated — use useSlackChannels)
export { useSlackChannels as useSlackChannel }
