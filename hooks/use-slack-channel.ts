import { useState, useEffect, useCallback } from 'react'
import { fetchWithCsrf } from '@/lib/csrf'

interface SlackChannelData {
  id: string
  slack_channel_id: string
  slack_channel_name: string
  message_count: number
}

interface UseSlackChannelResult {
  channel: SlackChannelData | null
  isLoading: boolean
  linkChannel: (channelId: string, channelName: string) => Promise<boolean>
  unlinkChannel: () => Promise<boolean>
  refetch: () => void
}

export function useSlackChannel(clientId: string): UseSlackChannelResult {
  const [channel, setChannel] = useState<SlackChannelData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchChannel = useCallback(async () => {
    if (!clientId) {
      setChannel(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/v1/clients/${clientId}/slack-channel`, {
        credentials: 'include',
      })
      if (!res.ok) {
        setChannel(null)
        return
      }
      const { data } = await res.json()
      // Only show active channels
      if (data && data.is_active !== false) {
        setChannel({
          id: data.id,
          slack_channel_id: data.slack_channel_id,
          slack_channel_name: data.slack_channel_name,
          message_count: data.message_count ?? 0,
        })
      } else {
        setChannel(null)
      }
    } catch {
      setChannel(null)
    } finally {
      setIsLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchChannel()
  }, [fetchChannel])

  const linkChannel = useCallback(async (channelId: string, channelName: string): Promise<boolean> => {
    try {
      const res = await fetchWithCsrf(`/api/v1/clients/${clientId}/slack-channel`, {
        method: 'POST',
        body: JSON.stringify({
          slack_channel_id: channelId,
          slack_channel_name: channelName,
        }),
      })

      if (!res.ok) {
        return false
      }

      const { data } = await res.json()
      setChannel({
        id: data.id,
        slack_channel_id: data.slack_channel_id,
        slack_channel_name: data.slack_channel_name,
        message_count: 0,
      })
      return true
    } catch {
      return false
    }
  }, [clientId])

  const unlinkChannel = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetchWithCsrf(`/api/v1/clients/${clientId}/slack-channel`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        return false
      }

      setChannel(null)
      return true
    } catch {
      return false
    }
  }, [clientId])

  return {
    channel,
    isLoading,
    linkChannel,
    unlinkChannel,
    refetch: fetchChannel,
  }
}
