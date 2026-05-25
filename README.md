# 📖 QuranAI (QuranMemo Companion)

**QuranAI** adalah asisten sekaligus pendamping belajar Al-Quran berbasis Artificial Intelligence (AI) yang dirancang untuk membantu Anda meningkatkan hafalan (*hafalan/murojaah*), memahami makna ayat-ayat Allah, dan menjaga konsistensi dalam perjalanan menghafal Al-Quran secara menyenangkan dan penuh motivasi.

Aplikasi ini mengusung pendekatan modern, interaktif, dan gamifikasi untuk memberikan kenyamanan ekstra bagi para penghafal dan pembelajar Al-Quran di era digital.

---

## ✨ Fitur Unggulan

### 🧠 1. Explain AI (Penjelasan Cerdas Ayat)
*   **Tafsir Ringkas & Pelajaran Hidup:** Dilengkapi dengan asisten AI berbasis **Google Gemini** untuk memberikan penjelasan ayat dalam bahasa sederhana yang mudah dipahami oleh pemula.
*   **Aman & Terpercaya:** Menyajikan kesimpulan mutakhir dengan nada bahasa yang santun, edukatif, serta penuh rasa hormat.

### 🎯 2. Game Kuis Quran (Gamified Learning)
*   **Asah Pengetahuan Anda:** Jawab pertanyaan-pertanyaan seputar ilmu Quran pilihan ganda yang menantang dan mendidik.
*   **Sistem XP & Streak:** Dapatkan apresiasi poin pengalaman (XP) dan pertahankan rekor beruntun harian (*Daily Streak*) Anda demi memupuk semangat murojaah!

### 📊 3. Pelacak Smart 30 Juz (Auto-Sync)
*   **Grid Interaktif Mini:** Tampilan kemajuan 30 Juz yang ringkas, bersih (*clean*), dan dapat disembunyikan/ditampilkan secara fleksibel agar tidak memenuhi halaman (*no page clutter*).
*   **Sinergi Sistem Cerdas:** Menghubungkan pelacakan ayat per surah dengan status Juz secara otomatis. Apabila seluruh ayat dalam sebuah surah (misal: Surah Al-Fatihah dan Al-Baqarah di Juz 1) telah ditandai hafal 100%, sistem secara cerdas akan mensinkronisasikan dan mencatatkan Juz terkait sebagai **Telah Dihafal**.

### 💬 4. AI Companion & Murojaah Coach
*   **Chat Pembakti Semangat:** Ruang konseling islami untuk berkonsultasi mengenai tantangan menghafal Al-Quran.
*   **Pelatih Hafalan Virtual:** Pembimbing interaktif yang akan menuntun Anda mengulang bacaan, memberikan tips retensi memori, serta menyuntikkan motivasi spiritual harian.

---

## 🎨 Desain dan Antarmuka (UI/UX)
*   **Desain Selaras & Teduh:** Menggunakan palet ramah mata yaitu warna Emerald & Amber yang memberi kesan tenang, bersih, serta agung.
*   **Mobile-First Precision:** Dioptimalkan secara penuh untuk kenyamanan layar smartphone (didukung animasi halus dari `motion/react` dan ikon elegan dari `lucide-react`).

---

## 🛠️ Spesifikasi Teknologi (Tech Stack)

Aplikasi ini dibangun menggunakan arsitektur full-stack modern yang andal:

*   **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, `motion/react` (Framer Motion).
*   **Backend:** Node.js, Express.js (menyediakan API proxy aman untuk integrasi AI kustom).
*   **Kecerdasan Buatan:** Google Gemini API SDK (`@google/genai`).
*   **Penyimpanan Lokal:** `localStorage` terstruktur untuk retensi data kemajuan hafalan pengguna secara instan dan bebas lag.

---

## 🚀 Cara Menjalankan Project

### Prerequisites
Pastikan Anda telah menginstal **Node.js** (v18 ke atas) di perangkat Anda.

### Langkah Instalasi
1.  **Clone Repository:**
    ```bash
    git clone https://github.com/Punaa-Embrace/QuranAI.git
    cd QuranAI
    ```

2.  **Instalasi Dependensi:**
    ```bash
    npm install
    ```

3.  **Pengaturan Environment:**
    Salin file `.env.example` menjadi `.env` lalu masukkan API Key Gemini Anda:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Menjalankan Mode Pengembangan (Development):**
    ```bash
    npm run dev
    ```
    Buka `http://localhost:3000` di peramban web kesayangan Anda.

5.  **Build untuk Produksi:**
    ```bash
    npm run build
    ```

---

## 🤝 Kontribusi & Hak Cipta

Project ini berstatus open-source dan dikembangkan dengan penuh dedikasi oleh:

**GitHub:** [@Punaa-Embrace](https://github.com/Punaa-Embrace)  
**Repository Resmi:** [https://github.com/Punaa-Embrace/QuranAI](https://github.com/Punaa-Embrace/QuranAI)

Jika Anda menyukai project ini, berikan bintang (⭐) di repositori kami! Semoga aplikasi ini bermanfaat bagi kaum muslimin dalam menjaga hafalan kitab suci Al-Quran. Alhamdulillahi Rabbil 'Alamin. 🤲
