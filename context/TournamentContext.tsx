import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { TournamentData, Match, Team, InningsState, BallEvent, Player } from '../types';
import { INITIAL_TEAMS } from '../constants';
import { calculateNRR, addOvers } from '../utils/nrr';
import { generateCommentary } from '../utils/analytics';

interface TournamentContextType {
  isAdmin: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  teams: Team[];
  matches: Match[];
  activeMatch: Match | null;
  addTeam: (name: string, group: 'A' | 'B') => void;
  deleteTeam: (teamId: string) => void;
  addPlayer: (teamId: string, playerName: string) => void;
  deletePlayer: (teamId: string, playerId: string) => void;
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
  
  const [data, setData] = useState<TournamentData>(() => {
    const saved = localStorage.getItem('oizom_cricket_data');
    return saved ? JSON.parse(saved) : { teams: INITIAL_TEAMS, matches: [] };
  });

  const [activeMatch, setActiveMatch] = useState<Match | null>(() => {
    if (!data) return null;
    return data.matches.find(m => m.status === 'live' || m.status === 'toss' || m.status === 'innings_break') || null;
  });

  useEffect(() => {
    localStorage.setItem('oizom_cricket_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (activeMatch) {
      const matchInState = data.matches.find(m => m.id === activeMatch.id);
      if (matchInState && JSON.stringify(matchInState) !== JSON.stringify(activeMatch)) {
         setActiveMatch(matchInState);
      }
    }
  }, [data.matches, activeMatch]);

  const login = (pin: string) => {
      if (pin === '1234') {
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
      setData(prev => ({ ...prev, teams: [...prev.teams, newTeam] }));
  };

  const deleteTeam = (teamId: string) => {
      setData(prev => ({
          ...prev,
          teams: prev.teams.filter(t => t.id !== teamId)
      }));
  };

  const addPlayer = (teamId: string, playerName: string) => {
      const teamIdx = data.teams.findIndex(t => t.id === teamId);
      if (teamIdx === -1) return;
      
      const newPlayer: Player = {
          id: Math.random().toString(36).substr(2, 9),
          name: playerName,
          teamId,
          stats: { runs: 0, balls: 0, wickets: 0, oversBowled: 0, runsConceded: 0, fours: 0, sixes: 0 }
      };
      
      const updatedTeams = [...data.teams];
      updatedTeams[teamIdx].players.push(newPlayer);
      setData(prev => ({ ...prev, teams: updatedTeams }));
  };

  const deletePlayer = (teamId: string, playerId: string) => {
      const teamIdx = data.teams.findIndex(t => t.id === teamId);
      if (teamIdx === -1) return;

      const updatedTeams = [...data.teams];
      updatedTeams[teamIdx].players = updatedTeams[teamIdx].players.filter(p => p.id !== playerId);
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
  };

  const updateMatchToss = (matchId: string, winnerId: string, choice: 'bat' | 'bowl') => {
    const matchIndex = data.matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    const match = { ...data.matches[matchIndex] };
    match.toss = { winnerId, choice };
    match.status = 'scheduled'; // Move to setup phase
    const updatedMatches = [...data.matches];
    updatedMatches[matchIndex] = match;
    setData({ ...data, matches: updatedMatches });
    setActiveMatch(match);
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
         // Second innings swap
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
  };

  const recordBall = (matchId: string, ball: BallEvent, nextBatterId?: string) => {
    const matchIndex = data.matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    
    let match = JSON.parse(JSON.stringify(data.matches[matchIndex])) as Match;
    const currentInnings = match.innings2 || match.innings1;
    if(!currentInnings) return;

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
      if (ball.extraType !== 'wide') { // Wides don't count as balls faced in partnership usually, but runs do
         currentInnings.currentPartnership.balls += 1;
      }
      currentInnings.currentPartnership.runs += (ball.runsScored + ball.extras);
    }

    if (ball.isWicket) {
        currentInnings.wickets += 1;
        if (ball.wicketPlayerId) {
            currentInnings.playersOut.push(ball.wicketPlayerId);
            // Record FOW
            currentInnings.fow.push({
              score: currentInnings.totalRuns,
              wicketCount: currentInnings.wickets,
              over: currentInnings.overs,
              batterId: ball.wicketPlayerId
            });
        }
    }

    // --- 2. Handle Overs ---
    let overCompleted = false;
    if (ball.isValidBall) {
      const balls = Math.round((currentInnings.overs % 1) * 10);
      ball.ballInOver = balls + 1; // 1-6 for display
      if (balls === 5) {
        currentInnings.overs = Math.floor(currentInnings.overs) + 1;
        overCompleted = true;
      } else {
        currentInnings.overs += 0.1;
      }
    } else {
        // e.g. 2.3 w/nb -> keeps over at 2.3
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
      // Free hit consumed (unless it was another no ball or wide, simplified to: valid ball consumes it)
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
    } else if (match.innings2) {
        // Check Chase
        if (match.innings2.totalRuns > match.innings1!.totalRuns) {
            endMatchLogic(match);
        }
    }

    const updatedMatches = [...data.matches];
    updatedMatches[matchIndex] = match;
    setData({ ...data, matches: updatedMatches });
    setActiveMatch(match);
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
    
    // Very simplified undo for Free Hit
    // In reality, we need to know the state BEFORE the ball. 
    // For now, if we undo a No Ball, we remove Free Hit.
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
  };

  return (
    <TournamentContext.Provider value={{ 
        isAdmin, login, logout,
        teams: data.teams, matches: data.matches, activeMatch, 
        addTeam, deleteTeam, addPlayer, deletePlayer, createMatch, updateMatchToss, startInnings, setNextBowler,
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