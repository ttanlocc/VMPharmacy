'use client';

import { motion } from 'framer-motion';
import Container from '@/components/Container';
import TodayStats from '@/components/home/TodayStats';
import HomeActions from '@/components/home/HomeActions';
import RecentTemplates from '@/components/home/RecentTemplates';

export default function Home() {
    return (
        <Container>
            {/* Desktop: Header aligned left */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Nhà thuốc Văn Minh</h1>
                    <p className="text-slate-500 text-sm font-medium">Chào buổi sáng, Dược sĩ!</p>
                </div>
                <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 p-1 shadow-sm">
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4"
                        alt="Avatar"
                        className="rounded-xl h-full w-full object-cover"
                    />
                </div>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
                {/* Quick Action - Primary CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-full max-w-2xl"
                >
                    <HomeActions />
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-2xl"
                >
                    <TodayStats />
                </motion.div>
            </div>

            {/* Recent Templates */}
            <RecentTemplates />
        </Container>
    );
}
