import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export default function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('ashram-user', JSON.stringify(data.user));
      onLogin(data.user);
      navigate('/');
    } else {
      setError(data.error || 'Login failed');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-ashram-light px-4 py-8">
      <form onSubmit={handleSubmit} className="bg-white/90 rounded-xl shadow p-6 flex flex-col gap-y-4 w-full max-w-full sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/3">
        <h2 className="text-2xl font-bold text-ashram-primary mb-2 text-center">Login</h2>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <div>
          <label className="block text-ashram-primary font-medium mb-1">Email</label>
          <input type="email" className="input w-full" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
        </div>
        <div>
          <label className="block text-ashram-primary font-medium mb-1">Password</label>
          <input type="password" className="input w-full" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="bg-ashram-primary text-white font-semibold w-full py-2 rounded hover:bg-ashram-accent transition">Login</button>
      </form>
    </div>
  );
} 