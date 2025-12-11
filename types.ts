export interface Player {
  id: string;
  name: string;
  teamId: string;
  stats: {
    runs: number;
    balls: number;
    wickets: number;
    oversBowled: number;
    runsConceded: number;
    fours: number;
    sixes: number;
  };
}

export interface Team {
  id: string;
  name: string;
  group: 'A' | 'B';
  players: Player[];
  stats: {
    played: number;
    won: number;
    lost: number;
    tie: number;
    points: number;
    nrr: number;
    totalRunsScored: number;
    totalOversFaced: number;
    totalRunsConceded: number;
    totalOversBowled: number;
  };
}

export type ExtraType = 'wide' | 'no-ball' | 'bye' | 'leg-bye' | null;
export type WicketType = 'bowled' | 'caught' | 'run-out' | 'lbw' | 'stumped' | 'retired' | null;

export interface BallEvent {
  id: string;
  overNumber: number;
  ballInOver: number;
  bowlerId: string;
  batterId: string;
  runsScored: number;
  extras: number;
  extraType: ExtraType;
  isWicket: boolean;
  wicketType: WicketType;
  wicketPlayerId?: string;
  isValidBall: boolean;
  commentary?: string; // Generated text
}

export interface Partnership {
  batter1Id: string;
  batter2Id: string;
  runs: number;
  balls: number;
}

export interface FOW {
  score: number;
  wicketCount: number;
  over: number; // e.g., 4.2
  batterId: string;
}

export interface InningsState {
  battingTeamId: string;
  bowlingTeamId: string;
  totalRuns: number;
  wickets: number;
  overs: number;
  currentOver: BallEvent[];
  history: BallEvent[];
  strikerId: string;
  nonStrikerId: string;
  currentBowlerId: string;
  battingOrder: string[]; // List of player IDs who have batted
  playersOut: string[]; // List of player IDs who are out
  // New Features
  isFreeHit: boolean;
  currentPartnership: Partnership;
  fow: FOW[]; 
}

export type MatchStatus = 'scheduled' | 'toss' | 'live' | 'innings_break' | 'completed';
export type PlayStatus = 'active' | 'waiting_for_bowler';

export interface Match {
  id: string;
  date: string;
  teamAId: string;
  teamBId: string;
  groupStage: boolean;
  knockoutStage?: 'SF1' | 'SF2' | 'FINAL';
  status: MatchStatus;
  playStatus: PlayStatus;
  totalOvers: number;
  toss?: {
    winnerId: string;
    choice: 'bat' | 'bowl';
  };
  innings1?: InningsState;
  innings2?: InningsState;
  winnerId?: string;
  resultMessage?: string;
}

export interface TournamentData {
  teams: Team[];
  matches: Match[];
}