import React, { useRef } from 'react';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export default function BackupRestorePanel() {
  const jwt = localStorage.getItem('jwt');
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleExport() {
    const res = await fetch(`${API}/api/backup/export`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ashram-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    const res = await fetch(`${API}/api/backup/import`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      alert('Restore successful!');
    } else {
      const err = await res.json();
      alert(err.error || 'Restore failed');
    }
  }

  return (
    <div className="bg-white/90 rounded-xl shadow p-6 w-full max-w-lg mb-6">
      <h3 className="text-lg font-semibold text-ashram-primary mb-2">Backup & Restore (Admin)</h3>
      <button onClick={handleExport} className="bg-ashram-primary text-white px-4 py-2 rounded hover:bg-ashram-accent transition mb-2">Export Backup</button>
      <div className="mt-2">
        <input type="file" accept="application/json" ref={fileInput} style={{ display: 'none' }} onChange={handleImport} />
        <button onClick={() => fileInput.current?.click()} className="bg-ashram-accent text-white px-4 py-2 rounded hover:bg-ashram-primary transition">Import/Restore</button>
      </div>
    </div>
  );
} 