export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="dot h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_6px_var(--gold-glow)]" />
        <span className="dot h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_6px_var(--gold-glow)]" />
        <span className="dot h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_6px_var(--gold-glow)]" />
      </div>
      <span className="text-xs tracking-wide text-muted">
        Mevzuat taranıyor…
      </span>
    </div>
  );
}