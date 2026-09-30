/* ToolNest own API: real SSL certificate check via TLS handshake */
import tls from 'node:tls';

export default async function handler(req, res) {
  const host = (req.query.host || '').toString().trim().toLowerCase().replace(/[^a-z0-9.\-]/g, '').slice(0, 253);
  if (!host) return res.status(400).json({ error: 'Missing ?host= parameter' });
  try {
    const cert = await new Promise((resolve, reject) => {
      const socket = tls.connect({ host, port: 443, servername: host, timeout: 10000, rejectUnauthorized: false }, () => {
        const c = socket.getPeerCertificate(true);
        socket.end();
        c ? resolve(c) : reject(new Error('No certificate presented'));
      });
      socket.on('error', reject);
      socket.on('timeout', () => { socket.destroy(); reject(new Error('Connection timed out')); });
    });
    const validTo = new Date(cert.valid_to);
    const daysLeft = Math.round((validTo - Date.now()) / 86400000);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).json({
      host,
      valid: daysLeft >= 0,
      issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
      subject: cert.subject?.CN || host,
      valid_from: cert.valid_from,
      valid_to: cert.valid_to,
      days_left: daysLeft,
      fingerprint: cert.fingerprint256 || null,
    });
  } catch (e) {
    res.status(200).json({ host, valid: false, error: 'Could not establish a TLS connection: ' + e.message });
  }
}
