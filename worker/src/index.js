// conquest-api: serves leaderboard and live stats JSON for the Conquest website (internal project name Save6).
// Reads Roblox Open Cloud Ordered Data Stores (server side, with the API key as a secret),
// resolves usernames and headshots through Roblox's public web APIs, caches everything,
// and falls back to deterministic demo data when no key or universe is configured.

const RBX = {
  entries: (u, store, scope) => `https://apis.roblox.com/cloud/v2/universes/${u}/ordered-data-stores/${encodeURIComponent(store)}/scopes/${encodeURIComponent(scope)}/entries`,
  users: 'https://users.roblox.com/v1/users',
  usernames: 'https://users.roblox.com/v1/usernames/users',
  headshots: 'https://thumbnails.roblox.com/v1/users/avatar-headshot',
  games: 'https://games.roblox.com/v1/games',
};

function config(env) {
  const season = String(env.SEASON || '1');
  return {
    universe: String(env.UNIVERSE_ID || '').trim(),
    key: String(env.ROBLOX_API_KEY || ''),
    season: Number(season),
    boards: String(env.BOARDS || 'Kills,Wins,Jets').split(',').map(s => s.trim()).filter(Boolean),
    prefix: String(env.STORE_PREFIX || '').trim() || `S6_S${season}_`,
    scope: String(env.SCOPE || 'global'),
    ttl: Math.max(60, Number(env.CACHE_SECONDS || 300)),
    origin: String(env.ALLOW_ORIGIN || '*'),
  };
}
const demoMode = c => !c.universe || !c.key;

// ---------- Roblox calls ----------
async function rbxJson(url, init = {}, key) {
  const headers = new Headers(init.headers || {});
  headers.set('accept', 'application/json');
  if (key) headers.set('x-api-key', key);
  const r = await fetch(url, { ...init, headers });
  if (!r.ok) throw new Error(`Roblox ${r.status} for ${String(url).split('?')[0]}`);
  return r.json();
}

async function listTop(c, board, limit = 100) {
  const url = new URL(RBX.entries(c.universe, c.prefix + board, c.scope));
  url.searchParams.set('maxPageSize', String(Math.min(Math.max(limit, 1), 100)));
  url.searchParams.set('orderBy', 'value desc');
  const data = await rbxJson(url, {}, c.key);
  const items = data.orderedDataStoreEntries || [];
  return items.map((e, i) => ({ rank: i + 1, userId: Number(e.id || String(e.path || '').split('/').pop()), value: Math.round(Number(e.value) || 0) }));
}

async function getEntry(c, board, userId) {
  const url = `${RBX.entries(c.universe, c.prefix + board, c.scope)}/${userId}`;
  try { const e = await rbxJson(url, {}, c.key); return Math.round(Number(e.value) || 0); }
  catch (err) { if (String(err).includes(' 404 ')) return 0; throw err; }
}

async function resolveUsers(ids) {
  const out = new Map();
  const list = [...new Set(ids.filter(Boolean))];
  for (let i = 0; i < list.length; i += 100) {
    const chunk = list.slice(i, i + 100);
    const [users, thumbs] = await Promise.allSettled([
      rbxJson(RBX.users, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userIds: chunk, excludeBannedUsers: false }) }),
      rbxJson(`${RBX.headshots}?userIds=${chunk.join(',')}&size=150x150&format=Png&isCircular=true`),
    ]);
    if (users.status === 'fulfilled') for (const u of users.value.data || []) out.set(Number(u.id), { name: u.name, displayName: u.displayName, verified: !!u.hasVerifiedBadge });
    if (thumbs.status === 'fulfilled') for (const t of thumbs.value.data || []) { const cur = out.get(Number(t.targetId)) || {}; cur.avatar = t.state === 'Completed' ? t.imageUrl : null; out.set(Number(t.targetId), cur); }
  }
  return out;
}

async function fetchLive(c) {
  const d = await rbxJson(`${RBX.games}?universeIds=${c.universe}`);
  const g = (d.data || [])[0];
  if (!g) return null;
  return { playing: g.playing ?? null, visits: g.visits ?? null, favorites: g.favoritedCount ?? null, name: g.name || null, maxPlayers: g.maxPlayers ?? null };
}

async function usernameToId(name) {
  const d = await rbxJson(RBX.usernames, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ usernames: [name], excludeBannedUsers: false }) });
  const u = (d.data || [])[0];
  return u ? { userId: Number(u.id), name: u.name, displayName: u.displayName } : null;
}

// ---------- snapshot (all boards + live) ----------
async function buildSnapshot(c) {
  const boards = {};
  const ids = new Set();
  await Promise.all(c.boards.map(async b => {
    const k = b.toLowerCase();
    try { boards[k] = await listTop(c, b, 100); boards[k].forEach(e => ids.add(e.userId)); }
    catch (err) { boards[k] = []; boards[`${k}_error`] = String(err.message || err); }
  }));
  const users = await resolveUsers([...ids]).catch(() => new Map());
  for (const k of Object.keys(boards)) if (Array.isArray(boards[k])) for (const e of boards[k]) Object.assign(e, { name: null, displayName: null, avatar: null }, users.get(e.userId) || {});
  const live = await fetchLive(c).catch(() => null);
  return { season: c.season, source: 'live', updated: new Date().toISOString(), ttl: c.ttl, boards, live };
}

// ---------- demo data (deterministic) ----------
const DEMO_NAMES = ['Nordvakt','TundraWolf','HexDriver','Blixt_42','Fjallrav','StormOps','Varg_Prime','Furuvik','Isbjorn77','Ekorren','RawFish99','Kalle_K','Lappis','Granat_Gustav','Myrstack','Renko','Skogsvakt','Dimma_7','Tjader','Flinta','Oden_x','Hugin','Munin','Snoflinga','Bergsro','Kottbulle','Pansar_P','Lavin','Stenbock','Ravine'];
function demoSnapshot(c) {
  let s = 1337 >>> 0; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const mk = (top, decay) => Array.from({ length: 100 }, (_, i) => {
    const name = DEMO_NAMES[i] || `Operator_${(i * 37) % 997}`;
    return { rank: i + 1, userId: 100000 + i, name, displayName: name, avatar: null, value: Math.max(1, Math.round(top * Math.pow(decay, i) * (0.9 + 0.2 * r()))) };
  }).sort((a, b) => b.value - a.value).map((e, i) => ({ ...e, rank: i + 1 }));
  const boards = { kills: mk(4820, 0.975), wins: mk(312, 0.97), jets: mk(71, 0.95), rating: mk(2418, 0.995) };
  return { season: c.season, source: 'demo', updated: new Date().toISOString(), ttl: c.ttl, boards, live: { playing: 1204, visits: 1873302, favorites: 42117, name: 'Conquest', maxPlayers: 24 } };
}

// ---------- caching: in-isolate memory + optional KV ----------
let memory = null;
async function getSnapshot(env, ctx, c) {
  if (demoMode(c)) return demoSnapshot(c);
  const fresh = s => s && (Date.now() - Date.parse(s.updated)) < c.ttl * 1000;
  if (fresh(memory)) return memory;
  let stored = null;
  if (env.CACHE) { try { stored = await env.CACHE.get('snapshot', 'json'); } catch {} }
  if (fresh(stored)) { memory = stored; return stored; }
  const rebuild = async () => { const snap = await buildSnapshot(c); memory = snap; if (env.CACHE) { try { await env.CACHE.put('snapshot', JSON.stringify(snap), { expirationTtl: 86400 }); } catch {} } return snap; };
  if (stored) { ctx.waitUntil(rebuild().catch(() => {})); return stored; }   // stale while revalidate
  return rebuild();
}

// ---------- HTTP ----------
function json(body, c, status = 200, extra = {}) {
  return new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': c.origin, 'access-control-allow-methods': 'GET, OPTIONS', 'access-control-allow-headers': 'content-type', 'cache-control': `public, max-age=60, s-maxage=${c.ttl}`, ...extra } });
}

export default {
  async fetch(request, env, ctx) {
    const c = config(env);
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return json({}, c, 204);
    if (request.method !== 'GET') return json({ error: 'GET only' }, c, 405);
    try {
      if (url.pathname === '/api/snapshot') return json(await getSnapshot(env, ctx, c), c);
      if (url.pathname === '/api/live') { const s = await getSnapshot(env, ctx, c); return json({ source: s.source, updated: s.updated, ...(s.live || {}) }, c); }
      if (url.pathname === '/api/leaderboard') {
        const board = (url.searchParams.get('board') || c.boards[0] || 'kills').toLowerCase();
        const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 100), 1), 100);
        const s = await getSnapshot(env, ctx, c);
        const entries = s.boards[board];
        if (!Array.isArray(entries)) return json({ error: `unknown board "${board}"`, boards: Object.keys(s.boards).filter(k => Array.isArray(s.boards[k])) }, c, 404);
        return json({ board, season: s.season, source: s.source, updated: s.updated, entries: entries.slice(0, limit), error: s.boards[`${board}_error`] || null }, c);
      }
      if (url.pathname === '/api/player') {
        const name = (url.searchParams.get('name') || '').trim();
        if (!/^[\w.]{3,20}$/.test(name)) return json({ error: 'name must be 3 to 20 characters' }, c, 400);
        const s = await getSnapshot(env, ctx, c);
        if (demoMode(c)) {
          const hit = Object.entries(s.boards).map(([k, list]) => [k, list.find(e => e.name.toLowerCase() === name.toLowerCase())]).filter(([, e]) => e);
          if (!hit.length) return json({ error: 'not found', source: 'demo' }, c, 404);
          return json({ source: 'demo', userId: hit[0][1].userId, name: hit[0][1].name, displayName: hit[0][1].displayName, avatar: null, boards: Object.fromEntries(hit.map(([k, e]) => [k, { value: e.value, rank: e.rank }])) }, c);
        }
        const u = await usernameToId(name);
        if (!u) return json({ error: 'not found' }, c, 404);
        const boards = {};
        await Promise.all(c.boards.map(async b => { const k = b.toLowerCase(); const inTop = (s.boards[k] || []).find(e => e.userId === u.userId); boards[k] = { value: inTop ? inTop.value : await getEntry(c, b, u.userId), rank: inTop ? inTop.rank : null }; }));
        const info = (await resolveUsers([u.userId])).get(u.userId) || {};
        return json({ source: 'live', ...u, avatar: info.avatar || null, boards }, c, 200, { 'cache-control': 'public, max-age=60' });
      }
      return json({ name: 'conquest-api', mode: demoMode(c) ? 'demo' : 'live', season: c.season, boards: c.boards.map(b => b.toLowerCase()), routes: ['/api/snapshot', '/api/leaderboard?board=kills&limit=100', '/api/live', '/api/player?name=Nordvakt'] }, c);
    } catch (err) {
      return json({ error: String(err.message || err) }, c, 502, { 'cache-control': 'no-store' });
    }
  },
  async scheduled(event, env, ctx) {
    const c = config(env);
    if (demoMode(c)) return;
    memory = null;
    const snap = await buildSnapshot(c);
    memory = snap;
    if (env.CACHE) await env.CACHE.put('snapshot', JSON.stringify(snap), { expirationTtl: 86400 });
  },
};
