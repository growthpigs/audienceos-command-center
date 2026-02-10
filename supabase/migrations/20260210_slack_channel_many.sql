-- Multi-channel Slack linking: allow multiple channels per client
-- Drop the 1:1 constraint (was: UNIQUE(agency_id, client_id))
ALTER TABLE client_slack_channel
  DROP CONSTRAINT IF EXISTS client_slack_channel_agency_id_client_id_key;

-- Add optional label column for distinguishing channels (e.g., "Internal", "External")
ALTER TABLE client_slack_channel
  ADD COLUMN IF NOT EXISTS label VARCHAR(50) DEFAULT NULL;
