# conquest-api (Cloudflare Worker)

Sajten får aldrig prata direkt med Roblox med en API-nyckel, för då ligger nyckeln i webbläsaren.
Den här Workern är mellanhanden: den läser Open Cloud med nyckeln som hemlighet, slår upp användarnamn och
avatarbilder, cachar allt i fem minuter och svarar med JSON. Utan nyckel kör den i demo-läge med påhittad data,
så sajten kan läggas upp innan spelet skriver riktiga siffror.

## Rutter
| Rutt | Svar |
|---|---|
| `/api/snapshot` | allt: alla boards + live |
| `/api/leaderboard?board=kills&limit=100` | en board, topp 100, med `name`, `displayName`, `avatar`, `value`, `rank` |
| `/api/live` | `playing`, `visits`, `favorites` från Roblox games-API |
| `/api/player?name=Nordvakt` | en spelares värden och placering |

## Installera (en gång, vid datorn)
1. Skapa gratis Cloudflare-konto. `npm i -g wrangler` och `wrangler login`.
2. Fyll i `UNIVERSE_ID` i `wrangler.toml` (Creator Hub > din experience > Overview visar Universe ID).
3. Skapa en SEPARAT API-nyckel i Creator Hub bara för sajten: API System "Ordered Data Stores", operation Read,
   begränsad till Conquest-experiencen. Inte samma nyckel som uppladdaren. Sätt den som hemlighet utan att visa den:
   `wrangler secret put ROBLOX_API_KEY` och klistra in i prompten (eller `$env:X | wrangler secret put ROBLOX_API_KEY` från PowerShell).
4. Valfritt: `wrangler kv namespace create CACHE` och fyll i id i `wrangler.toml` (delad cache för alla edge-noder).
5. `wrangler deploy`. Adressen blir `https://conquest-api.<ditt-konto>.workers.dev`. Klistra in den i `site/config.js`.
6. Testa: öppna `/api/live` i webbläsaren. `mode: live` betyder att nyckeln fungerar.

Gratisnivån (100 000 anrop per dag, cron ingår) räcker gott; sajten läser cachad JSON och Roblox anropas högst var femte minut.

## Testa lokalt utan Cloudflare
`node worker/test/smoke.mjs` kör Workern i demo-läge och kontrollerar alla rutter.
