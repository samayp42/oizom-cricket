import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Users, Coins, CheckCircle, ArrowLeft, ArrowRight, Zap, Shield, Target, Play, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// WIZARD WRAPPER
// ============================================
const WizardWrapper = ({ step, totalSteps, title, subtitle, children, onBack }: {
    step: number;
    totalSteps: number;
    title: string;
    subtitle: string;
    children: React.ReactNode;
    onBack?: () => void;
}) => (
    <div className="min-h-screen bg-cricket-bg flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-mesh-cricket" />
        <div className="orb-green w-[600px] h-[600px] -top-[300px] -right-[200px] opacity-40" />
        <div className="orb-lime w-[500px] h-[500px] -bottom-[200px] -left-[200px] opacity-30" />

        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            className="w-full max-w-2xl relative z-10"
        >
            <div className="bg-white rounded-[32px] overflow-hidden border border-cricket-border shadow-premium relative">
                {/* Top Accent Bar */}
                <div className="h-2 bg-gradient-to-r from-cricket-primary via-cricket-primaryLight to-cricket-secondary" />

                {/* Progress Bar */}
                <div className="px-8 pt-8">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-cricket-textMuted">
                            Step {step} of {totalSteps}
                        </span>
                        {onBack && (
                            <motion.button
                                onClick={onBack}
                                className="text-cricket-textMuted hover:text-cricket-wicket text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
                                whileHover={{ x: -4 }}
                            >
                                <ArrowLeft size={14} />
                                Cancel
                            </motion.button>
                        )}
                    </div>
                    <div className="h-2 bg-cricket-bgAlt rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-cricket-primary to-cricket-primaryLight"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / totalSteps) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-10">
                    <div className="text-center mb-10">
                        <motion.h1
                            key={title}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-4xl md:text-5xl font-display font-bold text-cricket-textPrimary uppercase tracking-wide mb-3"
                        >
                            {title}
                        </motion.h1>
                        <motion.p
                            key={subtitle}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-cricket-textMuted text-lg"
                        >
                            {subtitle}
                        </motion.p>
                    </div>
                    {children}
                </div>
            </div>
        </motion.div>
    </div>
);

// ============================================
// SELECT CARD (for team selection)
// ============================================
const SelectCard = ({ team, selected, onClick, disabled }: { team: any; selected: boolean; onClick: () => void; disabled: boolean }) => (
    <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        className={`w-full p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group
            ${selected
                ? 'bg-cricket-primary/10 border-cricket-primary text-cricket-textPrimary'
                : disabled
                    ? 'bg-cricket-bgAlt border-cricket-border opacity-40 cursor-not-allowed'
                    : 'bg-white border-cricket-border hover:border-cricket-primary/50 text-cricket-textSecondary hover:text-cricket-textPrimary'
            }`}
    >
        {/* Hover Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br from-cricket-primary/5 to-transparent opacity-0 transition-opacity ${!disabled && 'group-hover:opacity-100'}`} />

        <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg
                    ${selected ? 'bg-cricket-primary text-white' : 'bg-cricket-bgAlt text-cricket-textSecondary border border-cricket-border'}`}>
                    {team.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                    <div className="font-bold text-lg">{team.name}</div>
                    <div className="text-xs text-cricket-textMuted font-mono">
                        {team.players.length} Players • Group {team.group}
                    </div>
                </div>
            </div>
            {selected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 rounded-full bg-cricket-primary flex items-center justify-center"
                >
                    <CheckCircle size={18} className="text-white" />
                </motion.div>
            )}
        </div>
    </motion.button>
);

// ============================================
// TOSS CHOICE BUTTON
// ============================================
const TossButton = ({ label, icon: Icon, selected, onClick }: { label: string; icon: any; selected: boolean; onClick: () => void }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className={`flex-1 p-6 rounded-2xl border-2 text-center transition-all relative overflow-hidden
            ${selected
                ? 'bg-gradient-to-br from-cricket-primary/10 to-cricket-primary/5 border-cricket-primary'
                : 'bg-white border-cricket-border hover:border-cricket-primary/50'
            }`}
    >
        <motion.div
            animate={selected ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
            className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center
                ${selected ? 'bg-cricket-primary' : 'bg-cricket-bgAlt border border-cricket-border'}`}
        >
            <Icon size={28} className={selected ? 'text-white' : 'text-cricket-textSecondary'} />
        </motion.div>
        <span className={`font-display text-xl font-bold uppercase tracking-wider ${selected ? 'text-cricket-primary' : 'text-cricket-textMuted'}`}>
            {label}
        </span>
    </motion.button>
);

// ============================================
// PLAYER CHECK BUTTON
// ============================================
const PlayerCheckButton = ({ player, checked, onClick }: { player: any; checked: boolean; onClick: () => void }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4
            ${checked
                ? 'bg-cricket-primary/10 border-cricket-primary/50 text-cricket-textPrimary'
                : 'bg-white border-cricket-border text-cricket-textSecondary hover:border-cricket-primary/30'
            }`}
    >
        <motion.div
            animate={checked ? { scale: 1 } : { scale: 0.8 }}
            className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors
                ${checked ? 'bg-cricket-primary border-cricket-primary' : 'border-cricket-border'}`}
        >
            {checked && <CheckCircle size={14} className="text-white" />}
        </motion.div>
        <div className="flex-1">
            <div className="flex items-center gap-2">
                <span className="font-bold">{player.name}</span>
                {player.role === 'captain' && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 uppercase">C</span>
                )}
                {player.role === 'vice-captain' && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cricket-primary/10 text-cricket-primary uppercase">VC</span>
                )}
            </div>
        </div>
        <span className={`text-xs font-mono px-2 py-1 rounded-lg 
            ${player.gender === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
            {player.gender || 'M'}
        </span>
    </motion.button>
);

// ============================================
// MAIN MATCH SETUP COMPONENT
// ============================================
const MatchSetup = () => {
    const { teams, createMatch, activeMatch, updateMatchToss, startInnings } = useTournament();
    const navigate = useNavigate();
    const [teamA, setTeamA] = useState('');
    const [teamB, setTeamB] = useState('');
    const [overs, setOvers] = useState(6);
    const [knockoutStage, setKnockoutStage] = useState<'SF1' | 'SF2' | 'FINAL' | undefined>(undefined);
    const [tossWinner, setTossWinner] = useState('');
    const [tossChoice, setTossChoice] = useState<'bat' | 'bowl' | ''>('');
    const [lineup1, setLineup1] = useState<string[]>([]);
    const [lineup2, setLineup2] = useState<string[]>([]);
    const [striker, setStriker] = useState('');
    const [nonStriker, setNonStriker] = useState('');
    const [openingBowler, setOpeningBowler] = useState('');

    // Determine current step
    const step = !activeMatch ? 1 : activeMatch.status === 'toss' ? 2 : activeMatch.status === 'scheduled' || activeMatch.status === 'innings_break' ? 3 : 4;

    // Auto-redirect to scorer when match is live (step 4)
    React.useEffect(() => {
        if (step === 4 && activeMatch) {
            const timer = setTimeout(() => navigate('/scorer'), 100);
            return () => clearTimeout(timer);
        }
    }, [step, activeMatch, navigate]);

    // Handlers
    const handleCreate = () => {
        if (teamA && teamB && teamA !== teamB) {
            createMatch(teamA, teamB, overs, knockoutStage);
        }
    };

    const handleToss = () => {
        if (activeMatch && tossWinner && tossChoice) {
            updateMatchToss(activeMatch.id, tossWinner, tossChoice);
        }
    };

    const handleLineup = () => {
        if (activeMatch && striker && nonStriker && openingBowler) {
            // Start innings with selected striker, non-striker, and opening bowler
            startInnings(activeMatch.id, striker, nonStriker, openingBowler);
        }
    };

    // Step 1: Match Configuration
    if (step === 1) {
        return (
            <WizardWrapper step={1} totalSteps={3} title="Match Setup" subtitle="Configure teams and format" onBack={() => navigate('/admin')}>
                <div className="space-y-8">
                    {/* Team Selection */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-cricket-textMuted">
                            <Users size={14} />
                            Select Teams
                        </label>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-cricket-textMuted mb-2">Team 1</div>
                                <div className="space-y-3">
                                    {teams.map(t => (
                                        <SelectCard
                                            key={t.id}
                                            team={t}
                                            selected={teamA === t.id}
                                            disabled={teamB === t.id}
                                            onClick={() => setTeamA(t.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-cricket-textMuted mb-2">Team 2</div>
                                <div className="space-y-3">
                                    {teams.map(t => (
                                        <SelectCard
                                            key={t.id}
                                            team={t}
                                            selected={teamB === t.id}
                                            disabled={teamA === t.id}
                                            onClick={() => setTeamB(t.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Overs */}
                    <div>
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-cricket-textMuted mb-4">
                            <Clock size={14} />
                            Match Format
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {[4, 5, 6, 8, 10, 12, 15, 20].map(o => (
                                <motion.button
                                    key={o}
                                    onClick={() => setOvers(o)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`w-16 h-16 rounded-2xl font-display font-bold text-2xl border-2 transition-all
                                        ${overs === o
                                            ? 'bg-gradient-to-br from-cricket-primary to-cricket-primaryLight text-white border-transparent shadow-glow-green'
                                            : 'bg-white border-cricket-border text-cricket-textMuted hover:border-cricket-primary/50 hover:text-cricket-textPrimary'
                                        }`}
                                >
                                    {o}
                                </motion.button>
                            ))}
                        </div>
                        <p className="text-xs text-cricket-textMuted mt-3">Overs per innings</p>
                    </div>

                    {/* Knockout Stage Selection */}
                    <div>
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-cricket-textMuted mb-4">
                            <Target size={14} />
                            Match Type (Optional)
                        </label>
                        <div className="flex flex-wrap gap-3">
                            <motion.button
                                onClick={() => setKnockoutStage(undefined)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-6 py-3 rounded-xl font-bold text-sm border-2 transition-all
                                    ${!knockoutStage
                                        ? 'bg-gradient-to-br from-cricket-primary to-cricket-primaryLight text-white border-transparent shadow-glow-green'
                                        : 'bg-white border-cricket-border text-cricket-textMuted hover:border-cricket-primary/50 hover:text-cricket-textPrimary'
                                    }`}
                            >
                                Regular Match
                            </motion.button>
                            <motion.button
                                onClick={() => setKnockoutStage('SF1')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-6 py-3 rounded-xl font-bold text-sm border-2 transition-all
                                    ${knockoutStage === 'SF1'
                                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-transparent shadow-lg'
                                        : 'bg-white border-cricket-border text-cricket-textMuted hover:border-amber-500/50 hover:text-cricket-textPrimary'
                                    }`}
                            >
                                Semi Final 1
                            </motion.button>
                            <motion.button
                                onClick={() => setKnockoutStage('SF2')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-6 py-3 rounded-xl font-bold text-sm border-2 transition-all
                                    ${knockoutStage === 'SF2'
                                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-transparent shadow-lg'
                                        : 'bg-white border-cricket-border text-cricket-textMuted hover:border-amber-500/50 hover:text-cricket-textPrimary'
                                    }`}
                            >
                                Semi Final 2
                            </motion.button>
                            <motion.button
                                onClick={() => setKnockoutStage('FINAL')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-6 py-3 rounded-xl font-bold text-sm border-2 transition-all
                                    ${knockoutStage === 'FINAL'
                                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-cricket-textPrimary border-transparent shadow-xl'
                                        : 'bg-white border-cricket-border text-cricket-textMuted hover:border-yellow-500/50 hover:text-cricket-textPrimary'
                                    }`}
                            >
                                🏆 FINAL
                            </motion.button>
                        </div>
                        <p className="text-xs text-cricket-textMuted mt-3">
                            {!knockoutStage ? 'Regular league match' :
                                knockoutStage === 'SF1' || knockoutStage === 'SF2' ? 'Loser gets +3 bonus points' :
                                    'Runner-up gets +6 bonus points'}
                        </p>
                    </div>

                    {/* Warning for missing teams */}
                    {teams.length < 2 && (
                        <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-start gap-3">
                            <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                            <div>
                                <p className="text-yellow-700 font-bold">Not enough teams</p>
                                <p className="text-yellow-600 text-sm">You need at least 2 teams to create a match.</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-4 pt-4">
                        <motion.button
                            onClick={handleCreate}
                            disabled={!teamA || !teamB || teamA === teamB}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary w-full text-lg flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <span>Create Match</span>
                            <ArrowRight size={20} />
                        </motion.button>
                        <motion.button
                            onClick={() => navigate('/admin')}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="btn-ghost w-full"
                        >
                            Cancel
                        </motion.button>
                    </div>
                </div>
            </WizardWrapper>
        );
    }

    // Step 2: Toss
    if (step === 2 && activeMatch) {
        const team1 = teams.find(t => t.id === activeMatch.teamAId);
        const team2 = teams.find(t => t.id === activeMatch.teamBId);

        return (
            <WizardWrapper step={2} totalSteps={3} title="Toss Time" subtitle="Who won the toss and what did they choose?">
                <div className="space-y-8">
                    {/* Toss Winner */}
                    <div>
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-cricket-textMuted mb-4">
                            <Coins size={14} />
                            Toss Winner
                        </label>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[team1, team2].map(team => team && (
                                <SelectCard
                                    key={team.id}
                                    team={team}
                                    selected={tossWinner === team.id}
                                    disabled={false}
                                    onClick={() => setTossWinner(team.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Choice */}
                    <AnimatePresence>
                        {tossWinner && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-cricket-textMuted mb-4">
                                    <Target size={14} />
                                    They Elected To
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <TossButton label="Bat First" icon={Target} selected={tossChoice === 'bat'} onClick={() => setTossChoice('bat')} />
                                    <TossButton label="Bowl First" icon={Zap} selected={tossChoice === 'bowl'} onClick={() => setTossChoice('bowl')} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Confirm Button */}
                    <motion.button
                        onClick={handleToss}
                        disabled={!tossWinner || !tossChoice}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-primary w-full text-lg flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <span>Confirm Toss</span>
                        <ArrowRight size={20} />
                    </motion.button>
                </div>
            </WizardWrapper>
        );
    }

    // Step 3: Lineup Selection
    if (step === 3 && activeMatch) {
        const team1 = teams.find(t => t.id === activeMatch.teamAId);
        const team2 = teams.find(t => t.id === activeMatch.teamBId);

        // Determine batting and bowling teams
        // For first innings: based on toss
        // For second innings (innings_break): swap from first innings
        const isSecondInnings = activeMatch.status === 'innings_break' && activeMatch.innings1;

        let battingTeam, bowlingTeam;

        if (isSecondInnings && activeMatch.innings1) {
            // Second innings: swap teams from first innings
            battingTeam = teams.find(t => t.id === activeMatch.innings1!.bowlingTeamId);
            bowlingTeam = teams.find(t => t.id === activeMatch.innings1!.battingTeamId);
        } else {
            // First innings: based on toss
            const isBattingFirst = (activeMatch.toss?.winnerId === team1?.id && activeMatch.toss?.choice === 'bat') ||
                (activeMatch.toss?.winnerId === team2?.id && activeMatch.toss?.choice === 'bowl');
            battingTeam = isBattingFirst ? team1 : team2;
            bowlingTeam = isBattingFirst ? team2 : team1;
        }

        const battingLineup = battingTeam?.id === team1?.id ? lineup1 : lineup2;
        const bowlingLineup = battingTeam?.id === team1?.id ? lineup2 : lineup1;
        const setBattingLineup = battingTeam?.id === team1?.id ? setLineup1 : setLineup2;
        const setBowlingLineup = battingTeam?.id === team1?.id ? setLineup2 : setLineup1;

        const togglePlayer = (list: string[], setter: any, id: string) => {
            setter(list.includes(id) ? list.filter(p => p !== id) : [...list, id]);
        };

        const toggleSelectAll = (teamPlayers: any[], currentLineup: string[], setter: any) => {
            if (!teamPlayers) return;
            const allIds = teamPlayers.map(p => p.id);
            const isAllSelected = allIds.every(id => currentLineup.includes(id));
            setter(isAllSelected ? [] : allIds);
        };

        return (
            <WizardWrapper
                step={3}
                totalSteps={3}
                title={isSecondInnings ? "Second Innings" : "Playing XI & Opening"}
                subtitle={isSecondInnings ? `${battingTeam?.name} now batting` : "Select players and choose who opens"}
            >
                <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2">
                    {/* Batting Team Lineup */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-3 h-3 rounded-full bg-cricket-primary" />
                            <span className="font-display text-lg font-bold text-cricket-textPrimary uppercase tracking-wide">{battingTeam?.name}</span>
                            <span className="text-xs font-bold px-2 py-1 rounded bg-cricket-primary/10 text-cricket-primary uppercase">Batting</span>
                            <span className="text-xs font-mono text-cricket-textMuted bg-cricket-bgAlt px-2 py-1 rounded-lg border border-cricket-border">
                                {battingLineup.length} selected
                            </span>
                            <button
                                onClick={() => toggleSelectAll(battingTeam?.players || [], battingLineup, setBattingLineup)}
                                className="ml-auto text-xs font-bold uppercase tracking-wider text-cricket-primary hover:text-cricket-textPrimary transition-colors"
                            >
                                {battingLineup.length === (battingTeam?.players?.length || 0) && (battingTeam?.players?.length || 0) > 0 ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2 mb-4">
                            {battingTeam?.players.map(p => (
                                <PlayerCheckButton
                                    key={p.id}
                                    player={p}
                                    checked={battingLineup.includes(p.id)}
                                    onClick={() => togglePlayer(battingLineup, setBattingLineup, p.id)}
                                />
                            ))}
                        </div>

                        {/* Opening Batters Selection */}
                        {battingLineup.length >= 2 && (
                            <div className="grid md:grid-cols-2 gap-4 mt-4 p-4 bg-cricket-primary/5 rounded-xl border border-cricket-primary/20">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-cricket-textMuted mb-2 block flex items-center gap-2">
                                        <Target size={14} className="text-cricket-primary" />
                                        Striker (On Strike)
                                    </label>
                                    <select
                                        value={striker}
                                        onChange={e => setStriker(e.target.value)}
                                        className="select-cricket"
                                    >
                                        <option value="">Select Striker...</option>
                                        {battingTeam?.players.filter(p => battingLineup.includes(p.id)).map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-cricket-textMuted mb-2 block flex items-center gap-2">
                                        <Shield size={14} className="text-cricket-secondary" />
                                        Non-Striker
                                    </label>
                                    <select
                                        value={nonStriker}
                                        onChange={e => setNonStriker(e.target.value)}
                                        className="select-cricket"
                                    >
                                        <option value="">Select Non-Striker...</option>
                                        {battingTeam?.players.filter(p => battingLineup.includes(p.id) && p.id !== striker).map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bowling Team Lineup */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-3 h-3 rounded-full bg-cricket-secondary" />
                            <span className="font-display text-lg font-bold text-cricket-textPrimary uppercase tracking-wide">{bowlingTeam?.name}</span>
                            <span className="text-xs font-bold px-2 py-1 rounded bg-cricket-secondary/10 text-cricket-secondary uppercase">Bowling</span>
                            <span className="text-xs font-mono text-cricket-textMuted bg-cricket-bgAlt px-2 py-1 rounded-lg border border-cricket-border">
                                {bowlingLineup.length} selected
                            </span>
                            <button
                                onClick={() => toggleSelectAll(bowlingTeam?.players || [], bowlingLineup, setBowlingLineup)}
                                className="ml-auto text-xs font-bold uppercase tracking-wider text-cricket-secondary hover:text-cricket-textPrimary transition-colors"
                            >
                                {bowlingLineup.length === (bowlingTeam?.players?.length || 0) && (bowlingTeam?.players?.length || 0) > 0 ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2 mb-4">
                            {bowlingTeam?.players.map(p => (
                                <PlayerCheckButton
                                    key={p.id}
                                    player={p}
                                    checked={bowlingLineup.includes(p.id)}
                                    onClick={() => togglePlayer(bowlingLineup, setBowlingLineup, p.id)}
                                />
                            ))}
                        </div>

                        {/* Opening Bowler Selection */}
                        {bowlingLineup.length >= 1 && (
                            <div className="p-4 bg-cricket-secondary/5 rounded-xl border border-cricket-secondary/20">
                                <label className="text-xs font-bold uppercase tracking-wider text-cricket-textMuted mb-2 block flex items-center gap-2">
                                    <Zap size={14} className="text-cricket-secondary" />
                                    Opening Bowler
                                </label>
                                <select
                                    value={openingBowler}
                                    onChange={e => setOpeningBowler(e.target.value)}
                                    className="select-cricket"
                                >
                                    <option value="">Select Opening Bowler...</option>
                                    {bowlingTeam?.players.filter(p => bowlingLineup.includes(p.id)).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Start Match Button */}
                <motion.button
                    onClick={handleLineup}
                    disabled={!striker || !nonStriker || !openingBowler || battingLineup.length < 2 || bowlingLineup.length < 1}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary w-full text-lg flex items-center justify-center gap-3 mt-8 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Play size={20} fill="currentColor" />
                    <span>Start Match</span>
                </motion.button>
            </WizardWrapper>
        );
    }

    // Step 4: Match Started - Show loading while redirecting
    if (step === 4 && activeMatch) {
        return (
            <WizardWrapper step={3} totalSteps={3} title="Match Started!" subtitle="Redirecting to scorer...">
                <div className="text-center py-8">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-cricket-primary/20 border-t-cricket-primary rounded-full mx-auto mb-6"
                    />
                    <p className="text-cricket-textMuted mb-6">Taking you to the scorer...</p>
                    <motion.button
                        onClick={() => navigate('/scorer')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-primary"
                    >
                        Go to Scorer Manually
                    </motion.button>
                </div>
            </WizardWrapper>
        );
    }

    return null;
};

export default MatchSetup;