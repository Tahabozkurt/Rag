"use client";

import { useEffect, useRef, UIEvent } from "react";
import { Message } from "@/lib/types";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { ArrowUpRight, Landmark } from "lucide-react";

interface Props {
  messages: Message[];
  loading: boolean;
  onPick: (q: string) => void;
  onScrollChange: (scrolled: boolean) => void;
}

const SUGGESTIONS = [
  { t: "Kredi kuruluşu tanımı", d: "Mevzuattaki resmî tanımı ve kapsamı" },
  { t: "Ödeme hizmetleri kapsamı", d: "Hangi işlemler bu kapsama girer?" },
  { t: "Elektronik para nedir?", d: "İhraç şartları ve yükümlülükler" },
  { t: "Denetim ve yaptırımlar", d: "İdari para cezaları ve süreçler" },
];

export default function ChatArea({ messages, loading, onPick, onScrollChange }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    onScrollChange(e.currentTarget.scrollTop > 8);
  };

  /* ---------- BOŞ EKRAN ---------- */
  if (messages.length === 0 && !loading) {
    return (
      <div
        className="relative flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center px-6 py-14">
          <div className="rise-in w-full text-center">
            <div
              className="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, var(--gold-bright), var(--gold))",
                boxShadow: "0 0 40px -8px var(--gold-glow)",
              }}
            >
              <Landmark size={26} strokeWidth={1.6} className="text-black/80" />
            </div>

            <p className="mb-3 text-[10.5px] uppercase tracking-[0.32em] text-faint">
              Kurumsal Zeka
            </p>

            <h1 className="gold-underline font-display text-[2.5rem] leading-[1.1] tracking-tight">
              <span className="text-gold">Mevzuat</span>{" "}
              <span className="text-ink">Asistanı</span>
            </h1>

            <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-muted">
              Bankacılık ve operasyonel yönergeleri saniyeler içinde tarayın.
              Her yanıt, kaynak belgeye ve sayfa numarasına dayandırılır.
            </p>

            <div className="mx-auto my-9 h-px w-20 hairline" />

            <div className="grid gap-2.5 text-left sm:grid-cols-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onPick(s.t)}
                  className="gold-slide group relative overflow-hidden rounded-xl border border-line bg-surface p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-gold"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="absolute inset-0 bg-gold opacity-[0.04] transition-opacity duration-300 group-hover:opacity-[0.08]" />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-ink">{s.t}</p>
                      <p className="mt-1 text-[11.5px] leading-snug text-faint">
                        {s.d}
                      </p>
                    </div>
                    <ArrowUpRight
                      size={14}
                      className="mt-0.5 shrink-0 text-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- SOHBET ---------- */
  return (
    <div
      className="relative flex-1 overflow-y-auto"
      onScroll={handleScroll}
    >
      <div className="mx-auto max-w-2xl space-y-8 px-6 py-10">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}

        {loading && (
          <div className="rise-in">
            <div className="mb-2.5 flex items-center gap-2.5">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-md"
                style={{
                  background: "linear-gradient(135deg, var(--gold-bright), var(--gold))",
                }}
              >
                <Landmark size={13} strokeWidth={2.2} className="text-black/80" />
              </div>
              <span className="font-display text-[13px] tracking-wide text-muted">
                Mevzuat Asistanı
              </span>
              <div className="flex-1 hairline" />
            </div>

            <div className="pl-[34px]">
              <TypingIndicator />
              <div className="mt-3 space-y-2">
                <div className="shimmer h-2 w-full rounded-full" />
                <div className="shimmer h-2 w-[85%] rounded-full" />
                <div className="shimmer h-2 w-[60%] rounded-full" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-2" />
      </div>
    </div>
  );
}