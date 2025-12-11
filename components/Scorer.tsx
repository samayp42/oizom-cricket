import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertTriangle, X, Check } from 'lucide-react';
import { formatOvers } from '../utils/nrr';
import { WicketType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Scorer = () => {
  const { activeMatch, teams, recordBall, undoLastBall, endMatch, setNextBowler, isAdmin } = useTournament();
  const navigate = useNavigate();

  // Local state for modals
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [wicketType, setWicketType] = useState<WicketType | null>(null);
  const [whoOut, setWhoOut] = useState('');
  const [newBatter, setNewBatter] = useState('');

  useEffect(() => {
      if (!activeMatch) navigate('/');
  }, [activeMatch, navigate]);

  if (!activeMatch) return null;

  const currentInnings = activeMatch.innings2 || activeMatch.innings1;
  if (!currentInnings) return <div className="text-white flex items-center justify-center h-screen">Loading...</div>;

  const battingTeam = teams.find(t => t.id === currentInnings.battingTeamId);
  const bowlingTeam = teams.find(t => t.id === currentInnings.bowlingTeamId);
  const striker = battingTeam?.players.find(p => p.id === currentInnings.strikerId);
  const nonStriker = battingTeam?.players.find(p => p.id === currentInnings.nonStrikerId);
  const currentBowler = bowlingTeam?.players.find(p => p.id === currentInnings.currentBowlerId);

  const needsBowler = activeMatch.playStatus === 'waiting_for_bowler';
  const isFreeHit = currentInnings.isFreeHit;

  // --- Handlers ---
  const handleScore = (runs: number) => {
    recordBall(activeMatch.id, {
        id: Math.random().toString(), overNumber: Math.floor(currentInnings.overs), ballInOver: 0,
        bowlerId: currentInnings.currentBowlerId, batterId: currentInnings.strikerId, runsScored: runs,
        extras: 0, extraType: null, isWicket: false, wicketType: null, isValidBall: true
    });
  };

  const handleExtra = (type: 'wide' | 'no-ball') => {
      recordBall(activeMatch.id, {
          id: Math.random().toString(), overNumber: Math.floor(currentInnings.overs), ballInOver: 0,
          bowlerId: currentInnings.currentBowlerId, batterId: currentInnings.strikerId, runsScored: 0,
          extras: 1, extraType: type, isWicket: false, wicketType: null, isValidBall: false
      });
  };

  const submitWicket = () => {
      if (!wicketType || !whoOut || !newBatter) return;
      recordBall(activeMatch.id, {
          id: Math.random().toString(), overNumber: Math.floor(currentInnings.overs), ballInOver: 0,
          bowlerId: currentInnings.currentBowlerId, batterId: currentInnings.strikerId, runsScored: 0,
          extras: 0, extraType: null, isWicket: true, wicketType: wicketType, wicketPlayerId: whoOut, isValidBall: true
      }, newBatter);
      setShowWicketModal(false); setWicketType(null); setWhoOut(''); setNewBatter('');
  };

  // Button Component for Uniformity
  const ScoreBtn = ({ label, val, color, onClick, span = 1 }: any) => (
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className={`relative overflow-hidden rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-lg font-display font-bold text-3xl
            ${color === 'blue' ? 'bg-blue-600 border-blue-800 text-white' : 
              color === 'green' ? 'bg-emerald-500 border-emerald-700 text-black' :
              color === 'red' ? 'bg-rose-600 border-rose-800 text-white' :
              color === 'gray' ? 'bg-slate-700 border-slate-900 text-white' :
              'bg-slate-800 border-black text-white'}
        `}
        style={{ gridColumn: `span ${span}`}}
      >
          {label || val}
      </motion.button>
  );

  return (
    <div className="h-screen bg-sports-black text-white flex flex-col overflow-hidden font-sans">
        
        {/* --- Top Info Deck (Static Height) --- */}
        <div className="flex-none bg-sports-surface p-4 pb-2 border-b border-white/5 relative z-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => navigate('/')} className="p-2 bg-white/5 rounded-full"><ArrowLeft size={20}/></button>
                <div className="text-center">
                    <div className="font-tech text-xs uppercase tracking-widest text-sports-muted">{battingTeam?.name} vs {bowlingTeam?.name}</div>
                </div>
                {isAdmin && <button onClick={() => endMatch(activeMatch.id)} className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded border border-red-500/20">END</button>}
            </div>

            {/* Score Main */}
            <div className="flex justify-between items-end mb-2">
                <div>
                    <div className="text-7xl font-display font-bold leading-none tracking-tight">{currentInnings.totalRuns}/{currentInnings.wickets}</div>
                    <div className="font-mono text-sports-primary text-lg">{formatOvers(currentInnings.overs)} <span className="text-slate-500 text-sm">/ {activeMatch.totalOvers} ov</span></div>
                </div>
                <div className="text-right">
                     <div className="text-xs text-sports-muted uppercase tracking-wider mb-1">Current Bowler</div>
                     <div className="text-xl font-bold">{currentBowler?.name}</div>
                     <div className="font-mono text-sm text-sports-muted">{currentBowler?.stats.wickets}-{currentBowler?.stats.runsConceded} <span className="text-[10px]">({formatOvers(currentBowler?.stats.oversBowled || 0)})</span></div>
                </div>
            </div>

            {/* Batters Strip */}
            <div className="grid grid-cols-2 gap-2 mt-4">
                <div className={`p-3 rounded-xl border flex justify-between items-center ${currentInnings.strikerId === striker?.id ? 'bg-sports-primary/10 border-sports-primary text-white' : 'bg-black/20 border-transparent text-slate-500'}`}>
                    <span className="font-bold text-sm truncate mr-2">{striker?.name}*</span>
                    <span className="font-mono text-sm">{striker?.stats.runs}</span>
                </div>
                <div className={`p-3 rounded-xl border flex justify-between items-center ${currentInnings.strikerId === nonStriker?.id ? 'bg-sports-primary/10 border-sports-primary text-white' : 'bg-black/20 border-transparent text-slate-500'}`}>
                    <span className="font-bold text-sm truncate mr-2">{nonStriker?.name}</span>
                    <span className="font-mono text-sm">{nonStriker?.stats.runs}</span>
                </div>
            </div>
            
            {/* Free Hit Banner */}
            <AnimatePresence>
                {isFreeHit && (
                    <motion.div 
                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center text-xs font-black tracking-[0.2em] py-2 mt-2 rounded shadow-lg"
                    >
                        FREE HIT ACTIVE
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* --- Middle: Ball Timeline (Scrollable) --- */}
        <div className="flex-1 bg-black/40 overflow-y-auto relative">
             <div className="absolute inset-0 p-4 space-y-2">
                 {currentInnings.history.slice().reverse().map((ball) => (
                     <div key={ball.id} className="flex gap-3 text-sm text-slate-400 border-l border-white/5 pl-4 relative">
                         <span className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700 border-2 border-black"></span>
                         <span className="font-mono text-sports-primary">{ball.overNumber}.{ball.ballInOver}</span>
                         <span className="text-white">{ball.commentary}</span>
                     </div>
                 ))}
             </div>
        </div>

        {/* --- Bottom: Control Deck --- */}
        {isAdmin ? (
            <div className="flex-none bg-sports-card border-t border-white/10 p-4 pb-8 safe-area-pb">
                <div className="grid grid-cols-4 gap-3 h-64">
                    {/* Row 1 */}
                    <ScoreBtn val="0" onClick={() => handleScore(0)} />
                    <ScoreBtn val="1" onClick={() => handleScore(1)} />
                    <ScoreBtn val="2" onClick={() => handleScore(2)} />
                    <ScoreBtn val="4" color="blue" onClick={() => handleScore(4)} />

                    {/* Row 2 */}
                    <ScoreBtn label="WD" span={1} color="gray" onClick={() => handleExtra('wide')} />
                    <ScoreBtn val="3" onClick={() => handleScore(3)} />
                    <ScoreBtn label="NB" span={1} color="gray" onClick={() => handleExtra('no-ball')} />
                    <ScoreBtn val="6" color="green" onClick={() => handleScore(6)} />

                    {/* Row 3 - Actions */}
                    <ScoreBtn label="UNDO" span={2} color="gray" onClick={() => undoLastBall(activeMatch.id)} />
                    <ScoreBtn label="OUT" span={2} color="red" onClick={() => setShowWicketModal(true)} />
                </div>
            </div>
        ) : (
            <div className="p-6 bg-sports-card text-center text-sports-muted font-tech uppercase tracking-widest border-t border-white/10">
                View Only Mode
            </div>
        )}

        {/* --- MODALS --- */}
        <AnimatePresence>
            {needsBowler && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
                    <div className="w-full max-w-sm">
                        <h2 className="text-3xl font-display font-bold text-white text-center mb-6">NEXT BOWLER</h2>
                        <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-2">
                            {bowlingTeam?.players.filter(p => p.id !== currentInnings.currentBowlerId).map(p => (
                                <motion.button whileTap={{ scale: 0.98 }} key={p.id} onClick={() => setNextBowler(activeMatch.id, p.id)} className="p-5 bg-white/5 hover:bg-sports-primary hover:text-black rounded-xl text-left font-bold border border-white/10 transition-colors">
                                    {p.name}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {showWicketModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-sm sm:p-4">
                    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-sports-card w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-white/10 p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-tech font-bold text-red-500 uppercase tracking-wider">Wicket Fall</h2>
                            <button onClick={() => setShowWicketModal(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><X size={20}/></button>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Who */}
                            <div>
                                <label className="text-xs text-sports-muted uppercase tracking-widest font-bold mb-3 block">Dismissed Player</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[currentInnings.strikerId, currentInnings.nonStrikerId].map(pid => {
                                        const p = battingTeam?.players.find(pl => pl.id === pid);
                                        return (
                                            <button key={pid} onClick={() => setWhoOut(pid)} className={`p-4 rounded-xl border transition-all text-left ${whoOut === pid ? 'bg-red-600 border-red-500 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                                                <div className="text-xs uppercase opacity-70">{pid === currentInnings.strikerId ? 'Striker' : 'Non-Striker'}</div>
                                                <div className="font-bold">{p?.name}</div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* How */}
                            <div>
                                <label className="text-xs text-sports-muted uppercase tracking-widest font-bold mb-3 block">Dismissal Method</label>
                                <div className="flex flex-wrap gap-2">
                                    {['bowled', 'caught', 'run-out', 'lbw', 'stumped'].map(t => {
                                        const disabled = isFreeHit && t !== 'run-out';
                                        return (
                                            <button key={t} disabled={disabled} onClick={() => setWicketType(t as WicketType)} 
                                                className={`px-4 py-2 text-sm uppercase font-bold rounded-lg border transition-all ${wicketType === t ? 'bg-white text-black border-white' : disabled ? 'opacity-25' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                                                {t}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* New Batter */}
                            <div>
                                <label className="text-xs text-sports-muted uppercase tracking-widest font-bold mb-3 block">Incoming Batter</label>
                                <select className="w-full bg-black/50 border border-white/20 p-4 rounded-xl text-white outline-none focus:border-sports-primary appearance-none" value={newBatter} onChange={e => setNewBatter(e.target.value)}>
                                    <option value="">Select Player...</option>
                                    {battingTeam?.players.filter(p => !currentInnings.battingOrder.includes(p.id)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>

                            <button onClick={submitWicket} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl uppercase tracking-widest shadow-lg shadow-red-900/20">
                                Confirm Wicket
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default Scorer;