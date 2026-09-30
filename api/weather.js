/* ToolNest own API: weather (upstream: Open-Meteo, free & keyless) */
const CODE_MAP = { 0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Icy fog',51:'Light drizzle',53:'Drizzle',55:'Dense drizzle',56:'Freezing drizzle',57:'Freezing drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',66:'Freezing rain',67:'Freezing rain',71:'Light snow',73:'Snow',75:'Heavy snow',77:'Snow grains',80:'Light showers',81:'Showers',82:'Violent showers',85:'Snow showers',86:'Snow showers',95:'Thunderstorm',96:'Thunderstorm + hail',99:'Thunderstorm + hail' };

export default async function handler(req, res) {
  try {
    const q = (req.query.q || '').toString().trim().slice(0, 80);
    if (!q) return res.status(400).json({ error: 'Missing ?q=city parameter' });
    const g = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`, { signal: AbortSignal.timeout(10000) });
    const gj = await g.json();
    if (!gj.results || !gj.results.length) return res.status(404).json({ error: 'Place not found' });
    const p = gj.results[0];
    const w = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`, { signal: AbortSignal.timeout(10000) });
    const wj = await w.json();
    const c = wj.current || {};
    res.setHeader('Cache-Control', 'public, max-age=600');
    res.status(200).json({
      place: p.name, region: p.admin1 || '', country: p.country || '',
      current: {
        temp_c: c.temperature_2m, feels_like_c: c.apparent_temperature,
        humidity: c.relative_humidity_2m, wind_kph: c.wind_speed_10m,
        desc: CODE_MAP[c.weather_code] || '—',
      },
      daily: (wj.daily?.time || []).map((d, i) => ({
        date: d,
        max_c: wj.daily.temperature_2m_max[i], min_c: wj.daily.temperature_2m_min[i],
        desc: CODE_MAP[wj.daily.weather_code[i]] || '—',
      })),
    });
  } catch (e) {
    res.status(502).json({ error: 'Weather service unavailable right now. Please try again later.' });
  }
}
