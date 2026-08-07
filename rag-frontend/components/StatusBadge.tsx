"use client";

import { useEffect, useState } from "react";
import { getStatus } from "@/app/api-client";
import { StatusResponse } from "@/lib/types";

export default function StatusBadge() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setStatus(await getStatus());
        setError(false);
      } catch {
        setError(true);
      }
    };
    run();
    const i = setInterval(run, 15000);
    return () => clearInterval(i);
  }, []);

  let color = "#64605A";
  let label = "Bağlanıyor";

  if (error) { color = "#C0392B"; label = "Bağlantı yok"; }
  else if (status?.ready) { color = "var(--gold)"; label = "Sistem aktif"; }
  else if (status && !status.ready) { color = "#C9761F"; label = "Kaynak bekleniyor"; }

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-1.5 w-1.5">
        <span className="breathe absolute inline-flex h-full w-full rounded-full" style={{ background: color }} />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      </span>
      <span className="text-[10.5px] uppercase tracking-[0.14em] text-faint">{label}</span>
    </div>
  );
}