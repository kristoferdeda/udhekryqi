import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password/${token}`,
        { newPassword }
      );
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000); // redirect after 3 seconds
    } catch (err) {
      setMessage(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow-sm">
      <h2 className="text-2xl mb-4 font-semibold">Vendos Fjalëkalim të Ri</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          name="newPassword"
          placeholder="Fjalëkalimi i ri"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-700 text-white py-2 rounded hover:bg-red-800"
        >
          {loading ? 'Duke ruajtur...' : 'Rivendos Fjalëkalimin'}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-center text-gray-700">{message}</p>
      )}
    </div>
  );
}
