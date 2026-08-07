"use client";

import DocumentList from "./DocumentList";
import { ChatSession } from "@/lib/types";
import {
  Landmark,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Trash2,
} from "lucide-react";
import FileUpload from "./FileUpload";
import StatusBadge from "./StatusBadge";
import ThemeToggle from "./ThemeToggle";

interface Props {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onUploaded: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  uploadRefreshKey: number;
}

export default function Sidebar({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onUploaded,
  collapsed,
  onToggleCollapse,
  uploadRefreshKey,
}: Props) {
  /* ---------- DARALTILMIŞ ---------- */
  if (collapsed) {
    return (
      <aside className="relative z-10 flex h-full w-14 flex-col items-center gap-2 border-r border-line bg-deep py-4">
        <div
          className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            background: "linear-gradient(135deg, var(--gold-bright), var(--gold))",
          }}
        >
          <Landmark size={15} strokeWidth={2.2} className="text-black/80" />
        </div>

        <button
          onClick={onToggleCollapse}
          className="rounded-lg p-2 text-faint transition-colors hover:text-gold"
        >
          <PanelLeftOpen size={16} />
        </button>

        <button
          onClick={onNew}
          className="btn-gold flex h-8 w-8 items-center justify-center rounded-lg"
        >
          <Plus size={15} strokeWidth={2.6} />
        </button>

        <div className="mt-auto">
          <ThemeToggle />
        </div>
      </aside>
    );
  }

  /* ---------- AÇIK ---------- */
  return (
    <aside className="relative z-10 flex h-full w-[268px] flex-col border-r border-line bg-deep">
      {/* Marka */}
      <div className="px-4 pb-4 pt-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, var(--gold-bright), var(--gold))",
                boxShadow: "0 0 24px -8px var(--gold-glow)",
              }}
            >
              <Landmark size={17} strokeWidth={2} className="text-black/80" />
            </div>
            <div>
              <h1 className="font-display text-[15px] leading-tight tracking-wide text-ink">
                Mevzuat Asistanı
              </h1>
              <div className="mt-1">
                <StatusBadge />
              </div>
            </div>
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1 text-faint transition-colors hover:text-gold"
          >
            <PanelLeftClose size={15} />
          </button>
        </div>

        <button
          onClick={onNew}
          className="btn-gold mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[12.5px] font-semibold tracking-wide"
        >
          <Plus size={14} strokeWidth={3} />
          Yeni Görüşme
        </button>
      </div>

      <div className="mx-4 hairline" />

      {/* Sohbetler */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3">
        <p className="px-2 pb-2 text-[9.5px] uppercase tracking-[0.2em] text-faint">
          Görüşmeler
        </p>

        {sessions.length === 0 && (
          <p className="px-2 py-3 text-[11.5px] text-faint">Henüz kayıt yok.</p>
        )}

        <div className="space-y-0.5">
          {sessions.map((s) => {
            const active = activeId === s.id;

            return (
              <div
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={`gold-slide group relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2.5 py-2 text-[12.5px] transition-all duration-200 ${
                  active
                    ? "bg-surface text-ink"
                    : "text-muted hover:bg-surface2 hover:text-ink"
                }`}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r"
                    style={{
                      background: "var(--gold)",
                      boxShadow: "0 0 8px var(--gold-glow)",
                    }}
                  />
                )}

                <span className="flex-1 truncate pl-1">{s.title}</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(s.id);
                  }}
                  className="shrink-0 text-faint opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-4 hairline" />

      {/* Kaynaklar */}
      <div className="px-4 py-4">
        <p className="pb-2.5 text-[9.5px] uppercase tracking-[0.2em] text-faint">
          Kaynak Arşivi
        </p>
        <FileUpload onUploaded={onUploaded} />

        <div className="mt-3">
          <DocumentList refreshKey={uploadRefreshKey} />
        </div>
      </div>

      {/* Alt bar */}
      <div className="flex items-center justify-between border-t border-line px-4 py-3">
        <span className="text-[9.5px] uppercase tracking-[0.16em] text-faint">
          RAG · v1.0
        </span>
        <ThemeToggle />
      </div>
    </aside>
  );
}