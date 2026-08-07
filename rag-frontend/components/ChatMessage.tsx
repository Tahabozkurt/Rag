"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import { Message } from "@/lib/types";
import SourcesAccordion from "./SourcesAccordion";
import { Check, Copy, Landmark } from "lucide-react";

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  /* ---------- KULLANICI ---------- */
  if (isUser) {
    return (
      <div className="rise-in flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md border border-line bg-surface px-4 py-2.5 shadow-sm">
          <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  /* ---------- ASİSTAN ---------- */
  return (
    <div className="rise-in group">
      <div className="mb-2.5 flex items-center gap-2.5">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
          style={{
            background: "linear-gradient(135deg, var(--gold-bright), var(--gold))",
            boxShadow: "0 0 16px -4px var(--gold-glow)",
          }}
        >
          <Landmark size={13} strokeWidth={2.2} className="text-black/80" />
        </div>

        <span className="font-display text-[13px] tracking-wide text-muted">
          Mevzuat Asistanı
        </span>

        <div className="flex-1 hairline" />

        <button
          onClick={copy}
          className="rounded p-1 text-faint transition-opacity hover:text-gold group-hover:opacity-100"
          title="Kopyala"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>

      <div className="pl-[34px]">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface px-4 py-3.5 shadow-sm">

          <div className="md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {message.hasSources && message.sources && (
          <SourcesAccordion sources={message.sources} />
        )}
      </div>
    </div>
  );
}