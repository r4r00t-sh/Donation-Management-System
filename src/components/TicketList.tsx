import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export default function TicketList({ onSelect }: { onSelect: (ticket: any) => void }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const jwt = localStorage.getItem('jwt');

  useEffect(() => {
    fetch(`${API}/api/tickets`, {
      headers: { Authorization: `Bearer ${jwt}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTickets(data);
        else setTickets([]);
      });
  }, [jwt]);

  const safeTickets = Array.isArray(tickets) ? tickets : [];

  return (
    <div className="bg-white/90 rounded-xl shadow p-6 w-full max-w-2xl mb-6">
      <h3 className="text-lg font-semibold text-ashram-primary mb-2">All Tickets</h3>
      {safeTickets.length === 0 && <div className="text-ashram-accent">No tickets yet.</div>}
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-ashram-accent">
            <th className="text-left px-2">Subject</th>
            <th className="text-left px-2">Type</th>
            <th className="text-left px-2">Status</th>
            <th className="text-left px-2">User</th>
            <th className="text-left px-2">Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {safeTickets.map(ticket => (
            <tr key={ticket.id} className="border-b last:border-b-0">
              <td className="px-2 py-1">{ticket.subject}</td>
              <td className="px-2 py-1">{ticket.type}</td>
              <td className="px-2 py-1">{ticket.status}</td>
              <td className="px-2 py-1">{ticket.created_by}</td>
              <td className="px-2 py-1">{new Date(ticket.created_at).toLocaleString()}</td>
              <td className="px-2 py-1">
                <button className="text-ashram-primary underline hover:text-ashram-accent" onClick={() => onSelect(ticket)}>
                  View/Respond
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 