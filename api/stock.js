/* ToolNest own API: royalty-free stock video search (upstream: Pexels video API).
   Key comes from the PEXELS_API_KEY server env var (user supplies it later). */

export default async function handler(req, res) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: 'API key not configured',
      detail: 'Stock video search is not set up yet — the site owner needs to add a free Pexels API key (PEXELS_API_KEY).',
    });
  }
  try {
    const q = (req.query.q || 'nature').toString().trim().slice(0, 80) || 'nature';
    const page = Math.max(1, Math.min(50, parseInt(req.query.page || '1', 10) || 1));
    const perPage = Math.max(1, Math.min(20, parseInt(req.query.per_page || '12', 10) || 12));
    const r = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=${perPage}&page=${page}`,
      { headers: { Authorization: key }, signal: AbortSignal.timeout(12000) }
    );
    if (!r.ok) throw new Error('upstream ' + r.status);
    const j = await r.json();
    const videos = (j.videos || []).map((v) => {
      const files = (v.video_files || []).filter((f) => f.file_type === 'video/mp4');
      const best = files.find((f) => f.quality === 'hd') || files.find((f) => f.quality === 'sd') || files[0];
      return {
        id: v.id,
        duration: v.duration,
        width: v.width,
        height: v.height,
        preview: v.image,
        credit: v.user?.name || 'Pexels',
        page_url: v.url,
        download: best?.link || null,
      };
    });
    res.setHeader('Cache-Control', 'public, max-age=600');
    res.status(200).json({ query: q, page, total: j.total_results || videos.length, videos, license: 'Pexels License — free for commercial use, no attribution required' });
  } catch (e) {
    res.status(502).json({ error: 'Stock video search is unavailable right now. Please try again later.' });
  }
}
