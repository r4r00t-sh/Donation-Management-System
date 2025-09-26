import React, { useState } from 'react';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export default function SupportForm() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const jwt = localStorage.getItem('jwt');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!jwt) {
      alert('You must be logged in to raise a support ticket.');
      return;
    }
    const res = await fetch(`${API}/api/tickets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'support', subject, description })
    });
    if (res.ok) {
      setSubmitted(true);
      setSubject('');
      setDescription('');
    } else {
      const err = await res.json();
      alert(err.error || 'Error submitting ticket');
    }
  }

  if (submitted) {
    return <div className="bg-white/90 rounded-xl shadow p-6 w-full max-w-md text-ashram-primary">Support ticket submitted! Our team will contact you soon.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/90 rounded-xl shadow p-6 flex flex-col gap-3 w-full max-w-md">
      <h3 className="text-lg font-semibold text-ashram-primary mb-2">Raise a Support Ticket</h3>
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