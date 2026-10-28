#!/usr/bin/env bash
set -euo pipefail

TEMPLATE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOOT_PARTITION="${1:-/Volumes/bootfs}"
OPENSSL_CANDIDATES=(openssl /opt/homebrew/opt/openssl/bin/openssl /usr/local/opt/openssl/bin/openssl)

fail() {
  echo "Fehler: $*" >&2
  exit 1
}

ensure_boot_partition() {
  [[ -f "$BOOT_PARTITION/config.txt" ]] || fail "Keine Raspberry-Pi-Boot-Partition unter $BOOT_PARTITION gefunden."
  [[ -f "$BOOT_PARTITION/meta-data" ]] || fail "Auf $BOOT_PARTITION fehlt meta-data. Bitte Raspberry Pi OS ab November 2025 flashen."
}

find_sha512_openssl() {
  local candidate
  for candidate in "${OPENSSL_CANDIDATES[@]}"; do
    if printf 'probe' | "$candidate" passwd -6 -stdin >/dev/null 2>&1; then
      echo "$candidate"
      return
    fi
  done
  fail "Kein OpenSSL mit SHA-512 gefunden. Bitte mit 'brew install openssl' installieren."
}

read_secret() {
  local value
  read -rsp "$1" value
  echo >&2
  printf '%s' "$value"
}

read_user_password() {
  local password confirmation
  password="$(read_secret 'Passwort für den Benutzer handball: ')"
  [[ -n "$password" ]] || fail "Das Passwort darf nicht leer sein."
  confirmation="$(read_secret 'Passwort wiederholen: ')"
  [[ "$password" == "$confirmation" ]] || fail "Die Passwörter stimmen nicht überein."
  printf '%s' "$password"
}

render_template() {
  python3 -I - "$1" "$2" <<'PYTHON'
import json
import os
import sys

template_path, target_path = sys.argv[1], sys.argv[2]
with open(template_path, encoding='utf-8') as template:
    text = template.read()

wifi_section = '  wifis:\n'
if not os.environ['WIFI_SSID'] and wifi_section in text:
    text = text[: text.index(wifi_section)]

replacements = {
    '__PASSWORD_HASH__': json.dumps(os.environ['PASSWORD_HASH']),
    '__WIFI_SSID__': json.dumps(os.environ['WIFI_SSID']),
    '__WIFI_PASSWORD__': json.dumps(os.environ['WIFI_PASSWORD']),
}
for placeholder, value in replacements.items():
    text = text.replace(placeholder, value)

with open(target_path, 'w', encoding='utf-8') as target:
    target.write(text)
PYTHON
}

main() {
  ensure_boot_partition
  local openssl_binary password
  openssl_binary="$(find_sha512_openssl)"

  read -rp "WLAN-Name (leer lassen für LAN-Kabel): " WIFI_SSID
  WIFI_PASSWORD=""
  if [[ -n "$WIFI_SSID" ]]; then
    WIFI_PASSWORD="$(read_secret 'WLAN-Passwort: ')"
    [[ -n "$WIFI_PASSWORD" ]] || fail "WLANs ohne Passwort werden nicht unterstützt."
  fi

  password="$(read_user_password)"
  PASSWORD_HASH="$(printf '%s' "$password" | "$openssl_binary" passwd -6 -stdin)"

  export WIFI_SSID WIFI_PASSWORD PASSWORD_HASH
  render_template "$TEMPLATE_DIR/user-data" "$BOOT_PARTITION/user-data"
  render_template "$TEMPLATE_DIR/network-config" "$BOOT_PARTITION/network-config"
  sync

  echo
  echo "SD-Karte unter $BOOT_PARTITION ist vorbereitet."
  if [[ -n "$WIFI_SSID" ]]; then
    echo "Netzwerk: WLAN \"$WIFI_SSID\" und LAN-Kabel"
  else
    echo "Netzwerk: nur LAN-Kabel"
  fi
  echo "Karte jetzt auswerfen und in den Raspberry Pi stecken."
}

main
