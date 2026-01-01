'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import { useCommunicationsStore, type CommunicationWithMeta } from '@/stores/communications-store'
import { communicationsKeys } from './use-communications'
import { toast } from 'sonner'

interface UseRealtimeCommunicationsOptions {
  clientId: string
  enabled?: boolean
}

/**
 * Hook to subscribe to real-time communication updates for a client
 * Uses Supabase Realtime to receive INSERT/UPDATE events
 */
export function useRealtimeCommunications({
  clientId,
  enabled = true,
}: UseRealtimeCommunicationsOptions) {
  const queryClient = useQueryClient()
  const { addCommunication, updateCommunication } = useCommunicationsStore()
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  // Handle new message
  const handleNewMessage = useCallback(
    (payload: { new: CommunicationWithMeta }) => {
      const newMessage = payload.new

      // Add to store
      addCommunication({
        ...newMessage,
        is_read: false, // New messages are unread
        reply_to_id: null,
      })

      // Show toast notification
      const platformLabel = newMessage.platform === 'slack' ? 'Slack' : 'Gmail'
      const senderName = newMessage.sender_name || newMessage.sender_email || 'Unknown'

      toast.info(`New ${platformLabel} message`, {
        description: `From ${senderName}`,
        duration: 5000,
      })

      // Invalidate query cache
      queryClient.invalidateQueries({
        queryKey: communicationsKeys.list(clientId),
      })
    },
    [addCommunication, clientId, queryClient]
  )

  // Handle message update
  const handleUpdateMessage = useCallback(
    (payload: { new: CommunicationWithMeta; old: CommunicationWithMeta }) => {
      const updatedMessage = payload.new

      // Update in store
      updateCommunication(updatedMessage.id, updatedMessage)

      // Invalidate query cache
      queryClient.invalidateQueries({
        queryKey: communicationsKeys.detail(updatedMessage.id),
      })
    },
    [updateCommunication, queryClient]
  )

  useEffect(() => {
    if (!enabled || !clientId) return

    const supabase = createClient()

    // Create a unique channel name for this client's communications
    const channelName = `client-comms-${clientId}`

    // Subscribe to changes
    const channel = supabase
      .channel(channelName)
      .on<CommunicationWithMeta>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'communication',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => handleNewMessage(payload as { new: CommunicationWithMeta })
      )
      .on<CommunicationWithMeta>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'communication',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) =>
          handleUpdateMessage(
            payload as { new: CommunicationWithMeta; old: CommunicationWithMeta }
          )
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Realtime: Subscribed to ${channelName}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Realtime: Error subscribing to ${channelName}`)
        }
      })

    channelRef.current = channel

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [clientId, enabled, handleNewMessage, handleUpdateMessage])

  // Return unsubscribe function
  return {
    unsubscribe: () => {
      if (channelRef.current) {
        const supabase = createClient()
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    },
  }
}
