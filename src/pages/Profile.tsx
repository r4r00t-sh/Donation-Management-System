import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editMember, setEditMember] = useState<any>(null);
  const [addMember, setAddMember] = useState<any>({ name: '', star: '', dob: '', phone: '', email: '' });
  const jwt = localStorage.getItem('jwt');

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem('ashram-user') || 'null'));
    } catch { setUser(null); }
  }, []);

  useEffect(() => {
    // Always get the latest user from localStorage to get updated family_id
    let latestUser = user;
    try {
      latestUser = JSON.parse(localStorage.getItem('ashram-user') || 'null');
    } catch {}
    if (!latestUser || !latestUser.family_id) return setFamilyMembers([]);
    fetch(`${API}/api/members?family_id=${latestUser.family_id}`, { headers: { Authorization: `Bearer ${jwt}` } })
      .then(res => res.json()).then(members => {
        setFamilyMembers(Array.isArray(members) ? members : []);
      }).catch(() => setFamilyMembers([]));
  }, [user, jwt]);

  function handleEdit(idx: number) {
    setEditIdx(idx);
    setEditMember({ ...familyMembers[idx] });
  }
  function handleEditChange(field: string, value: string) {
    setEditMember({ ...editMember, [field]: value });
  }
  async function handleEditSave() {
    if (!editMember || !editMember.id) return;
    await fetch(`${API}/api/members/${editMember.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editMember.name,
        star: editMember.star,
        dob: editMember.dob,
        phone: editMember.phone,
        email: editMember.email
      })
    });
    setEditIdx(null); setEditMember(null);
    fetch(`${API}/api/members?family_id=${user.family_id}`, { headers: { Authorization: `Bearer ${jwt}` } })
      .then(res => res.json()).then(members => {
        setFamilyMembers(Array.isArray(members) ? members : []);
      });
  }
  async function handleDelete(id: string) {
    if (!window.confirm('Remove this family member?')) return;
    await fetch(`${API}/api/members/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${jwt}` } });
    fetch(`${API}/api/members?family_id=${user.family_id}`, { headers: { Authorization: `Bearer ${jwt}` } })
      .then(res => res.json()).then(members => {
        setFamilyMembers(Array.isArray(members) ? members : []);
      });
  }
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API}/api/members`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...addMember,
        family_id: user.family_id
      })
    });
    if (res.ok) {
      const data = await res.json();
      setAddMember({ name: '', star: '', dob: '', phone: '', email: '' });
      // If a new family was created, update user in localStorage and state
      if (data.newFamilyCreated && data.family_id) {
        const updatedUser = { ...user, family_id: data.family_id };
        localStorage.setItem('ashram-user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      fetch(`${API}/api/members?family_id=${data.family_id || user.family_id}`, { headers: { Authorization: `Bearer ${jwt}` } })
        .then(res => res.json()).then(members => {
          setFamilyMembers(Array.isArray(members) ? members : []);
        });
    } else {
      const err = await res.json();
      alert(err.error || 'Error adding family member');
    }
  }

  if (!user) return <div className="text-ashram-accent mt-8 text-center">Please log in to view your profile.</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-ashram-light px-4 py-8">
      <div className="bg-white/90 rounded-xl shadow p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-ashram-primary mb-4 text-center">My Profile & Family</h2>
        <div className="mb-6">
          <div className="font-semibold text-ashram-primary mb-1">Your Details</div>
          <div className="text-sm mb-1">Name: {user.name}</div>
          <div className="text-sm mb-1">Phone: {user.phone}</div>
          <div className="text-sm mb-1">Email: {user.email}</div>
          <div className="text-sm mb-1">Star: {user.star}</div>
          <div className="text-sm mb-1">DOB: {user.dob}</div>
          <div className="text-sm mb-1">Address: {user.address}</div>
        </div>
        <div className="mb-4">
          <div className="font-semibold text-ashram-primary mb-2">Family Members</div>
          {familyMembers.length === 0 && <div className="text-ashram-accent text-sm">No other family members yet.</div>}
          {familyMembers.map((m: any, i: number) => (
            <div key={m.id} className="flex flex-col gap-1 mb-2 bg-ashram-light rounded p-2">
              {editIdx === i ? (
                <>
                  <input className="input mb-1" value={editMember.name} onChange={e => handleEditChange('name', e.target.value)} placeholder="Name" />
                  <input className="input mb-1" value={editMember.star} onChange={e => handleEditChange('star', e.target.value)} placeholder="Star" />
                  <input className="input mb-1" value={editMember.dob} onChange={e => handleEditChange('dob', e.target.value)} placeholder="DOB" type="date" />
                  <input className="input mb-1" value={editMember.phone} onChange={e => handleEditChange('phone', e.target.value)} placeholder="Phone" />
                  <input className="input mb-1" value={editMember.email} onChange={e => handleEditChange('email', e.target.value)} placeholder="Email" />
                  <div className="flex gap-2 mt-1">
                    <button className="bg-ashram-primary text-white px-2 py-1 rounded text-xs" onClick={handleEditSave}>Save</button>
                    <button className="text-xs text-gray-500 underline" onClick={() => setEditIdx(null)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm">Name: {m.name}</div>
                  <div className="text-sm">Star: {m.star}</div>
                  <div className="text-sm">DOB: {m.dob}</div>
                  <div className="text-sm">Phone: {m.phone}</div>
                  <div className="text-sm">Email: {m.email}</div>
                  <div className="flex gap-2 mt-1">
                    <button className="text-xs text-blue-500 underline" onClick={() => handleEdit(i)}>Edit</button>
                    <button className="text-xs text-red-500 underline" onClick={() => handleDelete(m.id)}>Remove</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={handleAdd} className="bg-ashram-light rounded p-3 mt-2 flex flex-col gap-2">
          <div className="font-semibold text-ashram-primary mb-1">Add Family Member</div>
          <input className="input" placeholder="Name" value={addMember.name} onChange={e => setAddMember({ ...addMember, name: e.target.value })} required />
          <input className="input" placeholder="Star" value={addMember.star} onChange={e => setAddMember({ ...addMember, star: e.target.value })} />
          <input className="input" placeholder="DOB" type="date" value={addMember.dob} onChange={e => setAddMember({ ...addMember, dob: e.target.value })} />
          <input className="input" placeholder="Phone" value={addMember.phone} onChange={e => setAddMember({ ...addMember, phone: e.target.value })} />
          <input className="input" placeholder="Email" value={addMember.email} onChange={e => setAddMember({ ...addMember, email: e.target.value })} />
          <button type="submit" className="bg-ashram-primary text-white px-3 py-1 rounded">Add</button>
        </form>
      </div>
    </div>
  );
} 