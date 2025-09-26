import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export default function ThemeManager() {
  const [themes, setThemes] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [colors, setColors] = useState(['', '', '', '']);
  const jwt = localStorage.getItem('jwt');

  // Fetch all themes
  useEffect(() => {
    fetchThemes();
    // eslint-disable-next-line
  }, []);

  async function fetchThemes() {
    try {
      const res = await fetch(`${API}/api/themes`, { headers: { Authorization: `Bearer ${jwt}` } });
      if (res.ok) {
        const data = await res.json();
        setThemes(data);
      }
    } catch {}
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name || colors.some(c => !c)) return;
    const res = await fetch(`${API}/api/theme`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        primary_color: colors[0],
        accent_color: colors[1],
        pink_color: colors[2],
        light_color: colors[3]
      })
    });
    if (res.ok) {
      setName('');
      setColors(['', '', '', '']);
      alert('Theme added and set as active!');
      fetchThemes(); // Refresh theme list
    } else {
      const err = await res.json();
      alert(err.error || 'Error adding theme');
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this theme?')) return;
    const res = await fetch(`${API}/api/theme/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${jwt}` }
    });
    if (res.ok) {
      alert('Theme deleted');
      fetchThemes();
    } else {
      const err = await res.json();
      alert(err.error || 'Error deleting theme');
    }
  }

  return (
    <div className="bg-white/90 rounded-xl shadow p-6 w-full max-w-lg mb-6">
      <h3 className="text-lg font-semibold text-ashram-primary mb-2">Theme Manager (Admin)</h3>
      <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-4">
        <input className="input" placeholder="Theme Name" value={name} onChange={e => setName(e.target.value)} required />
        <div className="flex gap-2">
          {['Primary', 'Accent', 'Pink', 'Light'].map((label, i) => (
            <input
              key={label}
              className="input w-24"
              type="color"
              value={colors[i]}
              onChange={e => setColors(c => c.map((v, idx) => idx === i ? e.target.value : v))}
              required
              title={label}
            />
          ))}
        </div>
        <button type="submit" className="bg-ashram-primary text-white px-4 py-2 rounded hover:bg-ashram-accent transition">Add Palette</button>
      </form>
      {/* List all themes */}
      <div>
        <h4 className="text-ashram-primary font-medium mb-2">All Themes</h4>
        {themes.length === 0 && <div className="text-ashram-accent">No themes yet.</div>}
        {themes.map((t: any) => (
          <div key={t.id} className="flex items-center gap-2 mb-2">
            <span className="font-medium text-ashram-primary mr-2">{t.name}</span>
            {[t.primary_color, t.accent_color, t.pink_color, t.light_color].map((color: string, i: number) => (
              <span key={i} className="inline-block w-5 h-5 rounded-full border" style={{ background: color }}></span>
            ))}
            <button
              className="ml-2 text-xs text-red-500 underline"
              onClick={() => handleDelete(t.id)}
              title="Delete Theme"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 