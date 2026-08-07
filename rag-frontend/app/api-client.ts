import { StatusResponse } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getStatus(): Promise<StatusResponse> {
  const res = await fetch(`${API_URL}/api/status`);
  if (!res.ok) throw new Error("Status check failed");
  return res.json();
}

export async function sendChat(query: string, history: { role: string; content: string }[]) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Bilinmeyen hata" }));
    throw new Error(err.detail || "Chat isteği başarısız");
  }
  return res.json();
}

export async function uploadFiles(files: File[]) {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Yükleme başarısız" }));
    throw new Error(err.detail || "Yükleme başarısız");
  }
  return res.json();
}

export interface DocumentInfo {
  filename: string;
  size_kb: number;
}

export async function listDocuments(): Promise<DocumentInfo[]> {
  const res = await fetch(`${API_URL}/api/documents`);
  if (!res.ok) return [];
  return res.json();
}

export async function deleteDocument(filename: string) {
  const res = await fetch(
    `${API_URL}/api/documents/${encodeURIComponent(filename)}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Silme başarısız");
  return res.json();
}