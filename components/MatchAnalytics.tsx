import React from 'react';
import { InningsState, Match } from '../types';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart2, Target } from 'lucide-react';

interface AnalyticsProps {
    match: Match;
    innings1: InningsState;
    innings2?: InningsState;
}

const ProjectedScoreCard = ({ currentRuns, currentOvers, totalOvers }: { currentRuns: number, currentOvers: number, totalOvers: number }) => {
    const runRate = currentOvers > 0 ? currentRuns / currentOvers : 0;
    const remainingOvers = totalOvers - currentOvers;
    
    // Scenarios
    const projectedCRR = Math.round(currentRuns + (remainingOvers * runRate));
    const projected6 = Math.round(currentRuns + (remainingOvers * 6));
    const projected8 = Math.round(currentRuns + (remainingOvers * 8));
    const projected10 = Math.round(currentRuns + (remainingOvers * 10));

    return (
        <div className="glass-panel p-6 rounded-2xl mb-8">
            <h3 className="font-tech text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-sports-textDark dark:text-white">
                <Target className="text-sports-primary" size={20} /> Projected Score
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-sports-surfaceLight dark:bg-black/40 p-3 rounded-xl border border-slate-200 dark:border-white/10 text-center">
                    <div className="text-xs text-sports-muted uppercase font-bold">At Current Rate ({runRate.toFixed(1)})</div>
                    <div className="text-3xl font-display font-bold text-sports-primary mt-1">{projectedCRR}</div>
                </div>
                <div className="bg-sports-surfaceLight dark:bg-black/40 p-3 rounded-xl border border-slate-200 dark:border-white/10 text-center">
                    <div className="text-xs text-sports-muted uppercase font-bold">At 6 RPO</div>
                    <div className="text-2xl font-display font-bold text-slate-700 dark:text-white mt-1">{projected6}</div>
                </div>
                <div className="bg-sports-surfaceLight dark:bg-black/40 p-3 rounded-xl border border-slate-200 dark:border-white/10 text-center">
                    <div className="text-xs text-sports-muted uppercase font-bold">At 8 RPO</div>
                    <div className="text-2xl font-display font-bold text-slate-700 dark:text-white mt-1">{projected8}</div>
                </div>
                <div className="bg-sports-surfaceLight dark:bg-black/40 p-3 rounded-xl border border-slate-200 dark:border-white/10 text-center">
                    <div className="text-xs text-sports-muted uppercase font-bold">At 10 RPO</div>
                    <div className="text-2xl font-display font-bold text-slate-700 dark:text-white mt-1">{projected10}</div>
                </div>
            </div>
        </div>
    );
};

// --- Custom SVG Charts ---

const WormChart = ({ innings1, innings2, totalOvers }: AnalyticsProps & { totalOvers: number }) => {
    // Process data points: [{over: 1, runs: 5}, {over: 2, runs: 12}...]
    const getDataPoints = (inning: InningsState) => {
        let points = [{ x: 0, y: 0 }];
        let cumRuns = 0;
        let currentOver = 1;
        
        // Group balls by over
        // Simplified: We assume history is ordered. 
        // We need cumulative runs at the end of each over.
        // A robust way: Iterate 1 to totalOvers, sum runs.
        
        for (let i = 1; i <= totalOvers; i++) {
             // Find all balls in this over
             const ballsInOver = inning.history.filter(b => b.overNumber === i - 1); // overNumber is 0-indexed in history usually or we fixed it to be 0-indexed in context logic
             if (ballsInOver.length === 0 && i > Math.ceil(inning.overs)) break;

             const runsInOver = ballsInOver.reduce((sum, b) => sum + b.runsScored + b.extras, 0);
             cumRuns += runsInOver;
             points.push({ x: i, y: cumRuns });
        }
        return points;
    };

    const data1 = getDataPoints(innings1);
    const data2 = innings2 ? getDataPoints(innings2) : [];
    
    // Scales
    const maxY = Math.max(
        data1[data1.length-1]?.y || 0, 
        data2[data2.length-1]?.y || 0,
        innings1.totalRuns + 20 // Buffer
    );
    const width = 100;
    const height = 50;

    const toCoords = (pts: {x:number, y:number}[]) => {
        return pts.map(p => `${(p.x / totalOvers) * width},${height - (p.y / maxY) * height}`).join(' ');
    };

    return (
        <div className="glass-panel p-6 rounded-2xl mb-8">
            <h3 className="font-tech text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2 text-sports-textDark dark:text-white">
                <TrendingUp className="text-sports-accent" size={20} /> The Worm (Cumulative Runs)
            </h3>
            <div className="relative w-full aspect-[2/1] bg-sports-surfaceLight dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 p-4">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(t => (
                        <line key={t} x1="0" y1={t * height} x2={width} y2={t * height} stroke="currentColor" className="text-slate-300 dark:text-white/10" strokeWidth="0.2" />
                    ))}
                    
                    {/* Innings 1 Line */}
                    <polyline 
                        points={toCoords(data1)} 
                        fill="none" 
                        stroke="#10B981" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                    
                    {/* Innings 2 Line */}
                    {data2.length > 0 && (
                         <polyline 
                            points={toCoords(data2)} 
                            fill="none" 
                            stroke="#06B6D4" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            strokeDasharray="2,1"
                        />
                    )}
                </svg>
                
                {/* Labels */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 text-[10px] font-bold uppercase">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-1 bg-sports-primary rounded-full"></div>
                        <span className="text-sports-textDark dark:text-white">Innings 1</span>
                    </div>
                    {innings2 && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-1 bg-sports-accent rounded-full border border-dashed"></div>
                            <span className="text-sports-textDark dark:text-white">Innings 2</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ManhattanChart = ({ innings1, innings2, totalOvers }: AnalyticsProps & { totalOvers: number }) => {
    const getOverData = (inning: InningsState) => {
        let data = [];
        for (let i = 0; i < totalOvers; i++) {
             const balls = inning.history.filter(b => b.overNumber === i);
             if (balls.length === 0 && i >= inning.overs) break;
             const runs = balls.reduce((sum, b) => sum + b.runsScored + b.extras, 0);
             const wickets = balls.filter(b => b.isWicket).length;
             data.push({ over: i+1, runs, wickets });
        }
        return data;
    };

    const d1 = getOverData(innings1);
    
    // Scales
    const maxRuns = Math.max(...d1.map(d => d.runs), 15); // Min 15 for scale
    const width = 100;
    const height = 40;
    const barWidth = (width / totalOvers) * 0.6;

    return (
        <div className="glass-panel p-6 rounded-2xl">
            <h3 className="font-tech text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2 text-sports-textDark dark:text-white">
                <BarChart2 className="text-purple-500" size={20} /> Manhattan (Runs per Over)
            </h3>
            <div className="relative w-full aspect-[2/1] bg-sports-surfaceLight dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 p-4">
                 <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Grid */}
                    <line x1="0" y1={height} x2={width} y2={height} stroke="currentColor" className="text-slate-400 dark:text-white/20" strokeWidth="0.5" />
                    
                    {d1.map((d, i) => {
                        const h = (d.runs / maxRuns) * height;
                        const x = (i / totalOvers) * width + ((width/totalOvers) - barWidth)/2;
                        return (
                            <g key={i}>
                                <rect 
                                    x={x} 
                                    y={height - h} 
                                    width={barWidth} 
                                    height={h} 
                                    className="fill-slate-800 dark:fill-white/20 hover:fill-sports-primary transition-colors" 
                                    rx="1"
                                />
                                {d.wickets > 0 && (
                                    <circle cx={x + barWidth/2} cy={height - h - 2} r="1.5" className="fill-red-500" />
                                )}
                                <text x={x + barWidth/2} y={height + 5} fontSize="3" textAnchor="middle" className="fill-slate-500 dark:fill-white/40 font-mono">{d.over}</text>
                            </g>
                        )
                    })}
                 </svg>
                 <div className="absolute top-2 right-2 text-[10px] text-sports-muted">
                     <span className="text-red-500 font-bold">●</span> Wicket Fall
                 </div>
            </div>
        </div>
    );
};

const MatchAnalytics = (props: AnalyticsProps) => {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <ProjectedScoreCard 
                currentRuns={props.innings2 ? props.innings2.totalRuns : props.innings1.totalRuns}
                currentOvers={props.innings2 ? props.innings2.overs : props.innings1.overs}
                totalOvers={props.match.totalOvers}
            />
            
            <WormChart {...props} totalOvers={props.match.totalOvers} />
            
            <ManhattanChart {...props} totalOvers={props.match.totalOvers} />
        </motion.div>
    );
};

export default MatchAnalytics;
