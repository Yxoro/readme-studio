import type { LucideIcon } from "lucide-react";

export type EditorMode = "visual" | "raw";

export type AppView = "workspace" | "projects" | "documentation" | "settings";

export type EditorFontSize = "sm" | "md" | "lg";

export interface ReadmeDocument {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  editorFontSize: EditorFontSize;
  defaultEditorMode: EditorMode;
  previewOpenByDefault: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  tags: string[];
  content: string;
}

export interface ComponentSection {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  content: string;
}

export type FormatAction =
  | { type: "wrap"; before: string; after: string; placeholder: string }
  | { type: "linePrefix"; prefix: string; ordered?: boolean; toggleHeading?: boolean }
  | { type: "insert"; text: string; block?: boolean }
  | { type: "link" }
  | { type: "image" };

export interface FormatResult {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface MarkdownBlock {
  id: string;
  type: string;
  raw: string;
  start: number;
  end: number;
}

export interface QualityCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
  impact: number;
}

export interface QualityReport {
  score: number;
  grade: "excellent" | "good" | "fair" | "needs-work";
  checks: QualityCheck[];
  recommendations: string[];
}

export interface ToastMessage {
  id: string;
  message: string;
  variant: "success" | "error" | "info";
}

export interface StorageSnapshot {
  documents: ReadmeDocument[];
  activeId: string | null;
}

export type SaveStatus = "saved" | "saving" | "error";

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

export interface MarkdownEditorHandle {
  applyFormat: (action: FormatAction) => void;
  insertSnippet: (snippet: string) => void;
  focus: () => void;
}
