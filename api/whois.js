/* ToolNest own API: WHOIS lookup (whois npm package) */
import whois from 'whois';

export default async function handler(req, res) {
  try {
    const domain = (req.query.domain || '').toString().trim().toLowerCase().replace(/[^a-z0-9.\-]/g, '').slice(0, 253);
    if (!domain || !domain.includes('.')) return res.status(400).json({ error: 'Enter a valid domain, e.g. example.com' });
    const text = await new Promise((resolve, reject) => {
      whois.lookup(domain, { timeout: 12000 }, (err, data) => err ? reject(err) : resolve(String(data || '')));
    });
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).json({ domain, text: text.slice(0, 8000) });
  } catch (e) {
    res.status(502).json({ error: 'WHOIS lookup failed. The registry may be rate-limiting — try again in a minute.' });
  }
}
