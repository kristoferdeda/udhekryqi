import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

export default function EditAccount() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [editingField, setEditingField] = useState(null); // 'name' or 'password'
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCancel = () => {
    setEditingField(null);
    setPassword('');
    setConfirm('');
    setName(user?.name || '');
    setMessage('');
    setSuccess(false);
  };

const handleSave = async () => {
  setMessage('');
  setSuccess(false);

  if (editingField === 'password') {
    if (!password) {
      setMessage('Password cannot be empty.');
      return;
    }
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }
  }

  const token = localStorage.getItem('token');
  const payload = {};

  if (editingField === 'name') payload.name = name;
  if (editingField === 'password' && password) payload.password = password;

  try {
    const res = await axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/user/${user.id}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    login(res.data.user, token);
    setSuccess(true);
    setEditingField(null);
    setPassword('');
    setConfirm('');
  } catch (err) {
    console.error(err);
    setMessage(err.response?.data?.message || 'Update failed.');
  }
};


  if (!user) {
    return <p className="text-center mt-10 text-red-600">Unauthorized.</p>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded shadow-sm space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Ndrysho Llogarinë</h2>

      {/* Name */}
      <div>
        <label className="block mb-1 font-medium">Emri</label>
        {editingField === 'name' ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 border px-3 py-2 rounded"
            />
            <button
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={handleSave}
            >
              Ruaj
            </button>
            <button
              className="bg-gray-400 text-white px-3 py-1 rounded"
              onClick={handleCancel}
            >
              Anullo
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p>{user.name}</p>
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setEditingField('name')}
            >
              Ndrysho
            </button>
          </div>
        )}
      </div>

      {/* Email (Read-Only) */}
      <div>
        <label className="block mb-1 font-medium">Email</label>
        <div className="flex items-center justify-between">
          <p>{user.email}</p>
          <span className="text-gray-500 text-sm italic">I pandryshueshëm</span>
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block mb-1 font-medium">Password</label>
        {editingField === 'password' ? (
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="Passwordi i ri"
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="Konfirmo passwordin"
            />
            <div className="flex gap-2">
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={handleSave}
              >
                Ruaj
              </button>
              <button
                className="bg-gray-400 text-white px-3 py-1 rounded"
                onClick={handleCancel}
              >
                Anullo
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="italic text-gray-500">••••••••</p>
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setEditingField('password')}
            >
              Ndrysho
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {message && (
        <p className="text-red-600 mt-2 text-sm text-center">{message}</p>
      )}
      {success && (
        <p className="text-green-600 mt-2 text-sm text-center">
          Llogaria u ndryshua me sukses.
        </p>
      )}
    </div>
  );
}
