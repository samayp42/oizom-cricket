import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Trophy, ChevronRight, Activity, Calendar } from 'lucide-react';
import { BadmintonMatchType, BadmintonMatchStage } from '../types';

const BadmintonMatchSetup = () => {
    const { teams, createBadmintonMatch } = useTournament();
    const navigate = useNavigate();

    const [stage, setStage] = useState<BadmintonMatchStage>('round_1');
    const [matchType, setMatchType] = useState<BadmintonMatchType>('singles');

    // Team Selection
    const [teamAId, setTeamAId] = useState('');
    const [teamBId, setTeamBId] = useState('');

    // Player Selection
    const [teamAPlayers, setTeamAPlayers] = useState<string[]>([]);
    const [teamBPlayers, setTeamBPlayers] = useState<string[]>([]);

    const handlePlayerSelect = (teamId: string, playerId: string, isTeamA: boolean) => {
        const setPlayers = isTeamA ? setTeamAPlayers : setTeamBPlayers;
        const currentPlayers = isTeamA ? teamAPlayers : teamBPlayers;
        const maxPlayers = matchType === 'singles' ? 1 : 2;

        if (currentPlayers.includes(playerId)) {
            setPlayers(currentPlayers.filter(id => id !== playerId));
        } else {
            if (currentPlayers.length < maxPlayers) {
                setPlayers([...currentPlayers, playerId]);
            }
        }
    };

    const isReady = teamAId && teamBId &&
        teamAPlayers.length === (matchType === 'singles' ? 1 : 2) &&
        teamBPlayers.length === (matchType === 'singles' ? 1 : 2);

    const handleSubmit = () => {
        if (!isReady) return;
        createBadmintonMatch(teamAId, teamBId, stage, matchType, teamAPlayers, teamBPlayers);
        navigate('/admin');
    };

    const teamA = teams.find(t => t.id === teamAId);
    const teamB = teams.find(t => t.id === teamBId);

    return (
        <div className="min-h-screen bg-slate-50 pb-20 safe-area-pb">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-slate-800 uppercase tracking-wider mb-2">
                        Badminton Match Setup
                    </h1>
                    <p className="text-slate-500 font-medium">Configure new knockout match</p>
                </div>

                <div className="space-y-6">
                    {/* Settings Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Stage</label>
                                <select
                                    value={stage}
                                    onChange={(e) => setStage(e.target.value as BadmintonMatchStage)}
                                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="round_1">Round 1 (6 pts)</option>
                                    <option value="semi_final">Semi Final (8 pts)</option>
                                    <option value="final">Final (10 pts)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Match Type</label>
                                <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-200">
                                    <button
                                        className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase transition-all ${matchType === 'singles' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                                        onClick={() => { setMatchType('singles'); setTeamAPlayers([]); setTeamBPlayers([]); }}
                                    >
                                        Singles
                                    </button>
                                    <button
                                        className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase transition-all ${matchType === 'doubles' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                                        onClick={() => { setMatchType('doubles'); setTeamAPlayers([]); setTeamBPlayers([]); }}
                                    >
                                        Doubles
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Team A */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                            <h3 className="text-sm font-bold uppercase text-slate-400 mb-4">Team A</h3>
                            <select
                                value={teamAId}
                                onChange={(e) => { setTeamAId(e.target.value); setTeamAPlayers([]); }}
                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 mb-4"
                            >
                                <option value="">Select Team</option>
                                {teams.filter(t => t.id !== teamBId).map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>

                            {teamA && (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Select {matchType === 'singles' ? '1 Player' : '2 Players'}</p>
                                    {teamA.players.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => handlePlayerSelect(teamAId, p.id, true)}
                                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all
                                                ${teamAPlayers.includes(p.id)
                                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                    : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            <span className="font-bold text-sm">{p.name}</span>
                                            {teamAPlayers.includes(p.id) && <Activity size={16} />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Team B */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                            <h3 className="text-sm font-bold uppercase text-slate-400 mb-4">Team B</h3>
                            <select
                                value={teamBId}
                                onChange={(e) => { setTeamBId(e.target.value); setTeamBPlayers([]); }}
                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 mb-4"
                            >
                                <option value="">Select Team</option>
                                {teams.filter(t => t.id !== teamAId).map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>

                            {teamB && (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Select {matchType === 'singles' ? '1 Player' : '2 Players'}</p>
                                    {teamB.players.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => handlePlayerSelect(teamBId, p.id, false)}
                                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all
                                                ${teamBPlayers.includes(p.id)
                                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                    : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            <span className="font-bold text-sm">{p.name}</span>
                                            {teamBPlayers.includes(p.id) && <Activity size={16} />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        disabled={!isReady}
                        onClick={handleSubmit}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl transition-all
                            ${isReady
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        Create Match
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default BadmintonMatchSetup;
