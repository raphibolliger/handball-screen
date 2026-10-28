# Raspberry Pi für den Hallen-Screen

Dieser Ordner richtet einen Raspberry Pi so ein, dass er nach dem Einschalten direkt den Handball-Screen im Vollbild zeigt. Die Einrichtung passiert vollständig beim ersten Start über [cloud-init](https://www.raspberrypi.com/news/cloud-init-on-raspberry-pi-os/). Am Raspberry Pi selbst muss nichts eingegeben werden.

## Wie der Screen funktioniert

- Der Raspberry Pi öffnet die Screen-Seite auf Azure (`https://thankful-forest-081355703.5.azurestaticapps.net/`) in Chromium im Kiosk-Modus.
- Beim ersten Laden speichert die App sich selbst und alle Bilder auf dem Raspberry Pi. Danach läuft der Screen ohne Internet.
- Jede Änderung auf `main` wird automatisch auf Azure veröffentlicht.
- Alle 10 Minuten fragt der Screen auf Azure nach, ob es eine neue Version gibt, immer direkt beim Server und nie aus dem Cache. Ohne Internet passiert dabei nichts.
- Gibt es eine neue Version, lädt der Screen zuerst alle geänderten Dateien herunter und lädt sich erst dann neu. Bricht die Verbindung vorher ab, läuft die bisherige Version einfach weiter.
- Auf dem Raspberry Pi gibt es kein git, kein Node und keinen Build mehr.

## Schreibgeschützte SD-Karte

Der Raspberry Pi wird in der Halle oft einfach vom Strom getrennt. Damit die SD-Karte dabei nicht beschädigt wird, läuft das System schreibgeschützt:

- Alles, was Chromium und das System während des Betriebs schreiben, landet nur im RAM und ist nach dem nächsten Start wieder weg. Auch die Boot-Partition ist schreibgeschützt.
- Einzige Ausnahme ist eine neue Version des Screens. Alle 5 Minuten prüft der Raspberry Pi, ob online eine neue Version liegt und Chromium sie schon vollständig geladen hat. Erst dann schreibt er sie einmal auf die SD-Karte und startet neu.
- Ohne Internet und ohne neue Version wird die SD-Karte nie beschrieben.

## Neue Version auf den Screen bringen

1. Änderung auf `main` mergen und warten, bis die GitHub Action durchgelaufen ist.
2. Dem Raspberry Pi Internet geben, zum Beispiel mit einem Handy-Hotspot unter dem WLAN-Namen und Passwort, die beim Vorbereiten der SD-Karte eingegeben wurden.
3. Spätestens nach 10 Minuten lädt der Screen die neue Version und zeigt sie an.
4. Spätestens 5 Minuten später speichert der Raspberry Pi die neue Version auf der SD-Karte. Der Bildschirm ist dabei kurz schwarz, dann startet der Raspberry Pi einmal neu. Erst danach kann das Internet wieder weg, insgesamt nach etwa 20 Minuten. Wird es vorher getrennt, zeigt der Screen nach dem nächsten Einschalten wieder die alte Version und holt die neue beim nächsten Mal mit Internet.

## Voraussetzungen

- Raspberry Pi 3, 4 oder 5 und eine microSD-Karte mit mindestens 16 GB
- [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
- OpenSSL mit SHA-512 auf dem Mac (das mitgelieferte LibreSSL reicht nicht): `brew install openssl`
- `python3` auf dem Mac
- Für den allerersten Start und für Updates: Internet über WLAN oder LAN-Kabel, im Alltag läuft der Screen ohne

## SD-Karte vorbereiten

1. Im Raspberry Pi Imager das Gerät und **Raspberry Pi OS (64-bit)** mit Desktop wählen, ab Version November 2025. Die Frage nach eigenen Einstellungen mit **Nein** beantworten.
2. Nach dem Schreiben die SD-Karte aus- und wieder einstecken, damit die Partition `bootfs` erscheint.
3. Im Projektordner das Script starten:

   ```bash
   ./raspi/prepare-sd-card.sh
   ```

   Das Script fragt nach dem WLAN (leer lassen für LAN-Kabel) und nach einem Passwort für den Benutzer `handball`. Mit diesem Passwort meldest du dich später auch per SSH an. Ist `bootfs` unter einem anderen Pfad eingebunden, den Pfad als Argument mitgeben.
4. SD-Karte auswerfen, in den Raspberry Pi stecken und einschalten.

Beim ersten Start richtet sich der Raspberry Pi ein und startet neu. Danach erscheint der Screen. Sobald alle Bilder geladen sind, speichert er sie auf der SD-Karte und startet ein zweites Mal neu. Das Internet muss bis nach diesem zweiten Neustart verbunden bleiben, insgesamt etwa 20 bis 30 Minuten.

Die Passwörter landen nur auf der SD-Karte, nie im Repository. Das WLAN-Passwort steht dort im Klartext in `network-config`, das Benutzer-Passwort nur als Hash in `user-data`.

## Was auf dem Raspberry Pi eingerichtet wird

| Was | Wo |
|---|---|
| Hostname `handball-screen`, Zeitzone Europe/Zurich, Schweizer Tastatur | cloud-init |
| Benutzer `handball` mit `sudo` ohne Passwort | cloud-init |
| SSH aktiv, Anmeldung mit Benutzername und Passwort | `raspi-config nonint do_ssh 0` |
| Automatische Anmeldung am Desktop | `raspi-config nonint do_boot_behaviour B4` |
| Bildschirm schaltet nie ab | `raspi-config nonint do_blanking 1` |
| Start des Kiosks beim Anmelden, Neustart nach einem Absturz | `/home/handball/.config/labwc/autostart` mit `lwrespawn` |
| Kiosk-Script: startet Chromium sofort, wenn der Screen schon einmal geladen wurde, sonst nach bis zu 2 Minuten Warten auf Internet | `/usr/local/bin/handball-screen-kiosk` |
| Mauszeiger ausgeblendet, sobald Chromium erscheint | `/home/handball/.config/labwc/rc.xml` mit der Fensterregel `HideCursor` |
| Chromium bietet keine Übersetzung an | Richtlinie `TranslateEnabled` in `/etc/chromium/policies/managed/handball-screen.json` |
| Schreibgeschützte SD-Karte und Boot-Partition, Änderungen nur im RAM | `raspi-config nonint do_overlayfs 0` mit dem Paket `overlayroot` |
| Neue Version auf die SD-Karte schreiben, sobald Chromium sie vollständig geladen hat, danach Neustart | `/usr/local/sbin/handball-screen-save-offline-copy`, alle 5 Minuten über `handball-screen-save-offline-copy.timer` (systemd) |

Die Vorlagen dafür sind [`user-data`](user-data) und [`network-config`](network-config). Eine andere Screen-URL wird in `user-data` bei `SCREEN_URL` eingetragen.

## Wartung

- **Per SSH:** `ssh handball@handball-screen.local` im gleichen Netzwerk, mit dem Passwort vom Vorbereiten der SD-Karte
- **Direkt am Raspberry Pi:** Mit `Ctrl` + `Alt` + `F2` auf eine Textkonsole wechseln und als `handball` anmelden. Zurück zum Screen geht es mit `Ctrl` + `Alt` + `F7` oder mit `sudo reboot`. Wird Chromium geschlossen, startet es nach einer Sekunde neu.
- **Neu laden erzwingen:** `sudo reboot`
- **Dauerhafte Änderungen:** Was per SSH oder auf der Konsole geändert wird, ist nach dem nächsten Neustart wieder weg. Für eine bleibende Änderung zuerst den Schreibschutz ausschalten und neu starten, dann ändern und den Schreibschutz wieder einschalten:

  ```bash
  sudo raspi-config nonint do_overlayfs 1 && sudo reboot
  ```

  ```bash
  sudo raspi-config nonint do_overlayfs 0 && sudo reboot
  ```
