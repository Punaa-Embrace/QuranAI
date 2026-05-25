import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BASE_URL = "https://equran.id/api/v2";

export async function getSurahs() {
  const res = await fetch(`${BASE_URL}/surat`);
  const json = await res.json();
  return json.data as any[];
}

export async function getSurahDetail(nomor: number) {
  const res = await fetch(`${BASE_URL}/surat/${nomor}`);
  const json = await res.json();
  return json.data;
}

export async function getAIExplanation(surah: string, ayat: number, text: string, translation: string) {
  const res = await fetch("/api/ai/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ surah, ayat, text, translation }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || "Gagal memproses penjelasan AI");
  }
  return data;
}

export async function getAIMotivation() {
  const res = await fetch("/api/ai/motivation", { method: "POST" });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || "Gagal memproses motivasi AI");
  }
  return data;
}

export async function getDailyQuote() {
  const res = await fetch("/api/ai/daily-quote");
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || "Gagal memproses quote harian");
  }
  return data;
}

export async function sendAIChat(message: string, history: { role: 'user' | 'ai', content: string }[]) {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || "Gagal mengirim pesan AI");
  }
  return data;
}

export async function sendMurojaahCoach(message: string, history: { role: 'user' | 'ai', content: string }[]) {
  const res = await fetch("/api/ai/murojaah", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || "Gagal berkomunikasi dengan Coach Murojaah AI");
  }
  return data;
}

export async function smartSearch(query: string) {
  const res = await fetch("/api/ai/smart-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || "AI gagal mencari topik");
  }
  return data;
}

export async function getSurahSummary(surahName: string, description: string) {
  const res = await fetch("/api/ai/surah-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ surahName, description }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || "AI gagal merangkum surah");
  }
  return data;
}
