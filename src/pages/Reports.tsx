import React, { useEffect, useState } from 'react';
import { Receipt } from '../types/receipt';
import ReportSummary from '../components/ReportSummary';
import {
  PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend
} from 'recharts';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const paymentMethods = ['Cash', 'Card', 'UPI', 'Cheque'];

const ReportsPage: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filtered, setFiltered] = useState<Receipt[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [method, setMethod] = useState('');

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    fetch(`${API}/api/receipts`, {
      headers: { Authorization: `Bearer ${jwt}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReceipts(data);
        else setReceipts([]);
      });
  }, []);

  useEffect(() => {
    let data = receipts;
    if (dateFrom) data = data.filter(r => r.date >= dateFrom);
    if (dateTo) data = data.filter(r => r.date <= dateTo);
    if (amountMin) data = data.filter(r => Number(r.amount) >= Number(amountMin));
    if (amountMax) data = data.filter(r => Number(r.amount) <= Number(amountMax));
    if (method) data = data.filter(r => (r as any).payment_method === method || r.paymentMethod === method);
    setFiltered(data);
  }, [receipts, dateFrom, dateTo, amountMin, amountMax, method]);

  // Helper to get date N days/months ago
  function getDateNDaysAgo(days: number) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  }
  function getDateNMonthsAgo(months: number) {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d.toISOString().slice(0, 10);
  }
  // Totals for periods (use filtered data)
  const today = new Date().toISOString().slice(0, 10);
  const totalToday = filtered.filter(r => r.date === today).reduce((sum, r) => sum + Number(r.amount), 0);
  const total1Week = filtered.filter(r => r.date >= getDateNDaysAgo(7)).reduce((sum, r) => sum + Number(r.amount), 0);
  const total1Month = filtered.filter(r => r.date >= getDateNMonthsAgo(1)).reduce((sum, r) => sum + Number(r.amount), 0);
  const total3Months = filtered.filter(r => r.date >= getDateNMonthsAgo(3)).reduce((sum, r) => sum + Number(r.amount), 0);
  const total6Months = filtered.filter(r => r.date >= getDateNMonthsAgo(6)).reduce((sum, r) => sum + Number(r.amount), 0);
  const total1Year = filtered.filter(r => r.date >= getDateNMonthsAgo(12)).reduce((sum, r) => sum + Number(r.amount), 0);

  // Pie chart data
  const pieData = paymentMethods.map(m => ({
    name: m,
    value: filtered.filter(r => (r as any).payment_method === m || r.paymentMethod === m).length
  })).filter(d => d.value > 0);

  // Bar chart data (by date)
  const barData = Object.values(filtered.reduce((acc, r) => {
    acc[r.date] = acc[r.date] || { date: r.date, amount: 0 };
    acc[r.date].amount += Number(r.amount);
    return acc;
  }, {} as Record<string, { date: string, amount: number }>));

  // Summary stats
  const total = filtered.reduce((sum, r) => sum + Number(r.amount), 0);
  const avg = filtered.length > 0 ? total / filtered.length : 0;
  const highest = filtered.reduce((max, r) => (Number(r.amount) > Number(max.amount) ? r : max), filtered[0] || { amount: 0 });
  const highestReceiptNumber = (highest as any).receipt_number || highest.receiptNumber || '-';

  return (
    <div className="flex flex-col items-center w-full min-h-screen">
      <h2 className="text-2xl font-bold text-ashram-primary mb-4">Reports</h2>
      {/* Quick Summary Cards */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="bg-white/90 rounded-xl shadow px-6 py-2 text-lg font-bold text-ashram-primary flex items-center">
          <span className="text-xs text-ashram-accent mr-2">Today:</span> ₹{totalToday.toFixed(2)}
        </div>
        <div className="bg-white/90 rounded-xl shadow px-6 py-2 text-lg font-bold text-ashram-primary flex items-center">
          <span className="text-xs text-ashram-accent mr-2">1 Week:</span> ₹{total1Week.toFixed(2)}
        </div>
        <div className="bg-white/90 rounded-xl shadow px-6 py-2 text-lg font-bold text-ashram-primary flex items-center">
          <span className="text-xs text-ashram-accent mr-2">1 Month:</span> ₹{total1Month.toFixed(2)}
        </div>
        <div className="bg-white/90 rounded-xl shadow px-6 py-2 text-lg font-bold text-ashram-primary flex items-center">
          <span className="text-xs text-ashram-accent mr-2">3 Months:</span> ₹{total3Months.toFixed(2)}
        </div>
        <div className="bg-white/90 rounded-xl shadow px-6 py-2 text-lg font-bold text-ashram-primary flex items-center">
          <span className="text-xs text-ashram-accent mr-2">6 Months:</span> ₹{total6Months.toFixed(2)}
        </div>
        <div className="bg-white/90 rounded-xl shadow px-6 py-2 text-lg font-bold text-ashram-primary flex items-center">
          <span className="text-xs text-ashram-accent mr-2">1 Year:</span> ₹{total1Year.toFixed(2)}
        </div>
      </div>
      {/* Filter Panel */}
      <div className="flex flex-wrap gap-4 mb-6 bg-white/90 rounded-xl shadow p-4 w-full max-w-4xl">
        <div>
          <label className="block text-xs text-ashram-primary mb-1">Date From</label>
          <input type="date" className="input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-ashram-primary mb-1">Date To</label>
          <input type="date" className="input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-ashram-primary mb-1">Min Amount</label>
          <input type="number" className="input" value={amountMin} onChange={e => setAmountMin(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-ashram-primary mb-1">Max Amount</label>
          <input type="number" className="input" value={amountMax} onChange={e => setAmountMax(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-ashram-primary mb-1">Payment Method</label>
          <select className="input" value={method} onChange={e => setMethod(e.target.value)}>
            <option value="">All</option>
            {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      {/* Summary Stats */}
      <div className="flex gap-8 mb-6">
        <div className="bg-white/90 rounded-xl shadow p-4 min-w-[180px]">
          <div className="text-xs text-ashram-accent">Total Receipts</div>
          <div className="text-lg font-bold">{filtered.length}</div>
        </div>
        <div className="bg-white/90 rounded-xl shadow p-4 min-w-[180px]">
          <div className="text-xs text-ashram-accent">Total Amount</div>
          <div className="text-lg font-bold">₹{total.toFixed(2)}</div>
        </div>
        <div className="bg-white/90 rounded-xl shadow p-4 min-w-[180px]">
          <div className="text-xs text-ashram-accent">Average Amount</div>
          <div className="text-lg font-bold">₹{avg.toFixed(2)}</div>
        </div>
        <div className="bg-white/90 rounded-xl shadow p-4 min-w-[180px]">
          <div className="text-xs text-ashram-accent">Highest Amount</div>
          <div className="text-lg font-bold">₹{highest ? (Number(highest.amount) || 0).toFixed(2) : '0.00'}</div>
          <div className="text-xs">Receipt #: {highestReceiptNumber}</div>
        </div>
      </div>
      {/* Charts */}
      <div className="flex flex-wrap gap-8 w-full max-w-5xl mb-8">
        <div className="bg-white/90 rounded-xl shadow p-4 flex-1 min-w-[320px]">
          <h4 className="text-ashram-primary font-semibold mb-2">Payment Method Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white/90 rounded-xl shadow p-4 flex-1 min-w-[320px]">
          <h4 className="text-ashram-primary font-semibold mb-2">Amounts by Date</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 