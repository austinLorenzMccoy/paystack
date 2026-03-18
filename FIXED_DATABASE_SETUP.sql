-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  specialty TEXT NOT NULL,
  reputation DECIMAL(3,2) DEFAULT 4.5,
  hourly_rate DECIMAL(10,6) NOT NULL,
  total_earnings DECIMAL(20,6) DEFAULT 0,
  success_rate INTEGER DEFAULT 90,
  available BOOLEAN DEFAULT true,
  description TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agents_specialty ON agents(specialty);
CREATE INDEX IF NOT EXISTS idx_agents_available ON agents(available);
CREATE INDEX IF NOT EXISTS idx_agents_reputation ON agents(reputation DESC);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe approach)
DROP POLICY IF EXISTS "Anyone can view agents" ON agents;
DROP POLICY IF EXISTS "Authenticated users can manage agents" ON agents;

-- Create policies (without IF NOT EXISTS)
CREATE POLICY "Anyone can view agents" ON agents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage agents" ON agents FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample agents
INSERT INTO agents (name, specialty, reputation, hourly_rate, total_earnings, success_rate, available, description, skills) VALUES
('ResearchGPT', 'research', 4.8, 0.05, 1250.50, 96, true, 'Specialized in blockchain research and market analysis for creators', ARRAY['Market Research', 'Data Analysis', 'Trend Identification', 'Competitive Analysis']),
('ContentWriter Pro', 'writing', 4.9, 0.04, 2100.25, 98, true, 'Professional content creation for articles, scripts and social media', ARRAY['Article Writing', 'Script Writing', 'SEO Optimization', 'Social Media Content']),
('DataAnalyzer X', 'analysis', 4.7, 0.06, 980.75, 94, true, 'Advanced data analysis and financial modeling for creator businesses', ARRAY['Financial Analysis', 'Data Modeling', 'Performance Analytics', 'Revenue Optimization']),
('GrowthOptimizer', 'optimization', 4.6, 0.045, 1560.00, 95, false, 'A/B testing, conversion optimization and growth strategies', ARRAY['A/B Testing', 'Conversion Optimization', 'Growth Hacking', 'User Analytics'])
ON CONFLICT (name) DO NOTHING;

-- Create agent functions
CREATE OR REPLACE FUNCTION get_agents_by_specialty(specialty_filter TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  specialty TEXT,
  reputation DECIMAL(3,2),
  hourly_rate DECIMAL(10,6),
  total_earnings DECIMAL(20,6),
  success_rate INTEGER,
  available BOOLEAN,
  description TEXT,
  skills TEXT[]
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id, name, specialty, reputation, hourly_rate, 
    total_earnings, success_rate, available, description, skills
  FROM agents 
  WHERE available = true 
    AND (specialty_filter = 'all' OR specialty = specialty_filter)
  ORDER BY reputation DESC, total_earnings DESC;
$$;

-- Create agent_tasks table first (needed for hire_agent function)
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES agents(id),
  client_id UUID REFERENCES auth.users(id),
  description TEXT NOT NULL,
  budget DECIMAL(10,6) NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  requirements TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for agent_tasks
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for agent_tasks
DROP POLICY IF EXISTS "Users can view their own tasks" ON agent_tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON agent_tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON agent_tasks;

CREATE POLICY "Users can view their own tasks" ON agent_tasks FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can create tasks" ON agent_tasks FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update their own tasks" ON agent_tasks FOR UPDATE USING (auth.uid() = client_id);

-- Create hiring function
CREATE OR REPLACE FUNCTION hire_agent(
  agent_id UUID,
  task_description TEXT,
  task_budget DECIMAL(10,6),
  task_deadline TIMESTAMP WITH TIME ZONE,
  task_requirements TEXT[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_task_id UUID;
BEGIN
  -- Check if agent is available
  IF NOT EXISTS (SELECT 1 FROM agents WHERE id = agent_id AND available = true) THEN
    RAISE EXCEPTION 'Agent is not available';
  END IF;
  
  -- Create the task
  INSERT INTO agent_tasks (agent_id, client_id, description, budget, deadline, requirements)
  VALUES (agent_id, auth.uid(), task_description, task_budget, task_deadline, task_requirements)
  RETURNING id INTO new_task_id;
  
  -- Mark agent as unavailable
  UPDATE agents SET available = false WHERE id = agent_id;
  
  RETURN new_task_id;
END;
$$;

-- Verify setup - check if agents were created
SELECT name, specialty, reputation, available FROM agents ORDER BY reputation DESC;
