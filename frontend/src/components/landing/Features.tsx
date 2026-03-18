'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Warehouse, 
  ArrowLeftRight, 
  ClipboardCheck, 
  BarChart3, 
  Activity,
  X,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    title: 'Product Management',
    desc: 'Centralize your SKU catalog with ease.',
    icon: Package,
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    glow: 'bg-blue-500/5',
    details: {
      headline: 'Your Complete SKU Catalog in One Place',
      body: 'Register every product with a unique SKU, category, unit of measure, and opening stock. Keep your product master clean, searchable, and always up-to-date.',
      bullets: [
        'Create and manage unlimited SKUs',
        'Assign categories and units of measure (PCS, KG, BOX, LTR)',
        'Set opening stock for accurate baseline inventory',
        'Full product history and audit trail',
        'Export product catalog to CSV',
      ],
    },
  },
  {
    title: 'Warehouse Tracking',
    desc: 'Real-time multi-location stock visibility.',
    icon: Warehouse,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    glow: 'bg-purple-500/5',
    details: {
      headline: 'Know Exactly Where Your Stock Is – Always',
      body: 'Manage unlimited warehouse locations and visualize stock distribution per product, per warehouse, in real time. Never lose track of inventory across your network.',
      bullets: [
        'Register multiple warehouses with location and capacity',
        'View live per-warehouse stock levels per SKU',
        'Monitor warehouse utilization and available capacity',
        'Real-time inventory sync across all locations',
        'Drill-down reporting per warehouse',
      ],
    },
  },
  {
    title: 'Stock In / Out',
    desc: 'Seamless receipts and delivery confirmations.',
    icon: ClipboardCheck,
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'bg-emerald-500/5',
    details: {
      headline: 'Streamlined Inbound and Outbound Operations',
      body: 'Create stock receipts from suppliers and delivery orders to customers. Save drafts, validate when ready, and let the system automatically update your live inventory.',
      bullets: [
        'Create draft receipts and deliveries',
        'Add multiple SKUs and quantities per operation',
        'Validate receipt/delivery to update live stock',
        'Pending receipts & deliveries tracked on dashboard',
        'Full ledger entry created on every confirmation',
      ],
    },
  },
  {
    title: 'Internal Transfers',
    desc: 'Move stock between locations securely.',
    icon: ArrowLeftRight,
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    glow: 'bg-orange-500/5',
    details: {
      headline: 'Move Inventory Safely Across Locations',
      body: 'Create internal transfer orders to move stock from one warehouse to another. The system handles the deduction and addition automatically with a full audit trail.',
      bullets: [
        'Select source and destination warehouses',
        'Multi-product transfers in a single order',
        'Draft → Pending → Completed workflow',
        'Automatic TRANSFER_IN / TRANSFER_OUT ledger entries',
        'Prevents accidental negative stock transfers',
      ],
    },
  },
  {
    title: 'Inventory Adjustments',
    desc: 'Keep records accurate with documented changes.',
    icon: Activity,
    color: 'text-red-400',
    border: 'border-red-500/30',
    glow: 'bg-red-500/5',
    details: {
      headline: 'Fix Discrepancies with Full Documentation',
      body: 'When physical stock counts differ from system records, create an adjustment with a reason. Every change is logged in the ledger for compliance and traceability.',
      bullets: [
        'Record counted vs system quantity',
        'Mandatory reason field for every adjustment',
        'Automatic signed adjustment entry in the ledger',
        'Full adjustment history per product and warehouse',
        'Supports both positive and negative corrections',
      ],
    },
  },
  {
    title: 'Smart Reports',
    desc: 'Actionable analytics for stock valuation.',
    icon: BarChart3,
    color: 'text-pink-400',
    border: 'border-pink-500/30',
    glow: 'bg-pink-500/5',
    details: {
      headline: 'Turn Data Into Decisions',
      body: 'Access a comprehensive suite of reports: stock valuation, movement history, low stock alerts, pending operations, and category distribution. Filter and export with one click.',
      bullets: [
        'Full stock ledger with filters by product / warehouse',
        'Low stock alerts with configurable thresholds',
        'Category distribution pie chart',
        'CSV export for every report',
        'Real-time dashboard KPIs at a glance',
      ],
    },
  },
];

export const Features: React.FC = () => {
  const [selected, setSelected] = useState<typeof features[0] | null>(null);

  return (
    <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4 text-[var(--ci-text)]">Powerful Features for Small to Enterprise</h2>
        <p className="text-[var(--ci-text-muted)] max-w-2xl mx-auto">Everything you need to digitize your warehouse operations. Click any feature to learn more.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelected(feature)}
            className="group p-8 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-[2.5rem] hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className={`w-16 h-16 bg-[var(--ci-glass)] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10 elevation-sm`}>
              <feature.icon className={`w-8 h-8 ${feature.color}`} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[var(--ci-text)] relative z-10">{feature.title}</h3>
            <p className="text-[var(--ci-text-muted)] leading-relaxed text-sm relative z-10">{feature.desc}</p>
            
            <div className="mt-6 flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0 relative z-10">
              Learn More <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-2xl bg-[var(--ci-bg)] border border-[var(--ci-border)] rounded-[3rem] shadow-2xl overflow-hidden p-12"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-10">
                <div className={`p-4 bg-[var(--ci-glass)] rounded-2xl`}>
                  <selected.icon className={`w-10 h-10 ${selected.color}`} />
                </div>
                <button 
                  onClick={() => setSelected(null)}
                  className="p-3 hover:bg-[var(--ci-glass)] rounded-full transition-colors text-[var(--ci-text-muted)]"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              <h2 className="text-4xl font-bold mb-4 text-[var(--ci-text)]">{selected.details.headline}</h2>
              <p className="text-xl text-[var(--ci-text-muted)] mb-10 leading-relaxed">
                {selected.details.body}
              </p>
              <ul className="space-y-3">
                {selected.details.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${selected.color}`} />
                    <span className="text-[var(--ci-text-muted)] text-sm leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
