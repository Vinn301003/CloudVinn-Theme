#!/bin/bash

set -e

PTERODACTYL="/var/www/pterodactyl"
THEME_DIR="$(cd "$(dirname "$0")" && pwd)"
ORIGINAL="$THEME_DIR/backup-original"

echo ""
echo "=========================================="
echo "     CloudVinn Theme Uninstaller"
echo "=========================================="
echo ""

if [ "$EUID" -ne 0 ]; then
    echo "[ERROR] Jalankan sebagai root."
    exit 1
fi

if [ ! -d "$PTERODACTYL" ]; then
    echo "[ERROR] Pterodactyl tidak ditemukan."
    exit 1
fi

if [ ! -d "$ORIGINAL" ]; then
    echo "[ERROR] backup-original tidak ditemukan."
    exit 1
fi

echo "[1/4] Mengembalikan file original..."

cp -f "$ORIGINAL/resources/scripts/components/server/console/Console.tsx" \
   "$PTERODACTYL/resources/scripts/components/server/console/Console.tsx"

cp -f "$ORIGINAL/resources/scripts/components/server/console/ServerConsoleContainer.tsx" \
   "$PTERODACTYL/resources/scripts/components/server/console/ServerConsoleContainer.tsx"

cp -f "$ORIGINAL/resources/scripts/routers/ServerRouter.tsx" \
   "$PTERODACTYL/resources/scripts/routers/ServerRouter.tsx"

echo "[OK] File original dikembalikan."

echo ""
echo "[2/4] Menghapus file CloudVinn tambahan..."

rm -f "$PTERODACTYL/resources/scripts/components/server/ServerSidebar.tsx"

rm -f "$PTERODACTYL/resources/scripts/components/server/databases/DatabaseRow.tsx"

rm -f "$PTERODACTYL/public/assets/images/cloudvinn-console-bg.png"

echo "[OK] File tambahan CloudVinn dihapus."

echo ""
echo "[3/4] Build frontend..."

cd "$PTERODACTYL"

npm run build:production

echo ""
echo "[4/4] Membersihkan cache..."

php artisan view:clear
php artisan config:clear
php artisan cache:clear

echo ""
echo "=========================================="
echo "     UNINSTALLATION COMPLETE"
echo "=========================================="
echo ""
echo "CloudVinn Theme telah dihapus."
echo "Database/customer tidak disentuh."
echo ""
