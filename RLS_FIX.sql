-- Fix RLS Policies for Magic Link Authentication
-- Run this in Supabase SQL Editor

-- 1. Create admin function to bypass RLS for service operations
CREATE OR REPLACE FUNCTION admin_insert_magic_link(
  p_email TEXT,
  p_token TEXT,
  p_expires_at TIMESTAMPTZ,
  p_redirect_to TEXT DEFAULT '/subscribe'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO magic_link_tokens (
    email,
    token,
    expires_at,
    redirect_to,
    used,
    created_at
  ) VALUES (
    p_email,
    p_token,
    p_expires_at,
    p_redirect_to,
    false,
    NOW()
  );
END;
$$;

-- 2. Create admin function for user operations
CREATE OR REPLACE FUNCTION admin_get_or_create_user(
  p_email TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Try to get existing user
  SELECT id INTO user_id FROM users WHERE email = p_email;
  
  -- If not found, create new user
  IF user_id IS NULL THEN
    INSERT INTO users (email, created_at, last_login_at)
    VALUES (p_email, NOW(), NOW())
    RETURNING id INTO user_id;
  ELSE
    -- Update last login
    UPDATE users SET last_login_at = NOW() WHERE id = user_id;
  END IF;
  
  RETURN user_id;
END;
$$;

-- 3. Create admin function for session creation
CREATE OR REPLACE FUNCTION admin_create_session(
  p_user_id UUID,
  p_token TEXT,
  p_expires_at TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO sessions (
    user_id,
    token,
    expires_at,
    created_at,
    last_used_at
  ) VALUES (
    p_user_id,
    p_token,
    p_expires_at,
    NOW(),
    NOW()
  );
END;
$$;

-- 4. Create admin function for token validation
CREATE OR REPLACE FUNCTION admin_validate_token(
  p_token TEXT
)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  redirect_to TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    t.redirect_to,
    t.expires_at
  FROM magic_link_tokens t
  JOIN users u ON u.email = t.email
  WHERE t.token = p_token
    AND t.used = false
    AND t.expires_at > NOW();
END;
$$;

-- 5. Create admin function to mark token as used
CREATE OR REPLACE FUNCTION admin_mark_token_used(
  p_token TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE magic_link_tokens 
  SET used = true, used_at = NOW() 
  WHERE token = p_token;
END;
$$;

-- 6. Grant necessary permissions
GRANT EXECUTE ON FUNCTION admin_insert_magic_link TO service_role;
GRANT EXECUTE ON FUNCTION admin_get_or_create_user TO service_role;
GRANT EXECUTE ON FUNCTION admin_create_session TO service_role;
GRANT EXECUTE ON FUNCTION admin_validate_token TO service_role;
GRANT EXECUTE ON FUNCTION admin_mark_token_used TO service_role;

-- 7. Update RLS policies to be more permissive for service role
DROP POLICY IF EXISTS "Service role only" ON magic_link_tokens;
CREATE POLICY "Service role full access" ON magic_link_tokens
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage users" ON users;
CREATE POLICY "Service role full access" ON users
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage sessions" ON sessions;
CREATE POLICY "Service role full access" ON sessions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 8. Verification query
SELECT 
  'RLS Fix Applied' as status,
  'Functions created' as functions_created,
  'Policies updated' as policies_updated
WHERE 
  EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'admin_insert_magic_link')
  AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'magic_link_tokens');
