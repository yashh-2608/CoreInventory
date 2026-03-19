'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';

interface Option {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  
  placeholder?: string;
}

export default function SearchableSelect({ options, value, onChange, placeholder = "Select option..." }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => options.find(o => o.id === value), [options, value]);

  const filteredOptions = useMemo(() => {
    return options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full text-[var(--ci-text)]" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-3 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-xl flex items-center justify-between hover:bg-[var(--ci-card)] transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 ring-offset-0"
      >
        <span className={selectedOption ? "text-[var(--ci-text)] truncate pr-2" : "text-[var(--ci-text-muted)] truncate pr-2"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-[var(--ci-text-muted)] transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="absolute z-50 w-full mt-2 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden backdrop-blur-xl"
          >
            <div className="p-3 border-b border-[var(--ci-border)] relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ci-text-muted)]" />
              <input
                autoFocus
                type="text"
                placeholder="Type to filter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-[var(--ci-border)] rounded-xl text-sm text-[var(--ci-text)] focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-[var(--ci-text-muted)]"
              />
            </div>

            <div className="max-h-[250px] overflow-y-auto pr-1">
              {filteredOptions.length === 0 ? (
                <p className="p-8 text-center text-xs text-[var(--ci-text-muted)] italic uppercase tracking-widest opacity-50">Empty Set</p>
              ) : (
                <div className="p-1">
                  {filteredOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onChange(opt.id);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all hover:bg-white/10 flex items-center justify-between group ${value === opt.id ? 'bg-blue-600/10 text-blue-500' : 'text-[var(--ci-text-muted)]'}`}
                    >
                      <span className="font-medium group-hover:text-[var(--ci-text)] transition-colors truncate">{opt.name}</span>
                      {value === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
