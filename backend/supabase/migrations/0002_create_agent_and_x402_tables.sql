-- ============================================================
-- Agent Detection + x402 Protocol Tables
-- ============================================================

-- Agent detection log
CREATE TABLE IF NOT EXISTS agent_detections (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_agent    text,
  agent_id      text,
  is_agent      boolean NOT NULL DEFAULT false,
  confidence    numeric(4,3) NOT NULL DEFAULT 0.5,
  reasoning     text,
  detected_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_detections_agent ON agent_detections (is_agent, detected_at DESC);

-- Registered API keys for AI agents
CREATE TABLE IF NOT EXISTS agent_api_keys (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id    text NOT NULL,
  agent_name    text NOT NULL,
  api_key_hash  text NOT NULL UNIQUE,
  permissions   jsonb DEFAULT '["read","pay"]'::jsonb,
  rate_limit    integer DEFAULT 100,          -- requests per minute
  is_active     boolean DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_used_at  timestamptz
);

CREATE INDEX idx_agent_api_keys_hash ON agent_api_keys (api_key_hash) WHERE is_active = true;

-- x402 payment challenges (pending 402 responses)
CREATE TABLE IF NOT EXISTS x402_challenges (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id      text NOT NULL,
  requester       text NOT NULL,                -- wallet address or agent key
  is_agent        boolean DEFAULT false,
  amount          numeric NOT NULL,
  asset           text NOT NULL DEFAULT 'STX',
  recipient       text NOT NULL,                -- creator wallet
  contract_addr   text,
  challenge_token text NOT NULL UNIQUE,         -- opaque token returned in 402
  status          text NOT NULL DEFAULT 'pending', -- pending | paid | expired
  created_at      timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  paid_tx_id      text,
  paid_at         timestamptz
);

CREATE INDEX idx_x402_challenges_token ON x402_challenges (challenge_token) WHERE status = 'pending';
CREATE INDEX idx_x402_challenges_expiry ON x402_challenges (expires_at) WHERE status = 'pending';

-- Agent usage metering
CREATE TABLE IF NOT EXISTS agent_usage (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_key_id  uuid REFERENCES agent_api_keys(id),
  endpoint      text NOT NULL,
  method        text NOT NULL,
  status_code   integer,
  recorded_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_usage_key ON agent_usage (agent_key_id, recorded_at DESC);
