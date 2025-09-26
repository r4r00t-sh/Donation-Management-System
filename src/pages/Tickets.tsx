import React, { useState } from 'react';
import TicketList from '../components/TicketList';
import TicketView from '../components/TicketView';
import { Ticket } from '../types/ticket';

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('ashram-user') || 'null');
  } catch {
    return null;
  }
}

export default function TicketsPage() {
  const user = getCurrentUser();
  const [selected, setSelected] = useState<Ticket | null>(null);
  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return <div className="text-ashram-accent mt-8">Only admin/staff can view tickets.</div>;
  }
  return (
    <>
      <TicketList onSelect={setSelected} />
      {selected && <TicketView ticket={selected} onClose={() => setSelected(null)} />}
    </>
  );
} 