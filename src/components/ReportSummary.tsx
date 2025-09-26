import React from 'react';
import { Receipt } from '../types/receipt';

interface ReportSummaryProps {
  receipts: Receipt[];
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}
function getMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export default function ReportSummary({ receipts }: ReportSummaryProps) {
  const today = getToday();
  const month = getMonth();

  const todayReceipts = receipts.filter(r => r.date === today);
  const monthReceipts = receipts.filter(r => r.date.startsWith(month));

  const todayTotal = todayReceipts.reduce((sum, r) => sum + r.amount, 0);
  const monthTotal = monthReceipts.reduce((sum, r) => sum + r.amount, 0);

  // Group by day for current month
  const dailyTotals: { [date: string]: number } = {};
  monthReceipts.forEach(r => {
    dailyTotals[r.date] = (dailyTotals[r.date] || 0) + r.amount;
  });
  const days = Object.keys(dailyTotals).sort().reverse();

  return (
    <div className="bg-white/90 rounded-xl shadow p-4 w-full max-w-lg mb-6">
      <h3 className="text-xl font-bold text-ashram-primary mb-2">Summary</h3>
      <div className="flex gap-6 mb-4">
        <div>
          <div className="text-xs text-ashram-accent">Today</div>
          <div className="text-lg font-bold">₹{(Number(todayTotal) || 0).toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-ashram-accent">This Month</div>
          <div className="text-lg font-bold">₹{(Number(monthTotal) || 0).toFixed(2)}</div>
        </div>
      </div>
      <div>
        <div className="font-semibold text-ashram-primary mb-1">Daily Totals (This Month)</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-ashram-accent">
              <th className="text-left px-2">Date</th>
              <th className="text-right px-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {days.length === 0 && (
              <tr><td colSpan={2} className="text-ashram-accent">No receipts this month.</td></tr>
            )}
            {days.map(date => (
              <tr key={date}>
                <td className="px-2 py-1">{date}</td>
                <td className="px-2 py-1 text-right">₹{(Number(dailyTotals[date]) || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 