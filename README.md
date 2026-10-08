# Conquest webbplats (internt projektnamn Save6)

Statisk sajt för Roblox-spelet Conquest, plus en liten Cloudflare Worker som matar den med leaderboard och live-siffror.

```
site/     sidorna (index, ranks, arsenal), css, js, bilder. build.py sätter ihop dist/.
worker/   conquest-api: läser Open Cloud på serversidan, cachar, svarar JSON. Demo-läge utan nyckel.
roblox/   LeaderboardService.lua: skriver kills/wins/jets till OrderedDataStores i spelet. Datakontraktet.
.github/  workflow som bygger site/dist och publicerar på GitHub Pages vid varje push till main.
```

## Komma igång
1. Pusha repot till GitHub. Settings > Pages > Source: GitHub Actions. Första deployen går automatiskt.
   Adress: `https://<användare>.github.io/<repo>/`.
2. `site/config.js`: fyll i `gameUrl`, `discordUrl`, `seasonEnd`. Lämna `api` tom tills Workern finns; sajten visar demo-data.
3. Lägg in `roblox/LeaderboardService.lua` i spelet (se `roblox/README.md`).
4. Sätt upp Workern (se `worker/README.md`), klistra in dess adress i `site/config.js` och pusha.

## Jobba lokalt
`python site/build.py` bygger `site/dist/`. Öppna `site/dist/index.html` i webbläsaren, eller kör
`python -m http.server -d site/dist 8080` och gå till http://localhost:8080.
`node worker/test/smoke.mjs` testar Workern i demo-läge.

## Säkerhet
Roblox API-nyckeln finns bara som Cloudflare-hemlighet. Den ska aldrig in i `site/`, i `wrangler.toml`, i git eller i chatten.
Sajten pratar bara med Workern, som bara har läsrättighet på Ordered Data Stores.
