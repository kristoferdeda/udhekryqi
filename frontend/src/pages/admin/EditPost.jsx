// src/pages/admin/EditPost.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

export default function EditPost() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: [],
    media: ['']
  });
  const [customTags, setCustomTags] = useState('');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const allTags = ['teologji', 'filozofi', 'kulturë', 'politikë', 'histori'];

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/posts/${id}`)
      .then(res => {
        setForm({
          title: res.data.title,
          content: res.data.content,
          tags: res.data.tags || [],
          media: res.data.media.length ? res.data.media : ['']
        });
      })
      .catch(() => setMessage('Failed to load post.'));
  }, [id]);

  const handleCheckbox = (tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Merge tags
    const finalTags = [
      ...form.tags,
      ...customTags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag)
    ];

    let finalMedia = form.media;

    if (form.media[0] instanceof File) {
      try {
        setUploading(true);

        const formData = new FormData();
        formData.append('file', form.media[0]);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        const uploadRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData
        );

        finalMedia = [uploadRes.data.secure_url];
        setUploading(false);
      } catch (err) {
        console.error(err);
        setMessage('Failed to upload media.');
        setUploading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${id}`,
        {
          ...form,
          tags: finalTags,
          media: finalMedia,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      navigate(`/posts/${id}`);
    } catch (err) {
      setMessage('Failed to update post.');
    }
  };

  if (!user || user.role !== 'admin') {
    return <p className="text-center mt-10 text-red-600">Unauthorized.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ndrysho Artikullin</h1>
        <Link
          to={`/posts/${id}`}
          className="text-sm text-red-700 hover:underline"
        >
          Shih Artikullin
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
          className="w-full border px-3 py-2 rounded"
        />

        <div>
          <label className="block mb-1 font-medium">Foto</label>
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mediaType"
                checked={typeof form.media[0] === 'string'}
                onChange={() => setForm(prev => ({ ...prev, media: [''] }))}
              />
              URL
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mediaType"
                checked={form.media[0] instanceof File || form.media[0] === null}
                onChange={() => setForm(prev => ({ ...prev, media: [null] }))}
              />
              Ngarko Foton
            </label>
          </div>

          {typeof form.media[0] === 'string' && (
            <input
              type="text"
              name="media"
              placeholder="Media URL"
              value={form.media[0]}
              onChange={(e) => setForm(prev => ({ ...prev, media: [e.target.value] }))}
              className="w-full border px-3 py-2 rounded"
            />
          )}

          {(form.media[0] === null || form.media[0] instanceof File) && (
            <div>
              <label
                htmlFor="file-upload"
                className="inline-block cursor-pointer bg-gray-800 text-white px-4 py-2 rounded hover:bg-black"
              >
                {form.media[0] instanceof File ? form.media[0].name : 'Choose File'}
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setForm(prev => ({ ...prev, media: [e.target.files[0]] }))}
                className="hidden"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {allTags.map((tag) => (
              <label key={tag} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={form.tags.includes(tag)}
                  onChange={() => handleCheckbox(tag)}
                />
                {tag}
              </label>
            ))}
          </div>
          <input
            type="text"
            placeholder="Shto tjera tags, të ndarë me presje"
            value={customTags}
            onChange={(e) => setCustomTags(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <textarea
          name="content"
          rows={8}
          value={form.content}
          onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
          className="w-full border px-3 py-2 rounded"
        />

        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900"
          disabled={uploading}
        >
          {uploading ? 'Updating...' : 'Ndrysho Artikullin'}
        </button>

        {message && <p className="text-red-600">{message}</p>}
      </form>
    </div>
  );
}
