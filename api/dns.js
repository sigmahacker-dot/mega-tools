/* ToolNest own API: DNS lookup using Node's dns module */
import dns from 'node:dns';

const TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS'];

export default async function handler(req, res) {
  try {
    const host = (req.query.host || '').toString().trim().toLowerCase().replace(/[^a-z0-9.\-_*]/g, '').slice(0, 253);
    let type = (req.query.type || 'A').toString().toUpperCase();
    if (!TYPES.includes(type)) type = 'A';
    if (!host) return res.status(400).json({ error: 'Missing ?host= parameter' });
    const records = await dns.promises.resolve(host, type);
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json({ host, type, records });
  } catch (e) {
    res.status(200).json({ host: (req.query.host || '').toString(), type: (req.query.type || 'A').toString().toUpperCase(), records: [], error: e.code === 'ENOTFOUND' ? 'No records found (ENOTFOUND)' : 'Lookup failed: ' + (e.code || e.message) });
  }
}
