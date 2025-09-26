import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export default function PaymentConfigForm() {
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/payment/config`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
    })
      .then(res => res.json())
      .then(cfg => {
        if (cfg) {
          setKeyId(cfg.key_id);
          setKeySecret(cfg.key_secret);
          setEnabled(!!cfg.enabled);
        }
      });
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    fetch(`${API}/api/payment/config`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gateway: 'razorpay',
        key_id: keyId,
        key_secret: keySecret,
        enabled
      })
    }).then(res => res.json()).then(data => {
      if (data.success) alert('Payment config updated!');
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/90 rounded-xl shadow p-6 w-full max-w-lg mb-6">
      <h3 className="text-lg font-semibold text-ashram-primary mb-2">Payment Gateway (Razorpay)</h3>
      <div>
        <label className="block text-ashram-primary font-medium mb-1">Key ID</label>
        <input className="input" value={keyId} onChange={e => setKeyId(e.target.value)} required />
      </div>
      <div>
        <label className="block text-ashram-primary font-medium mb-1">Key Secret</label>
        <input className="input" value={keySecret} onChange={e => setKeySecret(e.target.value)} required />
      </div>
      <label className="flex items-center gap-2 text-ashram-primary mt-2">
        <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
        Enable Razorpay
      </label>
      <button type="submit" className="bg-ashram-primary text-white px-4 py-2 rounded hover:bg-ashram-accent transition mt-3">
        Save Payment Config
      </button>
    </form>
  );
} 