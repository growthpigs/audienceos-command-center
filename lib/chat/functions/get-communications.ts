/**
 * Get Communications Function Executor
 *
 * Ported from Holy Grail Chat (HGC).
 * Part of: 3-System Consolidation
 */

import type { ExecutorContext, GetRecentCommunicationsArgs, CommunicationSummary } from './types';

/**
 * Mock communications for standalone testing
 */
const MOCK_COMMUNICATIONS: CommunicationSummary[] = [
  {
    id: 'comm-001',
    type: 'email',
    subject: 'Quarterly Review',
    summary: 'Scheduled Q1 performance review meeting',
    from: 'agency@example.com',
    to: 'john@acme.com',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comm-002',
    type: 'call',
    subject: 'Strategy Discussion',
    summary: 'Discussed new campaign strategy',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comm-003',
    type: 'meeting',
    subject: 'Onboarding Kickoff',
    summary: 'Initial onboarding meeting with new client',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Get recent communications for a client
 */
export async function getRecentCommunications(
  context: ExecutorContext,
  rawArgs: Record<string, unknown>
): Promise<CommunicationSummary[]> {
  const args = rawArgs as unknown as GetRecentCommunicationsArgs;
  const limit = args.limit ?? 10;

  let communications = [...MOCK_COMMUNICATIONS];

  if (args.type) {
    communications = communications.filter((c) => c.type === args.type);
  }

  return communications.slice(0, limit);
}
