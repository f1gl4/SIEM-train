
const TTL_MS = 1000 * 60 * 60 * 12; // 12h
const cache = new Map();

export const MISP_SOURCES = {
  ransomware: 'https://raw.githubusercontent.com/MISP/misp-galaxy/main/clusters/ransomware.json',
  stealer:    'https://raw.githubusercontent.com/MISP/misp-galaxy/main/clusters/stealer.json',
  rat:        'https://raw.githubusercontent.com/MISP/misp-galaxy/main/clusters/rat.json',
  backdoor:   'https://raw.githubusercontent.com/MISP/misp-galaxy/main/clusters/backdoor.json',
};

async function fetchJsonWithCache(url) {
  const now = Date.now();
  const c = cache.get(url);
  if (c && (now - c.when) < TTL_MS) return c.data;

  const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status}`);
  const data = await r.json();
  cache.set(url, { data, when: now });
  return data;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }


function simplifyClusterValue(v, category) {
  return {
    source: 'misp-galaxy',
    category, // ransomware|stealer|rat|backdoor
    value: v.value || v.name || 'Unknown',
    description: (v.description || '').slice(0, 600), // sliced
    meta: v.meta || {},
    related: v.related || [],
  };
}

// from random category

export async function getRandomMispSeed(category) {
  const url = MISP_SOURCES[category];
  if (!url) throw new Error(`Unknown MISP category: ${category}`);
  const json = await fetchJsonWithCache(url);
  const values = Array.isArray(json?.values) ? json.values : [];
  if (!values.length) throw new Error(`Empty values for ${category}`);
  return simplifyClusterValue(pick(values), category);
}


// two different categories

export async function getTwoDistinctMispSeeds() {
  const cats = Object.keys(MISP_SOURCES);
  // the first two
  for (let i = cats.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cats[i], cats[j]] = [cats[j], cats[i]];
  }
  const chosen = cats.slice(0, 2);
  const [a, b] = await Promise.all([
    getRandomMispSeed(chosen[0]),
    getRandomMispSeed(chosen[1]),
  ]);
  return [a, b];
}
