--!strict
-- LeaderboardService (ModuleScript, ServerScriptService or ServerStorage)
-- Writes per-player season stats to OrderedDataStores so the website (and in-game boards)
-- can read sorted top lists. Also mirrors the same numbers into a normal DataStore blob per
-- player for future profile pages. Everything is behind the Enabled switch.
--
-- Data contract (season 1):
--   OrderedDataStore "S6_S1_Kills"  key = tostring(userId)  value = total kills (integer)
--   OrderedDataStore "S6_S1_Wins"   key = tostring(userId)  value = total wins
--   OrderedDataStore "S6_S1_Jets"   key = tostring(userId)  value = jets downed
--   DataStore        "S6_S1_Stats"  key = tostring(userId)  value = { kills, wins, jets, deaths, name, updated }
-- Bump SEASON to start a new season; old stores stay readable for "all-time" pages.
--
-- Usage from your game code (server only):
--   local LB = require(path.to.LeaderboardService)
--   LB.AddKill(killer)     -- on a confirmed kill
--   LB.AddDeath(victim)
--   LB.AddWin(player)      -- when the round ends, for each player on the winning team
--   LB.AddJet(player)      -- when a jet is destroyed and the kill is credited
-- Increments are batched in memory and flushed every FLUSH_SECONDS and on PlayerRemoving /
-- BindToClose, so a busy server never exceeds the DataStore request budget.

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local LeaderboardService = {}

-- ===== switches =====
LeaderboardService.Enabled = true           -- master switch; false = no DataStore writes at all
local SEASON = 1
local FLUSH_SECONDS = 60                    -- how often pending increments are written
local PREFIX = ("S6_S%d_"):format(SEASON)
local STUDIO_WRITES = false                 -- keep false so Play tests never touch live stores

-- ===== stores =====
local stores: {[string]: OrderedDataStore} = {}
local statsStore: DataStore? = nil
local function canWrite(): boolean
	if not LeaderboardService.Enabled then return false end
	if RunService:IsStudio() and not STUDIO_WRITES then return false end
	return true
end
local function ordered(name: string): OrderedDataStore
	if not stores[name] then stores[name] = DataStoreService:GetOrderedDataStore(PREFIX .. name) end
	return stores[name]
end
local function stats(): DataStore
	if not statsStore then statsStore = DataStoreService:GetDataStore(PREFIX .. "Stats") end
	return statsStore :: DataStore
end

-- ===== pending increments (per userId) =====
type Pending = { kills: number, wins: number, jets: number, deaths: number, name: string }
local pending: {[number]: Pending} = {}
local function bucket(player: Player): Pending
	local p = pending[player.UserId]
	if not p then
		p = { kills = 0, wins = 0, jets = 0, deaths = 0, name = player.Name }
		pending[player.UserId] = p
	end
	return p
end

function LeaderboardService.AddKill(player: Player, n: number?) bucket(player).kills += (n or 1) end
function LeaderboardService.AddDeath(player: Player, n: number?) bucket(player).deaths += (n or 1) end
function LeaderboardService.AddWin(player: Player, n: number?) bucket(player).wins += (n or 1) end
function LeaderboardService.AddJet(player: Player, n: number?) bucket(player).jets += (n or 1) end

-- ===== flushing =====
local function retry(fn: () -> (), what: string)
	for attempt = 1, 3 do
		local ok, err = pcall(fn)
		if ok then return true end
		warn(("[LeaderboardService] %s failed (attempt %d): %s"):format(what, attempt, tostring(err)))
		task.wait(2 ^ attempt)
	end
	return false
end

local function flushUser(userId: number, p: Pending)
	if not canWrite() then return end
	local key = tostring(userId)
	local function bump(storeName: string, delta: number)
		if delta == 0 then return end
		retry(function()
			ordered(storeName):UpdateAsync(key, function(old)
				return math.max(0, math.floor((old or 0) + delta))
			end)
		end, storeName .. "/" .. key)
	end
	bump("Kills", p.kills)
	bump("Wins", p.wins)
	bump("Jets", p.jets)
	retry(function()
		stats():UpdateAsync(key, function(old)
			old = old or {}
			old.kills = (old.kills or 0) + p.kills
			old.wins = (old.wins or 0) + p.wins
			old.jets = (old.jets or 0) + p.jets
			old.deaths = (old.deaths or 0) + p.deaths
			old.name = p.name
			old.updated = os.time()
			return old
		end)
	end, "Stats/" .. key)
end

function LeaderboardService.Flush()
	local snapshot = pending
	pending = {}
	for userId, p in snapshot do
		if p.kills + p.wins + p.jets + p.deaths > 0 then
			task.spawn(flushUser, userId, p)
		end
	end
end

-- ===== reads for in-game boards (optional) =====
function LeaderboardService.Top(storeName: "Kills" | "Wins" | "Jets", count: number?)
	local ok, pages = pcall(function()
		return ordered(storeName):GetSortedAsync(false, math.clamp(count or 100, 1, 100))
	end)
	if not ok then return {} end
	local out = {}
	for rank, entry in ipairs(pages:GetCurrentPage()) do
		table.insert(out, { rank = rank, userId = tonumber(entry.key), value = entry.value })
	end
	return out
end

-- ===== lifecycle =====
local started = false
function LeaderboardService.Start()
	if started then return end
	started = true
	Players.PlayerRemoving:Connect(function(player)
		local p = pending[player.UserId]
		if p then pending[player.UserId] = nil; task.spawn(flushUser, player.UserId, p) end
	end)
	game:BindToClose(function()
		LeaderboardService.Flush()
		task.wait(3) -- give the spawned writes a moment before the server closes
	end)
	task.spawn(function()
		while true do
			task.wait(FLUSH_SECONDS)
			LeaderboardService.Flush()
		end
	end)
	print(("[LeaderboardService] started, season %d, writes %s"):format(SEASON, canWrite() and "ON" or "OFF (switch or Studio)"))
end

return LeaderboardService
