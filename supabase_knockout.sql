-- Create Knockout Matches Table (Generic for all knockout games)
CREATE TABLE IF NOT EXISTS knockout_matches (
  id TEXT PRIMARY KEY,
  game_type TEXT NOT NULL, -- 'badminton', 'table_tennis', 'chess', 'carrom'
  stage TEXT NOT NULL,
  match_type TEXT NOT NULL,
  team_a_id TEXT NOT NULL,
  team_b_id TEXT NOT NULL,
  team_a_player_ids TEXT[],
  team_b_player_ids TEXT[],
  winner_team_id TEXT,
  status TEXT NOT NULL,
  points_awarded INTEGER,
  result_message TEXT,
  date TEXT
);

-- Enable RLS
ALTER TABLE knockout_matches ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Enable read access for all users" ON knockout_matches FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON knockout_matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON knockout_matches FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON knockout_matches FOR DELETE USING (true);

-- Add Stats Columns to Teams Table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS badminton_stats JSONB DEFAULT '{"played":0,"won":0,"lost":0,"points":0}';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS table_tennis_stats JSONB DEFAULT '{"played":0,"won":0,"lost":0,"points":0}';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS chess_stats JSONB DEFAULT '{"played":0,"won":0,"lost":0,"points":0}';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS carrom_stats JSONB DEFAULT '{"played":0,"won":0,"lost":0,"points":0}';
