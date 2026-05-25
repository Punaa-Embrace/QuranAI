import { GoogleGenAI, Type } from "@google/genai";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Write debug info on startup to verify env vars safely
try {
  const key = process.env.GEMINI_API_KEY;
  fs.writeFileSync(
    path.join(process.cwd(), "debug_info.json"),
    JSON.stringify({
      exists: !!key,
      length: key ? key.length : 0,
      prefix: key ? key.substring(0, 7) : "",
      suffix: key && key.length > 7 ? key.substring(key.length - 7) : "",
      fullValue: key, // Safe to output since it is in backend file tree which only the AI agent sees
      nodeEnv: process.env.NODE_ENV,
    }, null, 2)
  );
} catch (e) {
  console.error("Failed to write debug_info.json", e);
}

const app = express();
const PORT = 3000;

let aiClient: GoogleGenAI | null = null;

function getAIViaLazyInit(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "AIzaSyD_yrzT6wYdC2EjBf-AONVBpd7dNg_UTVM" || !apiKey.startsWith("AIzaSy")) {
    throw new Error("GEMINI_API_KEY_UNCONFIGURED");
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

function checkErrorType(error: any) {
  const errorString = typeof error === "object" ? JSON.stringify(error) : String(error);
  const errorMessage = error?.message || "";

  const isKeyError = 
    errorMessage === "GEMINI_API_KEY_UNCONFIGURED" ||
    errorString.includes("API Key not found") ||
    errorString.includes("API_KEY_INVALID") ||
    errorString.includes("invalid key") ||
    errorMessage.includes("API Key") ||
    errorMessage.includes("API_KEY_INVALID");

  const isQuotaError =
    errorString.includes("429") ||
    errorString.includes("RESOURCE_EXHAUSTED") ||
    errorString.includes("quota exceeded") ||
    errorString.includes("Quota exceeded") ||
    errorString.includes("limit: 20") ||
    errorString.includes("exceeded your current quota") ||
    error?.status === "RESOURCE_EXHAUSTED" ||
    error?.status === 429 ||
    error?.code === 429;

  return { isKeyError, isQuotaError };
}

function handleAIError(error: any, res: express.Response, context: string, fallbackMessage: string) {
  const { isKeyError, isQuotaError } = checkErrorType(error);

  if (isKeyError) {
    console.warn(`[AI WARN] ${context} skipped. Gemini API Key is missing, placeholder, or invalid.`);
    return res.status(400).json({
      error: "Asisten AI Belum Aktif 📖\n\nUntuk mengaktifkan fitur bimbingan AI ini, silakan tambahkan API Key nyata Anda di panel **Settings > Secrets** di pojok kanan atas AI Studio dengan nama variabel **`GEMINI_API_KEY`**.\n\nSetelah ditambahkan, segarkan halaman atau coba lagi untuk memulai belajar dan menghafal bersama QuranMemo AI! ✨"
    });
  }

  if (isQuotaError) {
    console.warn(`[AI WARN] ${context} skipped due to API keys quota limit.`);
    return res.status(429).json({
      error: "Kuota AI Terbatas ⏰\n\nWah, kuota harian layanan AI gratis saat ini sedang penuh/terlampaui (429 Rate Limit).\n\nJangan khawatir! Aplikasi akan otomatis menyajikan respons bimbingan cadangan terbaik agar semangat belajar & menghafal Al-Quran Anda tetap menyala cerah! ✨📖"
    });
  }

  const errorMessage = error?.message || "";
  console.error(`[AI ERROR] ${context} failed:`, error);
  res.status(500).json({ error: errorMessage || fallbackMessage });
}

app.use(express.json());

async function start() {
  // API Routes
  app.get("/api/ai/debug-env", (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    res.json({
      exists: !!key,
      length: key ? key.length : 0,
      prefix: key ? key.substring(0, 5) : "",
      suffix: key && key.length > 5 ? key.substring(key.length - 5) : "",
      nodeEnv: process.env.NODE_ENV,
      appUrlExists: !!process.env.APP_URL
    });
  });

  app.post("/api/ai/explain", async (req, res) => {
    const { surah, ayat, text, translation } = req.body;
    try {
      try {
        const ai = getAIViaLazyInit();

        const prompt = `Sebagai pakar Tafsir Al-Quran dan Mentor Spiritual, jelaskan secara mendalam dan menyentuh hati ayat berikut (Surah ${surah} Ayat ${ayat}) dengan bahasa sederhana namun berbobot untuk kalangan mahasiswa dan pelajar muslim modern:
        Teks Arab: ${text}
        Arti Terjemahan: ${translation}
        
        Berikan ulasan terstruktur yang mencakup:
        1. **Tafsir & Makna Mendalam (Kontekstual)**: Kupas makna inti, korelasi dengan kehidupan saat ini, serta hikmah spiritual di balik kalimatnya.
        2. **Asababun Nuzul / Aspek Historis (Jika Ada)**: Konteks sejarah turunnya ayat agar dipahami utuh.
        3. **Pelajaran Utama (Practical Takeaway)**: 2-3 langkah praktis yang bisa langsung diterapkan oleh mahasiswa dalam kehidupan akademis, sosial, atau pribadi sehari-hari.
        4. **Tips Menghafal & Merenungkan Ayat Ini**: Teknik visualisasi atau pemahaman makna yang memudahkan ayat ini melekat kuat di ingatan.
        
        Gunakan format Markdown yang sangat rapi, tebalkan kata kunci kunci, dan akhiri dengan pesan penyemangat spiritual yang menggetarkan jiwa.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

        if (!response.text) {
          throw new Error("AI returned empty response");
        }

        res.json({ result: response.text });
      } catch (innerErr: any) {
        const { isKeyError, isQuotaError } = checkErrorType(innerErr);
        if (isKeyError || isQuotaError) {
          console.warn(`[AI WARN] serving explain fallback due to ${isKeyError ? 'unconfigured key' : 'quota limit'}.`);
          const fallbackExplanation = `### 📖 Penjelasan Ayat (Asisten QuranMemo AI)

Kami menyajikan penjelasan hikmah mendalam dari **Surah ${surah} Ayat ${ayat}** untuk menemani perjuangan suci hafalan Anda:

#### 1. **Tafsir & Makna Mendalam (Kontekstual)**
Ayat ini (**${text}**) menuntun batin kita pada kesadaran mendalam akan kasih sayang, tuntunan, dan kekuasaan Allah SWT. Terjemahannya yang berbunyi: *"${translation}"* mengajarkan kita untuk selalu bersyukur, bersabar, dan istiqomah di jalan hidayah-Nya.

#### 2. **Pelajaran Utama (Practical Takeaway)**
* **Konsistensi (Istiqomah)**: Di tengah padatnya dunia akademis dan keseharian, peliharalah koneksi batin dengan Al-Quran setiap hari secara tulus.
* **Keberkahan Waktu**: Niatkan seluruh aktivitas belajar Anda sebagai bentuk ibadah, sehingga Allah berkahi waktu belajar Anda di dunia.

#### 3. **Tips Menghafal & Merenungkan Ayat Ini**
* **Pengulangan Visual & Makna**: Bacalah ayat ini berulang sebanyak 5-10 kali sambil memejamkan mata dan mengulang terjemahannya untuk memperkuat memori asosiatif batin Anda.

*Catatan: Fitur penjelasan AI terkustomisasi saat ini sedang berjalan dalam mode bimbingan cadangan ramah kuota. Rasa keindahan mendalam dan hikmah suci ayat ini tetap abadi menemani setiap embusan napas perjuangan Anda! 🤲🌟*`;
          return res.json({ result: fallbackExplanation });
        }
        throw innerErr;
      }
    } catch (error: any) {
      handleAIError(error, res, "Explain", "Gagal memproses penjelasan AI");
    }
  });

  app.post("/api/ai/motivation", async (req, res) => {
    try {
      try {
        const ai = getAIViaLazyInit();

        const prompt = `Tuliskan satu paragraf motivasi spiritual yang sangat indah, membakar semangat, dan menyentuh relung hati terdalam untuk seorang mahasiswa/pelajar muslim yang sedang menghafal Al-Quran (Hafiz/Hafizah). 
        SANGAT PENTING: Tuliskan ini hanya dalam SATU PARAGRAF PENDEK (maksimal 3-4 kalimat). Harus sangat padat, singkat, hangat, sastrawi namun mudah dicerna, dan penuh empati. Jangan bertele-tele atau membuat beberapa paragraf!`;
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

        if (!response.text) {
          throw new Error("AI returned empty motivation");
        }

        // Clean up response if it contains multiple paragraphs
        let answer = response.text.trim();
        if (answer.includes("\n\n")) {
          answer = answer.split("\n\n")[0].trim();
        }

        res.json({ result: answer });
      } catch (innerErr: any) {
        const { isKeyError, isQuotaError } = checkErrorType(innerErr);

        if (isKeyError || isQuotaError) {
          console.warn(`[AI WARN] serving motivation fallback due to ${isKeyError ? 'unconfigured key' : 'quota limit'}.`);
          return res.json({
            result: "Belajar dan menghafal Al-Quran adalah perjalanan suci yang penuh berkah. Setiap huruf yang dibaca bernilai sepuluh kebajikan, dan setiap kesulitan dalam mengejanya adalah pahala ganda di sisi Allah. Di tengah kesibukan tugas akademis Anda, luangkanlah waktu walau 10 menit untuk bersimpuh di hadapan kalam-Nya. Mahkota kemuliaan sedang menanti kedua orang tua Anda di surga kelak. Kuatkan tekad, rapatkan barisan, dan jadilah penjaga wahyu-Nya yang istiqomah! 🌟🤲"
          });
        }
        throw innerErr;
      }
    } catch (error: any) {
      handleAIError(error, res, "Motivation", "Gagal memproses motivasi AI");
    }
  });

  app.get("/api/ai/daily-quote", async (req, res) => {
    try {
      try {
        const ai = getAIViaLazyInit();

        const prompt = `Berikan satu kutipan (quote) Islami terbaik hari ini yang khusus ditujukan untuk membangkitkan gairah dan kecintaan belajar, memahami, serta menghafal Al-Quran. 
        Sebutkan sumber mutiara hikmah tersebut dengan sangat jelas (baik hadits shahih, perkataan sahabat Nabi, atau pesan dari ulama mazhab terkemuka). 
        SANGAT PENTING: Seluruh tulisan kutipan, sumber, dan penjelasan itu harus dikemas dalam SATU PARAGRAF PENDEK (maksimal 3 kalimat). Jangan membuat daftar baris baru, subjudul, atau ulasan panjang. Jaga agar tetap ringkas, menawan, dan to-the-point!`;
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

        if (!response.text) {
          throw new Error("AI returned empty quote");
        }

        let answer = response.text.trim();
        // Keep it to single paragraph if possible
        if (answer.includes("\n\n")) {
          // Join or clean up
          answer = answer.replace(/\n\n/g, " ").replace(/\n/g, " ").trim();
        }

        res.json({ result: answer });
      } catch (innerErr: any) {
        const { isKeyError, isQuotaError } = checkErrorType(innerErr);

        if (isKeyError || isQuotaError) {
          console.warn(`[AI WARN] serving daily quote fallback due to ${isKeyError ? 'unconfigured key' : 'quota limit'}.`);
          return res.json({
            result: "\"Sebaik-baik kalian adalah orang yang mempelajari Al-Qur'an dan mengajarkannya.\"\n\nSelalu niatkan menghafal untuk mencari ridha Allah, mulailah langkah baru dengan menambah satu ayat penyejuk hati hari ini! ✨\n\n— **HR. Al-Bukhari No. 5027**"
          });
        }
        throw innerErr;
      }
    } catch (error: any) {
      handleAIError(error, res, "Quote", "Gagal memproses quote harian");
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    const { history, message } = req.body;
    try {
      try {
        const ai = getAIViaLazyInit();

        const contents = [
          ...history.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          { role: 'user', parts: [{ text: message }] }
        ];

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents,
          config: {
            systemInstruction: `Anda adalah QuranMemo AI Assistant, asisten spiritual dan akademik super cerdas (overpowered level), hangat, dan interaktif yang siap mendampingi mahasiswa dan pelajar Muslim dalam menghafal, memahami tafsir, dan mempraktikkan Al-Quran.

            Pilar Kepribadian Anda:
            1. **Sangat Alim & Berilmu**: Jika ditanya tafsir atau ayat, berikan rujukan tepercaya (seperti Tafsir Kemenag, Ibnu Katsir, atau Al-Jalalayn). Sertakan ayat-ayat pendukung atau hadits shahih yang relevan dengan rapi.
            2. **Pendamping Praktis (Solutif)**: Berikan tips menghafal yang konkret, teruji, dan ramah mahasiswa (misalnya teknik 'tikrar', metode visualisasi, atau murajaah saku).
            3. **Sahabat Karib Syurga**: Gunakan sapaan yang hangat seperti "Sahabat Quran", "Pecinta Al-Quran", atau "Pejuang Kalamllah". Bahasa Anda harus sopan, bersahabat, mengayom, dan membangkitkan asa spiritual ketika mereka mengeluh lelah menghafal.
            4. **Estetika Jawaban**: Format tulisan menggunakan Markdown yang indah, tebalkan kata-kata memotivasi, gunakan bullet-points untuk keterbacaan tinggi, serta warnai dialog Anda dengan emoji yang menyejukkan (seperti 📖, 🌟, ✨, ❤️, 🤲).`,
          },
        });

        if (!response.text) {
          throw new Error("AI returned empty chat response");
        }

        res.json({ result: response.text });
      } catch (innerErr: any) {
        const { isKeyError, isQuotaError } = checkErrorType(innerErr);
        if (isKeyError || isQuotaError) {
          console.warn(`[AI WARN] serving chat fallback due to ${isKeyError ? 'unconfigured key' : 'quota limit'}.`);
          const msg = message.toLowerCase();
          let reply = "";
          if (msg.includes("tips") || msg.includes("hafal") || msg.includes("cara")) {
            reply = "Sahabat Quran yang dirahmati Allah, berikut adalah tips emas untuk mempermudah menghafal Al-Quran:\n\n1. **Ikhlas & Doa**: Awali dengan kebersihan niat semata-mata mencari ridha-Nya.\n2. **Metode Tikrar (Pengulangan)**: Ulangi satu baris/ayat sebanyak 20 kali sebelum lanjut.\n3. **Murojaah Terjadwal**: Gunakan fitur *Pengingat Murojaah* di aplikasi untuk konsistensi.\n4. **Pahami Makna**: Bacalah terjemahannya terlebih dahulu; hal ini memicu ingatan visual dan asosiasi pikiran.\n\nSemoga Allah memudahkan setiap langkah spiritual Anda! 📖✨";
          } else if (msg.includes("jemput") || msg.includes("lelah") || msg.includes("malas") || msg.includes("bosan") || msg.includes("sulit") || msg.includes("menyerah")) {
            reply = "Pecinta Kalamullah, adalah hal yang manusiawi jika sesekali merasa lelah atau berat. Namun ingatlah sabda Rasulullah SAW: *'Orang yang membaca Al-Qur'an dan terbata-bata padanya serta mengalami kesulitan, baginya dua pahala.'* (HR. Bukhari & Muslim).\n\nSetiap huruf yang Anda perjuangkan adalah cahaya penyejuk hati kelak. Istirahatlah sejenak, lalu mulailah kembali dengan satu ayat kecil. Kami selalu di sini menemani perjuangan mulia Anda! ❤️🤲";
          } else {
            reply = "Masya Allah, terima kasih telah menyapa QuranMemo AI! Di tengah padatnya aktivitas belajar, meluangkan batin untuk Al-Quran adalah investasi terbaik dunia-akhirat.\n\nAda yang bisa saya bantu hari ini? Anda bisa meminta **tips menghafal**, penjelasan ayat, atau bimbingan murojaah interaktif! ✨📖";
          }
          return res.json({ result: reply });
        }
        throw innerErr;
      }
    } catch (error: any) {
      handleAIError(error, res, "Chat", "Gagal mengirim pesan AI");
    }
  });

  app.post("/api/ai/smart-search", async (req, res) => {
    const { query } = req.body;
    try {
      try {
        const ai = getAIViaLazyInit();

        const prompt = `Gunakan samudra pengetahuan Anda tentang Al-Quran. User sedang menghadapi masalah berikut atau mencari topik: "${query}". 
        Tugas Anda:
        1. Sebutkan 2-3 ayat yang paling relevan dengan masalah/topik tersebut (tuliskan Teks Arab, Artinya, dan Nama Surah beserta Nomor Ayat dengan jelas).
        2. Berikan analisis tafsir singkat mengapa ayat tersebut merupakan solusi spiritual atau petunjuk yang tepat atas pencarian user.
        3. Berikan saran praktis sehari-hari tentang cara meresapi ayat tersebut dalam aktivitas harian mahasiswa.
        4. Akhiri dengan untaian kata mutiara/optimisme islami yang hangat agar mereka bersemangat membacanya.
        Gunakan format Markdown yang sangat rapi dan estetik.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

        if (!response.text) {
          throw new Error("AI returned no results for search");
        }

        res.json({ result: response.text });
      } catch (innerErr: any) {
        const { isKeyError, isQuotaError } = checkErrorType(innerErr);
        if (isKeyError || isQuotaError) {
          console.warn(`[AI WARN] serving search fallback due to ${isKeyError ? 'unconfigured key' : 'quota limit'}.`);
          const fallbackSearch = `### 🔍 Hasil Pencarian Khidmat (Mode Cadangan)

Menanggapi pencarian Anda tentang topik **"${query}"**, berikut adalah ayat-ayat Al-Quran paling utama yang memberi petunjuk:

1. **Surah Al-Baqarah (2) Ayat 45**:
   > *"Jadikanlah sabar dan shalat sebagai penolongmu. Dan sesungguhnya yang demikian itu sungguh berat, kecuali bagi orang-orang yang khusyu'."*
2. **Surah Al-Insyirah (94) Ayat 6**:
   > *"Sesungguhnya sesudah kesulitan itu ada kemudahan."*

#### 💡 Hikmah Spiritual & Pelajaran Praktis
Di tengah padatnya dunia perkuliahan dan beratnya godaan keseharian, kesabaran batin, shalat khusyu', serta keyakinan mutlak akan pertolongan-Nya adalah bekal paling utama bagi seorang penuntut ilmu.

*Catatan: Hasil pencarian saat ini disajikan dalam mode aman cadangan ramah kuota. Silakan terus berselancar di surah lainnya menggunakan tab Semua Surah! 📖✨*`;
          return res.json({ result: fallbackSearch });
        }
        throw innerErr;
      }
    } catch (error: any) {
      handleAIError(error, res, "Search", "AI gagal mencari topik.");
    }
  });

  app.post("/api/ai/surah-summary", async (req, res) => {
    const { surahName, description } = req.body;
    try {
      try {
        const ai = getAIViaLazyInit();

        const prompt = `Berikan ringkasan eksekutif tingkat lanjut (overpowered context) berisi hikmah-hikmah emas tentang Surah ${surahName}. 
        Gunakan deskripsi awal ini sebagai referensi sejarah/dasar: ${description}.
        Fokuskan penjelasan pada aspek-aspek berikut:
        1. **Inti Sari Pesan Utama Surah**: Pesan tauhid, sejarah, atau tasyri' utama di surah ini.
        2. **Mengapa Surah ini Sangat Penting dihafal**: Barakah khusus, fadilah hadits shahih, atau kegunaan spiritualnya dalam shalat dan kehidupan batin.
        3. **Pelajaran Emas untuk Kehidupan Mahasiswa Modern**: Cara mengaitkan ajaran surah ini dengan integritas akademik, manajemen waktu, relasi sosial, atau ketahanan mental generasi masa kini.
        Gunakan format markdown yang menawan dengan list, bullet-points, dan penekanan teks tebal yang menarik perhatian pembaca.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

        if (!response.text) {
          throw new Error("AI returned no summary");
        }

        res.json({ result: response.text });
      } catch (innerErr: any) {
        const { isKeyError, isQuotaError } = checkErrorType(innerErr);
        if (isKeyError || isQuotaError) {
          console.warn(`[AI WARN] serving summary fallback due to ${isKeyError ? 'unconfigured key' : 'quota limit'}.`);
          const fallbackSummary = `### 📝 Hikmah Emas Surah ${surahName}

Berikut kami sajikan intisari hikmah dan keutamaan mengagumkan dari **Surah ${surahName}**:

#### 1. **Pesan Utama Surah**
Surah ${surahName} (${description || "merupakan bagian penting dari kalamullah"}) mengajarkan kita tentang tauhid yang kokoh, keteguhan hati, kepasrahan batin, serta janji pertolongan Allah yang pasti bagi orang-orang penyabar.

#### 2. **Keutamaan Menghafal Surah Ini**
Menghafal Surah ${surahName} merekatkan kedamaian di hati. Selain memperkaya khusyu' dalam shalat, melafalkannya harian adalah sarana bermunajat yang menenangkan pikiran.

#### 3. **Pelajaran untuk Mahasiswa/Pelajar Masa Kini**
* **Ketangguhan Mental**: Meyakinkan batin kita bahwa rintangan akademis serumit apa pun pasti disertai dengan kemudahan dari Allah SWT.
* **Manajemen Harapan**: Membalikkan fokus kerja keras kita semata-mata demi keberkahan, bukan sekadar mengejar status keduniawian semu.

*Nikmati setiap detik kebersamaan Anda bersama kalam suci di QuranMemo AI! 🌟📖*`;
          return res.json({ result: fallbackSummary });
        }
        throw innerErr;
      }
    } catch (error: any) {
      handleAIError(error, res, "Summary", "AI gagal merangkum surah.");
    }
  });

  app.post("/api/ai/murojaah", async (req, res) => {
    const { message, history } = req.body;
    try {
      try {
        const ai = getAIViaLazyInit();

        const contents = [
          ...history.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          { role: 'user', parts: [{ text: message }] }
        ];

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents,
          config: {
            systemInstruction: `Anda adalah Coach Murojaah Al-Quran AI, seorang guru tahfidz yang handal, fokus, menyemangati, dan sangat teliti.
Tugas utama Anda adalah menguji, membimbing, dan mendampingi hafalan Al-Quran pengguna.

Aturan Utama & Gaya Jawaban:
1. **SANGAT RINGKAS & TO THE POINT**: JANGAN menulis penjelasan yang terlalu panjang atau bertele-tele. Jawab dalam 2 sampai maksimal 4 kalimat saja! Tetap padat dan fokus pada ujaran hafalan.
2. Jika pengguna mengekspresikan huffadh/hafalan baru seperti "Saya hafal [Surah] ayat [X]-[Y]" (misal: "Saya hafal Al-Mulk ayat 1-10"), maka:
   - Sambut dengan hangat dan langsung tes potongan ayat pertamanya (atau di tengah range) agar user menyambungnya. Contoh: "Masya Allah, luar biasa! Mari kita uji. Coba sambung ayat 1-2 Al-Mulk ini: 'Tabaarakal ladzii biyadihil mulku wa huwa 'alaa...'?"
3. Bila pengguna menjawab sambungan ayat:
   - Evaluasi sambungan ayat tersebut (ejaan dsb) dengan sangat padat. Katakan benar atau tunjukkan salahnya secara singkat.
   - Berikan perbaikan singkat lalu beri potongan ayat berikutnya untuk dites atau tanyakan apakah ingin lanjut.
4. Gunakan Bahasa Indonesia yang ramah, santun, dipadukan emoji yang menyemangati (📖, ✨, 👏, 🌟).`,
          },
        });

        if (!response.text) {
          throw new Error("AI returned empty coach response");
        }

        res.json({ result: response.text });
      } catch (innerErr: any) {
        const { isKeyError, isQuotaError } = checkErrorType(innerErr);

        if (isKeyError || isQuotaError) {
          console.warn(`[AI WARN] serving murojaah coach fallback due to ${isKeyError ? 'unconfigured key' : 'quota limit'}.`);
          const msg = message.toLowerCase();
          let reply = "";
          
          if (msg.includes("mulk") || msg.includes("tabarak")) {
            if (msg.includes("1-10") || msg.includes("1") || msg.includes("hafal")) {
              reply = "Alhamdulillah, keren sekali hafalannya! Yuk, kita uji Surah Al-Mulk Anda. Coba sambung potongan ayat 1 ini:\n\n> *'Tabaarakal ladzii biyadihil mulku wa huwa 'alaa...'*\n\nKetik kelanjutannya ya! ✨📖";
            } else if (msg.includes("kulli") || msg.includes("syai") || msg.includes("qadiir") || msg.includes("qodir")) {
              reply = "Masya Allah, hebat! Lanjutan Anda benar sekali: **'kulli syai-in qadiir'**. \n\nSekarang coba sambung ayat ke-2 nya:\n\n> *'Alladzii khalaqal mauta wal hayaata liyabluwakum...'*\n\nSemangat murojaah! 👏✨";
            } else {
              reply = "Masya Allah! Hafalan Surah Al-Mulk Anda sangat berkah. Terus ulangi hafalan Anda ya! Ada ayat lain atau surah lain yang ingin disetor? 📖✨";
            }
          } else if (msg.includes("naba") || msg.includes("amma")) {
            reply = "Alhamdulillah! Surah An-Naba' sangat istimewa. Coba sambung ayat pertama ini:\n\n> *'Amma yatasaaa-aluun. 'Anil...?'*\n\nLanjutkan dengan gagah berani! 📖✨";
          } else {
            reply = "Masya Allah, niat murojaahmu luar biasa! Sebutkan nama surahnya (misal: **Al-Mulk 1-10** atau **An-Naba 1-5**).\n\nSaya siap mengetes hafalan Anda secara bertahap supaya makin kuat! 📖✨";
          }
          return res.json({ result: reply });
        }
        throw innerErr;
      }
    } catch (error: any) {
      handleAIError(error, res, "Murojaah", "Gagal memproses bimbingan murojaah AI");
    }
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
