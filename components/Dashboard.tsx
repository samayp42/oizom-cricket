import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { Link } from 'react-router-dom';
import { formatOvers } from '../utils/nrr';
import { Trophy, Activity, ArrowRight, Zap, TrendingUp, Calendar, ChevronRight, Sparkles, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const scaleVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  }
};

// Premium Points Table Component
const PointsTable = ({ group, teams }: { group: string, teams: any[] }) => {
  const groupTeams = teams
    .filter(t => t.group === group)
    .sort((a, b) => b.stats.points - a.stats.points || b.stats.nrr - a.stats.nrr);

  return (
    <motion.div
      variants={itemVariants}
      className="glass-panel rounded-3xl overflow-hidden card-float"
    >
      {/* Header with gradient accent */}
      <div className="relative px-6 py-4 border-b border-slate-200/50 dark:border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-sports-primary/5 via-transparent to-sports-accent/5" />
        <div className="relative flex justify-between items-center">
          <h3 className="font-tech text-xl font-bold tracking-wider text-sports-primary flex items-center gap-3">
            <span className="w-2 h-8 bg-gradient-to-b from-sports-primary to-sports-accent rounded-full" />
            GROUP {group}
          </h3>
          <div className="flex items-center gap-1.5">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-sports-primary/50"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-slate-500 dark:text-sports-muted uppercase font-bold tracking-wider bg-slate-50/50 dark:bg-black/20">
              <th className="px-5 py-3 text-left">Team</th>
              <th className="px-2 py-3 text-center">P</th>
              <th className="px-2 py-3 text-center">W</th>
              <th className="px-2 py-3 text-center">L</th>
              <th className="px-2 py-3 text-center hidden sm:table-cell">NRR</th>
              <th className="px-5 py-3 text-right">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {groupTeams.map((team, idx) => (
              <motion.tr
                key={team.id}
                className="group hover:bg-sports-primary/5 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <motion.span
                      className={`text-xs w-6 h-6 flex items-center justify-center rounded-lg font-tech font-bold
                        ${idx < 2
                          ? 'bg-gradient-to-br from-sports-primary to-emerald-400 text-black shadow-lg shadow-sports-primary/30'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-gray-400'
                        }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {idx + 1}
                    </motion.span>
                    <span className="font-bold text-slate-800 dark:text-white truncate max-w-[100px] sm:max-w-none group-hover:text-sports-primary transition-colors">
                      {team.name}
                    </span>
                    {idx === 0 && (
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Trophy size={14} className="text-amber-400" />
                      </motion.div>
                    )}
                  </div>
                </td>
                <td className="px-2 py-4 text-center font-mono text-slate-500 dark:text-slate-400">{team.stats.played}</td>
                <td className="px-2 py-4 text-center font-mono font-bold text-emerald-500">{team.stats.won}</td>
                <td className="px-2 py-4 text-center font-mono text-rose-400">{team.stats.lost}</td>
                <td className="px-2 py-4 text-center font-mono text-xs text-slate-500 hidden sm:table-cell">
                  <span className={team.stats.nrr >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {team.stats.nrr > 0 ? '+' : ''}{team.stats.nrr.toFixed(2)}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="font-display text-2xl font-bold text-gradient">
                    {team.stats.points}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

// Premium Live Match Card
const LiveMatchCard = ({ match, teams }: { match: any, teams: any[] }) => {
  const tA = teams.find(t => t.id === match.teamAId);
  const tB = teams.find(t => t.id === match.teamBId);
  const inning = match.innings2 || match.innings1;

  return (
    <motion.div
      variants={scaleVariants}
      className="relative group"
    >
      {/* Animated Glow Border */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-sports-primary via-sports-accent to-sports-primary rounded-[28px] opacity-60 group-hover:opacity-100 blur-sm transition-all duration-500 animate-gradient" />

      {/* Main Card */}
      <div className="relative glass-ultra rounded-3xl overflow-hidden">
        {/* Mesh Background */}
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="absolute inset-0 grid-pattern" />

        {/* Content */}
        <div className="relative p-6 md:p-10">
          {/* Header */}
          <div className="flex flex-wrap gap-3 justify-between items-start mb-8">
            {/* Live Badge */}
            <motion.div
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 backdrop-blur-sm"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-lg shadow-red-500/50" />
              </span>
              <span className="text-red-500 text-xs font-black uppercase tracking-[0.2em]">
                Live Now
              </span>
            </motion.div>

            {/* Stage Badge */}
            <div className="stat-badge">
              <Sparkles size={14} className="text-sports-primary" />
              <span className="text-slate-600 dark:text-slate-300">
                {match.groupStage ? 'Group Stage' : match.knockoutStage}
              </span>
            </div>
          </div>

          {/* Match Info */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="flex-1">
              {/* Teams */}
              <motion.div
                className="flex items-center gap-3 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-800 dark:text-white uppercase tracking-wide">
                  {tA?.name}
                </h2>
                <span className="text-2xl md:text-3xl text-sports-muted font-light">vs</span>
                <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-800 dark:text-white uppercase tracking-wide">
                  {tB?.name}
                </h2>
              </motion.div>

              {/* Score Display */}
              {inning ? (
                <motion.div
                  className="flex items-baseline gap-5 mt-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="score-display text-7xl md:text-8xl lg:text-9xl text-gradient">
                    {inning.totalRuns}/{inning.wickets}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-mono text-sports-primary font-bold">
                      {formatOvers(inning.overs)} ov
                    </span>
                    <span className="text-sm text-slate-500 dark:text-sports-muted uppercase tracking-wider">
                      CRR {(inning.totalRuns / Math.max(0.1, inning.overs)).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="text-5xl font-display text-slate-300 dark:text-white/20 mt-6"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  MATCH STARTING...
                </motion.div>
              )}
            </div>

            {/* CTA Button */}
            <Link to="/live" className="w-full lg:w-auto">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="btn-neon w-full lg:w-auto font-tech text-lg uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <span>Watch Live</span>
                <ArrowRight size={20} />
              </motion.button>
            </Link>
          </div>

          {/* Latest Commentary */}
          {inning?.history?.length > 0 && (
            <motion.div
              className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="p-2 bg-sports-accent/10 rounded-lg">
                <Activity size={18} className="text-sports-accent" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-mono flex-1 truncate">
                {inning.history[inning.history.length - 1].commentary}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Premium Stat Card
const StatCard = ({ title, player, value, subtext, icon: Icon, gradient }: any) => (
  <motion.div
    variants={itemVariants}
    className="glass-panel p-5 rounded-2xl relative overflow-hidden group card-float"
    whileHover={{ scale: 1.02 }}
  >
    {/* Gradient Orb */}
    <div className={`absolute -right-10 -top-10 w-40 h-40 ${gradient} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />

    <div className="relative flex items-center gap-4">
      <motion.div
        className={`w-14 h-14 rounded-2xl ${gradient} bg-opacity-20 flex items-center justify-center border border-white/10 shadow-lg`}
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <Icon size={26} className="text-white" />
      </motion.div>
      <div className="flex-1">
        <div className="text-[10px] uppercase font-black tracking-[0.15em] text-slate-500 dark:text-sports-muted mb-1">
          {title}
        </div>
        <div className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
          {player || '—'}
        </div>
        <div className="text-sm text-slate-600 dark:text-sports-muted mt-0.5">
          <span className="text-gradient font-tech font-bold text-base">{value}</span> {subtext}
        </div>
      </div>
    </div>
  </motion.div>
);

// No Match Placeholder
const NoMatchPlaceholder = () => (
  <motion.div
    variants={itemVariants}
    className="glass-panel rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-white/10 relative overflow-hidden z-10"
  >
    {/* Decorative Elements - Reduced opacity and pointer-events-none to prevent blocking */}
    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
      <div className="text-[200px] font-display font-bold text-slate-800 dark:text-white">
        OCL
      </div>
    </div>

    <div className="relative z-20">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Calendar className="w-10 h-10 text-slate-400 dark:text-sports-muted" />
        </div>
      </motion.div>
      <h3 className="text-2xl font-display text-slate-800 dark:text-white tracking-wide mb-2">
        NO LIVE MATCHES
      </h3>
      <p className="text-slate-500 dark:text-sports-muted max-w-md mx-auto mb-8">
        The arena is quiet. Check back later for live action.
      </p>

      <Link to="/admin" className="inline-block relative z-30">
        <motion.button
          className="btn-neon font-tech uppercase tracking-widest flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Go to Admin Panel</span>
          <ArrowRight size={18} />
        </motion.button>
      </Link>
    </div>
  </motion.div>
);

// Main Dashboard Component
const Dashboard = () => {
  const { teams, matches, activeMatch } = useTournament();
  const completedMatches = matches.filter(m => m.status === 'completed');

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen"
    >
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb-primary w-96 h-96 -top-48 -left-48" />
        <div className="gradient-orb-accent w-80 h-80 top-1/2 -right-40" />
        <div className="gradient-orb-primary w-64 h-64 -bottom-32 left-1/3" />
      </div>

      <div className="relative container mx-auto px-4 py-8 md:py-12 space-y-12">
        {/* Hero Section - Active Match */}
        <section>
          {activeMatch && activeMatch.status !== 'completed' ? (
            <LiveMatchCard match={activeMatch} teams={teams} />
          ) : (
            <NoMatchPlaceholder />
          )}
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Standings */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div variants={itemVariants} className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/25">
                <Trophy className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="font-tech text-2xl md:text-3xl font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Tournament Standings
                </h2>
                <p className="text-sm text-slate-500 dark:text-sports-muted">
                  Live leaderboard • Updated in real-time
                </p>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              <PointsTable group="A" teams={teams} />
              <PointsTable group="B" teams={teams} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Top Performers */}
            <motion.div variants={itemVariants} className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-gradient-to-br from-sports-accent to-cyan-400 rounded-2xl shadow-lg shadow-sports-accent/25">
                <TrendingUp className="text-white w-6 h-6" />
              </div>
              <h2 className="font-tech text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Top Performers
              </h2>
            </motion.div>

            <div className="space-y-4">
              <StatCard
                title="Orange Cap"
                icon={Target}
                gradient="bg-gradient-to-br from-orange-500 to-amber-400"
                player="Virat K."
                value="245"
                subtext="Runs"
              />
              <StatCard
                title="Purple Cap"
                icon={Award}
                gradient="bg-gradient-to-br from-purple-600 to-violet-400"
                player="Bumrah J."
                value="12"
                subtext="Wickets"
              />
            </div>

            {/* Recent Results */}
            <motion.div variants={itemVariants} className="glass-panel rounded-3xl overflow-hidden card-float">
              <div className="px-6 py-4 border-b border-slate-200/50 dark:border-white/5">
                <h3 className="font-tech text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Recent Results
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {completedMatches.length > 0 ? (
                  completedMatches.slice(-3).reverse().map((m, idx) => (
                    <motion.div
                      key={m.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer group"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex justify-between text-[10px] text-slate-500 dark:text-sports-muted font-bold uppercase mb-2">
                        <span>{new Date(m.date).toLocaleDateString()}</span>
                        <span className="text-emerald-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Finished
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-sports-primary transition-colors">
                        {teams.find(t => t.id === m.teamAId)?.name} vs {teams.find(t => t.id === m.teamBId)?.name}
                      </div>
                      <div className="text-xs text-sports-primary mt-2 font-mono">
                        {m.resultMessage}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-sports-muted">
                    <Calendar size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No matches completed yet</p>
                  </div>
                )}
              </div>
              {completedMatches.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-200/50 dark:border-white/5">
                  <button className="w-full text-sm text-sports-primary font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:gap-3 transition-all">
                    View All Results
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;