import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TiptapEditor from '../../components/TipTapEditor';

export default function NewPost() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [tags, setTags] = useState([]);
  const [customTags, setCustomTags] = useState('');
  const [media, setMedia] = useState(['']);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const availableTags = ['teologji', 'filozofi', 'kulturë', 'politikë', 'histori'];
  const unsignedPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const finalTags = [
      ...tags,
      ...customTags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag !== '')
    ];

    let finalMedia = media;

    if (media[0] instanceof File) {
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', media[0]);
        formData.append('upload_preset', unsignedPreset);
        formData.append('folder', 'posts');

        const uploadRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
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
      const payload = {
        title,
        content,
        tags: finalTags,
        media: finalMedia,
      };

      if (user?.role === 'admin' && authorName.trim()) {
        payload.authorName = authorName.trim();
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage('Post created!');
      navigate(`/posts/${res.data._id}`);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Failed to create post');
    }
  };

  if (!user || user.role !== 'admin') {
    return <p className="text-center mt-10 text-red-600">Hyrja e ndaluar.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Shkruaj një Artikull</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="Titulli"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        {/* Author name field for admin */}
        {user?.role === 'admin' && (
          <input
            type="text"
            placeholder="Emri i autorit"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        )}

        {/* Tag selection */}
        <div>
          <label className="block mb-1 font-medium">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {availableTags.map((tag) => (
              <label key={tag} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  value={tag}
                  checked={tags.includes(tag)}
                  onChange={(e) =>
                    setTags(e.target.checked
                      ? [...tags, tag]
                      : tags.filter((t) => t !== tag))
                  }
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

        {/* Media Upload */}
        <div>
          <label className="block mb-1 font-medium">Foto</label>
          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mediaMethod"
                value="url"
                checked={typeof media[0] === 'string'}
                onChange={() => setMedia([''])}
              />
              URL
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mediaMethod"
                value="upload"
                checked={media[0] instanceof File || media[0] === null}
                onChange={() => setMedia([null])}
              />
              Ngarko Foto
            </label>
          </div>

          {typeof media[0] === 'string' && (
            <input
              type="text"
              placeholder="URL"
              value={media[0]}
              onChange={(e) => setMedia([e.target.value])}
              className="w-full border px-3 py-2 rounded"
            />
          )}

          {(media[0] === null || media[0] instanceof File) && (
            <div>
              <label
                htmlFor="file-upload"
                className="inline-block cursor-pointer bg-gray-800 text-white px-4 py-2 rounded hover:bg-black"
              >
                {media[0] instanceof File ? media[0].name : 'Choose File'}
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setMedia([e.target.files[0]])}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Content Editor */}
        <div>
          <label className="block mb-1 font-medium">Përmbajtja</label>
          <TiptapEditor content={content} setContent={setContent} />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Publiko'}
        </button>

        {message && (
          <p className="mt-4 text-sm text-center text-red-600">{message}</p>
        )}
      </form>
    </div>
  );
}
