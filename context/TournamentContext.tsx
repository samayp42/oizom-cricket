import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { TournamentData, Match, Team, InningsState, BallEvent, Player } from '../types';
import { INITIAL_TEAMS } from '../constants';
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
  createMatch: (teamAId: string, teamBId: string, overs: number) => void;
  updateMatchToss: (matchId: string, winnerId: string, choice: 'bat' | 'bowl') => void;
  startInnings: (matchId: string, strikerId: string, nonStrikerId: string, bowlerId: string) => void;
  setNextBowler: (matchId: string, bowlerId: string) => void;
  recordBall: (matchId: string, ball: BallEvent, nextBatterId?: string) => void;
  undoLastBall: (matchId: string) => void;
  endMatch: (matchId: string) => void;
  resetTournament: () => void;
  generateKnockouts: () => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider = ({ children }: PropsWithChildren<{}>) => {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('oizom_admin') === 'true');
  const [isSyncing, setIsSyncing] = useState(false);

  const [data, setData] = useState<TournamentData>(() => {
    const saved = localStorage.getItem('oizom_cricket_data');
    return saved ? JSON.parse(saved) : { teams: INITIAL_TEAMS, matches: [] };
  });

  const [activeMatch, setActiveMatch] = useState<Match | null>(() => {
    if (!data) return null;
    return data.matches.find(m => m.status === 'live' || m.status === 'toss' || m.status === 'innings_break') || null;
  });

  // --- SUPABASE SYNC ---
  useEffect(() => {
    if (isSupabaseEnabled) {
      const fetchData = async () => {
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
              resultMessage: m.result_message
            }));

            setData({
              teams: formattedTeams.length > 0 ? formattedTeams : INITIAL_TEAMS,
              matches: formattedMatches
            });
          }
        }
        setIsSyncing(false);
      };

      fetchData();

      // Realtime Subscription
      const channel = supabase!.channel('public:data')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
          // Simple approach: re-fetch or apply delta. Re-fetching is safer for now.
          fetchData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, (payload) => {
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
    if (pin === '4932') {
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
      }).then();
    }
  };

  const updateTeamGroup = (teamId: string, group: 'A' | 'B') => {
    const teamIndex = data.teams.findIndex(t => t.id === teamId);
    if (teamIndex === -1) return;

    const updatedTeams = [...data.teams];
    updatedTeams[teamIndex] = { ...updatedTeams[teamIndex], group };

    setData({ ...data, teams: updatedTeams });

    if (isSupabaseEnabled) {
      supabase!.from('teams').update({ group }).eq('id', teamId).then();
    }
  };

  const deleteTeam = (teamId: string) => {
    const newData = {
      ...data,
      teams: data.teams.filter(t => t.id !== teamId)
    };
    setData(newData);

    if (isSupabaseEnabled) {
      supabase!.from('teams').delete().eq('id', teamId).then();
    }
  };

  const addPlayer = (teamId: string, playerName: string, gender: 'M' | 'F') => {
    const teamIdx = data.teams.findIndex(t => t.id === teamId);
    if (teamIdx === -1) return;

    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: playerName,
      teamId,
      role: 'player',
      gender,
      stats: { runs: 0, balls: 0, wickets: 0, oversBowled: 0, runsConceded: 0, fours: 0, sixes: 0 }
    };

    const updatedTeams = [...data.teams];
    updatedTeams[teamIdx].players.push(newPlayer);
    setData(prev => ({ ...prev, teams: updatedTeams }));

    if (isSupabaseEnabled) {
      supabase!.from('players').insert({
        id: newPlayer.id, team_id: teamId, name: newPlayer.name, role: 'player', gender, stats: newPlayer.stats
      }).then();
    }
  };

  const setPlayerGender = (teamId: string, playerId: string, gender: 'M' | 'F') => {
    const teamIndex = data.teams.findIndex(t => t.id === teamId);
    if (teamIndex === -1) return;

    const updatedTeams = [...data.teams];
    const player = updatedTeams[teamIndex].players.find(p => p.id === playerId);

    if (player) {
      player.gender = gender;
      if (isSupabaseEnabled) {
        supabase!.from('players').update({ gender }).eq('id', playerId).then();
      }
    }
    setData(prev => ({ ...prev, teams: updatedTeams }));
  };

  const deletePlayer = (teamId: string, playerId: string) => {
    const teamIdx = data.teams.findIndex(t => t.id === teamId);
    if (teamIdx === -1) return;

    const updatedTeams = [...data.teams];
    updatedTeams[teamIdx].players = updatedTeams[teamIdx].players.filter(p => p.id !== playerId);
    setData(prev => ({ ...prev, teams: updatedTeams }));

    if (isSupabaseEnabled) {
      supabase!.from('players').delete().eq('id', playerId).then();
    }
  };

  const setPlayerRole = (teamId: string, playerId: string, role: 'captain' | 'vice-captain' | 'player') => {
    const teamIndex = data.teams.findIndex(t => t.id === teamId);
    if (teamIndex === -1) return;

    const updatedTeams = [...data.teams];
    const team = updatedTeams[teamIndex];

    // If setting C or VC, unset previous one
    if (role !== 'player') {
      const existingRolePlayer = team.players.find(p => p.role === role);
      if (existingRolePlayer) {
        existingRolePlayer.role = 'player';
        if (isSupabaseEnabled) {
          supabase!.from('players').update({ role: 'player' }).eq('id', existingRolePlayer.id).then();
        }
      }
    }

    const player = team.players.find(p => p.id === playerId);
    if (player) {
      player.role = role;
      if (isSupabaseEnabled) {
        supabase!.from('players').update({ role }).eq('id', playerId).then();
      }
    }

    setData(prev => ({ ...prev, teams: updatedTeams }));
  };

  const createMatch = (teamAId: string, teamBId: string, overs: number) => {
    const newMatch: Match = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      teamAId,
      teamBId,
      groupStage: true,
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
      }).then();
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
    setData({ ...data, matches: updatedMatches });
    setActiveMatch(match);

    if (isSupabaseEnabled) {
      supabase!.from('matches').update({
        toss: match.toss,
        status: match.status
      }).eq('id', matchId).then();
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
    setData({ ...data, matches: updatedMatches });
    setActiveMatch(match);

    if (isSupabaseEnabled) {
      supabase!.from('matches').update({
        innings1: match.innings1,
        innings2: match.innings2,
        status: match.status,
        play_status: match.playStatus
      }).eq('id', matchId).then();
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
    setData({ ...data, matches: updatedMatches });
    setActiveMatch(match);

    if (isSupabaseEnabled) {
      supabase!.from('matches').update({
        innings1: match.innings1,
        innings2: match.innings2,
        play_status: match.playStatus
      }).eq('id', matchId).then();
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
    const batter = battingTeam?.players.find(p => p.id === ball.batterId);
    const bowler = bowlingTeam?.players.find(p => p.id === ball.bowlerId);

    const wasFreeHit = currentInnings.isFreeHit;
    ball.commentary = generateCommentary(ball, bowler, batter, wasFreeHit);

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

    // --- Update Stats Inline (Super Simplified) ---
    if (batter) {
      batter.stats.runs += ball.runsScored;
      if (ball.extraType !== 'wide') batter.stats.balls++;
      if (ball.runsScored === 4) batter.stats.fours++;
      if (ball.runsScored === 6) batter.stats.sixes++;
    }
    if (bowler) {
      if (ball.extraType !== 'no-ball' && ball.extraType !== 'wide') {
        // Simplified overs calculation for stats
      }
      bowler.stats.runsConceded += (ball.runsScored + (ball.extraType === 'wide' || ball.extraType === 'no-ball' ? 1 : 0));
      if (ball.isWicket && ball.wicketType !== 'run-out') bowler.stats.wickets++;
    }

    // --- 2. Handle Overs ---
    let overCompleted = false;
    if (ball.isValidBall) {
      const balls = Math.round((currentInnings.overs % 1) * 10);
      ball.ballInOver = balls + 1;
      if (balls === 5) {
        currentInnings.overs = Math.floor(currentInnings.overs) + 1;
        overCompleted = true;
        // Update Bowler Overs
        if (bowler) bowler.stats.oversBowled += 1;
      } else {
        currentInnings.overs += 0.1;
      }
    } else {
      ball.ballInOver = Math.round((currentInnings.overs % 1) * 10);
    }

    currentInnings.history.push(ball);

    // --- 3. Intelligent Strike Rotation ---
    let shouldSwap = false;
    if (ball.runsScored % 2 !== 0) {
      shouldSwap = !shouldSwap;
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

    // Over Completion Logic (Swap Ends)
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

    if (isAllOut || isOversDone) {
      if (!match.innings2 && !match.winnerId) {
        match.status = 'innings_break';
        match.playStatus = 'active';
      } else {
        endMatchLogic(match);
      }
    }

    const updatedMatches = [...data.matches];
    updatedMatches[matchIndex] = match;
    setData({ ...data, matches: updatedMatches });
    setActiveMatch(match);

    if (isSupabaseEnabled) {
      // Update Match (Innings)
      supabase!.from('matches').update({
        innings1: match.innings1,
        innings2: match.innings2,
        status: match.status,
        play_status: match.playStatus,
        winner_id: match.winnerId,
        result_message: match.resultMessage
      }).eq('id', matchId).then();

      // Update Stats (Teams/Players)
      if (batter) {
        supabase!.from('players').update({ stats: batter.stats }).eq('id', batter.id).then();
      }
      if (bowler) {
        supabase!.from('players').update({ stats: bowler.stats }).eq('id', bowler.id).then();
      }
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
    updateTeamStats(match);
  };

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
    if (match.winnerId === t1) {
      team1.stats.won++;
      team1.stats.points += 2;
      team2.stats.lost++;
    } else if (match.winnerId === t2) {
      team2.stats.won++;
      team2.stats.points += 2;
      team1.stats.lost++;
    } else {
      team1.stats.tie++;
      team1.stats.points++;
      team2.stats.tie++;
      team2.stats.points++;
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
      ]).then();
    }
  };

  const undoLastBall = (matchId: string) => {
    const matchIndex = data.matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    let match = JSON.parse(JSON.stringify(data.matches[matchIndex])) as Match;
    const inning = match.innings2 || match.innings1;
    if (!inning || inning.history.length === 0) return;

    const lastBall = inning.history.pop();
    inning.totalRuns -= (lastBall!.runsScored + lastBall!.extras);
    if (lastBall!.isWicket) inning.wickets--;

    if (lastBall!.extraType === 'no-ball') {
      inning.isFreeHit = false;
    }

    if (lastBall!.isValidBall) {
      const ballPart = Math.round((inning.overs % 1) * 10);
      if (ballPart === 0) {
        inning.overs = Math.floor(inning.overs) - 1 + 0.5;
      } else {
        inning.overs -= 0.1;
      }
    }

    if (match.status === 'completed') match.status = 'live';

    const updatedMatches = [...data.matches];
    updatedMatches[matchIndex] = match;
    setData({ ...data, matches: updatedMatches });
    setActiveMatch(match);

    if (isSupabaseEnabled) {
      supabase!.from('matches').update({
        innings1: match.innings1,
        innings2: match.innings2,
        status: match.status
      }).eq('id', matchId).then();
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
        result_message: match.resultMessage
      }).eq('id', matchId).then();
    }
  };

  const resetTournament = () => {
    localStorage.removeItem('oizom_cricket_data');
    window.location.reload();
  };

  const generateKnockouts = () => {
    const groupA = data.teams.filter(t => t.group === 'A').sort((a, b) => b.stats.points - a.stats.points || b.stats.nrr - a.stats.nrr);
    const groupB = data.teams.filter(t => t.group === 'B').sort((a, b) => b.stats.points - a.stats.points || b.stats.nrr - a.stats.nrr);
    if (groupA.length < 2 || groupB.length < 2) return;

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
    setData({ ...data, matches: [...data.matches, sf1, sf2] });

    if (isSupabaseEnabled) {
      supabase!.from('matches').insert([
        { id: sf1.id, team_a_id: sf1.teamAId, team_b_id: sf1.teamBId, total_overs: 10, knockout_stage: 'SF1', status: 'scheduled', group_stage: false },
        { id: sf2.id, team_a_id: sf2.teamAId, team_b_id: sf2.teamBId, total_overs: 10, knockout_stage: 'SF2', status: 'scheduled', group_stage: false }
      ]).then();
    }
  };

  return (
    <TournamentContext.Provider value={{
      isAdmin, login, logout,
      teams: data.teams, matches: data.matches, activeMatch,
      addTeam, deleteTeam, addPlayer, deletePlayer, updateTeamGroup, setPlayerRole, setPlayerGender, createMatch, updateMatchToss, startInnings, setNextBowler,
      recordBall, undoLastBall, endMatch, resetTournament, generateKnockouts
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