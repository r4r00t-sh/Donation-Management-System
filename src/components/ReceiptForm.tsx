import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const BookingReceiptForm = forwardRef(function BookingReceiptForm({ onAdd, mode = 'receipt', onPay, showFamilyBox = true, onFormChange, selectedMember, selectedMembers, donorName }: { onAdd: (receipt: any) => void, mode?: 'booking' | 'receipt', onPay?: (data: any) => void, showFamilyBox?: boolean, onFormChange?: (form: any) => void, selectedMember?: any, selectedMembers?: any[], donorName?: string }, ref) {
  const [donorNameState, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [remarks, setRemarks] = useState('');
  const [branchId, setBranchId] = useState('');
  const [bookingTypeId, setBookingTypeId] = useState('');
  const [familyMemberId, setFamilyMemberId] = useState('');
  const [branches, setBranches] = useState<any[]>([]);
  const [bookingTypes, setBookingTypes] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const jwt = localStorage.getItem('jwt');
  const user = (() => { try { return JSON.parse(localStorage.getItem('ashram-user') || '{}'); } catch { return {}; } })();
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', star: '', dob: '', phone: '', email: '' });
  const [selectedMembersWithPooja, setSelectedMembersWithPooja] = useState<any[]>([]);

  // Add a form state object
  const formState = { donorName: donorNameState, amount, date, paymentMethod, remarks, branchId, bookingTypeId, familyMemberId };
  useEffect(() => { if (onFormChange) onFormChange(formState); }, [donorNameState, amount, date, paymentMethod, remarks, branchId, bookingTypeId, familyMemberId]);

  // Set donorName to user.name in booking mode or from prop
  useEffect(() => {
    if (mode === 'booking' && user && user.name) {
      setDonorName(user.name);
    }
  }, [mode, user]);
  useEffect(() => {
    if (donorName !== undefined) {
      setDonorName(donorName);
    }
  }, [donorName]);

  // When selectedMember changes, update form fields
  useEffect(() => {
    if (selectedMember) {
      setDonorName(selectedMember.name || '');
      if (selectedMember.star) setRemarks(`Star: ${selectedMember.star}`);
      // Optionally set other fields if needed
    }
  }, [selectedMember]);

  // When selectedMembers changes, initialize pooja type selection
  useEffect(() => {
    if (!selectedMembers) return;
    setSelectedMembersWithPooja(selectedMembers.map(m => ({ ...m, pooja_type: '' })));
  }, [selectedMembers]);

  // Fetch branches and booking types
  useEffect(() => {
    fetch(`${API}/api/branches`, { headers: { Authorization: `Bearer ${jwt}` } })
      .then(res => res.json()).then(setBranches).catch(() => setBranches([]));
    fetch(`${API}/api/booking-types`, { headers: { Authorization: `Bearer ${jwt}` } })
      .then(res => res.json()).then(setBookingTypes).catch(() => setBookingTypes([]));
  }, [jwt]);

  // Fetch family members for the user or for staff search
  useEffect(() => {
    async function fetchFamily() {
      if (user && user.family_id) {
        // Fetch all users with the same family_id
        const res = await fetch(`${API}/api/users?family_id=${user.family_id}`, { headers: { Authorization: `Bearer ${jwt}` } });
        const members = await res.json();
        const filteredMembers = Array.isArray(members) ? members : [];
        setFamilyMembers([user, ...filteredMembers.filter((m: any) => m.id !== user.id)]);
      } else if (user && user.role === 'staff' && searchResult && searchResult.family_id) {
        // For staff, after searching a user, fetch their family
        const res = await fetch(`${API}/api/users?family_id=${searchResult.family_id}`, { headers: { Authorization: `Bearer ${jwt}` } });
        const members = await res.json();
        const filteredMembers = Array.isArray(members) ? members : [];
        setFamilyMembers([searchResult, ...filteredMembers.filter((m: any) => m.id !== searchResult.id)]);
      } else {
        setFamilyMembers([]);
      }
    }
    fetchFamily();
  }, [user, jwt, searchResult]);

  // Staff: search for user by phone/email
  async function handleSearchUser(e: React.FormEvent) {
    e.preventDefault();
    if (!searchUser) return;
    const res = await fetch(`${API}/api/users?search=${encodeURIComponent(searchUser)}`, { headers: { Authorization: `Bearer ${jwt}` } });
    const found = await res.json();
    if (found && found.length > 0) setSearchResult(found[0]);
    else setSearchResult(null);
  }

  // Auto-fill all details when family member is selected
  useEffect(() => {
    if (!familyMemberId) return;
    const member = familyMembers.find((m: any) => m.id === familyMemberId);
    if (member) {
      setDonorName(member.name || '');
      // Optionally set star, dob, etc.
      if (member.star) setRemarks(`Star: ${member.star}`);
      // Add more auto-fill fields as needed
    }
  }, [familyMemberId, familyMembers]);

  async function handleAddMember() {
    if (!newMember.name) return;
    // Save to backend
    try {
      const res = await fetch(`${API}/api/family-members`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: newMember.email || newMember.phone || newMember.name,
          password: 'password',
          name: newMember.name,
          phone: newMember.phone,
          email: newMember.email,
          star: newMember.star,
          dob: newMember.dob,
          family_id: user.family_id
        })
      });
      if (res.ok) {
        // Refetch family members from backend
        const famRes = await fetch(`${API}/api/users?family_id=${user.family_id}`, { headers: { Authorization: `Bearer ${jwt}` } });
        const members = await famRes.json();
        const filteredMembers = Array.isArray(members) ? members : [];
        setFamilyMembers([user, ...filteredMembers.filter((m: any) => m.id !== user.id)]);
        setShowAddMember(false);
        setNewMember({ name: '', star: '', dob: '', phone: '', email: '' });
      } else {
        const err = await res.json();
        alert(err.error || 'Error adding member');
      }
    } catch (e) {
      alert('Error adding member');
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!donorNameState || !amount || !date || !branchId || !bookingTypeId) return;
    // Validate pooja type for each selected member
    if (selectedMembersWithPooja.some(m => !m.pooja_type)) {
      alert('Please select a pooja type for each member.');
      return;
    }
    const res = await fetch(`${API}/api/receipts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        donor_name: donorNameState,
        amount: parseFloat(amount),
        date,
        payment_method: paymentMethod,
        remarks: remarks.trim() ? remarks : undefined,
        branch_id: branchId,
        booking_type_id: bookingTypeId,
        family_member_id: familyMemberId || null,
        payment_status: 'paid',
        customFields: {},
        receiptMembers: selectedMembersWithPooja.map(m => ({ member_id: m.id, pooja_type: m.pooja_type }))
      })
    });
    if (res.ok) {
      const data = await res.json();
      onAdd(data);
      setDonorName('');
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('Cash');
      setRemarks('');
      setBranchId('');
      setBookingTypeId('');
      setFamilyMemberId('');
    } else {
      const err = await res.json();
      alert(err.error || 'Error adding receipt');
    }
  }

  // Render selected members table if any
  const renderSelectedMembersTable = () => {
    if (!selectedMembersWithPooja || selectedMembersWithPooja.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="font-semibold text-ashram-primary mb-2">Selected Family Members</div>
        <table className="w-full text-xs border border-ashram-light rounded">
          <thead>
            <tr className="bg-ashram-light">
              <th className="px-2 py-1 text-left">Name</th>
              <th className="px-2 py-1 text-left">Star</th>
              <th className="px-2 py-1 text-left">DOB</th>
              <th className="px-2 py-1 text-left">Pooja Type</th>
            </tr>
          </thead>
          <tbody>
            {selectedMembersWithPooja.map((m: any, idx: number) => (
              <tr key={m.id} className="border-t">
                <td className="px-2 py-1">{m.name}</td>
                <td className="px-2 py-1">{m.star || '-'}</td>
                <td className="px-2 py-1">{m.dob || '-'}</td>
                <td className="px-2 py-1">
                  <select className="input" value={m.pooja_type} onChange={e => {
                    const updated = [...selectedMembersWithPooja];
                    updated[idx].pooja_type = e.target.value;
                    setSelectedMembersWithPooja(updated);
                  }}>
                    <option value="">Select</option>
                    {bookingTypes.map((t: any) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <form onSubmit={mode === 'booking' ? (onPay || (() => {})) : handleSubmit} className="bg-white/90 rounded-xl shadow p-4 flex flex-col gap-3 w-full max-w-md">
      {renderSelectedMembersTable()}
      {/* Staff: search for user by phone/email */}
      {user && user.role === 'staff' && (
        <div className="mb-2">
          <form onSubmit={handleSearchUser} className="flex gap-2">
            <input className="input flex-1" placeholder="Search user by phone/email" value={searchUser} onChange={e => setSearchUser(e.target.value)} />
            <button type="submit" className="bg-ashram-primary text-white px-2 py-1 rounded text-xs">Search</button>
          </form>
          {searchResult && <div className="text-xs text-ashram-primary mt-1">Found: {searchResult.name} ({searchResult.phone || searchResult.email})</div>}
        </div>
      )}
      {/* Family Member Dropdown (only in receipt mode) */}
      {mode === 'receipt' && familyMembers.length > 0 && (
        <div>
          <label className="block text-ashram-primary font-medium mb-1">Family Member</label>
          <select className="input" value={familyMemberId} onChange={e => setFamilyMemberId(e.target.value)}>
            <option value="">Select</option>
            {familyMembers.map((m: any) => (
              <option key={m.id} value={m.id}>{m.name} {m.star ? `(${m.star})` : ''}</option>
            ))}
          </select>
        </div>
      )}
      {/* Show auto-filled details for selected member or user (booking mode) */}
      <div>
        <label className="block text-ashram-primary font-medium mb-1">Donor Name</label>
        <input type="text" className="input" value={donorNameState} onChange={e => setDonorName(e.target.value)} required disabled={mode === 'booking'} />
      </div>
      <div>
        <label className="block text-ashram-primary font-medium mb-1">Amount</label>
        <input type="number" className="input" value={amount} onChange={e => setAmount(e.target.value)} required min="1" step="0.01" />
      </div>
      <div>
        <label className="block text-ashram-primary font-medium mb-1">Date</label>
        <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} required />
      </div>
      <div>
        <label className="block text-ashram-primary font-medium mb-1">Payment Method</label>
        <select className="input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="UPI">UPI</option>
          <option value="Cheque">Cheque</option>
        </select>
      </div>
      {/* Branch Dropdown */}
      <div>
        <label className="block text-ashram-primary font-medium mb-1">Branch</label>
        <select className="input" value={branchId} onChange={e => setBranchId(e.target.value)} required>
          <option value="">Select Branch</option>
          {branches.map((b: any) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>
      {/* Booking Type Dropdown */}
      <div>
        <label className="block text-ashram-primary font-medium mb-1">Type of Booking</label>
        <select className="input" value={bookingTypeId} onChange={e => setBookingTypeId(e.target.value)} required>
          <option value="">Select Type</option>
          {bookingTypes.map((t: any) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-ashram-primary font-medium mb-1">Remarks</label>
        <input type="text" className="input" value={remarks} onChange={e => setRemarks(e.target.value)} />
      </div>
      {/* Remove the right-side family box and related UI from the form rendering. Only render the form fields and submit/pay button. */}
      {/* Submit or Razorpay button */}
      {mode === 'booking' ? (
        <button type="button" className="bg-ashram-primary text-white font-semibold px-4 py-2 rounded hover:bg-ashram-accent transition" onClick={() => onPay && onPay(formState)}>Pay with Razorpay</button>
      ) : (
        <button type="submit" className="bg-ashram-primary text-white font-semibold px-4 py-2 rounded hover:bg-ashram-accent transition">Add Receipt / Booking</button>
      )}
    </form>
  );
});
export default BookingReceiptForm; 