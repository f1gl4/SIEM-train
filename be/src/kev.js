
export async function getRandomKev({ timeoutMs = 6000 } = {}) {
  
  const url = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const r = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(`KEV fetch failed: ${r.status}`);
    const data = await r.json();

    const list = Array.isArray(data?.vulnerabilities) ? data.vulnerabilities : [];
    if (!list.length) throw new Error('KEV list empty');

    const idx = Math.floor(Math.random() * list.length);
    const v = list[idx];

    return {
      index: idx,
      count: data.count ?? list.length,
      cveID: v.cveID,
      vendorProject: v.vendorProject,
      product: v.product,
      vulnerabilityName: v.vulnerabilityName,
      dateAdded: v.dateAdded,
      shortDescription: v.shortDescription || v.description || '',
      requiredAction: v.requiredAction || '',
      notes: v.notes || '',
    };
  } finally {
    clearTimeout(timer);
  }
}
