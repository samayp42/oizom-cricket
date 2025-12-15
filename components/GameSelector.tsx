import React from 'react';
import { motion } from 'framer-motion';
import { Circle, Activity, Disc, Grip, Dna, Home } from 'lucide-react';
import { GameType } from '../types';
import { Link } from 'react-router-dom';

interface GameCardProps {
    title: string;
    icon: React.ReactNode;
    color: string;
    onClick: () => void;
    description: string;
}

const GameCard = ({ title, icon, color, onClick, description }: GameCardProps) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        className="relative overflow-hidden w-full aspect-square rounded-[32px] bg-white border border-slate-100 shadow-xl flex flex-col items-center justify-center p-8 group text-left"
    >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-${color}-500`} />

        <div className={`p-6 rounded-3xl bg-${color}-50 text-${color}-600 mb-6 shadow-sm group-hover:shadow-md transition-all`}>
            {icon}
        </div>

        <h3 className="text-3xl font-display font-black text-slate-800 mb-2 uppercase tracking-wide">
            {title}
        </h3>
        <p className="text-slate-400 font-medium text-center max-w-[200px] leading-relaxed">
            {description}
        </p>

        {/* Decorative elements */}
        <div className={`absolute -bottom-10 -right-10 w-40 h-40 bg-${color}-500/5 rounded-full blur-3xl`} />
        <div className={`absolute top-10 -left-10 w-20 h-20 bg-${color}-500/5 rounded-full blur-2xl`} />
    </motion.button>
);

export const GameSelector = ({ onSelect }: { onSelect: (game: GameType) => void }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-5xl mx-auto py-12 relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h2 className="text-4xl md:text-5xl font-display font-black text-slate-800 mb-4 uppercase tracking-wider">
                    Select Sport
                </h2>
                <p className="text-slate-500 text-lg font-medium">Choose a championship to manage</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4 mb-12">
                <GameCard
                    title="Cricket"
                    description="Manage T20 matches, scoring, and teams"
                    icon={<Circle size={48} />}
                    color="emerald"
                    onClick={() => onSelect('cricket')}
                />

                <GameCard
                    title="Badminton"
                    description="Knockout tournaments, singles & doubles"
                    icon={<Activity size={48} />}
                    color="blue"
                    onClick={() => onSelect('badminton')}
                />

                <GameCard
                    title="Table Tennis"
                    description="Fast-paced singles & doubles action"
                    icon={<Dna size={48} />}
                    color="orange"
                    onClick={() => onSelect('table_tennis')}
                />

                <GameCard
                    title="Chess"
                    description="Strategic mastermind battles"
                    icon={<Grip size={48} />}
                    color="slate"
                    onClick={() => onSelect('chess')}
                />

                <GameCard
                    title="Carrom"
                    description="Strike and pocket precision game"
                    icon={<Disc size={48} />}
                    color="amber"
                    onClick={() => onSelect('carrom')}
                />
            </div>

            <Link to="/">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-500 font-bold uppercase tracking-wider hover:text-emerald-600 hover:border-emerald-200 transition-colors shadow-sm"
                >
                    <Home size={18} />
                    Back to Dashboard
                </motion.button>
            </Link>
        </div>
    );
};
