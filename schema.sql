-- Paste and run this in Supabase SQL Editor

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#4f46e5',
    domain TEXT,
    github TEXT,
    vercel TEXT,
    supabase TEXT,
    other_link TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON projects
    FOR SELECT USING (true);

-- Allow public insert access (For your personal app, we allow this temporarily. In production, you should restrict this to authenticated users)
CREATE POLICY "Allow public insert access" ON projects
    FOR INSERT WITH CHECK (true);

-- Allow public update access
CREATE POLICY "Allow public update access" ON projects
    FOR UPDATE USING (true);

-- Allow public delete access
CREATE POLICY "Allow public delete access" ON projects
    FOR DELETE USING (true);

-- Insert initial dummy data
INSERT INTO projects (name, description, color, domain, github, tags)
VALUES (
    'BizConnect.One',
    'Dự án kết nối doanh nghiệp chính.',
    '#4f46e5',
    'https://bizconnect.one',
    'https://github.com/lenguyen02042004-lang',
    ARRAY['React', 'Supabase', 'Vercel']
);
