// Receipts page: manages receipt state, shows form, list, and view modal. Uses localStorage for persistence.
import React, { useState, useEffect } from 'react';
import ReceiptForm from '../components/ReceiptForm';
import ReceiptList from '../components/ReceiptList';
import ReceiptView from '../components/ReceiptView';
import { Plus } from 'lucide-react';
import FamilyBox from '../components/FamilyBox';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function AnalyticsCard({ receipts }: { receipts: any[] }) {
  // Calculate analytics
  const today = new Date().toISOString().slice(0, 10);
  const totalToday = receipts.filter(r => r.date === today).reduce((sum, r) => sum + Number(r.amount), 0);
  const highest = receipts.reduce((max, r) => (Number(r.amount) > Number(max.amount) ? r : max), receipts[0] || { amount: 0 });
  return (
    <div className="bg-white/95 rounded-2xl shadow-xl p-6 mb-4 w-full max-w-xs">
      <h4 className="text-lg font-semibold text-ashram-primary mb-2">Analytics</h4>
      <div className="text-sm mb-1">Today's Total: <span className="font-bold">₹{totalToday.toFixed(2)}</span></div>
      <div className="text-sm mb-1">Today's Highest: <span className="font-bold">₹{highest.amount ? Number(highest.amount).toFixed(2) : '0.00'}</span></div>
    </div>
  );
}

function UserSearchBox({ onUserSelect }: { onUserSelect: (user: any) => void }) {
  const [search, setSearch] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const jwt = localStorage.getItem('jwt');
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`${API}/api/search-person?query=${encodeURIComponent(search)}`, { headers: { Authorization: `Bearer ${jwt}` } });
    const data = await res.json();
    setResult(data.person ? { ...data.person, type: data.type } : null);
    setLoading(false);
  }
  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex gap-2 mb-2">
        <input className="input flex-1" placeholder="Search by phone/email/name" value={search} onChange={e => setSearch(e.target.value)} />
        <button type="submit" className="bg-ashram-primary text-white px-2 py-1 rounded text-xs">Search</button>
      </form>
      {loading && <div className="text-xs text-ashram-accent">Searching...</div>}
      {result ? (
        <div className="bg-white rounded shadow p-3 mb-2">
          <div className="font-semibold text-ashram-primary mb-1">{result.name}</div>
          <div className="text-xs mb-1">Email: {result.email || '-'}</div>
          <div className="text-xs mb-1">Phone: {result.phone || '-'}</div>
          <button className="text-xs bg-ashram-primary text-white px-2 py-1 rounded" onClick={() => onUserSelect(result)}>Select</button>
        </div>
      ) : (
        <div className="text-xs text-ashram-accent">No user/member found.</div>
      )}
    </div>
  );
}

function FamilyMembersList({ user, onAddMember, selectedMembers }: { user: any, onAddMember: (member: any) => void, selectedMembers: any[] }) {
  const [members, setMembers] = useState<any[]>([]);
  const jwt = localStorage.getItem('jwt');
  useEffect(() => {
    if (user && user.family_id) {
      fetch(`${API}/api/members?family_id=${user.family_id}`, { headers: { Authorization: `Bearer ${jwt}` } })
        .then(res => res.json())
        .then(members => setMembers(Array.isArray(members) ? members : []));
    } else {
      setMembers([]);
    }
  }, [user, jwt]);
  if (!user) return null;
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-ashram-primary mb-2">Family Members</h4>
      {members.length === 0 ? <div className="text-xs text-ashram-accent">No family members found.</div> : (
        <ul className="text-xs">
          {members.map((m: any) => {
            const alreadyAdded = selectedMembers.some((sm: any) => sm.id === m.id);
            return (
              <li key={m.id} className="mb-1 flex items-center justify-between">
                <span>{m.name} {m.star ? `(${m.star})` : ''} {m.dob}</span>
                <button
                  className={`ml-2 text-xs px-2 py-1 rounded ${alreadyAdded ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-ashram-primary text-white'}`}
                  disabled={alreadyAdded}
                  onClick={() => onAddMember(m)}
                >
                  {alreadyAdded ? 'Added' : 'Add'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SelectedMembersList({ selectedMembers, onRemove }: { selectedMembers: any[], onRemove: (id: string) => void }) {
  if (!selectedMembers.length) return null;
  return (
    <div className="mt-4 w-full">
      <h4 className="text-sm font-semibold text-ashram-primary mb-2">Selected Family Members</h4>
      <table className="w-full text-xs border border-ashram-light rounded mb-2">
        <thead>
          <tr className="bg-ashram-light">
            <th className="px-2 py-1 text-left">Name</th>
            <th className="px-2 py-1 text-left">Star</th>
            <th className="px-2 py-1 text-left">DOB</th>
            <th className="px-2 py-1"></th>
          </tr>
        </thead>
        <tbody>
          {selectedMembers.map((m: any) => (
            <tr key={m.id} className="border-t">
              <td className="px-2 py-1">{m.name}</td>
              <td className="px-2 py-1">{m.star || '-'}</td>
              <td className="px-2 py-1">{m.dob || '-'}</td>
              <td className="px-2 py-1">
                <button className="text-xs text-red-500 underline" onClick={() => onRemove(m.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReceiptsPage() {
  const [selected, setSelected] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [donorName, setDonorName] = useState('');

  useEffect(() => {
    if (selectedUser && selectedUser.name) {
      setDonorName(selectedUser.name);
    }
  }, [selectedUser]);

  useEffect(() => {
    // Fetch all receipts for analytics and pass to ReceiptList
    const jwt = localStorage.getItem('jwt');
    fetch(`${API}/api/receipts`, {
      headers: { Authorization: `Bearer ${jwt}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReceipts(data);
        else setReceipts([]);
      });
  }, [showForm]);

  function handleAdd() {
    // Refetch receipts for analytics
    const jwt = localStorage.getItem('jwt');
    fetch(`${API}/api/receipts`, {
      headers: { Authorization: `Bearer ${jwt}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReceipts(data);
        else setReceipts([]);
      });
  }

  function handleSelect(receipt: any) {
    setSelected(receipt);
  }

  function handleCloseView() {
    setSelected(null);
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-ashram-light">
      <div className="flex flex-col md:flex-row items-start justify-center w-full px-2 md:px-8 mt-4 mb-2 gap-8">
        {/* Left: Table */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-2xl font-bold text-ashram-primary mb-4">Receipts</h2>
          <div className="flex-1 min-w-0 overflow-x-auto">
            <ReceiptList onSelect={handleSelect} />
          </div>
        </div>
        {/* Right: Add Receipt button and Analytics */}
        <div className="flex flex-col items-end w-full md:w-[320px] max-w-xs">
          <button
            className="mb-4 bg-ashram-primary text-white rounded-lg px-5 py-2 text-lg font-semibold shadow-lg hover:bg-ashram-accent transition flex items-center gap-2"
            onClick={() => setShowForm(true)}
            title="Add Receipt"
            style={{ alignSelf: 'flex-end' }}
          >
            <Plus className="w-5 h-5" /> Add Receipt
          </button>
          <AnalyticsCard receipts={receipts} />
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-0 flex flex-col md:flex-row w-full max-w-4xl mx-auto">
            {/* Left: Receipt Form */}
            <div className="flex-1 p-8 min-w-[320px]">
              <h3 className="text-xl font-semibold text-ashram-primary mb-4">Add / Edit Receipt</h3>
              <ReceiptForm onAdd={() => { setShowForm(false); handleAdd(); }} mode="receipt" showFamilyBox={false} selectedMember={selectedMember} selectedMembers={selectedMembers} donorName={donorName} />
            </div>
            {/* Right: User Search and Family Members */}
            <div className="w-full md:w-[350px] max-w-sm bg-ashram-light rounded-r-2xl p-8 flex flex-col items-start border-l border-ashram-light">
              <h3 className="text-lg font-semibold text-ashram-primary mb-2">Search Users</h3>
              <UserSearchBox onUserSelect={setSelectedUser} />
              {selectedUser && <FamilyMembersList user={selectedUser} onAddMember={(m) => {
                setSelectedMembers((prev) => prev.some((sm: any) => sm.id === m.id) ? prev : [...prev, m]);
              }} selectedMembers={selectedMembers} />}
              <SelectedMembersList selectedMembers={selectedMembers} onRemove={(id) => setSelectedMembers((prev) => prev.filter((m: any) => m.id !== id))} />
            </div>
            <button className="absolute top-4 right-4 text-ashram-accent text-2xl font-bold" onClick={() => setShowForm(false)}>&times;</button>
          </div>
        </div>
      )}
      {selected && <ReceiptView receipt={selected} onClose={handleCloseView} />}
    </div>
  );
} 