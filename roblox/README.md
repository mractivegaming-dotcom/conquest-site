# Roblox-sidan av pipelinen (Conquest, internt projektnamn Save6)

`LeaderboardService.lua` är en ModuleScript. Lägg den i ServerScriptService (eller ServerStorage) och anropa
`require(...).Start()` från ett server-Script vid uppstart. Koppla sedan in fyra anrop i den kod som redan
finns: AddKill, AddDeath, AddWin, AddJet. Allt ligger bakom `Enabled` och skriver aldrig från Studio
(`STUDIO_WRITES = false`), så Play-tester förstör inget.

Datakontraktet (vad sajten läser):

| Store | Typ | Nyckel | Värde |
|---|---|---|---|
| `S6_S1_Kills` | OrderedDataStore | userId som sträng | kills, heltal |
| `S6_S1_Wins`  | OrderedDataStore | userId | vinster |
| `S6_S1_Jets`  | OrderedDataStore | userId | nedskjutna jetplan |
| `S6_S1_Stats` | DataStore | userId | `{kills, wins, jets, deaths, name, updated}` |

Byt `SEASON` när säsong 2 börjar. Gamla stores finns kvar för all-time-listor.
Rankingsystemet (rating) kommer senare och blir en femte store, `S6_S1_Rating`; sajten är byggd för att plugga in den.

Att göra i Studio (Edit-läge, backup först): 1) lägg in modulen, 2) Start() i ett server-Script,
3) hitta eventen för kill/death/round-win/jet-kill och lägg in anropen, 4) publicera,
5) spela en riktig runda (inte Studio) och kontrollera i Creator Hub > Data Stores att `S6_S1_Kills` fick värden.
