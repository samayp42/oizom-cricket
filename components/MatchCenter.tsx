import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { formatOvers } from '../utils/nrr';
import { ArrowLeft, Wifi, TrendingUp, Clock, Share2, Tv, ChevronDown, Zap, Target, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MatchAnalytics from './MatchAnalytics';

// Tab Button Component
const TabButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`relative flex-1 py-4 px-2 text-sm font-tech font-bold uppercase tracking-wider transition-colors whitespace-nowrap
      ${active ? 'text-sports-primary' : 'text-slate-500 dark:text-sports-muted hover:text-slate-900 dark:hover:text-white'}`}
    >
        {label}
        {active && (
            <motion.div
                layoutId="match-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sports-primary to-sports-accent rounded-full shadow-lg shadow-sports-primary/50"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
        )}
    </button>
);

// Offline State Component
const OfflineState = () => (
    <div className="min-h-screen bg-sports-white dark:bg-sports-black font-sans transition-colors duration-300">
        <Header />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6 text-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 mesh-gradient opacity-30" />
            <div className="absolute inset-0 grid-pattern opacity-50" />

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative"
            >
                <motion.div
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center mb-8 shadow-2xl"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <Wifi size={56} className="text-slate-400 dark:text-sports-muted" />
                </motion.div>

                <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-800 dark:text-white mb-4">
                    TRANSMISSION OFFLINE
                </h2>
                <p className="text-slate-500 dark:text-sports-muted max-w-md mx-auto mb-10 text-lg">
                    There are no matches currently broadcasting live. Check the dashboard for the schedule.
                </p>

                <Link to="/">
                    <motion.button
                        className="btn-neon font-tech uppercase tracking-widest"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Return to Dashboard
                    </motion.button>
                </Link>
            </motion.div>
        </div>
    </div>
);

// Header Component
const Header = () => (
    <div className="sticky top-0 z-50 glass-ultra border-b border-slate-200/50 dark:border-white/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="p-2 -ml-2 text-slate-500 dark:text-sports-muted hover:text-slate-800 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-white/5">
                <ArrowLeft size={24} />
            </Link>
            <div className="font-tech font-bold uppercase tracking-[0.15em] text-sm text-slate-600 dark:text-sports-muted flex items-center gap-3">
                <div className="p-1.5 bg-sports-primary/10 rounded-lg">
                    <Tv size={16} className="text-sports-primary" />
                </div>
                Match Center
            </div>
            <motion.button
                className="p-2 -mr-2 text-slate-500 dark:text-sports-muted hover:text-slate-800 dark:hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Share2 size={20} />
            </motion.button>
        </div>
    </div>
);

// Score Hero Section
const ScoreHero = ({ match, battingTeam, currentInnings }: any) => (
    <div className="relative overflow-hidden bg-white dark:bg-sports-card border-b border-slate-200/50 dark:border-white/5 pt-10 pb-14 transition-colors duration-300">
        {/* Animated Top Border */}
        <motion.div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sports-primary via-sports-accent to-sports-primary"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: "200% 200%" }}
        />

        {/* Background Effects */}
        <div className="absolute inset-0 mesh-gradient opacity-40 dark:opacity-30" />
        <div className="absolute -right-32 -top-32 w-96 h-96 bg-sports-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -left-32 -bottom-32 w-80 h-80 bg-sports-accent/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
            {/* Live Badge */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/30 backdrop-blur-sm mb-8"
            >
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-lg shadow-red-500/50" />
                </span>
                <span className="text-xs font-black uppercase tracking-[0.25em] text-red-500">
                    Live Broadcast
                </span>
            </motion.div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center"
            >
                {/* Team Name */}
                <h2 className="text-2xl md:text-4xl font-display font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wide">
                    {battingTeam?.name || 'Waiting for Toss...'}
                </h2>

                {/* Score Display */}
                {currentInnings ? (
                    <motion.div
                        className="flex items-baseline gap-4 my-4"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                    >
                        <span className="score-display text-8xl md:text-[10rem] text-gradient">
                            {currentInnings.totalRuns}/{currentInnings.wickets}
                        </span>
                        <span className="text-2xl md:text-4xl font-mono text-slate-500 dark:text-sports-muted">
                            {formatOvers(currentInnings.overs)} <span className="text-base">ov</span>
                        </span>
                    </motion.div>
                ) : (
                    <motion.div
                        className="text-7xl font-display text-slate-300 dark:text-white/20 my-6"
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        0/0
                    </motion.div>
                )}

                {/* Run Rate Badge */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="stat-badge bg-sports-primary/10 border-sports-primary/20"
                >
                    <Zap size={14} className="text-sports-primary" />
                    <span className="text-sports-primary font-mono font-bold">
                        {match.innings2
                            ? `Target: ${match.innings1!.totalRuns + 1} • Needs ${(match.innings1!.totalRuns + 1 - match.innings2.totalRuns)} runs`
                            : `CRR: ${currentInnings && currentInnings.overs > 0 ? (currentInnings.totalRuns / currentInnings.overs).toFixed(2) : '0.00'}`
                        }
                    </span>
                </motion.div>
            </motion.div>
        </div>
    </div>
);

// Batter Row Component
const BatterRow = ({ player, isStriker, isNonStriker, isOut, currentInnings, getSR }: any) => (
    <motion.div
        className={`grid grid-cols-12 items-center py-4 px-5 transition-colors
      ${(isStriker || isNonStriker) ? 'bg-sports-primary/5' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
        whileHover={{ x: 4 }}
    >
        <div className="col-span-6 md:col-span-5">
            <div className={`flex items-center gap-2 font-bold text-sm ${isOut ? 'text-slate-400 dark:text-sports-muted' : 'text-slate-800 dark:text-white'}`}>
                {player.name}
                {isStriker && (
                    <motion.span
                        className="text-sports-primary text-lg"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        *
                    </motion.span>
                )}
            </div>
            {isOut && <div className="text-[10px] text-red-500/80 font-mono mt-0.5">out</div>}
        </div>
        <div className="col-span-2 md:col-span-1 text-right font-mono font-bold text-slate-800 dark:text-white text-lg">
            {player.stats.runs}
        </div>
        <div className="col-span-2 md:col-span-1 text-right font-mono text-slate-500 dark:text-sports-muted text-sm">
            {player.stats.balls}
        </div>
        <div className="hidden md:block col-span-1 text-right font-mono text-blue-400 text-sm">
            {player.stats.fours}
        </div>
        <div className="hidden md:block col-span-1 text-right font-mono text-emerald-400 text-sm">
            {player.stats.sixes}
        </div>
        <div className="col-span-2 md:col-span-3 text-right">
            <span className={`font-mono text-sm px-2 py-1 rounded-lg ${parseInt(getSR(player.stats.runs, player.stats.balls)) > 150
                    ? 'bg-sports-primary/10 text-sports-primary'
                    : 'text-slate-500 dark:text-sports-muted'
                }`}>
                {getSR(player.stats.runs, player.stats.balls)} <span className="text-[9px]">SR</span>
            </span>
        </div>
    </motion.div>
);

const MatchCenter = () => {
    const { activeMatch, teams } = useTournament();
    const [activeTab, setActiveTab] = useState<'scorecard' | 'commentary' | 'analytics' | 'info'>('scorecard');

    if (!activeMatch) {
        return <OfflineState />;
    }

    const currentInnings = activeMatch.innings2 || activeMatch.innings1;
    const battingTeamId = currentInnings ? currentInnings.battingTeamId : activeMatch.toss?.winnerId;
    const bowlingTeamId = currentInnings ? currentInnings.bowlingTeamId : (activeMatch.toss?.winnerId === activeMatch.teamAId ? activeMatch.teamBId : activeMatch.teamAId);

    const battingTeam = teams.find(t => t.id === battingTeamId);
    const bowlingTeam = teams.find(t => t.id === bowlingTeamId);

    const getSR = (runs: number, balls: number) => balls > 0 ? ((runs / balls) * 100).toFixed(0) : '0';
    const getEcon = (runs: number, overs: number) => overs > 0 ? (runs / overs).toFixed(2) : '0.00';

    return (
        <div className="min-h-screen pb-8 bg-sports-white dark:bg-sports-black font-sans transition-colors duration-300">
            <Header />
            <ScoreHero match={activeMatch} battingTeam={battingTeam} currentInnings={currentInnings} />

            {/* Tabs Navigation */}
            <div className="sticky top-16 z-40 glass-ultra border-b border-slate-200/50 dark:border-white/5">
                <div className="container mx-auto px-4">
                    <div className="flex overflow-x-auto no-scrollbar">
                        {['scorecard', 'analytics', 'commentary', 'info'].map(tab => (
                            <TabButton
                                key={tab}
                                label={tab}
                                active={activeTab === tab}
                                onClick={() => setActiveTab(tab as any)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'scorecard' && currentInnings && (
                            <div className="space-y-8">
                                {/* Batting Table */}
                                <motion.div
                                    className="glass-panel rounded-3xl overflow-hidden"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="px-6 py-4 border-b border-slate-200/50 dark:border-white/5 flex justify-between items-center bg-gradient-to-r from-transparent via-sports-primary/5 to-transparent">
                                        <h3 className="font-tech font-bold text-lg text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-3">
                                            <Target size={18} className="text-sports-primary" />
                                            Batting
                                        </h3>
                                        <span className="text-xs font-bold text-sports-primary bg-sports-primary/10 px-3 py-1 rounded-full">
                                            {battingTeam?.name}
                                        </span>
                                    </div>

                                    {/* Table Header */}
                                    <div className="grid grid-cols-12 text-[10px] text-slate-500 dark:text-sports-muted uppercase font-bold tracking-wider bg-slate-50/50 dark:bg-black/20 py-2 px-5">
                                        <div className="col-span-6 md:col-span-5">Batter</div>
                                        <div className="col-span-2 md:col-span-1 text-right">R</div>
                                        <div className="col-span-2 md:col-span-1 text-right">B</div>
                                        <div className="hidden md:block col-span-1 text-right">4s</div>
                                        <div className="hidden md:block col-span-1 text-right">6s</div>
                                        <div className="col-span-2 md:col-span-3 text-right">SR</div>
                                    </div>

                                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                                        {battingTeam?.players.filter(p => currentInnings.battingOrder.includes(p.id)).map(p => (
                                            <BatterRow
                                                key={p.id}
                                                player={p}
                                                isStriker={currentInnings.strikerId === p.id}
                                                isNonStriker={currentInnings.nonStrikerId === p.id}
                                                isOut={currentInnings.playersOut.includes(p.id)}
                                                currentInnings={currentInnings}
                                                getSR={getSR}
                                            />
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Bowling Table */}
                                <motion.div
                                    className="glass-panel rounded-3xl overflow-hidden"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="px-6 py-4 border-b border-slate-200/50 dark:border-white/5 flex justify-between items-center bg-gradient-to-r from-transparent via-sports-accent/5 to-transparent">
                                        <h3 className="font-tech font-bold text-lg text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-3">
                                            <Zap size={18} className="text-sports-accent" />
                                            Bowling
                                        </h3>
                                        <span className="text-xs font-bold text-sports-accent bg-sports-accent/10 px-3 py-1 rounded-full">
                                            {bowlingTeam?.name}
                                        </span>
                                    </div>

                                    {/* Table Header */}
                                    <div className="grid grid-cols-12 text-[10px] text-slate-500 dark:text-sports-muted uppercase font-bold tracking-wider bg-slate-50/50 dark:bg-black/20 py-2 px-5">
                                        <div className="col-span-5">Bowler</div>
                                        <div className="col-span-2 text-right">O</div>
                                        <div className="col-span-2 text-right">R</div>
                                        <div className="col-span-1 text-right">W</div>
                                        <div className="col-span-2 text-right">Econ</div>
                                    </div>

                                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                                        {bowlingTeam?.players.filter(p => p.stats.oversBowled > 0 || p.id === currentInnings.currentBowlerId).map(p => {
                                            const isCurrent = currentInnings.currentBowlerId === p.id;
                                            return (
                                                <motion.div
                                                    key={p.id}
                                                    className={`grid grid-cols-12 items-center py-4 px-5 transition-colors ${isCurrent ? 'bg-sports-accent/5' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                                    whileHover={{ x: 4 }}
                                                >
                                                    <div className="col-span-5">
                                                        <div className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                                                            {p.name}
                                                            {isCurrent && (
                                                                <motion.span
                                                                    className="w-2 h-2 rounded-full bg-sports-accent"
                                                                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2 text-right font-mono text-slate-800 dark:text-white">{formatOvers(p.stats.oversBowled)}</div>
                                                    <div className="col-span-2 text-right font-mono text-slate-500 dark:text-sports-muted">{p.stats.runsConceded}</div>
                                                    <div className="col-span-1 text-right font-mono font-bold text-sports-primary text-lg">{p.stats.wickets}</div>
                                                    <div className="col-span-2 text-right">
                                                        <span className={`font-mono text-sm px-2 py-1 rounded-lg ${parseFloat(getEcon(p.stats.runsConceded, p.stats.oversBowled)) < 6
                                                                ? 'bg-sports-primary/10 text-sports-primary'
                                                                : 'text-slate-500 dark:text-sports-muted'
                                                            }`}>
                                                            {getEcon(p.stats.runsConceded, p.stats.oversBowled)}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {activeTab === 'analytics' && currentInnings && (
                            <MatchAnalytics match={activeMatch} innings1={activeMatch.innings1!} innings2={activeMatch.innings2} />
                        )}

                        {activeTab === 'commentary' && currentInnings && (
                            <div className="space-y-4">
                                {currentInnings.history.slice().reverse().map((ball, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        key={ball.id}
                                        className="relative pl-8 pb-6 border-l-2 border-slate-200 dark:border-white/10 last:pb-0"
                                    >
                                        {/* Ball Indicator */}
                                        <motion.div
                                            className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-4 border-sports-white dark:border-sports-black flex items-center justify-center text-xs font-bold shadow-xl
                        ${ball.isWicket ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white' :
                                                    ball.runsScored === 4 ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white' :
                                                        ball.runsScored === 6 ? 'bg-gradient-to-br from-emerald-500 to-sports-primary text-white shadow-lg shadow-sports-primary/30' :
                                                            'bg-slate-100 dark:bg-sports-surface text-slate-600 dark:text-sports-muted'
                                                }`}
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            {ball.isWicket ? 'W' : ball.runsScored}
                                        </motion.div>

                                        {/* Commentary Card */}
                                        <div className="glass-card rounded-2xl p-4 ml-2 hover:shadow-lg transition-shadow">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-mono text-sm text-sports-primary font-bold">
                                                    {ball.overNumber}.{ball.ballInOver}
                                                </span>
                                                {ball.runsScored === 6 && (
                                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-1 rounded-full">
                                                        Maximum!
                                                    </span>
                                                )}
                                                {ball.runsScored === 4 && (
                                                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider bg-blue-500/10 px-2 py-1 rounded-full">
                                                        Boundary
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                                {ball.commentary}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}

                                {currentInnings.history.length === 0 && (
                                    <div className="text-center py-16 text-slate-500 dark:text-sports-muted">
                                        <Clock size={48} className="mx-auto mb-4 opacity-50" />
                                        <p className="text-lg">Waiting for first ball...</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'info' && currentInnings && (
                            <div className="grid gap-8">
                                {/* Partnership Card */}
                                <motion.div
                                    className="glass-panel p-8 rounded-3xl text-center relative overflow-hidden"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-sports-primary/10 rounded-full blur-3xl" />
                                    <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-sports-accent/10 rounded-full blur-3xl" />

                                    <div className="relative">
                                        <div className="flex items-center justify-center gap-2 mb-6">
                                            <Users size={18} className="text-sports-primary" />
                                            <h3 className="font-tech text-sm text-slate-500 dark:text-sports-muted uppercase tracking-[0.2em] font-bold">
                                                Current Partnership
                                            </h3>
                                        </div>

                                        <motion.div
                                            className="text-7xl md:text-8xl font-display font-bold text-gradient mb-2"
                                            animate={{ scale: [1, 1.02, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            {currentInnings.currentPartnership.runs}
                                        </motion.div>
                                        <div className="text-lg font-mono text-slate-500 dark:text-sports-muted mb-8">
                                            {currentInnings.currentPartnership.balls} balls
                                        </div>

                                        <div className="flex justify-center gap-8 items-center">
                                            <div className="text-right">
                                                <div className="font-bold text-slate-800 dark:text-white text-lg">
                                                    {battingTeam?.players.find(p => p.id === currentInnings.currentPartnership.batter1Id)?.name}
                                                </div>
                                            </div>
                                            <div className="w-px h-10 bg-gradient-to-b from-transparent via-slate-300 dark:via-white/20 to-transparent" />
                                            <div className="text-left">
                                                <div className="font-bold text-slate-800 dark:text-white text-lg">
                                                    {battingTeam?.players.find(p => p.id === currentInnings.currentPartnership.batter2Id)?.name}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Match Info Card */}
                                <motion.div
                                    className="glass-panel p-8 rounded-3xl"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <h3 className="font-tech text-sm text-slate-500 dark:text-sports-muted uppercase tracking-[0.2em] font-bold mb-6">
                                        Match Info
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                                            <div className="text-xs text-slate-500 dark:text-sports-muted uppercase mb-2 font-bold tracking-wider">Date</div>
                                            <div className="text-slate-800 dark:text-white font-mono text-lg">
                                                {new Date(activeMatch.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                                            <div className="text-xs text-slate-500 dark:text-sports-muted uppercase mb-2 font-bold tracking-wider">Format</div>
                                            <div className="text-slate-800 dark:text-white font-mono text-lg">{activeMatch.totalOvers} Overs</div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                                            <div className="text-xs text-slate-500 dark:text-sports-muted uppercase mb-2 font-bold tracking-wider">Toss</div>
                                            <div className="text-slate-800 dark:text-white">
                                                {teams.find(t => t.id === activeMatch.toss?.winnerId)?.name} opted to {activeMatch.toss?.choice}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {!currentInnings && (
                            <div className="text-center py-24">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-16 h-16 border-4 border-sports-primary/20 border-t-sports-primary rounded-full mx-auto mb-6"
                                />
                                <h3 className="text-2xl font-display text-slate-800 dark:text-white mb-3">MATCH STARTING SOON</h3>
                                <p className="text-slate-500 dark:text-sports-muted">Waiting for the toss and first ball.</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MatchCenter;