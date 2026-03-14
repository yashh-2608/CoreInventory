'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Warehouse, 
  ArrowLeftRight, 
  ClipboardCheck, 
  BarChart3, 
  Activity 
} from 'lucide-react';

const features = [
  {
    title: 'Product Management',
    desc: 'Centralize your SKU catalog with ease.',
    icon: Package,
    color: 'text-blue-400',
  },
  {
    title: 'Warehouse Tracking',
    desc: 'Real-time multi-location stock visibility.',
    icon: Warehouse,
    color: 'text-purple-400',
  },
  {
    title: 'Stock In / Out',
    desc: 'Seamless receipts and delivery confirmations.',
    icon: ClipboardCheck,
    color: 'text-emerald-400',
  },
  {
    title: 'Internal Transfers',
    desc: 'Move stock between locations securely.',
    icon: ArrowLeftRight,
    color: 'text-orange-400',
  },
  {
    title: 'Inventory Adjustments',
    desc: 'Keep records accurate with documented changes.',
    icon: Activity,
    color: 'text-red-400',
  },
  {
    title: 'Smart Reports',
    desc: 'Actionable analytics for stock valuation.',
    icon: BarChart3,
    color: 'text-pink-400',
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Powerful Features for Small to Enterprise</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to digitize your warehouse operations in one unified platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:bg-white/10 transition-all cursor-default"
          >
            <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <feature.icon className={`w-6 h-6 ${feature.color}`} />
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
