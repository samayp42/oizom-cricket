-- Badminton Matches Table
CREATE TABLE IF NOT EXISTS badminton_matches (
  id TEXT PRIMARY KEY,
  date TEXT,
  stage TEXT, -- 'round_1', 'semi_final', 'final'
  match_type TEXT, -- 'singles', 'doubles'
  team_a_id TEXT REFERENCES teams(id),
  team_b_id TEXT REFERENCES teams(id),
  team_a_player_ids JSONB, -- Array of player IDs
  team_b_player_ids JSONB, -- Array of player IDs
  winner_team_id TEXT,
  points_awarded NUMERIC DEFAULT 0,
  status TEXT, -- 'scheduled', 'completed'
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Add Badminton Stats to Teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS badminton_stats JSONB DEFAULT '{"played": 0, "won": 0, "lost": 0, "points": 0}'::jsonb;

-- Enable RLS
ALTER TABLE badminton_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for all users" ON badminton_matches FOR ALL USING (true) WITH CHECK (true);
