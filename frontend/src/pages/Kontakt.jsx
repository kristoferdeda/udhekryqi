import React, { useState } from 'react';
import axios from 'axios';

export default function Kontakt() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, message } = formData;
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert('Ju lutemi plotësoni të gjitha fushat.');
      return;
    }

    setStatus('sending');
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/contact`, {
        name,
        email,
        message,
      });
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Dërgimi dështoi:', err);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6 text-gray-800">
      <h1 
        style={{ fontFamily: 'Georgia, serif' }}
        className="text-3xl font-bold uppercase text-center">
          Na Kontaktoni
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Emri juaj"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-700"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-700"
        />
        <textarea
          name="message"
          placeholder="Mesazhi juaj"
          rows="6"
          value={formData.message}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-700"
        ></textarea>

        <button
          type="submit"
          className="bg-red-700 text-white px-6 py-2 rounded hover:bg-red-800 transition"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? 'Duke dërguar...' : 'Dërgo Mesazhin'}
        </button>
      </form>

      {status === 'success' && (
        <p className="text-green-700 font-medium">Mesazhi u dërgua me sukses. Faleminderit!</p>
      )}
      {status === 'error' && (
        <p className="text-red-600 font-medium">Dërgimi dështoi. Ju lutemi provoni sërish.</p>
      )}
    </div>
  );
}
