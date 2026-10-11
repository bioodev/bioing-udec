#!/usr/bin/env bash
# Levanta el sitio Astro en modo dev (recarga en caliente) y lo expone con un
# túnel rápido de cloudflared, para revisarlo desde el celular o compartir la URL.
# Uso (desde app/web): npm run dev:tunel
# Ojo: la URL es pública mientras el script corre; no usar con datos reales.

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

PORT=4321
LOG_DIR="$(mktemp -d)"
DEV_LOG="$LOG_DIR/astro-dev.log"
CF_LOG="$LOG_DIR/cloudflared.log"

command -v cloudflared >/dev/null || { echo "Falta cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"; exit 1; }

cleanup() {
  echo ""
  echo "Deteniendo procesos..."
  [[ -n "${CF_PID:-}" ]] && kill "$CF_PID" 2>/dev/null || true
  [[ -n "${DEV_PID:-}" ]] && kill "$DEV_PID" 2>/dev/null || true
  wait 2>/dev/null || true
  echo "Listo."
}
trap cleanup EXIT INT TERM

# Un servidor dev en segundo plano (astro dev --background) ocuparía el puerto.
npx astro dev stop >/dev/null 2>&1 || true
if lsof -ti:"$PORT" >/dev/null 2>&1; then
  echo "El puerto $PORT sigue ocupado (proceso $(lsof -ti:"$PORT" | tr '\n' ' ')). Detenlo y vuelve a intentar."
  exit 1
fi

echo "Iniciando Astro dev en el puerto $PORT..."
# .trycloudflare.com: el servidor dev rechaza hosts desconocidos (protección de Vite).
npx astro dev --port "$PORT" --allowed-hosts .trycloudflare.com > "$DEV_LOG" 2>&1 &
DEV_PID=$!

for _ in $(seq 1 60); do
  curl -sf -o /dev/null "http://localhost:$PORT/" && break
  sleep 1
done
curl -sf -o /dev/null "http://localhost:$PORT/" || { echo "Astro no arrancó a tiempo. Log: $DEV_LOG"; exit 1; }

echo "Iniciando túnel cloudflared..."
cloudflared tunnel --url "http://localhost:$PORT" > "$CF_LOG" 2>&1 &
CF_PID=$!

TUNEL=""
for _ in $(seq 1 45); do
  TUNEL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$CF_LOG" | head -1 || true)"
  [[ -n "$TUNEL" ]] && break
  sleep 1
done
[[ -n "$TUNEL" ]] || { echo "No se obtuvo la URL del túnel. Log: $CF_LOG"; exit 1; }

echo ""
echo "================================================"
echo " Sitio disponible en:"
echo "   Local:  http://localhost:$PORT"
echo "   Túnel:  $TUNEL"
echo "   Panel:  $TUNEL/admin/index.html"
echo "================================================"
echo "Logs: $LOG_DIR"
echo "Ctrl+C para detener ambos procesos."
echo ""

wait
