import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { useNavigate } from 'react-router-dom';
import { Users, Play, Flag, Trophy, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const MatchSetup = () => {
  const { teams, createMatch, activeMatch, updateMatchToss, startInnings, isAdmin } = useTournament();
  const navigate = useNavigate();
  
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [overs, setOvers] = useState(10);
  const [striker, setStriker] = useState('');
  const [nonStriker, setNonStriker] = useState('');
  const [bowler, setBowler] = useState('');

  useEffect(() => {
      if(!isAdmin) navigate('/');
  }, [isAdmin, navigate]);

  const step = !activeMatch ? 1 : activeMatch.status === 'toss' ? 2 : activeMatch.status === 'scheduled' || activeMatch.status === 'innings_break' ? 3 : 4;

  useEffect(() => {
      if (step === 4) navigate('/scorer');
  }, [step, navigate]);

  const handleCreate = () => { if (teamA && teamB && teamA !== teamB) createMatch(teamA, teamB, overs); };
  const handleToss = (winnerId: string, choice: 'bat' | 'bowl') => { if (activeMatch) updateMatchToss(activeMatch.id, winnerId, choice); };
  const handleStartPlay = () => { if (activeMatch && striker && nonStriker && bowler && striker !== nonStriker) startInnings(activeMatch.id, striker, nonStriker, bowler); };

  // Common wrapper
  const WizardWrapper = ({ children, title, subtitle }: any) => (
      <div className="min-h-screen bg-sports-black flex items-center justify-center p-6">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-2xl">
               <div className="mb-8 text-center">
                   <h1 className="text-4xl font-display font-bold text-white mb-2">{title}</h1>
                   <p className="text-sports-muted text-lg">{subtitle}</p>
               </div>
               <div className="bg-sports-card border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sports-primary to-sports-accent"></div>
                   {children}
               </div>
          </motion.div>
      </div>
  );

  // Inputs style
  const selectClass = "w-full bg-black/40 border border-white/10 rounded-xl p-5 text-white outline-none focus:border-sports-primary transition-colors appearance-none text-lg";

  if (step === 1) {
    return (
        <WizardWrapper title="Match Configuration" subtitle="Select teams and match format">
            <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs text-sports-muted font-bold uppercase tracking-wider">Home Team</label>
                        <select className={selectClass} value={teamA} onChange={e => setTeamA(e.target.value)}>
                            <option value="">Select Team A</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-sports-muted font-bold uppercase tracking-wider">Away Team</label>
                        <select className={selectClass} value={teamB} onChange={e => setTeamB(e.target.value)}>
                            <option value="">Select Team B</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                     <label className="text-xs text-sports-muted font-bold uppercase tracking-wider">Overs per Innings</label>
                     <input type="number" value={overs} onChange={e => setOvers(parseInt(e.target.value))} className={selectClass} />
                </div>
                <button onClick={handleCreate} className="w-full bg-sports-primary hover:bg-emerald-400 text-sports-black font-bold py-5 rounded-xl uppercase tracking-widest text-sm shadow-neon transition-all">
                    Create Match
                </button>
            </div>
        </WizardWrapper>
    );
  }

  if (step === 2 && activeMatch) {
      const tA = teams.find(t => t.id === activeMatch.teamAId);
      const tB = teams.find(t => t.id === activeMatch.teamBId);
      return (
        <WizardWrapper title="The Coin Toss" subtitle="Who won and what did they choose?">
             <div className="grid grid-cols-2 gap-6">
                 {[tA, tB].map(t => t && (
                     <div key={t.id} className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-sports-accent transition-colors text-center group">
                          <div className="text-2xl font-display font-bold text-white mb-6 group-hover:text-sports-accent">{t.name}</div>
                          <div className="space-y-3">
                              <button onClick={() => handleToss(t.id, 'bat')} className="w-full py-3 bg-black/40 hover:bg-sports-primary hover:text-black border border-white/10 rounded-xl font-bold uppercase text-sm transition-all">Bat</button>
                              <button onClick={() => handleToss(t.id, 'bowl')} className="w-full py-3 bg-black/40 hover:bg-sports-primary hover:text-black border border-white/10 rounded-xl font-bold uppercase text-sm transition-all">Bowl</button>
                          </div>
                     </div>
                 ))}
             </div>
        </WizardWrapper>
      );
  }

  if (step === 3 && activeMatch) {
      let battingTeamId, bowlingTeamId;
      if (activeMatch.status === 'innings_break') {
         battingTeamId = activeMatch.innings1?.bowlingTeamId;
         bowlingTeamId = activeMatch.innings1?.battingTeamId;
      } else {
         const isTeamABattingFirst = (activeMatch.toss?.winnerId === activeMatch.teamAId && activeMatch.toss?.choice === 'bat') || 
                                     (activeMatch.toss?.winnerId === activeMatch.teamBId && activeMatch.toss?.choice === 'bowl');
         battingTeamId = isTeamABattingFirst ? activeMatch.teamAId : activeMatch.teamBId;
         bowlingTeamId = isTeamABattingFirst ? activeMatch.teamBId : activeMatch.teamAId;
      }
      const battingTeam = teams.find(t => t.id === battingTeamId);
      const bowlingTeam = teams.find(t => t.id === bowlingTeamId);

      return (
        <WizardWrapper title="Lineup Selection" subtitle="Confirm players for this innings">
             <div className="space-y-8">
                 <div className="p-6 bg-sports-primary/5 border border-sports-primary/20 rounded-2xl">
                     <h3 className="text-sports-primary font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2"><Target size={16}/> Batting: {battingTeam?.name}</h3>
                     <div className="grid md:grid-cols-2 gap-4">
                        <select className={selectClass} value={striker} onChange={e => setStriker(e.target.value)}>
                            <option value="">Striker</option>
                            {battingTeam?.players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <select className={selectClass} value={nonStriker} onChange={e => setNonStriker(e.target.value)}>
                            <option value="">Non-Striker</option>
                            {battingTeam?.players.filter(p => p.id !== striker).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                     </div>
                 </div>

                 <div className="p-6 bg-sports-danger/5 border border-sports-danger/20 rounded-2xl">
                     <h3 className="text-sports-danger font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2"><Users size={16}/> Bowling: {bowlingTeam?.name}</h3>
                     <select className={selectClass} value={bowler} onChange={e => setBowler(e.target.value)}>
                         <option value="">Opening Bowler</option>
                         {bowlingTeam?.players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                 </div>

                 <button onClick={handleStartPlay} className="w-full bg-white text-black font-bold py-5 rounded-xl uppercase tracking-widest text-lg shadow-lg hover:scale-[1.02] transition-transform">
                     Let's Play Ball
                 </button>
             </div>
        </WizardWrapper>
      );
  }

  return null;
};

export default MatchSetup;