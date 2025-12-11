import { Team } from './types';

// Helper to generate a unique ID
const uid = () => Math.random().toString(36).substr(2, 9);

const createTeam = (name: string, group: 'A' | 'B'): Team => ({
  id: uid(),
  name,
  group,
  players: Array.from({ length: 11 }).map((_, i) => ({
    id: uid(),
    name: `${name} Player ${i + 1}`,
    teamId: '', // Filled later or ignored for mock
    stats: { runs: 0, balls: 0, wickets: 0, oversBowled: 0, runsConceded: 0, fours: 0, sixes: 0 }
  })),
  stats: {
    played: 0, won: 0, lost: 0, tie: 0, points: 0, nrr: 0,
    totalRunsScored: 0, totalOversFaced: 0, totalRunsConceded: 0, totalOversBowled: 0
  }
});

// Seed Data
export const INITIAL_TEAMS: Team[] = [
  // Group A
  createTeam("Tech Titans", 'A'),
  createTeam("Green Gladiators", 'A'),
  createTeam("Solar Strikers", 'A'),
  createTeam("Wind Warriors", 'A'),
  // Group B
  createTeam("Aqua Avengers", 'B'),
  createTeam("Terra Tigers", 'B'),
  createTeam("Eco Eagles", 'B'),
  createTeam("Bio Blasters", 'B'),
];

export const INITIAL_MATCHES = []; // Start empty, user creates match or auto-generate schedule
