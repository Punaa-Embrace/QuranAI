export interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
}

export interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
}

export interface SurahDetail extends Surah {
  ayat: Ayat[];
}

export interface Progress {
  surahId: number;
  surahName: string;
  lastAyat: number;
  updatedAt: string;
}
