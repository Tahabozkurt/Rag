"use client";

import { useEffect, useState } from "react";
import { deleteDocument, DocumentInfo, listDocuments } from "@/app/api-client";
import { FileText, Trash2, Loader2 } from "lucide-react";

export default function DocumentList({ refreshKey }: { refreshKey: number }) {
  const [docs, setDocs] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const d = await listDocuments();
      setDocs(d);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, [refreshKey]);

  const handleDelete = async (name: string) => {
    if (!confirm(`"${name}" silinsin mi?`)) return;
    setDeleting(name);
    try {
      await deleteDocument(name);
      await fetchDocs();
    } catch (e) {
      alert("Silme hatası: " + (e as Error).message);
    }
    setDeleting(null);
  };

  if (!docs.length && !loading) {
    return (
      <p className="text-[10.5px] text-faint py-1">
        Henüz belge yok
      </p>
    );
  }

  return (
    <div className="space-y-1 max-h-40 overflow-y-auto">
      {loading && !docs.length && (
        <div className="flex items-center gap-1.5 text-[10.5px] text-faint">
          <Loader2 size={10} className="animate-spin" /> Yükleniyor
        </div>
      )}
      {docs.map((d) => (
        <div
          key={d.filename}
          className="group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] bg-surface2 transition-colors"
        >
          <FileText
            size={11}
            className="shrink-0 text-gold"
          />
          <div className="flex-1 min-w-0">
            <p className="truncate text-ink">{d.filename}</p>
            <p className="text-[9.5px] text-faint">
              {d.size_kb} KB
            </p>
          </div>
          <button
            onClick={() => handleDelete(d.filename)}
            disabled={deleting === d.filename}
            className="opacity-0 group-hover:opacity-100 text-faint hover:text-red-400 transition-opacity"
          >
            {deleting === d.filename ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Trash2 size={11} />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}