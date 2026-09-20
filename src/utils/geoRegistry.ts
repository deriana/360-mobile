/**
 * Spatial GeoJSON Dynamic Registry & Lazy Loader (100% Offline)
 * Mengadopsi 34 GeoJSON Provinsi (Kab/Kota) dan 519 GeoJSON Kab/Kota (Kecamatan)
 * Diadopsi dari Saksi360-Admin
 */

const provinceCache = new Map<string, any>();
const regencyCache = new Map<string, any>();

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/^(kabupaten|kab\.|kota|provinsi|prov\.)\s+/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
}

export function normalizeProvinceSlug(name: string): string {
  const clean = name.replace(/^(provinsi|prov\.)\s*/i, '').trim();
  const rawSlug = slugify(clean);
  if (rawSlug === 'dki-jakarta' || rawSlug === 'jakarta') return 'dki-jakarta';
  if (rawSlug === 'di-yogyakarta' || rawSlug === 'yogyakarta' || rawSlug.includes('istimewa-yogyakarta')) return 'di-yogyakarta';
  if (rawSlug.includes('bangka-belitung')) return 'bangka-belitung';
  if (rawSlug.includes('kepulauan-riau') || rawSlug === 'kep-riau') return 'kepulauan-riau';
  if (rawSlug.includes('nusa-tenggara-barat') || rawSlug === 'ntb') return 'nusa-tenggara-barat';
  if (rawSlug.includes('nusa-tenggara-timur') || rawSlug === 'ntt') return 'nusa-tenggara-timur';
  return rawSlug;
}

const PROVINCE_LOADERS: Record<string, () => any> = {
  'aceh': () => require('../data/geo/kabupaten/aceh.json'),
  'bali': () => require('../data/geo/kabupaten/bali.json'),
  'bangka-belitung': () => require('../data/geo/kabupaten/bangka-belitung.json'),
  'banten': () => require('../data/geo/kabupaten/banten.json'),
  'bengkulu': () => require('../data/geo/kabupaten/bengkulu.json'),
  'di-yogyakarta': () => require('../data/geo/kabupaten/di-yogyakarta.json'),
  'dki-jakarta': () => require('../data/geo/kabupaten/dki-jakarta.json'),
  'gorontalo': () => require('../data/geo/kabupaten/gorontalo.json'),
  'jambi': () => require('../data/geo/kabupaten/jambi.json'),
  'jawa-barat': () => require('../data/geo/kabupaten/jawa-barat.json'),
  'jawa-tengah': () => require('../data/geo/kabupaten/jawa-tengah.json'),
  'jawa-timur': () => require('../data/geo/kabupaten/jawa-timur.json'),
  'kalimantan-barat': () => require('../data/geo/kabupaten/kalimantan-barat.json'),
  'kalimantan-selatan': () => require('../data/geo/kabupaten/kalimantan-selatan.json'),
  'kalimantan-tengah': () => require('../data/geo/kabupaten/kalimantan-tengah.json'),
  'kalimantan-timur': () => require('../data/geo/kabupaten/kalimantan-timur.json'),
  'kalimantan-utara': () => require('../data/geo/kabupaten/kalimantan-utara.json'),
  'kepulauan-riau': () => require('../data/geo/kabupaten/kepulauan-riau.json'),
  'lampung': () => require('../data/geo/kabupaten/lampung.json'),
  'maluku-utara': () => require('../data/geo/kabupaten/maluku-utara.json'),
  'maluku': () => require('../data/geo/kabupaten/maluku.json'),
  'nusa-tenggara-barat': () => require('../data/geo/kabupaten/nusa-tenggara-barat.json'),
  'nusa-tenggara-timur': () => require('../data/geo/kabupaten/nusa-tenggara-timur.json'),
  'papua-barat': () => require('../data/geo/kabupaten/papua-barat.json'),
  'papua': () => require('../data/geo/kabupaten/papua.json'),
  'riau': () => require('../data/geo/kabupaten/riau.json'),
  'sulawesi-barat': () => require('../data/geo/kabupaten/sulawesi-barat.json'),
  'sulawesi-selatan': () => require('../data/geo/kabupaten/sulawesi-selatan.json'),
  'sulawesi-tengah': () => require('../data/geo/kabupaten/sulawesi-tengah.json'),
  'sulawesi-tenggara': () => require('../data/geo/kabupaten/sulawesi-tenggara.json'),
  'sulawesi-utara': () => require('../data/geo/kabupaten/sulawesi-utara.json'),
  'sumatera-barat': () => require('../data/geo/kabupaten/sumatera-barat.json'),
  'sumatera-selatan': () => require('../data/geo/kabupaten/sumatera-selatan.json'),
  'sumatera-utara': () => require('../data/geo/kabupaten/sumatera-utara.json'),
};

const KABUPATEN_LOADERS: Record<string, () => any> = {
  'aceh-barat-daya': () => require('../data/geo/kecamatan/aceh-barat-daya.json'),
  'aceh-barat': () => require('../data/geo/kecamatan/aceh-barat.json'),
  'aceh-besar': () => require('../data/geo/kecamatan/aceh-besar.json'),
  'aceh-jaya': () => require('../data/geo/kecamatan/aceh-jaya.json'),
  'aceh-selatan': () => require('../data/geo/kecamatan/aceh-selatan.json'),
  'aceh-singkil': () => require('../data/geo/kecamatan/aceh-singkil.json'),
  'aceh-tamiang': () => require('../data/geo/kecamatan/aceh-tamiang.json'),
  'aceh-tengah': () => require('../data/geo/kecamatan/aceh-tengah.json'),
  'aceh-tenggara': () => require('../data/geo/kecamatan/aceh-tenggara.json'),
  'aceh-timur': () => require('../data/geo/kecamatan/aceh-timur.json'),
  'aceh-utara': () => require('../data/geo/kecamatan/aceh-utara.json'),
  'agam': () => require('../data/geo/kecamatan/agam.json'),
  'alor': () => require('../data/geo/kecamatan/alor.json'),
  'asahan': () => require('../data/geo/kecamatan/asahan.json'),
  'asmat': () => require('../data/geo/kecamatan/asmat.json'),
  'badung': () => require('../data/geo/kecamatan/badung.json'),
  'balangan': () => require('../data/geo/kecamatan/balangan.json'),
  'bandung-barat': () => require('../data/geo/kecamatan/bandung-barat.json'),
  'bandung': () => require('../data/geo/kecamatan/bandung.json'),
  'banggai-kepulauan': () => require('../data/geo/kecamatan/banggai-kepulauan.json'),
  'banggai-laut': () => require('../data/geo/kecamatan/banggai-laut.json'),
  'banggai': () => require('../data/geo/kecamatan/banggai.json'),
  'bangka-barat': () => require('../data/geo/kecamatan/bangka-barat.json'),
  'bangka-selatan': () => require('../data/geo/kecamatan/bangka-selatan.json'),
  'bangka-tengah': () => require('../data/geo/kecamatan/bangka-tengah.json'),
  'bangka': () => require('../data/geo/kecamatan/bangka.json'),
  'bangkalan': () => require('../data/geo/kecamatan/bangkalan.json'),
  'bangli': () => require('../data/geo/kecamatan/bangli.json'),
  'banjar': () => require('../data/geo/kecamatan/banjar.json'),
  'banjarnegara': () => require('../data/geo/kecamatan/banjarnegara.json'),
  'bantaeng': () => require('../data/geo/kecamatan/bantaeng.json'),
  'bantul': () => require('../data/geo/kecamatan/bantul.json'),
  'banyu-asin': () => require('../data/geo/kecamatan/banyu-asin.json'),
  'banyumas': () => require('../data/geo/kecamatan/banyumas.json'),
  'banyuwangi': () => require('../data/geo/kecamatan/banyuwangi.json'),
  'barito-kuala': () => require('../data/geo/kecamatan/barito-kuala.json'),
  'barito-selatan': () => require('../data/geo/kecamatan/barito-selatan.json'),
  'barito-timur': () => require('../data/geo/kecamatan/barito-timur.json'),
  'barito-utara': () => require('../data/geo/kecamatan/barito-utara.json'),
  'barru': () => require('../data/geo/kecamatan/barru.json'),
  'batang-hari': () => require('../data/geo/kecamatan/batang-hari.json'),
  'batang': () => require('../data/geo/kecamatan/batang.json'),
  'batu-bara': () => require('../data/geo/kecamatan/batu-bara.json'),
  'bekasi': () => require('../data/geo/kecamatan/bekasi.json'),
  'belitung-timur': () => require('../data/geo/kecamatan/belitung-timur.json'),
  'belitung': () => require('../data/geo/kecamatan/belitung.json'),
  'belu': () => require('../data/geo/kecamatan/belu.json'),
  'bener-meriah': () => require('../data/geo/kecamatan/bener-meriah.json'),
  'bengkalis': () => require('../data/geo/kecamatan/bengkalis.json'),
  'bengkayang': () => require('../data/geo/kecamatan/bengkayang.json'),
  'bengkulu-selatan': () => require('../data/geo/kecamatan/bengkulu-selatan.json'),
  'bengkulu-tengah': () => require('../data/geo/kecamatan/bengkulu-tengah.json'),
  'bengkulu-utara': () => require('../data/geo/kecamatan/bengkulu-utara.json'),
  'berau': () => require('../data/geo/kecamatan/berau.json'),
  'biak-numfor': () => require('../data/geo/kecamatan/biak-numfor.json'),
  'bima': () => require('../data/geo/kecamatan/bima.json'),
  'bintan': () => require('../data/geo/kecamatan/bintan.json'),
  'bireuen': () => require('../data/geo/kecamatan/bireuen.json'),
  'blitar': () => require('../data/geo/kecamatan/blitar.json'),
  'blora': () => require('../data/geo/kecamatan/blora.json'),
  'boalemo': () => require('../data/geo/kecamatan/boalemo.json'),
  'bogor': () => require('../data/geo/kecamatan/bogor.json'),
  'bojonegoro': () => require('../data/geo/kecamatan/bojonegoro.json'),
  'bolaang-mongondow-selatan': () => require('../data/geo/kecamatan/bolaang-mongondow-selatan.json'),
  'bolaang-mongondow-timur': () => require('../data/geo/kecamatan/bolaang-mongondow-timur.json'),
  'bolaang-mongondow-utara': () => require('../data/geo/kecamatan/bolaang-mongondow-utara.json'),
  'bolaang-mongondow': () => require('../data/geo/kecamatan/bolaang-mongondow.json'),
  'bombana': () => require('../data/geo/kecamatan/bombana.json'),
  'bondowoso': () => require('../data/geo/kecamatan/bondowoso.json'),
  'bone-bolango': () => require('../data/geo/kecamatan/bone-bolango.json'),
  'bone': () => require('../data/geo/kecamatan/bone.json'),
  'boven-digoel': () => require('../data/geo/kecamatan/boven-digoel.json'),
  'boyolali': () => require('../data/geo/kecamatan/boyolali.json'),
  'brebes': () => require('../data/geo/kecamatan/brebes.json'),
  'buleleng': () => require('../data/geo/kecamatan/buleleng.json'),
  'bulukumba': () => require('../data/geo/kecamatan/bulukumba.json'),
  'bulungan': () => require('../data/geo/kecamatan/bulungan.json'),
  'bungo': () => require('../data/geo/kecamatan/bungo.json'),
  'buol': () => require('../data/geo/kecamatan/buol.json'),
  'buru-selatan': () => require('../data/geo/kecamatan/buru-selatan.json'),
  'buru': () => require('../data/geo/kecamatan/buru.json'),
  'buton-selatan': () => require('../data/geo/kecamatan/buton-selatan.json'),
  'buton-tengah': () => require('../data/geo/kecamatan/buton-tengah.json'),
  'buton-utara': () => require('../data/geo/kecamatan/buton-utara.json'),
  'buton': () => require('../data/geo/kecamatan/buton.json'),
  'ciamis': () => require('../data/geo/kecamatan/ciamis.json'),
  'cianjur': () => require('../data/geo/kecamatan/cianjur.json'),
  'cilacap': () => require('../data/geo/kecamatan/cilacap.json'),
  'cirebon': () => require('../data/geo/kecamatan/cirebon.json'),
  'dairi': () => require('../data/geo/kecamatan/dairi.json'),
  'danau-toba': () => require('../data/geo/kecamatan/danau-toba.json'),
  'danau': () => require('../data/geo/kecamatan/danau.json'),
  'deiyai': () => require('../data/geo/kecamatan/deiyai.json'),
  'deli-serdang': () => require('../data/geo/kecamatan/deli-serdang.json'),
  'demak': () => require('../data/geo/kecamatan/demak.json'),
  'dharmasraya': () => require('../data/geo/kecamatan/dharmasraya.json'),
  'dogiyai': () => require('../data/geo/kecamatan/dogiyai.json'),
  'dompu': () => require('../data/geo/kecamatan/dompu.json'),
  'donggala': () => require('../data/geo/kecamatan/donggala.json'),
  'empat-lawang': () => require('../data/geo/kecamatan/empat-lawang.json'),
  'ende': () => require('../data/geo/kecamatan/ende.json'),
  'enrekang': () => require('../data/geo/kecamatan/enrekang.json'),
  'fakfak': () => require('../data/geo/kecamatan/fakfak.json'),
  'flores-timur': () => require('../data/geo/kecamatan/flores-timur.json'),
  'garut': () => require('../data/geo/kecamatan/garut.json'),
  'gayo-lues': () => require('../data/geo/kecamatan/gayo-lues.json'),
  'gianyar': () => require('../data/geo/kecamatan/gianyar.json'),
  'gorontalo-utara': () => require('../data/geo/kecamatan/gorontalo-utara.json'),
  'gorontalo': () => require('../data/geo/kecamatan/gorontalo.json'),
  'gowa': () => require('../data/geo/kecamatan/gowa.json'),
  'gresik': () => require('../data/geo/kecamatan/gresik.json'),
  'grobogan': () => require('../data/geo/kecamatan/grobogan.json'),
  'gunung-kidul': () => require('../data/geo/kecamatan/gunung-kidul.json'),
  'gunung-mas': () => require('../data/geo/kecamatan/gunung-mas.json'),
  'halmahera-barat': () => require('../data/geo/kecamatan/halmahera-barat.json'),
  'halmahera-selatan': () => require('../data/geo/kecamatan/halmahera-selatan.json'),
  'halmahera-tengah': () => require('../data/geo/kecamatan/halmahera-tengah.json'),
  'halmahera-timur': () => require('../data/geo/kecamatan/halmahera-timur.json'),
  'halmahera-utara': () => require('../data/geo/kecamatan/halmahera-utara.json'),
  'hulu-sungai-selatan': () => require('../data/geo/kecamatan/hulu-sungai-selatan.json'),
  'hulu-sungai-tengah': () => require('../data/geo/kecamatan/hulu-sungai-tengah.json'),
  'hulu-sungai-utara': () => require('../data/geo/kecamatan/hulu-sungai-utara.json'),
  'humbang-hasundutan': () => require('../data/geo/kecamatan/humbang-hasundutan.json'),
  'hutan': () => require('../data/geo/kecamatan/hutan.json'),
  'indragiri-hilir': () => require('../data/geo/kecamatan/indragiri-hilir.json'),
  'indragiri-hulu': () => require('../data/geo/kecamatan/indragiri-hulu.json'),
  'indramayu': () => require('../data/geo/kecamatan/indramayu.json'),
  'intan-jaya': () => require('../data/geo/kecamatan/intan-jaya.json'),
  'jayapura': () => require('../data/geo/kecamatan/jayapura.json'),
  'jayawijaya': () => require('../data/geo/kecamatan/jayawijaya.json'),
  'jember': () => require('../data/geo/kecamatan/jember.json'),
  'jembrana': () => require('../data/geo/kecamatan/jembrana.json'),
  'jeneponto': () => require('../data/geo/kecamatan/jeneponto.json'),
  'jepara': () => require('../data/geo/kecamatan/jepara.json'),
  'jombang': () => require('../data/geo/kecamatan/jombang.json'),
  'kaimana': () => require('../data/geo/kecamatan/kaimana.json'),
  'kampar': () => require('../data/geo/kecamatan/kampar.json'),
  'kapuas-hulu': () => require('../data/geo/kecamatan/kapuas-hulu.json'),
  'kapuas': () => require('../data/geo/kecamatan/kapuas.json'),
  'karang-asem': () => require('../data/geo/kecamatan/karang-asem.json'),
  'karanganyar': () => require('../data/geo/kecamatan/karanganyar.json'),
  'karawang': () => require('../data/geo/kecamatan/karawang.json'),
  'karimun': () => require('../data/geo/kecamatan/karimun.json'),
  'karo': () => require('../data/geo/kecamatan/karo.json'),
  'katingan': () => require('../data/geo/kecamatan/katingan.json'),
  'kaur': () => require('../data/geo/kecamatan/kaur.json'),
  'kayong-utara': () => require('../data/geo/kecamatan/kayong-utara.json'),
  'kebumen': () => require('../data/geo/kecamatan/kebumen.json'),
  'kediri': () => require('../data/geo/kecamatan/kediri.json'),
  'keerom': () => require('../data/geo/kecamatan/keerom.json'),
  'kendal': () => require('../data/geo/kecamatan/kendal.json'),
  'kepahiang': () => require('../data/geo/kecamatan/kepahiang.json'),
  'kepulauan-anambas': () => require('../data/geo/kecamatan/kepulauan-anambas.json'),
  'kepulauan-aru': () => require('../data/geo/kecamatan/kepulauan-aru.json'),
  'kepulauan-mentawai': () => require('../data/geo/kecamatan/kepulauan-mentawai.json'),
  'kepulauan-meranti': () => require('../data/geo/kecamatan/kepulauan-meranti.json'),
  'kepulauan-sangihe': () => require('../data/geo/kecamatan/kepulauan-sangihe.json'),
  'kepulauan-selayar': () => require('../data/geo/kecamatan/kepulauan-selayar.json'),
  'kepulauan-seribu': () => require('../data/geo/kecamatan/kepulauan-seribu.json'),
  'kepulauan-sula': () => require('../data/geo/kecamatan/kepulauan-sula.json'),
  'kepulauan-talaud': () => require('../data/geo/kecamatan/kepulauan-talaud.json'),
  'kepulauan-yapen': () => require('../data/geo/kecamatan/kepulauan-yapen.json'),
  'kerinci': () => require('../data/geo/kecamatan/kerinci.json'),
  'ketapang': () => require('../data/geo/kecamatan/ketapang.json'),
  'klaten': () => require('../data/geo/kecamatan/klaten.json'),
  'klungkung': () => require('../data/geo/kecamatan/klungkung.json'),
  'kolaka-timur': () => require('../data/geo/kecamatan/kolaka-timur.json'),
  'kolaka-utara': () => require('../data/geo/kecamatan/kolaka-utara.json'),
  'kolaka': () => require('../data/geo/kecamatan/kolaka.json'),
  'konawe-kepulauan': () => require('../data/geo/kecamatan/konawe-kepulauan.json'),
  'konawe-selatan': () => require('../data/geo/kecamatan/konawe-selatan.json'),
  'konawe-utara': () => require('../data/geo/kecamatan/konawe-utara.json'),
  'konawe': () => require('../data/geo/kecamatan/konawe.json'),
  'kota-ambon': () => require('../data/geo/kecamatan/kota-ambon.json'),
  'kota-balikpapan': () => require('../data/geo/kecamatan/kota-balikpapan.json'),
  'kota-banda-aceh': () => require('../data/geo/kecamatan/kota-banda-aceh.json'),
  'kota-bandar-lampung': () => require('../data/geo/kecamatan/kota-bandar-lampung.json'),
  'kota-bandung': () => require('../data/geo/kecamatan/kota-bandung.json'),
  'kota-banjar-baru': () => require('../data/geo/kecamatan/kota-banjar-baru.json'),
  'kota-banjar': () => require('../data/geo/kecamatan/kota-banjar.json'),
  'kota-banjarmasin': () => require('../data/geo/kecamatan/kota-banjarmasin.json'),
  'kota-baru': () => require('../data/geo/kecamatan/kota-baru.json'),
  'kota-batam': () => require('../data/geo/kecamatan/kota-batam.json'),
  'kota-batu': () => require('../data/geo/kecamatan/kota-batu.json'),
  'kota-baubau': () => require('../data/geo/kecamatan/kota-baubau.json'),
  'kota-bekasi': () => require('../data/geo/kecamatan/kota-bekasi.json'),
  'kota-bengkulu': () => require('../data/geo/kecamatan/kota-bengkulu.json'),
  'kota-bima': () => require('../data/geo/kecamatan/kota-bima.json'),
  'kota-binjai': () => require('../data/geo/kecamatan/kota-binjai.json'),
  'kota-bitung': () => require('../data/geo/kecamatan/kota-bitung.json'),
  'kota-blitar': () => require('../data/geo/kecamatan/kota-blitar.json'),
  'kota-bogor': () => require('../data/geo/kecamatan/kota-bogor.json'),
  'kota-bontang': () => require('../data/geo/kecamatan/kota-bontang.json'),
  'kota-bukittinggi': () => require('../data/geo/kecamatan/kota-bukittinggi.json'),
  'kota-cilegon': () => require('../data/geo/kecamatan/kota-cilegon.json'),
  'kota-cimahi': () => require('../data/geo/kecamatan/kota-cimahi.json'),
  'kota-cirebon': () => require('../data/geo/kecamatan/kota-cirebon.json'),
  'kota-denpasar': () => require('../data/geo/kecamatan/kota-denpasar.json'),
  'kota-depok': () => require('../data/geo/kecamatan/kota-depok.json'),
  'kota-dumai': () => require('../data/geo/kecamatan/kota-dumai.json'),
  'kota-gorontalo': () => require('../data/geo/kecamatan/kota-gorontalo.json'),
  'kota-gunungsitoli': () => require('../data/geo/kecamatan/kota-gunungsitoli.json'),
  'kota-jakarta-barat': () => require('../data/geo/kecamatan/kota-jakarta-barat.json'),
  'kota-jakarta-pusat': () => require('../data/geo/kecamatan/kota-jakarta-pusat.json'),
  'kota-jakarta-selatan': () => require('../data/geo/kecamatan/kota-jakarta-selatan.json'),
  'kota-jakarta-timur': () => require('../data/geo/kecamatan/kota-jakarta-timur.json'),
  'kota-jakarta-utara': () => require('../data/geo/kecamatan/kota-jakarta-utara.json'),
  'kota-jambi': () => require('../data/geo/kecamatan/kota-jambi.json'),
  'kota-jayapura': () => require('../data/geo/kecamatan/kota-jayapura.json'),
  'kota-kediri': () => require('../data/geo/kecamatan/kota-kediri.json'),
  'kota-kendari': () => require('../data/geo/kecamatan/kota-kendari.json'),
  'kota-kotamobagu': () => require('../data/geo/kecamatan/kota-kotamobagu.json'),
  'kota-kupang': () => require('../data/geo/kecamatan/kota-kupang.json'),
  'kota-langsa': () => require('../data/geo/kecamatan/kota-langsa.json'),
  'kota-lhokseumawe': () => require('../data/geo/kecamatan/kota-lhokseumawe.json'),
  'kota-lubuklinggau': () => require('../data/geo/kecamatan/kota-lubuklinggau.json'),
  'kota-madiun': () => require('../data/geo/kecamatan/kota-madiun.json'),
  'kota-magelang': () => require('../data/geo/kecamatan/kota-magelang.json'),
  'kota-makassar': () => require('../data/geo/kecamatan/kota-makassar.json'),
  'kota-malang': () => require('../data/geo/kecamatan/kota-malang.json'),
  'kota-manado': () => require('../data/geo/kecamatan/kota-manado.json'),
  'kota-mataram': () => require('../data/geo/kecamatan/kota-mataram.json'),
  'kota-medan': () => require('../data/geo/kecamatan/kota-medan.json'),
  'kota-metro': () => require('../data/geo/kecamatan/kota-metro.json'),
  'kota-mojokerto': () => require('../data/geo/kecamatan/kota-mojokerto.json'),
  'kota-padang-panjang': () => require('../data/geo/kecamatan/kota-padang-panjang.json'),
  'kota-padang': () => require('../data/geo/kecamatan/kota-padang.json'),
  'kota-padangsidimpuan': () => require('../data/geo/kecamatan/kota-padangsidimpuan.json'),
  'kota-pagar-alam': () => require('../data/geo/kecamatan/kota-pagar-alam.json'),
  'kota-palangka-raya': () => require('../data/geo/kecamatan/kota-palangka-raya.json'),
  'kota-palembang': () => require('../data/geo/kecamatan/kota-palembang.json'),
  'kota-palopo': () => require('../data/geo/kecamatan/kota-palopo.json'),
  'kota-palu': () => require('../data/geo/kecamatan/kota-palu.json'),
  'kota-pangkal-pinang': () => require('../data/geo/kecamatan/kota-pangkal-pinang.json'),
  'kota-parepare': () => require('../data/geo/kecamatan/kota-parepare.json'),
  'kota-pariaman': () => require('../data/geo/kecamatan/kota-pariaman.json'),
  'kota-pasuruan': () => require('../data/geo/kecamatan/kota-pasuruan.json'),
  'kota-payakumbuh': () => require('../data/geo/kecamatan/kota-payakumbuh.json'),
  'kota-pekalongan': () => require('../data/geo/kecamatan/kota-pekalongan.json'),
  'kota-pekanbaru': () => require('../data/geo/kecamatan/kota-pekanbaru.json'),
  'kota-pematang-siantar': () => require('../data/geo/kecamatan/kota-pematang-siantar.json'),
  'kota-pontianak': () => require('../data/geo/kecamatan/kota-pontianak.json'),
  'kota-prabumulih': () => require('../data/geo/kecamatan/kota-prabumulih.json'),
  'kota-probolinggo': () => require('../data/geo/kecamatan/kota-probolinggo.json'),
  'kota-sabang': () => require('../data/geo/kecamatan/kota-sabang.json'),
  'kota-salatiga': () => require('../data/geo/kecamatan/kota-salatiga.json'),
  'kota-samarinda': () => require('../data/geo/kecamatan/kota-samarinda.json'),
  'kota-sawah-lunto': () => require('../data/geo/kecamatan/kota-sawah-lunto.json'),
  'kota-semarang': () => require('../data/geo/kecamatan/kota-semarang.json'),
  'kota-serang': () => require('../data/geo/kecamatan/kota-serang.json'),
  'kota-sibolga': () => require('../data/geo/kecamatan/kota-sibolga.json'),
  'kota-singkawang': () => require('../data/geo/kecamatan/kota-singkawang.json'),
  'kota-solok': () => require('../data/geo/kecamatan/kota-solok.json'),
  'kota-sorong': () => require('../data/geo/kecamatan/kota-sorong.json'),
  'kota-subulussalam': () => require('../data/geo/kecamatan/kota-subulussalam.json'),
  'kota-sukabumi': () => require('../data/geo/kecamatan/kota-sukabumi.json'),
  'kota-sungai-penuh': () => require('../data/geo/kecamatan/kota-sungai-penuh.json'),
  'kota-surabaya': () => require('../data/geo/kecamatan/kota-surabaya.json'),
  'kota-surakarta': () => require('../data/geo/kecamatan/kota-surakarta.json'),
  'kota-tangerang-selatan': () => require('../data/geo/kecamatan/kota-tangerang-selatan.json'),
  'kota-tangerang': () => require('../data/geo/kecamatan/kota-tangerang.json'),
  'kota-tanjung-balai': () => require('../data/geo/kecamatan/kota-tanjung-balai.json'),
  'kota-tanjung-pinang': () => require('../data/geo/kecamatan/kota-tanjung-pinang.json'),
  'kota-tarakan': () => require('../data/geo/kecamatan/kota-tarakan.json'),
  'kota-tasikmalaya': () => require('../data/geo/kecamatan/kota-tasikmalaya.json'),
  'kota-tebing-tinggi': () => require('../data/geo/kecamatan/kota-tebing-tinggi.json'),
  'kota-tegal': () => require('../data/geo/kecamatan/kota-tegal.json'),
  'kota-ternate': () => require('../data/geo/kecamatan/kota-ternate.json'),
  'kota-tidore-kepulauan': () => require('../data/geo/kecamatan/kota-tidore-kepulauan.json'),
  'kota-tomohon': () => require('../data/geo/kecamatan/kota-tomohon.json'),
  'kota-tual': () => require('../data/geo/kecamatan/kota-tual.json'),
  'kota-yogyakarta': () => require('../data/geo/kecamatan/kota-yogyakarta.json'),
  'kotawaringin-barat': () => require('../data/geo/kecamatan/kotawaringin-barat.json'),
  'kotawaringin-timur': () => require('../data/geo/kecamatan/kotawaringin-timur.json'),
  'kuantan-singingi': () => require('../data/geo/kecamatan/kuantan-singingi.json'),
  'kubu-raya': () => require('../data/geo/kecamatan/kubu-raya.json'),
  'kudus': () => require('../data/geo/kecamatan/kudus.json'),
  'kulon-progo': () => require('../data/geo/kecamatan/kulon-progo.json'),
  'kuningan': () => require('../data/geo/kecamatan/kuningan.json'),
  'kupang': () => require('../data/geo/kecamatan/kupang.json'),
  'kutai-barat': () => require('../data/geo/kecamatan/kutai-barat.json'),
  'kutai-kartanegara': () => require('../data/geo/kecamatan/kutai-kartanegara.json'),
  'kutai-timur': () => require('../data/geo/kecamatan/kutai-timur.json'),
  'labuhan-batu-selatan': () => require('../data/geo/kecamatan/labuhan-batu-selatan.json'),
  'labuhan-batu-utara': () => require('../data/geo/kecamatan/labuhan-batu-utara.json'),
  'labuhan-batu': () => require('../data/geo/kecamatan/labuhan-batu.json'),
  'lahat': () => require('../data/geo/kecamatan/lahat.json'),
  'lamandau': () => require('../data/geo/kecamatan/lamandau.json'),
  'lamongan': () => require('../data/geo/kecamatan/lamongan.json'),
  'lampung-barat': () => require('../data/geo/kecamatan/lampung-barat.json'),
  'lampung-selatan': () => require('../data/geo/kecamatan/lampung-selatan.json'),
  'lampung-tengah': () => require('../data/geo/kecamatan/lampung-tengah.json'),
  'lampung-timur': () => require('../data/geo/kecamatan/lampung-timur.json'),
  'lampung-utara': () => require('../data/geo/kecamatan/lampung-utara.json'),
  'landak': () => require('../data/geo/kecamatan/landak.json'),
  'langkat': () => require('../data/geo/kecamatan/langkat.json'),
  'lanny-jaya': () => require('../data/geo/kecamatan/lanny-jaya.json'),
  'lebak': () => require('../data/geo/kecamatan/lebak.json'),
  'lebong': () => require('../data/geo/kecamatan/lebong.json'),
  'lembata': () => require('../data/geo/kecamatan/lembata.json'),
  'lima-puluh-kota': () => require('../data/geo/kecamatan/lima-puluh-kota.json'),
  'lingga': () => require('../data/geo/kecamatan/lingga.json'),
  'lombok-barat': () => require('../data/geo/kecamatan/lombok-barat.json'),
  'lombok-tengah': () => require('../data/geo/kecamatan/lombok-tengah.json'),
  'lombok-timur': () => require('../data/geo/kecamatan/lombok-timur.json'),
  'lombok-utara': () => require('../data/geo/kecamatan/lombok-utara.json'),
  'lumajang': () => require('../data/geo/kecamatan/lumajang.json'),
  'luwu-timur': () => require('../data/geo/kecamatan/luwu-timur.json'),
  'luwu-utara': () => require('../data/geo/kecamatan/luwu-utara.json'),
  'luwu': () => require('../data/geo/kecamatan/luwu.json'),
  'madiun': () => require('../data/geo/kecamatan/madiun.json'),
  'magelang': () => require('../data/geo/kecamatan/magelang.json'),
  'magetan': () => require('../data/geo/kecamatan/magetan.json'),
  'mahakam-hulu': () => require('../data/geo/kecamatan/mahakam-hulu.json'),
  'majalengka': () => require('../data/geo/kecamatan/majalengka.json'),
  'majene': () => require('../data/geo/kecamatan/majene.json'),
  'malaka': () => require('../data/geo/kecamatan/malaka.json'),
  'malang': () => require('../data/geo/kecamatan/malang.json'),
  'malinau': () => require('../data/geo/kecamatan/malinau.json'),
  'maluku-barat-daya': () => require('../data/geo/kecamatan/maluku-barat-daya.json'),
  'maluku-tengah': () => require('../data/geo/kecamatan/maluku-tengah.json'),
  'maluku-tenggara-barat': () => require('../data/geo/kecamatan/maluku-tenggara-barat.json'),
  'maluku-tenggara': () => require('../data/geo/kecamatan/maluku-tenggara.json'),
  'mamasa': () => require('../data/geo/kecamatan/mamasa.json'),
  'mamberamo-raya': () => require('../data/geo/kecamatan/mamberamo-raya.json'),
  'mamberamo-tengah': () => require('../data/geo/kecamatan/mamberamo-tengah.json'),
  'mamuju-tengah': () => require('../data/geo/kecamatan/mamuju-tengah.json'),
  'mamuju-utara': () => require('../data/geo/kecamatan/mamuju-utara.json'),
  'mamuju': () => require('../data/geo/kecamatan/mamuju.json'),
  'mandailing-natal': () => require('../data/geo/kecamatan/mandailing-natal.json'),
  'manggarai-barat': () => require('../data/geo/kecamatan/manggarai-barat.json'),
  'manggarai-timur': () => require('../data/geo/kecamatan/manggarai-timur.json'),
  'manggarai': () => require('../data/geo/kecamatan/manggarai.json'),
  'manokwari-selatan': () => require('../data/geo/kecamatan/manokwari-selatan.json'),
  'manokwari': () => require('../data/geo/kecamatan/manokwari.json'),
  'mappi': () => require('../data/geo/kecamatan/mappi.json'),
  'maros': () => require('../data/geo/kecamatan/maros.json'),
  'maybrat': () => require('../data/geo/kecamatan/maybrat.json'),
  'melawi': () => require('../data/geo/kecamatan/melawi.json'),
  'mempawah': () => require('../data/geo/kecamatan/mempawah.json'),
  'merangin': () => require('../data/geo/kecamatan/merangin.json'),
  'merauke': () => require('../data/geo/kecamatan/merauke.json'),
  'mesuji': () => require('../data/geo/kecamatan/mesuji.json'),
  'mimika': () => require('../data/geo/kecamatan/mimika.json'),
  'minahasa-selatan': () => require('../data/geo/kecamatan/minahasa-selatan.json'),
  'minahasa-tenggara': () => require('../data/geo/kecamatan/minahasa-tenggara.json'),
  'minahasa-utara': () => require('../data/geo/kecamatan/minahasa-utara.json'),
  'minahasa': () => require('../data/geo/kecamatan/minahasa.json'),
  'mojokerto': () => require('../data/geo/kecamatan/mojokerto.json'),
  'morowali-utara': () => require('../data/geo/kecamatan/morowali-utara.json'),
  'morowali': () => require('../data/geo/kecamatan/morowali.json'),
  'muara-enim': () => require('../data/geo/kecamatan/muara-enim.json'),
  'muaro-jambi': () => require('../data/geo/kecamatan/muaro-jambi.json'),
  'mukomuko': () => require('../data/geo/kecamatan/mukomuko.json'),
  'muna-barat': () => require('../data/geo/kecamatan/muna-barat.json'),
  'muna': () => require('../data/geo/kecamatan/muna.json'),
  'murung-raya': () => require('../data/geo/kecamatan/murung-raya.json'),
  'musi-banyuasin': () => require('../data/geo/kecamatan/musi-banyuasin.json'),
  'musi-rawas-utara': () => require('../data/geo/kecamatan/musi-rawas-utara.json'),
  'musi-rawas': () => require('../data/geo/kecamatan/musi-rawas.json'),
  'nabire': () => require('../data/geo/kecamatan/nabire.json'),
  'nagan-raya': () => require('../data/geo/kecamatan/nagan-raya.json'),
  'nagekeo': () => require('../data/geo/kecamatan/nagekeo.json'),
  'natuna': () => require('../data/geo/kecamatan/natuna.json'),
  'nduga': () => require('../data/geo/kecamatan/nduga.json'),
  'ngada': () => require('../data/geo/kecamatan/ngada.json'),
  'nganjuk': () => require('../data/geo/kecamatan/nganjuk.json'),
  'ngawi': () => require('../data/geo/kecamatan/ngawi.json'),
  'nias-barat': () => require('../data/geo/kecamatan/nias-barat.json'),
  'nias-selatan': () => require('../data/geo/kecamatan/nias-selatan.json'),
  'nias-utara': () => require('../data/geo/kecamatan/nias-utara.json'),
  'nias': () => require('../data/geo/kecamatan/nias.json'),
  'nunukan': () => require('../data/geo/kecamatan/nunukan.json'),
  'ogan-ilir': () => require('../data/geo/kecamatan/ogan-ilir.json'),
  'ogan-komering-ilir': () => require('../data/geo/kecamatan/ogan-komering-ilir.json'),
  'ogan-komering-ulu-selatan': () => require('../data/geo/kecamatan/ogan-komering-ulu-selatan.json'),
  'ogan-komering-ulu-timur': () => require('../data/geo/kecamatan/ogan-komering-ulu-timur.json'),
  'ogan-komering-ulu': () => require('../data/geo/kecamatan/ogan-komering-ulu.json'),
  'pacitan': () => require('../data/geo/kecamatan/pacitan.json'),
  'padang-lawas-utara': () => require('../data/geo/kecamatan/padang-lawas-utara.json'),
  'padang-lawas': () => require('../data/geo/kecamatan/padang-lawas.json'),
  'padang-pariaman': () => require('../data/geo/kecamatan/padang-pariaman.json'),
  'pakpak-bharat': () => require('../data/geo/kecamatan/pakpak-bharat.json'),
  'pamekasan': () => require('../data/geo/kecamatan/pamekasan.json'),
  'pandeglang': () => require('../data/geo/kecamatan/pandeglang.json'),
  'pangandaran': () => require('../data/geo/kecamatan/pangandaran.json'),
  'pangkajene-dan-kepulauan': () => require('../data/geo/kecamatan/pangkajene-dan-kepulauan.json'),
  'paniai': () => require('../data/geo/kecamatan/paniai.json'),
  'parigi-moutong': () => require('../data/geo/kecamatan/parigi-moutong.json'),
  'pasaman-barat': () => require('../data/geo/kecamatan/pasaman-barat.json'),
  'pasaman': () => require('../data/geo/kecamatan/pasaman.json'),
  'paser': () => require('../data/geo/kecamatan/paser.json'),
  'pasuruan': () => require('../data/geo/kecamatan/pasuruan.json'),
  'pati': () => require('../data/geo/kecamatan/pati.json'),
  'pegunungan-arfak': () => require('../data/geo/kecamatan/pegunungan-arfak.json'),
  'pegunungan-bintang': () => require('../data/geo/kecamatan/pegunungan-bintang.json'),
  'pekalongan': () => require('../data/geo/kecamatan/pekalongan.json'),
  'pelalawan': () => require('../data/geo/kecamatan/pelalawan.json'),
  'pemalang': () => require('../data/geo/kecamatan/pemalang.json'),
  'penajam-paser-utara': () => require('../data/geo/kecamatan/penajam-paser-utara.json'),
  'penukal-abab-lematang-ilir': () => require('../data/geo/kecamatan/penukal-abab-lematang-ilir.json'),
  'pesawaran': () => require('../data/geo/kecamatan/pesawaran.json'),
  'pesisir-barat': () => require('../data/geo/kecamatan/pesisir-barat.json'),
  'pesisir-selatan': () => require('../data/geo/kecamatan/pesisir-selatan.json'),
  'pidie-jaya': () => require('../data/geo/kecamatan/pidie-jaya.json'),
  'pidie': () => require('../data/geo/kecamatan/pidie.json'),
  'pinrang': () => require('../data/geo/kecamatan/pinrang.json'),
  'pohuwato': () => require('../data/geo/kecamatan/pohuwato.json'),
  'polewali-mandar': () => require('../data/geo/kecamatan/polewali-mandar.json'),
  'ponorogo': () => require('../data/geo/kecamatan/ponorogo.json'),
  'poso': () => require('../data/geo/kecamatan/poso.json'),
  'pringsewu': () => require('../data/geo/kecamatan/pringsewu.json'),
  'probolinggo': () => require('../data/geo/kecamatan/probolinggo.json'),
  'pulang-pisau': () => require('../data/geo/kecamatan/pulang-pisau.json'),
  'pulau-morotai': () => require('../data/geo/kecamatan/pulau-morotai.json'),
  'pulau-taliabu': () => require('../data/geo/kecamatan/pulau-taliabu.json'),
  'puncak-jaya': () => require('../data/geo/kecamatan/puncak-jaya.json'),
  'puncak': () => require('../data/geo/kecamatan/puncak.json'),
  'purbalingga': () => require('../data/geo/kecamatan/purbalingga.json'),
  'purwakarta': () => require('../data/geo/kecamatan/purwakarta.json'),
  'purworejo': () => require('../data/geo/kecamatan/purworejo.json'),
  'raja-ampat': () => require('../data/geo/kecamatan/raja-ampat.json'),
  'rejang-lebong': () => require('../data/geo/kecamatan/rejang-lebong.json'),
  'rembang': () => require('../data/geo/kecamatan/rembang.json'),
  'rokan-hilir': () => require('../data/geo/kecamatan/rokan-hilir.json'),
  'rokan-hulu': () => require('../data/geo/kecamatan/rokan-hulu.json'),
  'rote-ndao': () => require('../data/geo/kecamatan/rote-ndao.json'),
  'sabu-raijua': () => require('../data/geo/kecamatan/sabu-raijua.json'),
  'sambas': () => require('../data/geo/kecamatan/sambas.json'),
  'samosir': () => require('../data/geo/kecamatan/samosir.json'),
  'sampang': () => require('../data/geo/kecamatan/sampang.json'),
  'sanggau': () => require('../data/geo/kecamatan/sanggau.json'),
  'sarmi': () => require('../data/geo/kecamatan/sarmi.json'),
  'sarolangun': () => require('../data/geo/kecamatan/sarolangun.json'),
  'sekadau': () => require('../data/geo/kecamatan/sekadau.json'),
  'seluma': () => require('../data/geo/kecamatan/seluma.json'),
  'semarang': () => require('../data/geo/kecamatan/semarang.json'),
  'seram-bagian-barat': () => require('../data/geo/kecamatan/seram-bagian-barat.json'),
  'seram-bagian-timur': () => require('../data/geo/kecamatan/seram-bagian-timur.json'),
  'serang': () => require('../data/geo/kecamatan/serang.json'),
  'serdang-bedagai': () => require('../data/geo/kecamatan/serdang-bedagai.json'),
  'seruyan': () => require('../data/geo/kecamatan/seruyan.json'),
  'siak': () => require('../data/geo/kecamatan/siak.json'),
  'siau-tagulandang-biaro': () => require('../data/geo/kecamatan/siau-tagulandang-biaro.json'),
  'sidenreng-rappang': () => require('../data/geo/kecamatan/sidenreng-rappang.json'),
  'sidoarjo': () => require('../data/geo/kecamatan/sidoarjo.json'),
  'sigi': () => require('../data/geo/kecamatan/sigi.json'),
  'sijunjung': () => require('../data/geo/kecamatan/sijunjung.json'),
  'sikka': () => require('../data/geo/kecamatan/sikka.json'),
  'simalungun': () => require('../data/geo/kecamatan/simalungun.json'),
  'simeulue': () => require('../data/geo/kecamatan/simeulue.json'),
  'sinjai': () => require('../data/geo/kecamatan/sinjai.json'),
  'sintang': () => require('../data/geo/kecamatan/sintang.json'),
  'situbondo': () => require('../data/geo/kecamatan/situbondo.json'),
  'sleman': () => require('../data/geo/kecamatan/sleman.json'),
  'solok-selatan': () => require('../data/geo/kecamatan/solok-selatan.json'),
  'solok': () => require('../data/geo/kecamatan/solok.json'),
  'soppeng': () => require('../data/geo/kecamatan/soppeng.json'),
  'sorong-selatan': () => require('../data/geo/kecamatan/sorong-selatan.json'),
  'sorong': () => require('../data/geo/kecamatan/sorong.json'),
  'sragen': () => require('../data/geo/kecamatan/sragen.json'),
  'subang': () => require('../data/geo/kecamatan/subang.json'),
  'sukabumi': () => require('../data/geo/kecamatan/sukabumi.json'),
  'sukamara': () => require('../data/geo/kecamatan/sukamara.json'),
  'sukoharjo': () => require('../data/geo/kecamatan/sukoharjo.json'),
  'sumba-barat-daya': () => require('../data/geo/kecamatan/sumba-barat-daya.json'),
  'sumba-barat': () => require('../data/geo/kecamatan/sumba-barat.json'),
  'sumba-tengah': () => require('../data/geo/kecamatan/sumba-tengah.json'),
  'sumba-timur': () => require('../data/geo/kecamatan/sumba-timur.json'),
  'sumbawa-barat': () => require('../data/geo/kecamatan/sumbawa-barat.json'),
  'sumbawa': () => require('../data/geo/kecamatan/sumbawa.json'),
  'sumedang': () => require('../data/geo/kecamatan/sumedang.json'),
  'sumenep': () => require('../data/geo/kecamatan/sumenep.json'),
  'supiori': () => require('../data/geo/kecamatan/supiori.json'),
  'tabalong': () => require('../data/geo/kecamatan/tabalong.json'),
  'tabanan': () => require('../data/geo/kecamatan/tabanan.json'),
  'takalar': () => require('../data/geo/kecamatan/takalar.json'),
  'tambrauw': () => require('../data/geo/kecamatan/tambrauw.json'),
  'tana-tidung': () => require('../data/geo/kecamatan/tana-tidung.json'),
  'tana-toraja': () => require('../data/geo/kecamatan/tana-toraja.json'),
  'tanah-bumbu': () => require('../data/geo/kecamatan/tanah-bumbu.json'),
  'tanah-datar': () => require('../data/geo/kecamatan/tanah-datar.json'),
  'tanah-laut': () => require('../data/geo/kecamatan/tanah-laut.json'),
  'tangerang': () => require('../data/geo/kecamatan/tangerang.json'),
  'tanggamus': () => require('../data/geo/kecamatan/tanggamus.json'),
  'tanjung-jabung-barat': () => require('../data/geo/kecamatan/tanjung-jabung-barat.json'),
  'tanjung-jabung-timur': () => require('../data/geo/kecamatan/tanjung-jabung-timur.json'),
  'tapanuli-selatan': () => require('../data/geo/kecamatan/tapanuli-selatan.json'),
  'tapanuli-tengah': () => require('../data/geo/kecamatan/tapanuli-tengah.json'),
  'tapanuli-utara': () => require('../data/geo/kecamatan/tapanuli-utara.json'),
  'tapin': () => require('../data/geo/kecamatan/tapin.json'),
  'tasikmalaya': () => require('../data/geo/kecamatan/tasikmalaya.json'),
  'tebo': () => require('../data/geo/kecamatan/tebo.json'),
  'tegal': () => require('../data/geo/kecamatan/tegal.json'),
  'teluk-bintuni': () => require('../data/geo/kecamatan/teluk-bintuni.json'),
  'teluk-wondama': () => require('../data/geo/kecamatan/teluk-wondama.json'),
  'temanggung': () => require('../data/geo/kecamatan/temanggung.json'),
  'timor-tengah-selatan': () => require('../data/geo/kecamatan/timor-tengah-selatan.json'),
  'timor-tengah-utara': () => require('../data/geo/kecamatan/timor-tengah-utara.json'),
  'toba-samosir': () => require('../data/geo/kecamatan/toba-samosir.json'),
  'tojo-una-una': () => require('../data/geo/kecamatan/tojo-una-una.json'),
  'toli-toli': () => require('../data/geo/kecamatan/toli-toli.json'),
  'tolikara': () => require('../data/geo/kecamatan/tolikara.json'),
  'toraja-utara': () => require('../data/geo/kecamatan/toraja-utara.json'),
  'trenggalek': () => require('../data/geo/kecamatan/trenggalek.json'),
  'tuban': () => require('../data/geo/kecamatan/tuban.json'),
  'tulang-bawang-barat': () => require('../data/geo/kecamatan/tulang-bawang-barat.json'),
  'tulangbawang': () => require('../data/geo/kecamatan/tulangbawang.json'),
  'tulungagung': () => require('../data/geo/kecamatan/tulungagung.json'),
  'waduk-cirata': () => require('../data/geo/kecamatan/waduk-cirata.json'),
  'wadung-kedungombo': () => require('../data/geo/kecamatan/wadung-kedungombo.json'),
  'wajo': () => require('../data/geo/kecamatan/wajo.json'),
  'wakatobi': () => require('../data/geo/kecamatan/wakatobi.json'),
  'waropen': () => require('../data/geo/kecamatan/waropen.json'),
  'way-kanan': () => require('../data/geo/kecamatan/way-kanan.json'),
  'wonogiri': () => require('../data/geo/kecamatan/wonogiri.json'),
  'wonosobo': () => require('../data/geo/kecamatan/wonosobo.json'),
  'yahukimo': () => require('../data/geo/kecamatan/yahukimo.json'),
  'yalimo': () => require('../data/geo/kecamatan/yalimo.json'),
};

export function getProvinceKabupatenGeoJson(provinceName: string): any | null {
  if (!provinceName) return null;
  const targetSlug = normalizeProvinceSlug(provinceName);
  
  if (provinceCache.has(targetSlug)) {
    return provinceCache.get(targetSlug);
  }

  const loader = PROVINCE_LOADERS[targetSlug];
  if (loader) {
    try {
      const data = loader();
      const resolved = data && data.default ? data.default : data;
      provinceCache.set(targetSlug, resolved);
      return resolved;
    } catch (err) {
      console.warn('[GeoRegistry] Failed to load province geojson for:', provinceName, err);
    }
  }

  // Fallback fuzzy search
  for (const [key, loadFn] of Object.entries(PROVINCE_LOADERS)) {
    if (key.includes(targetSlug) || targetSlug.includes(key)) {
      try {
        const data = loadFn();
        const resolved = data && data.default ? data.default : data;
        provinceCache.set(targetSlug, resolved);
        return resolved;
      } catch {}
    }
  }

  return null;
}

export function getKabupatenKecamatanGeoJson(kabupatenName: string): any | null {
  if (!kabupatenName) return null;
  const clean = slugify(kabupatenName);
  const full = kabupatenName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '');
  const withKota = `kota-${clean}`;
  const withKab = `kabupaten-${clean}`;
  const withKabShort = `kab-${clean}`;

  const candidates = Array.from(new Set([full, clean, withKota, withKab, withKabShort]));

  for (const s of candidates) {
    if (regencyCache.has(s)) {
      return regencyCache.get(s);
    }
    const loader = KABUPATEN_LOADERS[s];
    if (loader) {
      try {
        const data = loader();
        const resolved = data && data.default ? data.default : data;
        regencyCache.set(s, resolved);
        regencyCache.set(clean, resolved);
        return resolved;
      } catch (err) {
        console.warn('[GeoRegistry] Failed to load kabupaten geojson for:', kabupatenName, err);
      }
    }
  }

  // Fallback fuzzy search
  for (const [key, loadFn] of Object.entries(KABUPATEN_LOADERS)) {
    if (key.replace(/^(kota|kabupaten|kab)-/, '') === clean || key.includes(clean)) {
      try {
        const data = loadFn();
        const resolved = data && data.default ? data.default : data;
        regencyCache.set(clean, resolved);
        return resolved;
      } catch {}
    }
  }

  return null;
}

export function getAvailableProvinceSlugs(): string[] {
  return Object.keys(PROVINCE_LOADERS);
}

export function getAvailableKabupatenSlugs(): string[] {
  return Object.keys(KABUPATEN_LOADERS);
}

export function getFeatureCentroid(feature: any): { lat: number; lng: number } {
  if (!feature || !feature.geometry) return { lat: -2.5, lng: 118.0 };
  const geom = feature.geometry;
  let coords: [number, number][] = [];
  if (geom.type === 'Polygon' && geom.coordinates && geom.coordinates[0]) {
    coords = geom.coordinates[0];
  } else if (geom.type === 'MultiPolygon' && geom.coordinates) {
    coords = geom.coordinates.map((p: any) => p[0]).flat();
  }
  if (!coords || coords.length === 0) return { lat: -2.5, lng: 118.0 };
  let sumLat = 0, sumLng = 0;
  for (const c of coords) {
    sumLng += c[0];
    sumLat += c[1];
  }
  return {
    lat: Math.round((sumLat / coords.length) * 10000) / 10000,
    lng: Math.round((sumLng / coords.length) * 10000) / 10000,
  };
}
