#!/usr/bin/env bash
set -e

echo "=== 🚀 Memulai Build APK Saksi 360 ==="

# 1. Pastikan ANDROID_HOME terkonfigurasi
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin"

if [ ! -d "$ANDROID_HOME" ]; then
  echo "❌ Error: Android SDK tidak ditemukan di $ANDROID_HOME"
  exit 1
fi

# 2. Re-generate aset native Android (Ikon, nama paket, dll.)
echo "📦 Meng-generate proyek native Android..."
npx expo prebuild --platform android

# 3. Jalankan Gradle assembleRelease
echo "⚡ Kompilasi biner APK dengan Gradle..."
cd android
./gradlew assembleRelease
cd ..

# 4. Salin APK ke root proyek
RELEASE_DIR="android/app/build/outputs/apk/release"
FOUND=0

if [ -f "$RELEASE_DIR/app-arm64-v8a-release.apk" ]; then
  cp "$RELEASE_DIR/app-arm64-v8a-release.apk" "360-saksi-arm64.apk"
  cp "$RELEASE_DIR/app-arm64-v8a-release.apk" "360-saksi.apk"
  echo "📱 APK arm64 (Utama, ~33MB): $(pwd)/360-saksi-arm64.apk (juga sebagai 360-saksi.apk)"
  FOUND=1
fi

if [ -f "$RELEASE_DIR/app-universal-release.apk" ]; then
  cp "$RELEASE_DIR/app-universal-release.apk" "360-saksi-universal.apk"
  echo "📱 APK Universal (~84MB): $(pwd)/360-saksi-universal.apk"
  FOUND=1
fi

if [ -f "$RELEASE_DIR/app-armeabi-v7a-release.apk" ]; then
  cp "$RELEASE_DIR/app-armeabi-v7a-release.apk" "360-saksi-armv7.apk"
  echo "📱 APK armv7 (32-bit): $(pwd)/360-saksi-armv7.apk"
  FOUND=1
fi

if [ -f "$RELEASE_DIR/app-release.apk" ]; then
  cp "$RELEASE_DIR/app-release.apk" "360-saksi.apk"
  echo "📱 APK Release: $(pwd)/360-saksi.apk"
  FOUND=1
fi

if [ "$FOUND" -eq 1 ]; then
  echo "✅ BUILD BERHASIL!"
else
  echo "❌ Error: File APK tidak ditemukan di $RELEASE_DIR"
  exit 1
fi
