import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export default function UserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('public');
  const [editId, setEditId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState('public');
  const jwt = localStorage.getItem('jwt');
  const [families, setFamilies] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedFamilyMembers, setSelectedFamilyMembers] = useState<any[]>([]);
  const [selectedFamilyUsers, setSelectedFamilyUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/api/users`, {
      headers: { Authorization: `Bearer ${jwt}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
        else setUsers([]);
      });
    fetch(`${API}/api/families`, { headers: { Authorization: `Bearer ${jwt}` } })
      .then(res => res.json()).then(setFamilies).catch(() => setFamilies([]));
  }, [jwt]);

  useEffect(() => {
    const selectedUser = users.find(u => u.id === selectedUserId);
    if (selectedUser && selectedUser.family_id) {
      fetch(`${API}/api/members?family_id=${selectedUser.family_id}`, { headers: { Authorization: `Bearer ${jwt}` } })
        .then(res => res.json())
        .then(members => {
          setSelectedFamilyMembers(Array.isArray(members) ? members : []);
        })
        .catch(() => {});
      setSelectedFamilyUsers(users.filter(u => u.family_id === selectedUser.family_id && u.id !== selectedUser.id));
    } else {
      setSelectedFamilyMembers([]);
      setSelectedFamilyUsers([]);
    }
  }, [selectedUserId, users, jwt]);

  // Add family member state
  const [addFamilyUserId, setAddFamilyUserId] = useState<string | null>(null);
  const [familyMemberName, setFamilyMemberName] = useState('');
  const [familyMemberStar, setFamilyMemberStar] = useState('');
  const [familyMemberPhone, setFamilyMemberPhone] = useState('');
  const [familyMemberEmail, setFamilyMemberEmail] = useState('');
  const [familyMemberAddress, setFamilyMemberAddress] = useState('');
  const [familyMemberPassword, setFamilyMemberPassword] = useState('');
  const [linkFamilyUserId, setLinkFamilyUserId] = useState<string | null>(null);
  const [linkFamilyId, setLinkFamilyId] = useState('');

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch(`${API}/api/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, role })
    });
    if (res.ok) {
      const user = await res.json();
      setUsers([user, ...users]);
      setUsername('');
      setPassword('');
      setRole('public');
      setShowAddModal(false); // Close modal on success
    } else {
      const err = await res.json();
      alert(err.error || 'Error adding user');
    }
  }

  async function handleAddFamilyMember(e: React.FormEvent) {
    e.preventDefault();
    if (!addFamilyUserId) return;
    const user = users.find(u => u.id === addFamilyUserId);
    if (!user) return;
    const family_id = user.family_id || user.id;
    // If user has no family_id, create a new family first
    let famId = family_id;
    if (!user.family_id) {
      const famRes = await fetch(`${API}/api/families`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ family_name: user.username, primary_user_id: user.id })
      });
      const famData = await famRes.json();
      famId = famData.id;
      // Update user to link to new family
      await fetch(`${API}/api/users/${user.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ family_id: famId })
      });
    }
    // Add new family member (user)
    await fetch(`${API}/api/users`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: familyMemberEmail || familyMemberPhone || familyMemberName,
        password: familyMemberPassword || 'password',
        role: 'public',
        name: familyMemberName,
        phone: familyMemberPhone,
        email: familyMemberEmail,
        address: familyMemberAddress,
        star: familyMemberStar,
        family_id: famId
      })
    });
    setFamilyMemberName(''); setFamilyMemberStar(''); setFamilyMemberPhone(''); setFamilyMemberEmail(''); setFamilyMemberAddress(''); setFamilyMemberPassword(''); setAddFamilyUserId(null);
    // Refresh users
    fetch(`${API}/api/users`, { headers: { Authorization: `Bearer ${jwt}` } })
      .then(res => res.json()).then(setUsers);
  }

  async function handleLinkFamily(e: React.FormEvent) {
    e.preventDefault();
    if (!linkFamilyUserId || !linkFamilyId) return;
    await fetch(`${API}/api/users/${linkFamilyUserId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ family_id: linkFamilyId })
    });
    setLinkFamilyUserId(null); setLinkFamilyId('');
    fetch(`${API}/api/users`, { headers: { Authorization: `Bearer ${jwt}` } })
      .then(res => res.json()).then(setUsers);
  }

  function handleEdit(id: string) {
    const user = users.find(u => u.id === id);
    if (!user) return;
    setEditId(id);
    setEditUsername(user.username);
    setEditRole(user.role);
  }

  async function handleEditSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch(`${API}/api/users/${editId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: editUsername, role: editRole })
    });
    if (res.ok) {
      setUsers(users.map(u => u.id === editId ? { ...u, username: editUsername, role: editRole } : u));
      setEditId(null);
      setEditUsername('');
      setEditRole('public');
    } else {
      const err = await res.json();
      alert(err.error || 'Error updating user');
    }
  }

  function handleEditCancel() {
    setEditId(null);
    setEditUsername('');
    setEditRole('public');
  }

  async function handleDelete(id: string) {
    const res = await fetch(`${API}/api/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${jwt}` }
    });
    if (res.ok) {
      setUsers(users.filter(u => u.id !== id));
    } else {
      const err = await res.json();
      alert(err.error || 'Error deleting user');
    }
  }

  const safeUsers = Array.isArray(users) ? users : [];
  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="bg-white/90 rounded-xl shadow p-6 w-full max-w-4xl mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-ashram-primary">User Management (Admin)</h3>
        <button
          className="bg-ashram-primary text-white px-4 py-2 rounded hover:bg-ashram-accent transition text-sm font-semibold shadow"
          onClick={() => setShowAddModal(true)}
        >
          + Add User
        </button>
      </div>
      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto relative">
            <h4 className="text-xl font-semibold text-ashram-primary mb-4">Add User</h4>
            <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-4">
              <input className="input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
              <input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              <select className="input" value={role} onChange={e => setRole(e.target.value)}>
                <option value="admin">admin</option>
                <option value="staff">staff</option>
                <option value="public">public</option>
              </select>
              <button type="submit" className="bg-ashram-primary text-white px-4 py-2 rounded hover:bg-ashram-accent transition">Add User</button>
            </form>
            <button className="absolute top-4 right-4 text-ashram-accent text-2xl font-bold" onClick={() => setShowAddModal(false)}>&times;</button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        {safeUsers.length === 0 && <div className="text-ashram-accent">No users yet.</div>}
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-ashram-light">
              <th className="px-3 py-2 text-left">Username</th>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {safeUsers.map(u => (
              <tr key={u.id} className="border-b last:border-b-0">
                <td className="px-3 py-2">
                  {editId === u.id ? (
                    <form onSubmit={handleEditSave} className="flex gap-2 items-center">
                      <input className="input w-24" value={editUsername} onChange={e => setEditUsername(e.target.value)} required />
                      <select className="input w-24" value={editRole} onChange={e => setEditRole(e.target.value)}>
                        <option value="admin">admin</option>
                        <option value="staff">staff</option>
                        <option value="public">public</option>
                      </select>
                      <button type="submit" className="text-xs bg-ashram-primary text-white px-2 py-1 rounded">Save</button>
                      <button type="button" className="text-xs text-gray-500 underline" onClick={handleEditCancel}>Cancel</button>
                    </form>
                  ) : (
                    <button className="font-medium text-ashram-primary mr-2 underline hover:text-ashram-accent" onClick={() => setSelectedUserId(u.id)}>{u.username}</button>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className="text-xs bg-ashram-light px-2 py-1 rounded">{u.role}</span>
                </td>
                <td className="px-3 py-2 flex gap-2">
                  {editId === u.id ? null : <>
                    <button className="text-xs text-blue-500 underline" onClick={() => handleEdit(u.id)}>Edit</button>
                    <button className="text-xs text-red-500 underline" onClick={() => handleDelete(u.id)}>Delete</button>
                  </>}
                  {/* Family management UI */}
                  <button className="text-xs text-green-600 underline" onClick={() => setAddFamilyUserId(u.id)}>Add Family Member</button>
                  {!u.family_id && <button className="text-xs text-blue-600 underline" onClick={() => setLinkFamilyUserId(u.id)}>Link to Family</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Family Members Card for selected user */}
      {selectedUser && (
        <div className="bg-ashram-light rounded-xl shadow p-4 w-full max-w-2xl mt-6 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-md font-semibold text-ashram-primary">Family Members of <span className="text-ashram-accent">{selectedUser.username}</span></h4>
            <button className="ml-2 text-xs text-gray-500 underline" onClick={() => setSelectedUserId(null)}>Close</button>
          </div>
          {selectedFamilyUsers.length === 0 && selectedFamilyMembers.length === 0 ? (
            <div className="text-xs text-ashram-accent">No family members found.</div>
          ) : (
            <>
              {selectedFamilyUsers.length > 0 && (
                <>
                  <div className="mb-1 text-xs font-semibold text-ashram-primary">Other Users in Family:</div>
                  <table className="w-full text-xs border border-ashram-light rounded mb-2">
                    <thead>
                      <tr className="bg-ashram-light">
                        <th className="px-2 py-1 text-left">Username</th>
                        <th className="px-2 py-1 text-left">Role</th>
                        <th className="px-2 py-1 text-left">Email</th>
                        <th className="px-2 py-1 text-left">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedFamilyUsers.map((m: any) => (
                        <tr key={m.id} className="border-t">
                          <td className="px-2 py-1">{m.username}</td>
                          <td className="px-2 py-1">{m.role}</td>
                          <td className="px-2 py-1">{m.email || '-'}</td>
                          <td className="px-2 py-1">{m.phone || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
              {selectedFamilyMembers.length > 0 && (
                <>
                  <div className="mb-1 text-xs font-semibold text-ashram-primary">Members in Family:</div>
                  <table className="w-full text-xs border border-ashram-light rounded">
                    <thead>
                      <tr className="bg-ashram-light">
                        <th className="px-2 py-1 text-left">Name</th>
                        <th className="px-2 py-1 text-left">Star</th>
                        <th className="px-2 py-1 text-left">DOB</th>
                        <th className="px-2 py-1 text-left">Phone</th>
                        <th className="px-2 py-1 text-left">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedFamilyMembers.map((m: any) => (
                        <tr key={m.id} className="border-t">
                          <td className="px-2 py-1">{m.name}</td>
                          <td className="px-2 py-1">{m.star || '-'}</td>
                          <td className="px-2 py-1">{m.dob || '-'}</td>
                          <td className="px-2 py-1">{m.phone || '-'}</td>
                          <td className="px-2 py-1">{m.email || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}
        </div>
      )}
      {/* Add family member and link to family forms remain as before */}
      {safeUsers.map(u => (
        <React.Fragment key={u.id}>
          {/* Add family member form */}
          {addFamilyUserId === u.id && (
            <form onSubmit={handleAddFamilyMember} className="flex flex-col gap-1 mt-2 bg-ashram-light p-2 rounded">
              <input className="input" placeholder="Name" value={familyMemberName} onChange={e => setFamilyMemberName(e.target.value)} required />
              <input className="input" placeholder="Star" value={familyMemberStar} onChange={e => setFamilyMemberStar(e.target.value)} />
              <input className="input" placeholder="Phone" value={familyMemberPhone} onChange={e => setFamilyMemberPhone(e.target.value)} />
              <input className="input" placeholder="Email" value={familyMemberEmail} onChange={e => setFamilyMemberEmail(e.target.value)} />
              <input className="input" placeholder="Address" value={familyMemberAddress} onChange={e => setFamilyMemberAddress(e.target.value)} />
              <input className="input" placeholder="Password" value={familyMemberPassword} onChange={e => setFamilyMemberPassword(e.target.value)} />
              <div className="flex gap-2 mt-1">
                <button type="submit" className="bg-ashram-primary text-white px-2 py-1 rounded text-xs">Add</button>
                <button type="button" className="text-xs text-gray-500 underline" onClick={() => setAddFamilyUserId(null)}>Cancel</button>
              </div>
            </form>
          )}
          {/* Link to family form */}
          {linkFamilyUserId === u.id && (
            <form onSubmit={handleLinkFamily} className="flex gap-2 mt-2 bg-ashram-light p-2 rounded">
              <select className="input" value={linkFamilyId} onChange={e => setLinkFamilyId(e.target.value)} required>
                <option value="">Select Family</option>
                {families.map(f => <option key={f.id} value={f.id}>{f.family_name}</option>)}
              </select>
              <button type="submit" className="bg-ashram-primary text-white px-2 py-1 rounded text-xs">Link</button>
              <button type="button" className="text-xs text-gray-500 underline" onClick={() => setLinkFamilyUserId(null)}>Cancel</button>
            </form>
          )}
        </React.Fragment>
      ))}
    </div>
  );
} 