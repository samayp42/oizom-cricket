import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, X, Zap, Target, AlertTriangle } from 'lucide-react';
import { formatOvers } from '../utils/nrr';
import { WicketType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// Score Button Component
const ScoreButton = ({ label, value, color, onClick, span = 1 }: {
    label?: string;
    value?: number;
    color: 'default' | 'blue' | 'green' | 'red' | 'gray';
    onClick: () => void;
    span?: number;
}) => {
    const colorClasses = {
        default: 'bg-slate-800 border-slate-900 text-white hover:bg-slate-700',
        blue: 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-700 text-white shadow-lg shadow-blue-500/30',
        green: 'bg-gradient-to-br from-emerald-500 to-sports-primary border-emerald-700 text-black shadow-lg shadow-emerald-500/30',
        red: 'bg-gradient-to-br from-red-500 to-rose-600 border-red-700 text-white shadow-lg shadow-red-500/30',
        gray: 'bg-slate-700 border-slate-800 text-white hover:bg-slate-600',
    };

    return (
        <motion.button
            whileTap={{ scale: 0.9, y: 2 }}
            onClick={onClick}
            className={`score-btn relative overflow-hidden rounded-2xl border-b-4 active:border-b-0 font-display font-bold text-3xl md:text-4xl py-4 ${colorClasses[color]}`}
            style={{ gridColumn: `span ${span}` }}
        >
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none" />
            <span className="relative">{label || value}</span>
        </motion.button>
    );
};

// Batter Info Card
const BatterCard = ({ player, isStriker, stats }: { player: any; isStriker: boolean; stats: any }) => (
    <motion.div
        className={`p-4 rounded-2xl border-2 flex justify-between items-center transition-all duration-300
      ${isStriker
                ? 'bg-gradient-to-r from-sports-primary/20 to-sports-primary/10 border-sports-primary shadow-lg shadow-sports-primary/20'
                : 'bg-white/5 border-white/10'
            }`}
        animate={isStriker ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
    >
        <div className="flex items-center gap-3">
            {isStriker && (
                <motion.div
                    className="w-2 h-2 rounded-full bg-sports-primary"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
            )}
            <span className={`font-bold text-sm truncate max-w-[100px] ${isStriker ? 'text-white' : 'text-slate-400'}`}>
                {player?.name}{isStriker ? '*' : ''}
            </span>
        </div>
        <div className="flex items-center gap-3">
            <span className={`font-mono text-lg font-bold ${isStriker ? 'text-white' : 'text-slate-400'}`}>
                {stats?.runs || 0}
            </span>
            <span className="text-xs text-slate-500">({stats?.balls || 0})</span>
        </div>
    </motion.div>
);

const Scorer = () => {
    const { activeMatch, teams, recordBall, undoLastBall, endMatch, setNextBowler, isAdmin } = useTournament();
    const navigate = useNavigate();

    // Modal States
    const [showWicketModal, setShowWicketModal] = useState(false);
    const [wicketType, setWicketType] = useState<WicketType | null>(null);
    const [whoOut, setWhoOut] = useState('');
    const [newBatter, setNewBatter] = useState('');

    useEffect(() => {
        if (!activeMatch) navigate('/');
    }, [activeMatch, navigate]);

    if (!activeMatch) return null;

    const currentInnings = activeMatch.innings2 || activeMatch.innings1;
    if (!currentInnings) {
        return (
            <div className="h-screen bg-sports-black flex items-center justify-center">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-sports-primary/20 border-t-sports-primary rounded-full mx-auto mb-6"
                    />
                    <p className="text-white font-tech text-xl">Loading Match...</p>
                </motion.div>
            </div>
        );
    }

    const battingTeam = teams.find(t => t.id === currentInnings.battingTeamId);
    const bowlingTeam = teams.find(t => t.id === currentInnings.bowlingTeamId);
    const striker = battingTeam?.players.find(p => p.id === currentInnings.strikerId);
    const nonStriker = battingTeam?.players.find(p => p.id === currentInnings.nonStrikerId);
    const currentBowler = bowlingTeam?.players.find(p => p.id === currentInnings.currentBowlerId);

    const needsBowler = activeMatch.playStatus === 'waiting_for_bowler';
    const isFreeHit = currentInnings.isFreeHit;

    // Handlers
    const handleScore = (runs: number) => {
        recordBall(activeMatch.id, {
            id: Math.random().toString(),
            overNumber: Math.floor(currentInnings.overs),
            ballInOver: 0,
            bowlerId: currentInnings.currentBowlerId,
            batterId: currentInnings.strikerId,
            runsScored: runs,
            extras: 0,
            extraType: null,
            isWicket: false,
            wicketType: null,
            isValidBall: true
        });
    };

    const handleExtra = (type: 'wide' | 'no-ball') => {
        recordBall(activeMatch.id, {
            id: Math.random().toString(),
            overNumber: Math.floor(currentInnings.overs),
            ballInOver: 0,
            bowlerId: currentInnings.currentBowlerId,
            batterId: currentInnings.strikerId,
            runsScored: 0,
            extras: 1,
            extraType: type,
            isWicket: false,
            wicketType: null,
            isValidBall: false
        });
    };

    const submitWicket = () => {
        if (!wicketType || !whoOut || !newBatter) return;
        recordBall(activeMatch.id, {
            id: Math.random().toString(),
            overNumber: Math.floor(currentInnings.overs),
            ballInOver: 0,
            bowlerId: currentInnings.currentBowlerId,
            batterId: currentInnings.strikerId,
            runsScored: 0,
            extras: 0,
            extraType: null,
            isWicket: true,
            wicketType: wicketType,
            wicketPlayerId: whoOut,
            isValidBall: true
        }, newBatter);
        setShowWicketModal(false);
        setWicketType(null);
        setWhoOut('');
        setNewBatter('');
    };

    return (
        <div className="h-screen bg-gradient-to-b from-slate-900 to-sports-black text-white flex flex-col overflow-hidden font-sans">

            {/* === TOP INFO SECTION === */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex-none bg-sports-surface/80 backdrop-blur-xl p-5 border-b border-white/10 relative"
            >
                {/* Background Glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-sports-primary/20 rounded-full blur-3xl" />
                </div>

                {/* Header Row */}
                <div className="relative flex justify-between items-center mb-5">
                    <motion.button
                        onClick={() => navigate('/')}
                        className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ArrowLeft size={20} />
                    </motion.button>

                    <div className="text-center">
                        <div className="font-tech text-xs uppercase tracking-[0.2em] text-sports-muted">
                            {battingTeam?.name} vs {bowlingTeam?.name}
                        </div>
                    </div>

                    {isAdmin && (
                        <motion.button
                            onClick={() => endMatch(activeMatch.id)}
                            className="px-4 py-2 bg-red-500/10 text-red-400 text-xs font-bold rounded-xl border border-red-500/30 hover:bg-red-500/20 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            END
                        </motion.button>
                    )}
                </div>

                {/* Score Display */}
                <div className="relative flex justify-between items-end mb-4">
                    <div>
                        <motion.div
                            className="score-display text-7xl md:text-8xl text-gradient"
                            key={currentInnings.totalRuns}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            {currentInnings.totalRuns}/{currentInnings.wickets}
                        </motion.div>
                        <div className="font-mono text-sports-primary text-xl">
                            {formatOvers(currentInnings.overs)}
                            <span className="text-slate-500 text-sm ml-2">/ {activeMatch.totalOvers} ov</span>
                        </div>
                    </div>

                    {/* Bowler Info */}
                    <div className="text-right">
                        <div className="text-[10px] text-sports-muted uppercase tracking-widest mb-1">Bowling</div>
                        <div className="text-lg font-bold">{currentBowler?.name}</div>
                        <div className="font-mono text-sm text-sports-muted">
                            {currentBowler?.stats.wickets}-{currentBowler?.stats.runsConceded}
                            <span className="text-xs ml-1">({formatOvers(currentBowler?.stats.oversBowled || 0)})</span>
                        </div>
                    </div>
                </div>

                {/* Batters */}
                <div className="grid grid-cols-2 gap-3">
                    <BatterCard
                        player={striker}
                        isStriker={currentInnings.strikerId === striker?.id}
                        stats={striker?.stats}
                    />
                    <BatterCard
                        player={nonStriker}
                        isStriker={currentInnings.strikerId === nonStriker?.id}
                        stats={nonStriker?.stats}
                    />
                </div>

                {/* Free Hit Banner */}
                <AnimatePresence>
                    {isFreeHit && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-4"
                        >
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center text-xs font-black tracking-[0.3em] py-3 rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2">
                                <Zap size={16} />
                                FREE HIT ACTIVE
                                <Zap size={16} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* === BALL HISTORY TIMELINE === */}
            <div className="flex-1 bg-black/40 overflow-y-auto relative">
                <div className="absolute inset-0 p-4 space-y-3">
                    {currentInnings.history.slice().reverse().map((ball, idx) => (
                        <motion.div
                            key={ball.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="flex gap-4 text-sm border-l-2 border-white/10 pl-4 relative"
                        >
                            <motion.span
                                className={`absolute -left-2 top-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold
                  ${ball.isWicket ? 'bg-red-500 text-white' :
                                        ball.runsScored === 6 ? 'bg-emerald-500 text-white' :
                                            ball.runsScored === 4 ? 'bg-blue-500 text-white' :
                                                'bg-slate-700 text-slate-400'
                                    }`}
                                whileHover={{ scale: 1.2 }}
                            >
                                {ball.isWicket ? 'W' : ball.runsScored}
                            </motion.span>
                            <span className="font-mono text-sports-primary font-bold w-10">
                                {ball.overNumber}.{ball.ballInOver}
                            </span>
                            <span className="text-slate-400 flex-1">{ball.commentary}</span>
                        </motion.div>
                    ))}

                    {currentInnings.history.length === 0 && (
                        <div className="text-center py-16 text-slate-500">
                            <Target size={48} className="mx-auto mb-4 opacity-30" />
                            <p>Waiting for first ball...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* === SCORING CONTROLS === */}
            {isAdmin ? (
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className="flex-none bg-gradient-to-t from-sports-card to-sports-card/90 backdrop-blur-xl border-t border-white/10 p-4 pb-8 safe-area-pb"
                >
                    <div className="grid grid-cols-4 gap-3 h-auto max-h-[280px]">
                        {/* Row 1: 0, 1, 2, 4 */}
                        <ScoreButton value={0} color="default" onClick={() => handleScore(0)} />
                        <ScoreButton value={1} color="default" onClick={() => handleScore(1)} />
                        <ScoreButton value={2} color="default" onClick={() => handleScore(2)} />
                        <ScoreButton value={4} color="blue" onClick={() => handleScore(4)} />

                        {/* Row 2: WD, 3, NB, 6 */}
                        <ScoreButton label="WD" color="gray" onClick={() => handleExtra('wide')} />
                        <ScoreButton value={3} color="default" onClick={() => handleScore(3)} />
                        <ScoreButton label="NB" color="gray" onClick={() => handleExtra('no-ball')} />
                        <ScoreButton value={6} color="green" onClick={() => handleScore(6)} />

                        {/* Row 3: UNDO, OUT */}
                        <ScoreButton label="↩" span={2} color="gray" onClick={() => undoLastBall(activeMatch.id)} />
                        <ScoreButton label="OUT" span={2} color="red" onClick={() => setShowWicketModal(true)} />
                    </div>
                </motion.div>
            ) : (
                <div className="p-6 bg-sports-card text-center text-sports-muted font-tech uppercase tracking-widest border-t border-white/10">
                    View Only Mode
                </div>
            )}

            {/* === MODALS === */}
            <AnimatePresence>
                {/* Next Bowler Modal */}
                {needsBowler && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="w-full max-w-sm"
                        >
                            <h2 className="text-4xl font-display font-bold text-white text-center mb-8">NEXT BOWLER</h2>
                            <div className="grid gap-3 max-h-[50vh] overflow-y-auto pr-2">
                                {bowlingTeam?.players.filter(p => p.id !== currentInnings.currentBowlerId).map(p => (
                                    <motion.button
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        key={p.id}
                                        onClick={() => setNextBowler(activeMatch.id, p.id)}
                                        className="p-5 glass-card rounded-2xl text-left font-bold border border-white/10 hover:border-sports-primary/50 hover:bg-sports-primary/10 transition-all"
                                    >
                                        <div className="text-white text-lg">{p.name}</div>
                                        <div className="text-xs text-sports-muted mt-1 font-mono">
                                            {p.stats.wickets}-{p.stats.runsConceded} ({formatOvers(p.stats.oversBowled)})
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Wicket Modal */}
                {showWicketModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-xl sm:p-4"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-gradient-to-b from-sports-card to-slate-900 w-full max-w-md rounded-t-[32px] sm:rounded-3xl border border-white/10 p-6 shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-tech font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                                    <AlertTriangle size={20} />
                                    Wicket Fall
                                </h2>
                                <motion.button
                                    onClick={() => setShowWicketModal(false)}
                                    className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                                    whileHover={{ scale: 1.05, rotate: 90 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>

                            <div className="space-y-6">
                                {/* Dismissed Player */}
                                <div>
                                    <label className="text-[10px] text-sports-muted uppercase tracking-[0.2em] font-bold mb-3 block">
                                        Dismissed Player
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[currentInnings.strikerId, currentInnings.nonStrikerId].map(pid => {
                                            const p = battingTeam?.players.find(pl => pl.id === pid);
                                            return (
                                                <motion.button
                                                    key={pid}
                                                    onClick={() => setWhoOut(pid)}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`p-4 rounded-xl border-2 transition-all text-left
                            ${whoOut === pid
                                                            ? 'bg-red-600/20 border-red-500 text-white'
                                                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className="text-[10px] uppercase opacity-70 mb-1">
                                                        {pid === currentInnings.strikerId ? 'Striker' : 'Non-Striker'}
                                                    </div>
                                                    <div className="font-bold">{p?.name}</div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Dismissal Method */}
                                <div>
                                    <label className="text-[10px] text-sports-muted uppercase tracking-[0.2em] font-bold mb-3 block">
                                        Dismissal Method
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {['bowled', 'caught', 'run-out', 'lbw', 'stumped'].map(t => {
                                            const disabled = isFreeHit && t !== 'run-out';
                                            return (
                                                <motion.button
                                                    key={t}
                                                    disabled={disabled}
                                                    onClick={() => setWicketType(t as WicketType)}
                                                    whileHover={!disabled ? { scale: 1.05 } : {}}
                                                    whileTap={!disabled ? { scale: 0.95 } : {}}
                                                    className={`px-4 py-2.5 text-sm uppercase font-bold rounded-xl border transition-all
                            ${wicketType === t
                                                            ? 'bg-white text-black border-white shadow-lg'
                                                            : disabled
                                                                ? 'opacity-20 cursor-not-allowed border-white/10'
                                                                : 'bg-white/5 border-white/20 text-slate-400 hover:border-white/40'
                                                        }`}
                                                >
                                                    {t}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Incoming Batter */}
                                <div>
                                    <label className="text-[10px] text-sports-muted uppercase tracking-[0.2em] font-bold mb-3 block">
                                        Incoming Batter
                                    </label>
                                    <select
                                        className="w-full bg-black/50 border-2 border-white/20 p-4 rounded-xl text-white outline-none focus:border-sports-primary appearance-none cursor-pointer"
                                        value={newBatter}
                                        onChange={e => setNewBatter(e.target.value)}
                                    >
                                        <option value="">Select Player...</option>
                                        {battingTeam?.players.filter(p => !currentInnings.battingOrder.includes(p.id)).map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Confirm Button */}
                                <motion.button
                                    onClick={submitWicket}
                                    disabled={!wicketType || !whoOut || !newBatter}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl uppercase tracking-widest shadow-lg shadow-red-900/30 transition-all"
                                >
                                    Confirm Wicket
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Scorer;