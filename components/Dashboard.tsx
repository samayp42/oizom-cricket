import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { Link } from 'react-router-dom';
import { formatOvers } from '../utils/nrr';
import { Trophy, Activity, ArrowRight, Zap, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

const PointsTable = ({ group, teams }: { group: string, teams: any[] }) => (
  <motion.div variants={itemVariants} className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
    <div className="bg-sports-surface/50 p-4 border-b border-white/5 flex justify-between items-center">
      <h3 className="font-tech text-xl font-bold tracking-wider text-sports-accent flex items-center gap-2">
        <div className="w-1 h-6 bg-sports-accent rounded-full"></div>
        GROUP {group}
      </h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-sports-muted uppercase font-bold bg-black/20">
          <tr>
            <th className="px-4 py-3">Team</th>
            <th className="px-2 py-3 text-center">P</th>
            <th className="px-2 py-3 text-center">W</th>
            <th className="px-2 py-3 text-center">L</th>
            <th className="px-2 py-3 text-center hidden sm:table-cell">NRR</th>
            <th className="px-4 py-3 text-right">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {teams
            .filter(t => t.group === group)
            .sort((a, b) => b.stats.points - a.stats.points || b.stats.nrr - a.stats.nrr)
            .map((team, idx) => (
            <tr key={team.id} className="hover:bg-white/5 transition-colors">
              <td className="px-4 py-3 font-bold text-white flex items-center gap-3">
                <span className={`text-[10px] w-5 h-5 flex items-center justify-center rounded font-tech ${idx < 2 ? 'bg-sports-primary text-black' : 'bg-white/10 text-gray-400'}`}>
                  {idx + 1}
                </span>
                <span className="truncate max-w-[120px] sm:max-w-none">{team.name}</span>
              </td>
              <td className="px-2 py-3 text-center font-mono text-gray-400">{team.stats.played}</td>
              <td className="px-2 py-3 text-center font-mono text-emerald-400">{team.stats.won}</td>
              <td className="px-2 py-3 text-center font-mono text-rose-400">{team.stats.lost}</td>
              <td className="px-2 py-3 text-center font-mono text-gray-500 hidden sm:table-cell">{team.stats.nrr}</td>
              <td className="px-4 py-3 text-right font-display text-xl text-sports-primary">{team.stats.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);

const LiveMatchCard = ({ match, teams }: { match: any, teams: any[] }) => {
    const tA = teams.find(t => t.id === match.teamAId);
    const tB = teams.find(t => t.id === match.teamBId);
    const inning = match.innings2 || match.innings1;
    const isLive = match.status === 'live' || match.status === 'innings_break';

    return (
      <motion.div 
        variants={itemVariants}
        className="relative group w-full"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-sports-primary to-sports-accent rounded-3xl opacity-30 group-hover:opacity-60 blur transition duration-1000 group-hover:duration-200"></div>
        <div className="relative glass-card rounded-2xl overflow-hidden p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-sports-danger/10 border border-sports-danger/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sports-danger opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sports-danger"></span>
                    </span>
                    <span className="text-sports-danger text-[10px] font-bold uppercase tracking-widest">Live Now</span>
                </div>
                <div className="text-xs font-tech tracking-wider text-sports-muted uppercase border border-white/10 px-2 py-1 rounded">
                    {match.groupStage ? 'Group Stage' : match.knockoutStage}
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="text-3xl md:text-5xl font-display font-bold text-white leading-none uppercase tracking-wide">
                            {tA?.name} <span className="text-sports-muted text-2xl mx-1">vs</span> {tB?.name}
                        </div>
                    </div>
                    
                    {inning ? (
                         <div className="flex items-baseline gap-4 mt-4">
                             <div className="text-6xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                                 {inning.totalRuns}/{inning.wickets}
                             </div>
                             <div className="flex flex-col">
                                 <span className="text-xl font-mono text-sports-primary">{formatOvers(inning.overs)} ov</span>
                                 <span className="text-xs text-sports-muted uppercase tracking-wider">CRR {(inning.totalRuns / (Math.max(0.1, inning.overs))).toFixed(2)}</span>
                             </div>
                         </div>
                    ) : (
                        <div className="text-4xl font-display text-white/20 mt-4">MATCH STARTING...</div>
                    )}
                </div>

                <Link to="/live" className="w-full md:w-auto">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full md:w-auto bg-sports-primary hover:bg-emerald-400 text-sports-black font-tech font-bold text-lg px-8 py-3 rounded-xl uppercase tracking-wider shadow-neon transition-colors flex items-center justify-center gap-2"
                    >
                        Watch Live <ArrowRight size={18} />
                    </motion.button>
                </Link>
            </div>
            
            {inning?.history?.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
                    <Activity size={16} className="text-sports-accent" />
                    <p className="text-sm text-sports-muted truncate font-mono">
                        {inning.history[inning.history.length - 1].commentary}
                    </p>
                </div>
            )}
        </div>
      </motion.div>
    );
}

const StatCard = ({ title, player, value, subtext, icon: Icon, color }: any) => (
    <motion.div variants={itemVariants} className="glass-panel p-4 rounded-xl flex items-center gap-4 relative overflow-hidden group">
        <div className={`absolute right-0 top-0 p-20 ${color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}></div>
        <div className={`w-12 h-12 rounded-lg ${color} bg-opacity-10 flex items-center justify-center border border-white/5`}>
            <Icon size={24} className="text-white" />
        </div>
        <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-sports-muted mb-1">{title}</div>
            <div className="text-lg font-bold text-white leading-none">{player || '—'}</div>
            <div className="text-xs text-sports-muted mt-1">
                <span className="text-white font-tech text-sm font-bold">{value}</span> {subtext}
            </div>
        </div>
    </motion.div>
);

const Dashboard = () => {
  const { teams, matches, activeMatch } = useTournament();
  const completedMatches = matches.filter(m => m.status === 'completed');

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-4 py-6 md:py-10 space-y-10"
    >
      {/* Active Match Section */}
      <section>
          {activeMatch && activeMatch.status !== 'completed' ? (
              <LiveMatchCard match={activeMatch} teams={teams} />
          ) : (
            <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-8 text-center border-dashed border-2 border-white/10">
                <Calendar className="w-12 h-12 text-sports-muted mx-auto mb-4" />
                <h3 className="text-xl font-display text-white tracking-wide">NO LIVE MATCHES</h3>
                <p className="text-sports-muted">The arena is quiet. Check back later.</p>
            </motion.div>
          )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content: Standings */}
          <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Trophy className="text-yellow-500 w-5 h-5" />
                  </div>
                  <h2 className="font-tech text-2xl font-bold text-white uppercase tracking-wider">Tournament Standings</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                  <PointsTable group="A" teams={teams} />
                  <PointsTable group="B" teams={teams} />
              </div>
          </div>

          {/* Sidebar: Stats & Feed */}
          <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-sports-accent/10 rounded-lg">
                    <TrendingUp className="text-sports-accent w-5 h-5" />
                  </div>
                  <h2 className="font-tech text-2xl font-bold text-white uppercase tracking-wider">Top Performers</h2>
              </div>

              <div className="space-y-4">
                  <StatCard 
                    title="Orange Cap" 
                    icon={Zap} 
                    color="bg-orange-500" 
                    player="Virat K." 
                    value="245" 
                    subtext="Runs" 
                  />
                  <StatCard 
                    title="Purple Cap" 
                    icon={Zap} 
                    color="bg-purple-500" 
                    player="Bumrah J." 
                    value="12" 
                    subtext="Wickets" 
                  />
              </div>

              {/* Recent Results */}
              <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-5">
                  <h3 className="font-tech text-lg font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Recent Results</h3>
                  <div className="space-y-4">
                      {completedMatches.slice(-3).reverse().map(m => (
                           <div key={m.id} className="group cursor-pointer">
                               <div className="flex justify-between text-[10px] text-sports-muted font-bold uppercase mb-1">
                                   <span>{new Date(m.date).toLocaleDateString()}</span>
                                   <span className="text-emerald-500">Finished</span>
                               </div>
                               <div className="text-sm font-bold text-white group-hover:text-sports-primary transition-colors">
                                   {teams.find(t=>t.id === m.teamAId)?.name} vs {teams.find(t=>t.id === m.teamBId)?.name}
                               </div>
                               <div className="text-xs text-sports-accent mt-1 font-mono">
                                   {m.resultMessage}
                               </div>
                           </div>
                       ))}
                       {completedMatches.length === 0 && <div className="text-sm text-sports-muted italic">No matches completed yet.</div>}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 text-center">
                      <button className="text-xs text-sports-primary font-bold uppercase tracking-widest flex items-center justify-center gap-1 hover:gap-2 transition-all">
                          View All Results <ChevronRight size={12}/>
                      </button>
                  </div>
              </motion.div>
          </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;