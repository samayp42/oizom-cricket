import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, UserPlus, PlayCircle, LogOut, Trash2, Settings, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { isAdmin, login, logout, teams, addTeam, deleteTeam, addPlayer, deletePlayer } = useTournament();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState<'match' | 'teams'>('match');

  // Form states
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamGroup, setNewTeamGroup] = useState<'A' | 'B'>('A');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');

  if (!isAdmin) {
      return (
          <div className="min-h-screen bg-sports-black flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-sports-card border border-white/10 p-10 rounded-3xl w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sports-primary to-sports-accent"></div>
                  <Shield className="w-16 h-16 text-sports-primary mx-auto mb-6" />
                  <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Access</h1>
                  <p className="text-sports-muted text-sm mb-8">Enter security PIN to continue</p>
                  
                  <input 
                    type="password" 
                    placeholder="PIN" 
                    className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white text-center text-2xl tracking-[1em] mb-6 focus:border-sports-primary focus:ring-1 focus:ring-sports-primary outline-none transition-all placeholder:tracking-normal placeholder:text-sm font-mono"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                  <button 
                    onClick={() => { if(login(pin)) setPin(''); }}
                    className="w-full bg-sports-primary hover:bg-emerald-400 text-sports-black font-bold py-4 rounded-xl transition-colors uppercase tracking-widest text-sm"
                  >
                      Unlock System
                  </button>
              </motion.div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-sports-black pb-20 font-sans">
      <nav className="bg-sports-card/50 backdrop-blur-md border-b border-white/5 p-4 sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-lg font-tech font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <div className="w-8 h-8 rounded bg-sports-primary/10 flex items-center justify-center border border-sports-primary/20">
                    <Shield size={16} className="text-sports-primary" /> 
                  </div>
                  Control Panel
              </h1>
              <button onClick={logout} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><LogOut size={20} /></button>
          </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Tab Switcher */}
          <div className="flex bg-white/5 p-1 rounded-xl mb-8">
              <button 
                onClick={() => setActiveTab('match')} 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'match' ? 'bg-sports-surface shadow-lg text-white' : 'text-sports-muted hover:text-white'}`}
              >
                  <PlayCircle size={16} /> Match Control
              </button>
              <button 
                onClick={() => setActiveTab('teams')} 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'teams' ? 'bg-sports-surface shadow-lg text-white' : 'text-sports-muted hover:text-white'}`}
              >
                  <Users size={16} /> Team Manager
              </button>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
              {activeTab === 'match' && (
                  <div className="bg-gradient-to-br from-sports-card to-black border border-white/10 p-10 rounded-3xl text-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-sports-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <div className="relative z-10">
                          <div className="w-20 h-20 bg-sports-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-sports-accent/20">
                            <PlayCircle className="w-10 h-10 text-sports-accent" />
                          </div>
                          <h2 className="text-3xl font-display font-bold text-white mb-2">Initiate New Match</h2>
                          <p className="text-sports-muted mb-8 max-w-md mx-auto">Launch the match setup wizard to configure teams, toss details, and overs.</p>
                          <button 
                            onClick={() => navigate('/setup')}
                            className="bg-white text-black font-bold text-lg px-10 py-4 rounded-2xl hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all"
                          >
                              Open Match Wizard
                          </button>
                      </div>
                  </div>
              )}

              {activeTab === 'teams' && (
                  <div className="space-y-8">
                      {/* Create Team Card */}
                      <div className="glass-panel p-6 rounded-2xl">
                          <h3 className="text-sports-primary font-tech font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                              <Plus size={18} /> Register New Team
                          </h3>
                          <div className="flex flex-col md:flex-row gap-4">
                              <input 
                                type="text" 
                                placeholder="Enter Team Name" 
                                value={newTeamName}
                                onChange={e => setNewTeamName(e.target.value)}
                                className="flex-[2] bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-sports-primary transition-colors"
                              />
                              <div className="flex-1 relative">
                                  <select 
                                    value={newTeamGroup} 
                                    onChange={(e: any) => setNewTeamGroup(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-sports-primary appearance-none"
                                  >
                                      <option value="A">Group A</option>
                                      <option value="B">Group B</option>
                                  </select>
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-sports-muted">▼</div>
                              </div>
                              <button 
                                onClick={() => { if(newTeamName) { addTeam(newTeamName, newTeamGroup); setNewTeamName(''); }}}
                                className="bg-sports-primary hover:bg-emerald-400 text-black px-8 py-4 rounded-xl font-bold transition-colors uppercase tracking-widest text-sm"
                              >
                                  Create
                              </button>
                          </div>
                      </div>

                      {/* Roster Manager */}
                      <div className="glass-panel p-6 rounded-2xl">
                          <h3 className="text-sports-accent font-tech font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                              <UserPlus size={18} /> Manage Roster
                          </h3>
                          
                          <div className="mb-6">
                              <select 
                                value={selectedTeamId}
                                onChange={e => setSelectedTeamId(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-sports-accent appearance-none"
                              >
                                  <option value="">Select Team to Edit...</option>
                                  {teams.map(t => <option key={t.id} value={t.id}>{t.name} (Group {t.group})</option>)}
                              </select>
                          </div>
                          
                          {selectedTeamId && (
                              <div className="animate-in fade-in slide-in-from-top-4">
                                <div className="flex gap-4 mb-6">
                                    <input 
                                        type="text" 
                                        placeholder="Player Name" 
                                        value={newPlayerName}
                                        onChange={e => setNewPlayerName(e.target.value)}
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-sports-accent"
                                    />
                                    <button 
                                        onClick={() => { if (newPlayerName) { addPlayer(selectedTeamId, newPlayerName); setNewPlayerName(''); }}}
                                        className="bg-sports-surface hover:bg-white/10 text-white border border-white/10 px-8 rounded-xl font-bold uppercase text-sm tracking-wider"
                                    >
                                        Add Player
                                    </button>
                                </div>

                                <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                                    <div className="p-4 bg-white/5 flex justify-between items-center border-b border-white/5">
                                        <span className="text-xs font-bold uppercase text-sports-muted">Current Roster</span>
                                        <button onClick={() => { if(confirm('Delete entire team?')) { deleteTeam(selectedTeamId); setSelectedTeamId(''); }}} className="text-red-500 hover:text-red-400 text-[10px] font-bold uppercase flex items-center gap-1 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                                            <Trash2 size={12}/> Delete Team
                                        </button>
                                    </div>
                                    <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
                                        {teams.find(t => t.id === selectedTeamId)?.players.map(p => (
                                            <div key={p.id} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors group">
                                                <span className="text-slate-300 font-medium">{p.name}</span>
                                                <button 
                                                    onClick={() => deletePlayer(selectedTeamId, p.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        ))}
                                        {teams.find(t => t.id === selectedTeamId)?.players.length === 0 && (
                                            <div className="p-8 text-center text-sports-muted text-sm italic">No players in roster.</div>
                                        )}
                                    </div>
                                </div>
                              </div>
                          )}
                      </div>
                  </div>
              )}
          </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;