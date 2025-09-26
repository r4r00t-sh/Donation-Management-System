import React, { useState, useEffect } from 'react';
import { Receipt } from '../types/receipt';
import ThemeManager from '../components/ThemeManager';
import CustomFieldBuilder from '../components/CustomFieldBuilder';
import UserManager from '../components/UserManager';
import PaymentConfigForm from '../components/PaymentConfigForm';
import BackupRestorePanel from '../components/BackupRestorePanel';

const STORAGE_KEY = 'ashram-receipts';

function exportCSV(receipts: Receipt[]) {
  if (!receipts.length) return;
  const header = ['Receipt Number', 'Donor Name', 'Amount', 'Date', 'Payment Method', 'Remarks'];
  const rows = receipts.map(r => [
    r.receiptNumber,
    r.donorName,
    r.amount,
    r.date,
    r.paymentMethod,
    r.remarks || ''
  ]);
  const csv = [header, ...rows].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ashram-receipts-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const printerTips = [
  'Connect your printer via USB or network and install the latest drivers from the manufacturer.',
  'For thermal printers, set paper size to 80mm or as required.',
  'In browser print dialog, set margins to None/Minimum and enable Background graphics.',
  'Test print from Windows settings before printing receipts.',
  'For network access, use npm run dev -- --host and print from any device on the LAN.'
];

function isAdmin() {
  try {
    const user = JSON.parse(localStorage.getItem('ashram-user') || 'null');
    return user && user.role === 'admin';
  } catch {
    return false;
  }
}

function BranchManager() {
  const [branches, setBranches] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const jwt = localStorage.getItem('jwt');

  function fetchBranches() {
    fetch(`/api/branches`, { headers: { Authorization: `Bearer ${jwt}` } })
      .then(res => res.json()).then(setBranches).catch(() => setBranches([]));
  }
  useEffect(fetchBranches, [jwt]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    fetch(`/api/branches`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    }).then(() => { setName(''); fetchBranches(); });
  }
  function handleEdit(id: string) {
    const b = branches.find((b: any) => b.id === id);
    if (!b) return;
    setEditId(id); setEditName(b.name);
  }
  function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    fetch(`/api/branches/${editId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName })
    }).then(() => { setEditId(null); setEditName(''); fetchBranches(); });
  }
  function handleDelete(id: string) {
    fetch(`/api/branches/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${jwt}` } })
      .then(fetchBranches);
  }
  return (
    <div className="bg-white/90 rounded-xl shadow p-6 w-full mb-6">
      <h3 className="text-lg font-semibold text-ashram-primary mb-2">Branches</h3>
      <form onSubmit={handleAdd} className="flex gap-2 mb-2">
        <input className="input flex-1" placeholder="Branch Name" value={name} onChange={e => setName(e.target.value)} required />
        <button type="submit" className="bg-ashram-primary text-white px-3 py-1 rounded">Add</button>
      </form>
      {branches.map((b: any) => (
        <div key={b.id} className="flex items-center gap-2 mb-1">
          {editId === b.id ? (
            <form onSubmit={handleEditSave} className="flex gap-2 items-center">
              <input className="input w-32" value={editName} onChange={e => setEditName(e.target.value)} required />
              <button type="submit" className="text-xs bg-ashram-primary text-white px-2 py-1 rounded">Save</button>
              <button type="button" className="text-xs text-gray-500 underline" onClick={() => setEditId(null)}>Cancel</button>
            </form>
          ) : (
            <>
              <span className="font-medium text-ashram-primary mr-2">{b.name}</span>
              <button className="text-xs text-blue-500 underline" onClick={() => handleEdit(b.id)}>Edit</button>
              <button className="text-xs text-red-500 underline" onClick={() => handleDelete(b.id)}>Delete</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function BookingTypeManager() {
  const [types, setTypes] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const jwt = localStorage.getItem('jwt');

  function fetchTypes() {
    fetch(`/api/booking-types`, { headers: { Authorization: `Bearer ${jwt}` } })
      .then(res => res.json()).then(setTypes).catch(() => setTypes([]));
  }
  useEffect(fetchTypes, [jwt]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    fetch(`/api/booking-types`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    }).then(() => { setName(''); fetchTypes(); });
  }
  function handleEdit(id: string) {
    const t = types.find((t: any) => t.id === id);
    if (!t) return;
    setEditId(id); setEditName(t.name);
  }
  function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    fetch(`/api/booking-types/${editId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName })
    }).then(() => { setEditId(null); setEditName(''); fetchTypes(); });
  }
  function handleDelete(id: string) {
    fetch(`/api/booking-types/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${jwt}` } })
      .then(fetchTypes);
  }
  return (
    <div className="bg-white/90 rounded-xl shadow p-6 w-full mb-6">
      <h3 className="text-lg font-semibold text-ashram-primary mb-2">Booking Types</h3>
      <form onSubmit={handleAdd} className="flex gap-2 mb-2">
        <input className="input flex-1" placeholder="Booking Type Name" value={name} onChange={e => setName(e.target.value)} required />
        <button type="submit" className="bg-ashram-primary text-white px-3 py-1 rounded">Add</button>
      </form>
      {types.map((t: any) => (
        <div key={t.id} className="flex items-center gap-2 mb-1">
          {editId === t.id ? (
            <form onSubmit={handleEditSave} className="flex gap-2 items-center">
              <input className="input w-32" value={editName} onChange={e => setEditName(e.target.value)} required />
              <button type="submit" className="text-xs bg-ashram-primary text-white px-2 py-1 rounded">Save</button>
              <button type="button" className="text-xs text-gray-500 underline" onClick={() => setEditId(null)}>Cancel</button>
            </form>
          ) : (
            <>
              <span className="font-medium text-ashram-primary mr-2">{t.name}</span>
              <button className="text-xs text-blue-500 underline" onClick={() => handleEdit(t.id)}>Edit</button>
              <button className="text-xs text-red-500 underline" onClick={() => handleDelete(t.id)}>Delete</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

const DashboardSummary: React.FC<{ receipts: Receipt[] }> = ({ receipts }) => {
  const totalReceipts = receipts.length;
  const totalAmount = receipts.reduce((sum, r) => sum + Number(r.amount), 0);
  return (
    <div className="bg-white/90 rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center mb-6">
      <h3 className="text-lg font-semibold text-ashram-primary mb-2">Dashboard Summary</h3>
      <div className="flex gap-8">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-ashram-primary">{totalReceipts}</span>
          <span className="text-xs text-ashram-accent">Receipts</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-ashram-primary">₹{totalAmount.toFixed(2)}</span>
          <span className="text-xs text-ashram-accent">Total Amount</span>
        </div>
      </div>
    </div>
  );
};

const SectionCard: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode; adminOnly?: boolean }> = ({ title, children, icon, adminOnly }) => (
  <div className="bg-white/90 rounded-xl shadow p-6 w-full mb-6">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <h3 className="text-lg font-semibold text-ashram-primary">{title}</h3>
      {adminOnly && <span className="ml-2 text-xs bg-ashram-primary text-white px-2 py-1 rounded">Admin</span>}
    </div>
    {children}
  </div>
);

const navSections = [
  { id: 'themes', label: 'Themes' },
  { id: 'custom-fields', label: 'Custom Fields' },
  { id: 'users', label: 'Users' },
  { id: 'payment', label: 'Payment' },
  { id: 'backup', label: 'Backup/Restore' },
  { id: 'branches', label: 'Branches' },
  { id: 'booking-types', label: 'Booking Types' },
  { id: 'export', label: 'Export' },
  { id: 'help', label: 'Help' },
];

const SettingsPage: React.FC = () => {
  const [receipts, setReceipts] = React.useState<Receipt[]>([]);
  const [activeSection, setActiveSection] = React.useState<string>('themes');

  React.useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) setReceipts(JSON.parse(data));
  }, []);

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-ashram-light">
      {/* Sidebar Navigation */}
      <nav className="md:w-56 w-full md:sticky top-0 bg-white/90 md:h-screen flex md:flex-col flex-row gap-2 md:gap-0 md:py-8 md:px-4 px-2 py-2 shadow md:mr-8 z-10">
        {navSections.map((section) => (
          <button
            key={section.id}
            className={`text-left w-full px-3 py-2 rounded transition font-medium text-ashram-primary hover:bg-ashram-accent/10 ${activeSection === section.id ? 'bg-ashram-accent/20' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </nav>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center w-full max-w-3xl mx-auto py-8 px-2 md:px-0">
        <DashboardSummary receipts={receipts} />
        {activeSection === 'themes' && isAdmin() && (
          <SectionCard title="Themes" adminOnly>
            <ThemeManager />
          </SectionCard>
        )}
        {activeSection === 'custom-fields' && isAdmin() && (
          <SectionCard title="Custom Fields" adminOnly>
            <CustomFieldBuilder />
          </SectionCard>
        )}
        {activeSection === 'users' && isAdmin() && (
          <SectionCard title="Users" adminOnly>
            <UserManager />
          </SectionCard>
        )}
        {activeSection === 'payment' && isAdmin() && (
          <SectionCard title="Payment Configuration" adminOnly>
            <PaymentConfigForm />
          </SectionCard>
        )}
        {activeSection === 'backup' && isAdmin() && (
          <SectionCard title="Backup & Restore" adminOnly>
            <BackupRestorePanel />
          </SectionCard>
        )}
        {activeSection === 'branches' && isAdmin() && (
          <SectionCard title="Branches" adminOnly>
            <BranchManager />
          </SectionCard>
        )}
        {activeSection === 'booking-types' && isAdmin() && (
          <SectionCard title="Booking Types" adminOnly>
            <BookingTypeManager />
          </SectionCard>
        )}
        {activeSection === 'export' && (
          <SectionCard title="Export Receipts">
            <button
              className="bg-ashram-primary text-white font-semibold px-4 py-2 rounded hover:bg-ashram-accent transition mb-2"
              onClick={() => exportCSV(receipts)}
              disabled={!receipts.length}
            >
              Download All Receipts as CSV
            </button>
            {!receipts.length && <div className="text-ashram-accent text-sm">No receipts to export.</div>}
          </SectionCard>
        )}
        {activeSection === 'help' && (
          <SectionCard title="Printer Setup & Tips (Windows 11)">
            <ul className="list-disc pl-6 text-ashram-primary text-sm">
              {printerTips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          </SectionCard>
        )}
      </div>
    </div>
  );
};

export default SettingsPage; 