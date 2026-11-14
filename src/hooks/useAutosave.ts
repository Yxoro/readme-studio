import { useCallback, useEffect, useRef, useState } from "react";
import type { SaveStatus, StorageSnapshot } from "../types";

interface UseAutosaveResult {
  status: SaveStatus;
  lastSavedAt: string | null;
  saveNow: () => boolean;
}

export function useAutosave(
  snapshot: StorageSnapshot,
  save: (value: StorageSnapshot) => void,
  delay = 550,
): UseAutosaveResult {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const isInitial = useRef(true);
  const timer = useRef<number | null>(null);
  const latestSnapshot = useRef(snapshot);
  const saveRef = useRef(save);

  latestSnapshot.current = snapshot;
  saveRef.current = save;

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const commit = useCallback(() => {
    try {
      saveRef.current(latestSnapshot.current);
      setStatus("saved");
      setLastSavedAt(new Date().toISOString());
      return true;
    } catch {
      setStatus("error");
      return false;
    }
  }, []);

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }

    setStatus("saving");
    clearTimer();
    timer.current = window.setTimeout(() => {
      commit();
      timer.current = null;
    }, delay);

    return clearTimer;
  }, [snapshot, delay, clearTimer, commit]);

  const saveNow = useCallback(() => {
    clearTimer();
    return commit();
  }, [clearTimer, commit]);

  return { status, lastSavedAt, saveNow };
}
