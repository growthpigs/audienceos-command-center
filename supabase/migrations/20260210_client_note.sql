-- Client Notes table
-- Stores persistent notes per client, visible to all agency users

CREATE TABLE IF NOT EXISTS client_note (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES client(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 5000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_client_note_client ON client_note(client_id);
CREATE INDEX idx_client_note_agency ON client_note(agency_id);
CREATE INDEX idx_client_note_created ON client_note(created_at DESC);

-- RLS
ALTER TABLE client_note ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_note_select" ON client_note
  FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM "user" WHERE id = auth.uid())
  );

CREATE POLICY "client_note_insert" ON client_note
  FOR INSERT WITH CHECK (
    agency_id IN (SELECT agency_id FROM "user" WHERE id = auth.uid())
  );

CREATE POLICY "client_note_delete" ON client_note
  FOR DELETE USING (
    author_id = auth.uid()
  );
