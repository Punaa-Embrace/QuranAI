import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BASE_URL = "https://equran.id/api/v2";

/**
 * Helpert untuk melakukan panggilan API dengan penanganan error yang kuat,
 * mendeteksi header JSON/HTML, dan menerjemahkan limitasi token/kuota 
 * menjadi pesan penjelasan yang ramah & beradab dalam Bahasa Indonesia.
 */
async function safeFetchJson(url: string, init?: RequestInit, defaultErrorMessage = "Gagal memproses"): Promise<any> {
  try {
    const res = await fetch(url, init);
    
    const contentType = res.headers.get("content-type") || "";
    let data: any = null;

    if (contentType.includes("application/json")) {
      try {
        data = await res.json();
      } catch (err) {
        // Gagal mengurai JSON secara semantik
      }
    }

    if (!res.ok) {
      if (data && data.error) {
        throw new Error(data.error);
      }

      if (res.status === 429) {
        throw new Error("Kuota AI Terbatas ⏰\n\nWah, saat ini limitasi token harian gratis layanan AI sedang penuh atau habis terpakai (Rate Limit 429). Silakan coba sesaat lagi, atau pasang API Key Anda di menu Settings! ✨");
      }
      if (res.status === 400) {
        throw new Error("Layanan AI Belum Aktif 📖\n\nSilakan periksa konfigurasi API Key pembelajaran Anda di panel Settings > Secrets dengan nama GEMINI_API_KEY.");
      }
      if (res.status === 404) {
        throw new Error("Layanan AI tidak ditemukan atau alamat salah (404) 📖");
      }
      throw new Error(`Koneksi AI Terganggu (${res.status}). Silakan coba beberapa saat lagi! 🤲✨`);
    }

    if (data && data.error) {
      throw new Error(data.error);
    }

    if (data === null) {
      throw new Error("Format respons tidak valid. Server menyajikan halaman HTML sebagai gantinya.");
    }

    return data;
  } catch (error: any) {
    // Jika itu adalah error yang telah kita konstruk secara ramah di atas, teruskan langsung
    const msg = error?.message || "";
    if (
      msg.includes("Kuota AI Terbatas") ||
      msg.includes("Layanan AI Belum Aktif") ||
      msg.includes("Koneksi AI Terganggu") ||
      msg.includes("tidak ditemukan") ||
      msg.includes("Format respons")
    ) {
      throw error;
    }

    // Jika terjadi kegagalan parser JSON luar atau gateway HTML dari backend
    if (msg.includes("Unexpected token") || msg.includes("is not valid JSON") || msg.includes("JSON.parse")) {
      throw new Error("Token AI Habis Terpakai ⏰\n\nWah, saat ini kuota API harian sedang terlampaui (429 Rate Limit). Jangan berkecil hati, silakan coba kirim kembali pesan Anda dalam beberapa menit! ✨🤲");
    }

    if (msg.includes("fetch") || msg.includes("NetworkError") || msg.includes("Failed to fetch") || msg.includes("network")) {
      throw new Error("Koneksi Jaringan Terputus 🌐\n\nMohon periksa koneksi internet Anda dan coba lagi untuk melanjutkan belajar bersama QuranMemo AI!");
    }

    throw new Error(`${defaultErrorMessage}: ${msg || "Kendala teknis tidak dikenal"}`);
  }
}

export async function getSurahs() {
  try {
    const res = await fetch(`${BASE_URL}/surat`);
    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }
    const json = await res.json();
    return json.data as any[];
  } catch (error: any) {
    throw new Error(`Gagal memuat daftar surah: ${error?.message || "koneksi bermasalah"}`);
  }
}

export async function getSurahDetail(nomor: number) {
  try {
    const res = await fetch(`${BASE_URL}/surat/${nomor}`);
    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }
    const json = await res.json();
    return json.data;
  } catch (error: any) {
    throw new Error(`Gagal memuat detail surah: ${error?.message || "koneksi bermasalah"}`);
  }
}

export async function getAIExplanation(surah: string, ayat: number, text: string, translation: string) {
  return safeFetchJson("/api/ai/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ surah, ayat, text, translation }),
  }, "Gagal memproses penjelasan AI");
}

export async function getAIMotivation() {
  return safeFetchJson("/api/ai/motivation", { method: "POST" }, "Gagal memproses motivasi AI");
}

export async function getDailyQuote() {
  return safeFetchJson("/api/ai/daily-quote", {}, "Gagal memproses quote harian");
}

export async function sendAIChat(message: string, history: { role: 'user' | 'ai', content: string }[]) {
  return safeFetchJson("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  }, "Gagal mengirim pesan AI");
}

export async function sendMurojaahCoach(message: string, history: { role: 'user' | 'ai', content: string }[]) {
  return safeFetchJson("/api/ai/murojaah", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  }, "Gagal berkomunikasi dengan Coach Murojaah AI");
}

export async function smartSearch(query: string) {
  return safeFetchJson("/api/ai/smart-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  }, "AI gagal mencari topik");
}

export async function getSurahSummary(surahName: string, description: string) {
  return safeFetchJson("/api/ai/surah-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ surahName, description }),
  }, "AI gagal merangkum surah");
}
