import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Shield, TrendingUp, Users, Target, Award, Zap, ChevronRight, Play, Star, Activity, Radio } from 'lucide-react';
import { calculateNRR, formatOvers } from '../utils/nrr';
import { motion } from 'framer-motion';

// ============================================
// STAT CARD
// ============================================
const StatCard = ({ title, value, subtext, icon: Icon, color }: { title: string; value: string | number; subtext: string; icon: any; color: string }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    className="stat-card"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-cricket-textMuted mb-2">{title}</p>
        <p className={`font-display text-4xl font-bold ${color}`}>{value}</p>
        <p className="text-sm text-cricket-textSecondary mt-1">{subtext}</p>
      </div>
      <div className="w-12 h-12 rounded-2xl bg-cricket-bgAlt flex items-center justify-center">
        <Icon size={24} className="text-cricket-primary" />
      </div>
    </div>
  </motion.div>
);

// ============================================
// POINTS TABLE
// ============================================
const PointsTable = ({ teams, group }: { teams: any[]; group: 'A' | 'B' }) => {
  const groupTeams = teams.filter(t => t.group === group)
    .sort((a, b) => {
      if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
      return calculateNRR(b) - calculateNRR(a);
    });

  const groupColor = group === 'A' ? 'from-cricket-primary to-cricket-primaryLight' : 'from-cricket-secondary to-cricket-emerald';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-cricket overflow-hidden"
    >
      {/* Header */}
      <div className={`px-6 py-4 bg-gradient-to-r ${groupColor} flex items-center gap-3`}>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Trophy size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-white uppercase tracking-wide">Group {group}</h3>
          <p className="text-white/70 text-xs">{groupTeams.length} Teams</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-cricket">
          <thead>
            <tr>
              <th className="text-left pl-6">#</th>
              <th className="text-left">Team</th>
              <th className="text-center">P</th>
              <th className="text-center">W</th>
              <th className="text-center">L</th>
              <th className="text-center hidden sm:table-cell">NRR</th>
              <th className="text-center pr-6">Pts</th>
            </tr>
          </thead>
          <tbody>
            {groupTeams.map((team, idx) => {
              const nrr = calculateNRR(team);
              const isTop = idx < 2;
              return (
                <motion.tr
                  key={team.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={isTop ? 'bg-cricket-primary/5' : ''}
                >
                  <td className="pl-6">
                    <span className={`w-7 h-7 inline-flex items-center justify-center rounded-lg text-sm font-bold ${isTop ? 'bg-cricket-primary text-white' : 'bg-cricket-bgAlt text-cricket-textSecondary'
                      }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cricket-primary/10 to-cricket-secondary/10 flex items-center justify-center font-display font-bold text-sm text-cricket-primary border border-cricket-borderGreen">
                        {team.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-cricket-textPrimary">{team.name}</span>
                    </div>
                  </td>
                  <td className="text-center font-mono text-cricket-textSecondary">{team.stats.played}</td>
                  <td className="text-center font-mono font-bold text-cricket-primary">{team.stats.won}</td>
                  <td className="text-center font-mono text-cricket-textSecondary">{team.stats.lost}</td>
                  <td className={`text-center font-mono text-sm hidden sm:table-cell ${nrr >= 0 ? 'text-cricket-primary' : 'text-cricket-wicket'}`}>
                    {nrr >= 0 ? '+' : ''}{nrr.toFixed(3)}
                  </td>
                  <td className="text-center pr-6">
                    <span className="font-display text-2xl font-bold text-cricket-textPrimary">{team.stats.points}</span>
                  </td>
                </motion.tr>
              );
            })}
            {groupTeams.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-cricket-textMuted">
                  No teams in this group yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

// ============================================
// BADMINTON POINTS TABLE
// ============================================
// ============================================
// KNOCKOUT POINTS TABLE
// ============================================
const KnockoutPointsTable = ({ teams, group, gameType }: { teams: any[]; group: 'A' | 'B'; gameType: any }) => {
  const getStats = (t: any) => {
    if (gameType === 'badminton') return t.badmintonStats;
    if (gameType === 'table_tennis') return t.tableTennisStats;
    if (gameType === 'chess') return t.chessStats;
    if (gameType === 'carrom') return t.carromStats;
    return {};
  };

  const groupTeams = teams.filter(t => t.group === group)
    .sort((a, b) => {
      const ptsA = getStats(a)?.points || 0;
      const ptsB = getStats(b)?.points || 0;
      return ptsB - ptsA;
    });

  const getColors = () => {
    switch (gameType) {
      case 'badminton': return 'from-blue-600 to-indigo-500';
      case 'table_tennis': return 'from-orange-500 to-red-500';
      case 'chess': return 'from-slate-700 to-slate-600';
      case 'carrom': return 'from-amber-500 to-yellow-500';
      default: return 'from-blue-600 to-indigo-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-cricket overflow-hidden"
    >
      <div className={`px-6 py-4 bg-gradient-to-r ${getColors()} flex items-center gap-3`}>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Activity size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-white uppercase tracking-wide">Group {group}</h3>
          <p className="text-white/70 text-xs">{groupTeams.length} Teams</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-cricket">
          <thead>
            <tr>
              <th className="text-left pl-6">#</th>
              <th className="text-left">Team</th>
              <th className="text-center">P</th>
              <th className="text-center">W</th>
              <th className="text-center">L</th>
              <th className="text-center pr-6">Pts</th>
            </tr>
          </thead>
          <tbody>
            {groupTeams.map((team, idx) => {
              const stats = getStats(team) || { played: 0, won: 0, lost: 0, points: 0 };
              const isTop = idx < 2;
              return (
                <motion.tr
                  key={team.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={isTop ? 'bg-slate-50' : ''}
                >
                  <td className="pl-6">
                    <span className={`w-7 h-7 inline-flex items-center justify-center rounded-lg text-sm font-bold ${isTop ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-display font-bold text-sm text-slate-600 border border-slate-200">
                        {team.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800">{team.name}</span>
                    </div>
                  </td>
                  <td className="text-center font-mono text-slate-500">{stats.played}</td>
                  <td className="text-center font-mono font-bold text-green-600">{stats.won}</td>
                  <td className="text-center font-mono text-red-400">{stats.lost}</td>
                  <td className="text-center pr-6">
                    <span className="font-display text-2xl font-bold text-slate-800">{stats.points}</span>
                  </td>
                </motion.tr>
              );
            })}
            {groupTeams.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-cricket-textMuted">
                  No teams in this group yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

// ============================================
// LIVE MATCH HERO
// ============================================
const LiveMatchHero = ({ match, teams }: { match: any; teams: any[] }) => {
  const navigate = useNavigate();
  const teamA = teams.find(t => t.id === match.teamAId);
  const teamB = teams.find(t => t.id === match.teamBId);
  const currentInnings = match.innings2 || match.innings1;
  const battingTeam = currentInnings ? teams.find(t => t.id === currentInnings.battingTeamId) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-[32px] overflow-hidden bg-white border border-cricket-border shadow-premium"
    >
      {/* Green Gradient Top Bar */}
      <div className="h-2 bg-gradient-to-r from-cricket-primary via-cricket-primaryLight to-cricket-secondary" />

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-mesh-cricket opacity-50" />
      <div className="absolute inset-0 bg-grid-cricket opacity-30" />

      {/* Floating Orbs */}
      <div className="orb-green w-80 h-80 -top-40 -right-32" />
      <div className="orb-lime w-60 h-60 -bottom-30 -left-20" />

      <div className="relative p-6 md:p-12">
        {/* Live Badge */}
        <div className="flex justify-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="live-badge"
          >
            <span className="live-dot" />
            <span>Live Now</span>
          </motion.div>
        </div>

        {/* Teams vs Score */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-8 md:mb-10">
          {/* Team A */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cricket-primary to-cricket-secondary flex items-center justify-center font-display text-3xl font-bold text-white mb-3 shadow-glow-green">
              {teamA?.name?.slice(0, 2).toUpperCase()}
            </div>
            <p className="font-display text-xl font-bold text-cricket-textPrimary uppercase tracking-wide">{teamA?.name}</p>
          </div>

          {/* Score */}
          <div className="text-center">
            {currentInnings ? (
              <>
                <motion.div
                  key={currentInnings.totalRuns}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="score-mega text-6xl md:text-[8rem] leading-none"
                >
                  {currentInnings.totalRuns}/{currentInnings.wickets}
                </motion.div>
                <p className="text-xl font-mono text-cricket-primary font-bold mt-2">
                  {formatOvers(currentInnings.overs)} overs
                </p>
                <p className="text-sm text-cricket-textMuted mt-1">
                  {battingTeam?.name} batting
                </p>
              </>
            ) : (
              <div className="font-display text-6xl font-bold text-cricket-textMuted">VS</div>
            )}
          </div>

          {/* Team B */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cricket-secondary to-cricket-emerald flex items-center justify-center font-display text-3xl font-bold text-white mb-3 shadow-glow-emerald">
              {teamB?.name?.slice(0, 2).toUpperCase()}
            </div>
            <p className="font-display text-xl font-bold text-cricket-textPrimary uppercase tracking-wide">{teamB?.name}</p>
          </div>
        </div>

        {/* Target Info */}
        {match.innings2 && match.innings1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-cricket-wicket/10 border border-cricket-wicket/30">
              <Zap size={18} className="text-cricket-wicket" />
              <span className="text-cricket-wicket font-bold">
                Need {match.innings1.totalRuns + 1 - match.innings2.totalRuns} runs from {((match.totalOvers - match.innings2.overs) * 6).toFixed(0)} balls
              </span>
            </div>
          </motion.div>
        )}

        {/* CTA Button */}
        <div className="flex justify-center">
          <motion.button
            onClick={() => navigate('/live')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-3"
          >
            <Play size={20} fill="currentColor" />
            <span>Watch Live</span>
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// NO MATCH PLACEHOLDER
// ============================================
const NoMatchPlaceholder = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-[32px] overflow-hidden bg-white border border-cricket-border shadow-card p-8 md:p-16 text-center"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-mesh-cricket" />
      <div className="orb-green w-60 h-60 -top-30 -right-30 opacity-50" />

      <div className="relative z-10">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cricket-primary/10 to-cricket-secondary/10 flex items-center justify-center mx-auto mb-8 border border-cricket-borderGreen"
        >
          <Radio size={48} className="text-cricket-primary" />
        </motion.div>

        <h2 className="font-display text-4xl font-bold text-cricket-textPrimary uppercase tracking-wide mb-4">
          No Live Match
        </h2>
        <p className="text-cricket-textSecondary text-lg mb-10 max-w-md mx-auto">
          There's no match in progress. Start a new match from the admin panel.
        </p>

        <motion.button
          onClick={() => navigate('/admin')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary"
        >
          Go to Admin Panel
        </motion.button>
      </div>
    </motion.div>
  );
};

// ============================================
// TOP PERFORMER CARD
// ============================================
const TopPerformerCard = ({ title, player, value, subtext, icon: Icon, gradient }: {
  title: string; player: string; value: string | number; subtext: string; icon: any; gradient: string;
}) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${gradient} text-white shadow-premium`}
  >
    {/* Pattern */}
    <div className="absolute inset-0 opacity-10">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <pattern id="dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="white" />
        </pattern>
        <rect x="0" y="0" width="100" height="100" fill="url(#dots)" />
      </svg>
    </div>

    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/80">{title}</span>
        <Icon size={24} className="text-white/80" />
      </div>
      <p className="font-display text-2xl font-bold mb-1">{player}</p>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-5xl font-bold">{value}</span>
        <span className="text-white/80 uppercase text-sm font-bold tracking-wide">{subtext}</span>
      </div>
    </div>
  </motion.div>
);

// ============================================
// OVERALL LEADERBOARD
// ============================================
const OverallLeaderboard = ({ teams }: { teams: any[] }) => {
  const leaderboard = teams.map(team => {
    const cricketPts = team.stats.points || 0;
    const badmintonPts = team.badmintonStats?.points || 0;
    const ttPts = team.tableTennisStats?.points || 0;
    const chessPts = team.chessStats?.points || 0;
    const carromPts = team.carromStats?.points || 0;
    const total = cricketPts + badmintonPts + ttPts + chessPts + carromPts;
    return { ...team, cricketPts, badmintonPts, ttPts, chessPts, carromPts, total };
  }).sort((a, b) => b.total - a.total);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Trophy size={24} className="text-yellow-500" />
        <h2 className="font-display text-2xl font-bold text-cricket-textPrimary uppercase tracking-wide">
          Championship Leaderboard
        </h2>
      </div>
      <div className="card-cricket overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-cricket">
            <thead>
              <tr>
                <th className="pl-6 text-left">#</th>
                <th className="text-left">Team</th>
                <th className="text-center">Cricket</th>
                <th className="text-center">Badminton</th>
                <th className="text-center">TT</th>
                <th className="text-center">Chess</th>
                <th className="text-center">Carrom</th>
                <th className="text-center pr-6 font-bold text-cricket-primary">Total</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((team, idx) => (
                <tr key={team.id} className={idx < 3 ? 'bg-yellow-50/50' : ''}>
                  <td className="pl-6">
                    <span className={`w-8 h-8 inline-flex items-center justify-center rounded-full text-sm font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-slate-100 text-slate-700' : idx === 2 ? 'bg-orange-50 text-orange-700' : 'text-slate-400'}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">
                        {team.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className={`font-bold ${idx < 3 ? 'text-slate-900' : 'text-slate-700'}`}>{team.name}</span>
                    </div>
                  </td>
                  <td className="text-center font-mono text-slate-500">{team.cricketPts}</td>
                  <td className="text-center font-mono text-slate-500">{team.badmintonPts}</td>
                  <td className="text-center font-mono text-slate-500">{team.ttPts}</td>
                  <td className="text-center font-mono text-slate-500">{team.chessPts}</td>
                  <td className="text-center font-mono text-slate-500">{team.carromPts}</td>
                  <td className="text-center pr-6 font-display font-bold text-xl text-cricket-primary">{team.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN DASHBOARD
// ============================================
const Dashboard = () => {
  const { teams, matches, activeMatch, activeGame, setActiveGame, knockoutMatches } = useTournament();

  // Calculate top performers (Cricket Only for now)
  const allPlayers = teams.flatMap(t => t.players.map(p => ({ ...p, teamName: t.name })));
  const topRunScorer = activeGame === 'cricket' ? allPlayers.reduce((top, p) => (!top || p.stats.runs > top.stats.runs) ? p : top, null as any) : null;
  const topWicketTaker = activeGame === 'cricket' ? allPlayers.reduce((top, p) => (!top || p.stats.wickets > top.stats.wickets) ? p : top, null as any) : null;

  // Stats
  const currentMatches = activeGame === 'cricket' ? matches : knockoutMatches.filter(m => m.gameType === activeGame);
  const completedMatches = currentMatches.filter((m: any) => m.status === 'completed').length;
  const totalPlayers = allPlayers.length;

  // Points 
  const totalPoints = teams.reduce((acc, t) => {
    let pts = 0;
    if (activeGame === 'cricket') pts = t.stats.points;
    else if (activeGame === 'badminton') pts = t.badmintonStats?.points || 0;
    else if (activeGame === 'table_tennis') pts = t.tableTennisStats?.points || 0;
    else if (activeGame === 'chess') pts = t.chessStats?.points || 0;
    else if (activeGame === 'carrom') pts = t.carromStats?.points || 0;
    return acc + pts;
  }, 0);

  return (
    <div className="min-h-screen bg-cricket-bg pb-12">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-mesh-cricket" />
        <div className="orb-green w-[600px] h-[600px] -top-[300px] -right-[200px] opacity-40" />
        <div className="orb-lime w-[400px] h-[400px] -bottom-[200px] -left-[150px] opacity-30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-6 md:py-8 max-w-7xl safe-area-pt safe-area-pb">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {['cricket', 'badminton', 'table_tennis', 'chess', 'carrom'].map((game) => (
              <button
                key={game}
                onClick={() => setActiveGame(game as any)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all 
                    ${activeGame === game
                    ? 'bg-slate-800 text-white shadow-lg'
                    : 'bg-white text-slate-400 hover:text-slate-600'}`}
              >
                {game.replace('_', ' ')}
              </button>
            ))}
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-cricket-textPrimary uppercase tracking-wide mb-2 transition-all duration-300">
            {activeGame.replace('_', ' ')}
          </h1>
          <p className="text-cricket-textSecondary text-lg">Live Scores & Tournament Standings</p>
        </motion.div>

        {/* Overall Leaderboard */}
        <OverallLeaderboard teams={teams} />



        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12"
        >
          <StatCard title="Teams" value={teams.length} subtext="Registered" icon={Users} color="text-cricket-primary" />
          <StatCard title="Players" value={totalPlayers} subtext="Total" icon={Target} color="text-cricket-secondary" />
          <StatCard title="Matches" value={completedMatches} subtext="Completed" icon={Activity} color="text-cricket-boundary" />
          <StatCard title="Points" value={totalPoints} subtext="Awarded" icon={Award} color="text-cricket-six" />
        </motion.div>

        {/* Top Performers (Cricket Only) */}
        {activeGame === 'cricket' && (topRunScorer || topWicketTaker) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <Star size={20} className="text-cricket-six" />
              <h2 className="font-display text-2xl font-bold text-cricket-textPrimary uppercase tracking-wide">Top Performers</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {topRunScorer && topRunScorer.stats.runs > 0 && (
                <TopPerformerCard
                  title="Orange Cap"
                  icon={Target}
                  gradient="from-orange-500 to-amber-500"
                  player={topRunScorer.name}
                  value={topRunScorer.stats.runs}
                  subtext="Runs"
                />
              )}
              {topWicketTaker && topWicketTaker.stats.wickets > 0 && (
                <TopPerformerCard
                  title="Purple Cap"
                  icon={Award}
                  gradient="from-purple-600 to-violet-500"
                  player={topWicketTaker.name}
                  value={topWicketTaker.stats.wickets}
                  subtext="Wickets"
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Tournament Standings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={20} className="text-cricket-primary" />
            <h2 className="font-display text-2xl font-bold text-cricket-textPrimary uppercase tracking-wide">
              {activeGame.replace('_', ' ')} Standings
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {activeGame === 'cricket' ? (
              <>
                <PointsTable teams={teams} group="A" />
                <PointsTable teams={teams} group="B" />
              </>
            ) : (
              <>
                <KnockoutPointsTable teams={teams} group="A" gameType={activeGame} />
                <KnockoutPointsTable teams={teams} group="B" gameType={activeGame} />
              </>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-wrap justify-center gap-4"
        >
          <Link to="/admin">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="btn-ghost flex items-center gap-3"
            >
              <Shield size={18} />
              Admin Panel
            </motion.button>
          </Link>
          {activeGame === 'cricket' && activeMatch && (
            <Link to="/scoring">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex items-center gap-3"
              >
                <Play size={18} />
                Go to Scorer
              </motion.button>
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;