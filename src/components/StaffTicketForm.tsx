import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Ticket } from '../types/ticket';

const STORAGE_KEY = 'ashram-tickets';

function getTickets(): Ticket[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}
function saveTickets(tickets: Ticket[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}
function getCurrentUserId(): string | null {
  try {
    const user = JSON.parse(localStorage.getItem('ashram-user') || 'null');
    return user?.id || null;
  } catch {
    return null;
  }
}

export default function StaffTicketForm() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const userId = getCurrentUserId();
    if (!userId) {
      alert('You must be logged in as staff to raise a staff ticket.');
      return;
    }
    const newTicket: Ticket = {
      id: uuidv4(),
      type: 'staff',
      createdBy: userId,
      subject,
      description,
      status: 'open',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    saveTickets([newTicket, ...getTickets()]);
    setSubmitted(true);
    setSubject('');
    setDescription('');
  }

  if (submitted) {
    return <div className="bg-white/90 rounded-xl shadow p-6 w-full max-w-md text-ashram-primary">Staff ticket submitted!</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/90 rounded-xl shadow p-6 flex flex-col gap-3 w-full max-w-md">
      <h3 className="text-lg font-semibold text-ashram-primary mb-2">Raise a Staff Ticket</h3>
      <div>
        <label className="block text-ashram-primary font-medium mb-1">Subject</label>
        <input className="input" value={subject} onChange={e => setSubject(e.target.value)} required />
      </div>
      <div>
        <label className="block text-ashram-primary font-medium mb-1">Description</label>
        <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} required />
      </div>
      <button type="submit" className="bg-ashram-primary text-white px-4 py-2 rounded hover:bg-ashram-accent transition">Submit Ticket</button>
    </form>
  );
} 