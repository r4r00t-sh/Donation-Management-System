import React, { useRef, useState, useEffect } from 'react';
import { Receipt } from '../types/receipt';
import { CustomField } from '../types/customField';
// @ts-ignore
const jsPDF = require('jspdf').default || require('jspdf');
// @ts-ignore
const html2canvas = require('html2canvas');

function getCustomFields(): CustomField[] {
  const data = localStorage.getItem('ashram-custom-fields');
  return data ? JSON.parse(data) : [];
}

interface ReceiptViewProps {
  receipt: any;
  onClose: () => void;
  isPublic?: boolean;
}

export default function ReceiptView({ receipt, onClose, isPublic }: ReceiptViewProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [receiptMembers, setReceiptMembers] = useState<any[]>([]);
  const jwt = localStorage.getItem('jwt');

  useEffect(() => {
    async function fetchReceiptMembers() {
      if (!receipt.id) return;
      const res = await fetch(`/api/receipt-members?receipt_id=${receipt.id}`, { headers: { Authorization: `Bearer ${jwt}` } });
      const data = await res.json();
      setReceiptMembers(Array.isArray(data) ? data : []);
    }
    fetchReceiptMembers();
  }, [receipt.id, jwt]);
  const [editMembers, setEditMembers] = useState<any[]>(receipt.familyMembers || []);
  const [familyMembers, setFamilyMembers] = useState<any[]>(receipt.familyMembers || []);
  const [allFamily, setAllFamily] = useState<any[]>([]);
  const [loadingFamily, setLoadingFamily] = useState(false);
  function handlePrint() {
    window.print();
  }
  async function handleDownload() {
    if (receiptRef.current) {
      const canvas = await html2canvas(receiptRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      // Center the image on the page
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth * 0.9;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const x = (pageWidth - pdfWidth) / 2;
      const y = 40;
      pdf.addImage(imgData, 'PNG', x, y, pdfWidth, pdfHeight);
      pdf.save('donation-receipt.pdf');
    }
  }
  async function fetchAllFamily() {
    setLoadingFamily(true);
    const user = (() => { try { return JSON.parse(localStorage.getItem('ashram-user') || '{}'); } catch { return {}; } })();
    if (user && user.family_id) {
      const res = await fetch(`/api/users?family_id=${user.family_id}`, { headers: { Authorization: `Bearer ${jwt}` } });
      const members = await res.json();
      setAllFamily(members);
    }
    setLoadingFamily(false);
  }
  async function handleEditClick() {
    await fetchAllFamily();
    setEditing(true);
  }
  function toggleEditMember(m: any) {
    let updated;
    if (editMembers.some((mem: any) => mem.id === m.id)) {
      updated = editMembers.filter((mem: any) => mem.id !== m.id);
    } else {
      updated = [...editMembers, m];
    }
    setEditMembers(updated);
  }
  async function handleSaveEdit() {
    await fetch(`/api/receipts/${receipt.id}/family-members`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyMembers: editMembers })
    });
    setEditing(false);
    setFamilyMembers(editMembers);
  }
  const customFields = getCustomFields();
  // Add support for displaying selected family members
  // Fallbacks for property names
  const receiptNumber = receipt.receiptNumber || receipt.receipt_number || '';
  const donorName = receipt.donorName || receipt.donor_name || '';
  const amount = receipt.amount;
  const date = receipt.date;
  const paymentMethod = receipt.paymentMethod || receipt.payment_method || '';
  const remarks = receipt.remarks;
  const qrCode = receipt.qrCodeData || receipt.qr_code_data || '';
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div ref={receiptRef} className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md print:w-full print:max-w-full print:shadow-none print:p-2 border-2 border-ashram-primary">
        <h2 className="text-2xl font-bold text-ashram-primary mb-4 text-center">Santhigiri Ashram</h2>
        <h3 className="text-lg font-semibold text-ashram-accent mb-4 text-center">Donation Receipt</h3>
        <div className="mb-2"><b>Receipt #:</b> {receiptNumber}</div>
        <div className="mb-2"><b>Donor Name:</b> {donorName}</div>
        {receiptMembers.length > 0 && !editing && (
          <div className="mb-4">
            <div className="font-semibold text-ashram-primary mb-2 flex items-center justify-between">
              Associated Members & Pooja Types
            </div>
            <table className="w-full text-xs border border-ashram-light rounded mb-2">
              <thead>
                <tr className="bg-ashram-light">
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-left">Star</th>
                  <th className="px-2 py-1 text-left">DOB</th>
                  <th className="px-2 py-1 text-left">Pooja Type</th>
                </tr>
              </thead>
              <tbody>
                {receiptMembers.map((m: any) => (
                  <tr key={m.member_id} className="border-t">
                    <td className="px-2 py-1">{m.name}</td>
                    <td className="px-2 py-1">{m.star}</td>
                    <td className="px-2 py-1">{m.dob}</td>
                    <td className="px-2 py-1">{m.pooja_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {familyMembers.length > 0 && !editing && (
          <div className="mb-4">
            <div className="font-semibold text-ashram-primary mb-2 flex items-center justify-between">
              Family Members
              <button className="text-xs bg-ashram-primary text-white px-2 py-1 rounded ml-2" onClick={handleEditClick}>Edit</button>
            </div>
            <table className="w-full text-xs border border-ashram-light rounded mb-2">
              <thead>
                <tr className="bg-ashram-light">
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-left">Star</th>
                  <th className="px-2 py-1 text-left">DOB</th>
                </tr>
              </thead>
              <tbody>
                {familyMembers.map((m: any) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-2 py-1">{m.name}</td>
                    <td className="px-2 py-1">{m.star}</td>
                    <td className="px-2 py-1">{m.dob}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {editing && (
          <div className="mb-4">
            <div className="font-semibold text-ashram-primary mb-2">Edit Family Members</div>
            {loadingFamily ? <div>Loading...</div> : (
              <ul className="mb-2">
                {allFamily.map((m: any) => (
                  <li key={m.id} className="flex items-center gap-2 mb-1">
                    <input type="checkbox" checked={editMembers.some((mem: any) => mem.id === m.id)} onChange={() => toggleEditMember(m)} />
                    <span>{m.name} {m.star ? `(${m.star})` : ''} {m.dob}</span>
                  </li>
                ))}
              </ul>
            )}
            <button className="bg-ashram-primary text-white px-3 py-1 rounded mr-2" onClick={handleSaveEdit}>Save</button>
            <button className="bg-gray-300 text-gray-700 px-3 py-1 rounded" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        )}
        <div className="mb-2"><b>Amount:</b> ₹{(Number(amount) || 0).toFixed(2)}</div>
        <div className="mb-2"><b>Date:</b> {date}</div>
        <div className="mb-2"><b>Payment Method:</b> {paymentMethod}</div>
        {remarks && <div className="mb-2"><b>Remarks:</b> {remarks}</div>}
        {customFields.length > 0 && receipt.customFields && (
          <div className="mb-2">
            <b>Additional Info:</b>
            <ul className="ml-4 list-disc">
              {customFields.map(f => (
                <li key={f.id}><b>{f.label}:</b> {String(receipt.customFields?.[f.id] ?? '')}</li>
              ))}
            </ul>
          </div>
        )}
        {qrCode && (
          <div className="mb-2 flex flex-col items-center">
            <b>QR Code:</b>
            <img src={qrCode} alt="QR Code" className="w-32 h-32 mt-2" />
          </div>
        )}
        <div className="mt-6 text-xs text-ashram-accent text-center">Thank you for your generous donation!</div>
      </div>
      <div className="flex gap-2 mt-6 print:hidden flex-col items-center">
        <button className="bg-ashram-primary text-white px-4 py-2 rounded hover:bg-ashram-accent" onClick={handlePrint}>Print</button>
        {isPublic && (
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handleDownload}>Download</button>
        )}
        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
