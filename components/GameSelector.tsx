import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle, Activity, Disc, Grip, Dna, Home, Trophy, Zap, Star } from 'lucide-react';
import { GameType } from '../types';
import { Link } from 'react-router-dom';

// Sport configurations with unique themes
const SPORTS_CONFIG = {
    cricket: {
        title: 'Cricket',
        description: 'T20 Matches & Scoring',
        icon: Circle,
        gradient: 'from-emerald-500 to-lime-400',
        bgGradient: 'from-emerald-50 to-lime-50',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        borderColor: 'border-emerald-200',
        glowColor: 'shadow-emerald-500/30',
        accentEmoji: '🏏',
    },
    badminton: {
        title: 'Badminton',
        description: 'Knockout Tournaments',
        icon: Activity,
        gradient: 'from-blue-500 to-indigo-500',
        bgGradient: 'from-blue-50 to-indigo-50',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        borderColor: 'border-blue-200',
        glowColor: 'shadow-blue-500/30',
        accentEmoji: '🏸',
    },
    table_tennis: {
        title: 'Table Tennis',
        description: 'Doubles Action',
        icon: Dna,
        gradient: 'from-orange-500 to-red-500',
        bgGradient: 'from-orange-50 to-red-50',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        borderColor: 'border-orange-200',
        glowColor: 'shadow-orange-500/30',
        accentEmoji: '🏓',
    },
    chess: {
        title: 'Chess',
        description: 'Strategic Battles',
        icon: Grip,
        gradient: 'from-slate-600 to-zinc-500',
        bgGradient: 'from-slate-50 to-zinc-50',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
        borderColor: 'border-slate-200',
        glowColor: 'shadow-slate-500/30',
        accentEmoji: '♟️',
    },
    carrom: {
        title: 'Carrom',
        description: 'Strike & Pocket',
        icon: Disc,
        gradient: 'from-amber-500 to-yellow-400',
        bgGradient: 'from-amber-50 to-yellow-50',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        borderColor: 'border-amber-200',
        glowColor: 'shadow-amber-500/30',
        accentEmoji: '🎯',
    },
};

interface GameCardProps {
    sport: keyof typeof SPORTS_CONFIG;
    onClick: () => void;
    isHovered: boolean;
    onHover: (sport: string | null) => void;
}

const GameCard = ({ sport, onClick, isHovered, onHover }: GameCardProps) => {
    const config = SPORTS_CONFIG[sport];
    const Icon = config.icon;

    return (
        <motion.button
            onClick={onClick}
            onMouseEnter={() => onHover(sport)}
            onMouseLeave={() => onHover(null)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
                scale: 1.05,
                rotateX: 5,
                rotateY: -5,
                z: 50,
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`relative overflow-hidden w-full aspect-[4/5] rounded-[32px] bg-gradient-to-br ${config.bgGradient} border-2 ${config.borderColor} flex flex-col items-center justify-center p-6 md:p-8 group cursor-pointer`}
            style={{
                transformStyle: 'preserve-3d',
                perspective: 1000,
            }}
        >
            {/* Animated gradient overlay */}
            <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
            />

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={`absolute w-2 h-2 rounded-full bg-gradient-to-br ${config.gradient} opacity-20`}
                        style={{
                            left: `${20 + i * 15}%`,
                            top: `${10 + (i % 3) * 30}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                            duration: 3 + i * 0.5,
                            repeat: Infinity,
                            delay: i * 0.3,
                        }}
                    />
                ))}
            </div>

            {/* Glow effect on hover */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1.2 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`absolute -inset-4 bg-gradient-to-br ${config.gradient} rounded-[48px] blur-3xl opacity-20 -z-10`}
                    />
                )}
            </AnimatePresence>

            {/* Icon container with animation */}
            <motion.div
                className={`relative p-5 md:p-6 rounded-3xl ${config.iconBg} ${config.iconColor} mb-4 md:mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                animate={isHovered ? { rotate: [0, 10, -10, 0], scale: 1.1 } : { rotate: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Icon size={40} strokeWidth={2} />
                {/* Sparkle on hover */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="absolute -top-1 -right-1"
                        >
                            <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Emoji accent */}
            <motion.span
                className="text-3xl md:text-4xl mb-3"
                animate={isHovered ? { scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] } : {}}
                transition={{ duration: 0.6 }}
            >
                {config.accentEmoji}
            </motion.span>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-display font-black text-slate-800 mb-1 uppercase tracking-wide">
                {config.title}
            </h3>
            <p className="text-slate-400 font-medium text-center text-sm md:text-base max-w-[180px] leading-relaxed">
                {config.description}
            </p>

            {/* Bottom shine effect */}
            <motion.div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />

            {/* Corner badge */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={isHovered ? { scale: 1, rotate: 360 } : { scale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                    <Star size={20} className={`${config.iconColor} fill-current opacity-50`} />
                </motion.div>
            </div>
        </motion.button>
    );
};

export const GameSelector = ({ onSelect }: { onSelect: (game: GameType) => void }) => {
    const [hoveredSport, setHoveredSport] = useState<string | null>(null);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-6xl mx-auto py-8 md:py-12 px-4 relative overflow-hidden">
            {/* Background animated elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-emerald-200/30 to-blue-200/30 blur-3xl"
                    style={{ top: '-20%', left: '-10%' }}
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                />
                <motion.div
                    className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br from-orange-200/20 to-amber-200/20 blur-3xl"
                    style={{ bottom: '-10%', right: '-5%' }}
                    animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
                    transition={{ duration: 15, repeat: Infinity }}
                />
            </div>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-10 md:mb-16 relative z-10"
            >
                <motion.div
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-200 mb-6"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Trophy size={16} className="text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Championship Hub</span>
                </motion.div>
                <h2 className="text-3xl md:text-5xl font-display font-black text-slate-800 mb-3 uppercase tracking-wider">
                    Select Your Sport
                </h2>
                <p className="text-slate-500 text-base md:text-lg font-medium max-w-md mx-auto">
                    Choose a championship to manage and track live scores
                </p>
            </motion.div>

            {/* Sports Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 w-full relative z-10 mb-10 md:mb-16">
                {(Object.keys(SPORTS_CONFIG) as GameType[]).map((sport, index) => (
                    <motion.div
                        key={sport}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <GameCard
                            sport={sport}
                            onClick={() => onSelect(sport)}
                            isHovered={hoveredSport === sport}
                            onHover={setHoveredSport}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Back to Dashboard */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Link to="/">
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white border-2 border-slate-200 text-slate-500 font-bold uppercase tracking-wider hover:text-emerald-600 hover:border-emerald-300 transition-all shadow-lg hover:shadow-xl"
                    >
                        <Home size={20} />
                        Back to Dashboard
                    </motion.button>
                </Link>
            </motion.div>
        </div>
    );
};
