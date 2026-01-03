/**
 * Get Clients Function Executor
 *
 * Ported from Holy Grail Chat (HGC).
 * Part of: 3-System Consolidation
 */

import type { ExecutorContext, GetClientsArgs, ClientSummary, ClientDetails } from './types';

/**
 * Mock data for standalone testing
 * TODO: Replace with Supabase queries when fully integrated
 */
const MOCK_CLIENTS: ClientDetails[] = [
  {
    id: 'client-001',
    name: 'Acme Corporation',
    stage: 'Live',
    healthStatus: 'red',
    contactName: 'John Smith',
    contactEmail: 'john@acme.com',
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    industry: 'Technology',
  },
  {
    id: 'client-002',
    name: 'Beta Industries',
    stage: 'Live',
    healthStatus: 'yellow',
    contactName: 'Sarah Johnson',
    contactEmail: 'sarah@beta.io',
    lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    industry: 'Manufacturing',
  },
  {
    id: 'client-003',
    name: 'Gamma Solutions',
    stage: 'Onboarding',
    healthStatus: 'green',
    contactName: 'Mike Wilson',
    contactEmail: 'mike@gamma.co',
    lastActivity: new Date().toISOString(),
    industry: 'Healthcare',
  },
  {
    id: 'client-004',
    name: 'Delta Corp',
    stage: 'Live',
    healthStatus: 'red',
    contactName: 'Emily Chen',
    contactEmail: 'emily@delta.com',
    lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    industry: 'Finance',
  },
];

/**
 * Get list of clients with optional filters
 */
export async function getClients(
  context: ExecutorContext,
  rawArgs: Record<string, unknown>
): Promise<ClientSummary[]> {
  const args = rawArgs as unknown as GetClientsArgs;
  const limit = args.limit ?? 10;

  let clients = [...MOCK_CLIENTS];

  if (args.stage) {
    clients = clients.filter((c) => c.stage === args.stage);
  }

  if (args.health_status) {
    clients = clients.filter((c) => c.healthStatus === args.health_status);
  }

  if (args.search) {
    const searchLower = args.search.toLowerCase();
    clients = clients.filter((c) => c.name.toLowerCase().includes(searchLower));
  }

  return clients.slice(0, limit).map((client) => ({
    id: client.id,
    name: client.name,
    stage: client.stage,
    healthStatus: client.healthStatus,
    contactName: client.contactName,
    contactEmail: client.contactEmail,
    lastActivity: client.lastActivity,
  }));
}

/**
 * Get detailed information about a specific client
 */
export async function getClientDetails(
  context: ExecutorContext,
  rawArgs: Record<string, unknown>
): Promise<ClientDetails | null> {
  const args = rawArgs as unknown as { client_id?: string; client_name?: string };

  let client: ClientDetails | undefined;

  if (args.client_id) {
    client = MOCK_CLIENTS.find((c) => c.id === args.client_id);
  } else if (args.client_name) {
    const nameLower = args.client_name.toLowerCase();
    client = MOCK_CLIENTS.find((c) => c.name.toLowerCase().includes(nameLower));
  }

  return client || null;
}
