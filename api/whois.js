/* ToolNest own API: WHOIS lookup (raw TCP port 43 via node:net — no npm deps) */
import net from 'node:net';

function whoisQuery(server, query, timeoutMs) {
  return new Promise((resolve, reject) => {
    let data = '';
    let settled = false;
    const sock = net.connect(43, server);
    const finish = (fn, arg) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { sock.destroy(); } catch (e) { /* noop */ }
      fn(arg);
    };
    const timer = setTimeout(() => finish(reject, new Error('timeout')), timeoutMs);
    // hard cap: never buffer more than ~24KB
    sock.on('connect', () => { try { sock.write(query + '\r\n'); } catch (e) { finish(reject, e); } });
    sock.on('data', (c) => {
      data += c.toString('utf8');
      if (data.length > 24000) finish(resolve, data);
    });
    sock.on('end', () => finish(resolve, data));
    sock.on('close', () => finish(resolve, data));
    sock.on('error', (e) => finish(reject, e));
  });
}

const TLD_FALLBACK = {
  com: 'whois.verisign-grs.com',
  net: 'whois.verisign-grs.com',
  org: 'whois.pir.org',
  io: 'whois.nic.io',
  co: 'whois.nic.co',
};

export default async function handler(req, res) {
  try {
    const domain = (req.query.domain || '').toString().trim().toLowerCase().replace(/[^a-z0-9.\-]/g, '').slice(0, 253);
    if (!domain || !domain.includes('.')) return res.status(400).json({ error: 'Enter a valid domain, e.g. example.com' });

    // 1. Ask IANA which registry handles this TLD
    let server = null;
    try {
      const iana = await whoisQuery('whois.iana.org', domain, 8000);
      const m = iana.match(/^refer:\s*(\S+)/mi);
      if (m) server = m[1].trim().toLowerCase();
    } catch (e) { /* fall through to TLD fallback */ }

    // 2. Fallback for common TLDs when IANA gives nothing
    if (!server) {
      const tld = domain.split('.').pop();
      server = TLD_FALLBACK[tld] || null;
    }
    if (!server) return res.status(502).json({ error: 'WHOIS lookup failed for this TLD. Try a .com / .net / .org domain.' });

    // 3. Query the registry (thin registries get a second hop via "Whois Server:")
    let text = await whoisQuery(server, domain, 12000);
    const hop = text.match(/^\s*Whois Server:\s*(\S+)/mi);
    if (hop && hop[1].trim().toLowerCase() !== server) {
      try { text = await whoisQuery(hop[1].trim(), domain, 12000); } catch (e) { /* keep first response */ }
    }

    if (!text || !text.trim()) return res.status(502).json({ error: 'WHOIS lookup returned no data. The registry may be rate-limiting — try again in a minute.' });
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).json({ domain, server, text: text.slice(0, 8000) });
  } catch (e) {
    res.status(502).json({ error: 'WHOIS lookup failed. The registry may be rate-limiting — try again in a minute.' });
  }
}
