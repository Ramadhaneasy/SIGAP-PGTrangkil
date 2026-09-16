#!/bin/sh
set -e

echo "=================================================="
echo "🚀 SIGAP — PT Kebon Agung Pabrik Gula Trangkil"
echo "📦 Memulai Server Aplikasi SIGAP (Next.js Standalone)"
echo "🌐 Port: ${PORT:-3000} | Host: ${HOSTNAME:-0.0.0.0}"
echo "=================================================="

exec "$@"
