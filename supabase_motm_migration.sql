-- Add man_of_the_match column to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS man_of_the_match TEXT;

-- Also add to knockout_matches table for consistency
ALTER TABLE knockout_matches ADD COLUMN IF NOT EXISTS man_of_the_match TEXT;
