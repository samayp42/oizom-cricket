import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { ArrowLeft, Trophy, Target, Award, Flame, TrendingUp, Zap, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatOvers } from '../utils/nrr';
import { Player, Team } from '../types';

// ============================================
// TYPES
// ============================================
interface PlayerWithTeam extends Player {
    teamName: string;
    teamId: string;
}

// ============================================
// STAT CARD
// ============================================
const StatCard = ({ label, value, icon: Icon, gradient, subtext }: {
    label: string;
    value: string | number;
    icon: any;
    gradient: string;
    subtext?: string;
}) => (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-lg`}>
        <div className="absolute top-2 right-2 opacity-20">
            <Icon size={48} />
        </div>
        <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">{label}</div>
            <div className="font-display text-3xl font-bold">{value}</div>
            {subtext && <div className="text-xs opacity-80 mt-1">{subtext}</div>}
        </div>
    </div>
);

// ============================================
// PLAYER ROW (BATTING)
// ============================================
const BattingRow = ({ player, rank, isOrangeCap }: { player: PlayerWithTeam; rank: number; isOrangeCap: boolean }) => {
    const sr = player.stats.balls > 0 ? ((player.stats.runs / player.stats.balls) * 100).toFixed(1) : '0.0';
    const avg = player.stats.balls > 0 ? (player.stats.runs / Math.max(1, player.stats.balls / 6)).toFixed(1) : '0.0';

    return (
        <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: rank * 0.03 }}
            className={`transition-colors ${isOrangeCap ? 'bg-orange-50' : 'hover:bg-slate-50'}`}
        >
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    {isOrangeCap ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                            🧢
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-bold">
                            {rank}
                        </div>
                    )}
                    <div>
                        <div className={`font-bold ${isOrangeCap ? 'text-orange-600' : 'text-slate-800'}`}>
                            {player.name}
                        </div>
                        <div className="text-xs text-slate-400">{player.teamName}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 px-3 text-right">
                <span className={`font-display text-xl font-bold ${isOrangeCap ? 'text-orange-600' : 'text-slate-800'}`}>
                    {player.stats.runs}
                </span>
            </td>
            <td className="py-4 px-3 text-right font-mono text-sm text-slate-500">{player.stats.balls}</td>
            <td className="py-4 px-3 text-right font-mono text-sm text-blue-500">{player.stats.fours}</td>
            <td className="py-4 px-3 text-right font-mono text-sm text-purple-500">{player.stats.sixes}</td>
            <td className="py-4 px-3 text-right">
                <span className={`font-mono text-sm px-2 py-1 rounded ${parseFloat(sr) > 150 ? 'bg-green-100 text-green-600' : parseFloat(sr) < 100 ? 'bg-red-100 text-red-500' : 'text-slate-500'}`}>
                    {sr}
                </span>
            </td>
        </motion.tr>
    );
};

// ============================================
// PLAYER ROW (BOWLING)
// ============================================
const BowlingRow = ({ player, rank, isPurpleCap }: { player: PlayerWithTeam; rank: number; isPurpleCap: boolean }) => {
    const econ = player.stats.oversBowled > 0 ? (player.stats.runsConceded / player.stats.oversBowled).toFixed(2) : '0.00';
    const sr = player.stats.wickets > 0 ? ((player.stats.oversBowled * 6) / player.stats.wickets).toFixed(1) : '-';

    return (
        <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: rank * 0.03 }}
            className={`transition-colors ${isPurpleCap ? 'bg-purple-50' : 'hover:bg-slate-50'}`}
        >
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    {isPurpleCap ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                            🧢
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-bold">
                            {rank}
                        </div>
                    )}
                    <div>
                        <div className={`font-bold ${isPurpleCap ? 'text-purple-600' : 'text-slate-800'}`}>
                            {player.name}
                        </div>
                        <div className="text-xs text-slate-400">{player.teamName}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 px-3 text-right">
                <span className={`font-display text-xl font-bold ${isPurpleCap ? 'text-purple-600' : 'text-slate-800'}`}>
                    {player.stats.wickets}
                </span>
            </td>
            <td className="py-4 px-3 text-right font-mono text-sm text-slate-500">{formatOvers(player.stats.oversBowled)}</td>
            <td className="py-4 px-3 text-right font-mono text-sm text-slate-500">{player.stats.runsConceded}</td>
            <td className="py-4 px-3 text-right">
                <span className={`font-mono text-sm px-2 py-1 rounded ${parseFloat(econ) < 6 ? 'bg-green-100 text-green-600' : parseFloat(econ) > 10 ? 'bg-red-100 text-red-500' : 'text-slate-500'}`}>
                    {econ}
                </span>
            </td>
            <td className="py-4 px-3 text-right font-mono text-sm text-slate-400">{sr}</td>
        </motion.tr>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
const PlayerStats = () => {
    const { teams } = useTournament();
    const [activeView, setActiveView] = useState<'batting' | 'bowling'>('batting');
    const [filterTeam, setFilterTeam] = useState<string>('all');

    // Flatten all players with team info
    const allPlayers: PlayerWithTeam[] = teams.flatMap(team =>
        team.players.map(player => ({
            ...player,
            teamName: team.name,
            teamId: team.id
        }))
    );

    // Filter players by team if selected
    const filteredPlayers = filterTeam === 'all'
        ? allPlayers
        : allPlayers.filter(p => p.teamId === filterTeam);

    // Sort for batting (by runs)
    const topBatters = [...filteredPlayers]
        .filter(p => p.stats.runs > 0 || p.stats.balls > 0)
        .sort((a, b) => b.stats.runs - a.stats.runs);

    // Sort for bowling (by wickets, then economy)
    const topBowlers = [...filteredPlayers]
        .filter(p => p.stats.wickets > 0 || p.stats.oversBowled > 0)
        .sort((a, b) => {
            if (b.stats.wickets !== a.stats.wickets) return b.stats.wickets - a.stats.wickets;
            const econA = a.stats.oversBowled > 0 ? a.stats.runsConceded / a.stats.oversBowled : 999;
            const econB = b.stats.oversBowled > 0 ? b.stats.runsConceded / b.stats.oversBowled : 999;
            return econA - econB;
        });

    // Tournament totals
    const totalRuns = allPlayers.reduce((sum, p) => sum + p.stats.runs, 0);
    const totalWickets = allPlayers.reduce((sum, p) => sum + p.stats.wickets, 0);
    const totalFours = allPlayers.reduce((sum, p) => sum + p.stats.fours, 0);
    const totalSixes = allPlayers.reduce((sum, p) => sum + p.stats.sixes, 0);

    const orangeCapHolder = topBatters[0];
    const purpleCapHolder = topBowlers[0];

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link
                        to="/"
                        className="p-2.5 -ml-2 text-slate-400 hover:text-slate-800 transition-colors rounded-xl hover:bg-slate-100"
                    >
                        <ArrowLeft size={22} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-orange-400 to-purple-500">
                            <Trophy size={18} className="text-white" />
                        </div>
                        <span className="font-display font-bold uppercase tracking-[0.15em] text-sm text-slate-700">
                            Player Stats
                        </span>
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl py-8">
                {/* Tournament Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Runs" value={totalRuns} icon={TrendingUp} gradient="from-orange-400 to-orange-600" />
                    <StatCard label="Wickets" value={totalWickets} icon={Target} gradient="from-purple-400 to-purple-600" />
                    <StatCard label="Fours" value={totalFours} icon={Zap} gradient="from-blue-400 to-blue-600" />
                    <StatCard label="Sixes" value={totalSixes} icon={Flame} gradient="from-emerald-400 to-emerald-600" />
                </div>

                {/* Cap Holders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Orange Cap */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-white border-2 border-orange-200 rounded-3xl p-6 shadow-lg"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 to-orange-600" />
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">🧢</div>
                            <div className="flex-1">
                                <div className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Orange Cap</div>
                                <div className="font-display text-2xl font-bold text-slate-800">
                                    {orangeCapHolder?.name || 'No data'}
                                </div>
                                <div className="text-sm text-slate-500">{orangeCapHolder?.teamName}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-display text-4xl font-bold text-orange-500">{orangeCapHolder?.stats.runs || 0}</div>
                                <div className="text-xs text-slate-400">RUNS</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Purple Cap */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-3xl p-6 shadow-lg"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-400 to-purple-600" />
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">🧢</div>
                            <div className="flex-1">
                                <div className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-1">Purple Cap</div>
                                <div className="font-display text-2xl font-bold text-slate-800">
                                    {purpleCapHolder?.name || 'No data'}
                                </div>
                                <div className="text-sm text-slate-500">{purpleCapHolder?.teamName}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-display text-4xl font-bold text-purple-500">{purpleCapHolder?.stats.wickets || 0}</div>
                                <div className="text-xs text-slate-400">WICKETS</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Toggle & Filter */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    {/* View Toggle */}
                    <div className="inline-flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                        <button
                            onClick={() => setActiveView('batting')}
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${activeView === 'batting'
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'text-slate-400 hover:text-slate-700'
                                }`}
                        >
                            Batting
                        </button>
                        <button
                            onClick={() => setActiveView('bowling')}
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${activeView === 'bowling'
                                ? 'bg-purple-500 text-white shadow-md'
                                : 'text-slate-400 hover:text-slate-700'
                                }`}
                        >
                            Bowling
                        </button>
                    </div>

                    {/* Team Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-400" />
                        <select
                            value={filterTeam}
                            onChange={(e) => setFilterTeam(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        >
                            <option value="all">All Teams</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Stats Tables */}
                <AnimatePresence mode="wait">
                    {activeView === 'batting' ? (
                        <motion.div
                            key="batting"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-white">
                                <div className="flex items-center gap-3">
                                    <Award size={20} className="text-orange-500" />
                                    <h3 className="font-display text-lg font-bold text-slate-800 uppercase tracking-wide">Top Batters</h3>
                                </div>
                            </div>

                            {topBatters.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Player</th>
                                                <th className="text-right py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Runs</th>
                                                <th className="text-right py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Balls</th>
                                                <th className="text-right py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">4s</th>
                                                <th className="text-right py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">6s</th>
                                                <th className="text-right py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">SR</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topBatters.map((player, idx) => (
                                                <BattingRow
                                                    key={player.id}
                                                    player={player}
                                                    rank={idx + 1}
                                                    isOrangeCap={idx === 0}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-16 text-center text-slate-400">
                                    <TrendingUp size={48} className="mx-auto mb-4 opacity-30" />
                                    <p>No batting data yet</p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="bowling"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white">
                                <div className="flex items-center gap-3">
                                    <Target size={20} className="text-purple-500" />
                                    <h3 className="font-display text-lg font-bold text-slate-800 uppercase tracking-wide">Top Bowlers</h3>
                                </div>
                            </div>

                            {topBowlers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Player</th>
                                                <th className="text-right py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Wkts</th>
                                                <th className="text-right py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Overs</th>
                                                <th className="text-right py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Runs</th>
                                                <th className="text-right py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Econ</th>
                                                <th className="text-right py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">SR</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topBowlers.map((player, idx) => (
                                                <BowlingRow
                                                    key={player.id}
                                                    player={player}
                                                    rank={idx + 1}
                                                    isPurpleCap={idx === 0}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-16 text-center text-slate-400">
                                    <Target size={48} className="mx-auto mb-4 opacity-30" />
                                    <p>No bowling data yet</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PlayerStats;
