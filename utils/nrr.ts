import { Team } from '../types';

/**
 * Calculates NRR for a team.
 * Formula: (Runs Scored / Overs Faced) - (Runs Conceded / Overs Bowled)
 */
export const calculateNRR = (team: Team): number => {
  if (team.stats.totalOversFaced === 0 || team.stats.totalOversBowled === 0) return 0;

  const runsPerOverFor = team.stats.totalRunsScored / team.stats.totalOversFaced;
  const runsPerOverAgainst = team.stats.totalRunsConceded / team.stats.totalOversBowled;

  return parseFloat((runsPerOverFor - runsPerOverAgainst).toFixed(3));
};

export const formatOvers = (overs: number): string => {
  const whole = Math.floor(overs);
  const part = Math.round((overs - whole) * 10);
  return `${whole}.${part}`;
};

// Add two over values (e.g. 10.4 + 0.3 = 11.1)
export const addOvers = (o1: number, o2: number): number => {
  const balls1 = Math.floor(o1) * 6 + Math.round((o1 % 1) * 10);
  const balls2 = Math.floor(o2) * 6 + Math.round((o2 % 1) * 10);
  const totalBalls = balls1 + balls2;
  return Math.floor(totalBalls / 6) + (totalBalls % 6) / 10;
};
