"use client";

import { ArrowUp, CornerDownLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  onSend: (value: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = `${Math.min(ref.current.scrollHeight, 200)}px`;
  }, [value]);

  const send = () => {
    const t = value.trim();
    if (!t || disabled) return;
    onSend(t);
    setValue("");
  };

  return (
    <div className="relative px-6 pb-5 pt-2">
      <div className="mx-auto max-w-2xl">
        <div
          className="focus-gold relative flex items-end gap-2 rounded-2xl border border-line
                     bg-surface px-3.5 py-2.5 transition-all duration-300"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <textarea
            ref={ref}
            rows={1}
            value={value}
            disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Mevzuata dair sorunuzu yazın…"
            className="flex-1 resize-none bg-transparent py-1.5 text-[14.5px] leading-relaxed
                       text-ink outline-none placeholder:text-faint disabled:opacity-40"
          />
          <button
            onClick={send}
            disabled={disabled || !value.trim()}
                className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl
                transition-all duration-300 disabled:opacity-40"
                style={{
             background: "linear-gradient(135deg, var(--gold-bright), var(--gold))",
            boxShadow: value.trim()
            ? "0 0 18px -4px var(--gold-glow)"
            : "none",
             }}
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="mt-2.5 flex items-center justify-center gap-4 text-[10.5px] text-faint">
          <span className="flex items-center gap-1">
            <CornerDownLeft size={10} /> gönder
          </span>
          <span className="opacity-40">·</span>
          <span>Shift + Enter yeni satır</span>
          <span className="opacity-40">·</span>
          <span>Kritik kararlarda kaynağı doğrulayın</span>
        </div>
      </div>
    </div>
  );
}