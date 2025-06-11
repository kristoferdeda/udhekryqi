import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // ✅ import this

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ use the login method from context

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
            form
            );

            const user = res.data.user;
            const token = res.data.token;

            // Block unverified users
            if (!user.verified) {
            return setMessage('Please verify your email before logging in.');
            }

            // Login and redirect
            login(user, token);
            setMessage('Login successful!');
            navigate('/');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Login failed');
        }
    };


  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow-sm">
      <h2 className="text-2xl mb-4 font-semibold">Hyj</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Hyj
        </button>
        <div className="text-center mt-3">
          <p className="text-sm">
            <a
              href="/forgot-password"
              className="text-red-700 hover:underline"
            >
              Ke harruar fjalëkalimin?
            </a>
          </p>
        </div>
      </form>

      {message && (
        <p className="mt-4 text-sm text-center text-gray-700">{message}</p>
      )}
    </div>
  );
}
