# Speisekarte mit Sanity (Cloud)

Studio: **https://cafe-erdmann.sanity.studio**

Das Menü wird **live** von Sanity geladen. Nach **Publish** in Studio reicht ein Refresh der Website — kein Deploy, kein Cursor.

## Für Valentin / Klaus

1. Studio öffnen: https://cafe-erdmann.sanity.studio
2. Einloggen (Sanity-Account — Lea kann Mitglieder einladen unter [sanity.io/manage](https://www.sanity.io/manage/project/l2lpqwcy))
3. **Restaurant-Speisekarte** oder **Brunch-Menü** öffnen
4. Texte/Preise ändern
5. Oben rechts **Publish** klicken
6. Website neu laden → neues Menü

## Einmaliges Setup (bereits erledigt)

- Projekt-ID: `l2lpqwcy`
- Dataset: `production`
- Seed-Menü importiert
- CORS für localhost + cafe-erdmann.com
- Studio deployed
- Website Env + Live-Fetch aktiv

Lokal weiterentwickeln:

```bash
# Root .env und studio/.env enthalten die Project-ID
npm run dev          # Website
npm run studio       # Studio lokal
```

Wenn Sanity kurz nicht erreichbar ist, bleibt die HTML-Fallback-Speisekarte sichtbar.
