import {
  BookOpen,
  Blocks,
  FileText,
  FolderOpen,
  HardDrive,
  LayoutTemplate,
  Plus,
  Settings,
  X,
} from "lucide-react";
import type { AppView, ReadmeDocument } from "../types";
import { formatRelativeDate } from "../lib/format";
import { Logo } from "./Logo";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  view: AppView;
  documents: ReadmeDocument[];
  activeId: string | null;
  templatesOpen: boolean;
  componentsOpen: boolean;
  onNavigate: (view: AppView) => void;
  onOpenTemplates: () => void;
  onOpenComponents: () => void;
  onNewDocument: () => void;
  onOpenDocument: (id: string) => void;
  onHome: () => void;
}

const navItems: { view: AppView; label: string; icon: typeof FolderOpen }[] = [
  { view: "projects", label: "My Projects", icon: FolderOpen },
  { view: "documentation", label: "Documentation", icon: BookOpen },
  { view: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  open,
  onClose,
  view,
  documents,
  activeId,
  templatesOpen,
  componentsOpen,
  onNavigate,
  onOpenTemplates,
  onOpenComponents,
  onNewDocument,
  onOpenDocument,
  onHome,
}: SidebarProps) {
  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const navigate = (nextView: AppView) => {
    onNavigate(nextView);
    onClose();
  };

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#1D1D1F]/25 backdrop-blur-[2px] lg:hidden"
        />
      )}
      <aside
        aria-label="Primary navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[268px] shrink-0 flex-col border-r border-line bg-canvas transition-transform duration-200 ease-out lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 pb-4 pt-5">
          <button
            type="button"
            onClick={() => {
              onHome();
              onClose();
            }}
            aria-label="README Studio home"
            className="block w-[184px] rounded-md opacity-90 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            <Logo />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-white hover:text-ink lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-3.5">
          <button
            type="button"
            onClick={() => {
              onNewDocument();
              onClose();
            }}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-[#2C6EE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
          >
            <Plus size={15} strokeWidth={2.2} />
            New README
          </button>
        </div>

        <div className="mt-6 px-3.5">
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
            Workspace
          </p>
          <nav className="space-y-0.5">
            {navItems.slice(0, 1).map((item) => (
              <NavButton
                key={item.view}
                active={view === item.view && !templatesOpen && !componentsOpen}
                label={item.label}
                icon={item.icon}
                onClick={() => navigate(item.view)}
              />
            ))}
            <NavButton
              active={templatesOpen}
              label="Templates"
              icon={LayoutTemplate}
              onClick={() => {
                onOpenTemplates();
                onClose();
              }}
            />
            <NavButton
              active={componentsOpen}
              label="Components"
              icon={Blocks}
              onClick={() => {
                onOpenComponents();
                onClose();
              }}
            />
            {navItems.slice(1).map((item) => (
              <NavButton
                key={item.view}
                active={view === item.view && !templatesOpen && !componentsOpen}
                label={item.label}
                icon={item.icon}
                onClick={() => navigate(item.view)}
              />
            ))}
          </nav>
        </div>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto px-3.5 pb-4">
          <div className="mb-1.5 flex items-center justify-between px-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
              Recent documents
            </p>
            {documents.length > 0 && (
              <span className="text-[10px] tabular-nums text-muted">{documents.length}</span>
            )}
          </div>
          {recentDocuments.length === 0 ? (
            <p className="px-2 py-2 text-[12px] leading-relaxed text-muted">
              Your documents will appear here.
            </p>
          ) : (
            <div className="space-y-0.5">
              {recentDocuments.map((document) => {
                const active = document.id === activeId && view === "workspace";
                return (
                  <button
                    key={document.id}
                    type="button"
                    onClick={() => {
                      onOpenDocument(document.id);
                      onClose();
                    }}
                    title={document.name}
                    className={`group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors ${
                      active
                        ? "bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_0_0_1px_rgba(0,0,0,0.025)]"
                        : "text-[#515154] hover:bg-white/70 hover:text-ink"
                    }`}
                  >
                    <FileText
                      size={14}
                      className={active ? "shrink-0 text-accent" : "shrink-0 text-muted"}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium">
                        {document.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] text-muted">
                        {formatRelativeDate(document.updatedAt)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-line/80 px-4 py-4">
          <div className="flex items-start gap-2.5 rounded-lg px-1 py-1">
            <HardDrive size={14} className="mt-0.5 shrink-0 text-muted" />
            <div>
              <p className="text-[11px] font-medium text-[#515154]">Local workspace</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
                Documents stay in this browser. No account required.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

interface NavButtonProps {
  active: boolean;
  label: string;
  icon: typeof FolderOpen;
  onClick: () => void;
}

function NavButton({ active, label, icon: Icon, onClick }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex h-8 w-full items-center gap-2.5 rounded-lg px-2 text-[12.5px] font-medium transition-colors ${
        active
          ? "bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_0_0_1px_rgba(0,0,0,0.025)]"
          : "text-[#515154] hover:bg-white/70 hover:text-ink"
      }`}
    >
      <Icon size={15} className={active ? "text-accent" : "text-muted"} strokeWidth={1.8} />
      {label}
    </button>
  );
}
