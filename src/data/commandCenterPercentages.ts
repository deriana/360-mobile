/**
 * Data persentase Command Center — disinkronkan dari
 * PERSENTASE_COMMAND_CENTER.md (repo Saksi360-Admin), hasil ekstraksi
 * LANGSUNG dari fungsi data asli web (getVolunteerStatsForRegion,
 * getSaksiSummaryForRegion, getPanKemenanganSummaryForRegion).
 *
 * File ini di-generate otomatis oleh scratchpad/gen-percentages.js —
 * JANGAN diedit manual. Kalau seed di web berubah, jalankan ulang skrip
 * ekstraksi di Saksi360-Admin lalu generator ini lagi.
 *
 * Level Provinsi: persentase resmi per provinsi (Relawan, Saksi Mandat
 * TPS, Kemenangan PAN) — dipakai commandCenterService.buildProvinceStats
 * menggantikan formula seeded-random.
 *
 * Level Kabupaten/Kota: persentase per kab/kota, key berupa province id
 * internal (lihat PROVINCES di commandCenterService.ts). Nama kab/kota
 * memakai format dokumen ("Kota X" / "Kab. X") — commandCenterService
 * menormalkannya ke format GeoJSON ("Kota X" / "X" tanpa prefix "Kab. ")
 * saat mencocokkan dengan properti `kabupaten` pada geojson batas wilayah.
 */

export interface ProvincePercentageEntry {
  relawanPercent: number;
  saksiPercent: number;
  panPercent: number;
}

export interface RegencyPercentageEntry {
  name: string;
  relawanPercent: number;
  saksiPercent: number;
  panPercent: number;
}

export const PROVINCE_PERCENTAGE_DATA: Record<string, ProvincePercentageEntry> = {
  "jabar": {
    "relawanPercent": 105,
    "saksiPercent": 103.9,
    "panPercent": 40.5
  },
  "jatim": {
    "relawanPercent": 95,
    "saksiPercent": 92.2,
    "panPercent": 18
  },
  "jateng": {
    "relawanPercent": 107,
    "saksiPercent": 87.9,
    "panPercent": 17
  },
  "dki": {
    "relawanPercent": 123,
    "saksiPercent": 101.9,
    "panPercent": 20
  },
  "banten": {
    "relawanPercent": 82,
    "saksiPercent": 86.1,
    "panPercent": 19
  },
  "diy": {
    "relawanPercent": 112,
    "saksiPercent": 103.2,
    "panPercent": 44.8
  },
  "sumut": {
    "relawanPercent": 86,
    "saksiPercent": 85.1,
    "panPercent": 7
  },
  "sumsel": {
    "relawanPercent": 108,
    "saksiPercent": 71.2,
    "panPercent": 11
  },
  "lampung": {
    "relawanPercent": 87,
    "saksiPercent": 87.5,
    "panPercent": 41.5
  },
  "riau": {
    "relawanPercent": 107,
    "saksiPercent": 91.3,
    "panPercent": 41.2
  },
  "sumbar": {
    "relawanPercent": 76,
    "saksiPercent": 102.6,
    "panPercent": 44.5
  },
  "aceh": {
    "relawanPercent": 110,
    "saksiPercent": 67.4,
    "panPercent": 6.5
  },
  "jambi": {
    "relawanPercent": 89,
    "saksiPercent": 55.6,
    "panPercent": 40.6
  },
  "bengkulu": {
    "relawanPercent": 78,
    "saksiPercent": 50,
    "panPercent": 42.8
  },
  "kepri": {
    "relawanPercent": 122,
    "saksiPercent": 86.7,
    "panPercent": 31
  },
  "babel": {
    "relawanPercent": 78,
    "saksiPercent": 0,
    "panPercent": 23
  },
  "kalbar": {
    "relawanPercent": 88,
    "saksiPercent": 64.3,
    "panPercent": 10
  },
  "kaltim": {
    "relawanPercent": 115,
    "saksiPercent": 103,
    "panPercent": 30
  },
  "kalsel": {
    "relawanPercent": 94,
    "saksiPercent": 85.9,
    "panPercent": 41
  },
  "kalteng": {
    "relawanPercent": 77,
    "saksiPercent": 57.1,
    "panPercent": 12
  },
  "kalut": {
    "relawanPercent": 85,
    "saksiPercent": 0,
    "panPercent": 44.5
  },
  "sulsel": {
    "relawanPercent": 109,
    "saksiPercent": 100,
    "panPercent": 35
  },
  "sulteng": {
    "relawanPercent": 87,
    "saksiPercent": 59.6,
    "panPercent": 45.5
  },
  "sulut": {
    "relawanPercent": 116,
    "saksiPercent": 83.3,
    "panPercent": 8
  },
  "sultra": {
    "relawanPercent": 84,
    "saksiPercent": 52.2,
    "panPercent": 42.9
  },
  "gorontalo": {
    "relawanPercent": 89,
    "saksiPercent": 20.8,
    "panPercent": 41.5
  },
  "sulbar": {
    "relawanPercent": 75,
    "saksiPercent": 18.2,
    "panPercent": 5
  },
  "ntt": {
    "relawanPercent": 69,
    "saksiPercent": 16.7,
    "panPercent": 31
  },
  "ntb": {
    "relawanPercent": 106,
    "saksiPercent": 67.6,
    "panPercent": 34
  },
  "bali": {
    "relawanPercent": 119,
    "saksiPercent": 100,
    "panPercent": 5
  },
  "maluku": {
    "relawanPercent": 77,
    "saksiPercent": 20.6,
    "panPercent": 9
  },
  "malut": {
    "relawanPercent": 74,
    "saksiPercent": 0,
    "panPercent": 41.7
  },
  "papua": {
    "relawanPercent": 108,
    "saksiPercent": 0,
    "panPercent": 44.5
  },
  "papuapegunungan": {
    "relawanPercent": 8,
    "saksiPercent": 12.5,
    "panPercent": 0
  },
  "papuatengah": {
    "relawanPercent": 85,
    "saksiPercent": 15.4,
    "panPercent": 0
  },
  "papuabarat": {
    "relawanPercent": 92,
    "saksiPercent": 20,
    "panPercent": 0
  },
  "papuaselatan": {
    "relawanPercent": 15,
    "saksiPercent": 18.2,
    "panPercent": 0
  },
  "papuabaratdaya": {
    "relawanPercent": 106.7,
    "saksiPercent": 0,
    "panPercent": 30
  }
};

export const REGENCY_PERCENTAGE_DATA: Record<string, RegencyPercentageEntry[]> = {
  "jabar": [
    {
      "name": "Kota Bandung",
      "relawanPercent": 117.6,
      "saksiPercent": 105.3,
      "panPercent": 42.8
    },
    {
      "name": "Kota Bekasi",
      "relawanPercent": 100,
      "saksiPercent": 105.9,
      "panPercent": 0
    },
    {
      "name": "Kota Bogor",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 43.2
    },
    {
      "name": "Kota Cimahi",
      "relawanPercent": 121.8,
      "saksiPercent": 92,
      "panPercent": 30
    },
    {
      "name": "Kota Cirebon",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 41.6
    },
    {
      "name": "Kota Depok",
      "relawanPercent": 115.5,
      "saksiPercent": 100,
      "panPercent": 0
    },
    {
      "name": "Kota Sukabumi",
      "relawanPercent": 117.6,
      "saksiPercent": 100,
      "panPercent": 42
    },
    {
      "name": "Kota Tasikmalaya",
      "relawanPercent": 100,
      "saksiPercent": 104,
      "panPercent": 0
    },
    {
      "name": "Kota Banjar",
      "relawanPercent": 114.5,
      "saksiPercent": 100,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Bandung",
      "relawanPercent": 116.5,
      "saksiPercent": 105.3,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Bandung Barat",
      "relawanPercent": 110.3,
      "saksiPercent": 95.5,
      "panPercent": 27
    },
    {
      "name": "Kab. Bekasi",
      "relawanPercent": 100,
      "saksiPercent": 105.9,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Bogor",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 43.2
    },
    {
      "name": "Kab. Ciamis",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Cianjur",
      "relawanPercent": 100,
      "saksiPercent": 105.9,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Cirebon",
      "relawanPercent": 117.6,
      "saksiPercent": 100,
      "panPercent": 41.6
    },
    {
      "name": "Kab. Garut",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Indramayu",
      "relawanPercent": 119.7,
      "saksiPercent": 104.3,
      "panPercent": 42.8
    },
    {
      "name": "Kab. Karawang",
      "relawanPercent": 109.2,
      "saksiPercent": 103.4,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Kuningan",
      "relawanPercent": 120.7,
      "saksiPercent": 104.2,
      "panPercent": 33
    },
    {
      "name": "Kab. Majalengka",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 31
    },
    {
      "name": "Kab. Pangandaran",
      "relawanPercent": 103.9,
      "saksiPercent": 103.3,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Purwakarta",
      "relawanPercent": 115.5,
      "saksiPercent": 106.5,
      "panPercent": 0
    },
    {
      "name": "Kab. Subang",
      "relawanPercent": 107.1,
      "saksiPercent": 103.4,
      "panPercent": 42.8
    },
    {
      "name": "Kab. Sukabumi",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 42
    },
    {
      "name": "Kab. Sumedang",
      "relawanPercent": 117.6,
      "saksiPercent": 96.3,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Tasikmalaya",
      "relawanPercent": 110.3,
      "saksiPercent": 104,
      "panPercent": 27
    }
  ],
  "jatim": [
    {
      "name": "Kota Surabaya",
      "relawanPercent": 91.2,
      "saksiPercent": 105.3,
      "panPercent": 30
    },
    {
      "name": "Kota Batu",
      "relawanPercent": 83.6,
      "saksiPercent": 90.5,
      "panPercent": 21
    },
    {
      "name": "Kota Blitar",
      "relawanPercent": 99,
      "saksiPercent": 85.7,
      "panPercent": 16
    },
    {
      "name": "Kota Kediri",
      "relawanPercent": 96.9,
      "saksiPercent": 88.2,
      "panPercent": 42.8
    },
    {
      "name": "Kota Madiun",
      "relawanPercent": 93.1,
      "saksiPercent": 103.4,
      "panPercent": 16
    },
    {
      "name": "Kota Malang",
      "relawanPercent": 99,
      "saksiPercent": 106.5,
      "panPercent": 40.8
    },
    {
      "name": "Kota Mojokerto",
      "relawanPercent": 80,
      "saksiPercent": 104,
      "panPercent": 45.8
    },
    {
      "name": "Kota Pasuruan",
      "relawanPercent": 80.8,
      "saksiPercent": 100,
      "panPercent": 35
    },
    {
      "name": "Kota Probolinggo",
      "relawanPercent": 98.8,
      "saksiPercent": 100,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Bangkalan",
      "relawanPercent": 80,
      "saksiPercent": 103.4,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Banyuwangi",
      "relawanPercent": 89.3,
      "saksiPercent": 106.5,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Blitar",
      "relawanPercent": 86.5,
      "saksiPercent": 85.7,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Bojonegoro",
      "relawanPercent": 99,
      "saksiPercent": 105.6,
      "panPercent": 21
    },
    {
      "name": "Kab. Bondowoso",
      "relawanPercent": 80,
      "saksiPercent": 100,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Gresik",
      "relawanPercent": 89.3,
      "saksiPercent": 104.3,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Jember",
      "relawanPercent": 95,
      "saksiPercent": 104,
      "panPercent": 0
    },
    {
      "name": "Kab. Jombang",
      "relawanPercent": 97.8,
      "saksiPercent": 96.7,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Kediri",
      "relawanPercent": 99,
      "saksiPercent": 88.2,
      "panPercent": 19
    },
    {
      "name": "Kab. Lamongan",
      "relawanPercent": 80,
      "saksiPercent": 100,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Lumajang",
      "relawanPercent": 87.4,
      "saksiPercent": 105.3,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Madiun",
      "relawanPercent": 99,
      "saksiPercent": 103.4,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Magetan",
      "relawanPercent": 91.2,
      "saksiPercent": 100,
      "panPercent": 30
    },
    {
      "name": "Kab. Malang",
      "relawanPercent": 90.2,
      "saksiPercent": 106.5,
      "panPercent": 29
    },
    {
      "name": "Kab. Mojokerto",
      "relawanPercent": 80,
      "saksiPercent": 104,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Nganjuk",
      "relawanPercent": 88.3,
      "saksiPercent": 87.5,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Ngawi",
      "relawanPercent": 99,
      "saksiPercent": 88.5,
      "panPercent": 29
    },
    {
      "name": "Kab. Pacitan",
      "relawanPercent": 99,
      "saksiPercent": 100,
      "panPercent": 21
    },
    {
      "name": "Kab. Pamekasan",
      "relawanPercent": 81.7,
      "saksiPercent": 100,
      "panPercent": 28
    },
    {
      "name": "Kab. Pasuruan",
      "relawanPercent": 99,
      "saksiPercent": 100,
      "panPercent": 21
    },
    {
      "name": "Kab. Ponorogo",
      "relawanPercent": 87.4,
      "saksiPercent": 94.7,
      "panPercent": 45.8
    },
    {
      "name": "Kab. Probolinggo",
      "relawanPercent": 99,
      "saksiPercent": 100,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Sampang",
      "relawanPercent": 81.7,
      "saksiPercent": 105.3,
      "panPercent": 32
    },
    {
      "name": "Kab. Sidoarjo",
      "relawanPercent": 99,
      "saksiPercent": 106.5,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Situbondo",
      "relawanPercent": 89.3,
      "saksiPercent": 100,
      "panPercent": 45.8
    },
    {
      "name": "Kab. Sumenep",
      "relawanPercent": 98.8,
      "saksiPercent": 95.7,
      "panPercent": 42.8
    },
    {
      "name": "Kab. Trenggalek",
      "relawanPercent": 84.6,
      "saksiPercent": 105.6,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Tuban",
      "relawanPercent": 99,
      "saksiPercent": 104.2,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Tulungagung",
      "relawanPercent": 99,
      "saksiPercent": 100,
      "panPercent": 32
    }
  ],
  "jateng": [
    {
      "name": "Kota Semarang",
      "relawanPercent": 100,
      "saksiPercent": 104,
      "panPercent": 20
    },
    {
      "name": "Kota Surakarta",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 36
    },
    {
      "name": "Kota Salatiga",
      "relawanPercent": 107,
      "saksiPercent": 105.9,
      "panPercent": 0
    },
    {
      "name": "Kota Magelang",
      "relawanPercent": 122,
      "saksiPercent": 106.5,
      "panPercent": 43.8
    },
    {
      "name": "Kota Pekalongan",
      "relawanPercent": 100,
      "saksiPercent": 82.4,
      "panPercent": 44.8
    },
    {
      "name": "Kota Tegal",
      "relawanPercent": 100,
      "saksiPercent": 93.8,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Banjarnegara",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Banyumas",
      "relawanPercent": 125.2,
      "saksiPercent": 100,
      "panPercent": 21
    },
    {
      "name": "Kab. Batang",
      "relawanPercent": 113.4,
      "saksiPercent": 105.3,
      "panPercent": 36
    },
    {
      "name": "Kab. Blora",
      "relawanPercent": 100,
      "saksiPercent": 103.6,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Boyolali",
      "relawanPercent": 100.6,
      "saksiPercent": 100,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Brebes",
      "relawanPercent": 107,
      "saksiPercent": 105.3,
      "panPercent": 0
    },
    {
      "name": "Kab. Cilacap",
      "relawanPercent": 100,
      "saksiPercent": 104.3,
      "panPercent": 0
    },
    {
      "name": "Kab. Demak",
      "relawanPercent": 114.5,
      "saksiPercent": 100,
      "panPercent": 21
    },
    {
      "name": "Kab. Grobogan",
      "relawanPercent": 124.1,
      "saksiPercent": 104,
      "panPercent": 34
    },
    {
      "name": "Kab. Jepara",
      "relawanPercent": 107,
      "saksiPercent": 104,
      "panPercent": 0
    },
    {
      "name": "Kab. Karanganyar",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 28
    },
    {
      "name": "Kab. Kebumen",
      "relawanPercent": 100,
      "saksiPercent": 85.2,
      "panPercent": 0
    },
    {
      "name": "Kab. Kendal",
      "relawanPercent": 100,
      "saksiPercent": 95.2,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Klaten",
      "relawanPercent": 104.9,
      "saksiPercent": 106.5,
      "panPercent": 16
    },
    {
      "name": "Kab. Kudus",
      "relawanPercent": 112.4,
      "saksiPercent": 100,
      "panPercent": 35
    },
    {
      "name": "Kab. Magelang",
      "relawanPercent": 101.7,
      "saksiPercent": 106.5,
      "panPercent": 37
    },
    {
      "name": "Kab. Pati",
      "relawanPercent": 120.9,
      "saksiPercent": 100,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Pekalongan",
      "relawanPercent": 116.6,
      "saksiPercent": 82.4,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Pemalang",
      "relawanPercent": 102.7,
      "saksiPercent": 100,
      "panPercent": 30
    },
    {
      "name": "Kab. Purbalingga",
      "relawanPercent": 100,
      "saksiPercent": 87.5,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Purworejo",
      "relawanPercent": 107,
      "saksiPercent": 94.7,
      "panPercent": 0
    },
    {
      "name": "Kab. Rembang",
      "relawanPercent": 110.2,
      "saksiPercent": 85.7,
      "panPercent": 42.8
    },
    {
      "name": "Kab. Semarang",
      "relawanPercent": 100,
      "saksiPercent": 104,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Sragen",
      "relawanPercent": 103.8,
      "saksiPercent": 103.3,
      "panPercent": 18
    },
    {
      "name": "Kab. Sukoharjo",
      "relawanPercent": 103.8,
      "saksiPercent": 104.2,
      "panPercent": 22
    },
    {
      "name": "Kab. Tegal",
      "relawanPercent": 102.7,
      "saksiPercent": 93.8,
      "panPercent": 30
    },
    {
      "name": "Kab. Temanggung",
      "relawanPercent": 100,
      "saksiPercent": 105.9,
      "panPercent": 0
    },
    {
      "name": "Kab. Wonogiri",
      "relawanPercent": 125.2,
      "saksiPercent": 104.2,
      "panPercent": 19
    },
    {
      "name": "Kab. Wonosobo",
      "relawanPercent": 116.6,
      "saksiPercent": 103.6,
      "panPercent": 12.5
    }
  ],
  "dki": [
    {
      "name": "Kota Jakarta Pusat",
      "relawanPercent": 121.8,
      "saksiPercent": 105.6,
      "panPercent": 12.5
    },
    {
      "name": "Kota Jakarta Utara",
      "relawanPercent": 141.5,
      "saksiPercent": 100,
      "panPercent": 29
    },
    {
      "name": "Kota Jakarta Barat",
      "relawanPercent": 115.6,
      "saksiPercent": 104,
      "panPercent": 42.8
    },
    {
      "name": "Kota Jakarta Selatan",
      "relawanPercent": 130.4,
      "saksiPercent": 93.5,
      "panPercent": 32
    },
    {
      "name": "Kota Jakarta Timur",
      "relawanPercent": 116.8,
      "saksiPercent": 100,
      "panPercent": 33
    },
    {
      "name": "Kab. Kepulauan Seribu",
      "relawanPercent": 102.1,
      "saksiPercent": 92.9,
      "panPercent": 44.8
    }
  ],
  "banten": [
    {
      "name": "Kota Cilegon",
      "relawanPercent": 84.5,
      "saksiPercent": 93.3,
      "panPercent": 43.8
    },
    {
      "name": "Kota Serang",
      "relawanPercent": 86.9,
      "saksiPercent": 100,
      "panPercent": 32
    },
    {
      "name": "Kota Tangerang",
      "relawanPercent": 80,
      "saksiPercent": 100,
      "panPercent": 33
    },
    {
      "name": "Kota Tangerang Selatan",
      "relawanPercent": 91,
      "saksiPercent": 100,
      "panPercent": 45.8
    },
    {
      "name": "Kab. Lebak",
      "relawanPercent": 82,
      "saksiPercent": 100,
      "panPercent": 0
    },
    {
      "name": "Kab. Pandeglang",
      "relawanPercent": 80,
      "saksiPercent": 95.2,
      "panPercent": 0
    },
    {
      "name": "Kab. Serang",
      "relawanPercent": 84.5,
      "saksiPercent": 100,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Tangerang",
      "relawanPercent": 80,
      "saksiPercent": 100,
      "panPercent": 20
    }
  ],
  "diy": [
    {
      "name": "Kota Yogyakarta",
      "relawanPercent": 101.9,
      "saksiPercent": 94.4,
      "panPercent": 45.5
    },
    {
      "name": "Kab. Bantul",
      "relawanPercent": 116.5,
      "saksiPercent": 106.5,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Gunungkidul",
      "relawanPercent": 100,
      "saksiPercent": 103.3,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Kulon Progo",
      "relawanPercent": 109.8,
      "saksiPercent": 104,
      "panPercent": 16
    },
    {
      "name": "Kab. Sleman",
      "relawanPercent": 109.8,
      "saksiPercent": 106.5,
      "panPercent": 16
    }
  ],
  "sumut": [
    {
      "name": "Kota Medan",
      "relawanPercent": 79.9,
      "saksiPercent": 87,
      "panPercent": 0
    },
    {
      "name": "Kota Binjai",
      "relawanPercent": 80,
      "saksiPercent": 104,
      "panPercent": 46.8
    },
    {
      "name": "Kota Pematangsiantar",
      "relawanPercent": 80.8,
      "saksiPercent": 106.5,
      "panPercent": 43.8
    },
    {
      "name": "Kota Tebing Tinggi",
      "relawanPercent": 80,
      "saksiPercent": 105.3,
      "panPercent": 46.8
    },
    {
      "name": "Kota Tanjungbalai",
      "relawanPercent": 99,
      "saksiPercent": 83.3,
      "panPercent": 12.5
    },
    {
      "name": "Kota Sibolga",
      "relawanPercent": 91.2,
      "saksiPercent": 105.9,
      "panPercent": 32
    },
    {
      "name": "Kota Padangsidimpuan",
      "relawanPercent": 86,
      "saksiPercent": 88.2,
      "panPercent": 0
    },
    {
      "name": "Kota Gunungsitoli",
      "relawanPercent": 80.1,
      "saksiPercent": 100,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Deli Serdang",
      "relawanPercent": 99,
      "saksiPercent": 106.5,
      "panPercent": 26
    },
    {
      "name": "Kab. Langkat",
      "relawanPercent": 82.6,
      "saksiPercent": 100,
      "panPercent": 26
    },
    {
      "name": "Kab. Karo",
      "relawanPercent": 99,
      "saksiPercent": 88.5,
      "panPercent": 20
    },
    {
      "name": "Kab. Simalungun",
      "relawanPercent": 92.1,
      "saksiPercent": 100,
      "panPercent": 23
    },
    {
      "name": "Kab. Asahan",
      "relawanPercent": 80.8,
      "saksiPercent": 100,
      "panPercent": 42.8
    },
    {
      "name": "Kab. Batubara",
      "relawanPercent": 94.6,
      "saksiPercent": 95.2,
      "panPercent": 0
    },
    {
      "name": "Kab. Labuhanbatu",
      "relawanPercent": 99,
      "saksiPercent": 86.7,
      "panPercent": 18
    },
    {
      "name": "Kab. Labuhanbatu Utara",
      "relawanPercent": 80,
      "saksiPercent": 105.9,
      "panPercent": 32
    },
    {
      "name": "Kab. Labuhanbatu Selatan",
      "relawanPercent": 99,
      "saksiPercent": 96.4,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Tapanuli Utara",
      "relawanPercent": 99,
      "saksiPercent": 103.6,
      "panPercent": 17
    },
    {
      "name": "Kab. Tapanuli Tengah",
      "relawanPercent": 95.4,
      "saksiPercent": 104.2,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Tapanuli Selatan",
      "relawanPercent": 99,
      "saksiPercent": 106.5,
      "panPercent": 26
    },
    {
      "name": "Kab. Humbang Hasundutan",
      "relawanPercent": 80,
      "saksiPercent": 100,
      "panPercent": 31
    },
    {
      "name": "Kab. Toba",
      "relawanPercent": 80.8,
      "saksiPercent": 100,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Samosir",
      "relawanPercent": 99,
      "saksiPercent": 105.9,
      "panPercent": 26
    },
    {
      "name": "Kab. Dairi",
      "relawanPercent": 80,
      "saksiPercent": 103.6,
      "panPercent": 42.8
    },
    {
      "name": "Kab. Pakpak Bharat",
      "relawanPercent": 87.7,
      "saksiPercent": 106.5,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Mandailing Natal",
      "relawanPercent": 92.9,
      "saksiPercent": 100,
      "panPercent": 17
    },
    {
      "name": "Kab. Padang Lawas",
      "relawanPercent": 85.1,
      "saksiPercent": 100,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Padang Lawas Utara",
      "relawanPercent": 99,
      "saksiPercent": 105.9,
      "panPercent": 34
    },
    {
      "name": "Kab. Nias",
      "relawanPercent": 85.1,
      "saksiPercent": 100,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Nias Selatan",
      "relawanPercent": 99,
      "saksiPercent": 100,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Nias Utara",
      "relawanPercent": 80.8,
      "saksiPercent": 104,
      "panPercent": 42.8
    },
    {
      "name": "Kab. Nias Barat",
      "relawanPercent": 98.9,
      "saksiPercent": 105.6,
      "panPercent": 37
    },
    {
      "name": "Kab. Serdang Bedagai",
      "relawanPercent": 98.9,
      "saksiPercent": 105.6,
      "panPercent": 37
    }
  ],
  "sumsel": [
    {
      "name": "Kota Palembang",
      "relawanPercent": 128.5,
      "saksiPercent": 100,
      "panPercent": 12.5
    },
    {
      "name": "Kota Prabumulih",
      "relawanPercent": 100,
      "saksiPercent": 19.2,
      "panPercent": 27
    },
    {
      "name": "Kota Pagar Alam",
      "relawanPercent": 101.5,
      "saksiPercent": 0,
      "panPercent": 44.8
    },
    {
      "name": "Kota Lubuklinggau",
      "relawanPercent": 112.4,
      "saksiPercent": 37,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Ogan Ilir",
      "relawanPercent": 100,
      "saksiPercent": 90.5,
      "panPercent": 0
    },
    {
      "name": "Kab. Ogan Komering Ilir",
      "relawanPercent": 100,
      "saksiPercent": 104.8,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Ogan Komering Ulu",
      "relawanPercent": 125.2,
      "saksiPercent": 0,
      "panPercent": 30
    },
    {
      "name": "Kab. OKU Timur",
      "relawanPercent": 107,
      "saksiPercent": 0,
      "panPercent": 12.5
    },
    {
      "name": "Kab. OKU Selatan",
      "relawanPercent": 118.8,
      "saksiPercent": 100,
      "panPercent": 0
    },
    {
      "name": "Kab. Muara Enim",
      "relawanPercent": 127.4,
      "saksiPercent": 104,
      "panPercent": 16
    },
    {
      "name": "Kab. Lahat",
      "relawanPercent": 100.4,
      "saksiPercent": 65,
      "panPercent": 42.8
    },
    {
      "name": "Kab. Musi Banyuasin",
      "relawanPercent": 113.4,
      "saksiPercent": 93.8,
      "panPercent": 35
    },
    {
      "name": "Kab. Musi Rawas",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Musi Rawas Utara",
      "relawanPercent": 114.5,
      "saksiPercent": 87,
      "panPercent": 28
    },
    {
      "name": "Kab. Banyuasin",
      "relawanPercent": 119.9,
      "saksiPercent": 7.1,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Empat Lawang",
      "relawanPercent": 105.9,
      "saksiPercent": 71.4,
      "panPercent": 20
    },
    {
      "name": "Kab. Penukal Abab Lematang Ilir",
      "relawanPercent": 101.5,
      "saksiPercent": 0,
      "panPercent": 45.8
    }
  ],
  "lampung": [
    {
      "name": "Kota Bandar Lampung",
      "relawanPercent": 99,
      "saksiPercent": 100,
      "panPercent": 30
    },
    {
      "name": "Kota Metro",
      "relawanPercent": 80,
      "saksiPercent": 94.4,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Lampung Barat",
      "relawanPercent": 87.8,
      "saksiPercent": 85,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Lampung Selatan",
      "relawanPercent": 82.6,
      "saksiPercent": 100,
      "panPercent": 29
    },
    {
      "name": "Kab. Lampung Tengah",
      "relawanPercent": 80,
      "saksiPercent": 105.3,
      "panPercent": 42.8
    },
    {
      "name": "Kab. Lampung Timur",
      "relawanPercent": 87,
      "saksiPercent": 91.3,
      "panPercent": 0
    },
    {
      "name": "Kab. Lampung Utara",
      "relawanPercent": 80,
      "saksiPercent": 83.9,
      "panPercent": 0
    },
    {
      "name": "Kab. Mesuji",
      "relawanPercent": 97.5,
      "saksiPercent": 103.4,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Pesawaran",
      "relawanPercent": 80,
      "saksiPercent": 86.7,
      "panPercent": 27
    },
    {
      "name": "Kab. Pesisir Barat",
      "relawanPercent": 80,
      "saksiPercent": 105.9,
      "panPercent": 22
    },
    {
      "name": "Kab. Pringsewu",
      "relawanPercent": 98.3,
      "saksiPercent": 100,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Tanggamus",
      "relawanPercent": 94,
      "saksiPercent": 84,
      "panPercent": 17
    },
    {
      "name": "Kab. Tulang Bawang",
      "relawanPercent": 80,
      "saksiPercent": 105.3,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Tulang Bawang Barat",
      "relawanPercent": 92.3,
      "saksiPercent": 87,
      "panPercent": 28
    },
    {
      "name": "Kab. Way Kanan",
      "relawanPercent": 87.8,
      "saksiPercent": 100,
      "panPercent": 46.8
    }
  ],
  "riau": [
    {
      "name": "Kota Pekanbaru",
      "relawanPercent": 100,
      "saksiPercent": 89.5,
      "panPercent": 0
    },
    {
      "name": "Kota Dumai",
      "relawanPercent": 120.9,
      "saksiPercent": 85,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Kampar",
      "relawanPercent": 122,
      "saksiPercent": 103.4,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Siak",
      "relawanPercent": 107,
      "saksiPercent": 86.2,
      "panPercent": 0
    },
    {
      "name": "Kab. Pelalawan",
      "relawanPercent": 100,
      "saksiPercent": 86.4,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Indragiri Hulu",
      "relawanPercent": 100,
      "saksiPercent": 104.2,
      "panPercent": 45.8
    },
    {
      "name": "Kab. Indragiri Hilir",
      "relawanPercent": 110.2,
      "saksiPercent": 87.5,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Kuantan Singingi",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 17
    },
    {
      "name": "Kab. Bengkalis",
      "relawanPercent": 111.3,
      "saksiPercent": 90.3,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Rokan Hulu",
      "relawanPercent": 110.2,
      "saksiPercent": 103.6,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Rokan Hilir",
      "relawanPercent": 100,
      "saksiPercent": 103.6,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Kepulauan Meranti",
      "relawanPercent": 109.2,
      "saksiPercent": 94.7,
      "panPercent": 42.8
    }
  ],
  "sumbar": [
    {
      "name": "Kota Padang",
      "relawanPercent": 79,
      "saksiPercent": 92.9,
      "panPercent": 19
    },
    {
      "name": "Kota Bukittinggi",
      "relawanPercent": 64.6,
      "saksiPercent": 85,
      "panPercent": 35
    },
    {
      "name": "Kota Payakumbuh",
      "relawanPercent": 79,
      "saksiPercent": 86.4,
      "panPercent": 42.8
    },
    {
      "name": "Kota Pariaman",
      "relawanPercent": 73.7,
      "saksiPercent": 100,
      "panPercent": 19
    },
    {
      "name": "Kota Solok",
      "relawanPercent": 74.5,
      "saksiPercent": 100,
      "panPercent": 44.5
    },
    {
      "name": "Kota Sawahlunto",
      "relawanPercent": 79,
      "saksiPercent": 100,
      "panPercent": 20
    },
    {
      "name": "Kota Padang Panjang",
      "relawanPercent": 79,
      "saksiPercent": 104.3,
      "panPercent": 18
    },
    {
      "name": "Kab. Agam",
      "relawanPercent": 79.1,
      "saksiPercent": 105.6,
      "panPercent": 31
    },
    {
      "name": "Kab. Lima Puluh Kota",
      "relawanPercent": 79.1,
      "saksiPercent": 85.7,
      "panPercent": 31
    },
    {
      "name": "Kab. Pasaman",
      "relawanPercent": 65.4,
      "saksiPercent": 100,
      "panPercent": 32
    },
    {
      "name": "Kab. Pasaman Barat",
      "relawanPercent": 79.1,
      "saksiPercent": 100,
      "panPercent": 16
    },
    {
      "name": "Kab. Padang Pariaman",
      "relawanPercent": 69.2,
      "saksiPercent": 87.5,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Tanah Datar",
      "relawanPercent": 79,
      "saksiPercent": 87.5,
      "panPercent": 20
    },
    {
      "name": "Kab. Solok",
      "relawanPercent": 79.1,
      "saksiPercent": 100,
      "panPercent": 44.5
    },
    {
      "name": "Kab. Solok Selatan",
      "relawanPercent": 79.1,
      "saksiPercent": 92.9,
      "panPercent": 44.5
    },
    {
      "name": "Kab. Pesisir Selatan",
      "relawanPercent": 71.4,
      "saksiPercent": 94.7,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Sijunjung",
      "relawanPercent": 79,
      "saksiPercent": 100,
      "panPercent": 30
    },
    {
      "name": "Kab. Dharmasraya",
      "relawanPercent": 69.9,
      "saksiPercent": 104,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Kepulauan Mentawai",
      "relawanPercent": 69.2,
      "saksiPercent": 88.9,
      "panPercent": 45.8
    }
  ],
  "aceh": [
    {
      "name": "Kota Banda Aceh",
      "relawanPercent": 105.7,
      "saksiPercent": 61.9,
      "panPercent": 34
    },
    {
      "name": "Kota Sabang",
      "relawanPercent": 100,
      "saksiPercent": 11.5,
      "panPercent": 44.8
    },
    {
      "name": "Kota Lhokseumawe",
      "relawanPercent": 129.8,
      "saksiPercent": 100,
      "panPercent": 19
    },
    {
      "name": "Kota Langsa",
      "relawanPercent": 111.2,
      "saksiPercent": 88.9,
      "panPercent": 42.8
    },
    {
      "name": "Kota Subulussalam",
      "relawanPercent": 118.8,
      "saksiPercent": 103.4,
      "panPercent": 21
    },
    {
      "name": "Kab. Aceh Besar",
      "relawanPercent": 110,
      "saksiPercent": 41.2,
      "panPercent": 0
    },
    {
      "name": "Kab. Pidie",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 15
    },
    {
      "name": "Kab. Pidie Jaya",
      "relawanPercent": 100,
      "saksiPercent": 96.6,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Bireuen",
      "relawanPercent": 120.9,
      "saksiPercent": 92.3,
      "panPercent": 0
    },
    {
      "name": "Kab. Aceh Utara",
      "relawanPercent": 100,
      "saksiPercent": 84.2,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Aceh Timur",
      "relawanPercent": 114.5,
      "saksiPercent": 48.3,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Aceh Tamiang",
      "relawanPercent": 101.1,
      "saksiPercent": 100,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Bener Meriah",
      "relawanPercent": 127.6,
      "saksiPercent": 13,
      "panPercent": 30
    },
    {
      "name": "Kab. Aceh Tengah",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Gayo Lues",
      "relawanPercent": 122,
      "saksiPercent": 106.3,
      "panPercent": 45.8
    },
    {
      "name": "Kab. Aceh Tenggara",
      "relawanPercent": 105.7,
      "saksiPercent": 100,
      "panPercent": 30
    },
    {
      "name": "Kab. Aceh Barat",
      "relawanPercent": 113.2,
      "saksiPercent": 92.3,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Nagan Raya",
      "relawanPercent": 101.1,
      "saksiPercent": 104.3,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Aceh Barat Daya",
      "relawanPercent": 110,
      "saksiPercent": 0,
      "panPercent": 0
    },
    {
      "name": "Kab. Aceh Selatan",
      "relawanPercent": 111.2,
      "saksiPercent": 90.9,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Aceh Singkil",
      "relawanPercent": 100,
      "saksiPercent": 84.6,
      "panPercent": 0
    },
    {
      "name": "Kab. Simeulue",
      "relawanPercent": 102.2,
      "saksiPercent": 100,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Aceh Jaya",
      "relawanPercent": 100,
      "saksiPercent": 82.8,
      "panPercent": 46.8
    }
  ],
  "jambi": [
    {
      "name": "Kota Jambi",
      "relawanPercent": 80,
      "saksiPercent": 100,
      "panPercent": 28
    },
    {
      "name": "Kota Sungai Penuh",
      "relawanPercent": 80,
      "saksiPercent": 100,
      "panPercent": 32
    },
    {
      "name": "Kab. Batanghari",
      "relawanPercent": 99,
      "saksiPercent": 94.4,
      "panPercent": 29
    },
    {
      "name": "Kab. Bungo",
      "relawanPercent": 82.8,
      "saksiPercent": 43.8,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Kerinci",
      "relawanPercent": 82.8,
      "saksiPercent": 84.6,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Merangin",
      "relawanPercent": 81,
      "saksiPercent": 94.4,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Muaro Jambi",
      "relawanPercent": 89.9,
      "saksiPercent": 73.1,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Sarolangun",
      "relawanPercent": 80.1,
      "saksiPercent": 0,
      "panPercent": 0
    },
    {
      "name": "Kab. Tanjung Jabung Barat",
      "relawanPercent": 97.9,
      "saksiPercent": 88,
      "panPercent": 0
    },
    {
      "name": "Kab. Tanjung Jabung Timur",
      "relawanPercent": 98.8,
      "saksiPercent": 86.4,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Tebo",
      "relawanPercent": 96.2,
      "saksiPercent": 15.4,
      "panPercent": 22
    }
  ],
  "bengkulu": [
    {
      "name": "Kota Bengkulu",
      "relawanPercent": 62.5,
      "saksiPercent": 17.6,
      "panPercent": 0
    },
    {
      "name": "Kab. Bengkulu Selatan",
      "relawanPercent": 79,
      "saksiPercent": 100,
      "panPercent": 35
    },
    {
      "name": "Kab. Bengkulu Tengah",
      "relawanPercent": 79,
      "saksiPercent": 0,
      "panPercent": 28
    },
    {
      "name": "Kab. Bengkulu Utara",
      "relawanPercent": 75,
      "saksiPercent": 100,
      "panPercent": 30
    },
    {
      "name": "Kab. Kaur",
      "relawanPercent": 66.2,
      "saksiPercent": 100,
      "panPercent": 31
    },
    {
      "name": "Kab. Kepahiang",
      "relawanPercent": 64,
      "saksiPercent": 40,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Lebong",
      "relawanPercent": 75.8,
      "saksiPercent": 103.6,
      "panPercent": 17
    },
    {
      "name": "Kab. Mukomuko",
      "relawanPercent": 62.5,
      "saksiPercent": 23.1,
      "panPercent": 0
    },
    {
      "name": "Kab. Rejang Lebong",
      "relawanPercent": 78,
      "saksiPercent": 104,
      "panPercent": 0
    },
    {
      "name": "Kab. Seluma",
      "relawanPercent": 63.3,
      "saksiPercent": 100,
      "panPercent": 40.8
    }
  ],
  "kepri": [
    {
      "name": "Kota Batam",
      "relawanPercent": 139,
      "saksiPercent": 0,
      "panPercent": 42.8
    },
    {
      "name": "Kota Tanjungpinang",
      "relawanPercent": 140.3,
      "saksiPercent": 90.9,
      "panPercent": 29
    },
    {
      "name": "Kab. Bintan",
      "relawanPercent": 126.9,
      "saksiPercent": 0,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Karimun",
      "relawanPercent": 133,
      "saksiPercent": 100,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Lingga",
      "relawanPercent": 100,
      "saksiPercent": 14.3,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Natuna",
      "relawanPercent": 111,
      "saksiPercent": 91.7,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Kepulauan Anambas",
      "relawanPercent": 113.4,
      "saksiPercent": 100,
      "panPercent": 42.8
    }
  ],
  "babel": [
    {
      "name": "Kab. Bangka Barat",
      "relawanPercent": 67.8,
      "saksiPercent": 0,
      "panPercent": 21
    },
    {
      "name": "Kab. Bangka Selatan",
      "relawanPercent": 77.2,
      "saksiPercent": 0,
      "panPercent": 12.5
    },
    {
      "name": "Kota Pangkal Pinang",
      "relawanPercent": 78.8,
      "saksiPercent": 0,
      "panPercent": 43.8
    }
  ],
  "kalbar": [
    {
      "name": "Kota Pontianak",
      "relawanPercent": 83.6,
      "saksiPercent": 19.2,
      "panPercent": 29
    },
    {
      "name": "Kota Singkawang",
      "relawanPercent": 99,
      "saksiPercent": 13,
      "panPercent": 23
    },
    {
      "name": "Kab. Bengkayang",
      "relawanPercent": 99,
      "saksiPercent": 82.6,
      "panPercent": 34
    },
    {
      "name": "Kab. Kapuas Hulu",
      "relawanPercent": 98.6,
      "saksiPercent": 55.6,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Kayong Utara",
      "relawanPercent": 80,
      "saksiPercent": 100,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Ketapang",
      "relawanPercent": 89.8,
      "saksiPercent": 68.4,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Kubu Raya",
      "relawanPercent": 80,
      "saksiPercent": 100,
      "panPercent": 15
    },
    {
      "name": "Kab. Landak",
      "relawanPercent": 80,
      "saksiPercent": 16,
      "panPercent": 0
    },
    {
      "name": "Kab. Melawi",
      "relawanPercent": 79.9,
      "saksiPercent": 95.2,
      "panPercent": 0
    },
    {
      "name": "Kab. Mempawah",
      "relawanPercent": 80.1,
      "saksiPercent": 61.1,
      "panPercent": 45.8
    },
    {
      "name": "Kab. Sambas",
      "relawanPercent": 86.3,
      "saksiPercent": 100,
      "panPercent": 19
    },
    {
      "name": "Kab. Sanggau",
      "relawanPercent": 99,
      "saksiPercent": 92.9,
      "panPercent": 16
    },
    {
      "name": "Kab. Sekadau",
      "relawanPercent": 92.4,
      "saksiPercent": 100,
      "panPercent": 35
    },
    {
      "name": "Kab. Sintang",
      "relawanPercent": 80,
      "saksiPercent": 80.8,
      "panPercent": 44.8
    }
  ],
  "kaltim": [
    {
      "name": "Kota Samarinda",
      "relawanPercent": 109.2,
      "saksiPercent": 104.2,
      "panPercent": 37
    },
    {
      "name": "Kota Balikpapan",
      "relawanPercent": 103.5,
      "saksiPercent": 104,
      "panPercent": 0
    },
    {
      "name": "Kota Bontang",
      "relawanPercent": 126.5,
      "saksiPercent": 105.9,
      "panPercent": 0
    },
    {
      "name": "Kab. Berau",
      "relawanPercent": 116.2,
      "saksiPercent": 103.6,
      "panPercent": 45.8
    },
    {
      "name": "Kab. Kutai Barat",
      "relawanPercent": 101.2,
      "saksiPercent": 106.5,
      "panPercent": 15
    },
    {
      "name": "Kab. Kutai Kartanegara",
      "relawanPercent": 123.1,
      "saksiPercent": 103.6,
      "panPercent": 22
    },
    {
      "name": "Kab. Kutai Timur",
      "relawanPercent": 100.1,
      "saksiPercent": 103.6,
      "panPercent": 21
    },
    {
      "name": "Kab. Mahakam Ulu",
      "relawanPercent": 101.2,
      "saksiPercent": 106.5,
      "panPercent": 15
    },
    {
      "name": "Kab. Paser",
      "relawanPercent": 102.3,
      "saksiPercent": 89.3,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Penajam Paser Utara",
      "relawanPercent": 135.7,
      "saksiPercent": 96.6,
      "panPercent": 21
    }
  ],
  "kalsel": [
    {
      "name": "Kota Banjarmasin",
      "relawanPercent": 80.8,
      "saksiPercent": 104.3,
      "panPercent": 32
    },
    {
      "name": "Kota Banjarbaru",
      "relawanPercent": 99,
      "saksiPercent": 106.5,
      "panPercent": 18
    },
    {
      "name": "Kab. Balangan",
      "relawanPercent": 99,
      "saksiPercent": 105.6,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Banjar",
      "relawanPercent": 96.8,
      "saksiPercent": 104.2,
      "panPercent": 45.8
    },
    {
      "name": "Kab. Barito Kuala",
      "relawanPercent": 99.1,
      "saksiPercent": 105.3,
      "panPercent": 0
    },
    {
      "name": "Kab. Hulu Sungai Selatan",
      "relawanPercent": 99,
      "saksiPercent": 103.4,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Hulu Sungai Tengah",
      "relawanPercent": 99,
      "saksiPercent": 83.3,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Hulu Sungai Utara",
      "relawanPercent": 81.8,
      "saksiPercent": 94.4,
      "panPercent": 19
    },
    {
      "name": "Kab. Kotabaru",
      "relawanPercent": 80,
      "saksiPercent": 104.3,
      "panPercent": 0
    },
    {
      "name": "Kab. Tabalong",
      "relawanPercent": 99,
      "saksiPercent": 100,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Tanah Bumbu",
      "relawanPercent": 90.2,
      "saksiPercent": 100,
      "panPercent": 34
    },
    {
      "name": "Kab. Tanah Laut",
      "relawanPercent": 91.2,
      "saksiPercent": 104.2,
      "panPercent": 18
    },
    {
      "name": "Kab. Tapin",
      "relawanPercent": 93,
      "saksiPercent": 90.9,
      "panPercent": 12.5
    }
  ],
  "kalteng": [
    {
      "name": "Kota Palangka Raya",
      "relawanPercent": 62.5,
      "saksiPercent": 62.5,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Barito Selatan",
      "relawanPercent": 76.2,
      "saksiPercent": 18.2,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Barito Timur",
      "relawanPercent": 79.1,
      "saksiPercent": 17.4,
      "panPercent": 0
    },
    {
      "name": "Kab. Barito Utara",
      "relawanPercent": 69.3,
      "saksiPercent": 53.8,
      "panPercent": 0
    },
    {
      "name": "Kab. Gunung Mas",
      "relawanPercent": 65.4,
      "saksiPercent": 35.7,
      "panPercent": 31
    },
    {
      "name": "Kab. Kapuas",
      "relawanPercent": 70.1,
      "saksiPercent": 106.3,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Katingan",
      "relawanPercent": 62.5,
      "saksiPercent": 106.3,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Kotawaringin Barat",
      "relawanPercent": 63.2,
      "saksiPercent": 82.4,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Kotawaringin Timur",
      "relawanPercent": 63.9,
      "saksiPercent": 70,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Lamandau",
      "relawanPercent": 77.8,
      "saksiPercent": 103.6,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Murung Raya",
      "relawanPercent": 79,
      "saksiPercent": 84.6,
      "panPercent": 15
    },
    {
      "name": "Kab. Pulang Pisau",
      "relawanPercent": 73.1,
      "saksiPercent": 7.1,
      "panPercent": 37
    },
    {
      "name": "Kab. Sukamara",
      "relawanPercent": 79,
      "saksiPercent": 95,
      "panPercent": 22
    },
    {
      "name": "Kab. Seruyan",
      "relawanPercent": 79,
      "saksiPercent": 92.9,
      "panPercent": 12.5
    }
  ],
  "kalut": [
    {
      "name": "Kota Tarakan",
      "relawanPercent": 80.7,
      "saksiPercent": 0,
      "panPercent": 37
    },
    {
      "name": "Kab. Bulungan",
      "relawanPercent": 86.8,
      "saksiPercent": 0,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Malinau",
      "relawanPercent": 99,
      "saksiPercent": 0,
      "panPercent": 15
    },
    {
      "name": "Kab. Nunukan",
      "relawanPercent": 86.8,
      "saksiPercent": 0,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Tana Tidung",
      "relawanPercent": 80,
      "saksiPercent": 0,
      "panPercent": 46.8
    }
  ],
  "sulsel": [
    {
      "name": "Kota Makassar",
      "relawanPercent": 128.6,
      "saksiPercent": 103.4,
      "panPercent": 17
    },
    {
      "name": "Kota Palopo",
      "relawanPercent": 124.2,
      "saksiPercent": 100,
      "panPercent": 44.8
    },
    {
      "name": "Kota Parepare",
      "relawanPercent": 114.4,
      "saksiPercent": 100,
      "panPercent": 35
    },
    {
      "name": "Kab. Bantaeng",
      "relawanPercent": 100,
      "saksiPercent": 104.3,
      "panPercent": 0
    },
    {
      "name": "Kab. Barru",
      "relawanPercent": 104.6,
      "saksiPercent": 85.2,
      "panPercent": 30
    },
    {
      "name": "Kab. Bone",
      "relawanPercent": 100,
      "saksiPercent": 103.4,
      "panPercent": 32
    },
    {
      "name": "Kab. Bulukumba",
      "relawanPercent": 122.1,
      "saksiPercent": 100,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Enrekang",
      "relawanPercent": 121,
      "saksiPercent": 94.4,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Gowa",
      "relawanPercent": 104.6,
      "saksiPercent": 105.3,
      "panPercent": 34
    },
    {
      "name": "Kab. Jeneponto",
      "relawanPercent": 119.9,
      "saksiPercent": 103.4,
      "panPercent": 0
    },
    {
      "name": "Kab. Kepulauan Selayar",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Luwu",
      "relawanPercent": 125.4,
      "saksiPercent": 83.3,
      "panPercent": 33
    },
    {
      "name": "Kab. Luwu Timur",
      "relawanPercent": 115.5,
      "saksiPercent": 106.5,
      "panPercent": 36
    },
    {
      "name": "Kab. Luwu Utara",
      "relawanPercent": 100,
      "saksiPercent": 104.3,
      "panPercent": 28
    },
    {
      "name": "Kab. Maros",
      "relawanPercent": 109,
      "saksiPercent": 100,
      "panPercent": 0
    },
    {
      "name": "Kab. Pangkajene dan Kepulauan",
      "relawanPercent": 121,
      "saksiPercent": 84.6,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Pinrang",
      "relawanPercent": 112.2,
      "saksiPercent": 83.3,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Sidenreng Rappang",
      "relawanPercent": 100,
      "saksiPercent": 106.5,
      "panPercent": 21
    },
    {
      "name": "Kab. Sinjai",
      "relawanPercent": 100,
      "saksiPercent": 105.9,
      "panPercent": 18
    },
    {
      "name": "Kab. Soppeng",
      "relawanPercent": 109,
      "saksiPercent": 100,
      "panPercent": 0
    },
    {
      "name": "Kab. Takalar",
      "relawanPercent": 100.3,
      "saksiPercent": 104,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Tana Toraja",
      "relawanPercent": 107.9,
      "saksiPercent": 103.3,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Toraja Utara",
      "relawanPercent": 104.6,
      "saksiPercent": 100,
      "panPercent": 30
    },
    {
      "name": "Kab. Wajo",
      "relawanPercent": 100,
      "saksiPercent": 95.5,
      "panPercent": 43.8
    }
  ],
  "sulteng": [
    {
      "name": "Kota Palu",
      "relawanPercent": 81.8,
      "saksiPercent": 53.3,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Banggai",
      "relawanPercent": 97.4,
      "saksiPercent": 15.4,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Banggai Kepulauan",
      "relawanPercent": 80,
      "saksiPercent": 60,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Banggai Laut",
      "relawanPercent": 94,
      "saksiPercent": 19,
      "panPercent": 15
    },
    {
      "name": "Kab. Buol",
      "relawanPercent": 98.3,
      "saksiPercent": 0,
      "panPercent": 45.8
    },
    {
      "name": "Kab. Donggala",
      "relawanPercent": 80,
      "saksiPercent": 95.2,
      "panPercent": 28
    },
    {
      "name": "Kab. Morowali",
      "relawanPercent": 99,
      "saksiPercent": 81.3,
      "panPercent": 16
    },
    {
      "name": "Kab. Morowali Utara",
      "relawanPercent": 81.8,
      "saksiPercent": 100,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Parigi Moutong",
      "relawanPercent": 90.5,
      "saksiPercent": 35.3,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Poso",
      "relawanPercent": 99,
      "saksiPercent": 92.3,
      "panPercent": 16
    },
    {
      "name": "Kab. Sigi",
      "relawanPercent": 80.1,
      "saksiPercent": 50,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Tojo Una-Una",
      "relawanPercent": 88.7,
      "saksiPercent": 92.6,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Tolitoli",
      "relawanPercent": 89.6,
      "saksiPercent": 90.9,
      "panPercent": 43.8
    }
  ],
  "sulut": [
    {
      "name": "Kota Manado",
      "relawanPercent": 102.1,
      "saksiPercent": 104,
      "panPercent": 19
    },
    {
      "name": "Kota Bitung",
      "relawanPercent": 119.5,
      "saksiPercent": 92.9,
      "panPercent": 44.8
    },
    {
      "name": "Kota Tomohon",
      "relawanPercent": 100,
      "saksiPercent": 93.5,
      "panPercent": 41.8
    },
    {
      "name": "Kota Kotamobagu",
      "relawanPercent": 136.9,
      "saksiPercent": 100,
      "panPercent": 15
    },
    {
      "name": "Kab. Bolaang Mongondow",
      "relawanPercent": 114.8,
      "saksiPercent": 100,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Bolaang Mongondow Selatan",
      "relawanPercent": 112.6,
      "saksiPercent": 85,
      "panPercent": 20
    },
    {
      "name": "Kab. Bolaang Mongondow Timur",
      "relawanPercent": 100,
      "saksiPercent": 105.9,
      "panPercent": 28
    },
    {
      "name": "Kab. Bolaang Mongondow Utara",
      "relawanPercent": 123,
      "saksiPercent": 104,
      "panPercent": 36
    },
    {
      "name": "Kab. Kepulauan Sangihe",
      "relawanPercent": 120.6,
      "saksiPercent": 103.4,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Kepulauan Siau Tagulandang Biaro",
      "relawanPercent": 106.7,
      "saksiPercent": 104,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Kepulauan Talaud",
      "relawanPercent": 130,
      "saksiPercent": 104.3,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Minahasa",
      "relawanPercent": 124,
      "saksiPercent": 87.5,
      "panPercent": 16
    },
    {
      "name": "Kab. Minahasa Selatan",
      "relawanPercent": 107.9,
      "saksiPercent": 105.6,
      "panPercent": 45.8
    },
    {
      "name": "Kab. Minahasa Tenggara",
      "relawanPercent": 130,
      "saksiPercent": 95.7,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Minahasa Utara",
      "relawanPercent": 106.7,
      "saksiPercent": 105.3,
      "panPercent": 40.8
    }
  ],
  "sultra": [
    {
      "name": "Kota Kendari",
      "relawanPercent": 92.5,
      "saksiPercent": 107.7,
      "panPercent": 43.8
    },
    {
      "name": "Kota Baubau",
      "relawanPercent": 92.5,
      "saksiPercent": 58.8,
      "panPercent": 0
    },
    {
      "name": "Kab. Bombana",
      "relawanPercent": 79.9,
      "saksiPercent": 65,
      "panPercent": 23
    },
    {
      "name": "Kab. Buton",
      "relawanPercent": 88.2,
      "saksiPercent": 10.7,
      "panPercent": 31
    },
    {
      "name": "Kab. Buton Selatan",
      "relawanPercent": 80.1,
      "saksiPercent": 95.8,
      "panPercent": 33
    },
    {
      "name": "Kab. Buton Tengah",
      "relawanPercent": 92.5,
      "saksiPercent": 88.9,
      "panPercent": 0
    },
    {
      "name": "Kab. Buton Utara",
      "relawanPercent": 94.1,
      "saksiPercent": 0,
      "panPercent": 42.8
    },
    {
      "name": "Kab. Kolaka",
      "relawanPercent": 80,
      "saksiPercent": 0,
      "panPercent": 0
    },
    {
      "name": "Kab. Kolaka Timur",
      "relawanPercent": 89.8,
      "saksiPercent": 100,
      "panPercent": 23
    },
    {
      "name": "Kab. Kolaka Utara",
      "relawanPercent": 79.9,
      "saksiPercent": 88.5,
      "panPercent": 22
    },
    {
      "name": "Kab. Konawe",
      "relawanPercent": 99,
      "saksiPercent": 92.6,
      "panPercent": 15
    },
    {
      "name": "Kab. Konawe Kepulauan",
      "relawanPercent": 97.5,
      "saksiPercent": 42.1,
      "panPercent": 26
    },
    {
      "name": "Kab. Konawe Selatan",
      "relawanPercent": 80,
      "saksiPercent": 100,
      "panPercent": 0
    },
    {
      "name": "Kab. Konawe Utara",
      "relawanPercent": 79.9,
      "saksiPercent": 104.5,
      "panPercent": 15
    },
    {
      "name": "Kab. Muna",
      "relawanPercent": 80.1,
      "saksiPercent": 100,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Muna Barat",
      "relawanPercent": 80.1,
      "saksiPercent": 104.3,
      "panPercent": 0
    },
    {
      "name": "Kab. Wakatobi",
      "relawanPercent": 91.5,
      "saksiPercent": 0,
      "panPercent": 12.5
    }
  ],
  "gorontalo": [
    {
      "name": "Kota Gorontalo",
      "relawanPercent": 87.2,
      "saksiPercent": 20,
      "panPercent": 21
    },
    {
      "name": "Kab. Boalemo",
      "relawanPercent": 81.1,
      "saksiPercent": 5.6,
      "panPercent": 45.8
    },
    {
      "name": "Kab. Bone Bolango",
      "relawanPercent": 98.9,
      "saksiPercent": 8,
      "panPercent": 42.8
    },
    {
      "name": "Kab. Gorontalo",
      "relawanPercent": 93.4,
      "saksiPercent": 20,
      "panPercent": 31
    },
    {
      "name": "Kab. Gorontalo Utara",
      "relawanPercent": 80,
      "saksiPercent": 13,
      "panPercent": 0
    },
    {
      "name": "Kab. Pohuwato",
      "relawanPercent": 99,
      "saksiPercent": 16.7,
      "panPercent": 33
    }
  ],
  "sulbar": [
    {
      "name": "Kab. Majene",
      "relawanPercent": 78.1,
      "saksiPercent": 12,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Mamasa",
      "relawanPercent": 78.1,
      "saksiPercent": 12,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Mamuju",
      "relawanPercent": 77.3,
      "saksiPercent": 20.8,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Mamuju Tengah",
      "relawanPercent": 78.1,
      "saksiPercent": 16,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Pasangkayu",
      "relawanPercent": 79.1,
      "saksiPercent": 19,
      "panPercent": 15
    },
    {
      "name": "Kab. Polewali Mandar",
      "relawanPercent": 78.9,
      "saksiPercent": 7.7,
      "panPercent": 43.8
    }
  ],
  "ntt": [
    {
      "name": "Kota Kupang",
      "relawanPercent": 61.5,
      "saksiPercent": 16.7,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Alor",
      "relawanPercent": 64.8,
      "saksiPercent": 10.5,
      "panPercent": 45.8
    },
    {
      "name": "Kab. Belu",
      "relawanPercent": 55.4,
      "saksiPercent": 9.5,
      "panPercent": 0
    },
    {
      "name": "Kab. Ende",
      "relawanPercent": 56.7,
      "saksiPercent": 13,
      "panPercent": 42.8
    },
    {
      "name": "Kab. Flores Timur",
      "relawanPercent": 77.3,
      "saksiPercent": 21.1,
      "panPercent": 45.8
    },
    {
      "name": "Kab. Kupang",
      "relawanPercent": 55.4,
      "saksiPercent": 16.7,
      "panPercent": 0
    },
    {
      "name": "Kab. Lembata",
      "relawanPercent": 57.8,
      "saksiPercent": 17.4,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Malaka",
      "relawanPercent": 69.7,
      "saksiPercent": 18.2,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Manggarai",
      "relawanPercent": 77.9,
      "saksiPercent": 20,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Manggarai Barat",
      "relawanPercent": 64.2,
      "saksiPercent": 11.5,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Manggarai Timur",
      "relawanPercent": 63.6,
      "saksiPercent": 16,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Nagekeo",
      "relawanPercent": 60.8,
      "saksiPercent": 21.1,
      "panPercent": 17
    },
    {
      "name": "Kab. Ngada",
      "relawanPercent": 60.1,
      "saksiPercent": 22.2,
      "panPercent": 15
    },
    {
      "name": "Kab. Rote Ndao",
      "relawanPercent": 70.3,
      "saksiPercent": 23.5,
      "panPercent": 45.8
    },
    {
      "name": "Kab. Sabu Raijua",
      "relawanPercent": 65.6,
      "saksiPercent": 16.7,
      "panPercent": 33
    },
    {
      "name": "Kab. Sikka",
      "relawanPercent": 77.9,
      "saksiPercent": 8.3,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Sumba Barat",
      "relawanPercent": 68.9,
      "saksiPercent": 21.7,
      "panPercent": 0
    },
    {
      "name": "Kab. Sumba Barat Daya",
      "relawanPercent": 72.5,
      "saksiPercent": 8.3,
      "panPercent": 31
    },
    {
      "name": "Kab. Sumba Tengah",
      "relawanPercent": 64.2,
      "saksiPercent": 14.3,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Sumba Timur",
      "relawanPercent": 69.7,
      "saksiPercent": 12.5,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Timor Tengah Selatan",
      "relawanPercent": 63.6,
      "saksiPercent": 8.7,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Timor Tengah Utara",
      "relawanPercent": 78.9,
      "saksiPercent": 21.4,
      "panPercent": 29
    }
  ],
  "ntb": [
    {
      "name": "Kota Mataram",
      "relawanPercent": 100.8,
      "saksiPercent": 95,
      "panPercent": 29
    },
    {
      "name": "Kota Bima",
      "relawanPercent": 102.8,
      "saksiPercent": 100,
      "panPercent": 18
    },
    {
      "name": "Kab. Lombok Barat",
      "relawanPercent": 100.8,
      "saksiPercent": 0,
      "panPercent": 29
    },
    {
      "name": "Kab. Lombok Tengah",
      "relawanPercent": 100,
      "saksiPercent": 85.2,
      "panPercent": 19
    },
    {
      "name": "Kab. Lombok Timur",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 45.8
    },
    {
      "name": "Kab. Lombok Utara",
      "relawanPercent": 120.8,
      "saksiPercent": 0,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Sumbawa",
      "relawanPercent": 119.7,
      "saksiPercent": 100,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Sumbawa Barat",
      "relawanPercent": 100,
      "saksiPercent": 0,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Dompu",
      "relawanPercent": 100,
      "saksiPercent": 55.6,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Bima",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 17
    }
  ],
  "bali": [
    {
      "name": "Kota Denpasar",
      "relawanPercent": 118.9,
      "saksiPercent": 104,
      "panPercent": 0
    },
    {
      "name": "Kab. Badung",
      "relawanPercent": 102.4,
      "saksiPercent": 94.1,
      "panPercent": 36
    },
    {
      "name": "Kab. Bangli",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Buleleng",
      "relawanPercent": 129.8,
      "saksiPercent": 100,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Gianyar",
      "relawanPercent": 135.6,
      "saksiPercent": 105.3,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Jembrana",
      "relawanPercent": 100,
      "saksiPercent": 100,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Karangasem",
      "relawanPercent": 129.8,
      "saksiPercent": 83.3,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Klungkung",
      "relawanPercent": 120.1,
      "saksiPercent": 100,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Tabanan",
      "relawanPercent": 111.8,
      "saksiPercent": 105.3,
      "panPercent": 43.8
    }
  ],
  "maluku": [
    {
      "name": "Kota Ambon",
      "relawanPercent": 64.7,
      "saksiPercent": 8,
      "panPercent": 42.8
    },
    {
      "name": "Kota Tual",
      "relawanPercent": 78.9,
      "saksiPercent": 12.5,
      "panPercent": 17
    },
    {
      "name": "Kab. Buru",
      "relawanPercent": 69.3,
      "saksiPercent": 6.7,
      "panPercent": 0
    },
    {
      "name": "Kab. Buru Selatan",
      "relawanPercent": 67.8,
      "saksiPercent": 10.5,
      "panPercent": 18
    },
    {
      "name": "Kab. Kepulauan Aru",
      "relawanPercent": 66.2,
      "saksiPercent": 13,
      "panPercent": 36
    },
    {
      "name": "Kab. Kepulauan Tanimbar",
      "relawanPercent": 79.1,
      "saksiPercent": 15.8,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Maluku Barat Daya",
      "relawanPercent": 79.1,
      "saksiPercent": 7.7,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Maluku Tengah",
      "relawanPercent": 79,
      "saksiPercent": 13.3,
      "panPercent": 0
    },
    {
      "name": "Kab. Maluku Tenggara",
      "relawanPercent": 79,
      "saksiPercent": 11.8,
      "panPercent": 20
    },
    {
      "name": "Kab. Seram Bagian Barat",
      "relawanPercent": 73.9,
      "saksiPercent": 22.2,
      "panPercent": 30
    },
    {
      "name": "Kab. Seram Bagian Timur",
      "relawanPercent": 74.6,
      "saksiPercent": 15.4,
      "panPercent": 22
    }
  ],
  "malut": [
    {
      "name": "Kota Ternate",
      "relawanPercent": 61.4,
      "saksiPercent": 0,
      "panPercent": 40.8
    },
    {
      "name": "Kota Tidore Kepulauan",
      "relawanPercent": 74.6,
      "saksiPercent": 0,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Halmahera Barat",
      "relawanPercent": 65.2,
      "saksiPercent": 0,
      "panPercent": 19
    },
    {
      "name": "Kab. Halmahera Tengah",
      "relawanPercent": 79.1,
      "saksiPercent": 0,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Halmahera Timur",
      "relawanPercent": 64.4,
      "saksiPercent": 0,
      "panPercent": 16
    },
    {
      "name": "Kab. Halmahera Selatan",
      "relawanPercent": 62.3,
      "saksiPercent": 0,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Halmahera Utara",
      "relawanPercent": 79.1,
      "saksiPercent": 0,
      "panPercent": 17
    },
    {
      "name": "Kab. Kepulauan Sula",
      "relawanPercent": 72.4,
      "saksiPercent": 0,
      "panPercent": 22
    },
    {
      "name": "Kab. Pulau Morotai",
      "relawanPercent": 65.9,
      "saksiPercent": 0,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Pulau Taliabu",
      "relawanPercent": 74,
      "saksiPercent": 0,
      "panPercent": 0
    }
  ],
  "papua": [
    {
      "name": "Kota Jayapura",
      "relawanPercent": 112.1,
      "saksiPercent": 0,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Jayapura",
      "relawanPercent": 111.4,
      "saksiPercent": 0,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Keerom",
      "relawanPercent": 128.4,
      "saksiPercent": 0,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Sarmi",
      "relawanPercent": 125.2,
      "saksiPercent": 0,
      "panPercent": 34
    },
    {
      "name": "Kab. Mamberamo Raya",
      "relawanPercent": 101.4,
      "saksiPercent": 0,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Supiori",
      "relawanPercent": 102.4,
      "saksiPercent": 0,
      "panPercent": 37
    },
    {
      "name": "Kab. Biak Numfor",
      "relawanPercent": 122.9,
      "saksiPercent": 0,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Kepulauan Yapen",
      "relawanPercent": 126.5,
      "saksiPercent": 0,
      "panPercent": 19
    },
    {
      "name": "Kab. Waropen",
      "relawanPercent": 114.5,
      "saksiPercent": 0,
      "panPercent": 28
    }
  ],
  "papuapegunungan": [
    {
      "name": "Kab. Jayawijaya",
      "relawanPercent": 7.6,
      "saksiPercent": 19,
      "panPercent": 21
    },
    {
      "name": "Kab. Lanny Jaya",
      "relawanPercent": 9.1,
      "saksiPercent": 18.8,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Mamberamo Tengah",
      "relawanPercent": 7.1,
      "saksiPercent": 20,
      "panPercent": 0
    },
    {
      "name": "Kab. Nduga",
      "relawanPercent": 9.5,
      "saksiPercent": 16.7,
      "panPercent": 22
    },
    {
      "name": "Kab. Pegunungan Bintang",
      "relawanPercent": 7,
      "saksiPercent": 16.7,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Tolikara",
      "relawanPercent": 6.9,
      "saksiPercent": 18.2,
      "panPercent": 27
    },
    {
      "name": "Kab. Yahukimo",
      "relawanPercent": 7.4,
      "saksiPercent": 7.1,
      "panPercent": 42.8
    },
    {
      "name": "Kab. Yalimo",
      "relawanPercent": 8.5,
      "saksiPercent": 8.3,
      "panPercent": 15
    }
  ],
  "papuatengah": [
    {
      "name": "Kab. Nabire",
      "relawanPercent": 92,
      "saksiPercent": 17.4,
      "panPercent": 16
    },
    {
      "name": "Kab. Deiyai",
      "relawanPercent": 88.5,
      "saksiPercent": 18.5,
      "panPercent": 42.8
    },
    {
      "name": "Kab. Dogiyai",
      "relawanPercent": 80,
      "saksiPercent": 12.5,
      "panPercent": 41.8
    },
    {
      "name": "Kab. Intan Jaya",
      "relawanPercent": 79.8,
      "saksiPercent": 17.6,
      "panPercent": 28
    },
    {
      "name": "Kab. Mimika",
      "relawanPercent": 80.3,
      "saksiPercent": 13.6,
      "panPercent": 44.8
    },
    {
      "name": "Kab. Paniai",
      "relawanPercent": 98.9,
      "saksiPercent": 12.5,
      "panPercent": 18
    },
    {
      "name": "Kab. Puncak",
      "relawanPercent": 85.5,
      "saksiPercent": 12.5,
      "panPercent": 42.8
    },
    {
      "name": "Kab. Puncak Jaya",
      "relawanPercent": 85.3,
      "saksiPercent": 8,
      "panPercent": 0
    }
  ],
  "papuabarat": [
    {
      "name": "Kab. Manokwari",
      "relawanPercent": 85.7,
      "saksiPercent": 16.7,
      "panPercent": 40.8
    },
    {
      "name": "Kab. Fakfak",
      "relawanPercent": 82.9,
      "saksiPercent": 12,
      "panPercent": 0
    },
    {
      "name": "Kab. Kaimana",
      "relawanPercent": 98.8,
      "saksiPercent": 20,
      "panPercent": 42.8
    },
    {
      "name": "Kab. Manokwari Selatan",
      "relawanPercent": 87.5,
      "saksiPercent": 20.8,
      "panPercent": 37
    },
    {
      "name": "Kab. Pegunungan Arfak",
      "relawanPercent": 87.5,
      "saksiPercent": 12.5,
      "panPercent": 29
    },
    {
      "name": "Kab. Teluk Bintuni",
      "relawanPercent": 90,
      "saksiPercent": 19,
      "panPercent": 22
    },
    {
      "name": "Kab. Teluk Wondama",
      "relawanPercent": 82.9,
      "saksiPercent": 13,
      "panPercent": 0
    }
  ],
  "papuaselatan": [
    {
      "name": "Kab. Merauke",
      "relawanPercent": 16.4,
      "saksiPercent": 15.4,
      "panPercent": 0
    },
    {
      "name": "Kab. Asmat",
      "relawanPercent": 14.6,
      "saksiPercent": 13,
      "panPercent": 30
    },
    {
      "name": "Kab. Boven Digoel",
      "relawanPercent": 11.9,
      "saksiPercent": 17.4,
      "panPercent": 0
    },
    {
      "name": "Kab. Mappi",
      "relawanPercent": 13.2,
      "saksiPercent": 12.5,
      "panPercent": 20
    }
  ],
  "papuabaratdaya": [
    {
      "name": "Kota Sorong",
      "relawanPercent": 100,
      "saksiPercent": 0,
      "panPercent": 0
    },
    {
      "name": "Kab. Sorong",
      "relawanPercent": 100,
      "saksiPercent": 0,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Maybrat",
      "relawanPercent": 105.6,
      "saksiPercent": 0,
      "panPercent": 12.5
    },
    {
      "name": "Kab. Raja Ampat",
      "relawanPercent": 100.5,
      "saksiPercent": 0,
      "panPercent": 46.8
    },
    {
      "name": "Kab. Sorong Selatan",
      "relawanPercent": 109.7,
      "saksiPercent": 0,
      "panPercent": 43.8
    },
    {
      "name": "Kab. Tambrauw",
      "relawanPercent": 111.1,
      "saksiPercent": 0,
      "panPercent": 41.8
    }
  ]
};
