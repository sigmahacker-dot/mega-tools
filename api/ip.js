/* ToolNest own API: visitor IP address */
export default async function handler(req, res) {
  const fwd = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim();
  const ip = fwd || req.socket?.remoteAddress || 'unknown';
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ip: ip.replace(/^::ffff:/, '') });
}
