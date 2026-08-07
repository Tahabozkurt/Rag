"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CheckCircle2, FileText, Loader2, Plus, UploadCloud, X } from "lucide-react";
import { uploadFiles } from "@/app/api-client";

export default function FileUpload({ onUploaded }: { onUploaded: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onDrop = useCallback((a: File[]) => {
    setFiles((p) => [...p, ...a]);
    setMsg(null); setErr(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  const upload = async () => {
    if (!files.length) return;
    setUploading(true); setErr(null);
    try {
      const r = await uploadFiles(files);
      setMsg(r.message);
      setFiles([]);
      onUploaded();
      setTimeout(() => setMsg(null), 5000);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <div
        {...getRootProps()}
        className={`group relative cursor-pointer overflow-hidden rounded-xl border border-dashed
                    px-3 py-5 text-center transition-all duration-300
                    ${isDragActive ? "border-gold bg-gold-soft" : "border-line hover:border-gold"}`}
      >
        <input {...getInputProps()} />
        <UploadCloud
          size={20}
          strokeWidth={1.6}
          className={`mx-auto transition-colors ${isDragActive ? "text-gold" : "text-faint group-hover:text-gold"}`}
        />
        <p className="mt-2 text-[11.5px] text-muted">
          {isDragActive ? "Bırakın" : "PDF sürükleyin"}
        </p>
        <p className="text-[10px] text-faint">veya seçmek için tıklayın</p>
      </div>

      {files.length > 0 && (
        <>
          <div className="max-h-32 space-y-1 overflow-y-auto">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-surface2 px-2.5 py-1.5">
                <FileText size={11} className="shrink-0 text-gold" />
                <span className="flex-1 truncate text-[11px] text-muted">{f.name}</span>
                <button
                  onClick={() => setFiles((p) => p.filter((_, x) => x !== i))}
                  className="text-faint hover:text-red-400"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={upload}
            disabled={uploading}
            className="btn-gold flex w-full items-center justify-center gap-2 rounded-lg py-2
                       text-[12px] font-semibold tracking-wide"
          >
            {uploading ? (
              <><Loader2 size={12} className="animate-spin" /> İndeksleniyor…</>
            ) : (
              <><Plus size={12} strokeWidth={3} /> Sisteme Entegre Et</>
            )}
          </button>
        </>
      )}

      {msg && (
        <div className="flex items-start gap-1.5 rounded-lg bg-gold-soft px-2.5 py-2 text-[11px] text-gold">
          <CheckCircle2 size={12} className="mt-px shrink-0" />
          <span className="leading-snug">{msg}</span>
        </div>
      )}
      {err && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-2 text-[11px] text-red-400">
          {err}
        </div>
      )}
    </div>
  );
}