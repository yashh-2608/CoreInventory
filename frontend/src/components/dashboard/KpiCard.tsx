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
      className={`
        p-6 rounded-[14px] backdrop-blur-[12px] transition-all duration-300 group
        bg-[var(--ci-card)] border border-[var(--ci-border)]
        hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]
        ${onClick ? 'cursor-pointer hover:border-[var(--ci-accent)]/30' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-[var(--ci-glass)] group-hover:scale-110 transition-transform">
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-[var(--ci-text-muted)] font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold tracking-tight text-[var(--ci-text)]">{value}</h3>
      </div>
    </motion.div>
  );
};
