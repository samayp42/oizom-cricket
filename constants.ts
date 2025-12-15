import { Team, KnockoutMatchStage } from './types';

export const INITIAL_TEAMS: Team[] = [];

export const INITIAL_MATCHES = [];

export const KNOCKOUT_POINTS: Record<KnockoutMatchStage, number> = {
    'round_1': 6,
    'semi_final': 8,
    'final': 10
};
