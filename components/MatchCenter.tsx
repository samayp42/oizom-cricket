import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { formatOvers } from '../utils/nrr';
import { ArrowLeft, TrendingUp, Clock, Share2, Tv, Users, Activity, BarChart3, Radio, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MatchAnalytics from './MatchAnalytics';

// ============================================
// TAB BUTTON
// ============================================
const TabButton = ({ label, icon: Icon, active, onClick }: { label: string; icon: any; active: boolean; onClick: () => void }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`relative flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 font-display font-bold uppercase tracking-wider text-xs md:text-sm transition-all whitespace-nowrap
            ${active
                ? 'text-cricket-primary'
                : 'text-cricket-textMuted hover:text-cricket-textPrimary'
            }`}
    >
        <Icon size={16} />
        <span>{label}</span>
        {active && (
            <motion.div
                layoutId="match-tab-active"
                className="absolute bottom-0 left-2 right-2 h-1 rounded-full bg-gradient-to-r from-cricket-primary to-cricket-secondary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
        )}
    </motion.button>
);

// ============================================
// HEADER
// ============================================
const Header = () => (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-cricket-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link
                to="/"
                className="p-2.5 -ml-2 text-cricket-textMuted hover:text-cricket-primary transition-colors rounded-xl hover:bg-cricket-primary/5"
            >
                <ArrowLeft size={22} />
            </Link>
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cricket-primary/10">
                    <Tv size={18} className="text-cricket-primary" />
                </div>
                <span className="font-display font-bold uppercase tracking-[0.15em] text-sm text-cricket-textSecondary">
                    Match Center
                </span>
            </div>
            <motion.button
                className="p-2.5 -mr-2 text-cricket-textMuted hover:text-cricket-primary transition-colors rounded-xl hover:bg-cricket-primary/5"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Share2 size={20} />
            </motion.button>
        </div>
    </div>
);

// ============================================
// OFFLINE STATE
// ============================================
const OfflineState = () => (
    <div className="min-h-screen bg-cricket-bg">
        <Header />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6 text-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-mesh-cricket" />
            <div className="orb-green w-[500px] h-[500px] -top-[200px] -right-[200px] opacity-40" />
            <div className="orb-lime w-[400px] h-[400px] -bottom-[100px] -left-[100px] opacity-30" />

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 150 }}
                className="relative z-10"
            >
                <motion.div
                    className="w-32 h-32 rounded-3xl bg-white border border-cricket-border flex items-center justify-center mb-10 shadow-card"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <Radio size={56} className="text-cricket-textMuted" />
                </motion.div>

                <h2 className="text-5xl md:text-6xl font-display font-bold text-cricket-textPrimary uppercase tracking-wide mb-4">
                    Offline
                </h2>
                <p className="text-cricket-textSecondary max-w-md mx-auto mb-10 text-lg">
                    No live matches currently broadcasting. Check the dashboard for schedule.
                </p>

                <Link to="/">
                    <motion.button
                        className="btn-primary"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Back to Dashboard
                    </motion.button>
                </Link>
            </motion.div>
        </div>
    </div>
);

// ============================================
// SCORE HERO SECTION
// ============================================
const ScoreHero = ({ match, battingTeam, bowlingTeam, currentInnings }: any) => (
    <div className="relative overflow-hidden bg-white border-b border-cricket-border">
        {/* Green gradient bar */}
        <div className="h-2 bg-gradient-to-r from-cricket-primary via-cricket-primaryLight to-cricket-secondary" />

        {/* Background Effects */}
        <div className="absolute inset-0 bg-mesh-cricket opacity-50" />
        <div className="orb-green w-[600px] h-[600px] -top-[300px] -right-[200px] opacity-30" />
        <div className="orb-lime w-[500px] h-[500px] -bottom-[200px] -left-[200px] opacity-20" />
        <div className="absolute inset-0 bg-grid-cricket opacity-30" />

        <div className="relative container mx-auto px-4 py-8 md:py-16 text-center">
            {/* Live Badge */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-cricket-wicket/10 border border-cricket-wicket/30 mb-8"
            >
                <span className="live-dot" />
                <span className="text-sm font-black uppercase tracking-[0.25em] text-cricket-wicket">
                    Live Broadcast
                </span>
            </motion.div>

            {/* Team Name */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <h2 className="text-3xl md:text-5xl font-display font-bold text-cricket-textPrimary uppercase tracking-wide mb-2">
                    {battingTeam?.name || 'Loading...'}
                </h2>
                <div className="badge-primary inline-flex mb-8">
                    <Activity size={14} />
                    <span>Batting</span>
                </div>
            </motion.div>

            {/* Score Display */}
            {currentInnings ? (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="mb-8"
                >
                    <div className="score-mega mb-4 text-6xl md:text-9xl leading-none">
                        {currentInnings.totalRuns}/{currentInnings.wickets}
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xl">
                        <span className="font-mono text-cricket-primary font-bold">
                            {formatOvers(currentInnings.overs)} overs
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-cricket-textMuted" />
                        <span className="text-cricket-textSecondary">
                            CRR {currentInnings.overs > 0 ? (currentInnings.totalRuns / currentInnings.overs).toFixed(2) : '0.00'}
                        </span>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    className="text-8xl font-display font-bold text-cricket-textMuted/30 mb-8"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    0/0
                </motion.div>
            )}

            {/* Target Info */}
            {match.innings2 && match.innings1 && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-cricket-wicket/10 border border-cricket-wicket/30"
                >
                    <Flame size={20} className="text-cricket-wicket" />
                    <span className="text-lg text-cricket-wicket font-bold">
                        Need {match.innings1.totalRuns + 1 - match.innings2.totalRuns} runs from {((match.totalOvers - match.innings2.overs) * 6).toFixed(0)} balls
                    </span>
                </motion.div>
            )}
        </div>
    </div>
);

// ============================================
// BATTER ROW
// ============================================
const BatterRow = ({ player, isStriker, isOut, getSR }: any) => (
    <motion.tr
        className={`transition-colors ${isStriker ? 'bg-cricket-primary/5' : isOut ? 'opacity-50' : 'hover:bg-cricket-primary/5'}`}
        whileHover={{ x: 4 }}
    >
        <td className="py-3 px-3 md:py-4 md:px-5">
            <div className="flex items-center gap-3">
                {isStriker && (
                    <motion.div
                        className="w-2 h-2 rounded-full bg-cricket-primary"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                )}
                <div>
                    <span className={`font-bold ${isOut ? 'text-cricket-textMuted line-through' : 'text-cricket-textPrimary'}`}>
                        {player.name}
                    </span>
                    <span className="text-cricket-primary font-bold">{isStriker ? ' *' : ''}</span>
                </div>
            </div>
        </td>
        <td className="py-3 px-2 md:py-4 md:px-3 text-right font-mono font-bold text-cricket-textPrimary text-base md:text-lg">{player.stats.runs}</td>
        <td className="py-3 px-2 md:py-4 md:px-3 text-right font-mono text-cricket-textSecondary text-xs md:text-base">{player.stats.balls}</td>
        <td className="py-3 px-2 md:py-4 md:px-3 text-right font-mono text-cricket-boundary hidden sm:table-cell">{player.stats.fours}</td>
        <td className="py-3 px-2 md:py-4 md:px-3 text-right font-mono text-cricket-primary hidden sm:table-cell">{player.stats.sixes}</td>
        <td className="py-3 px-3 md:py-4 md:px-5 text-right">
            <span className={`font-mono text-sm px-3 py-1 rounded-lg ${parseInt(getSR(player.stats.runs, player.stats.balls)) > 150
                ? 'bg-cricket-primary/10 text-cricket-primary'
                : 'text-cricket-textMuted'
                }`}>
                {getSR(player.stats.runs, player.stats.balls)}
            </span>
        </td>
    </motion.tr>
);

// ============================================
// BOWLER ROW
// ============================================
const BowlerRow = ({ player, isCurrent, getEcon, formatOvers }: any) => (
    <motion.tr
        className={`transition-colors ${isCurrent ? 'bg-cricket-secondary/5' : 'hover:bg-cricket-secondary/5'}`}
        whileHover={{ x: 4 }}
    >
        <td className="py-4 px-5">
            <div className="flex items-center gap-3">
                {isCurrent && (
                    <motion.div
                        className="w-2 h-2 rounded-full bg-cricket-secondary"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                )}
                <span className="font-bold text-cricket-textPrimary">{player.name}</span>
            </div>
        </td>
        <td className="py-4 px-3 text-right font-mono text-cricket-textPrimary">{formatOvers(player.stats.oversBowled)}</td>
        <td className="py-4 px-3 text-right font-mono text-cricket-textSecondary">{player.stats.runsConceded}</td>
        <td className="py-4 px-3 text-right font-mono font-bold text-cricket-secondary text-lg">{player.stats.wickets}</td>
        <td className="py-4 px-5 text-right">
            <span className={`font-mono text-sm px-3 py-1 rounded-lg ${parseFloat(getEcon(player.stats.runsConceded, player.stats.oversBowled)) < 6
                ? 'bg-cricket-secondary/10 text-cricket-secondary'
                : 'text-cricket-textMuted'
                }`}>
                {getEcon(player.stats.runsConceded, player.stats.oversBowled)}
            </span>
        </td>
    </motion.tr>
);

// ============================================
// MAIN MATCH CENTER
// ============================================
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
        <div className="min-h-screen pb-8 bg-cricket-bg">
            <Header />
            <ScoreHero
                match={activeMatch}
                battingTeam={battingTeam}
                bowlingTeam={bowlingTeam}
                currentInnings={currentInnings}
            />

            {/* Tabs */}
            <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-cricket-border">
                <div className="container mx-auto px-4">
                    <div className="flex overflow-x-auto no-scrollbar -mx-4 px-4">
                        <TabButton label="Scorecard" icon={Activity} active={activeTab === 'scorecard'} onClick={() => setActiveTab('scorecard')} />
                        <TabButton label="Analytics" icon={BarChart3} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                        <TabButton label="Commentary" icon={Radio} active={activeTab === 'commentary'} onClick={() => setActiveTab('commentary')} />
                        <TabButton label="Info" icon={Users} active={activeTab === 'info'} onClick={() => setActiveTab('info')} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl safe-area-pb">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* SCORECARD TAB */}
                        {activeTab === 'scorecard' && currentInnings && (
                            <div className="space-y-8">
                                {/* Batting Card */}
                                <motion.div
                                    className="bg-white rounded-3xl border border-cricket-border shadow-card overflow-hidden"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div className="px-6 py-5 border-b border-cricket-border flex justify-between items-center bg-cricket-bgAlt">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1 h-10 rounded-full bg-gradient-to-b from-cricket-primary to-cricket-primaryLight" />
                                            <h3 className="font-display text-xl font-bold text-cricket-textPrimary uppercase tracking-wide">Batting</h3>
                                        </div>
                                        <span className="badge-primary">{battingTeam?.name}</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="table-cricket">
                                            <thead>
                                                <tr>
                                                    <th className="text-left">Batter</th>
                                                    <th className="text-right">R</th>
                                                    <th className="text-right">B</th>
                                                    <th className="text-right hidden sm:table-cell">4s</th>
                                                    <th className="text-right hidden sm:table-cell">6s</th>
                                                    <th className="text-right">SR</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {battingTeam?.players.filter(p => currentInnings.battingOrder.includes(p.id)).map(p => (
                                                    <BatterRow
                                                        key={p.id}
                                                        player={p}
                                                        isStriker={currentInnings.strikerId === p.id}
                                                        isOut={currentInnings.playersOut.includes(p.id)}
                                                        getSR={getSR}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>

                                {/* Bowling Card */}
                                <motion.div
                                    className="bg-white rounded-3xl border border-cricket-border shadow-card overflow-hidden"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="px-6 py-5 border-b border-cricket-border flex justify-between items-center bg-cricket-bgAlt">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1 h-10 rounded-full bg-gradient-to-b from-cricket-secondary to-cricket-emerald" />
                                            <h3 className="font-display text-xl font-bold text-cricket-textPrimary uppercase tracking-wide">Bowling</h3>
                                        </div>
                                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-cricket-secondary/10 border border-cricket-secondary/20 text-cricket-secondary">
                                            {bowlingTeam?.name}
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="table-cricket">
                                            <thead>
                                                <tr>
                                                    <th className="text-left">Bowler</th>
                                                    <th className="text-right">O</th>
                                                    <th className="text-right">R</th>
                                                    <th className="text-right">W</th>
                                                    <th className="text-right">Econ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bowlingTeam?.players.filter(p => p.stats.oversBowled > 0 || p.id === currentInnings.currentBowlerId).map(p => (
                                                    <BowlerRow
                                                        key={p.id}
                                                        player={p}
                                                        isCurrent={currentInnings.currentBowlerId === p.id}
                                                        getEcon={getEcon}
                                                        formatOvers={formatOvers}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* ANALYTICS TAB */}
                        {activeTab === 'analytics' && currentInnings && (
                            <MatchAnalytics match={activeMatch} innings1={activeMatch.innings1!} innings2={activeMatch.innings2} />
                        )}

                        {/* COMMENTARY TAB */}
                        {activeTab === 'commentary' && currentInnings && (
                            <div className="space-y-4">
                                {currentInnings.history.slice().reverse().map((ball, idx) => {
                                    const getBallColor = () => {
                                        if (ball.isWicket) return 'from-cricket-wicket to-red-600';
                                        if (ball.runsScored === 6) return 'from-cricket-primary to-cricket-primaryLight';
                                        if (ball.runsScored === 4) return 'from-cricket-boundary to-blue-600';
                                        return 'from-gray-400 to-gray-500';
                                    };

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            key={ball.id}
                                            className="relative pl-10"
                                        >
                                            {/* Timeline */}
                                            <div className="absolute left-3 top-0 bottom-0 w-px bg-cricket-border" />

                                            {/* Ball Badge */}
                                            <motion.div
                                                className={`absolute left-0 top-1 w-7 h-7 rounded-full bg-gradient-to-br ${getBallColor()} flex items-center justify-center text-[10px] font-bold text-white border-4 border-cricket-bg shadow-md`}
                                                whileHover={{ scale: 1.2 }}
                                            >
                                                {ball.isWicket ? 'W' : ball.runsScored}
                                            </motion.div>

                                            {/* Commentary Card */}
                                            <div className="bg-white border border-cricket-border rounded-2xl p-5 ml-2 shadow-card">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-mono text-sm text-cricket-primary font-bold">
                                                        {ball.overNumber}.{ball.ballInOver}
                                                    </span>
                                                    {ball.runsScored === 6 && (
                                                        <span className="text-[10px] font-bold text-cricket-primary uppercase tracking-wider px-2 py-1 rounded-md bg-cricket-primary/10">Maximum!</span>
                                                    )}
                                                    {ball.runsScored === 4 && (
                                                        <span className="text-[10px] font-bold text-cricket-boundary uppercase tracking-wider px-2 py-1 rounded-md bg-cricket-boundary/10">Boundary!</span>
                                                    )}
                                                    {ball.isWicket && (
                                                        <span className="text-[10px] font-bold text-cricket-wicket uppercase tracking-wider px-2 py-1 rounded-md bg-cricket-wicket/10">Wicket!</span>
                                                    )}
                                                </div>
                                                <p className="text-cricket-textSecondary leading-relaxed">{ball.commentary}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {currentInnings.history.length === 0 && (
                                    <div className="text-center py-20 text-cricket-textMuted">
                                        <Clock size={56} className="mx-auto mb-6 opacity-30" />
                                        <p className="font-display text-xl uppercase tracking-widest">Waiting for first ball...</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* INFO TAB */}
                        {activeTab === 'info' && currentInnings && (
                            <div className="space-y-8">
                                {/* Partnership */}
                                <motion.div
                                    className="bg-white rounded-3xl p-8 md:p-12 text-center border border-cricket-border shadow-card relative overflow-hidden"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div className="absolute inset-0 bg-mesh-cricket opacity-30" />
                                    <div className="orb-green w-80 h-80 -top-40 -right-40 opacity-30" />

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-center gap-2 mb-6">
                                            <Users size={20} className="text-cricket-primary" />
                                            <h3 className="font-display text-sm text-cricket-textMuted uppercase tracking-[0.2em] font-bold">
                                                Current Partnership
                                            </h3>
                                        </div>

                                        <motion.div
                                            className="font-display text-8xl font-bold text-cricket-primary mb-2"
                                            animate={{ scale: [1, 1.02, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            {currentInnings.currentPartnership.runs}
                                        </motion.div>
                                        <div className="text-xl font-mono text-cricket-textMuted mb-10">
                                            {currentInnings.currentPartnership.balls} balls
                                        </div>

                                        <div className="flex justify-center gap-10 items-center">
                                            <div className="text-right">
                                                <div className="font-bold text-cricket-textPrimary text-lg">
                                                    {battingTeam?.players.find(p => p.id === currentInnings.currentPartnership.batter1Id)?.name}
                                                </div>
                                            </div>
                                            <div className="w-px h-12 bg-cricket-border" />
                                            <div className="text-left">
                                                <div className="font-bold text-cricket-textPrimary text-lg">
                                                    {battingTeam?.players.find(p => p.id === currentInnings.currentPartnership.batter2Id)?.name}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Match Details */}
                                <motion.div
                                    className="bg-white rounded-3xl p-8 border border-cricket-border shadow-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <h3 className="font-display text-sm text-cricket-textMuted uppercase tracking-[0.2em] font-bold mb-6">
                                        Match Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-5 rounded-2xl bg-cricket-bgAlt border border-cricket-border">
                                            <div className="text-[10px] text-cricket-textMuted uppercase tracking-wider font-bold mb-2">Date</div>
                                            <div className="text-cricket-textPrimary font-mono text-lg">
                                                {new Date(activeMatch.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-cricket-bgAlt border border-cricket-border">
                                            <div className="text-[10px] text-cricket-textMuted uppercase tracking-wider font-bold mb-2">Format</div>
                                            <div className="text-cricket-textPrimary font-mono text-lg">{activeMatch.totalOvers} Overs</div>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-cricket-bgAlt border border-cricket-border">
                                            <div className="text-[10px] text-cricket-textMuted uppercase tracking-wider font-bold mb-2">Toss</div>
                                            <div className="text-cricket-textPrimary">
                                                {teams.find(t => t.id === activeMatch.toss?.winnerId)?.name} • {activeMatch.toss?.choice}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* No Innings Yet */}
                        {!currentInnings && (
                            <div className="text-center py-24">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-16 h-16 border-4 border-cricket-primary/20 border-t-cricket-primary rounded-full mx-auto mb-8"
                                />
                                <h3 className="text-3xl font-display text-cricket-textPrimary uppercase tracking-wide mb-4">Match Starting Soon</h3>
                                <p className="text-cricket-textMuted">Waiting for toss and first ball.</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MatchCenter;