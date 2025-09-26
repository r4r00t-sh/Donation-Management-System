import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export default function ThemeSelector() {
  const [themes, setThemes] = useState<any[]>([]);
  const [activeTheme, setActiveTheme] = useState<any>(null);
  const jwt = localStorage.getItem('jwt');
  const user = (() => { try { return JSON.parse(localStorage.getItem('ashram-user') || '{}'); } catch { return {}; } })();
  const isAdmin = user && user.role === 'admin';

  // Fetch all themes and the active theme
  useEffect(() => {
    async function fetchThemes() {
      // Fetch all themes (admin only, so fallback to just active theme if not admin)
      let allThemes = [];
      try {
        const res = await fetch(`${API}/api/themes`, { headers: { Authorization: `Bearer ${jwt}` } });
        if (res.ok) allThemes = await res.json();
      } catch {}
      setThemes(allThemes);
    }
    async function fetchActiveTheme() {
      const res = await fetch(`${API}/api/theme`);
      const theme = await res.json();
      setActiveTheme(theme);
      if (theme) {
        document.documentElement.style.setProperty('--ashram-primary', theme.primary_color);
        document.documentElement.style.setProperty('--ashram-accent', theme.accent_color);
        document.documentElement.style.setProperty('--ashram-pink', theme.pink_color);
        document.documentElement.style.setProperty('--ashram-light', theme.light_color);
      }
    }
    fetchThemes();
    fetchActiveTheme();
  }, [jwt]);

  // Handle theme change
  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    if (!id) return;
    await fetch(`${API}/api/theme/activate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    // Refetch active theme
    const res = await fetch(`${API}/api/theme`);
    const theme = await res.json();
    setActiveTheme(theme);
    if (theme) {
      document.documentElement.style.setProperty('--ashram-primary', theme.primary_color);
      document.documentElement.style.setProperty('--ashram-accent', theme.accent_color);
      document.documentElement.style.setProperty('--ashram-pink', theme.pink_color);
      document.documentElement.style.setProperty('--ashram-light', theme.light_color);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-ashram-primary font-medium">Theme:</span>
      {isAdmin && themes.length > 0 && activeTheme && (
        <select className="input ml-2" value={activeTheme.id} onChange={handleChange}>
          {themes.map((t: any) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      )}
      {activeTheme && (
        <div className="flex gap-1 ml-2">
          {[activeTheme.primary_color, activeTheme.accent_color, activeTheme.pink_color, activeTheme.light_color].map((color, i) => (
            <span key={i} className="inline-block w-5 h-5 rounded-full border" style={{ background: color }}></span>
          ))}
        </div>
      )}
    </div>
  );
} 