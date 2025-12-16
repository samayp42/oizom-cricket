import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Zap, Target, AlertTriangle, Activity, Radio, BarChart2 } from 'lucide-react';
import { formatOvers } from '../utils/nrr';
import { WicketType, Player } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// PREMIUM SCORE BUTTON
// ============================================
const ScoreButton = ({ label, value, variant, onClick, span = 1 }: {
    label?: string;
    value?: number;
    variant: 'default' | 'boundary' | 'six' | 'wicket' | 'extra' | 'action';
    onClick: () => void;
    span?: number;
}) => {
    const variantClasses = {
        default: 'score-btn score-btn-run',
        boundary: 'score-btn score-btn-boundary',
        six: 'score-btn score-btn-six',
        wicket: 'score-btn score-btn-wicket',
        extra: 'score-btn score-btn-extra',
        action: 'score-btn score-btn-extra text-xl',
    };

    return (
        <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onClick}
            className={`${variantClasses[variant]} min-h-[72px]`}
            style={{ gridColumn: `span ${span}` }}
        >
            <span className="relative z-10">{label || value}</span>
        </motion.button>
    );
};

// ============================================
// BATTER INFO CARD
// ============================================
const BatterCard = ({ player, isStriker, stats }: { player: any; isStriker: boolean; stats: any }) => (
    <motion.div
        className={`relative p-5 rounded-2xl border-2 transition-all duration-300 overflow-hidden
            ${isStriker
                ? 'bg-gradient-to-r from-cricket-primary/10 to-cricket-primary/5 border-cricket-primary'
                : 'bg-white border-cricket-border'
            }`}
        animate={isStriker ? { boxShadow: ['0 0 0 rgba(22, 163, 74, 0)', '0 0 20px rgba(22, 163, 74, 0.15)', '0 0 0 rgba(22, 163, 74, 0)'] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
    >
        {/* Striker Indicator */}
        {isStriker && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cricket-primary via-cricket-primaryLight to-cricket-primary" />
        )}

        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                {isStriker && (
                    <motion.div
                        className="w-2.5 h-2.5 rounded-full bg-cricket-primary"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                )}
                <div>
                    <div className={`font-bold text-sm ${isStriker ? 'text-cricket-textPrimary' : 'text-cricket-textSecondary'}`}>
                        {player?.name}{isStriker ? ' *' : ''}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-cricket-textMuted mt-0.5">
                        {isStriker ? 'On Strike' : 'Non-Striker'}
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className={`font-display text-3xl font-bold ${isStriker ? 'text-cricket-primary' : 'text-cricket-textSecondary'}`}>
                    {stats?.runs || 0}
                </div>
                <div className="text-xs text-cricket-textMuted font-mono">
                    ({stats?.balls || 0}) SR {stats?.balls > 0 ? ((stats?.runs / stats?.balls) * 100).toFixed(0) : '0'}
                </div>
            </div>
        </div>
    </motion.div>
);

// ============================================
// BOWLER INFO BAR
// ============================================
const BowlerBar = ({ bowler, formatOvers }: { bowler: any, formatOvers: (o: number) => string }) => (
    <div className="flex items-center justify-between px-5 py-4 rounded-2xl bg-cricket-bgAlt border border-cricket-border">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cricket-secondary/10 flex items-center justify-center">
                <Activity size={18} className="text-cricket-secondary" />
            </div>
            <div>
                <div className="text-[10px] uppercase tracking-wider text-cricket-textMuted mb-0.5">Bowling</div>
                <div className="font-bold text-cricket-textPrimary">{bowler?.name}</div>
            </div>
        </div>
        <div className="flex items-center gap-6 text-right">
            <div>
                <div className="font-display text-2xl font-bold text-cricket-secondary">{bowler?.stats.wickets}-{bowler?.stats.runsConceded}</div>
                <div className="text-xs text-cricket-textMuted font-mono">{formatOvers(bowler?.stats.oversBowled || 0)} ov</div>
            </div>
        </div>
    </div>
);

// ============================================
// COMPACT BOWLING SCORECARD
// ============================================
const BowlingScorecard = ({ bowlers, currentBowlerId }: { bowlers: Player[], currentBowlerId: string }) => {
    const getEcon = (runs: number, overs: number) => overs > 0 ? (runs / overs).toFixed(2) : '0.00';

    // Filter and sort bowlers who have bowled
    const activeBowlers = bowlers
        .filter(p => p.stats.oversBowled > 0 || p.stats.runsConceded > 0 || p.id === currentBowlerId)
        .sort((a, b) => b.stats.wickets - a.stats.wickets || a.stats.runsConceded - b.stats.runsConceded);

    if (activeBowlers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-cricket-textMuted">
                <Activity size={40} className="mb-4 opacity-30" />
                <p className="text-sm">No bowling figures yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-cricket-textMuted border-b border-cricket-border">
                <div className="flex-1">Bowler</div>
                <div className="w-12 text-center">O</div>
                <div className="w-12 text-center">R</div>
                <div className="w-12 text-center">W</div>
                <div className="w-14 text-center">Econ</div>
            </div>

            {/* Bowler Rows */}
            {activeBowlers.map((bowler, idx) => {
                const isCurrent = bowler.id === currentBowlerId;
                const econ = getEcon(bowler.stats.runsConceded, bowler.stats.oversBowled);

                return (
                    <motion.div
                        key={bowler.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-center px-4 py-3 rounded-xl transition-all ${isCurrent
                            ? 'bg-cricket-secondary/10 border border-cricket-secondary/30'
                            : 'bg-white border border-cricket-border hover:border-cricket-secondary/30'
                            }`}
                    >
                        <div className="flex-1 flex items-center gap-2">
                            {isCurrent && (
                                <motion.div
                                    className="w-2 h-2 rounded-full bg-cricket-secondary"
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                            )}
                            <span className={`font-semibold text-sm ${isCurrent ? 'text-cricket-secondary' : 'text-cricket-textPrimary'}`}>
                                {bowler.name}
                                {isCurrent && <span className="text-cricket-secondary"> *</span>}
                            </span>
                        </div>
                        <div className="w-12 text-center font-mono text-sm text-cricket-textSecondary">
                            {formatOvers(bowler.stats.oversBowled)}
                        </div>
                        <div className="w-12 text-center font-mono text-sm text-cricket-textSecondary">
                            {bowler.stats.runsConceded}
                        </div>
                        <div className="w-12 text-center font-mono text-sm font-bold text-cricket-secondary">
                            {bowler.stats.wickets}
                        </div>
                        <div className="w-14 text-center">
                            <span className={`font-mono text-xs px-2 py-1 rounded-md ${parseFloat(econ) < 6
                                ? 'bg-cricket-primary/10 text-cricket-primary'
                                : parseFloat(econ) > 10
                                    ? 'bg-cricket-wicket/10 text-cricket-wicket'
                                    : 'text-cricket-textMuted'
                                }`}>
                                {econ}
                            </span>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

// ============================================
// BALL HISTORY ITEM
// ============================================
const BallHistoryItem = ({ ball, idx }: { ball: any, idx: number }) => {
    const getBallColor = () => {
        if (ball.isWicket) return 'from-cricket-wicket to-red-600';
        if (ball.runsScored === 6) return 'from-cricket-primary to-cricket-primaryLight';
        if (ball.runsScored === 4) return 'from-cricket-boundary to-blue-600';
        if (ball.extraType) return 'from-cricket-six to-amber-500';
        return 'from-gray-400 to-gray-500';
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.02 }}
            className="flex gap-4 items-start pl-6 relative"
        >
            {/* Timeline */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-cricket-border to-transparent" />

            {/* Ball Indicator */}
            <motion.div
                className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-gradient-to-br ${getBallColor()} flex items-center justify-center text-[9px] font-bold text-white shadow-lg`}
                whileHover={{ scale: 1.2 }}
            >
                {ball.isWicket ? 'W' : ball.runsScored}
            </motion.div>

            {/* Content */}
            <div className="flex-1 pb-4">
                <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm text-cricket-primary font-bold">
                        {ball.overNumber}.{ball.ballInOver}
                    </span>
                    {ball.runsScored === 6 && (
                        <span className="text-[10px] font-bold text-cricket-primary uppercase tracking-wider px-2 py-0.5 rounded-md bg-cricket-primary/10">SIX!</span>
                    )}
                    {ball.runsScored === 4 && (
                        <span className="text-[10px] font-bold text-cricket-boundary uppercase tracking-wider px-2 py-0.5 rounded-md bg-cricket-boundary/10">FOUR!</span>
                    )}
                    {ball.isWicket && (
                        <span className="text-[10px] font-bold text-cricket-wicket uppercase tracking-wider px-2 py-0.5 rounded-md bg-cricket-wicket/10">WICKET!</span>
                    )}
                </div>
                <p className="text-sm text-cricket-textSecondary leading-relaxed">{ball.commentary}</p>
            </div>
        </motion.div>
    );
};

// ============================================
// MAIN SCORER COMPONENT
// ============================================
const Scorer = () => {
    const { activeMatch, teams, recordBall, undoLastBall, endMatch, abandonMatch, setNextBowler, isAdmin } = useTournament();
    const navigate = useNavigate();

    // Modal States
    const [showWicketModal, setShowWicketModal] = useState(false);
    const [wicketType, setWicketType] = useState<WicketType | null>(null);
    const [whoOut, setWhoOut] = useState('');
    const [newBatter, setNewBatter] = useState('');

    // View Toggle State
    const [activeView, setActiveView] = useState<'commentary' | 'bowling'>('commentary');

    useEffect(() => {
        if (!activeMatch) navigate('/');
        // Redirect to setup when innings break - need to select batters/bowler for 2nd innings
        if (activeMatch?.status === 'innings_break') {
            navigate('/setup');
        }
        // Redirect to home when match is completed
        if (activeMatch?.status === 'completed') {
            navigate('/');
        }
    }, [activeMatch, activeMatch?.status, navigate]);

    if (!activeMatch) return null;

    const currentInnings = activeMatch.innings2 || activeMatch.innings1;

    // Show a waiting state if innings hasn't started yet
    if (!currentInnings) {
        return (
            <div className="h-screen bg-cricket-bg flex items-center justify-center">
                <motion.div
                    className="text-center p-8"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-cricket-primary/20 border-t-cricket-primary rounded-full mx-auto mb-6"
                    />
                    <p className="text-cricket-textPrimary font-display text-xl uppercase tracking-widest mb-2">Waiting for Match to Start</p>
                    <p className="text-cricket-textMuted text-sm">Please complete the toss and select the playing XI</p>
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
        <div className="h-screen bg-cricket-bg text-cricket-textPrimary flex flex-col overflow-hidden font-sans">

            {/* === HEADER SECTION === */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex-none relative overflow-hidden bg-white border-b border-cricket-border"
            >
                {/* Green gradient bar */}
                <div className="h-1 bg-gradient-to-r from-cricket-primary via-cricket-primaryLight to-cricket-secondary" />

                {/* Background Effects */}
                <div className="absolute inset-0 bg-mesh-cricket opacity-30" />

                {/* Top Bar */}
                <div className="relative px-4 py-3 flex justify-between items-center border-b border-cricket-border">
                    <motion.button
                        onClick={() => navigate('/')}
                        className="p-2.5 rounded-xl bg-cricket-bgAlt hover:bg-cricket-primary/10 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ArrowLeft size={20} className="text-cricket-textSecondary" />
                    </motion.button>

                    <div className="flex items-center gap-3">
                        <span className="live-dot" />
                        <span className="font-display text-sm uppercase tracking-[0.15em] text-cricket-textSecondary">
                            {battingTeam?.name} vs {bowlingTeam?.name}
                        </span>
                    </div>

                    {isAdmin && (
                        <div className="flex gap-2">
                            <motion.button
                                onClick={() => {
                                    if (confirm("Are you sure you want to ABANDON this match? It will be marked as 'No Result' and 5 points will be awarded to both teams.")) {
                                        abandonMatch(activeMatch.id);
                                        navigate('/');
                                    }
                                }}
                                className="px-3 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider border border-slate-200 hover:bg-slate-200 hover:text-slate-700 transition-colors flex items-center gap-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <AlertTriangle size={14} />
                                <span className="hidden sm:inline">No Result</span>
                            </motion.button>
                            <motion.button
                                onClick={() => endMatch(activeMatch.id)}
                                className="px-4 py-2 rounded-xl bg-cricket-wicket/10 text-cricket-wicket text-xs font-bold uppercase tracking-wider border border-cricket-wicket/30 hover:bg-cricket-wicket/20 transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                End Match
                            </motion.button>
                        </div>
                    )}
                </div>

                {/* Score Display */}
                <div className="relative px-4 py-6 md:px-6 md:py-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <motion.div
                                className="score-mega text-6xl md:text-8xl"
                                key={currentInnings.totalRuns}
                                initial={{ scale: 1.1, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                {currentInnings.totalRuns}/{currentInnings.wickets}
                            </motion.div>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="font-mono text-xl text-cricket-primary font-bold">
                                    {formatOvers(currentInnings.overs)} ov
                                </span>
                                <span className="w-1 h-1 rounded-full bg-cricket-textMuted" />
                                <span className="text-cricket-textMuted">
                                    CRR {currentInnings.overs > 0 ? (currentInnings.totalRuns / currentInnings.overs).toFixed(2) : '0.00'}
                                </span>
                            </div>
                        </div>

                        {/* Target Info (2nd Innings) */}
                        {activeMatch.innings2 && activeMatch.innings1 && (
                            <div className="text-right">
                                <div className="text-cricket-textMuted text-sm mb-1">Target</div>
                                <div className="font-display text-3xl font-bold text-cricket-primary">
                                    {activeMatch.innings1.totalRuns + 1}
                                </div>
                                <div className="text-cricket-wicket text-sm font-mono">
                                    Need {activeMatch.innings1.totalRuns + 1 - activeMatch.innings2.totalRuns} runs
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Batters & Bowler */}
                <div className="relative px-6 pb-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <BatterCard player={striker} isStriker={true} stats={striker?.stats} />
                        <BatterCard player={nonStriker} isStriker={false} stats={nonStriker?.stats} />
                    </div>
                    <BowlerBar bowler={currentBowler} formatOvers={formatOvers} />
                </div>

                {/* Free Hit Banner */}
                <AnimatePresence>
                    {isFreeHit && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 text-white text-center text-sm font-black tracking-[0.3em] py-3 flex items-center justify-center gap-3"
                        >
                            <Zap size={18} />
                            FREE HIT ACTIVE
                            <Zap size={18} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* === VIEW TOGGLE & CONTENT === */}
            <div className="flex-1 overflow-hidden flex flex-col bg-cricket-bgAlt">
                {/* Tab Toggle */}
                <div className="flex-none flex border-b border-cricket-border bg-white">
                    <button
                        onClick={() => setActiveView('commentary')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all ${activeView === 'commentary'
                            ? 'text-cricket-primary border-b-2 border-cricket-primary bg-cricket-primary/5'
                            : 'text-cricket-textMuted hover:text-cricket-textSecondary'
                            }`}
                    >
                        <Radio size={14} />
                        Commentary
                    </button>
                    <button
                        onClick={() => setActiveView('bowling')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all ${activeView === 'bowling'
                            ? 'text-cricket-secondary border-b-2 border-cricket-secondary bg-cricket-secondary/5'
                            : 'text-cricket-textMuted hover:text-cricket-textSecondary'
                            }`}
                    >
                        <BarChart2 size={14} />
                        Bowling
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto relative">
                    <AnimatePresence mode="wait">
                        {activeView === 'commentary' ? (
                            <motion.div
                                key="commentary"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="absolute inset-0 p-6 space-y-1 overflow-y-auto"
                            >
                                {currentInnings.history.slice().reverse().map((ball, idx) => (
                                    <BallHistoryItem key={ball.id} ball={ball} idx={idx} />
                                ))}

                                {currentInnings.history.length === 0 && (
                                    <div className="text-center py-20 text-cricket-textMuted">
                                        <Target size={56} className="mx-auto mb-6 opacity-30" />
                                        <p className="font-display text-xl uppercase tracking-widest">Waiting for first ball...</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="bowling"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="absolute inset-0 p-4 overflow-y-auto"
                            >
                                <BowlingScorecard
                                    bowlers={bowlingTeam?.players || []}
                                    currentBowlerId={currentInnings.currentBowlerId}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* === SCORING CONTROLS === */}
            {isAdmin ? (
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className="flex-none bg-white border-t border-cricket-border p-4 pb-8 safe-area-pb"
                >
                    <div className="space-y-3">
                        {/* Main Scoring Grid */}
                        <div className="grid grid-cols-4 gap-3">
                            {/* Row 1 */}
                            <ScoreButton value={0} variant="default" onClick={() => handleScore(0)} />
                            <ScoreButton value={1} variant="default" onClick={() => handleScore(1)} />
                            <ScoreButton value={2} variant="default" onClick={() => handleScore(2)} />
                            <ScoreButton value={4} variant="boundary" onClick={() => handleScore(4)} />

                            {/* Row 2 */}
                            <ScoreButton label="WD" variant="extra" onClick={() => handleExtra('wide')} />
                            <ScoreButton value={3} variant="default" onClick={() => handleScore(3)} />
                            <ScoreButton label="NB" variant="extra" onClick={() => handleExtra('no-ball')} />
                            <ScoreButton value={6} variant="six" onClick={() => handleScore(6)} />

                            {/* Row 3 */}
                            <ScoreButton label="OUT" span={4} variant="wicket" onClick={() => setShowWicketModal(true)} />
                        </div>

                        {/* Undo Button - Separate and Prominent */}
                        <motion.button
                            onClick={() => undoLastBall(activeMatch.id)}
                            disabled={!currentInnings || currentInnings.history.length === 0}
                            whileTap={{ scale: 0.95 }}
                            className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${currentInnings && currentInnings.history.length > 0
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Undo Last Ball
                            {currentInnings && currentInnings.history.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                    {currentInnings.history.length}
                                </span>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            ) : (
                <div className="p-6 bg-white text-center text-cricket-textMuted font-display uppercase tracking-[0.2em] text-sm border-t border-cricket-border">
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
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="w-full max-w-md bg-white rounded-3xl p-8 shadow-premium"
                        >
                            <h2 className="text-3xl font-display font-bold text-cricket-textPrimary text-center mb-2 uppercase tracking-wide">
                                Select Bowler
                            </h2>
                            <p className="text-sm text-cricket-textMuted text-center mb-6">Max 2 overs per bowler</p>
                            <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-2">
                                {bowlingTeam?.players
                                    .filter(p => p.id !== currentInnings.currentBowlerId)
                                    .map(p => {
                                        // Calculate overs bowled in THIS innings from history
                                        const ballsBowled = currentInnings.history.filter(
                                            ball => ball.bowlerId === p.id && ball.isValidBall
                                        ).length;
                                        const oversInThisInnings = Math.floor(ballsBowled / 6);
                                        const ballsInCurrentOver = ballsBowled % 6;
                                        const isLocked = oversInThisInnings >= 2;

                                        return (
                                            <motion.button
                                                whileHover={!isLocked ? { scale: 1.02, x: 4 } : {}}
                                                whileTap={!isLocked ? { scale: 0.98 } : {}}
                                                key={p.id}
                                                onClick={() => !isLocked && setNextBowler(activeMatch.id, p.id)}
                                                disabled={isLocked}
                                                className={`p-5 border-2 rounded-2xl text-left font-bold transition-all ${isLocked
                                                    ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                                                    : 'bg-white border-cricket-border hover:border-cricket-secondary'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <div className={`text-lg ${isLocked ? 'text-gray-400' : 'text-cricket-textPrimary'}`}>
                                                            {p.name}
                                                        </div>
                                                        <div className="text-xs text-cricket-textMuted mt-1 font-mono">
                                                            {oversInThisInnings}.{ballsInCurrentOver} ov bowled this match
                                                        </div>
                                                    </div>
                                                    {isLocked ? (
                                                        <span className="text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-500 uppercase">
                                                            Quota Done
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-mono px-2 py-1 rounded bg-cricket-primary/10 text-cricket-primary">
                                                            {2 - oversInThisInnings} ov left
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
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
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto shadow-premium"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-display font-bold text-cricket-wicket uppercase tracking-widest flex items-center gap-3">
                                    <AlertTriangle size={24} />
                                    Wicket Fall
                                </h2>
                                <motion.button
                                    onClick={() => setShowWicketModal(false)}
                                    className="p-2.5 rounded-xl bg-cricket-bgAlt hover:bg-cricket-wicket/10 transition-colors"
                                    whileHover={{ scale: 1.05, rotate: 90 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <X size={20} className="text-cricket-textSecondary" />
                                </motion.button>
                            </div>

                            <div className="space-y-6">
                                {/* Dismissed Player */}
                                <div>
                                    <label className="text-[11px] text-cricket-textMuted uppercase tracking-[0.2em] font-bold mb-3 block">
                                        Who's Out?
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
                                                            ? 'bg-cricket-wicket/10 border-cricket-wicket text-cricket-wicket'
                                                            : 'bg-white border-cricket-border text-cricket-textSecondary hover:border-cricket-wicket/50'
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
                                    <label className="text-[11px] text-cricket-textMuted uppercase tracking-[0.2em] font-bold mb-3 block">
                                        Dismissal Type
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
                                                            ? 'bg-cricket-textPrimary text-white border-cricket-textPrimary'
                                                            : disabled
                                                                ? 'opacity-20 cursor-not-allowed border-cricket-border'
                                                                : 'bg-white border-cricket-border text-cricket-textSecondary hover:border-cricket-textPrimary'
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
                                    <label className="text-[11px] text-cricket-textMuted uppercase tracking-[0.2em] font-bold mb-3 block">
                                        New Batter
                                    </label>
                                    <select
                                        className="select-cricket"
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
                                    className="w-full bg-gradient-to-r from-cricket-wicket to-red-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-display font-bold py-4 rounded-xl uppercase tracking-widest text-lg shadow-lg transition-all"
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