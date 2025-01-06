-- Enable RLS on all tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "Enable read access for own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for service role" ON subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for marketing_plans
CREATE POLICY "Enable all access for own marketing plans" ON marketing_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for service role" ON marketing_plans
  FOR INSERT WITH CHECK (true);

-- Create policies for customers
CREATE POLICY "Enable all access for own customer data" ON customers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for service role" ON customers
  FOR INSERT WITH CHECK (true);

-- Create policies for messages
CREATE POLICY "Enable all access for own messages" ON messages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for service role" ON messages
  FOR INSERT WITH CHECK (true);

-- Create policies for experts
CREATE POLICY "Enable read access for all authenticated users" ON experts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert/update for service role" ON experts
  FOR ALL USING (auth.role() = 'service_role');

-- Create policies for audit_logs
CREATE POLICY "Enable insert for service role" ON audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id); 