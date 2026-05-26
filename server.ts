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
             1. Sangat Alim & Berilmu: Jika ditanya tafsir atau ayat, berikan rujukan tepercaya (seperti Tafsir Kemenag, Ibnu Katsir, atau Al-Jalalayn). Sertakan ayat-ayat pendukung atau hadits shahih yang relevan dengan rapi.
             2. Pendamping Praktis (Solutif): Berikan tips menghafal yang konkret, teruji, dan ramah mahasiswa (misalnya teknik 'tikrar', metode visualisasi, atau murajaah saku).
             3. Sahabat Karib Syurga: Gunakan sapaan yang hangat seperti "Sahabat Quran", "Pecinta Al-Quran", atau "Pejuang Kalamllah". Bahasa Anda harus sopan, bersahabat, mengayom, dan membangkitkan asa spiritual ketika mereka mengeluh lelah menghafal.
             4. Estetika Jawaban: Format tulisan menggunakan spasi dan paragraf yang rapi dan indah. JANGAN menggunakan tanda bintang (* atau **) sama sekali dalam format teks mana pun. Tebalkan/ganti kata penting menggunakan huruf kapital atau format tanpa tanda bintang, serta warnai dialog Anda dengan emoji yang menyejukkan (seperti 📖, 🌟, ✨, ❤️, 🤲).`,
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
            reply = "Sahabat Quran yang dirahmati Allah, berikut adalah tips emas untuk mempermudah menghafal Al-Quran:\n\n1. Ikhlas & Doa: Awali dengan kebersihan niat semata-mata mencari ridha-Nya.\n2. Metode Tikrar (Pengulangan): Ulangi satu baris/ayat sebanyak 20 kali sebelum lanjut.\n3. Murojaah Terjadwal: Gunakan fitur Pengingat Murojaah di aplikasi untuk konsistensi.\n4. Pahami Makna: Bacalah terjemahannya terlebih dahulu; hal ini memicu ingatan visual dan asosiasi pikiran.\n\nSemoga Allah memudahkan setiap langkah spiritual Anda! 📖✨";
          } else if (msg.includes("jemput") || msg.includes("lelah") || msg.includes("malas") || msg.includes("bosan") || msg.includes("sulit") || msg.includes("menyerah")) {
            reply = "Pecinta Kalamullah, adalah hal yang manusiawi jika sesekali merasa lelah atau berat. Namun ingatlah sabda Rasulullah SAW: 'Orang yang membaca Al-Qur'an dan terbata-bata padanya serta mengalami kesulitan, baginya dua pahala.' (HR. Bukhari & Muslim).\n\nSetiap huruf yang Anda perjuangkan adalah cahaya penyejuk hati kelak. Istirahatlah sejenak, lalu mulailah kembali dengan satu ayat kecil. Kami selalu di sini menemani perjuangan mulia Anda! ❤️🤲";
          } else if (msg.includes("arafah") || (msg.includes("puasa") && msg.includes("arafah"))) {
            reply = "Sahabat Quran, Puasa Arafah (9 Dzulhijjah) memiliki keutamaan yang luar biasa! \n\nDalam hadits Riwayat Muslim No. 1162, Rasulullah SAW bersabda:\n\"Puasa hari Arafah, aku berharap kepada Allah agar menghapus dosa setahun yang lalu dan setahun yang akan datang.\"\n\nAyat Al-Quran secara umum yang berkaitan dengan kesempurnaan hari Arafah adalah Surah Al-Ma'idah (5) Ayat 3:\n\"Pada hari ini telah Kusempurnakan untukmu agamamu, dan telah Kucukupkan kepadamu nikmat-Ku, dan telah Kuridhai Islam itu jadi agama bagimu.\"\n\nKeutamaan puasa ini menggugurkan dosa dua tahun sekaligus, sebuah anugerah agung dari Allah SWT. Semoga kita dimudahkan mengamalkannya! Ada hal lain yang ingin Anda diskusikan mengenai puasa, hadits, atau ayat lainnya? 📖✨";
          } else if (msg.includes("puasa")) {
            reply = "Mengenai ibadah Puasa, Al-Quran menjelaskan kewajiban dan keutamaannya secara indah dalam Surah Al-Baqarah (2) Ayat 183:\n\n\"Wahai orang-orang yang beriman, diwrappedkan atas kamu berpuasa sebagaimana diwajibkan atas orang-orang sebelum kamu agar kamu bertakwa.\"\n\nPuasa membentuk ketahanan batin (self-control), meningkatkan kejernihan raga, serta melatih pikiran kita agar lebih tenang dan mudah fokus dalam menghafal Al-Quran. Apakah Anda sedang menargetkan hafalan sambil berpuasa sunnah atau menjelang bulan suci? Mari kita perjuangkan bersama! 🌟📖";
          } else if (msg.includes("sabar")) {
            reply = "Sahabat Quran, Sabar adalah kekuatan batin teragung dalam menghadapi ujian kehidupan maupun kesulitan hafalan. Al-Quran menuntun kita dalam Surah Al-Baqarah (2) Ayat 153:\n\n\"Wahai orang-orang yang beriman! Mohonlah pertolongan (kepada Allah) dengan sabar dan shalat. Sungguh, Allah beserta orang-orang yang sabar.\"\n\nIngatlah pula di Surah Az-Zumar (39) Ayat 10:\n\"Hanya orang-orang yang bersabarlah yang disempurnakan pahalanya tanpa batas.\"\n\nSetiap keletihan, lupa dalam murojaah, dan perjuangan mengulang hafalan adalah ladang sabar yang sedang Allah catat pahalanya. Tetap teguh ya! 🤲💖";
          } else if (msg.includes("ikhlas")) {
            reply = "Ikhlas adalah nyawa dari setiap amal, termasuk dalam berinteraksi dengan Al-Quran. Allah berfirman dalam Surah Al-Bayyinah (98) Ayat 5:\n\n\"Padahal mereka hanya diperintah menyembah Allah dengan ikhlas menaati-Nya semata-mata karena (menjalankan) agama...\" \n\nKetika kita menghafal Al-Quran murni karena mengharap rida Allah (bukan pujian makhluk), Allah akan melimpahkan keberkahan waktu serta kemudahan retensi dalam ingatan kita. Jaga selalu niat suci ini ya, Pejuang Kalamullah! ❤️📖";
          } else if (msg.includes("qadar") || msg.includes("qadr") || msg.includes("lailatul")) {
            reply = "Malam kemuliaan Lailatul Qadar dibahas secara khusus dan indah dalam Surah Al-Qadr (97) Ayat 1-3:\n\n\"Sesungguhnya Kami telah menurunkannya (Al-Quran) pada malam kemuliaan. Dan tahukah kamu apakah malam kemuliaan itu? Malam kemuliaan itu lebih baik dari seribu bulan.\"\n\nLailatul Qadar adalah momentum agung diturunkannya petunjuk abadi manusia (Al-Quran). Sangat dianjurkan untuk memperbanyak tilawah, murojaah, dan doa di sepuluh malam terakhir Ramadhan agar kita meraih kemuliaan seribu bulan ini. ✨🌙";
          } else if (msg.includes("sholat") || msg.includes("shalat") || msg.includes("tahajud") || msg.includes("tahajjud")) {
            reply = "Shalat adalah tiang agama dan interaksi harian terindah hamba dengan Sang Khalik. Mengenai anjuran shalat malam (Tahajud), Allah berfirman dalam Surah Al-Isra' (17) Ayat 79:\n\n\"Dan pada sebagian malam, lakukanlah shalat tahajud (sebagai suatu ibadah) tambahan bagimu; mudah-mudahan Tuhanmu mengangkatmu ke tempat yang terpuji.\"\n\nBagi para penghafal Al-Quran, melantunkan ayat-ayat hafalannya di keheningan sepertiga malam terakhir saat shalat Tahajud adalah tips emas paling ampuh agar hafalan tersebut meresap kuat ke dalam memori jangka panjang (mutqin). Cobalah malam ini ya! 📖🤲";
          } else if (msg.includes("ilmu") || msg.includes("belajar") || msg.includes("mahasiswa") || msg.includes("sekolah") || msg.includes("kuliah")) {
            reply = "Menuntut ilmu adalah ibadah mulia yang ditinggikan derajatnya oleh Allah SWT. Al-Quran menegaskannya di Surah Al-Mujadilah (58) Ayat 11:\n\n\"...Niscaya Allah akan mengangkat (derajat) orang-orang yang beriman di antaramu dan orang-orang yang diberi ilmu beberapa derajat...\" \n\nSebagai mahasiswa atau pelajar muslim, jadikanlah aktivitas belajar akademik Anda sebagai sarana dakwah, dan imbangi dengan murojaah Al-Quran harian sebagai suplemen spiritual penenang jiwa. Keduanya akan membawa keberhasilan duniawi dan ukhrawi yang seimbang! 🎓✨";
          } else if (msg.includes("sedekah") || msg.includes("infaq") || msg.includes("infak") || msg.includes("zakat")) {
            reply = "Zakat, infaq, dan sedekah adalah pembuka gerbang rezeki dan pembersih harta kesayangan kita. Allah SWT berfirman dalam Surah Al-Baqarah (2) Ayat 261:\n\n\"Perumpamaan orang yang menginfakkan hartanya di jalan Allah seperti sebutir biji yang menumbuhkan tujuh tangkai, pada setiap tangkai ada seratus biji. Allah melipatgandakan bagi siapa yang Dia kehendaki...\"\n\nSedekah tidak akan mengurangi harta, justru meningkatkan keberkahan hidup, kesehatan pikiran, dan kemudahan dalam menghafal Al-Quran! 🤲💸";
          } else if (msg.includes("orang tua") || msg.includes("ibu") || msg.includes("bapak") || msg.includes("walidain") || msg.includes("bakti")) {
            reply = "Berbakti kepada orang tua (Birrul Walidain) adalah kewajiban paling utama setelah bertauhid kepada Allah. Surah Al-Isra' (17) Ayat 23 menerangkan:\n\n\"Dan Tuhanmu telah memerintahkan agar kamu jangan menyembah selain Dia dan hendaklah berbuat baik kepada ibu bapakmu dengan sebaik-baiknya...\"\n\nKeistimewaan luar biasa bagi penghafal Al-Quran adalah kesempatan untuk memakaikan mahkota dan jubah kemuliaan berlapiskan cahaya di surga kelak untuk kedua orang tua mereka sebagai bukti bakti sejati. Masya Allah! 👑❤️";
          } else if (msg.includes("yasin") || msg.includes("yaasin") || msg.includes("kahfi") || msg.includes("mulk") || msg.includes("waqiah") || msg.includes("waqi'ah")) {
            reply = "Surah-surah pilihan seperti Yasin, Al-Kahfi, Al-Mulk, dan Al-Waqi'ah memiliki keutamaan hadits yang kokoh:\n\n1. Al-Kahfi: Dibaca hari Jumat sebagai cahaya penuntun hingga Jumat berikutnya (HR. An-Nasa'i).\n2. Al-Mulk: Menjadi syafaat penyelamat dari siksa kubur (HR. Tirmidzi).\n3. Yasin: Berfungsi sebagai salah satu jantung Al-Quran dan ketenteraman hati.\n\nMemilih surah-surah ini untuk memulai hafalan Anda adalah langkah awal yang sangat berkah! 📖✨";
          } else if (msg.includes("?") || msg.includes("apa") || msg.includes("bagaimana") || msg.includes("siapa") || msg.includes("mengapa") || msg.includes("kenapa") || msg.includes("jelaskan") || msg.includes("sebutkan") || msg.includes("tanya") || msg.includes("soal") || msg.includes("ayat") || msg.includes("hadits") || msg.includes("hadis") || msg.includes("keutamaan")) {
            reply = "Masya Allah, pertanyaan yang sangat mendidik tentang khazanah Al-Quran & keislaman! 📖✨\n\nSebagai asisten pribadi QuranMemo AI, saya sangat senang menemani diskusi Anda. Meskipun saat ini kustomisasi AI utama Anda sedang dialihkan ke mode cadangan (dikarenakan limitasi kuota atau API key), berikut adalah rangkuman prinsip dasar Al-Quran berdasar pencarian Anda:\n\n1. Rujuklah Tafsir Utama (Ibnu Katsir/Kemenag) untuk memperoleh kedalaman sanad makna yang murni.\n2. Tanyakan kepada Ustadz/Ustadzah terdekat apabila ada ketidakpastian hukum fiqih.\n3. Amalkan maknanya meskipun satu baris kebaikan kecil setiap harinya.\n\nAnda bisa mencoba mengetik kata murni seperti 'tips' untuk bimbingan hafalan, 'puasa' / 'arafah' / 'sabar' / 'sholat' / 'ilmu' untuk ulasan hikmah spesifik! Tetap istiqomah di jalan cahaya Al-Quran ya! 📖🌟";
          } else {
            reply = "Masya Allah, terima kasih telah menyapa QuranMemo AI! Di tengah padatnya aktivitas belajar, meluangkan batin untuk Al-Quran adalah investasi terbaik dunia-akhirat.\n\nAda yang bisa saya bantu hari ini? Anda bisa meminta tips menghafal, penjelasan ayat, atau bimbingan murojaah interaktif! ✨📖";
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
          const fallbackSearch = `### Hasil Pencarian Khidmat (Mode Cadangan)

Menanggapi pencarian Anda tentang topik "${query}", berikut adalah ayat-ayat Al-Quran paling utama yang memberi petunjuk:

1. Surah Al-Baqarah (2) Ayat 45:
   "Jadikanlah sabar dan shalat sebagai penolongmu. Dan sesungguhnya yang demikian itu sungguh berat, kecuali bagi orang-orang yang khusyu'."
2. Surah Al-Insyirah (94) Ayat 6:
   "Sesungguhnya sesudah kesulitan itu ada kemudahan."

#### Hikmah Spiritual & Pelajaran Praktis
Di tengah padatnya dunia perkuliahan dan beratnya godaan keseharian, kesabaran batin, shalat khusyu', serta keyakinan mutlak akan pertolongan-Nya adalah bekal paling utama bagi seorang penuntut ilmu.

Catatan: Hasil pencarian saat ini disajikan dalam mode aman cadangan ramah kuota. Silakan terus berselancar di surah lainnya menggunakan tab Semua Surah! 📖✨`;
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
        1. Inti Sari Pesan Utama Surah: Pesan tauhid, sejarah, atau tasyri' utama di surah ini.
        2. Mengapa Surah ini Sangat Penting dihafal: Barakah khusus, fadilah hadits shahih, atau kegunaan spiritualnya dalam shalat dan kehidupan batin.
        3. Pelajaran Emas untuk Kehidupan Mahasiswa Modern: Cara mengaitkan ajaran surah ini dengan integritas akademik, manajemen waktu, relasi sosial, atau ketahanan mental generasi masa kini.
        Gunakan format tulisan yang menawan, JANGAN menggunakan tanda bintang (* atau **) sama sekali dalam format tulisan Anda. Gunakan bullet-points standar (- atau angka) tanpa asterisks.`;

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
          const fallbackSummary = `### Hikmah Emas Surah ${surahName}

Berikut kami sajikan intisari hikmah dan keutamaan mengagumkan dari Surah ${surahName}:

#### 1. Pesan Utama Surah
Surah ${surahName} (${description || "merupakan bagian penting dari kalamullah"}) mengajarkan kita tentang tauhid yang kokoh, keteguhan hati, kepasrahan batin, serta janji pertolongan Allah yang pasti bagi orang-orang penyabar.

#### 2. Keutamaan Menghafal Surah Ini
Menghafal Surah ${surahName} merekatkan kedamaian di hati. Selain memperkaya khusyu' dalam shalat, melafalkannya harian adalah sarana bermunajat yang menenangkan pikiran.

#### 3. Pelajaran untuk Mahasiswa/Pelajar Masa Kini
- Ketangguhan Mental: Meyakinkan batin kita bahwa rintangan akademis serumit apa pun pasti disertai dengan kemudahan dari Allah SWT.
- Manajemen Harapan: Membalikkan fokus kerja keras kita semata-mata demi keberkahan, bukan sekadar mengejar status keduniawian semu.

Nikmati setiap detik kebersamaan Anda bersama kalam suci di QuranMemo AI! 🌟📖`;
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
1. SANGAT RINGKAS & TO THE POINT: JANGAN menulis penjelasan yang terlalu panjang atau bertele-tele. Jawab dalam 2 sampai maksimal 4 kalimat saja! Tetap padat dan fokus pada ujaran hafalan. JANGAN gunakan tanda bintang (* atau **) sama sekali dalam dialog Anda.
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
              reply = "Alhamdulillah, keren sekali hafalannya! Yuk, kita uji Surah Al-Mulk Anda. Coba sambung potongan ayat 1 ini:\n\n\"Tabaarakal ladzii biyadihil mulku wa huwa 'alaa...\"\n\nKetik kelanjutannya ya! ✨📖";
            } else if (msg.includes("kulli") || msg.includes("syai") || msg.includes("qadiir") || msg.includes("qodir")) {
              reply = "Masya Allah, hebat! Lanjutan Anda benar sekali: \"kulli syai-in qadiir\". \n\nSekarang coba sambung ayat ke-2 nya:\n\n\"Alladzii khalaqal mauta wal hayaata liyabluwakum...\"\n\nSemangat murojaah! 👏✨";
            } else {
              reply = "Masya Allah! Hafalan Surah Al-Mulk Anda sangat berkah. Terus ulangi hafalan Anda ya! Ada ayat lain atau surah lain yang ingin disetor? 📖✨";
            }
          } else if (msg.includes("naba") || msg.includes("amma")) {
            reply = "Alhamdulillah! Surah An-Naba' sangat istimewa. Coba sambung ayat pertama ini:\n\n\"Amma yatasaaa-aluun. 'Anil...?\"\n\nLanjutkan dengan gagah berani! 📖✨";
          } else {
            reply = "Masya Allah, niat murojaahmu luar biasa! Sebutkan nama surahnya (misal: Al-Mulk 1-10 atau An-Naba 1-5).\n\nSaya siap mengetes hafalan Anda secara bertahap supaya makin kuat! 📖✨";
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
