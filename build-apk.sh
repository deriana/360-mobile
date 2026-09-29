#!/usr/bin/env bash
set -e

# ./build-apk.sh [release|debug]   (default: release)
BUILD_TYPE="${1:-release}"

if [[ "$BUILD_TYPE" != "release" && "$BUILD_TYPE" != "debug" ]]; then
  echo "❌ Penggunaan: ./build-apk.sh [release|debug]"
  exit 1
fi

echo "=== 🚀 Memulai Build APK Saksi 360 ($BUILD_TYPE) ==="

# 1. Pastikan ANDROID_HOME terkonfigurasi
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin"

if [ ! -d "$ANDROID_HOME" ]; then
  echo "❌ Error: Android SDK tidak ditemukan di $ANDROID_HOME"
  exit 1
fi

# 2. Pastikan paket expo-splash-screen (icon = splash) sudah terpasang versi
#    yang cocok dengan SDK proyek ini — idempotent, tidak apa-apa dipanggil
#    berulang kali.
echo "📦 Memastikan expo-splash-screen terpasang (icon & splash pakai aset yang sama)..."
npx expo install expo-splash-screen

# 3. Bersihkan & re-generate proyek native Android dari nol (expo prebuild
#    --clean menghapus folder android/ lama dulu sebelum membuatnya ulang),
#    supaya ikon, nama paket, dan splash screen selalu tersinkron persis
#    dengan app.json — tidak ada sisa build/asset lama yang nyangkut.
echo "🧹 Membersihkan & meng-generate ulang folder android/ (expo prebuild --clean)..."
npx expo prebuild --platform android --clean

# 4. Jalankan Gradle assemble<Release|Debug>
if [ "$BUILD_TYPE" = "release" ]; then
  GRADLE_TASK="assembleRelease"
else
  GRADLE_TASK="assembleDebug"
fi

echo "⚡ Kompilasi biner APK ($BUILD_TYPE) dengan Gradle ($GRADLE_TASK)..."
cd android
./gradlew "$GRADLE_TASK"
cd ..

# 5. Salin APK ke root proyek
OUT_DIR="android/app/build/outputs/apk/$BUILD_TYPE"
SUFFIX="$BUILD_TYPE"
FOUND=0

# Build dengan pemisahan APK per-arsitektur (ABI split) — nama file umumnya
# app-<abi>-<buildType>.apk. Untuk release, nama output tetap mempertahankan
# alias lama (360-saksi.apk, 360-saksi-arm64.apk, dst.) demi kompatibilitas
# skrip/dokumentasi yang sudah ada.
declare -A ARCH_LABEL=(
  ["arm64-v8a"]="arm64"
  ["armeabi-v7a"]="armv7"
  ["x86_64"]="x86_64"
  ["x86"]="x86"
  ["universal"]="universal"
)

for ABI in arm64-v8a armeabi-v7a x86_64 x86 universal; do
  SRC="$OUT_DIR/app-$ABI-$SUFFIX.apk"
  if [ -f "$SRC" ]; then
    LABEL="${ARCH_LABEL[$ABI]}"
    if [ "$BUILD_TYPE" = "release" ]; then
      DEST="360-saksi-$LABEL.apk"
    else
      DEST="360-saksi-$LABEL-debug.apk"
    fi
    cp "$SRC" "$DEST"
    echo "📱 APK $LABEL ($BUILD_TYPE): $(pwd)/$DEST"
    FOUND=1

    # arm64 dipakai paling banyak (HP modern) — sediakan juga alias pendek
    if [ "$ABI" = "arm64-v8a" ]; then
      if [ "$BUILD_TYPE" = "release" ]; then
        cp "$SRC" "360-saksi.apk"
      else
        cp "$SRC" "360-saksi-debug.apk"
      fi
    fi
  fi
done

# Fallback: build tanpa ABI split (satu APK gabungan)
SRC_SINGLE="$OUT_DIR/app-$SUFFIX.apk"
if [ -f "$SRC_SINGLE" ]; then
  if [ "$BUILD_TYPE" = "release" ]; then
    DEST="360-saksi.apk"
  else
    DEST="360-saksi-debug.apk"
  fi
  cp "$SRC_SINGLE" "$DEST"
  echo "📱 APK ($BUILD_TYPE): $(pwd)/$DEST"
  FOUND=1
fi

if [ "$FOUND" -eq 1 ]; then
  echo "✅ BUILD BERHASIL! ($BUILD_TYPE)"
else
  echo "❌ Error: File APK tidak ditemukan di $OUT_DIR"
  exit 1
fi
