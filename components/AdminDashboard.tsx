import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Plus, UserPlus, PlayCircle, LogOut, Trash2, Users, Home, RefreshCw, AlertTriangle, Crown, ChevronRight, Trophy, Medal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameSelector } from './GameSelector';
import { GameType } from '../types';

// ============================================
// TAB BUTTON
// ============================================
const TabButton = ({ label, icon: Icon, active, onClick }: { label: string; icon: any; active: boolean; onClick: () => void }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-display font-bold uppercase tracking-wider text-sm transition-all
            ${active
                ? 'bg-gradient-to-r from-cricket-primary to-cricket-primaryLight text-white shadow-glow-green'
                : 'bg-white text-cricket-textMuted hover:text-cricket-primary border border-cricket-border'
            }`}
    >
        <Icon size={18} />
        <span className="hidden sm:inline">{label}</span>
    </motion.button>
);

// ============================================
// LOGIN SCREEN
// ============================================
const LoginScreen = ({ pin, setPin, login }: { pin: string, setPin: (p: string) => void, login: (p: string) => boolean }) => (
    <div className="min-h-screen bg-cricket-bg flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-mesh-cricket" />
        <div className="orb-green w-96 h-96 top-0 left-0 opacity-50" />
        <div className="orb-lime w-80 h-80 bottom-0 right-0 opacity-40" />

        <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            className="relative z-10 w-full max-w-md"
        >
            <div className="bg-white rounded-[32px] p-6 md:p-12 border border-cricket-border shadow-premium relative overflow-hidden">
                {/* Top Accent */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cricket-primary via-cricket-primaryLight to-cricket-secondary" />

                <div className="text-center mb-10">
                    <motion.div
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-cricket-primary/10 to-cricket-secondary/10 border border-cricket-borderGreen mb-6"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <Shield size={40} className="text-cricket-primary" />
                    </motion.div>
                    <h1 className="text-4xl font-display font-bold text-cricket-textPrimary uppercase tracking-wide mb-2">Admin Access</h1>
                    <p className="text-cricket-textMuted">Enter security PIN to continue</p>
                </div>

                <div className="space-y-6">
                    <input
                        type="password"
                        placeholder="• • • •"
                        className="input-cricket text-center text-3xl tracking-[0.5em] font-mono"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        maxLength={4}
                    />

                    <motion.button
                        onClick={() => { if (login(pin)) setPin(''); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-primary w-full text-lg"
                    >
                        Unlock System
                    </motion.button>
                </div>

                <div className="mt-10 text-center">
                    <Link to="/" className="text-cricket-textMuted hover:text-cricket-primary text-sm font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors">
                        <Home size={14} />
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        </motion.div>
    </div>
);

// ============================================
// MATCH CONTROL SECTION
// ============================================
// ============================================
// CRICKET MATCH CONTROL
// ============================================
const CricketMatchControl = ({ navigate, resetTournament }: { navigate: any, resetTournament: () => void }) => (
    <div className="space-y-8">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 md:p-12 text-center border border-cricket-border shadow-card relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-cricket-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="absolute inset-0 bg-mesh-cricket opacity-50" />

            <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-green-50 text-green-600 mb-8">
                    <PlayCircle size={48} />
                </div>
                <h2 className="text-4xl font-display font-bold text-slate-800 mb-4 uppercase">Cricket Match</h2>
                <motion.button
                    onClick={() => navigate('/setup')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary text-xl inline-flex items-center gap-4"
                >
                    Start Match <ChevronRight size={24} />
                </motion.button>
            </div>
        </motion.div>

        {/* Reset Button (Keep existing danger zone here or shared?) Keeping here for now */}
        <div className="p-6 rounded-2xl border-2 border-red-100 bg-red-50">
            <button onClick={resetTournament} className="text-red-500 font-bold uppercase text-xs flex items-center gap-2">
                <RefreshCw size={14} /> Reset Tournament
            </button>
        </div>
    </div>
);

// ============================================
// BADMINTON MATCH CONTROL
// ============================================
// ============================================
// KNOCKOUT MATCH CONTROL
// ============================================
const KnockoutMatchControl = ({ navigate, knockoutMatches, resolveMatch, teams, gameType }: any) => {
    const gameMatches = knockoutMatches.filter((m: any) => m.gameType === gameType);

    return (
        <div className="space-y-8">
            {/* New Match Button */}
            <motion.button
                onClick={() => navigate(`/knockout-setup?game=${gameType}`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-display font-black text-2xl uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center justify-center gap-4"
            >
                <Plus size={32} />
                New {gameType.replace('_', ' ')} Match
            </motion.button>

            {/* Active/Scheduled Matches List */}
            <div className="grid grid-cols-1 gap-4">
                {gameMatches.filter((m: any) => m.status === 'scheduled').map((match: any) => {
                    const teamA = teams.find((t: any) => t.id === match.teamAId);
                    const teamB = teams.find((t: any) => t.id === match.teamBId);
                    return (
                        <motion.div
                            key={match.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-8 flex-1">
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-slate-800 text-lg">{teamA?.name}</span>
                                    {match.matchType === 'doubles' && <span className="text-xs text-slate-400">Doubles</span>}
                                </div>
                                <div className="text-slate-300 font-black text-xl">VS</div>
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-slate-800 text-lg">{teamB?.name}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                                    {match.stage.replace('_', ' ')} • {match.pointsAwarded} pts
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { if (confirm(`Declare ${teamA?.name} as winner?`)) resolveMatch(match.id, match.teamAId); }}
                                    className="px-4 py-2 rounded-lg bg-green-50 text-green-600 font-bold text-xs uppercase hover:bg-green-100"
                                >
                                    {teamA?.name} Won
                                </button>
                                <button
                                    onClick={() => { if (confirm(`Declare ${teamB?.name} as winner?`)) resolveMatch(match.id, match.teamBId); }}
                                    className="px-4 py-2 rounded-lg bg-green-50 text-green-600 font-bold text-xs uppercase hover:bg-green-100"
                                >
                                    {teamB?.name} Won
                                </button>
                            </div>
                        </motion.div>
                    );
                })}

                {gameMatches.filter((m: any) => m.status === 'scheduled').length === 0 && (
                    <div className="text-center py-12 text-slate-400 font-medium">
                        No scheduled matches.
                    </div>
                )}
            </div>

            {/* Completed History (Mini) */}
            <div>
                <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-4">Recent Results</h3>
                <div className="space-y-2 opacity-60">
                    {gameMatches.filter((m: any) => m.status === 'completed').slice(-5).reverse().map((match: any) => {
                        const winner = teams.find((t: any) => t.id === match.winnerTeamId);
                        return (
                            <div key={match.id} className="flex justify-between p-3 bg-slate-50 rounded-xl text-sm">
                                <span>{match.stage}</span>
                                <span className="font-bold text-green-600">{winner?.name || 'Unknown'} Won</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ============================================
// TEAM MANAGEMENT SECTION
// ============================================
const TeamManagementSection = ({
    teams, addTeam, deleteTeam, addPlayer, deletePlayer, updateTeamGroup, setPlayerRole, setPlayerGender,
    newTeamName, setNewTeamName, newTeamGroup, setNewTeamGroup, selectedTeamId, setSelectedTeamId,
    newPlayerName, setNewPlayerName, newPlayerGender, setNewPlayerGender
}: any) => {
    const selectedTeam = teams.find((t: any) => t.id === selectedTeamId);

    return (
        <div className="space-y-8">
            {/* Create Team Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 md:p-8 border border-cricket-border shadow-card"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-cricket-primary to-cricket-primaryLight">
                        <Plus className="text-white" size={24} />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-cricket-textPrimary uppercase tracking-wide">Register New Team</h3>
                </div>

                <div className="flex flex-col lg:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Enter Team Name"
                        value={newTeamName}
                        onChange={e => setNewTeamName(e.target.value)}
                        className="input-cricket flex-[2]"
                    />
                    <div className="flex-1 relative">
                        <select
                            value={newTeamGroup}
                            onChange={(e: any) => setNewTeamGroup(e.target.value)}
                            className="select-cricket"
                        >
                            <option value="A">Group A</option>
                            <option value="B">Group B</option>
                        </select>
                    </div>
                    <motion.button
                        onClick={() => { if (newTeamName) { addTeam(newTeamName, newTeamGroup); setNewTeamName(''); } }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-primary whitespace-nowrap"
                    >
                        Create Team
                    </motion.button>
                </div>
            </motion.div>

            {/* Roster Manager */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-6 md:p-8 border border-cricket-border shadow-card"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-cricket-secondary to-cricket-emerald">
                        <UserPlus className="text-white" size={24} />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-cricket-textPrimary uppercase tracking-wide">Manage Roster</h3>
                </div>

                <div className="mb-8">
                    <select
                        value={selectedTeamId}
                        onChange={e => setSelectedTeamId(e.target.value)}
                        className="select-cricket"
                    >
                        <option value="">Select Team to Edit...</option>
                        {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name} (Group {t.group})</option>)}
                    </select>
                </div>

                <AnimatePresence>
                    {selectedTeamId && selectedTeam && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-6"
                        >
                            {/* Add Player Form */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    placeholder="Player Name"
                                    value={newPlayerName}
                                    onChange={e => setNewPlayerName(e.target.value)}
                                    className="input-cricket flex-1"
                                />
                                <div className="flex items-center gap-1 p-1.5 rounded-xl bg-cricket-bgAlt border border-cricket-border">
                                    <motion.button
                                        onClick={() => setNewPlayerGender('M')}
                                        whileTap={{ scale: 0.9 }}
                                        className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${newPlayerGender === 'M' ? 'bg-cricket-boundary text-white' : 'text-cricket-textMuted hover:text-cricket-textPrimary'}`}
                                    >M</motion.button>
                                    <motion.button
                                        onClick={() => setNewPlayerGender('F')}
                                        whileTap={{ scale: 0.9 }}
                                        className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${newPlayerGender === 'F' ? 'bg-pink-500 text-white' : 'text-cricket-textMuted hover:text-cricket-textPrimary'}`}
                                    >F</motion.button>
                                </div>
                                <motion.button
                                    onClick={() => { if (newPlayerName) { addPlayer(selectedTeamId, newPlayerName, newPlayerGender); setNewPlayerName(''); } }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn-ghost whitespace-nowrap"
                                >
                                    Add Player
                                </motion.button>
                            </div>

                            {/* Player List */}
                            <div className="rounded-2xl border border-cricket-border overflow-hidden">
                                {/* Header */}
                                <div className="p-5 bg-cricket-bgAlt border-b border-cricket-border flex flex-wrap gap-4 justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cricket-textMuted">
                                            {selectedTeam.name} • {selectedTeam.players.length} Players
                                        </span>
                                        <motion.button
                                            onClick={() => {
                                                const newGroup = selectedTeam.group === 'A' ? 'B' : 'A';
                                                updateTeamGroup(selectedTeamId, newGroup);
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all
                                                ${selectedTeam.group === 'A'
                                                    ? 'bg-cricket-primary/10 text-cricket-primary border-cricket-primary/30'
                                                    : 'bg-cricket-secondary/10 text-cricket-secondary border-cricket-secondary/30'
                                                }`}
                                        >
                                            Group {selectedTeam.group} <span className="opacity-60 ml-1">(Switch)</span>
                                        </motion.button>
                                    </div>
                                    <motion.button
                                        onClick={() => { if (confirm('Delete entire team?')) { deleteTeam(selectedTeamId); setSelectedTeamId(''); } }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="text-cricket-wicket text-[10px] font-bold uppercase flex items-center gap-2 bg-cricket-wicket/10 px-4 py-2 rounded-xl border border-cricket-wicket/20 hover:bg-cricket-wicket/20 transition-colors"
                                    >
                                        <Trash2 size={12} />
                                        Delete Team
                                    </motion.button>
                                </div>

                                {/* Players */}
                                <div className="divide-y divide-cricket-border max-h-[400px] overflow-y-auto">
                                    {selectedTeam.players.map((p: any, idx: number) => (
                                        <motion.div
                                            key={p.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="p-5 flex justify-between items-center hover:bg-cricket-primary/5 transition-colors group"
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Gender Badge */}
                                                <motion.button
                                                    onClick={() => setPlayerGender(selectedTeamId, p.id, p.gender === 'F' ? 'M' : 'F')}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className={`w-8 h-8 rounded-xl text-xs font-bold border transition-all flex items-center justify-center
                                                        ${p.gender === 'F'
                                                            ? 'bg-pink-100 text-pink-600 border-pink-200 hover:bg-pink-200'
                                                            : 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200'
                                                        }`}
                                                    title="Toggle Gender"
                                                >
                                                    {p.gender || 'M'}
                                                </motion.button>

                                                {/* Player Name */}
                                                <span className={`font-bold text-lg ${p.gender === 'F' ? 'text-pink-700' : 'text-cricket-textPrimary'}`}>
                                                    {p.name}
                                                </span>

                                                {/* Role Badges */}
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        onClick={() => setPlayerRole(selectedTeamId, p.id, p.role === 'captain' ? 'player' : 'captain')}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className={`w-8 h-8 rounded-full text-[10px] font-black border transition-all flex items-center justify-center
                                                            ${p.role === 'captain'
                                                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-transparent shadow-lg'
                                                                : 'text-cricket-textMuted border-cricket-border hover:border-yellow-400 hover:text-yellow-600'
                                                            }`}
                                                        title="Toggle Captain"
                                                    >
                                                        {p.role === 'captain' ? <Crown size={14} /> : 'C'}
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => setPlayerRole(selectedTeamId, p.id, p.role === 'vice-captain' ? 'player' : 'vice-captain')}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className={`w-8 h-8 rounded-full text-[10px] font-black border transition-all flex items-center justify-center
                                                            ${p.role === 'vice-captain'
                                                                ? 'bg-gradient-to-br from-cricket-primary to-cricket-secondary text-white border-transparent shadow-lg'
                                                                : 'text-cricket-textMuted border-cricket-border hover:border-cricket-primary hover:text-cricket-primary'
                                                            }`}
                                                        title="Toggle Vice-Captain"
                                                    >
                                                        VC
                                                    </motion.button>
                                                </div>
                                            </div>

                                            {/* Delete Button */}
                                            <motion.button
                                                onClick={() => deletePlayer(selectedTeamId, p.id)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="opacity-0 group-hover:opacity-100 text-cricket-wicket p-2.5 hover:bg-cricket-wicket/10 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </motion.button>
                                        </motion.div>
                                    ))}

                                    {selectedTeam.players.length === 0 && (
                                        <div className="p-12 text-center">
                                            <Users size={40} className="mx-auto mb-4 text-cricket-textMuted opacity-30" />
                                            <p className="text-cricket-textMuted">No players in roster. Add your first player above.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

// ============================================
// MAIN ADMIN DASHBOARD
// ============================================
const AdminDashboard = () => {
    const { isAdmin, login, logout, teams, addTeam, deleteTeam, addPlayer, deletePlayer, updateTeamGroup, setPlayerRole, setPlayerGender, resetTournament } = useTournament();
    const navigate = useNavigate();
    const [pin, setPin] = useState('');
    const [activeTab, setActiveTab] = useState<'match' | 'teams'>('match');

    // Form states
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamGroup, setNewTeamGroup] = useState<'A' | 'B'>('A');
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerGender, setNewPlayerGender] = useState<'M' | 'F'>('M');

    // Game Selection
    const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
    const { knockoutMatches, resolveKnockoutMatch, setActiveGame } = useTournament();

    if (!isAdmin) {
        return <LoginScreen pin={pin} setPin={setPin} login={login} />;
    }

    return (
        <div className="min-h-screen bg-cricket-bg pb-20 safe-area-pb">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-mesh-cricket opacity-50" />
                <div className="orb-green w-[600px] h-[600px] -top-[300px] -right-[200px] opacity-30" />
                <div className="orb-lime w-[500px] h-[500px] -bottom-[200px] -left-[200px] opacity-20" />
            </div>

            {/* Header */}
            <nav className="bg-white/90 backdrop-blur-md border-b border-cricket-border sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 p-2.5 -ml-2 rounded-xl text-cricket-textMuted hover:text-cricket-primary hover:bg-cricket-primary/5 transition-colors group">
                            <Home size={20} />
                            <span className="font-bold text-xs uppercase tracking-wider group-hover:text-cricket-primary transition-colors">Dashboard</span>
                        </Link>
                        {/* Back to Games */}
                        {selectedGame && (
                            <button onClick={() => { setSelectedGame(null); setActiveGame('cricket'); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase hover:bg-slate-200">
                                <ChevronRight size={14} className="rotate-180" /> Change Sport
                            </button>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cricket-primary/10">
                                <Shield size={18} className="text-cricket-primary" />
                            </div>
                            <span className="font-display font-bold uppercase tracking-[0.15em] text-sm text-cricket-textSecondary hidden sm:block">
                                Control Panel
                            </span>
                        </div>
                    </div>
                    <motion.button
                        onClick={logout}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-cricket-wicket hover:bg-cricket-wicket/10 transition-colors text-sm font-bold uppercase tracking-wider"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Logout</span>
                    </motion.button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
                {/* Tabs */}
                <div className="flex gap-3 mb-10">
                    <TabButton label="Match Control" icon={PlayCircle} active={activeTab === 'match'} onClick={() => setActiveTab('match')} />
                    <TabButton label="Team Manager" icon={Users} active={activeTab === 'teams'} onClick={() => setActiveTab('teams')} />
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'match' && selectedGame === 'cricket' && (
                            <CricketMatchControl navigate={navigate} resetTournament={resetTournament} />
                        )}

                        {activeTab === 'match' && selectedGame && selectedGame !== 'cricket' && (
                            <KnockoutMatchControl
                                navigate={navigate}
                                knockoutMatches={knockoutMatches}
                                resolveMatch={resolveKnockoutMatch}
                                teams={teams}
                                gameType={selectedGame}
                            />
                        )}

                        {activeTab === 'teams' && (
                            <TeamManagementSection
                                teams={teams}
                                addTeam={addTeam}
                                deleteTeam={deleteTeam}
                                addPlayer={addPlayer}
                                deletePlayer={deletePlayer}
                                updateTeamGroup={updateTeamGroup}
                                setPlayerRole={setPlayerRole}
                                setPlayerGender={setPlayerGender}
                                newTeamName={newTeamName}
                                setNewTeamName={setNewTeamName}
                                newTeamGroup={newTeamGroup}
                                setNewTeamGroup={setNewTeamGroup}
                                selectedTeamId={selectedTeamId}
                                setSelectedTeamId={setSelectedTeamId}
                                newPlayerName={newPlayerName}
                                setNewPlayerName={setNewPlayerName}
                                newPlayerGender={newPlayerGender}
                                setNewPlayerGender={setNewPlayerGender}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Game Selector Modal / Overlay */}
            {
                !selectedGame && (
                    <div className="fixed inset-0 z-50 bg-slate-50 flex items-center justify-center p-4">
                        <GameSelector onSelect={(game) => { setSelectedGame(game); setActiveGame(game); }} />
                    </div>
                )
            }
        </div >
    );
};

export default AdminDashboard;