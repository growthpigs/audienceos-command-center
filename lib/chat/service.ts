/**
 * Chat Service (Not Yet Implemented)
 *
 * This module contains the chat service implementation.
 * It is not yet complete and is reserved for future development.
 *
 * Chat endpoints currently return 501 Not Implemented responses.
 */

/**
 * ChatService - Placeholder stub
 *
 * The full implementation is incomplete and under development.
 * For now, this is a placeholder to prevent build errors.
 */
export class ChatService {
  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
  }
}

export { type ChatMessage, type ChatRequest, type ChatSession, type StreamOptions, type StreamChunk } from './types';
