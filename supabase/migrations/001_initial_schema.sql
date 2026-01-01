-- AudienceOS Command Center - Initial Schema
-- Created: 2026-01-01
-- Tables: 19 (multi-tenant with RLS)

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE health_status AS ENUM ('green', 'yellow', 'red');
CREATE TYPE assignment_role AS ENUM ('owner', 'collaborator');
CREATE TYPE integration_provider AS ENUM ('slack', 'gmail', 'google_ads', 'meta_ads');
CREATE TYPE communication_platform AS ENUM ('slack', 'gmail');
CREATE TYPE alert_type AS ENUM ('risk_detected', 'kpi_drop', 'inactivity', 'disconnect');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE alert_status AS ENUM ('active', 'snoozed', 'dismissed', 'resolved');
CREATE TYPE document_category AS ENUM ('installation', 'tech', 'support', 'process', 'client_specific');
CREATE TYPE index_status AS ENUM ('pending', 'indexing', 'indexed', 'failed');
CREATE TYPE chat_role AS ENUM ('user', 'assistant');
CREATE TYPE chat_route AS ENUM ('rag', 'web', 'memory', 'casual', 'dashboard');
CREATE TYPE ticket_category AS ENUM ('technical', 'billing', 'campaign', 'general', 'escalation');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE ticket_status AS ENUM ('new', 'in_progress', 'waiting_client', 'resolved');
CREATE TYPE workflow_status AS ENUM ('running', 'completed', 'failed');
CREATE TYPE preference_category AS ENUM ('notifications', 'ai', 'display');
CREATE TYPE ad_platform AS ENUM ('google_ads', 'meta_ads');

-- ============================================================================
-- 1. AGENCY (Tenant Root)
-- ============================================================================
CREATE TABLE agency (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    logo_url VARCHAR(500),
    domain VARCHAR(100),
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    business_hours JSONB,
    pipeline_stages TEXT[] NOT NULL DEFAULT ARRAY['Onboarding', 'Installation', 'Audit', 'Live', 'Needs Support', 'Off-Boarding'],
    health_thresholds JSONB NOT NULL DEFAULT '{"yellow": 7, "red": 14}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE agency ENABLE ROW LEVEL SECURITY;
CREATE POLICY agency_rls ON agency FOR ALL
    USING (id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- 2. USER
-- ============================================================================
CREATE TABLE "user" (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    email VARCHAR(100) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    avatar_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_active_at TIMESTAMPTZ,
    preferences JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agency_id, email)
);

CREATE INDEX idx_user_agency ON "user"(agency_id);
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_rls ON "user" FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- 3. CLIENT
-- ============================================================================
CREATE TABLE client (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(100),
    contact_name VARCHAR(100),
    stage VARCHAR(50) NOT NULL DEFAULT 'Onboarding',
    health_status health_status NOT NULL DEFAULT 'green',
    days_in_stage INTEGER NOT NULL DEFAULT 0,
    install_date DATE,
    total_spend DECIMAL(12,2),
    lifetime_value DECIMAL(12,2),
    notes TEXT,
    tags TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_agency ON client(agency_id);
CREATE INDEX idx_client_agency_stage ON client(agency_id, stage);
CREATE INDEX idx_client_health ON client(agency_id, health_status);
ALTER TABLE client ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_rls ON client FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- 4. CLIENT_ASSIGNMENT
-- ============================================================================
CREATE TABLE client_assignment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES client(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    role assignment_role NOT NULL DEFAULT 'collaborator',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(client_id, user_id, role)
);

CREATE INDEX idx_client_assignment_agency ON client_assignment(agency_id);
CREATE INDEX idx_client_assignment_user ON client_assignment(user_id);
ALTER TABLE client_assignment ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_assignment_rls ON client_assignment FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- 5. STAGE_EVENT
-- ============================================================================
CREATE TABLE stage_event (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES client(id) ON DELETE CASCADE,
    from_stage VARCHAR(50),
    to_stage VARCHAR(50) NOT NULL,
    moved_by UUID NOT NULL REFERENCES "user"(id),
    moved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT
);

CREATE INDEX idx_stage_event_client ON stage_event(agency_id, client_id, moved_at DESC);
ALTER TABLE stage_event ENABLE ROW LEVEL SECURITY;
CREATE POLICY stage_event_rls ON stage_event FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- 6. TASK
-- ============================================================================
CREATE TABLE task (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES client(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    stage VARCHAR(50),
    assigned_to UUID REFERENCES "user"(id),
    due_date DATE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES "user"(id),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_client_stage ON task(agency_id, client_id, stage);
CREATE INDEX idx_task_assignee ON task(agency_id, assigned_to) WHERE is_completed = false;
ALTER TABLE task ENABLE ROW LEVEL SECURITY;
CREATE POLICY task_rls ON task FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- 7. INTEGRATION
-- ============================================================================
CREATE TABLE integration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    provider integration_provider NOT NULL,
    is_connected BOOLEAN NOT NULL DEFAULT false,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    config JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agency_id, provider)
);

CREATE INDEX idx_integration_agency ON integration(agency_id);
ALTER TABLE integration ENABLE ROW LEVEL SECURITY;
CREATE POLICY integration_rls ON integration FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- 8. COMMUNICATION
-- ============================================================================
CREATE TABLE communication (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES client(id) ON DELETE CASCADE,
    platform communication_platform NOT NULL,
    thread_id VARCHAR(100),
    message_id VARCHAR(100) NOT NULL,
    sender_email VARCHAR(100),
    sender_name VARCHAR(100),
    subject VARCHAR(200),
    content TEXT NOT NULL,
    is_inbound BOOLEAN NOT NULL,
    needs_reply BOOLEAN NOT NULL DEFAULT false,
    replied_at TIMESTAMPTZ,
    replied_by UUID REFERENCES "user"(id),
    received_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comm_client_platform ON communication(agency_id, client_id, platform);
CREATE INDEX idx_comm_needs_reply ON communication(agency_id, needs_reply, received_at DESC) WHERE needs_reply = true;
ALTER TABLE communication ENABLE ROW LEVEL SECURITY;
CREATE POLICY communication_rls ON communication FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- 9. ALERT
-- ============================================================================
CREATE TABLE alert (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    client_id UUID REFERENCES client(id) ON DELETE CASCADE,
    type alert_type NOT NULL,
    severity alert_severity NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    suggested_action TEXT,
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    status alert_status NOT NULL DEFAULT 'active',
    snoozed_until TIMESTAMPTZ,
    resolved_by UUID REFERENCES "user"(id),
    resolved_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alert_agency ON alert(agency_id);
CREATE INDEX idx_alert_active ON alert(agency_id, status) WHERE status = 'active';
ALTER TABLE alert ENABLE ROW LEVEL SECURITY;
CREATE POLICY alert_rls ON alert FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- 10. DOCUMENT
-- ============================================================================
CREATE TABLE document (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    file_name VARCHAR(200) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    category document_category NOT NULL,
    client_id UUID REFERENCES client(id) ON DELETE SET NULL,
    page_count INTEGER,
    word_count INTEGER,
    index_status index_status NOT NULL DEFAULT 'pending',
    gemini_file_id VARCHAR(200),
    uploaded_by UUID NOT NULL REFERENCES "user"(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_document_agency ON document(agency_id);
CREATE INDEX idx_document_category ON document(agency_id, category);
ALTER TABLE document ENABLE ROW LEVEL SECURITY;
CREATE POLICY document_rls ON document FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- 11. CHAT_SESSION
-- ============================================================================
CREATE TABLE chat_session (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title VARCHAR(200),
    context JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_session_user ON chat_session(agency_id, user_id);
ALTER TABLE chat_session ENABLE ROW LEVEL SECURITY;
CREATE POLICY chat_session_rls ON chat_session FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- 12. CHAT_MESSAGE
-- ============================================================================
CREATE TABLE chat_message (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_session(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    role chat_role NOT NULL,
    content TEXT NOT NULL,
    route_used chat_route,
    citations JSONB,
    tokens_used INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_message_session ON chat_message(session_id, created_at);
ALTER TABLE chat_message ENABLE ROW LEVEL SECURITY;
CREATE POLICY chat_message_rls ON chat_message FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- 13. TICKET
-- ============================================================================
CREATE TABLE ticket (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES client(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category ticket_category NOT NULL,
    priority ticket_priority NOT NULL DEFAULT 'medium',
    status ticket_status NOT NULL DEFAULT 'new',
    assignee_id UUID REFERENCES "user"(id),
    resolution_notes TEXT,
    time_spent_minutes INTEGER,
    due_date DATE,
    created_by UUID NOT NULL REFERENCES "user"(id),
    resolved_by UUID REFERENCES "user"(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agency_id, number)
);

CREATE INDEX idx_ticket_agency ON ticket(agency_id);
CREATE INDEX idx_ticket_client ON ticket(agency_id, client_id);
CREATE INDEX idx_ticket_status ON ticket(agency_id, status);
ALTER TABLE ticket ENABLE ROW LEVEL SECURITY;
CREATE POLICY ticket_rls ON ticket FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- Function for auto-incrementing ticket number per agency
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.number := COALESCE(
        (SELECT MAX(number) + 1 FROM ticket WHERE agency_id = NEW.agency_id),
        1
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_number_trigger
    BEFORE INSERT ON ticket
    FOR EACH ROW
    EXECUTE FUNCTION generate_ticket_number();

-- ============================================================================
-- 14. TICKET_NOTE
-- ============================================================================
CREATE TABLE ticket_note (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    ticket_id UUID NOT NULL REFERENCES ticket(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT true,
    added_by UUID NOT NULL REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_note_ticket ON ticket_note(ticket_id, created_at);
ALTER TABLE ticket_note ENABLE ROW LEVEL SECURITY;
CREATE POLICY ticket_note_rls ON ticket_note FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- 15. WORKFLOW
-- ============================================================================
CREATE TABLE workflow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    triggers JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES "user"(id),
    last_run_at TIMESTAMPTZ,
    run_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_agency ON workflow(agency_id);
ALTER TABLE workflow ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflow_rls ON workflow FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- 16. WORKFLOW_RUN
-- ============================================================================
CREATE TABLE workflow_run (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
    trigger_data JSONB NOT NULL,
    status workflow_status NOT NULL DEFAULT 'running',
    executed_actions JSONB,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_workflow_run_workflow ON workflow_run(workflow_id, started_at DESC);
ALTER TABLE workflow_run ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflow_run_rls ON workflow_run FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- 17. USER_PREFERENCE
-- ============================================================================
CREATE TABLE user_preference (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    category preference_category NOT NULL,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, category, key)
);

CREATE INDEX idx_user_preference_user ON user_preference(user_id);
ALTER TABLE user_preference ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_preference_rls ON user_preference FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- 18. KPI_SNAPSHOT
-- ============================================================================
CREATE TABLE kpi_snapshot (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(12,2) NOT NULL,
    previous_value DECIMAL(12,2),
    metadata JSONB,
    snapshot_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kpi_agency_metric ON kpi_snapshot(agency_id, metric_name, snapshot_date DESC);
ALTER TABLE kpi_snapshot ENABLE ROW LEVEL SECURITY;
CREATE POLICY kpi_snapshot_rls ON kpi_snapshot FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- 19. AD_PERFORMANCE
-- ============================================================================
CREATE TABLE ad_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES client(id) ON DELETE CASCADE,
    platform ad_platform NOT NULL,
    account_id VARCHAR(100) NOT NULL,
    campaign_id VARCHAR(100),
    date DATE NOT NULL,
    spend DECIMAL(10,2) NOT NULL,
    impressions INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    conversions DECIMAL(8,2) NOT NULL DEFAULT 0,
    revenue DECIMAL(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ad_perf_client_date ON ad_performance(agency_id, client_id, date DESC);
CREATE INDEX idx_ad_perf_platform ON ad_performance(agency_id, platform, date DESC);
ALTER TABLE ad_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY ad_performance_rls ON ad_performance FOR ALL
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- ============================================================================
-- STORAGE BUCKETS (Run via Supabase Dashboard or separate migration)
-- ============================================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('exports', 'exports', false);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_agency_updated_at BEFORE UPDATE ON agency FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_updated_at BEFORE UPDATE ON client FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_updated_at BEFORE UPDATE ON task FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integration_updated_at BEFORE UPDATE ON integration FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alert_updated_at BEFORE UPDATE ON alert FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_updated_at BEFORE UPDATE ON document FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ticket_updated_at BEFORE UPDATE ON ticket FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_updated_at BEFORE UPDATE ON workflow FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preference_updated_at BEFORE UPDATE ON user_preference FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
