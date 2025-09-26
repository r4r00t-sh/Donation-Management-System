import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export default function TicketView({ ticket, onClose }: { ticket: any; onClose: () => void }) {
  const [details, setDetails] = useState<any>(ticket);
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState(ticket.status);
  const jwt = localStorage.getItem('jwt');

  useEffect(() => {
    fetch(`${API}/api/tickets/${ticket.id}`, {
      headers: { Authorization: `Bearer ${jwt}` }
    })
      .then(res => res.json())
      .then(setDetails);
  }, [ticket.id, jwt]);

  async function handleReply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!msg.trim()) return;
    const res = await fetch(`${API}/api/tickets/${ticket.id}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: msg })
    });
    if (res.ok) {
      setMsg('');
      // Refresh ticket details
      const updated = await fetch(`${API}/api/tickets/${ticket.id}`, { headers: { Authorization: `Bearer ${jwt}` } }).then(r => r.json());
      setDetails(updated);
    } else {
      const err = await res.json();
      alert(err.error || 'Error sending message');
    }
  }

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setStatus(e.target.value);
    await fetch(`${API}/api/tickets/${ticket.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: e.target.value })
    });
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md print:w-full print:max-w-full print:shadow-none print:p-2">
        <h2 className="text-xl font-bold text-ashram-primary mb-4">Ticket: {details.subject}</h2>
        <div className="mb-2"><b>Status:</b> <select className="input w-32" value={status} onChange={handleStatusChange}>
          {['open', 'in_progress', 'resolved', 'closed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select></div>
        <div className="mb-2"><b>Type:</b> {details.type}</div>
        <div className="mb-2"><b>Created By:</b> {details.created_by}</div>
        <div className="mb-2"><b>Created At:</b> {new Date(details.created_at).toLocaleString()}</div>
        <div className="mb-4">
          <b>Description:</b>
          <div className="bg-ashram-light rounded p-2 mt-1 text-sm">{details.description}</div>
        </div>
        <div className="mb-4">
          <b>Messages:</b>
          <div className="bg-ashram-light rounded p-2 mt-1 text-sm max-h-40 overflow-y-auto">
            {details.messages && details.messages.length === 0 && <div className="text-ashram-accent">No messages yet.</div>}
            {details.messages && details.messages.map((m: any) => (
              <div key={m.id} className="mb-2">
                <b>{m.sender_role}</b> <span className="text-xs text-ashram-accent">{new Date(m.timestamp).toLocaleString()}</span>
                <div>{m.message}</div>
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleReply} className="flex gap-2 mt-2">
          <input className="input flex-1" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a reply..." />
          <button type="submit" className="bg-ashram-primary text-white px-3 py-1 rounded">Send</button>
        </form>
        <div className="flex gap-2 mt-6 print:hidden">
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
} 