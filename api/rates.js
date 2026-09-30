/* ToolNest own API: currency rates (upstream: open.er-api.com, free & keyless) */
let cache = { at: 0, data: null };
const TTL = 12 * 60 * 60 * 1000;

export default async function handler(req, res) {
  try {
    const base = (req.query.base || 'USD').toString().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'USD';
    const now = Date.now();
    if (!cache.data || cache.base !== base || now - cache.at > TTL) {
      const r = await fetch(`https://open.er-api.com/v6/latest/${base}`, { signal: AbortSignal.timeout(10000) });
      if (!r.ok) throw new Error('upstream error ' + r.status);
      const j = await r.json();
      if (j.result !== 'success') throw new Error('upstream failure');
      cache = { at: now, base, data: { base: j.base_code, date: j.time_last_update_utc, rates: j.rates } };
    }
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).json(cache.data);
  } catch (e) {
    res.status(502).json({ error: 'Could not fetch exchange rates right now. Please try again later.' });
  }
}
