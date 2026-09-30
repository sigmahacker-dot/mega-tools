/* ToolNest own API: TCP port check from the server side */
import net from 'node:net';

export default async function handler(req, res) {
  const host = (req.query.host || '').toString().trim().toLowerCase().replace(/[^a-z0-9.\-]/g, '').slice(0, 253);
  const port = parseInt((req.query.port || '').toString(), 10);
  if (!host) return res.status(400).json({ error: 'Missing ?host= parameter' });
  if (!port || port < 1 || port > 65535) return res.status(400).json({ error: 'Port must be 1–65535' });
  const t0 = Date.now();
  const open = await new Promise((resolve) => {
    const s = new net.Socket();
    let done = false;
    const finish = (v) => { if (!done) { done = true; s.destroy(); resolve(v); } };
    s.setTimeout(5000);
    s.on('connect', () => finish(true));
    s.on('timeout', () => finish(false));
    s.on('error', () => finish(false));
    s.connect(port, host);
  });
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ host, port, open, ms: Date.now() - t0 });
}
