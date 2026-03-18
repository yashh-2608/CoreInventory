'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    desc: 'Perfect for small shops just beginning to digitize.',
    features: ['1 Warehouse Hub', 'Up to 100 SKUs', 'CSV Exports', 'Community Support'],
    cta: 'Get Started Free',
    popular: false
  },
  {
    name: 'Professional',
    price: '$49',
    desc: 'The power choice for growing regional distributors.',
    features: ['5 Warehouse Hubs', 'Unlimited SKUs', 'Live Analytics', 'Priority Support', 'Custom Fields'],
    cta: 'Start Pro Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'Surgical precision for global logistics networks.',
    features: ['Unlimited Hubs', 'API Access', 'SSO & Multi-role', 'Dedicated Architect', 'White-labeling'],
    cta: 'Contact Sales',
    popular: false
  }
];

export const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4 text-[var(--ci-text)]">Transparent <span className="text-blue-500">Pricing</span></h2>
        <p className="text-[var(--ci-text-muted)] max-w-2xl mx-auto">Scalable tiers designed to grow alongside your logistics empire.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`relative p-8 rounded-3xl backdrop-blur-md border ${
                plan.popular 
                ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)]' 
                : 'bg-[var(--ci-card)] border-[var(--ci-border)]'
            }`}
          >
            {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-white" /> Recommended
                </div>
            )}
            
            <div className="mb-6">
                <h3 className="text-xl font-bold mb-2 text-[var(--ci-text)]">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[var(--ci-text)]">{plan.price}</span>
                    <span className="text-[var(--ci-text-muted)] text-sm font-medium">/month</span>
                </div>
            </div>
            
            <p className="text-[var(--ci-text-muted)] text-sm mb-8 leading-relaxed">{plan.desc}</p>
            
            <ul className="space-y-4 mb-10">
                {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-[var(--ci-text-muted)]">
                        <div className="p-1 bg-emerald-500/10 rounded-full">
                            <Check className="w-3 h-3 text-emerald-500" />
                        </div>
                        {feat}
                    </li>
                ))}
            </ul>
            
            <button className={`w-full py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${
                plan.popular
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30'
                : 'bg-[var(--ci-glass)] hover:opacity-80 text-[var(--ci-text)] border border-[var(--ci-border)]'
            }`}>
                {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
