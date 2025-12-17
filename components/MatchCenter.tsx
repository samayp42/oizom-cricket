import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { formatOvers } from '../utils/nrr';
import { ArrowLeft, TrendingUp, Clock, Share2, Tv, Users, Activity, BarChart3, Radio, Flame, Circle, Dna, Grip, Disc, Zap, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MatchAnalytics from './MatchAnalytics';

// Sport-specific configurations
const SPORT_CONFIG: Record<string, { gradient: string; lightBg: string; emoji: string; borderActive: string }> = {
    cricket: { gradient: 'from-emerald-500 to-lime-400', lightBg: 'bg-emerald-50', emoji: '🏏', borderActive: 'border-emerald-400' },
    badminton: { gradient: 'from-blue-500 to-indigo-500', lightBg: 'bg-blue-50', emoji: '🏸', borderActive: 'border-blue-400' },
    table_tennis: { gradient: 'from-orange-500 to-red-500', lightBg: 'bg-orange-50', emoji: '🏓', borderActive: 'border-orange-400' },
    chess: { gradient: 'from-slate-600 to-zinc-500', lightBg: 'bg-slate-50', emoji: '♟️', borderActive: 'border-slate-400' },
    carrom: { gradient: 'from-amber-500 to-yellow-400', lightBg: 'bg-amber-50', emoji: '🎯', borderActive: 'border-amber-400' },
};

// ============================================
// GAME TAB BUTTON (ENHANCED)
// ============================================
const GameTabButton = ({ label, icon: Icon, active, onClick, sportKey }: any) => {
    const config = SPORT_CONFIG[sportKey] || SPORT_CONFIG.cricket;

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl border-2 transition-all min-w-[90px] md:min-w-[110px] overflow-hidden
                ${active
                    ? `bg-white ${config.borderActive} shadow-xl`
                    : 'bg-white/60 border-transparent hover:bg-white hover:border-slate-200 hover:shadow-lg'
                }`}
        >
            {/* Active gradient bar */}
            {active && (
                <motion.div
                    layoutId="active-sport-bar"
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
            )}

            {/* Icon with background */}
            <div className={`mb-2 p-2.5 rounded-xl transition-all ${active ? config.lightBg : 'bg-slate-100'}`}>
                <Icon size={22} className={active ? 'text-current' : 'text-slate-400'} style={{ color: active ? undefined : undefined }} />
            </div>

            {/* Emoji accent */}
            <span className="text-lg md:text-xl mb-1">{config.emoji}</span>

            {/* Label */}
            <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${active ? 'text-slate-800' : 'text-slate-400'}`}>
                {label}
            </span>

            {/* Shine effect on active */}
            {active && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-50 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                />
            )}
        </motion.button>
    );
};

// ============================================
// TAB BUTTON (SUB TABS)
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
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-cricket-border mb-6">
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
// SCORE HERO SECTION (CRICKET)
// ============================================
const ScoreHero = ({ match, battingTeam, bowlingTeam, currentInnings }: any) => {
    if (!match) return null;

    return (
        <div className="relative overflow-hidden bg-white border border-cricket-border rounded-3xl shadow-xl mb-12">
            {/* Green gradient bar */}
            <div className="h-2 bg-gradient-to-r from-cricket-primary via-cricket-primaryLight to-cricket-secondary" />

            {/* Background Effects */}
            <div className="absolute inset-0 bg-mesh-cricket opacity-50" />
            <div className="orb-green w-[600px] h-[600px] -top-[300px] -right-[200px] opacity-30" />
            <div className="orb-lime w-[500px] h-[500px] -bottom-[200px] -left-[200px] opacity-20" />
            <div className="absolute inset-0 bg-grid-cricket opacity-30" />

            <div className="relative container mx-auto px-4 py-8 md:py-16 text-center">
                {/* Status Badge */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border mb-8 ${match.status === 'live' ? 'bg-cricket-wicket/10 border-cricket-wicket/30 text-cricket-wicket' : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}
                >
                    {match.status === 'live' && <span className="live-dot" />}
                    <span className="text-sm font-black uppercase tracking-[0.25em]">
                        {match.status === 'live' ? 'Live Broadcast' : match.resultMessage || 'Match Status'}
                    </span>
                </motion.div>

                {/* Team Name */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-cricket-textPrimary uppercase tracking-wide mb-2">
                        {battingTeam?.name || 'Waiting for Toss...'}
                    </h2>
                    {battingTeam && (
                        <div className="badge-primary inline-flex mb-8">
                            <Activity size={14} />
                            <span>Batting</span>
                        </div>
                    )}
                </motion.div>

                {/* Score Display or Result */}
                {match.status === 'completed' || match.status === 'abandoned' ? (
                    <div className="text-2xl md:text-4xl font-display font-bold text-slate-800 mb-8">
                        {match.resultMessage}
                    </div>
                ) : (
                    currentInnings ? (
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
                            className="text-6xl md:text-8xl font-display font-bold text-cricket-textMuted/30 mb-8"
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            0/0
                        </motion.div>
                    )
                )}

                {/* Target Info */}
                {match.innings2 && match.innings1 && match.status === 'live' && (
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
}

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
    const { activeMatch, teams, knockoutMatches, matches } = useTournament();
    const [selectedGame, setSelectedGame] = useState('cricket');
    const [activeTab, setActiveTab] = useState<'scorecard' | 'commentary' | 'analytics' | 'info'>('scorecard');

    const cricketMatch = activeMatch; // The global active cricket match
    const isCricketLive = cricketMatch && cricketMatch.status !== 'completed' && cricketMatch.status !== 'abandoned';

    // Cricket Helpers
    const currentInnings = cricketMatch?.innings2 || cricketMatch?.innings1;
    const battingTeamId = currentInnings ? currentInnings.battingTeamId : cricketMatch?.toss?.winnerId;
    const bowlingTeamId = currentInnings ? currentInnings.bowlingTeamId : (cricketMatch?.toss?.winnerId === cricketMatch?.teamAId ? cricketMatch?.teamBId : cricketMatch?.teamAId);
    const battingTeam = teams.find(t => t.id === battingTeamId);
    const bowlingTeam = teams.find(t => t.id === bowlingTeamId);
    const getSR = (runs: number, balls: number) => balls > 0 ? ((runs / balls) * 100).toFixed(0) : '0';
    const getEcon = (runs: number, overs: number) => overs > 0 ? (runs / overs).toFixed(2) : '0.00';

    return (
        <div className="min-h-screen pb-8 bg-cricket-bg">
            <Header />

            <div className="container mx-auto px-4 max-w-5xl">
                {/* Game Switcher */}
                <div className="flex overflow-x-auto no-scrollbar gap-3 md:gap-4 mb-8 pb-4">
                    <GameTabButton label="Cricket" icon={Circle} active={selectedGame === 'cricket'} onClick={() => setSelectedGame('cricket')} sportKey="cricket" />
                    <GameTabButton label="Badminton" icon={Activity} active={selectedGame === 'badminton'} onClick={() => setSelectedGame('badminton')} sportKey="badminton" />
                    <GameTabButton label="Table Tennis" icon={Dna} active={selectedGame === 'table_tennis'} onClick={() => setSelectedGame('table_tennis')} sportKey="table_tennis" />
                    <GameTabButton label="Chess" icon={Grip} active={selectedGame === 'chess'} onClick={() => setSelectedGame('chess')} sportKey="chess" />
                    <GameTabButton label="Carrom" icon={Disc} active={selectedGame === 'carrom'} onClick={() => setSelectedGame('carrom')} sportKey="carrom" />
                </div>

                <AnimatePresence mode="wait">
                    {/* CRICKET CONTENT */}
                    {selectedGame === 'cricket' && (
                        <motion.div
                            key="cricket"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {cricketMatch ? (
                                <>
                                    <ScoreHero
                                        match={cricketMatch}
                                        battingTeam={battingTeam}
                                        bowlingTeam={bowlingTeam}
                                        currentInnings={currentInnings}
                                    />

                                    {/* Tabs */}
                                    <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-cricket-border mb-6 -mx-4 px-4">
                                        <div className="flex overflow-x-auto no-scrollbar">
                                            <TabButton label="Scorecard" icon={Activity} active={activeTab === 'scorecard'} onClick={() => setActiveTab('scorecard')} />
                                            <TabButton label="Analytics" icon={BarChart3} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                                            <TabButton label="Commentary" icon={Radio} active={activeTab === 'commentary'} onClick={() => setActiveTab('commentary')} />
                                            <TabButton label="Info" icon={Users} active={activeTab === 'info'} onClick={() => setActiveTab('info')} />
                                        </div>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="pb-12">
                                        {/* SCORECARD TAB */}
                                        {activeTab === 'scorecard' && currentInnings && (
                                            <div className="space-y-8">
                                                {/* Batting Card */}
                                                <div className="bg-white rounded-3xl border border-cricket-border shadow-card overflow-hidden">
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

                                                    {/* Extras & Total */}
                                                    <div className="px-4 md:px-6 py-4 border-t border-cricket-border bg-cricket-bgAlt/50">
                                                        {/* Extras Row */}
                                                        {(() => {
                                                            const wides = currentInnings.history.filter((b: any) => b.extraType === 'wide').reduce((sum: number, b: any) => sum + b.extras, 0);
                                                            const noBalls = currentInnings.history.filter((b: any) => b.extraType === 'no-ball').reduce((sum: number, b: any) => sum + b.extras, 0);
                                                            const totalExtras = wides + noBalls;
                                                            return (
                                                                <div className="flex justify-between items-center py-2">
                                                                    <span className="font-semibold text-cricket-textSecondary">Extras</span>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="font-bold text-cricket-textPrimary">{totalExtras}</span>
                                                                        <span className="text-sm text-cricket-textMuted">
                                                                            (WD {wides}, NB {noBalls})
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}

                                                        {/* Total Row */}
                                                        <div className="flex justify-between items-center py-2 border-t border-cricket-border mt-2 pt-3">
                                                            <span className="font-bold text-cricket-textPrimary text-lg">Total runs</span>
                                                            <div className="text-right">
                                                                <span className="font-display font-bold text-xl text-cricket-primary">
                                                                    {currentInnings.totalRuns}
                                                                </span>
                                                                <span className="text-cricket-textMuted ml-2">
                                                                    ({currentInnings.wickets} wkts, {formatOvers(currentInnings.overs)} ov)
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Yet to Bat */}
                                                    {(() => {
                                                        const yetToBat = battingTeam?.players.filter(p => !currentInnings.battingOrder.includes(p.id)) || [];
                                                        if (yetToBat.length === 0) return null;
                                                        return (
                                                            <div className="px-4 md:px-6 py-4 border-t border-cricket-border">
                                                                <div className="text-xs font-bold uppercase tracking-wider text-cricket-textMuted mb-2">Yet to bat</div>
                                                                <div className="text-sm text-cricket-textSecondary">
                                                                    {yetToBat.map((p, i) => (
                                                                        <span key={p.id}>
                                                                            {p.name}{p.role === 'captain' ? ' (C)' : p.role === 'vice-captain' ? ' (VC)' : ''}
                                                                            {i < yetToBat.length - 1 ? ' · ' : ''}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* Fall of Wickets */}
                                                    {currentInnings.fow && currentInnings.fow.length > 0 && (
                                                        <div className="px-4 md:px-6 py-4 border-t border-cricket-border bg-cricket-bgAlt/30">
                                                            <div className="text-xs font-bold uppercase tracking-wider text-cricket-textMuted mb-2">Fall of wickets</div>
                                                            <div className="text-sm text-cricket-textSecondary flex flex-wrap gap-x-4 gap-y-1">
                                                                {currentInnings.fow.map((f: any, i: number) => {
                                                                    const player = battingTeam?.players.find(p => p.id === f.batterId);
                                                                    return (
                                                                        <span key={i} className="whitespace-nowrap">
                                                                            <span className="font-bold text-cricket-wicket">{f.score}/{f.wicketCount}</span>
                                                                            <span className="text-cricket-textMuted ml-1">
                                                                                ({player?.name?.split(' ')[0] || 'Unknown'}, {formatOvers(f.over)} ov)
                                                                            </span>
                                                                            {i < currentInnings.fow.length - 1 && <span className="text-cricket-textMuted"> · </span>}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Bowling Card */}
                                                <div className="bg-white rounded-3xl border border-cricket-border shadow-card overflow-hidden">
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
                                                                {bowlingTeam?.players
                                                                    .filter(p => p.stats.oversBowled > 0 || p.stats.runsConceded > 0 || p.id === currentInnings.currentBowlerId)
                                                                    .sort((a, b) => b.stats.wickets - a.stats.wickets || a.stats.runsConceded - b.stats.runsConceded)
                                                                    .map(p => (
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

                                                    {/* No bowlers yet message */}
                                                    {bowlingTeam?.players.filter(p => p.stats.oversBowled > 0 || p.id === currentInnings.currentBowlerId).length === 0 && (
                                                        <div className="px-6 py-8 text-center text-cricket-textMuted">
                                                            <Activity size={32} className="mx-auto mb-3 opacity-30" />
                                                            <p className="text-sm">No bowling figures yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {(!currentInnings && cricketMatch.status !== 'completed' && cricketMatch.status !== 'abandoned') && (
                                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                                                <div className="mb-4 text-emerald-500"><Activity size={48} className="mx-auto" /></div>
                                                <h3 className="text-xl font-bold text-slate-800">Match Not Started</h3>
                                                <p className="text-slate-400">Waiting for toss and first ball.</p>
                                            </div>
                                        )}

                                        {/* ANALYTICS TAB */}
                                        {activeTab === 'analytics' && currentInnings && (
                                            <MatchAnalytics match={activeMatch} innings1={activeMatch.innings1!} innings2={activeMatch.innings2} />
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Active Cricket Match</h3>
                                    <p className="text-slate-400">There are no live cricket matches at the moment.</p>
                                </div>
                            )}

                            {/* Recent Cricket Matches List (Placeholder if we had a full list) */}
                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-widest mb-4">Other Matches</h3>
                                <div className="grid gap-4">
                                    {matches.filter((m: any) => m.id !== activeMatch?.id).map((m: any) => (
                                        <div key={m.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                                            <div className="flex gap-4 items-center">
                                                <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">{m.status}</span>
                                                <span className="font-bold text-slate-700"> Match {new Date(m.date || Date.now()).toLocaleDateString()}</span>
                                            </div>
                                            {m.resultMessage && <span className="text-emerald-600 font-bold text-sm">{m.resultMessage}</span>}
                                        </div>
                                    ))}
                                    {matches.length <= (activeMatch ? 1 : 0) && (
                                        <div className="text-center text-slate-400 text-sm italic">No other matches recorded.</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* GENERIC KNOCKOUT CONTENT */}
                    {selectedGame !== 'cricket' && (
                        <motion.div
                            key="generic"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {/* Sport Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm mb-4">
                                    <span className="text-2xl">{SPORT_CONFIG[selectedGame]?.emoji}</span>
                                    <span className="font-display font-bold uppercase tracking-wider text-slate-700">
                                        {selectedGame.replace('_', ' ')} Championship
                                    </span>
                                </div>
                            </div>

                            {/* Live Matches Section */}
                            {knockoutMatches.filter((m: any) => m.gameType === selectedGame && m.status === 'live').length > 0 && (
                                <div className="mb-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="live-dot" />
                                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Live Now</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {knockoutMatches.filter((m: any) => m.gameType === selectedGame && m.status === 'live').map((match: any) => {
                                            const teamA = teams.find(t => t.id === match.teamAId);
                                            const teamB = teams.find(t => t.id === match.teamBId);
                                            const config = SPORT_CONFIG[selectedGame];

                                            return (
                                                <motion.div
                                                    key={match.id}
                                                    initial={{ scale: 0.95, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className={`relative overflow-hidden bg-gradient-to-br ${config?.lightBg} p-6 rounded-3xl shadow-xl border-2 ${config?.borderActive}`}
                                                >
                                                    {/* Top gradient bar */}
                                                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${config?.gradient}`} />

                                                    {/* Live badge */}
                                                    <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500 text-white">
                                                        <motion.div
                                                            className="w-2 h-2 rounded-full bg-white"
                                                            animate={{ opacity: [1, 0.3, 1] }}
                                                            transition={{ duration: 1, repeat: Infinity }}
                                                        />
                                                        <span className="text-xs font-bold uppercase tracking-wider">Live</span>
                                                    </div>

                                                    <div className="text-center mb-4 mt-4">
                                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{match.stage.replace('_', ' ')}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="text-center flex-1">
                                                            <div className="text-3xl mb-2">{SPORT_CONFIG[selectedGame]?.emoji}</div>
                                                            <div className="font-bold text-xl text-slate-800 leading-tight">{teamA?.name || 'TBD'}</div>
                                                        </div>
                                                        <div className="px-4">
                                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config?.gradient} flex items-center justify-center text-white font-black text-sm shadow-lg`}>
                                                                VS
                                                            </div>
                                                        </div>
                                                        <div className="text-center flex-1">
                                                            <div className="text-3xl mb-2">{SPORT_CONFIG[selectedGame]?.emoji}</div>
                                                            <div className="font-bold text-xl text-slate-800 leading-tight">{teamB?.name || 'TBD'}</div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* All Matches Grid */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">All Matches</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {knockoutMatches.filter((m: any) => m.gameType === selectedGame).map((match: any, index: number) => {
                                    const teamA = teams.find(t => t.id === match.teamAId);
                                    const teamB = teams.find(t => t.id === match.teamBId);
                                    const isCompleted = match.status === 'completed';
                                    // For knockout games, 'scheduled' means it's being played (Live)
                                    const isLive = match.status === 'scheduled' || match.status === 'live';
                                    const config = SPORT_CONFIG[selectedGame];

                                    return (
                                        <motion.div
                                            key={match.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ y: -4, scale: 1.02 }}
                                            className={`relative overflow-hidden bg-white p-5 rounded-2xl shadow-lg border-2 transition-all
                                                ${isLive ? config?.borderActive + ' shadow-xl' : isCompleted ? 'border-slate-100 opacity-90' : 'border-slate-100 hover:border-slate-200'}`}
                                        >
                                            {/* Top gradient bar for live */}
                                            {isLive && (
                                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config?.gradient}`} />
                                            )}

                                            {/* Status badge */}
                                            <div className="absolute top-3 right-3">
                                                {isLive && (
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white">
                                                        <motion.div
                                                            className="w-1.5 h-1.5 rounded-full bg-white"
                                                            animate={{ opacity: [1, 0.3, 1] }}
                                                            transition={{ duration: 1, repeat: Infinity }}
                                                        />
                                                        <span className="text-[10px] font-bold uppercase">Live</span>
                                                    </div>
                                                )}
                                                {isCompleted && (
                                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-600">
                                                        <Trophy size={10} />
                                                        <span className="text-[10px] font-bold uppercase">Done</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Stage */}
                                            <div className="text-center mb-4 mt-2">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${config?.lightBg} text-slate-600`}>
                                                    {match.stage.replace('_', ' ')}
                                                </span>
                                            </div>

                                            {/* Teams with Players */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="text-center flex-1">
                                                    <div className="font-bold text-base text-slate-800 leading-tight mb-1">{teamA?.name || 'TBD'}</div>
                                                    {/* Player Names for Team A */}
                                                    {teamA && match.teamAPlayerIds && (
                                                        <div className="text-[10px] text-slate-500 space-y-0.5 mt-1">
                                                            {match.teamAPlayerIds.map((pid: string) => {
                                                                const player = teamA.players?.find((p: any) => p.id === pid);
                                                                return player ? (
                                                                    <div key={pid} className="font-medium">{player.name}</div>
                                                                ) : null;
                                                            })}
                                                        </div>
                                                    )}
                                                    {isCompleted && match.winnerTeamId === teamA?.id && (
                                                        <span className={`inline-block px-2 py-0.5 mt-2 bg-gradient-to-r ${config?.gradient} text-white text-[9px] font-bold uppercase rounded-full`}>Winner</span>
                                                    )}
                                                </div>
                                                <div className="px-3 pt-2">
                                                    <span className="text-slate-300 font-black text-sm">VS</span>
                                                </div>
                                                <div className="text-center flex-1">
                                                    <div className="font-bold text-base text-slate-800 leading-tight mb-1">{teamB?.name || 'TBD'}</div>
                                                    {/* Player Names for Team B */}
                                                    {teamB && match.teamBPlayerIds && (
                                                        <div className="text-[10px] text-slate-500 space-y-0.5 mt-1">
                                                            {match.teamBPlayerIds.map((pid: string) => {
                                                                const player = teamB.players?.find((p: any) => p.id === pid);
                                                                return player ? (
                                                                    <div key={pid} className="font-medium">{player.name}</div>
                                                                ) : null;
                                                            })}
                                                        </div>
                                                    )}
                                                    {isCompleted && match.winnerTeamId === teamB?.id && (
                                                        <span className={`inline-block px-2 py-0.5 mt-2 bg-gradient-to-r ${config?.gradient} text-white text-[9px] font-bold uppercase rounded-full`}>Winner</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Match type badge */}
                                            <div className="text-center">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    {match.matchType}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {knockoutMatches.filter((m: any) => m.gameType === selectedGame).length === 0 && (
                                    <div className="col-span-full py-16 text-center">
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="inline-flex flex-col items-center"
                                        >
                                            <div className={`w-20 h-20 rounded-3xl ${SPORT_CONFIG[selectedGame]?.lightBg} flex items-center justify-center mb-4 shadow-lg`}>
                                                <span className="text-4xl">{SPORT_CONFIG[selectedGame]?.emoji}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-2">No Matches Yet</h3>
                                            <p className="text-slate-400 max-w-sm">
                                                {selectedGame.replace('_', ' ')} matches will appear here once scheduled by admin.
                                            </p>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MatchCenter;