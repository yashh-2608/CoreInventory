'use client';

import React, { createContext, useContext, useState } from 'react';

interface Settings {
  lowStockThreshold: number;
  currency: string;
  notifications: {
    inventoryRecap: boolean;
    criticalAlerts: boolean;
    logisticsSync: boolean;
  };
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  lowStockThreshold: 10,
  currency: 'USD ($)',
  notifications: {
    inventoryRecap: true,
    criticalAlerts: true,
    logisticsSync: true,
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getInitialSettings = (): Settings => {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  const saved = localStorage.getItem('ci-settings');
  if (!saved) {
    return defaultSettings;
  }

  try {
    return JSON.parse(saved) as Settings;
  } catch (error) {
    console.error('Failed to parse settings', error);
    return defaultSettings;
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(getInitialSettings);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((previous) => {
      const updated = { ...previous, ...newSettings };
      localStorage.setItem('ci-settings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};
