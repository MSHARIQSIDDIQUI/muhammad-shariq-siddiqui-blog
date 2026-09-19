import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreatePost() {
  const navigate = useNavigate();
  const CATEGORIES = ['Friends', 'Family', 'Books', 'Hobbies', 'My Opinions', 'Gatherings', 'Journeys', 'Diary', 'My Writings'];
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    videoUrl: '',
    mediaData: '',
    mediaName: '',
    mediaType: '',
    category: CATEGORIES[0],
    tags: '',
    status: 'published',
  });
  const [error, setError] = useState('');
  const [mediaPreview, setMediaPreview] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm({ ...form, mediaData: file, mediaName: file.name, mediaType: file.type });
    setMediaPreview(URL.createObjectURL(file));
  };

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        mediaData: form.mediaData instanceof File ? await fileToDataUrl(form.mediaData) : '',
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      const res = await api.post('/posts', payload);
      navigate(`/posts/${res.data.post.slug}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    }
  };

  return (
    <div className="post-form">
      <h1>New Post</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <input name="excerpt" placeholder="Short excerpt" value={form.excerpt} onChange={handleChange} />
        <select name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input name="coverImage" placeholder="Cover image URL" value={form.coverImage} onChange={handleChange} />
        <input name="videoUrl" placeholder="Video URL (optional, embeds instead of image)" value={form.videoUrl} onChange={handleChange} />
        <label>
          Choose image or video from this device
          <input type="file" name="media" accept="image/*,video/*" capture="environment" onChange={handleMediaChange} />
        </label>
        <p className="form-help">On your phone, open this app using its network address to choose from your phone gallery or camera.</p>
        {mediaPreview && (form.mediaType.startsWith('video/') ? (
          <video className="media-preview" src={mediaPreview} controls />
        ) : (
          <img className="media-preview" src={mediaPreview} alt="Selected upload preview" />
        ))}
        <input name="tags" placeholder="Tags (comma separated)" value={form.tags} onChange={handleChange} />
        <textarea
          name="content"
          placeholder="Write your post..."
          rows={12}
          value={form.content}
          onChange={handleChange}
          required
        />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button type="submit">Save Post</button>
      </form>
    </div>
  );
}
