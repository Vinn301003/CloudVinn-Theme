#!/bin/bash

set -e

PTERODACTYL="/var/www/pterodactyl"
THEME_DIR="$(cd "$(dirname "$0")" && pwd)"
THEME="$THEME_DIR/theme"

echo ""
echo "=========================================="
echo "       CloudVinn Theme Updater"
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

if [ ! -d "$THEME" ]; then
    echo "[ERROR] Folder theme tidak ditemukan."
    exit 1
fi

echo "[1/4] Membuat backup sebelum update..."

BACKUP="/root/CloudVinn-update-backup-$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP"

cp "$PTERODACTYL/resources/scripts/components/server/ServerSidebar.tsx" \
   "$BACKUP/" 2>/dev/null || true

cp "$PTERODACTYL/resources/scripts/components/server/console/Console.tsx" \
   "$BACKUP/" 2>/dev/null || true

cp "$PTERODACTYL/resources/scripts/components/server/console/ServerConsoleContainer.tsx" \
   "$BACKUP/" 2>/dev/null || true

cp "$PTERODACTYL/resources/scripts/components/server/databases/DatabaseRow.tsx" \
   "$BACKUP/" 2>/dev/null || true

cp "$PTERODACTYL/resources/scripts/routers/ServerRouter.tsx" \
   "$BACKUP/" 2>/dev/null || true

echo "[OK] Backup:"
echo "$BACKUP"

echo ""
echo "[2/4] Mengupdate CloudVinn Theme..."

cp -f "$THEME/resources/scripts/components/server/ServerSidebar.tsx" \
   "$PTERODACTYL/resources/scripts/components/server/"

cp -f "$THEME/resources/scripts/components/server/console/Console.tsx" \
   "$PTERODACTYL/resources/scripts/components/server/console/"

cp -f "$THEME/resources/scripts/components/server/console/ServerConsoleContainer.tsx" \
   "$PTERODACTYL/resources/scripts/components/server/console/"

cp -f "$THEME/resources/scripts/components/server/databases/DatabaseRow.tsx" \
   "$PTERODACTYL/resources/scripts/components/server/databases/"

cp -f "$THEME/resources/scripts/routers/ServerRouter.tsx" \
   "$PTERODACTYL/resources/scripts/routers/"

mkdir -p "$PTERODACTYL/public/assets/images"

cp -f "$THEME/public/assets/images/cloudvinn-console-bg.png" \
   "$PTERODACTYL/public/assets/images/"

chmod 644 "$PTERODACTYL/public/assets/images/cloudvinn-console-bg.png"

echo "[OK] Theme diperbarui."

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
echo "          UPDATE COMPLETE"
echo "=========================================="
echo ""
echo "CloudVinn Theme berhasil diperbarui."
echo "Database/customer tidak disentuh."
echo ""
