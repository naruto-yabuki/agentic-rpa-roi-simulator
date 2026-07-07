"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  type AppSettings,
  type ProcessId,
  type ProcessSettings,
  buildDefaultSettings,
} from "./processBenchmarks";

const STORAGE_KEY = "agentic-rpa-roi-settings-v1";

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<Omit<AppSettings, "process">>) => void;
  updateProcessSetting: (id: ProcessId, patch: Partial<ProcessSettings>) => void;
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
        setSettings({ ...buildDefaultSettings(), ...parsed, process: { ...buildDefaultSettings().process, ...parsed.process } });
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

  const updateSettings = useCallback((patch: Partial<Omit<AppSettings, "process">>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateProcessSetting = useCallback((id: ProcessId, patch: Partial<ProcessSettings>) => {
    setSettings((prev) => ({
      ...prev,
      process: {
        ...prev.process,
        [id]: { ...prev.process[id], ...patch },
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
    () => ({ settings, updateSettings, updateProcessSetting, resetToDefaults, isCustomized }),
    [settings, updateSettings, updateProcessSetting, resetToDefaults, isCustomized],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
