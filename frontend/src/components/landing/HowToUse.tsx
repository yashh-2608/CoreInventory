'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, LayoutDashboard, PackagePlus, ArrowRightLeft, BarChart2 } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Create Your Account',
    desc: 'Sign up in seconds. Set up your organization profile and invite your team members to get started.',
    icon: UserPlus,
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    glow: 'bg-blue-500/10',
  },
  {
    step: '02',
    title: 'Set Up Warehouses & Products',
    desc: 'Add your warehouse locations and define your product catalog. Organize SKUs with categories and units.',
    icon: LayoutDashboard,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    glow: 'bg-purple-500/10',
  },
  {
    step: '03',
    title: 'Record Stock Movements',
    desc: 'Log stock-in receipts and stock-out deliveries in real time. Every movement is timestamped and auditable.',
    icon: PackagePlus,
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'bg-emerald-500/10',
  },
  {
    step: '04',
    title: 'Transfer & Adjust Inventory',
    desc: 'Move stock between warehouses or make documented adjustments to keep your records perfectly accurate.',
    icon: ArrowRightLeft,
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    glow: 'bg-orange-500/10',
  },
  {
    step: '05',
    title: 'Analyze with Smart Reports',
    desc: 'Access the ledger and reports dashboard to view stock valuation, movement history, and actionable insights.',
    icon: BarChart2,
    color: 'text-pink-400',
    border: 'border-pink-500/30',
    glow: 'bg-pink-500/10',
  },
];

export const HowToUse: React.FC = () => {
  return (
    <section id="how-to-use" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-4"
        >
          Quick Start Guide
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold mb-4 text-[var(--ci-text)]"
        >
          How to Use CoreInventory?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-[var(--ci-text-muted)] max-w-2xl mx-auto"
        >
          Get your warehouse operations running in minutes. Follow these simple steps to unlock the full power of CoreInventory.
        </motion.p>
      </div>

      <div className="relative">
        {/* Vertical connector line */}
        <div className="hidden lg:block absolute left-1/2 -translate-x-px top-8 bottom-8 w-px bg-gradient-to-b from-blue-500/30 via-purple-500/20 to-pink-500/30" />

        <div className="flex flex-col gap-8">
          {steps.map((step, i) => {
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`flex flex-col lg:flex-row items-center gap-6 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
              >
                {/* Card */}
                <div className={`flex-1 group p-7 rounded-2xl border ${step.border} ${step.glow} bg-[var(--ci-card)] backdrop-blur-md hover:bg-[var(--ci-glass)] transition-all`}>
                  <div className="flex items-start gap-5">
                    <div className={`shrink-0 w-12 h-12 rounded-xl bg-[var(--ci-glass)] border ${step.border} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <step.icon className={`w-6 h-6 ${step.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-[var(--ci-text)]">{step.title}</h3>
                      <p className="text-[var(--ci-text-muted)] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>

                {/* Center step badge */}
                <div className="shrink-0 w-14 h-14 rounded-full bg-[var(--ci-bg)] border border-[var(--ci-border)] flex items-center justify-center z-10 shadow-lg">
                  <span className={`text-sm font-bold ${step.color}`}>{step.step}</span>
                </div>

                {/* Spacer for opposite side on desktop */}
                <div className="flex-1 hidden lg:block" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
