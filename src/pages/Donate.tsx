import React, { useState, useEffect, useRef } from 'react';
import ReceiptForm from '../components/ReceiptForm';
import FamilyBox from '../components/FamilyBox';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export default function PushpanjaliPage() {
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<any>(null);
  const [formState, setFormState] = useState<any>({});
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/api/payment/config`)
      .then(res => res.json())
      .then(cfg => setPaymentConfig(cfg));
  }, []);

  async function handleRazorpay(form: any) {
    const token = localStorage.getItem('jwt');
    if (!token) {
      alert('Please log in to book pushpanjali.');
      return;
    }
    if (!paymentConfig || !paymentConfig.enabled) {
      alert('Payment gateway not configured.');
      return;
    }
    setLoading(true);
    // Create Razorpay order
    const orderRes = await fetch(`${API}/api/payment/razorpay/order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: parseInt(form.amount, 10) * 100, // INR to paise
        currency: 'INR',
        receipt: 'rcpt_' + Date.now()
      })
    });
    const order = await orderRes.json();
    // Launch Razorpay Checkout
    const options = {
      key: paymentConfig.key_id,
      amount: order.amount,
      currency: order.currency,
      name: "Santhigiri Ashram",
      description: "Donation",
      order_id: order.id,
      handler: async function (response: any) {
        // Verify payment
        const verifyRes = await fetch(`${API}/api/payment/razorpay/verify`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature
          })
        });
        const verify = await verifyRes.json();
        if (verify.success) {
          // Create receipt
          await fetch(`${API}/api/receipts`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              donor_name: form.donorName,
              amount: form.amount,
              date: new Date().toISOString().slice(0, 10),
              payment_method: 'Card',
              remarks: form.remarks,
              payment_status: 'paid',
              qr_code_data: '',
              customFields: {}
            })
          });
          alert('Donation successful! Receipt created.');
        } else {
          alert('Payment verification failed.');
        }
        setLoading(false);
      },
      prefill: { name: form.donorName },
      theme: { color: "#F2BED1" }
    };
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  }

  return (
    <div className="flex flex-row w-full min-h-screen bg-ashram-light px-8 py-8 gap-8 items-center justify-center">
      {/* Left: Form */}
      <div className="flex-1 max-w-xl bg-white/95 rounded-2xl shadow-xl p-10 mr-8">
        <ReceiptForm mode="booking" onPay={handleRazorpay} showFamilyBox={false} onAdd={() => {}} onFormChange={setFormState} ref={formRef} selectedMember={selectedMember} selectedMembers={selectedMembers} />
      </div>
      {/* Right: FamilyBox */}
      <div className="w-full max-w-sm bg-white/95 rounded-2xl shadow-xl p-8 flex flex-col items-start">
        <FamilyBox mode="booking" onSelectMember={setSelectedMember} onSelectMembers={setSelectedMembers} />
      </div>
    </div>
  );
} 