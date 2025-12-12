-- Enable Realtime
drop publication if exists supabase_realtime;
create publication supabase_realtime for all tables;

-- Teams Table
create table if not exists teams (
  id text primary key,
  name text not null,
  "group" text not null,
  stats jsonb default '{}'::jsonb,
  created_at timestamptz default timezone('utc', now())
);

-- Players Table
create table if not exists players (
  id text primary key,
  team_id text references teams(id) on delete cascade,
  name text not null,
  role text default 'player',
  gender text default 'M',
  stats jsonb default '{}'::jsonb
);

-- Matches Table
create table if not exists matches (
  id text primary key,
  date text,
  team_a_id text references teams(id),
  team_b_id text references teams(id),
  status text,
  play_status text,
  total_overs numeric,
  group_stage boolean,
  knockout_stage text,
  toss jsonb,
  innings1 jsonb,
  innings2 jsonb,
  winner_id text,
  result_message text,
  created_at timestamptz default timezone('utc', now())
);

-- RLS Policies (Open for now, can be restricted later)
alter table teams enable row level security;
alter table players enable row level security;
alter table matches enable row level security;

create policy "Enable all access for all users" on teams for all using (true) with check (true);
create policy "Enable all access for all users" on players for all using (true) with check (true);
create policy "Enable all access for all users" on matches for all using (true) with check (true);

-- Migration: Add role to players if it doesn't exist
alter table players add column if not exists role text default 'player';

-- Migration: Add gender to players if it doesn't exist
alter table players add column if not exists gender text default 'M';
