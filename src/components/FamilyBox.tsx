import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export default function FamilyBox({ mode, onSelectMember, onAddMember, onSelectMembers }: {
  mode: 'receipt' | 'booking',
  onSelectMember?: (member: any) => void,
  onAddMember?: (member: any) => void,
  onSelectMembers?: (members: any[]) => void
}) {
  const jwt = localStorage.getItem('jwt');
  const [user, setUser] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('ashram-user') || '{}'); } catch { return {}; }
  });
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', star: '', dob: '', phone: '', email: '' });
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);

  // Listen for changes to localStorage user (e.g., after family_id is set)
  useEffect(() => {
    function handleStorage() {
      try {
        setUser(JSON.parse(localStorage.getItem('ashram-user') || '{}'));
      } catch { setUser({}); }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  // Fetch family members when user or family_id changes
  useEffect(() => {
    if (user && user.family_id) {
      fetch(`${API}/api/members?family_id=${user.family_id}`, { headers: { Authorization: `Bearer ${jwt}` } })
        .then(res => res.json())
        .then(members => {
          setFamilyMembers([user, ...(Array.isArray(members) ? members : [])]);
        });
    }
  }, [jwt, user && user.family_id]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search) return;
    const res = await fetch(`${API}/api/users?search=${encodeURIComponent(search)}`, { headers: { Authorization: `Bearer ${jwt}` } });
    const found = await res.json();
    setSearchResults(Array.isArray(found) ? found : []);
  }

  async function handleAddMember() {
    if (!newMember.name) return;
    const res = await fetch(`${API}/api/members`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        family_id: user.family_id,
        name: newMember.name,
        star: newMember.star,
        dob: newMember.dob,
        phone: newMember.phone,
        email: newMember.email
      })
    });
    if (res.ok) {
      // Refetch family members
      const membersRes = await fetch(`${API}/api/members?family_id=${user.family_id}`, { headers: { Authorization: `Bearer ${jwt}` } });
      const members = await membersRes.json();
      const userRes = await fetch(`${API}/api/users/${user.id}`, { headers: { Authorization: `Bearer ${jwt}` } });
      const mainUser = await userRes.json();
      setFamilyMembers([mainUser, ...(Array.isArray(members) ? members : [])]);
      setShowAdd(false);
      setNewMember({ name: '', star: '', dob: '', phone: '', email: '' });
      if (onAddMember) onAddMember(newMember);
    } else {
      const err = await res.json();
      alert(err.error || 'Error adding member');
    }
  }

  function toggleMember(m: any) {
    let updated;
    if (selectedMembers.some((mem: any) => mem.id === m.id)) {
      updated = selectedMembers.filter((mem: any) => mem.id !== m.id);
    } else {
      updated = [...selectedMembers, m];
    }
    setSelectedMembers(updated);
    if (onSelectMembers) onSelectMembers(updated);
  }

  return (
    <div>
      {mode === 'receipt' && (
        <form onSubmit={handleSearch} className="flex gap-2 mb-2">
          <input className="input flex-1" placeholder="Search by phone/email/name" value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit" className="bg-ashram-primary text-white px-2 py-1 rounded text-xs">Search</button>
        </form>
      )}
      {mode === 'receipt' && searchResults.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-ashram-primary mb-1">Search Results:</div>
          <ul className="text-xs">
            {searchResults.map((m: any) => (
              <li key={m.id} className="flex items-center justify-between mb-1">
                <span>{m.name} {m.star ? `(${m.star})` : ''}</span>
                <button className="text-xs bg-ashram-primary text-white px-2 py-1 rounded ml-2" onClick={() => onSelectMember && onSelectMember(m)}>Add</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <span className="text-ashram-primary font-medium">Family Members</span>
        <button type="button" className="text-xs bg-ashram-primary text-white px-2 py-1 rounded" onClick={() => setShowAdd(v => !v)}>+ Add</button>
      </div>
      <ul className="text-xs mb-2">
        {familyMembers.map((m: any) => (
          <li key={m.id} className="flex items-center justify-between mb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedMembers.some((mem: any) => mem.id === m.id)} onChange={() => toggleMember(m)} />
              <span>{m.name} {m.star ? `(${m.star})` : ''}</span>
            </label>
          </li>
        ))}
      </ul>
      {selectedMembers.length > 0 && (
        <div className="mt-2 text-xs text-green-700">Selected: {selectedMembers.map((m: any) => m.name).join(', ')}</div>
      )}
      {showAdd && (
        <div className="mt-2 p-2 bg-white rounded shadow">
          <input className="input mb-1" placeholder="Name" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
          <input className="input mb-1" placeholder="Star" value={newMember.star} onChange={e => setNewMember({ ...newMember, star: e.target.value })} />
          <input className="input mb-1" placeholder="DOB" type="date" value={newMember.dob} onChange={e => setNewMember({ ...newMember, dob: e.target.value })} />
          <input className="input mb-1" placeholder="Phone" value={newMember.phone} onChange={e => setNewMember({ ...newMember, phone: e.target.value })} />
          <input className="input mb-1" placeholder="Email" value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })} />
          <button type="button" className="bg-ashram-primary text-white px-2 py-1 rounded mt-1" onClick={handleAddMember}>Add Member</button>
        </div>
      )}
    </div>
  );
} 