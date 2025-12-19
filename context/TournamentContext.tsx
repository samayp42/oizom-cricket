import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { TournamentData, Match, Team, InningsState, BallEvent, Player, KnockoutMatch, KnockoutMatchStage, KnockoutMatchType, GameType, KnockoutStats } from '../types';
import { INITIAL_TEAMS, KNOCKOUT_POINTS } from '../constants';
import { calculateNRR, addOvers } from '../utils/nrr';
import { generateCommentary } from '../utils/analytics';
import { supabase, isSupabaseEnabled } from '../utils/supabaseClient';

interface TournamentContextType {
  isAdmin: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  teams: Team[];
  matches: Match[];
  activeMatch: Match | null;
  addTeam: (name: string, group: 'A' | 'B') => void;
  deleteTeam: (teamId: string) => void;
  updateTeamGroup: (teamId: string, group: 'A' | 'B') => void;
  addPlayer: (teamId: string, playerName: string, gender: 'M' | 'F') => void;
  deletePlayer: (teamId: string, playerId: string) => void;
  setPlayerRole: (teamId: string, playerId: string, role: 'captain' | 'vice-captain' | 'player') => void;
  setPlayerGender: (teamId: string, playerId: string, gender: 'M' | 'F') => void;
  createMatch: (teamAId: string, teamBId: string, overs: number, knockoutStage?: 'SF1' | 'SF2' | 'FINAL') => void;
  updateMatchToss: (matchId: string, winnerId: string, choice: 'bat' | 'bowl') => void;
  startInnings: (matchId: string, strikerId: string, nonStrikerId: string, bowlerId: string) => void;
  setNextBowler: (matchId: string, bowlerId: string) => void;
  swapStrike: (matchId: string) => void;
  recordBall: (matchId: string, ball: BallEvent, nextBatterId?: string) => void;
  undoLastBall: (matchId: string) => void;
  endMatch: (matchId: string) => void;
  abandonMatch: (matchId: string) => void;
  resetTournament: () => void;
  resetMatchesOnly: () => void;
  generateKnockouts: () => void;
  // Knockout Games
  activeGame: GameType;
  setActiveGame: (game: GameType) => void;
  knockoutMatches: KnockoutMatch[];
  createKnockoutMatch: (gameType: GameType, teamAId: string, teamBId: string, stage: KnockoutMatchStage, matchType: KnockoutMatchType, teamAPlayerIds: string[], teamBPlayerIds: string[]) => void;
  resolveKnockoutMatch: (matchId: string, winnerTeamId: string, resultMessage?: string) => void;
  deleteKnockoutMatch: (matchId: string) => void;
  // YouTube Live Stream
  youtubeStreamUrl: string;
  setYoutubeStreamUrl: (url: string) => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider = ({ children }: PropsWithChildren<{}>) => {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('oizom_admin') === 'true');
  const [activeGame, setActiveGame] = useState<GameType>('cricket');
  const [isSyncing, setIsSyncing] = useState(false);
  const [youtubeStreamUrl, setYoutubeStreamUrlState] = useState<string>('');

  const setYoutubeStreamUrl = (url: string) => {
    setYoutubeStreamUrlState(url);
    localStorage.setItem('oizom_youtube_url', url);

    // Sync to Supabase so all devices see the same stream
    if (isSupabaseEnabled && supabase) {
      supabase.from('settings').upsert({ key: 'youtube_stream_url', value: url }).then(({ error }) => {
        if (error) console.error('Error saving YouTube URL to Supabase:', error);
      });
    }
  };

  // Fetch YouTube URL from Supabase on mount
  useEffect(() => {
    const fetchYoutubeUrl = async () => {
      if (isSupabaseEnabled && supabase) {
        const { data, error } = await supabase.from('settings').select('value').eq('key', 'youtube_stream_url').single();
        if (!error && data?.value) {
          setYoutubeStreamUrlState(data.value);
        } else {
          // Fallback to localStorage
          setYoutubeStreamUrlState(localStorage.getItem('oizom_youtube_url') || '');
        }
      } else {
        setYoutubeStreamUrlState(localStorage.getItem('oizom_youtube_url') || '');
      }
    };
    fetchYoutubeUrl();

    // Subscribe to realtime changes for settings
    if (isSupabaseEnabled && supabase) {
      const channel = supabase.channel('settings-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload: any) => {
          if (payload.new?.key === 'youtube_stream_url') {
            setYoutubeStreamUrlState(payload.new.value || '');
          }
        })
        .subscribe();

      return () => { supabase?.removeChannel(channel); };
    }
  }, []);

  const [data, setData] = useState<TournamentData>(() => {
    const saved = localStorage.getItem('oizom_cricket_data');
    return saved ? JSON.parse(saved) : { teams: INITIAL_TEAMS, matches: [] };
  });

  const [activeMatch, setActiveMatch] = useState<Match | null>(() => {
    if (!data) return null;
    return data.matches.find(m => m.status === 'live' || m.status === 'toss' || m.status === 'innings_break') || null;
  });

  // Flag to skip realtime refetch during local updates
  const [skipRealtimeUntil, setSkipRealtimeUntil] = useState<number>(0);

  const skipRealtimeFor = (ms: number) => {
    setSkipRealtimeUntil(Date.now() + ms);
  };

  // --- SUPABASE SYNC ---
  useEffect(() => {
    if (isSupabaseEnabled) {
      const fetchData = async () => {
        // Skip if we recently made a local change
        if (Date.now() < skipRealtimeUntil) {
          return;
        }

        setIsSyncing(true);
        // 1. Fetch Teams
        const { data: teamsData, error: teamsError } = await supabase!.from('teams').select('*');
        // 2. Fetch Matches
        const { data: matchesData, error: matchesError } = await supabase!.from('matches').select('*');

        if (!teamsError && !matchesError && teamsData && matchesData) {
          // If remote is empty but local has data, push local to remote (initial seed)
          if (teamsData.length === 0 && data.teams.length > 0) {
            console.log("Seeding Supabase from LocalStorage...");
            await supabase!.from('teams').upsert(data.teams);
          } else if (teamsData.length > 0) {
            // Use remote data
            const formattedTeams = teamsData.map(t => ({ ...t, stats: t.stats || {}, players: [] })); // We need players too

            // Fetch Players for all teams
            const { data: playersData } = await supabase!.from('players').select('*');
            if (playersData) {
              playersData.forEach(p => {
                const team = formattedTeams.find(t => t.id === p.team_id);
                if (team) team.players.push({ ...p, stats: p.stats || {} });
              });
            }

            const formattedMatches = matchesData.map(m => ({
              ...m,
              toss: m.toss || undefined,
              innings1: m.innings1 || undefined,
              innings2: m.innings2 || undefined,
              winnerId: m.winner_id,
              teamAId: m.team_a_id,
              teamBId: m.team_b_id,
              totalOvers: parseFloat(m.total_overs),
              groupStage: m.group_stage,
              knockoutStage: m.knockout_stage,
              resultMessage: m.result_message,
              manOfTheMatch: m.man_of_the_match,
              playStatus: m.play_status || 'active',  // Critical: Map play_status to playStatus
              status: m.status || 'scheduled'
            }));

            // 3. Fetch Knockout Matches
            const { data: kMatchesData } = await supabase!.from('knockout_matches').select('*');
            const formattedKMatches = kMatchesData ? kMatchesData.map(m => ({
              id: m.id, gameType: m.game_type as GameType,
              date: m.date, stage: m.stage, matchType: m.match_type,
              teamAId: m.team_a_id, teamBId: m.team_b_id,
              teamAPlayerIds: m.team_a_player_ids, teamBPlayerIds: m.team_b_player_ids,
              winnerTeamId: m.winner_team_id, status: m.status, pointsAwarded: m.points_awarded
            })) : [];

            // Format Teams with Knockout Stats
            const finalTeams = formattedTeams.map(t => ({
              ...t,
              badmintonStats: t.badminton_stats || { played: 0, won: 0, lost: 0, points: 0 },
              tableTennisStats: t.table_tennis_stats || { played: 0, won: 0, lost: 0, points: 0 },
              chessStats: t.chess_stats || { played: 0, won: 0, lost: 0, points: 0 },
              carromStats: t.carrom_stats || { played: 0, won: 0, lost: 0, points: 0 }
            }));

            setData({
              teams: finalTeams.length > 0 ? finalTeams : INITIAL_TEAMS,
              matches: formattedMatches,
              knockoutMatches: formattedKMatches
            });
          }
        }
        setIsSyncing(false);
      };

      fetchData();

      // Realtime Subscription
      const channel = supabase!.channel('public:data')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
          // Skip refetch if we recently made a local change
          if (Date.now() < skipRealtimeUntil) return;
          fetchData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, (payload) => {
          if (Date.now() < skipRealtimeUntil) return;
          fetchData();
        })
        .subscribe();

      return () => {
        supabase!.removeChannel(channel);
      };
    }
  }, []);

  // --- SAVE LOGIC ---
  useEffect(() => {
    // 1. Local Storage
    localStorage.setItem('oizom_cricket_data', JSON.stringify(data));

    // 2. Supabase (Debounced ideally, but direct for now)
    if (isSupabaseEnabled && !isSyncing) {
      // We only push massive updates if we are the admin triggering changes.
      // To avoid loops with realtime, usually we'd check origin.
      // keeping it simple: The logic functions (recordBall etc) should call a 'persist' function.
    }
  }, [data]);

  // Sync state to activeMatch
  useEffect(() => {
    if (activeMatch) {
      const matchInState = data.matches.find(m => m.id === activeMatch.id);
      if (matchInState && JSON.stringify(matchInState) !== JSON.stringify(activeMatch)) {
        setActiveMatch(matchInState);
      }
    }
  }, [data.matches]);

  // Helper to persist data to Supabase
  const persistToSupabase = async (updatedData: TournamentData) => {
    if (!isSupabaseEnabled) return;

    // Upsert Teams (and players logic would go here if modified)
    // For performance, we should only update changed items, but for simplicity:
    // We will rely on specific functions calling persist.
  };

  const login = (pin: string) => {
    if (pin === '0402') {
      setIsAdmin(true);
      sessionStorage.setItem('oizom_admin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('oizom_admin');
  };

  const addTeam = (name: string, group: 'A' | 'B') => {
    const newTeam: Team = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      group,
      players: [],
      stats: { played: 0, won: 0, lost: 0, tie: 0, points: 0, nrr: 0, totalRunsScored: 0, totalOversFaced: 0, totalRunsConceded: 0, totalOversBowled: 0 }
    };
    const newData = { ...data, teams: [...data.teams, newTeam] };
    setData(newData);

    if (isSupabaseEnabled) {
      supabase!.from('teams').insert({
        id: newTeam.id, name: newTeam.name, group: newTeam.group, stats: newTeam.stats
      }).then(({ error }) => {
        if (error) console.error('Error adding team to Supabase:', error);
      });
    }
  };

  const updateTeamGroup = (teamId: string, group: 'A' | 'B') => {
    const updatedTeams = data.teams.map(t =>
      t.id === teamId ? { ...t, group } : t
    );
    setData({ ...data, teams: updatedTeams });

    if (isSupabaseEnabled) {
      supabase!.from('teams').update({ group }).eq('id', teamId).then(({ error }) => {
        if (error) console.error('Error updating team group in Supabase:', error);
      });
    }
  };

  const deleteTeam = (teamId: string) => {
    const newData = {
      ...data,
      teams: data.teams.filter(t => t.id !== teamId)
    };
    setData(newData);

    if (isSupabaseEnabled) {
      supabase!.from('teams').delete().eq('id', teamId).then(({ error }) => {
        if (error) console.error('Error deleting team from Supabase:', error);
      });
    }
  };

  const addPlayer = (teamId: string, playerName: string, gender: 'M' | 'F') => {
    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: playerName,
      teamId,
      role: 'player',
      gender,
      stats: { runs: 0, balls: 0, wickets: 0, oversBowled: 0, runsConceded: 0, fours: 0, sixes: 0 }
    };

    const updatedTeams = data.teams.map(t => {
      if (t.id === teamId) {
        return { ...t, players: [...t.players, newPlayer] };
      }
      return t;
    });

    setData(prev => ({ ...prev, teams: updatedTeams }));

    if (isSupabaseEnabled) {
      supabase!.from('players').insert({
        id: newPlayer.id, team_id: teamId, name: newPlayer.name, role: 'player', gender, stats: newPlayer.stats
      }).then(({ error }) => {
        if (error) console.error('Error adding player to Supabase:', error);
      });
    }
  };

  const setPlayerGender = (teamId: string, playerId: string, gender: 'M' | 'F') => {
    const updatedTeams = data.teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          players: t.players.map(p =>
            p.id === playerId ? { ...p, gender } : p
          )
        };
      }
      return t;
    });

    setData(prev => ({ ...prev, teams: updatedTeams }));

    if (isSupabaseEnabled) {
      supabase!.from('players').update({ gender }).eq('id', playerId).then(({ error }) => {
        if (error) console.error('Error updating player gender in Supabase:', error);
      });
    }
  };

  const deletePlayer = (teamId: string, playerId: string) => {
    const updatedTeams = data.teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          players: t.players.filter(p => p.id !== playerId)
        };
      }
      return t;
    });

    setData(prev => ({ ...prev, teams: updatedTeams }));

    if (isSupabaseEnabled) {
      supabase!.from('players').delete().eq('id', playerId).then(({ error }) => {
        if (error) console.error('Error deleting player from Supabase:', error);
      });
    }
  };

  const setPlayerRole = (teamId: string, playerId: string, role: 'captain' | 'vice-captain' | 'player') => {
    const updatedTeams = data.teams.map(t => {
      if (t.id === teamId) {
        // If setting C or VC, unset previous one in the same team
        let updatedPlayers = t.players;
        if (role !== 'player') {
          updatedPlayers = updatedPlayers.map(p => {
            if (p.role === role) {
              // Side effect for Supabase: Unset old role
              if (isSupabaseEnabled) {
                supabase!.from('players').update({ role: 'player' }).eq('id', p.id).then();
              }
              return { ...p, role: 'player' as const };
            }
            return p;
          });
        }

        // Update target player
        updatedPlayers = updatedPlayers.map(p =>
          p.id === playerId ? { ...p, role } : p
        );

        return { ...t, players: updatedPlayers };
      }
      return t;
    });

    setData(prev => ({ ...prev, teams: updatedTeams }));

    if (isSupabaseEnabled) {
      supabase!.from('players').update({ role }).eq('id', playerId).then(({ error }) => {
        if (error) console.error('Error updating player role in Supabase:', error);
      });
    }
  };

  // Helper Functions needed for Match Logic
  const getTeamName = (id: string, allTeams: Team[]) => allTeams.find(t => t.id === id)?.name || 'Unknown';

  const updateTeamStats = (match: Match) => {
    if (!match.innings2) return;
    const t1 = match.innings1!.battingTeamId;
    const t2 = match.innings2.battingTeamId;
    const team1 = data.teams.find(t => t.id === t1);
    const team2 = data.teams.find(t => t.id === t2);
    if (!team1 || !team2) return;
    team1.stats.played++;
    team2.stats.played++;
    const isGroupStage = match.groupStage;
    const isSemiFinal = match.knockoutStage === 'SF1' || match.knockoutStage === 'SF2';
    const isFinal = match.knockoutStage === 'FINAL';

    if (match.winnerId === t1) {
      team1.stats.won++;
      team2.stats.lost++;

      if (isGroupStage) {
        team1.stats.points += 10;
        // Loser in group stage gets 0
      } else if (isSemiFinal) {
        team1.stats.points += 8;
        team2.stats.points += 3; // Loser gets 3 in SF
      } else if (isFinal) {
        team1.stats.points += 10;
        team2.stats.points += 6; // Runner up gets 6
      }
    } else if (match.winnerId === t2) {
      team2.stats.won++;
      team1.stats.lost++;

      if (isGroupStage) {
        team2.stats.points += 10;
      } else if (isSemiFinal) {
        team2.stats.points += 8;
        team1.stats.points += 3;
      } else if (isFinal) {
        team2.stats.points += 10;
        team1.stats.points += 6;
      }
    } else {
      // Tie / No Result
      team1.stats.tie++;
      team2.stats.tie++;

      if (isGroupStage) {
        team1.stats.points += 5;
        team2.stats.points += 5;
      } else {
        team1.stats.points += 5;
        team2.stats.points += 5;
      }
    }
    team1.stats.totalRunsScored += match.innings1!.totalRuns;
    team2.stats.totalRunsConceded += match.innings1!.totalRuns;
    const t1Overs = match.innings1!.wickets >= 10 ? match.totalOvers : match.innings1!.overs;
    team1.stats.totalOversFaced = addOvers(team1.stats.totalOversFaced, t1Overs);
    team2.stats.totalOversBowled = addOvers(team2.stats.totalOversBowled, t1Overs);
    team2.stats.totalRunsScored += match.innings2.totalRuns;
    team1.stats.totalRunsConceded += match.innings2.totalRuns;
    const t2Overs = match.innings2.wickets >= 10 ? match.totalOvers : match.innings2.overs;
    team2.stats.totalOversFaced = addOvers(team2.stats.totalOversFaced, t2Overs);
    team1.stats.totalOversBowled = addOvers(team1.stats.totalOversBowled, t2Overs);
    team1.stats.nrr = calculateNRR(team1);
    team2.stats.nrr = calculateNRR(team2);
    const newTeams = data.teams.map(t => {
      if (t.id === t1) return team1;
      if (t.id === t2) return team2;
      return t;
    });
    setData(prev => ({ ...prev, teams: newTeams }));

    if (isSupabaseEnabled) {
      supabase!.from('teams').upsert([
        { id: team1.id, name: team1.name, group: team1.group, stats: team1.stats },
        { id: team2.id, name: team2.name, group: team2.group, stats: team2.stats }
      ]).then(({ error }) => {
        if (error) console.error('Error updating team stats in Supabase:', error);
      });
    }
  };

  const endMatchLogic = (match: Match) => {
    match.status = 'completed';
    const score1 = match.innings1!.totalRuns;
    const score2 = match.innings2 ? match.innings2.totalRuns : 0;

    if (match.innings2) {
      if (score1 > score2) {
        match.winnerId = match.innings1!.battingTeamId;
        match.resultMessage = `${getTeamName(match.innings1!.battingTeamId, data.teams)} won by ${score1 - score2} runs`;
      } else if (score2 > score1) {
        match.winnerId = match.innings2.battingTeamId;
        match.resultMessage = `${getTeamName(match.innings2.battingTeamId, data.teams)} won by ${10 - match.innings2.wickets} wickets`;
      } else {
        match.winnerId = undefined;
        match.resultMessage = "Match Tied";
      }
    }

    // ======================================
    // AUTOMATIC MAN OF THE MATCH CALCULATION
    // ======================================
    const calculateMOTM = (): string | undefined => {
      const teamA = data.teams.find(t => t.id === match.teamAId);
      const teamB = data.teams.find(t => t.id === match.teamBId);
      if (!teamA || !teamB) return undefined;

      const allPlayers = [...teamA.players, ...teamB.players];

      // Combine all ball events from both innings
      const allBalls = [
        ...(match.innings1?.history || []),
        ...(match.innings2?.history || [])
      ];

      // Get players who participated (batted or bowled)
      const battingOrder1 = match.innings1?.battingOrder || [];
      const battingOrder2 = match.innings2?.battingOrder || [];
      const participantIds = new Set([
        ...battingOrder1,
        ...battingOrder2,
        ...allBalls.map(b => b.bowlerId)
      ]);
      const participants = allPlayers.filter(p => participantIds.has(p.id));

      if (participants.length === 0) return undefined;

      // Calculate performance score for each player from THIS MATCH's data
      const playerScores = participants.map(player => {
        let score = 0;

        // ========== BATTING PERFORMANCE (from match history) ==========
        const battingBalls = allBalls.filter(b => b.batterId === player.id);
        const runs = battingBalls.reduce((sum, b) => sum + b.runsScored, 0);
        const balls = battingBalls.filter(b => b.extraType !== 'wide').length;
        const fours = battingBalls.filter(b => b.runsScored === 4).length;
        const sixes = battingBalls.filter(b => b.runsScored === 6).length;

        // Base runs score (1 point per run)
        score += runs;

        // Strike rate bonus (if faced at least 6 balls)
        if (balls >= 6) {
          const sr = (runs / balls) * 100;
          if (sr >= 200) score += 15;       // Exceptional SR
          else if (sr >= 150) score += 10;  // Very good SR
          else if (sr >= 120) score += 5;   // Good SR
        }

        // Boundary bonus
        score += fours * 1;   // Extra point per four
        score += sixes * 2;   // Extra 2 points per six

        // Milestone bonus
        if (runs >= 50) score += 10;  // Half century bonus
        if (runs >= 30) score += 5;   // 30+ bonus

        // ========== BOWLING PERFORMANCE (from match history) ==========
        const bowlingBalls = allBalls.filter(b => b.bowlerId === player.id);
        const wickets = bowlingBalls.filter(b => b.isWicket && b.wicketType !== 'run-out').length;
        const validBallsBowled = bowlingBalls.filter(b => b.isValidBall).length;
        const oversBowled = Math.floor(validBallsBowled / 6) + (validBallsBowled % 6) * 0.1;
        const runsConceded = bowlingBalls.reduce((sum, b) => sum + b.runsScored + b.extras, 0);

        // Wickets are heavily weighted (25 points per wicket)
        score += wickets * 25;

        // Multi-wicket bonus
        if (wickets >= 3) score += 15;  // 3-fer bonus
        if (wickets >= 2) score += 5;   // 2 wickets bonus

        // Economy bonus (if bowled at least 1 over)
        if (oversBowled >= 1) {
          const economy = runsConceded / oversBowled;
          if (economy <= 4) score += 15;       // Excellent economy
          else if (economy <= 6) score += 10;  // Good economy
          else if (economy <= 8) score += 5;   // Decent economy
          else if (economy >= 12) score -= 5;  // Expensive penalty
        }

        return { player, score };
      });

      // Sort by score descending and return the top performer
      playerScores.sort((a, b) => b.score - a.score);

      // Debug logging
      console.log('🏆 MOTM Calculation:', playerScores.slice(0, 3).map(p => ({
        name: p.player.name,
        score: p.score
      })));

      return playerScores.length > 0 ? playerScores[0].player.id : undefined;
    };

    // Set the Man of the Match
    match.manOfTheMatch = calculateMOTM();
    console.log('🏆 Man of the Match ID:', match.manOfTheMatch);

    // ======================================
    // BONUS POINTS FOR CRICKET KNOCKOUTS (REGULAR MATCHES)
    // ======================================
    if (match.knockoutStage && match.winnerId) {
      const loserTeamId = match.teamAId === match.winnerId ? match.teamBId : match.teamAId;
      const loserTeam = data.teams.find(t => t.id === loserTeamId);

      if (loserTeam) {
        // Semifinal losers get +3 bonus points
        if (match.knockoutStage === 'SF1' || match.knockoutStage === 'SF2') {
          loserTeam.stats.points += 3;
          console.log(`🏆 Semifinal Bonus: ${loserTeam.name} gets +3 points for reaching semifinals`);
        }

        // Finals runner-up gets +6 bonus points
        if (match.knockoutStage === 'FINAL') {
          loserTeam.stats.points += 6;
          console.log(`🥈 Runner-up Bonus: ${loserTeam.name} gets +6 points for reaching finals`);
        }
      }
    }

    updateTeamStats(match);
  };


  const createMatch = (teamAId: string, teamBId: string, overs: number, knockoutStage?: 'SF1' | 'SF2' | 'FINAL') => {
    const newMatch: Match = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      teamAId,
      teamBId,
      groupStage: true,
      knockoutStage,
      status: 'toss',
      playStatus: 'active',
      totalOvers: overs,
    };
    setData(prev => ({ ...prev, matches: [...prev.matches, newMatch] }));
    setActiveMatch(newMatch);

    if (isSupabaseEnabled) {
      supabase!.from('matches').insert({
        id: newMatch.id,
        date: newMatch.date,
        team_a_id: newMatch.teamAId,
        team_b_id: newMatch.teamBId,
        status: newMatch.status,
        play_status: newMatch.playStatus,
        total_overs: newMatch.totalOvers,
        group_stage: newMatch.groupStage
      }).then(({ error }) => {
        if (error) console.error('Error creating match in Supabase:', error);
      });
    }
  };

  const updateMatchToss = (matchId: string, winnerId: string, choice: 'bat' | 'bowl') => {
    const matchIndex = data.matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    const match = { ...data.matches[matchIndex] };
    match.toss = { winnerId, choice };
    match.status = 'scheduled';
    const updatedMatches = [...data.matches];
    updatedMatches[matchIndex] = match;
    skipRealtimeFor(3000);
    setData({ ...data, matches: updatedMatches });
    setActiveMatch(match);

    if (isSupabaseEnabled) {
      supabase!.from('matches').update({
        toss: match.toss,
        status: match.status
      }).eq('id', matchId).then(({ error }) => {
        if (error) console.error('Error updating match toss in Supabase:', error);
      });
    }
  };

  const startInnings = (matchId: string, strikerId: string, nonStrikerId: string, bowlerId: string) => {
    const matchIndex = data.matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    let match = { ...data.matches[matchIndex] };

    const isFirstInnings = !match.innings1;
    let battingTeamId, bowlingTeamId;

    if (isFirstInnings && match.toss) {
      const isTeamABattingFirst = (match.toss.winnerId === match.teamAId && match.toss.choice === 'bat') ||
        (match.toss.winnerId === match.teamBId && match.toss.choice === 'bowl');
      battingTeamId = isTeamABattingFirst ? match.teamAId : match.teamBId;
      bowlingTeamId = isTeamABattingFirst ? match.teamBId : match.teamAId;
    } else {
      battingTeamId = match.innings1!.bowlingTeamId;
      bowlingTeamId = match.innings1!.battingTeamId;
    }

    const newInnings: InningsState = {
      battingTeamId: battingTeamId!,
      bowlingTeamId: bowlingTeamId!,
      totalRuns: 0,
      wickets: 0,
      overs: 0,
      currentOver: [],
      history: [],
      strikerId,
      nonStrikerId,
      currentBowlerId: bowlerId,
      battingOrder: [strikerId, nonStrikerId],
      playersOut: [],
      isFreeHit: false,
      currentPartnership: {
        batter1Id: strikerId,
        batter2Id: nonStrikerId,
        runs: 0,
        balls: 0
      },
      fow: []
    };

    if (isFirstInnings) {
      match.innings1 = newInnings;
    } else {
      match.innings2 = newInnings;
    }

    match.status = 'live';
    match.playStatus = 'active';

    const updatedMatches = [...data.matches];
    updatedMatches[matchIndex] = match;
    skipRealtimeFor(3000);
    setData({ ...data, matches: updatedMatches });
    setActiveMatch(match);

    if (isSupabaseEnabled) {
      supabase!.from('matches').update({
        innings1: match.innings1,
        innings2: match.innings2,
        status: match.status,
        play_status: match.playStatus
      }).eq('id', matchId).then(({ error }) => {
        if (error) console.error('Error starting innings in Supabase:', error);
      });
    }
  };

  const setNextBowler = (matchId: string, bowlerId: string) => {
    const matchIndex = data.matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    let match = JSON.parse(JSON.stringify(data.matches[matchIndex])) as Match;
    const currentInnings = match.innings2 || match.innings1;
    if (!currentInnings) return;

    currentInnings.currentBowlerId = bowlerId;
    match.playStatus = 'active';

    const updatedMatches = [...data.matches];
    updatedMatches[matchIndex] = match;
    skipRealtimeFor(3000);
    setData({ ...data, matches: updatedMatches });
    setActiveMatch(match);

    if (isSupabaseEnabled) {
      supabase!.from('matches').update({
        innings1: match.innings1,
        innings2: match.innings2,
        play_status: match.playStatus
      }).eq('id', matchId).then(({ error }) => {
        if (error) console.error('Error setting next bowler in Supabase:', error);
      });
    }
  };

  const swapStrike = (matchId: string) => {
    const matchIndex = data.matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    let match = JSON.parse(JSON.stringify(data.matches[matchIndex])) as Match;
    const currentInnings = match.innings2 || match.innings1;
    if (!currentInnings) return;

    // Swap striker and non-striker
    const temp = currentInnings.strikerId;
    currentInnings.strikerId = currentInnings.nonStrikerId;
    currentInnings.nonStrikerId = temp;

    const updatedMatches = [...data.matches];
    updatedMatches[matchIndex] = match;
    skipRealtimeFor(3000);
    setData({ ...data, matches: updatedMatches });
    setActiveMatch(match);

    if (isSupabaseEnabled) {
      supabase!.from('matches').update({
        innings1: match.innings1,
        innings2: match.innings2
      }).eq('id', matchId).then(({ error }) => {
        if (error) console.error('Error swapping strike in Supabase:', error);
      });
    }
  };

  const recordBall = (matchId: string, ball: BallEvent, nextBatterId?: string) => {
    const matchIndex = data.matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;

    let match = JSON.parse(JSON.stringify(data.matches[matchIndex])) as Match;
    const currentInnings = match.innings2 || match.innings1;
    if (!currentInnings) return;

    // --- Generate Commentary ---
    const battingTeam = data.teams.find(t => t.id === currentInnings.battingTeamId);
    const bowlingTeam = data.teams.find(t => t.id === currentInnings.bowlingTeamId);

    // Deep clone players to avoid mutation issues
    const batter = battingTeam?.players.find(p => p.id === ball.batterId);
    const bowler = bowlingTeam?.players.find(p => p.id === ball.bowlerId);
    const batterClone = batter ? JSON.parse(JSON.stringify(batter)) : null;
    const bowlerClone = bowler ? JSON.parse(JSON.stringify(bowler)) : null;

    const wasFreeHit = currentInnings.isFreeHit;
    ball.commentary = generateCommentary(ball, bowlerClone, batterClone, wasFreeHit);

    // --- 1. Update Score & Wickets ---
    currentInnings.totalRuns += ball.runsScored + ball.extras;

    // Partnership Update
    if (!ball.isWicket) {
      if (ball.extraType !== 'wide') {
        currentInnings.currentPartnership.balls += 1;
      }
      currentInnings.currentPartnership.runs += (ball.runsScored + ball.extras);
    }

    if (ball.isWicket) {
      currentInnings.wickets += 1;
      if (ball.wicketPlayerId) {
        currentInnings.playersOut.push(ball.wicketPlayerId);
        currentInnings.fow.push({
          score: currentInnings.totalRuns,
          wicketCount: currentInnings.wickets,
          over: currentInnings.overs,
          batterId: ball.wicketPlayerId
        });
      }
    }

    // --- Update Stats on cloned players ---
    if (batterClone) {
      batterClone.stats.runs += ball.runsScored;
      if (ball.extraType !== 'wide') batterClone.stats.balls++;
      if (ball.runsScored === 4) batterClone.stats.fours++;
      if (ball.runsScored === 6) batterClone.stats.sixes++;
    }
    // Update bowler stats
    if (bowlerClone) {
      bowlerClone.stats.runsConceded += ball.runsScored + ball.extras;
      if (ball.isWicket && ball.wicketType !== 'run-out') {
        bowlerClone.stats.wickets += 1;
      }
    }

    // --- 2. Handle Overs ---
    let overCompleted = false;
    if (ball.isValidBall) {
      const balls = Math.round((currentInnings.overs % 1) * 10);
      ball.ballInOver = balls + 1;
      if (balls === 5) {
        currentInnings.overs = Math.floor(currentInnings.overs) + 1;
        overCompleted = true;
        if (bowlerClone) bowlerClone.stats.oversBowled = Math.floor(bowlerClone.stats.oversBowled) + 1;
      } else {
        currentInnings.overs += 0.1;
        if (bowlerClone) bowlerClone.stats.oversBowled += 0.1;
      }
    } else {
      ball.ballInOver = Math.round((currentInnings.overs % 1) * 10);
    }

    currentInnings.history.push(ball);

    // --- 3. Intelligent Strike Rotation ---
    let shouldSwap = false;
    if (ball.runsScored % 2 !== 0) {
      shouldSwap = true;
    }

    if (shouldSwap) {
      const temp = currentInnings.strikerId;
      currentInnings.strikerId = currentInnings.nonStrikerId;
      currentInnings.nonStrikerId = temp;
    }

    // Wicket Logic (New Batter)
    if (ball.isWicket && nextBatterId) {
      if (ball.wicketPlayerId === currentInnings.strikerId) {
        currentInnings.strikerId = nextBatterId;
      } else {
        currentInnings.nonStrikerId = nextBatterId;
      }
      currentInnings.battingOrder.push(nextBatterId);

      // Reset Partnership
      currentInnings.currentPartnership = {
        batter1Id: currentInnings.strikerId,
        batter2Id: currentInnings.nonStrikerId,
        runs: 0,
        balls: 0
      };
    }

    // Over Completion Logic (Swap Ends + Ask for Bowler)
    if (overCompleted) {
      const temp = currentInnings.strikerId;
      currentInnings.strikerId = currentInnings.nonStrikerId;
      currentInnings.nonStrikerId = temp;
      match.playStatus = 'waiting_for_bowler';
    }

    // --- 4. Free Hit Logic ---
    if (ball.extraType === 'no-ball') {
      currentInnings.isFreeHit = true;
    } else if (currentInnings.isFreeHit && ball.isValidBall) {
      currentInnings.isFreeHit = false;
    }

    // --- 5. Check Innings/Match End ---
    const isAllOut = currentInnings.wickets >= 10;
    const isOversDone = currentInnings.overs >= match.totalOvers;

    // Check if target is chased (2nd innings only)
    const isTargetReached = match.innings2 && match.innings1 &&
      match.innings2.totalRuns > match.innings1.totalRuns;

    if (isAllOut || isOversDone || isTargetReached) {
      if (!match.innings2 && !match.winnerId) {
        // First innings ended - go to innings break
        match.status = 'innings_break';
        match.playStatus = 'active';
      } else {
        // Second innings OR target reached - end match
        endMatchLogic(match);
      }
    }

    const updatedMatches = [...data.matches];
    updatedMatches[matchIndex] = match;

    // Also update team stats in state
    const updatedTeams = data.teams.map(team => {
      if (team.id === battingTeam?.id) {
        return {
          ...team,
          players: team.players.map(p => {
            if (p.id === batterClone?.id) return batterClone;
            return p;
          })
        };
      }
      if (team.id === bowlingTeam?.id) {
        return {
          ...team,
          players: team.players.map(p => {
            if (p.id === bowlerClone?.id) return bowlerClone;
            return p;
          })
        };
      }
      return team;
    });

    // Skip realtime refetch for 3 seconds to prevent overwriting local changes
    skipRealtimeFor(3000);

    setData({ ...data, matches: updatedMatches, teams: updatedTeams });
    setActiveMatch(match);

    if (isSupabaseEnabled) {
      supabase!.from('matches').update({
        innings1: match.innings1,
        innings2: match.innings2,
        status: match.status,
        play_status: match.playStatus,
        winner_id: match.winnerId,
        result_message: match.resultMessage,
        man_of_the_match: match.manOfTheMatch
      }).eq('id', matchId).then(({ error }) => {
        if (error) console.error('Error updating match score in Supabase:', error);
      });

      if (batterClone) {
        supabase!.from('players').update({ stats: batterClone.stats }).eq('id', batterClone.id).then(({ error }) => {
          if (error) console.error('Error updating batter stats:', error);
        });
      }
      if (bowlerClone) {
        supabase!.from('players').update({ stats: bowlerClone.stats }).eq('id', bowlerClone.id).then(({ error }) => {
          if (error) console.error('Error updating bowler stats:', error);
        });
      }
    }
  };

  const undoLastBall = (matchId: string) => {
    const matchIndex = data.matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    let match = JSON.parse(JSON.stringify(data.matches[matchIndex])) as Match;
    const inning = match.innings2 || match.innings1;
    if (!inning || inning.history.length === 0) return;

    const lastBall = inning.history.pop()!;

    // --- 1. Reverse Runs ---
    inning.totalRuns -= (lastBall.runsScored + lastBall.extras);

    // --- 2. Reverse Wicket ---
    if (lastBall.isWicket && lastBall.wicketPlayerId) {
      inning.wickets--;

      // Remove from playersOut
      inning.playersOut = inning.playersOut.filter(id => id !== lastBall.wicketPlayerId);

      // Remove last FOW entry
      if (inning.fow.length > 0) {
        inning.fow.pop();
      }

      // Restore the dismissed batter (they were replaced by the new batter)
      // The current striker/non-striker who was added after wicket needs to be removed
      const lastBatterAdded = inning.battingOrder[inning.battingOrder.length - 1];

      if (lastBatterAdded && lastBatterAdded !== lastBall.wicketPlayerId) {
        // Remove the new batter from batting order
        inning.battingOrder.pop();

        // Restore dismissed player to their position
        if (inning.strikerId === lastBatterAdded) {
          inning.strikerId = lastBall.wicketPlayerId;
        } else if (inning.nonStrikerId === lastBatterAdded) {
          inning.nonStrikerId = lastBall.wicketPlayerId;
        }
      }
    }

    // --- 3. Reverse Free Hit ---
    if (lastBall.extraType === 'no-ball') {
      inning.isFreeHit = false;
    }

    // --- 4. Reverse Overs ---
    if (lastBall.isValidBall) {
      const ballPart = Math.round((inning.overs % 1) * 10);
      if (ballPart === 0) {
        // Was at start of new over (e.g., 3.0) -> go back to 2.5
        inning.overs = Math.floor(inning.overs) - 1 + 0.5;
        // Also need to reset waiting_for_bowler status and potentially restore previous bowler
        match.playStatus = 'active';
      } else {
        inning.overs = parseFloat((inning.overs - 0.1).toFixed(1));
      }
    }

    // --- 5. Reverse Strike Rotation ---
    // If odd runs were scored, strike was swapped - reverse it
    if (lastBall.runsScored % 2 !== 0) {
      const temp = inning.strikerId;
      inning.strikerId = inning.nonStrikerId;
      inning.nonStrikerId = temp;
    }

    // --- 6. Restore match status if needed ---
    if (match.status === 'completed') {
      match.status = 'live';
      match.winnerId = undefined;
      match.resultMessage = undefined;
    }
    if (match.status === 'innings_break' && match.innings1 && !match.innings2) {
      match.status = 'live';
    }

    const updatedMatches = [...data.matches];
    updatedMatches[matchIndex] = match;
    skipRealtimeFor(3000);
    setData({ ...data, matches: updatedMatches });
    setActiveMatch(match);

    if (isSupabaseEnabled) {
      supabase!.from('matches').update({
        innings1: match.innings1,
        innings2: match.innings2,
        status: match.status,
        play_status: match.playStatus,
        winner_id: match.winnerId,
        result_message: match.resultMessage
      }).eq('id', matchId).then(({ error }) => {
        if (error) console.error('Error undoing last ball in Supabase:', error);
      });
    }
  };

  const endMatch = (matchId: string) => {
    const matchIndex = data.matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    let match = JSON.parse(JSON.stringify(data.matches[matchIndex])) as Match;
    endMatchLogic(match);
    const updatedMatches = [...data.matches];
    updatedMatches[matchIndex] = match;
    setData({ ...data, matches: updatedMatches });
    setActiveMatch(null);

    if (isSupabaseEnabled) {
      supabase!.from('matches').update({
        status: match.status,
        winner_id: match.winnerId,
        result_message: match.resultMessage,
        man_of_the_match: match.manOfTheMatch
      }).eq('id', matchId).then(({ error }) => {
        if (error) console.error('Error ending match in Supabase:', error);
      });
    }
  };

  const abandonMatch = (matchId: string) => {
    const matchIndex = data.matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    let match = JSON.parse(JSON.stringify(data.matches[matchIndex])) as Match;

    // Set status to abandoned
    match.status = 'abandoned';
    match.resultMessage = "Match Abandoned - No Result";
    match.winnerId = undefined;

    // Distribute 5 points to each team (Cricket Group Stage Logic mainly)
    const t1 = match.teamAId;
    const t2 = match.teamBId;
    const team1 = data.teams.find(t => t.id === t1);
    const team2 = data.teams.find(t => t.id === t2);

    let updatedTeams = [...data.teams];

    if (team1 && team2) {
      // We only add points, doesn't count as tied match for NRR purpose usually but stats structure has Tie.
      // User said "if no result then both team gets 5 points".
      // Let's increment 'tie' just to show it was a no-result/tie game in stats columns if desirable,
      // OR we can just add points. Given the Points Table logic uses stats.won/lost/tie/points,
      // and 'tie' usually gives 1 point in old logic, but here it gives 5.
      // Ideally we should track 'no_result' separately but 'tie' bucket works if we are consistent.

      team1.stats.tie++;
      team2.stats.tie++;

      team1.stats.points += 5;
      team2.stats.points += 5;

      updatedTeams = data.teams.map(t => {
        if (t.id === t1) return team1;
        if (t.id === t2) return team2;
        return t;
      });
    }

    const updatedMatches = [...data.matches];
    updatedMatches[matchIndex] = match;

    setData({ ...data, matches: updatedMatches, teams: updatedTeams });
    setActiveMatch(null);

    if (isSupabaseEnabled) {
      supabase!.from('matches').update({
        status: 'abandoned',
        result_message: match.resultMessage,
        winner_id: null
      }).eq('id', matchId).then();

      if (team1 && team2) {
        supabase!.from('teams').upsert([
          { id: team1.id, name: team1.name, group: team1.group, stats: team1.stats },
          { id: team2.id, name: team2.name, group: team2.group, stats: team2.stats }
        ]).then();
      }
    }
  };

  const resetTournament = async () => {
    if (!confirm('Are you sure you want to reset the entire tournament? This will delete all teams, players, and matches. This action cannot be undone.')) {
      return;
    }

    // Clear Supabase data
    if (isSupabaseEnabled) {
      try {
        // Delete in order due to foreign key constraints: players -> teams, matches
        await supabase!.from('players').delete().neq('id', ''); // Delete all
        await supabase!.from('matches').delete().neq('id', ''); // Delete all
        await supabase!.from('teams').delete().neq('id', ''); // Delete all
      } catch (error) {
        console.error('Error clearing Supabase data:', error);
      }
    }

    localStorage.removeItem('oizom_cricket_data');
    window.location.reload();
  };

  const resetMatchesOnly = async () => {
    if (!confirm('Reset CRICKET matches and cricket player stats only? Knockout games (Badminton, TT, Chess, Carrom) will be kept.')) {
      return;
    }

    // Reset ONLY cricket stats - keep knockout game stats
    const resetTeams = data.teams.map(team => ({
      ...team,
      // Reset only cricket stats
      stats: {
        played: 0, won: 0, lost: 0, tie: 0, points: 0, nrr: 0,
        totalRunsScored: 0, totalOversFaced: 0, totalRunsConceded: 0, totalOversBowled: 0
      },
      // KEEP knockout stats as-is
      badmintonStats: team.badmintonStats,
      tableTennisStats: team.tableTennisStats,
      chessStats: team.chessStats,
      carromStats: team.carromStats,
      // Reset only cricket player stats (runs, balls, wickets)
      players: team.players.map(p => ({
        ...p,
        stats: { runs: 0, balls: 0, wickets: 0, oversBowled: 0, runsConceded: 0, fours: 0, sixes: 0 }
      }))
    }));

    // Keep knockout matches, only clear cricket matches
    const newData = {
      ...data,
      teams: resetTeams,
      matches: [],  // Clear cricket matches
      knockoutMatches: data.knockoutMatches || []  // KEEP knockout matches!
    };

    // Skip realtime refetch to prevent overwriting
    skipRealtimeFor(5000);

    // Update state
    setData(newData);
    setActiveMatch(null);

    // Explicitly save to localStorage
    localStorage.setItem('oizom_cricket_data', JSON.stringify(newData));

    // Clear ONLY cricket matches from Supabase - NOT knockout matches
    if (isSupabaseEnabled) {
      try {
        await supabase!.from('matches').delete().neq('id', '');
        // DO NOT delete knockout_matches!

        // Reset only cricket team stats in Supabase
        for (const team of resetTeams) {
          await supabase!.from('teams').update({
            stats: team.stats
            // DO NOT update knockout stats
          }).eq('id', team.id);

          for (const player of team.players) {
            await supabase!.from('players').update({ stats: player.stats }).eq('id', player.id);
          }
        }
      } catch (error) {
        console.error('Error resetting Supabase data:', error);
      }
    }

    // Force refresh to ensure UI updates
    window.location.reload();
  };

  const generateKnockouts = () => {
    // Sort groups
    const groupA = data.teams.filter(t => t.group === 'A').sort((a, b) => b.stats.points - a.stats.points || b.stats.nrr - a.stats.nrr);
    const groupB = data.teams.filter(t => t.group === 'B').sort((a, b) => b.stats.points - a.stats.points || b.stats.nrr - a.stats.nrr);

    if (groupA.length < 2 || groupB.length < 2) {
      alert("Not enough teams in groups to generate knockouts.");
      return;
    }

    // Apply Qualification Bonus (5 pts)
    const qualifiedTeams = [groupA[0], groupA[1], groupB[0], groupB[1]];
    const updatedTeams = data.teams.map(t => {
      if (qualifiedTeams.find(qt => qt.id === t.id)) {
        const newStats = { ...t.stats, points: t.stats.points + 5 };
        return { ...t, stats: newStats };
      }
      return t;
    });

    // Update teams with bonus points in state first (so SF generation sees updated state if needed, though usually SF matchups use IDs)
    // We update state at end, but better to prepare match generation with IDs.

    const sf1: Match = {
      id: 'sf1', date: new Date().toISOString(),
      teamAId: groupA[0].id, teamBId: groupB[1].id,
      groupStage: false, knockoutStage: 'SF1', status: 'scheduled', playStatus: 'active', totalOvers: 10,
    };
    const sf2: Match = {
      id: 'sf2', date: new Date().toISOString(),
      teamAId: groupB[0].id, teamBId: groupA[1].id,
      groupStage: false, knockoutStage: 'SF2', status: 'scheduled', playStatus: 'active', totalOvers: 10,
    };

    setData({ ...data, teams: updatedTeams, matches: [...data.matches, sf1, sf2] });

    if (isSupabaseEnabled) {
      // Update Bonus Points in DB
      qualifiedTeams.forEach(t => {
        supabase!.from('teams').update({ stats: { ...t.stats, points: t.stats.points + 5 } }).eq('id', t.id).then();
      });

      supabase!.from('matches').insert([
        { id: sf1.id, team_a_id: sf1.teamAId, team_b_id: sf1.teamBId, total_overs: 10, knockout_stage: 'SF1', status: 'scheduled', group_stage: false },
        { id: sf2.id, team_a_id: sf2.teamAId, team_b_id: sf2.teamBId, total_overs: 10, knockout_stage: 'SF2', status: 'scheduled', group_stage: false }
      ]).then(({ error }) => {
        if (error) console.error('Error generating knockouts in Supabase:', error);
      });
    }
  };

  const createKnockoutMatch = (gameType: GameType, teamAId: string, teamBId: string, stage: KnockoutMatchStage, matchType: KnockoutMatchType, teamAPlayerIds: string[], teamBPlayerIds: string[]) => {
    const newMatch: KnockoutMatch = {
      id: Math.random().toString(36).substr(2, 9),
      gameType,
      date: new Date().toISOString(),
      stage,
      matchType,
      teamAId,
      teamBId,
      teamAPlayerIds,
      teamBPlayerIds,
      status: 'scheduled',
      pointsAwarded: KNOCKOUT_POINTS[stage]
    };

    const newData = { ...data, knockoutMatches: [...(data.knockoutMatches || []), newMatch] };
    setData(newData);

    if (isSupabaseEnabled) {
      supabase!.from('knockout_matches').insert({
        id: newMatch.id,
        game_type: newMatch.gameType,
        stage: newMatch.stage,
        match_type: newMatch.matchType,
        team_a_id: newMatch.teamAId,
        team_b_id: newMatch.teamBId,
        team_a_player_ids: newMatch.teamAPlayerIds,
        team_b_player_ids: newMatch.teamBPlayerIds,
        points_awarded: newMatch.pointsAwarded,
        status: newMatch.status
      }).then(({ error }) => { if (error) console.error('Supabase error:', error); });
    }
  };

  const resolveKnockoutMatch = (matchId: string, winnerTeamId: string, resultMessage?: string) => {
    const matches = data.knockoutMatches || [];
    const matchIndex = matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;

    const match = { ...matches[matchIndex] };
    match.winnerTeamId = winnerTeamId;
    match.status = 'completed';
    if (resultMessage) {
      (match as any).resultMessage = resultMessage;
    }

    const winnerTeam = data.teams.find(t => t.id === winnerTeamId);
    const loserTeamId = match.teamAId === winnerTeamId ? match.teamBId : match.teamAId;
    const loserTeam = data.teams.find(t => t.id === loserTeamId);

    if (winnerTeam && loserTeam) {
      // Helper to update stats based on game type
      const updateStats = (team: Team, isWinner: boolean) => {
        let stats: KnockoutStats | undefined;
        if (match.gameType === 'badminton') stats = team.badmintonStats;
        else if (match.gameType === 'table_tennis') stats = team.tableTennisStats;
        else if (match.gameType === 'chess') stats = team.chessStats;
        else if (match.gameType === 'carrom') stats = team.carromStats;

        if (!stats) stats = { played: 0, won: 0, lost: 0, points: 0 };

        stats.played++;
        if (isWinner) {
          stats.won++;
          stats.points += match.pointsAwarded;
        } else {
          stats.lost++;
        }

        // Assign back
        if (match.gameType === 'badminton') team.badmintonStats = stats;
        else if (match.gameType === 'table_tennis') team.tableTennisStats = stats;
        else if (match.gameType === 'chess') team.chessStats = stats;
        else if (match.gameType === 'carrom') team.carromStats = stats;
      };

      updateStats(winnerTeam, true);
      updateStats(loserTeam, false);

      // ============================================
      // BONUS POINTS FOR KNOCKOUTS (MAIN LEADERBOARD)
      // ============================================
      // These points are added to the main stats.points

      if (match.stage === 'semi_final') {
        // Semifinal losers get bonus points (multiplied)
        if (match.gameType === 'cricket') {
          loserTeam.stats.points += 3; // x3 base = 1 * 3
        } else if (match.gameType === 'badminton' || match.gameType === 'table_tennis') {
          loserTeam.stats.points += 6; // x2 base = 3 * 2
        } else if (match.gameType === 'chess' || match.gameType === 'carrom') {
          loserTeam.stats.points += 3; // x1 base = 3 * 1
        }
        console.log(`🏆 Semifinal Bonus: ${loserTeam.name} gets bonus points (${match.gameType})`);
      }

      if (match.stage === 'final') {
        // Finals runner-up gets bonus points (multiplied)
        if (match.gameType === 'cricket') {
          loserTeam.stats.points += 6; // x3 base = 2 * 3
        } else if (match.gameType === 'badminton' || match.gameType === 'table_tennis') {
          loserTeam.stats.points += 12; // x2 base = 6 * 2
        } else if (match.gameType === 'chess' || match.gameType === 'carrom') {
          loserTeam.stats.points += 6; // x1 base = 6 * 1
        }
        console.log(`🥈 Runner-up Bonus: ${loserTeam.name} gets bonus points (${match.gameType})`);
      }
    }

    const updatedMatches = [...matches];
    updatedMatches[matchIndex] = match;

    const updatedTeams = data.teams.map(t => {
      if (t.id === winnerTeamId) return winnerTeam!;
      if (t.id === loserTeamId) return loserTeam!;
      return t;
    });

    setData({ ...data, teams: updatedTeams, knockoutMatches: updatedMatches });

    if (isSupabaseEnabled) {
      supabase!.from('knockout_matches').update({
        winner_team_id: winnerTeamId,
        status: 'completed',
        result_message: resultMessage || null
      }).eq('id', matchId).then();

      // Update specific stats column in Supabase
      if (winnerTeam) {
        let updateObj: any = {};
        if (match.gameType === 'cricket') updateObj = { stats: winnerTeam.stats };
        if (match.gameType === 'badminton') updateObj = { badminton_stats: winnerTeam.badmintonStats };
        if (match.gameType === 'table_tennis') updateObj = { table_tennis_stats: winnerTeam.tableTennisStats };
        if (match.gameType === 'chess') updateObj = { chess_stats: winnerTeam.chessStats };
        if (match.gameType === 'carrom') updateObj = { carrom_stats: winnerTeam.carromStats };
        supabase!.from('teams').update(updateObj).eq('id', winnerTeamId).then();
      }
      if (loserTeam) {
        let updateObj: any = {};
        if (match.gameType === 'cricket') updateObj = { stats: loserTeam.stats };
        if (match.gameType === 'badminton') updateObj = { badminton_stats: loserTeam.badmintonStats };
        if (match.gameType === 'table_tennis') updateObj = { table_tennis_stats: loserTeam.tableTennisStats };
        if (match.gameType === 'chess') updateObj = { chess_stats: loserTeam.chessStats };
        if (match.gameType === 'carrom') updateObj = { carrom_stats: loserTeam.carromStats };
        supabase!.from('teams').update(updateObj).eq('id', loserTeamId).then();
      }

      // Auto-backup to protected table after each match resolution
      supabase!.from('data_backups').insert({
        backup_type: 'knockout_match_resolved',
        data: {
          match: match,
          teams: updatedTeams,
          all_matches: updatedMatches,
          timestamp: new Date().toISOString()
        },
        description: `Match resolved: ${winnerTeam?.name || 'Unknown'} won (${match.gameType})`
      }).then(({ error }) => {
        if (error) console.error('Backup failed:', error);
        else console.log('Match backed up to protected table');
      });
    }
  };

  const deleteKnockoutMatch = (matchId: string) => {
    console.log('Deleting match:', matchId);

    // Skip realtime for longer to prevent stale data overwriting local changes
    skipRealtimeFor(10000);

    const updatedMatches = (data.knockoutMatches || []).filter(m => m.id !== matchId);
    setData({ ...data, knockoutMatches: updatedMatches });

    // Also save to localStorage immediately
    const newData = { ...data, knockoutMatches: updatedMatches };
    localStorage.setItem('oizom_cricket_data', JSON.stringify(newData));

    if (isSupabaseEnabled && supabase) {
      console.log('Deleting from Supabase...');
      supabase.from('knockout_matches').delete().eq('id', matchId).then(({ error, data: result }) => {
        if (error) {
          console.error('Supabase delete error:', error);
          alert('Failed to delete from database: ' + error.message);
        } else {
          console.log('Supabase delete success:', result);
        }
      });
    }
  };

  return (
    <TournamentContext.Provider value={{
      isAdmin, login, logout,
      teams: data.teams, matches: data.matches, activeMatch,
      addTeam, deleteTeam, addPlayer, deletePlayer, updateTeamGroup, setPlayerRole, setPlayerGender, createMatch, updateMatchToss, startInnings, setNextBowler, swapStrike,
      recordBall, undoLastBall, endMatch, abandonMatch, resetTournament, resetMatchesOnly, generateKnockouts,
      // Knockout
      activeGame, setActiveGame, knockoutMatches: data.knockoutMatches || [], createKnockoutMatch, resolveKnockoutMatch, deleteKnockoutMatch,
      // YouTube
      youtubeStreamUrl, setYoutubeStreamUrl
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};