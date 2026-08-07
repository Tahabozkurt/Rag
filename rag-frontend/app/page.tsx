"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import ChatInput from "@/components/ChatInput";
import { ChatSession, Message } from "@/lib/types";
import { createSession, loadSessions, saveSessions } from "@/lib/storage";
import { sendChat } from "./api-client";
import { Eraser } from "lucide-react";

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [uploadRefreshKey, setUploadRefreshKey] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const s = loadSessions();
    if (s.length === 0) {
      const first = createSession();
      setSessions([first]);
      setActiveId(first.id);
    } else {
      setSessions(s);
      setActiveId(s[0].id);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveSessions(sessions);
  }, [sessions, hydrated]);

  // yeni sohbet / aktif sohbet değişince header glow resetlensin
  useEffect(() => {
    setScrolled(false);
  }, [activeId]);

  const active = sessions.find((s) => s.id === activeId) || null;

  const update = (id: string, fn: (s: ChatSession) => ChatSession) =>
    setSessions((p) => p.map((s) => (s.id === id ? fn(s) : s)));

  const handleNew = () => {
    const s = createSession();
    setSessions((p) => [s, ...p]);
    setActiveId(s.id);
  };

  const handleDelete = (id: string) => {
    setSessions((p) => {
      const f = p.filter((s) => s.id !== id);
      if (activeId === id) setActiveId(f[0]?.id ?? null);
      return f;
    });
  };

  const handleClear = () => {
    if (!active) return;
    update(active.id, (s) => ({
      ...s,
      messages: [],
      title: "Yeni Görüşme",
      updatedAt: Date.now(),
    }));
  };

  const handleSend = async (query: string) => {
    if (!active) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: query,
      timestamp: Date.now(),
    };

    update(active.id, (s) => ({
      ...s,
      messages: [...s.messages, userMsg],
      title: s.messages.length === 0 ? query.slice(0, 42) : s.title,
      updatedAt: Date.now(),
    }));

    setLoading(true);
    try {
      const history = [...active.messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendChat(query, history);

      update(active.id, (s) => ({
        ...s,
        messages: [
          ...s.messages,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: res.answer,
            sources: res.sources,
            hasSources: res.has_sources,
            timestamp: Date.now(),
          },
        ],
        updatedAt: Date.now(),
      }));
    } catch (e) {
      update(active.id, (s) => ({
        ...s,
        messages: [
          ...s.messages,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `**Bağlantı hatası.** ${(e as Error).message}\n\nBackend'in çalıştığından emin olun:\n\`uvicorn api:app --reload --port 8000\``,
            timestamp: Date.now(),
          },
        ],
        updatedAt: Date.now(),
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-app text-ink">
      <div className="aurora" />

      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNew}
        onDelete={handleDelete}
        onUploaded={() => setUploadRefreshKey((k) => k + 1)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        uploadRefreshKey={uploadRefreshKey}
      />

      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header
          className="glass flex items-center justify-between border-b border-line px-6 py-3 transition-all duration-300"
          style={{
            boxShadow: scrolled ? "0 10px 28px -18px var(--gold-glow)" : "none",
          }}
        >
          <div className="min-w-0">
            <p className="text-[9.5px] uppercase tracking-[0.22em] text-faint">
              Görüşme
            </p>
            <h2 className="truncate font-display text-[14px] tracking-wide text-ink">
              {active?.title || "—"}
            </h2>
          </div>

          {active && active.messages.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[11px] text-muted transition-all hover:border-gold hover:text-gold"
            >
              <Eraser size={12} />
              Temizle
            </button>
          )}
        </header>

        <ChatArea
          messages={active?.messages || []}
          loading={loading}
          onPick={handleSend}
          onScrollChange={setScrolled}
        />

        <ChatInput onSend={handleSend} disabled={loading || !active} />
      </main>
    </div>
  );
}