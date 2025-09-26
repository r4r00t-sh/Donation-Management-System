import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [families, setFamilies] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [linkFamilyId, setLinkFamilyId] = useState('');
  const [existingFamily, setExistingFamily] = useState<any>(null);
  const [showJoinFamily, setShowJoinFamily] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/families`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFamilies(data);
        else setFamilies([]);
      })
      .catch(() => setFamilies([]));
  }, []);

  function addFamilyMember() {
    setFamilyMembers([...familyMembers, { name: '', star: '', dob: '', phone: '', email: '' }]);
  }
  function updateFamilyMember(idx: number, field: string, value: string) {
    setFamilyMembers(familyMembers.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  }
  function removeFamilyMember(idx: number) {
    setFamilyMembers(familyMembers.filter((_, i) => i !== idx));
  }

  async function checkExistingFamily() {
    if (!phone && !email) return;
    const res = await fetch(`${API}/api/family-by-contact?phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data && data.family_id) {
      setExistingFamily(data);
      setShowJoinFamily(true);
      return true;
    }
    setExistingFamily(null);
    setShowJoinFamily(false);
    return false;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== retypePassword) {
      setError('Passwords do not match');
      return;
    }
    // Check for existing family
    const found = await checkExistingFamily();
    if (found && !showJoinFamily) return;
    // Register main user and family members
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email, address, password, members: familyMembers })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('ashram-user', JSON.stringify(data.user));
      navigate('/');
    } else {
      setError(data.error || 'Registration failed');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-ashram-light px-4 py-8">
      {showJoinFamily && existingFamily && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 rounded p-4 mb-4 w-full max-w-xl">
          <div className="font-bold mb-2">You are already in a family!</div>
          <div className="mb-2">Family Members:</div>
          <ul className="mb-2">
            {existingFamily.members.map((m: any) => (
              <li key={m.id}>{m.name} ({m.email || m.phone})</li>
            ))}
          </ul>
          <button className="bg-ashram-primary text-white px-4 py-2 rounded mr-2" onClick={() => setShowJoinFamily(false)}>Cancel</button>
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={async () => {
            setLinkFamilyId(existingFamily.family_id);
            setShowJoinFamily(false);
            setError('');
            // Proceed with registration
            await handleSubmit({ preventDefault: () => {} } as any);
          }}>Join This Family</button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white/90 rounded-xl shadow p-6 flex flex-col gap-y-4 w-full max-w-full sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/3">
        <h2 className="text-2xl font-bold text-ashram-primary mb-2 text-center">Register</h2>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <div>
          <label className="block text-ashram-primary font-medium mb-1">Full Name</label>
          <input type="text" className="input w-full" value={name} onChange={e => setName(e.target.value)} required autoFocus />
        </div>
        <div>
          <label className="block text-ashram-primary font-medium mb-1">Phone Number</label>
          <input type="tel" className="input w-full" value={phone} onChange={e => setPhone(e.target.value)} required pattern="[0-9]{10}" />
        </div>
        <div>
          <label className="block text-ashram-primary font-medium mb-1">Email</label>
          <input type="email" className="input w-full" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-ashram-primary font-medium mb-1">Address</label>
          <input type="text" className="input w-full" value={address} onChange={e => setAddress(e.target.value)} required />
        </div>
        <div>
          <label className="block text-ashram-primary font-medium mb-1">Password</label>
          <input type="password" className="input w-full" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div>
          <label className="block text-ashram-primary font-medium mb-1">Retype Password</label>
          <input type="password" className="input w-full" value={retypePassword} onChange={e => setRetypePassword(e.target.value)} required />
        </div>
        {/* Family linking */}
        <div>
          <label className="block text-ashram-primary font-medium mb-1">Link to Existing Family</label>
          <select className="input w-full" value={linkFamilyId} onChange={e => setLinkFamilyId(e.target.value)}>
            <option value="">None</option>
            {families.map((f: any) => (
              <option key={f.id} value={f.id}>{f.family_name}</option>
            ))}
          </select>
        </div>
        {/* Or add new family members */}
        <div className="bg-ashram-light rounded p-3 mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-ashram-primary font-medium">Add Family Members <span className="text-xs text-gray-500">(optional)</span></span>
            <button type="button" className="text-xs bg-ashram-primary text-white px-2 py-1 rounded" onClick={addFamilyMember}>+ Add</button>
          </div>
          {familyMembers.map((m, i) => (
            <div key={i} className="flex flex-wrap gap-2 mb-2 items-end">
              <input className="input w-32" placeholder="Name" value={m.name} onChange={e => updateFamilyMember(i, 'name', e.target.value)} required />
              <input className="input w-24" placeholder="Star" value={m.star} onChange={e => updateFamilyMember(i, 'star', e.target.value)} />
              <input className="input w-32" placeholder="DOB" type="date" value={m.dob} onChange={e => updateFamilyMember(i, 'dob', e.target.value)} />
              <input className="input w-32" placeholder="Phone" value={m.phone} onChange={e => updateFamilyMember(i, 'phone', e.target.value)} />
              <input className="input w-32" placeholder="Email" value={m.email} onChange={e => updateFamilyMember(i, 'email', e.target.value)} />
              <button type="button" className="text-xs text-red-500 underline" onClick={() => removeFamilyMember(i)}>Remove</button>
            </div>
          ))}
        </div>
        <button type="submit" className="bg-ashram-primary text-white font-semibold w-full py-2 rounded hover:bg-ashram-accent transition">Register</button>
      </form>
    </div>
  );
} 