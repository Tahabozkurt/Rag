"use client";

import { useState } from "react";
import { ChevronDown, ScrollText } from "lucide-react";
import { Source } from "@/lib/types";

export default function SourcesAccordion({ sources }: { sources: Source[] }) {
  const [open, setOpen] = useState(false);
  if (!sources?.length) return null;

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.13em]
                   text-faint hover:text-gold transition-colors"
      >
        <ScrollText size={13} />
        <span>KAYNAKÇA</span>
        <span className="px-1.5 py-px rounded bg-gold-soft text-gold font-medium tracking-normal text-[10px]">
          {sources.length}
        </span>
        <ChevronDown size={13} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3 space-y-px rounded-xl border border-line overflow-hidden rise-in">
          {sources.map((s, i) => (
            <div key={i} className="bg-surface2 px-4 py-3 hover:bg-surface transition-colors">
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-[10px] text-gold shrink-0 pt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[13px] font-medium text-ink truncate">{s.source}</span>
                    <span className="text-[10.5px] text-faint whitespace-nowrap">s. {s.page}</span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted border-l border-line pl-3">
                    {s.snippet}…
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}