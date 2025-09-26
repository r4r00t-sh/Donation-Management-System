import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export default function ReceiptList({ onSelect }: { onSelect: (receipt: any) => void }) {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [membersMap, setMembersMap] = useState<{ [key: string]: any[] }>({});
  const jwt = localStorage.getItem('jwt');
  const user = (() => { try { return JSON.parse(localStorage.getItem('ashram-user') || '{}'); } catch { return {}; } })();
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    fetch(`${API}/api/receipts`, {
      headers: { Authorization: `Bearer ${jwt}` }
    })
      .then(res => res.json())
      .then(async data => {
        if (Array.isArray(data)) {
          setReceipts(data);
          // Fetch members for each receipt
          const map: { [key: string]: any[] } = {};
          await Promise.all(data.map(async (r: any) => {
            const res = await fetch(`${API}/api/receipt-members?receipt_id=${r.id}`, { headers: { Authorization: `Bearer ${jwt}` } });
            const members = await res.json();
            map[r.id] = Array.isArray(members) ? members : [];
          }));
          setMembersMap(map);
        } else setReceipts([]);
      });
  }, [jwt]);

  function handleDelete(id: string) {
    if (!window.confirm('Delete this receipt?')) return;
    fetch(`${API}/api/receipts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${jwt}` }
    }).then(res => {
      if (res.ok) setReceipts(receipts.filter(r => r.id !== id));
    });
  }

  function handleBulkDelete() {
    if (!window.confirm('Delete selected receipts?')) return;
    fetch(`${API}/api/receipts/bulk-delete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds })
    }).then(res => {
      if (res.ok) {
        setReceipts(receipts.filter(r => !selectedIds.includes(r.id)));
        setSelectedIds([]);
      }
    });
  }

  function handleSelect(id: string, checked: boolean) {
    setSelectedIds(checked ? [...selectedIds, id] : selectedIds.filter(x => x !== id));
  }
  function handleSelectAll(checked: boolean) {
    setSelectedIds(checked ? receipts.map(r => r.id) : []);
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const safeReceipts = Array.isArray(receipts) ? receipts : [];

  if (safeReceipts.length === 0) {
    return <div className="text-ashram-accent">No receipts yet.</div>;
  }
  return (
    <div className="w-full max-w-5xl mt-4">
      {isAdmin && selectedIds.length > 0 && (
        <button className="mb-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-700" onClick={handleBulkDelete}>
          Delete Selected
        </button>
      )}
      <table className="min-w-full bg-white/90 rounded-xl shadow overflow-hidden">
        <thead>
          <tr className="bg-ashram-pink text-ashram-primary">
            {isAdmin && (
              <th className="px-3 py-2 text-left">
                <input type="checkbox" checked={selectedIds.length === receipts.length} onChange={e => handleSelectAll(e.target.checked)} />
              </th>
            )}
            <th className="px-3 py-2 text-left">#</th>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Amount</th>
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">Method</th>
            <th className="px-3 py-2 text-left">Remarks</th>
            <th className="px-3 py-2 text-left">Members & Poojas</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {safeReceipts.map((r, i) => (
            <tr key={r.id} className="border-b last:border-b-0">
              {isAdmin && (
                <td className="px-3 py-2">
                  <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={e => handleSelect(r.id, e.target.checked)} />
                </td>
              )}
              <td className="px-3 py-2">{r.receipt_number}</td>
              <td className="px-3 py-2">{r.donor_name}</td>
              <td className="px-3 py-2">₹{(Number(r.amount) || 0).toFixed(2)}</td>
              <td className="px-3 py-2">{formatDate(r.date)}</td>
              <td className="px-3 py-2">{r.payment_method}</td>
              <td className="px-3 py-2">{r.remarks || '-'}</td>
              <td className="px-3 py-2">
                {membersMap[r.id] && membersMap[r.id].length > 0 ? (
                  membersMap[r.id].map((m: any) => `${m.name} (${m.pooja_type})`).join(', ')
                ) : '-'}
              </td>
              <td className="px-3 py-2 flex gap-2">
                <button className="text-ashram-primary underline hover:text-ashram-accent" onClick={() => onSelect(r)}>
                  View/Print
                </button>
                {isAdmin && (
                  <button className="text-red-500 underline hover:text-red-700" onClick={() => handleDelete(r.id)}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 