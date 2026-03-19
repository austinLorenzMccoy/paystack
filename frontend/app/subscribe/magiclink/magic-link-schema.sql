-- =====================================================
-- x402Pay Magic Link Authentication Tables
-- =====================================================

-- 1. Magic Link Tokens Table
-- Stores temporary tokens for email-based authentication
CREATE TABLE IF NOT EXISTS magic_link_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  redirect_to TEXT DEFAULT '/subscribe',
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_magic_link_tokens_token ON magic_link_tokens(token);
CREATE INDEX idx_magic_link_tokens_email ON magic_link_tokens(email);
CREATE INDEX idx_magic_link_tokens_expires_at ON magic_link_tokens(expires_at);

-- Auto-cleanup expired tokens (runs daily)
CREATE OR REPLACE FUNCTION cleanup_expired_magic_links()
RETURNS void AS $$
BEGIN
  DELETE FROM magic_link_tokens
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- =====================================================

-- 2. Users Table
-- Stores user account information
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  wallet_address TEXT,
  testnet_stx_balance BIGINT DEFAULT 5000000, -- 5 STX welcome bonus
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet_address ON users(wallet_address);

-- =====================================================

-- 3. Sessions Table
-- Stores active user sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Auto-cleanup expired sessions (runs daily)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================

-- 4. Row Level Security (RLS) Policies
-- Enable RLS on all tables

ALTER TABLE magic_link_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Magic Link Tokens: Only service role can access
CREATE POLICY "Service role only" ON magic_link_tokens
  FOR ALL
  USING (auth.role() = 'service_role');

-- Users: Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Users: Service role can manage all
CREATE POLICY "Service role can manage users" ON users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Sessions: Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT
  USING (user_id::text = auth.uid()::text);

-- Sessions: Service role can manage all
CREATE POLICY "Service role can manage sessions" ON sessions
  FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================

-- 5. Helper Functions

-- Get user by session token
CREATE OR REPLACE FUNCTION get_user_by_session(session_token TEXT)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  wallet_address TEXT,
  testnet_stx_balance BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.wallet_address,
    u.testnet_stx_balance
  FROM users u
  JOIN sessions s ON s.user_id = u.id
  WHERE s.token = session_token
    AND s.expires_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================

-- 6. Sample Queries

-- Check if magic link is valid
-- SELECT * FROM magic_link_tokens 
-- WHERE token = 'your-token-here' 
--   AND used = FALSE 
--   AND expires_at > NOW();

-- Get user session
-- SELECT * FROM get_user_by_session('session-token-here');

-- Cleanup (run these via cron or manually)
-- SELECT cleanup_expired_magic_links();
-- SELECT cleanup_expired_sessions();

-- =====================================================
-- End of Schema
-- =====================================================

COMMENT ON TABLE magic_link_tokens IS 'Temporary tokens for email-based authentication';
COMMENT ON TABLE users IS 'User accounts with email and optional wallet';
COMMENT ON TABLE sessions IS 'Active user sessions with expiration';
