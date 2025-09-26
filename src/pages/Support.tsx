import React from 'react';
import SupportForm from '../components/SupportForm';

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('ashram-user') || 'null');
  } catch {
    return null;
  }
}

export default function SupportPage() {
  const user = getCurrentUser();
  if (!user) {
    return <div className="text-ashram-accent mt-8">Please log in to raise a support ticket.</div>;
  }
  if (user.role !== 'public') {
    return <div className="text-ashram-accent mt-8">Support tickets are for public users only.</div>;
  }
  return <SupportForm />;
} 