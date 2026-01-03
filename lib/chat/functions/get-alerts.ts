/**
 * Get Alerts Function Executor
 *
 * Ported from Holy Grail Chat (HGC).
 * Part of: 3-System Consolidation
 */

import type { ExecutorContext, GetAlertsArgs, AlertSummary } from './types';

/**
 * Mock alerts for standalone testing
 */
const MOCK_ALERTS: AlertSummary[] = [
  {
    id: 'alert-001',
    clientId: 'client-001',
    clientName: 'Acme Corporation',
    type: 'kpi_drop',
    severity: 'critical',
    title: 'ROAS dropped 40% in last 7 days',
    description: 'Return on ad spend has significantly decreased',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alert-002',
    clientId: 'client-004',
    clientName: 'Delta Corp',
    type: 'inactivity',
    severity: 'high',
    title: 'No activity for 10 days',
    description: 'Client has not engaged with the platform',
    status: 'active',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-003',
    clientId: 'client-002',
    clientName: 'Beta Industries',
    type: 'disconnect',
    severity: 'medium',
    title: 'Meta Ads disconnected',
    description: 'Integration requires reconnection',
    status: 'active',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Get alerts with optional filters
 */
export async function getAlerts(
  context: ExecutorContext,
  rawArgs: Record<string, unknown>
): Promise<AlertSummary[]> {
  const args = rawArgs as unknown as GetAlertsArgs;
  const limit = args.limit ?? 10;

  let alerts = [...MOCK_ALERTS];

  if (args.severity) {
    alerts = alerts.filter((a) => a.severity === args.severity);
  }

  if (args.status) {
    alerts = alerts.filter((a) => a.status === args.status);
  }

  if (args.client_id) {
    alerts = alerts.filter((a) => a.clientId === args.client_id);
  }

  if (args.type) {
    alerts = alerts.filter((a) => a.type === args.type);
  }

  return alerts.slice(0, limit);
}
