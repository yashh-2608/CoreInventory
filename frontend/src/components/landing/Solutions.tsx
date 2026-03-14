'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Globe, Factory, Zap } from 'lucide-react';

const solutions = [
  {
    title: 'E-commerce Fulfillment',
    desc: 'Sync stock across Shopify, Amazon, and Magento in one high-octane dashboard.',
    icon: ShoppingCart,
    color: 'text-blue-400',
  },
  {
    title: 'Global Distribution',
    desc: 'Manage multiple warehouse hubs with real-time latency-free synchronization.',
    icon: Globe,
    color: 'text-emerald-400',
  },
  {
    title: 'Precision Manufacturing',
    desc: 'Track raw materials and finished goods with surgical precision.',
    icon: Factory,
    color: 'text-purple-400',
  },
];

export const Solutions: React.FC = () => {
  return (
    <section id="solutions" className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for the <span className="text-blue-500">Fastest Teams</span> on Earth.</h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                    CoreInventory isn't just a database. It's a high-performance engine designed for industries that demand zero latency and 100% accuracy.
                </p>
                <div className="space-y-4">
                    {solutions.map((sol, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all">
                            <div className="p-3 bg-white/5 rounded-xl">
                                <sol.icon className={`w-6 h-6 ${sol.color}`} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{sol.title}</h4>
                                <p className="text-sm text-gray-500">{sol.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="relative">
                <div className="absolute -inset-4 bg-blue-500/10 blur-3xl opacity-20" />
                <div className="relative p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-8">
                        <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Industry Performance</span>
                    </div>
                    <div className="space-y-6">
                        {[
                            { name: 'Data Sync Speed', val: '0.4ms' },
                            { name: 'Uptime Reliability', val: '99.99%' },
                            { name: 'Global Hub Latency', val: '< 15ms' }
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-gray-400 uppercase tracking-wider">{stat.name}</span>
                                    <span className="text-blue-400">{stat.val}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '100%' }}
                                        className="h-full bg-blue-500/50"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};
