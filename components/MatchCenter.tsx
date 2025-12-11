import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { formatOvers } from '../utils/nrr';
import { ArrowLeft, Wifi, TrendingUp, Users, Clock, Share2, Circle, Tv, AlertTriangle, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MatchAnalytics from './MatchAnalytics';

const MatchCenter = () => {
  const { activeMatch, teams } = useTournament();
  const [activeTab, setActiveTab] = useState<'scorecard' | 'commentary' | 'analytics' | 'info'>('scorecard');

  // Common Header Component
  const Header = () => (
    <div className="sticky top-0 z-50 bg-white/80 dark:bg-sports-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="p-2 -ml-2 text-slate-500 dark:text-sports-muted hover:text-sports-black dark:hover:text-white transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                <ArrowLeft size={24} />
            </Link>
            <div className="font-tech font-bold uppercase tracking-widest text-sm text-slate-500 dark:text-sports-muted flex items-center gap-2">
                <Tv size={16} className="text-sports-primary" />
                Match Center
            </div>
            <button className="p-2 -mr-2 text-slate-500 dark:text-sports-muted hover:text-sports-black dark:hover:text-white transition-colors">
                <Share2 size={20} />
            </button>
        </div>
    </div>
  );

  if (!activeMatch) {
    return (
        <div className="min-h-screen bg-sports-white dark:bg-sports-black font-sans transition-colors duration-300">
            <Header />
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                    <Wifi size={48} className="text-slate-400 dark:text-sports-muted opacity-50" />
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">TRANSMISSION OFFLINE</h2>
                <p className="text-slate-500 dark:text-sports-muted max-w-md mx-auto mb-8">
                    There are no matches currently broadcasting live. Check the dashboard for the schedule.
                </p>
                <Link to="/">
                    <button className="bg-sports-primary hover:bg-emerald-400 text-white dark:text-black font-bold py-3 px-8 rounded-xl uppercase tracking-widest shadow-neon transition-all">
                        Return to Dashboard
                    </button>
                </Link>
            </div>
        </div>
    );
  }

  const currentInnings = activeMatch.innings2 || activeMatch.innings1;
  const battingTeamId = currentInnings ? currentInnings.battingTeamId : activeMatch.toss?.winnerId;
  const bowlingTeamId = currentInnings ? currentInnings.bowlingTeamId : (activeMatch.toss?.winnerId === activeMatch.teamAId ? activeMatch.teamBId : activeMatch.teamAId);
  
  const battingTeam = teams.find(t => t.id === battingTeamId);
  const bowlingTeam = teams.find(t => t.id === bowlingTeamId);

  // Helper
  const getSR = (runs: number, balls: number) => balls > 0 ? ((runs / balls) * 100).toFixed(0) : '0';
  const getEcon = (runs: number, overs: number) => overs > 0 ? (runs / overs).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen pb-24 bg-sports-white dark:bg-sports-black font-sans transition-colors duration-300">
        <Header />

        {/* Hero Score Area */}
        <div className="relative overflow-hidden bg-white dark:bg-sports-card border-b border-slate-200 dark:border-white/5 pt-8 pb-12 transition-colors duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sports-primary via-sports-accent to-sports-primary"></div>
            <div className="hidden dark:block absolute -right-20 -top-20 w-96 h-96 bg-sports-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="container mx-auto px-4 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-6">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-800 dark:text-white">Live Broadcast</span>
                </div>

                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                >
                    <h2 className="text-2xl md:text-4xl font-display font-bold text-slate-800 dark:text-white mb-2">{battingTeam?.name || 'Waiting for Toss...'}</h2>
                    
                    {currentInnings ? (
                        <div className="flex items-baseline gap-4 my-2">
                             <span className="text-7xl md:text-9xl font-display font-bold text-slate-900 dark:text-white leading-none tracking-tight">
                                {currentInnings.totalRuns}/{currentInnings.wickets}
                             </span>
                             <span className="text-xl md:text-3xl font-mono text-slate-500 dark:text-sports-muted">
                                {formatOvers(currentInnings.overs)} <span className="text-sm">ov</span>
                             </span>
                        </div>
                    ) : (
                        <div className="text-6xl font-display text-slate-300 dark:text-white/20 my-4">0/0</div>
                    )}
                    
                    <div className="text-sports-primary font-mono text-sm tracking-wider bg-emerald-500/10 dark:bg-sports-primary/10 px-4 py-1 rounded-full border border-emerald-500/20 dark:border-sports-primary/20">
                         {activeMatch.innings2 ? `Target: ${activeMatch.innings1!.totalRuns + 1} • Needs ${(activeMatch.innings1!.totalRuns + 1 - activeMatch.innings2.totalRuns)} runs` : 
                          `Current Run Rate: ${currentInnings && currentInnings.overs > 0 ? (currentInnings.totalRuns / currentInnings.overs).toFixed(2) : '0.00'}`}
                    </div>
                </motion.div>
            </div>
        </div>

        {/* Tabs Navigation */}
        <div className="sticky top-16 z-40 bg-white/95 dark:bg-sports-black/95 backdrop-blur shadow-sm dark:shadow-lg border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
             <div className="container mx-auto px-4">
                 <div className="flex overflow-x-auto no-scrollbar">
                     {['scorecard', 'analytics', 'commentary', 'info'].map(tab => (
                         <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 py-4 px-2 text-sm font-tech font-bold uppercase tracking-wider relative transition-colors whitespace-nowrap ${activeTab === tab ? 'text-sports-primary' : 'text-slate-500 dark:text-sports-muted hover:text-slate-900 dark:hover:text-white'}`}
                         >
                             {tab}
                             {activeTab === tab && (
                                 <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-1 bg-sports-primary shadow-neon" />
                             )}
                         </button>
                     ))}
                 </div>
             </div>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'scorecard' && currentInnings && (
                        <div className="space-y-8">
                             {/* Batting Table */}
                             <div className="glass-panel rounded-xl overflow-hidden">
                                 <div className="px-5 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
                                     <h3 className="font-tech font-bold text-lg text-slate-800 dark:text-white uppercase tracking-wider">Batting</h3>
                                     <span className="text-xs font-bold text-sports-primary">{battingTeam?.name}</span>
                                 </div>
                                 <div className="divide-y divide-slate-200 dark:divide-white/5">
                                     {battingTeam?.players.filter(p => currentInnings.battingOrder.includes(p.id)).map(p => {
                                         const isStriker = currentInnings.strikerId === p.id;
                                         const isNonStriker = currentInnings.nonStrikerId === p.id;
                                         const isOut = currentInnings.playersOut.includes(p.id);
                                         
                                         return (
                                             <div key={p.id} className={`grid grid-cols-12 items-center py-3 px-4 ${isStriker || isNonStriker ? 'bg-emerald-50 dark:bg-sports-primary/5' : ''}`}>
                                                 <div className="col-span-6 md:col-span-5">
                                                     <div className={`font-bold text-sm ${isOut ? 'text-slate-400 dark:text-sports-muted' : 'text-slate-900 dark:text-white'}`}>
                                                         {p.name} {isStriker && <span className="text-sports-primary">*</span>}
                                                     </div>
                                                     {isOut && <div className="text-[10px] text-red-500/80 font-mono mt-0.5">out</div>}
                                                 </div>
                                                 <div className="col-span-2 md:col-span-1 text-right font-mono font-bold text-slate-900 dark:text-white">{p.stats.runs}</div>
                                                 <div className="col-span-2 md:col-span-1 text-right font-mono text-slate-500 dark:text-sports-muted text-xs">{p.stats.balls}</div>
                                                 <div className="hidden md:block col-span-1 text-right font-mono text-slate-500 dark:text-sports-muted text-xs">{p.stats.fours}</div>
                                                 <div className="hidden md:block col-span-1 text-right font-mono text-slate-500 dark:text-sports-muted text-xs">{p.stats.sixes}</div>
                                                 <div className="col-span-2 md:col-span-3 text-right font-mono text-xs text-slate-500 dark:text-sports-muted">{getSR(p.stats.runs, p.stats.balls)} <span className="text-[9px]">SR</span></div>
                                             </div>
                                         )
                                     })}
                                 </div>
                             </div>

                             {/* Bowling Table */}
                             <div className="glass-panel rounded-xl overflow-hidden">
                                 <div className="px-5 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
                                     <h3 className="font-tech font-bold text-lg text-slate-800 dark:text-white uppercase tracking-wider">Bowling</h3>
                                     <span className="text-xs font-bold text-sports-accent">{bowlingTeam?.name}</span>
                                 </div>
                                 <div className="divide-y divide-slate-200 dark:divide-white/5">
                                     {bowlingTeam?.players.filter(p => p.stats.oversBowled > 0 || p.id === currentInnings.currentBowlerId).map(p => {
                                         const isCurrent = currentInnings.currentBowlerId === p.id;
                                         return (
                                            <div key={p.id} className={`grid grid-cols-12 items-center py-3 px-4 ${isCurrent ? 'bg-cyan-50 dark:bg-sports-accent/5' : ''}`}>
                                                 <div className="col-span-5">
                                                     <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                                         {p.name} {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-sports-accent animate-pulse"></span>}
                                                     </div>
                                                 </div>
                                                 <div className="col-span-2 text-right font-mono text-slate-900 dark:text-white text-sm">{formatOvers(p.stats.oversBowled)}</div>
                                                 <div className="col-span-2 text-right font-mono text-slate-500 dark:text-sports-muted text-sm">{p.stats.runsConceded}</div>
                                                 <div className="col-span-1 text-right font-mono font-bold text-sports-primary text-sm">{p.stats.wickets}</div>
                                                 <div className="col-span-2 text-right font-mono text-xs text-slate-500 dark:text-sports-muted">{getEcon(p.stats.runsConceded, p.stats.oversBowled)} <span className="text-[9px]">ECO</span></div>
                                            </div>
                                         )
                                     })}
                                 </div>
                             </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && currentInnings && (
                        <MatchAnalytics match={activeMatch} innings1={activeMatch.innings1!} innings2={activeMatch.innings2} />
                    )}

                    {activeTab === 'commentary' && currentInnings && (
                        <div className="space-y-4">
                            {currentInnings.history.slice().reverse().map((ball) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={ball.id} 
                                    className="relative pl-6 pb-6 border-l border-slate-200 dark:border-white/10 last:pb-0"
                                >
                                    <div className={`absolute -left-[14px] top-0 w-7 h-7 rounded-full border-4 border-sports-white dark:border-sports-black flex items-center justify-center text-[10px] font-bold shadow-lg
                                        ${ball.isWicket ? 'bg-red-500 text-white' : 
                                          ball.runsScored === 4 ? 'bg-blue-500 text-white' : 
                                          ball.runsScored === 6 ? 'bg-emerald-500 text-white' : 
                                          'bg-slate-200 dark:bg-sports-surface text-slate-600 dark:text-sports-muted'
                                        }`}>
                                        {ball.isWicket ? 'W' : ball.runsScored}
                                    </div>
                                    <div className="bg-white dark:bg-white/5 rounded-r-xl rounded-bl-xl p-3 ml-2 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:bg-white/10 transition-colors shadow-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-mono text-xs text-sports-primary font-bold">{ball.overNumber}.{ball.ballInOver}</span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{ball.commentary}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'info' && currentInnings && (
                         <div className="grid gap-6">
                             <div className="glass-panel p-6 rounded-2xl text-center relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-16 bg-blue-500/10 rounded-full blur-2xl"></div>
                                 <h3 className="font-tech text-slate-500 dark:text-sports-muted uppercase tracking-widest text-xs font-bold mb-4">Current Partnership</h3>
                                 <div className="text-6xl font-display font-bold text-slate-900 dark:text-white mb-2">
                                     {currentInnings.currentPartnership.runs}
                                 </div>
                                 <div className="text-sm font-mono text-slate-500 dark:text-sports-muted mb-6">{currentInnings.currentPartnership.balls} balls</div>
                                 
                                 <div className="flex justify-center gap-8 items-center">
                                     <div className="text-right">
                                         <div className="font-bold text-slate-900 dark:text-white">{battingTeam?.players.find(p=>p.id===currentInnings.currentPartnership.batter1Id)?.name}</div>
                                     </div>
                                     <div className="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
                                     <div className="text-left">
                                         <div className="font-bold text-slate-900 dark:text-white">{battingTeam?.players.find(p=>p.id===currentInnings.currentPartnership.batter2Id)?.name}</div>
                                     </div>
                                 </div>
                             </div>

                             <div className="glass-panel p-6 rounded-2xl">
                                 <h3 className="font-tech text-slate-500 dark:text-sports-muted uppercase tracking-widest text-xs font-bold mb-4">Match Info</h3>
                                 <div className="grid grid-cols-2 gap-4 text-sm">
                                     <div>
                                         <div className="text-slate-500 dark:text-sports-muted text-xs uppercase mb-1">Date</div>
                                         <div className="text-slate-900 dark:text-white font-mono">{new Date(activeMatch.date).toLocaleDateString()}</div>
                                     </div>
                                     <div>
                                         <div className="text-slate-500 dark:text-sports-muted text-xs uppercase mb-1">Format</div>
                                         <div className="text-slate-900 dark:text-white font-mono">{activeMatch.totalOvers} Overs</div>
                                     </div>
                                     <div>
                                         <div className="text-slate-500 dark:text-sports-muted text-xs uppercase mb-1">Toss</div>
                                         <div className="text-slate-900 dark:text-white">{teams.find(t=>t.id===activeMatch.toss?.winnerId)?.name} opt to {activeMatch.toss?.choice}</div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    )}
                    
                    {!currentInnings && (
                        <div className="text-center py-20">
                             <Clock className="w-16 h-16 text-slate-300 dark:text-sports-muted mx-auto mb-4 opacity-50"/>
                             <h3 className="text-2xl font-display text-slate-900 dark:text-white mb-2">MATCH STARTING SOON</h3>
                             <p className="text-slate-500 dark:text-sports-muted">The teams are warming up. Waiting for the toss and first ball.</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    </div>
  );
};

export default MatchCenter;