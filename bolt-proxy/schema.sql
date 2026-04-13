-- Bolt data schema — D1 (SQLite).
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS conversations (
  session_id     TEXT PRIMARY KEY,
  started_at     INTEGER NOT NULL,      -- ms epoch
  updated_at     INTEGER NOT NULL,      -- ms epoch
  messages       TEXT    NOT NULL,      -- JSON array of {role, content, ts}
  lead_captured  INTEGER NOT NULL DEFAULT 0,
  lead_payload   TEXT,                  -- JSON of fields posted to web3forms
  ip_hash        TEXT,                  -- SHA-256 of IP (privacy)
  user_agent     TEXT,
  referer        TEXT,
  msg_count      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_conv_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_lead       ON conversations(lead_captured, updated_at DESC);
