'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('consumer');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('/api/auth/register', {
        email,
        password,
        userType,
      });

      if (res.status === 201) {
        router.push('/login');
      }
    } catch (error) {
      console.error("Register error:", error);
      alert(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md w-full mx-auto bg-white p-6 rounded shadow space-y-4 mt-8"
    >
      <h2 className="text-2xl font-semibold text-center">Create an Account</h2>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full border p-2 rounded"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full border p-2 rounded"
        required
      />

      <select
        value={userType}
        onChange={(e) => setUserType(e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="consumer">Consumer</option>
        <option value="business">Business</option>
      </select>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
      >
        Register
      </button>
    </form>
  );
}
