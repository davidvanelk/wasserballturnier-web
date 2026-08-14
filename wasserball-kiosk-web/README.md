# Wasserball Kiosk

Eigenständige Next.js-App für die bildschirmfüllende Spielübersicht. Die Daten
werden alle 30 Sekunden neu aus Strapi geladen. Auf einem Full-HD-Bildschirm
werden acht Spiele gleichzeitig gezeigt; weitere Seiten wechseln automatisch
alle zehn Sekunden. Die Ansicht selbst scrollt nicht.

Aktive Sponsoren aus Strapi werden gewichtet ausgewählt und im Kopfbereich
angezeigt. Der Werbeslot wird alle 30 Sekunden neu ausgelost. Wenn mehrere
Sponsoren verfügbar sind, wird dabei immer ein anderer Sponsor angezeigt.

```sh
cp .env.example .env.local
npm ci
npm run dev
```

Dabei muss Strapi unter der in `STRAPI_URL` eingetragenen Adresse laufen. Für
lokale Entwicklung ist das standardmäßig `http://localhost:1337`. Beim Start
über den Compose-Stack lautet die interne Adresse `http://strapi:1337`.

Standardmäßig läuft die App unter `http://localhost:3000`. Für einen Browser im
Kiosk-Modus kann beispielsweise Chromium mit `--kiosk http://localhost:3000`
gestartet werden.

Alternativ lässt sich die App als Container starten:

```sh
docker build -t wasserball-kiosk .
docker run --rm -p 3000:3000 -e STRAPI_URL=http://host.docker.internal:1337 wasserball-kiosk
```
