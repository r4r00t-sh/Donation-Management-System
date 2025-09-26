import React from 'react';
import StaffTicketForm from '../components/StaffTicketForm';

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('ashram-user') || 'null');
  } catch {
    return null;
  }
}

export default function StaffTicketsPage() {
  const user = getCurrentUser();
  if (!user) {
    return <div className="text-ashram-accent mt-8">Please log in as staff to raise a staff ticket.</div>;
  }
  if (user.role !== 'staff') {
    return <div className="text-ashram-accent mt-8">Only staff can raise staff tickets.</div>;
  }
  return <StaffTicketForm />;
} 