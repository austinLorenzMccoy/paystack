-- Temporarily allow anon users to insert magic link tokens for testing
-- Run this in Supabase SQL Editor

DROP POLICY IF EXISTS "Service role only" ON magic_link_tokens;
CREATE POLICY "Allow anon inserts for testing" ON magic_link_tokens
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also allow anon users to read their own tokens
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Allow anon operations for testing" ON users
  FOR ALL
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own sessions" ON sessions;
CREATE POLICY "Allow anon session operations for testing" ON sessions
  FOR ALL
  TO anon
  WITH CHECK (true);

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('magic_link_tokens', 'users', 'sessions');
