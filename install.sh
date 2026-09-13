#!/bin/bash

set -e

PTERODACTYL="/var/www/pterodactyl"
THEME_DIR="$(cd "$(dirname "$0")" && pwd)"
THEME="$THEME_DIR/theme"

echo ""
echo "=========================================="
echo "       CloudVinn Pterodactyl Theme"
echo "=========================================="
echo ""

if [ "$EUID" -ne 0 ]; then
    echo "[ERROR] Jalankan installer sebagai root."
    exit 1
fi

if [ ! -d "$PTERODACTYL" ]; then
    echo "[ERROR] Pterodactyl tidak ditemukan:"
    echo "$PTERODACTYL"
    exit 1
fi

if [ ! -d "$THEME" ]; then
    echo "[ERROR] Folder theme tidak ditemukan."
    exit 1
fi

echo "[1/5] Membuat backup instalasi saat ini..."

BACKUP="/root/CloudVinn-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP"

FILES=(
    "resources/scripts/components/server/ServerSidebar.tsx"
    "resources/scripts/components/server/console/Console.tsx"
    "resources/scripts/components/server/console/ServerConsoleContainer.tsx"
    "resources/scripts/components/server/databases/DatabaseRow.tsx"
    "resources/scripts/routers/ServerRouter.tsx"
    "public/assets/images/cloudvinn-console-bg.png"
)

for FILE in "${FILES[@]}"; do
    if [ -f "$PTERODACTYL/$FILE" ]; then
        mkdir -p "$BACKUP/$(dirname "$FILE")"
        cp -a "$PTERODACTYL/$FILE" "$BACKUP/$FILE"
    fi
done

echo "[OK] Backup dibuat:"
echo "$BACKUP"

echo ""
echo "[2/5] Memasang CloudVinn Theme..."

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

echo "[OK] File theme berhasil dipasang."

echo ""
echo "[3/5] Memeriksa dependency..."

cd "$PTERODACTYL"

if [ ! -d "node_modules" ]; then
    echo "[INFO] node_modules tidak ditemukan."
    echo "[INFO] Menjalankan npm install..."
    npm install
fi

echo "[OK] Dependency siap."

echo ""
echo "[4/5] Build frontend Pterodactyl..."

npm run build:production

echo ""
echo "[5/5] Membersihkan cache Laravel..."

php artisan view:clear
php artisan config:clear
php artisan cache:clear

echo ""
echo "=========================================="
echo "       INSTALLATION COMPLETE"
echo "=========================================="
echo ""
echo "CloudVinn Theme berhasil dipasang."
echo ""
echo "Database/customer TIDAK disentuh."
echo ".env TIDAK diubah."
echo ""
echo "Backup:"
echo "$BACKUP"
echo ""
