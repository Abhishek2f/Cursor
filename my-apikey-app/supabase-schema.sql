-- Create API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  key_value VARCHAR(255) UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE
);

-- Create index on key_value for fast lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_key_value ON api_keys(key_value);

-- Create index on active keys
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_api_keys_updated_at 
    BEFORE UPDATE ON api_keys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- For development: Allow public access (less secure, but works with anon key)
CREATE POLICY "Enable all operations for all users" ON api_keys
    FOR ALL USING (true);

-- For production: Uncomment and use authenticated access instead
-- CREATE POLICY "Enable all operations for authenticated users" ON api_keys
--     FOR ALL USING (auth.role() = 'authenticated');
