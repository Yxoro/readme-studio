import { useCallback, useMemo, useRef, useState } from "react";
import type { ReadmeDocument } from "../types";
import { generateId } from "../lib/format";
import { loadDocuments } from "../lib/storage";

interface HistoryEntry {
  past: string[];
  future: string[];
  lastPushAt: number;
}

interface CreateDocumentInput {
  name?: string;
  content?: string;
}

interface UseDocumentsResult {
  documents: ReadmeDocument[];
  activeDocument: ReadmeDocument | null;
  activeId: string | null;
  createDocument: (input?: CreateDocumentInput) => string;
  openDocument: (id: string) => void;
  renameDocument: (id: string, name: string) => void;
  updateContent: (id: string, content: string) => void;
  deleteDocument: (id: string) => void;
  duplicateDocument: (id: string) => string | null;
  clearAllDocuments: () => void;
  undo: (id: string) => void;
  redo: (id: string) => void;
  canUndo: (id: string) => boolean;
  canRedo: (id: string) => boolean;
}

const HISTORY_LIMIT = 80;
const HISTORY_GROUP_MS = 700;

function makeUniqueName(base: string, documents: ReadmeDocument[]): string {
  const cleanBase = base.trim() || "Untitled README";
  const names = new Set(documents.map((document) => document.name.toLowerCase()));
  if (!names.has(cleanBase.toLowerCase())) return cleanBase;

  let index = 2;
  while (names.has(`${cleanBase} ${index}`.toLowerCase())) index += 1;
  return `${cleanBase} ${index}`;
}

export function useDocuments(): UseDocumentsResult {
  const [initial] = useState(() => loadDocuments());
  const [documents, setDocumentsState] = useState<ReadmeDocument[]>(initial.documents);
  const [activeId, setActiveId] = useState<string | null>(initial.activeId);
  const documentsRef = useRef(documents);
  const historyRef = useRef(new Map<string, HistoryEntry>());

  const setDocuments = useCallback((next: ReadmeDocument[]) => {
    documentsRef.current = next;
    setDocumentsState(next);
  }, []);

  const activeDocument = useMemo(
    () => documents.find((document) => document.id === activeId) ?? null,
    [documents, activeId],
  );

  const getHistory = useCallback((id: string): HistoryEntry => {
    const existing = historyRef.current.get(id);
    if (existing) return existing;

    const created: HistoryEntry = { past: [], future: [], lastPushAt: 0 };
    historyRef.current.set(id, created);
    return created;
  }, []);

  const createDocument = useCallback(
    (input: CreateDocumentInput = {}) => {
      const id = generateId();
      const now = new Date().toISOString();
      const current = documentsRef.current;
      const name = makeUniqueName(input.name ?? "Untitled README", current);
      const document: ReadmeDocument = {
        id,
        name,
        content: input.content ?? "",
        createdAt: now,
        updatedAt: now,
      };

      setDocuments([document, ...current]);
      setActiveId(id);
      return id;
    },
    [setDocuments],
  );

  const openDocument = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const renameDocument = useCallback(
    (id: string, name: string) => {
      const cleanName = name.trim() || "Untitled README";
      const current = documentsRef.current;
      setDocuments(
        current.map((document) =>
          document.id === id
            ? { ...document, name: cleanName, updatedAt: new Date().toISOString() }
            : document,
        ),
      );
    },
    [setDocuments],
  );

  const updateContent = useCallback(
    (id: string, content: string) => {
      const current = documentsRef.current;
      const document = current.find((candidate) => candidate.id === id);
      if (!document || document.content === content) return;

      const now = Date.now();
      const history = getHistory(id);
      if (now - history.lastPushAt > HISTORY_GROUP_MS) {
        history.past.push(document.content);
        if (history.past.length > HISTORY_LIMIT) history.past.shift();
      }
      history.future = [];
      history.lastPushAt = now;

      setDocuments(
        current.map((candidate) =>
          candidate.id === id
            ? { ...candidate, content, updatedAt: new Date(now).toISOString() }
            : candidate,
        ),
      );
    },
    [getHistory, setDocuments],
  );

  const deleteDocument = useCallback(
    (id: string) => {
      historyRef.current.delete(id);
      const next = documentsRef.current.filter((document) => document.id !== id);
      setDocuments(next);
      setActiveId((currentActiveId) =>
        currentActiveId === id ? (next[0]?.id ?? null) : currentActiveId,
      );
    },
    [setDocuments],
  );

  const duplicateDocument = useCallback(
    (id: string): string | null => {
      const current = documentsRef.current;
      const original = current.find((document) => document.id === id);
      if (!original) return null;

      const newId = generateId();
      const now = new Date().toISOString();
      const copy: ReadmeDocument = {
        ...original,
        id: newId,
        name: makeUniqueName(`${original.name} copy`, current),
        createdAt: now,
        updatedAt: now,
      };

      setDocuments([copy, ...current]);
      return newId;
    },
    [setDocuments],
  );

  const clearAllDocuments = useCallback(() => {
    historyRef.current.clear();
    setDocuments([]);
    setActiveId(null);
  }, [setDocuments]);

  const undo = useCallback(
    (id: string) => {
      const history = getHistory(id);
      const previous = history.past.pop();
      if (previous === undefined) return;

      const current = documentsRef.current;
      const document = current.find((candidate) => candidate.id === id);
      if (!document) return;

      history.future.push(document.content);
      history.lastPushAt = 0;
      setDocuments(
        current.map((candidate) =>
          candidate.id === id
            ? { ...candidate, content: previous, updatedAt: new Date().toISOString() }
            : candidate,
        ),
      );
    },
    [getHistory, setDocuments],
  );

  const redo = useCallback(
    (id: string) => {
      const history = getHistory(id);
      const nextContent = history.future.pop();
      if (nextContent === undefined) return;

      const current = documentsRef.current;
      const document = current.find((candidate) => candidate.id === id);
      if (!document) return;

      history.past.push(document.content);
      history.lastPushAt = 0;
      setDocuments(
        current.map((candidate) =>
          candidate.id === id
            ? { ...candidate, content: nextContent, updatedAt: new Date().toISOString() }
            : candidate,
        ),
      );
    },
    [getHistory, setDocuments],
  );

  const canUndo = useCallback(
    (id: string) => (historyRef.current.get(id)?.past.length ?? 0) > 0,
    [],
  );
  const canRedo = useCallback(
    (id: string) => (historyRef.current.get(id)?.future.length ?? 0) > 0,
    [],
  );

  return {
    documents,
    activeDocument,
    activeId,
    createDocument,
    openDocument,
    renameDocument,
    updateContent,
    deleteDocument,
    duplicateDocument,
    clearAllDocuments,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
