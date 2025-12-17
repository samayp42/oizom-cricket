import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Shield, TrendingUp, Users, Target, Award, Zap, ChevronRight, Play, Star, Activity, Radio } from 'lucide-react';
import { calculateNRR, formatOvers } from '../utils/nrr';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  // Point multipliers: Cricket x3, Badminton/TT x2, Chess/Carrom x1
  const MULTIPLIERS = { cricket: 3, badminton: 2, tableTennis: 2, chess: 1, carrom: 1 };

  const leaderboard = teams.map(team => {
    // Raw points
    const cricketPts = team.stats.points || 0;
    const badmintonPts = team.badmintonStats?.points || 0;
    const ttPts = team.tableTennisStats?.points || 0;
    const chessPts = team.chessStats?.points || 0;
    const carromPts = team.carromStats?.points || 0;

    // Weighted points with multipliers
    const cricketWeighted = cricketPts * MULTIPLIERS.cricket;
    const badmintonWeighted = badmintonPts * MULTIPLIERS.badminton;
    const ttWeighted = ttPts * MULTIPLIERS.tableTennis;
    const chessWeighted = chessPts * MULTIPLIERS.chess;
    const carromWeighted = carromPts * MULTIPLIERS.carrom;

    const total = cricketWeighted + badmintonWeighted + ttWeighted + chessWeighted + carromWeighted;

    return {
      ...team,
      cricketPts, badmintonPts, ttPts, chessPts, carromPts,
      cricketWeighted, badmintonWeighted, ttWeighted, chessWeighted, carromWeighted,
      total
    };
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
                <tr
                  key={team.id}
                  className={`cursor-pointer transition-colors hover:bg-cricket-primary/5 ${idx < 3 ? 'bg-yellow-50/50' : ''}`}
                  onClick={() => setSelectedTeam(team)}
                >
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
                      <ChevronRight size={14} className="text-slate-300" />
                    </div>
                  </td>
                  <td className="text-center font-mono text-slate-500">{team.cricketWeighted}</td>
                  <td className="text-center font-mono text-slate-500">{team.badmintonWeighted}</td>
                  <td className="text-center font-mono text-slate-500">{team.ttWeighted}</td>
                  <td className="text-center font-mono text-slate-500">{team.chessWeighted}</td>
                  <td className="text-center font-mono text-slate-500">{team.carromWeighted}</td>
                  <td className="text-center pr-6 font-display font-bold text-xl text-cricket-primary">{team.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Details Modal */}
      <AnimatePresence>
        {selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedTeam(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-cricket-primary to-cricket-secondary px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center font-display font-bold text-2xl text-white">
                      {selectedTeam.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-bold text-white">{selectedTeam.name}</h3>
                      <p className="text-white/70 text-sm">Group {selectedTeam.group} • {selectedTeam.players?.length || 0} Players</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTeam(null)}
                    className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Points Summary */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500 uppercase">Total Weighted Points</span>
                  <span className="font-display text-3xl font-bold text-cricket-primary">{selectedTeam.total}</span>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2 bg-white rounded-lg">
                    <span className="block text-slate-400">🏏 x3</span>
                    <span className="font-bold text-slate-700">{selectedTeam.cricketWeighted}</span>
                    <span className="block text-[10px] text-slate-400">({selectedTeam.cricketPts})</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg">
                    <span className="block text-slate-400">🏸 x2</span>
                    <span className="font-bold text-slate-700">{selectedTeam.badmintonWeighted}</span>
                    <span className="block text-[10px] text-slate-400">({selectedTeam.badmintonPts})</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg">
                    <span className="block text-slate-400">🏓 x2</span>
                    <span className="font-bold text-slate-700">{selectedTeam.ttWeighted}</span>
                    <span className="block text-[10px] text-slate-400">({selectedTeam.ttPts})</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg">
                    <span className="block text-slate-400">♟️ x1</span>
                    <span className="font-bold text-slate-700">{selectedTeam.chessWeighted}</span>
                    <span className="block text-[10px] text-slate-400">({selectedTeam.chessPts})</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg">
                    <span className="block text-slate-400">🎯 x1</span>
                    <span className="font-bold text-slate-700">{selectedTeam.carromWeighted}</span>
                    <span className="block text-[10px] text-slate-400">({selectedTeam.carromPts})</span>
                  </div>
                </div>
              </div>

              {/* Players List */}
              <div className="px-6 py-4 max-h-[50vh] overflow-y-auto">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Squad</h4>
                <div className="space-y-2">
                  {selectedTeam.players?.map((player: any) => (
                    <div key={player.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${player.gender === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                          {player.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{player.name}</div>
                          <div className="text-xs text-slate-400">{player.gender === 'F' ? '👩 Female' : '👨 Male'}</div>
                        </div>
                      </div>
                      {player.role && player.role !== 'player' && (
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${player.role === 'captain' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'}`}>
                          {player.role === 'captain' ? '👑 Captain' : '⭐ Vice Captain'}
                        </span>
                      )}
                    </div>
                  ))}
                  {(!selectedTeam.players || selectedTeam.players.length === 0) && (
                    <div className="text-center py-8 text-slate-400">No players added yet</div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================
// UPCOMING FIXTURES DATA
// ============================================
const FIXTURES_DATA = [
  {
    date: '17th December',
    events: [
      {
        sport: 'Chess',
        emoji: '♟️',
        time: '10:00 AM – 1:00 PM',
        gradient: 'from-slate-700 to-slate-600',
        matches: [
          { teamA: 'Phoenix Flames', teamB: 'Oizomad Squad' },
          { teamA: 'Gully Gang', teamB: 'Bapu Na Blasters' },
          { teamA: 'Oizom Titans', teamB: 'Sledgers Regiment' },
          { teamA: 'Wozio Warriors', teamB: 'Neon Ninjas' },
        ]
      },
      {
        sport: 'Badminton Singles',
        emoji: '🏸',
        time: 'Starts at 1:00 PM',
        gradient: 'from-blue-600 to-indigo-500',
        matches: [
          { teamA: 'Phoenix Flames', teamB: 'Wozio Warriors' },
          { teamA: 'Neon Ninjas', teamB: 'Oizom Titans' },
          { teamA: 'Sledgers Regiment', teamB: 'Gully Gang' },
          { teamA: 'Bapu Na Blasters', teamB: 'Oizomad Squad' },
        ]
      },
      {
        sport: 'Badminton Doubles',
        emoji: '🏸',
        time: 'Starts at 1:45 PM',
        gradient: 'from-indigo-600 to-purple-500',
        matches: [
          { teamA: 'Phoenix Flames', teamB: 'Oizom Titans' },
          { teamA: 'Wozio Warriors', teamB: 'Gully Gang' },
          { teamA: 'Neon Ninjas', teamB: 'Oizomad Squad' },
          { teamA: 'Sledgers Regiment', teamB: 'Bapu Na Blasters' },
        ]
      }
    ]
  },
  {
    date: '18th December',
    events: [
      {
        sport: 'Carrom',
        emoji: '🎯',
        time: '10:00 AM – 1:00 PM',
        gradient: 'from-amber-500 to-yellow-500',
        matches: [
          { teamA: 'Phoenix Flames', teamB: 'Bapu Na Blasters' },
          { teamA: 'Oizomad Squad', teamB: 'Sledgers Regiment' },
          { teamA: 'Gully Gang', teamB: 'Neon Ninjas' },
          { teamA: 'Oizom Titans', teamB: 'Wozio Warriors' },
        ]
      },
      {
        sport: 'Cricket',
        emoji: '🏏',
        time: '1:30 PM – 8:00 PM',
        gradient: 'from-cricket-primary to-cricket-secondary',
        matches: [
          { time: '1:30 PM', teamA: 'Oizom Titans', teamB: 'Gully Gang' },
          { time: '2:05 PM', teamA: 'Phoenix Flames', teamB: 'Sledgers Regiment' },
          { time: '2:40 PM', teamA: 'Oizomad Squad', teamB: 'Wozio Warriors' },
          { time: '3:15 PM', teamA: 'Neon Ninjas', teamB: 'Bapu Na Blasters' },
          { time: '3:50 PM', teamA: 'Oizom Titans', teamB: 'Wozio Warriors' },
          { time: '4:25 PM', teamA: 'Phoenix Flames', teamB: 'Bapu Na Blasters' },
          { time: '5:00 PM', teamA: 'Gully Gang', teamB: 'Oizomad Squad' },
          { time: '5:35 PM', teamA: 'Sledgers Regiment', teamB: 'Neon Ninjas' },
          { time: '6:10 PM', teamA: 'Oizom Titans', teamB: 'Oizomad Squad' },
          { time: '6:45 PM', teamA: 'Phoenix Flames', teamB: 'Neon Ninjas' },
          { time: '7:20 PM', teamA: 'Gully Gang', teamB: 'Wozio Warriors' },
          { time: '7:55 PM', teamA: 'Sledgers Regiment', teamB: 'Bapu Na Blasters' },
        ]
      }
    ]
  },
  {
    date: '19th December',
    events: [
      {
        sport: 'Table Tennis',
        emoji: '🏓',
        time: '10:00 AM – 1:00 PM',
        gradient: 'from-orange-500 to-red-500',
        matches: [
          { teamA: 'Phoenix Flames', teamB: 'Gully Gang' },
          { teamA: 'Oizom Titans', teamB: 'Oizomad Squad' },
          { teamA: 'Wozio Warriors', teamB: 'Bapu Na Blasters' },
          { teamA: 'Neon Ninjas', teamB: 'Sledgers Regiment' },
        ]
      }
    ]
  }
];

// ============================================
// UPCOMING FIXTURES COMPONENT
// ============================================
const UpcomingFixtures = () => {
  const [expandedDay, setExpandedDay] = React.useState<string | null>(FIXTURES_DATA[0]?.date || null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cricket-primary to-cricket-secondary flex items-center justify-center">
          <span className="text-xl">📅</span>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-cricket-textPrimary uppercase tracking-wide">
            Tournament Schedule
          </h2>
          <p className="text-sm text-cricket-textMuted">17th - 19th December 2024</p>
        </div>
      </div>

      <div className="space-y-4">
        {FIXTURES_DATA.map((day) => (
          <div key={day.date} className="card-cricket overflow-hidden">
            {/* Day Header */}
            <button
              onClick={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-cricket-bgAlt to-white hover:from-cricket-primary/5 hover:to-white transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cricket-primary/10 flex items-center justify-center">
                  <span className="font-display text-lg font-bold text-cricket-primary">
                    {day.date.split(' ')[0]}
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="font-display text-lg font-bold text-cricket-textPrimary">{day.date}</h3>
                  <p className="text-xs text-cricket-textMuted">{day.events.length} event{day.events.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: expandedDay === day.date ? 180 : 0 }}
                className="text-cricket-textMuted"
              >
                <ChevronRight size={20} className="rotate-90" />
              </motion.div>
            </button>

            {/* Events */}
            <AnimatePresence>
              {expandedDay === day.date && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-4 bg-cricket-bgAlt/30">
                    {day.events.map((event, eventIdx) => (
                      <div key={eventIdx} className="bg-white rounded-2xl border border-cricket-border overflow-hidden shadow-sm">
                        {/* Event Header */}
                        <div className={`px-4 py-3 bg-gradient-to-r ${event.gradient} flex items-center gap-3`}>
                          <span className="text-2xl">{event.emoji}</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-white">{event.sport}</h4>
                            <p className="text-white/80 text-xs">{event.time}</p>
                          </div>
                          <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-bold">
                            {event.matches.length} matches
                          </span>
                        </div>

                        {/* Matches Grid */}
                        <div className="p-3 grid gap-2">
                          {event.matches.map((match: any, matchIdx) => (
                            <div
                              key={matchIdx}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cricket-bgAlt/50 hover:bg-cricket-primary/5 transition-colors"
                            >
                              {match.time && (
                                <span className="text-xs font-mono font-bold text-cricket-primary bg-cricket-primary/10 px-2 py-1 rounded-lg min-w-[65px] text-center">
                                  {match.time}
                                </span>
                              )}
                              <div className="flex-1 flex items-center justify-between">
                                <span className="font-semibold text-sm text-cricket-textPrimary">{match.teamA}</span>
                                <span className="text-[10px] font-black text-cricket-textMuted uppercase tracking-widest px-2">vs</span>
                                <span className="font-semibold text-sm text-cricket-textPrimary text-right">{match.teamB}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN DASHBOARD
// ============================================
const Dashboard = () => {
  const { teams, matches, activeMatch, activeGame, setActiveGame, knockoutMatches, youtubeStreamUrl } = useTournament();

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
          <h1 className="font-display text-4xl md:text-6xl font-bold text-cricket-textPrimary uppercase tracking-wide mb-2 transition-all duration-300">
            Oizom Champions
          </h1>
          <p className="text-cricket-textSecondary text-lg">Live Scores & Tournament Standings</p>
        </motion.div>

        {/* YouTube Live Stream Embed */}
        {youtubeStreamUrl && (() => {
          // Extract video ID from various YouTube URL formats
          const getYoutubeId = (url: string) => {
            if (!url) return null;
            // Already a video ID (11 chars)
            if (url.length === 11 && !url.includes('/')) return url;
            // Standard watch URL
            const watchMatch = url.match(/[?&]v=([^&]+)/);
            if (watchMatch) return watchMatch[1];
            // Short URL
            const shortMatch = url.match(/youtu\.be\/([^?]+)/);
            if (shortMatch) return shortMatch[1];
            // Embed URL
            const embedMatch = url.match(/embed\/([^?]+)/);
            if (embedMatch) return embedMatch[1];
            // Live URL
            const liveMatch = url.match(/live\/([^?]+)/);
            if (liveMatch) return liveMatch[1];
            return null;
          };

          const videoId = getYoutubeId(youtubeStreamUrl);
          if (!videoId) return null;

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <h2 className="font-display text-xl font-bold text-slate-800 uppercase tracking-wider">
                  Live Stream
                </h2>
              </div>
              <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
                  title="Live Stream"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </motion.div>
          );
        })()}

        {/* ALL LIVE MATCHES - Across All Games */}
        {(() => {
          const allLiveMatches = knockoutMatches.filter((m: any) => m.status === 'scheduled' || m.status === 'live');

          if (allLiveMatches.length === 0) return null;

          const SPORT_EMOJI: Record<string, string> = {
            cricket: '🏏', badminton: '🏸', table_tennis: '🏓', chess: '♟️', carrom: '🎯'
          };
          const SPORT_GRADIENT: Record<string, string> = {
            cricket: 'from-emerald-500 to-lime-400',
            badminton: 'from-blue-500 to-indigo-500',
            table_tennis: 'from-orange-500 to-red-500',
            chess: 'from-slate-600 to-zinc-500',
            carrom: 'from-amber-500 to-yellow-400'
          };
          const STAGE_STYLE: Record<string, { bg: string; text: string; border: string }> = {
            round_1: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
            semi_final: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
            final: { bg: 'bg-gradient-to-r from-amber-400 to-yellow-400', text: 'text-amber-900', border: 'border-amber-400' }
          };

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <h2 className="font-display text-xl font-bold text-slate-800 uppercase tracking-wider">
                  Live Matches ({allLiveMatches.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allLiveMatches.map((match: any) => {
                  const teamA = teams.find(t => t.id === match.teamAId);
                  const teamB = teams.find(t => t.id === match.teamBId);
                  const stageStyle = STAGE_STYLE[match.stage] || STAGE_STYLE.round_1;
                  const gradient = SPORT_GRADIENT[match.gameType] || SPORT_GRADIENT.badminton;
                  const isFinal = match.stage === 'final';
                  const isSemiFinal = match.stage === 'semi_final';

                  return (
                    <motion.div
                      key={match.id}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className={`relative overflow-hidden bg-white rounded-2xl shadow-lg border-2 transition-all p-5
                        ${isFinal ? 'border-amber-400 shadow-amber-200' : isSemiFinal ? 'border-blue-300' : 'border-slate-100'}`}
                    >
                      {/* Top gradient bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradient}`} />

                      {/* Sport & Live Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{SPORT_EMOJI[match.gameType] || '🎮'}</span>
                          <span className="text-xs font-bold uppercase text-slate-400">{match.gameType.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white">
                          <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-white"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          <span className="text-[10px] font-bold uppercase">Live</span>
                        </div>
                      </div>

                      {/* Stage Badge */}
                      <div className="text-center mb-3">
                        <span className={`inline-block px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${stageStyle.bg} ${stageStyle.text} ${stageStyle.border}`}>
                          {isFinal ? '🏆 FINAL 🏆' : match.stage.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Teams */}
                      <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                          <div className="font-bold text-slate-800">{teamA?.name || 'TBD'}</div>
                          {match.teamAPlayerIds?.map((pid: string) => {
                            const player = teamA?.players?.find((p: any) => p.id === pid);
                            return player ? <div key={pid} className="text-[10px] text-slate-500">{player.name}</div> : null;
                          })}
                        </div>
                        <div className="px-3">
                          <span className="text-slate-300 font-black text-sm">VS</span>
                        </div>
                        <div className="text-center flex-1">
                          <div className="font-bold text-slate-800">{teamB?.name || 'TBD'}</div>
                          {match.teamBPlayerIds?.map((pid: string) => {
                            const player = teamB?.players?.find((p: any) => p.id === pid);
                            return player ? <div key={pid} className="text-[10px] text-slate-500">{player.name}</div> : null;
                          })}
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-center mt-3">
                        <span className="text-[10px] font-bold text-slate-400">{match.pointsAwarded} pts to winner</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })()}

        {/* Overall Leaderboard */}
        <OverallLeaderboard teams={teams} />

        {/* Tournament Schedule */}
        <UpcomingFixtures />

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

        {/* Sport Selector - After Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Select Sport</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {['cricket', 'badminton', 'table_tennis', 'chess', 'carrom'].map((game) => (
              <button
                key={game}
                onClick={() => setActiveGame(game as any)}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all 
                    ${activeGame === game
                    ? 'bg-slate-800 text-white shadow-lg scale-105'
                    : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
              >
                {game === 'cricket' ? '🏏' : game === 'badminton' ? '🏸' : game === 'table_tennis' ? '🏓' : game === 'chess' ? '♟️' : '🎯'} {game.replace('_', ' ')}
              </button>
            ))}
          </div>
        </motion.div>

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
            <Link to="/scorer">
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