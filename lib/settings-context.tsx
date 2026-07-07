"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  type AppSettings,
  type IndustryId,
  type IndustrySettings,
  buildDefaultSettings,
} from "./industryBenchmarks";

const STORAGE_KEY = "agentic-rpa-roi-settings-v1";

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<Omit<AppSettings, "industry">>) => void;
  updateIndustrySetting: (id: IndustryId, patch: Partial<IndustrySettings>) => void;
  resetToDefaults: () => void;
  isCustomized: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => buildDefaultSettings());
  const [hydrated, setHydrated] = useState(false);

  // 商談直前のリロード事故対策として localStorage に同期 (8-2 「あると良い」)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppSettings;
        setSettings({ ...buildDefaultSettings(), ...parsed, industry: { ...buildDefaultSettings().industry, ...parsed.industry } });
      }
    } catch {
      // 破損データは無視してデフォルトのまま使う
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ストレージ利用不可でも計算自体は継続できるため無視
    }
  }, [settings, hydrated]);

  const updateSettings = useCallback((patch: Partial<Omit<AppSettings, "industry">>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateIndustrySetting = useCallback((id: IndustryId, patch: Partial<IndustrySettings>) => {
    setSettings((prev) => ({
      ...prev,
      industry: {
        ...prev.industry,
        [id]: { ...prev.industry[id], ...patch },
      },
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    const defaults = buildDefaultSettings();
    setSettings(defaults);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const isCustomized = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(buildDefaultSettings());
  }, [settings]);

  const value = useMemo(
    () => ({ settings, updateSettings, updateIndustrySetting, resetToDefaults, isCustomized }),
    [settings, updateSettings, updateIndustrySetting, resetToDefaults, isCustomized],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
