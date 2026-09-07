import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_RULES } from "../data/rules";
import {
  applyChanges,
  scanContacts,
  type ContactMatch,
} from "../lib/contacts";
import type { MigrationRule } from "../lib/numbers";
import {
  createBackup,
  getLatestBackup,
  restoreFromBackup,
  type BackupInfo,
  type RestoreResult,
} from "../lib/backup";

const RULES_KEY = "prefixfix.rules.v1";
const APPLIED_KEY = "prefixfix.appliedAt";

export interface ApplyResult {
  contactsUpdated: number;
  numbersUpdated: number;
  contactsFailed: number;
}

interface AppContextValue {
  rules: MigrationRule[];
  addRule: (rule: MigrationRule) => void;
  removeRule: (index: number) => void;
  resetRules: () => void;

  matches: ContactMatch[];
  totalContacts: number;
  totalNumbersToUpdate: number;
  scanning: boolean;
  scanError: string | null;
  scan: () => Promise<void>;

  appliedAt: string | null;
  applying: boolean;
  apply: () => Promise<ApplyResult>;

  backup: BackupInfo | null;
  createBackupNow: () => Promise<BackupInfo>;
  restore: (uri: string) => Promise<RestoreResult>;
  lastRestore: RestoreResult | null;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [rules, setRules] = useState<MigrationRule[]>(DEFAULT_RULES);
  const [matches, setMatches] = useState<ContactMatch[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [appliedAt, setAppliedAt] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [backup, setBackup] = useState<BackupInfo | null>(null);
  const [lastRestore, setLastRestore] = useState<RestoreResult | null>(null);

  const matchesRef = useRef<ContactMatch[]>(matches);
  matchesRef.current = matches;

  const rulesRef = useRef<MigrationRule[]>(rules);
  rulesRef.current = rules;

  useEffect(() => {
    (async () => {
      try {
        const [rulesRaw, appliedRaw, latestBackup] = await Promise.all([
          AsyncStorage.getItem(RULES_KEY),
          AsyncStorage.getItem(APPLIED_KEY),
          getLatestBackup(),
        ]);

        if (rulesRaw) {
          const parsed = JSON.parse(rulesRaw) as MigrationRule[];

          if (Array.isArray(parsed) && parsed.length > 0) {
            setRules(parsed);
          }
        } else {
          await AsyncStorage.setItem(
            RULES_KEY,
            JSON.stringify(DEFAULT_RULES)
          );
        }

        if (appliedRaw) {
          setAppliedAt(appliedRaw);
        }

        if (latestBackup) {
          setBackup(latestBackup);
        }
      } catch {
        // Non-fatal: fall back to defaults.
      }
    })();
  }, []);

  const persistRules = useCallback(async (next: MigrationRule[]) => {
    setRules(next);

    try {
      await AsyncStorage.setItem(RULES_KEY, JSON.stringify(next));
    } catch {
      // Rules still apply for this session even if persistence fails.
    }
  }, []);

  const addRule = useCallback(
    (rule: MigrationRule) => {
      persistRules([...rulesRef.current, rule]);
    },
    [persistRules]
  );

  const removeRule = useCallback(
    (index: number) => {
      const next = rulesRef.current.filter((_, i) => i !== index);
      persistRules(next);
    },
    [persistRules]
  );

  const resetRules = useCallback(() => {
    persistRules(DEFAULT_RULES);
  }, [persistRules]);

  const scan = useCallback(async () => {
    setScanning(true);
    setScanError(null);

    try {
      const result = await scanContacts(rulesRef.current);

      setMatches(result.contacts);
      setTotalContacts(result.totalContacts);
    } catch (e) {
      setScanError(
        e instanceof Error ? e.message : "Could not read contacts."
      );
    } finally {
      setScanning(false);
    }
  }, []);

  const apply = useCallback(async (): Promise<ApplyResult> => {
    setApplying(true);

    try {
      const saved = await createBackup();
      setBackup(saved);

      const result = await applyChanges(matchesRef.current);

      const ts = new Date().toISOString();

      await AsyncStorage.setItem(APPLIED_KEY, ts);
      setAppliedAt(ts);

      return result;
    } finally {
      setApplying(false);
    }
  }, []);

  const createBackupNow = useCallback(async (): Promise<BackupInfo> => {
    const info = await createBackup();
    setBackup(info);
    return info;
  }, []);

  const restore = useCallback(
    async (uri: string): Promise<RestoreResult> => {
      const result = await restoreFromBackup(uri);
      setLastRestore(result);
      return result;
    },
    []
  );

  const value = useMemo<AppContextValue>(
    () => ({
      rules,
      addRule,
      removeRule,
      resetRules,

      matches,
      totalContacts,
      totalNumbersToUpdate: matches.reduce(
        (n, m) => n + m.changes.length,
        0
      ),
      scanning,
      scanError,
      scan,

      appliedAt,
      applying,
      apply,

      backup,
      createBackupNow,
      restore,
      lastRestore,
    }),
    [
      rules,
      addRule,
      removeRule,
      resetRules,
      matches,
      totalContacts,
      scanning,
      scanError,
      scan,
      appliedAt,
      applying,
      apply,
      backup,
      createBackupNow,
      restore,
      lastRestore,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);

  if (!ctx) {
    throw new Error("useApp must be used inside <AppProvider>");
  }

  return ctx;
}


