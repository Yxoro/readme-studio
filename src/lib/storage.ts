import type { AppSettings, ReadmeDocument, StorageSnapshot } from "../types";

const DOCUMENTS_KEY = "readme-studio.documents.v1";
const ACTIVE_KEY = "readme-studio.active-document.v1";
const SETTINGS_KEY = "readme-studio.settings.v1";

export const DEFAULT_SETTINGS: AppSettings = {
  editorFontSize: "md",
  defaultEditorMode: "visual",
  previewOpenByDefault: true,
};

function isDocument(value: unknown): value is ReadmeDocument {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.content === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string"
  );
}

function normalizeDocument(document: ReadmeDocument): ReadmeDocument {
  if (typeof document.repository !== "string") {
    return { ...document, repository: undefined };
  }

  const repository = document.repository.trim();
  return { ...document, repository: repository || undefined };
}

export function loadDocuments(): StorageSnapshot {
  try {
    const raw = window.localStorage.getItem(DOCUMENTS_KEY);
    if (!raw) return { documents: [], activeId: null };

    const parsed: unknown = JSON.parse(raw);
    const documents = Array.isArray(parsed)
      ? parsed.filter(isDocument).map(normalizeDocument)
      : [];
    const storedActive = window.localStorage.getItem(ACTIVE_KEY);
    const activeId =
      storedActive && documents.some((document) => document.id === storedActive)
        ? storedActive
        : documents[0]?.id ?? null;

    return { documents, activeId };
  } catch {
    return { documents: [], activeId: null };
  }
}

export function saveDocuments(snapshot: StorageSnapshot): void {
  window.localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(snapshot.documents));
  if (snapshot.activeId) {
    window.localStorage.setItem(ACTIVE_KEY, snapshot.activeId);
  } else {
    window.localStorage.removeItem(ACTIVE_KEY);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_SETTINGS };
    const candidate = parsed as Partial<AppSettings>;

    return {
      editorFontSize:
        candidate.editorFontSize === "sm" ||
        candidate.editorFontSize === "md" ||
        candidate.editorFontSize === "lg"
          ? candidate.editorFontSize
          : DEFAULT_SETTINGS.editorFontSize,
      defaultEditorMode:
        candidate.defaultEditorMode === "visual" || candidate.defaultEditorMode === "raw"
          ? candidate.defaultEditorMode
          : DEFAULT_SETTINGS.defaultEditorMode,
      previewOpenByDefault:
        typeof candidate.previewOpenByDefault === "boolean"
          ? candidate.previewOpenByDefault
          : DEFAULT_SETTINGS.previewOpenByDefault,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function clearStoredData(): void {
  window.localStorage.removeItem(DOCUMENTS_KEY);
  window.localStorage.removeItem(ACTIVE_KEY);
  window.localStorage.removeItem(SETTINGS_KEY);
}
