'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp, 
  color,
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md transition-all group ${onClick ? 'cursor-pointer hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
      </div>
    </motion.div>
  );
};
