import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import StoryCard from '../components/StoryCard';
import { categoryColor } from '../data/categories';

export default function Category() {
  const { name } = useParams();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [diaryPassword, setDiaryPassword] = useState(() => sessionStorage.getItem('diaryPassword') || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setPage(1);
  }, [name]);

  useEffect(() => {
    setError('');
    const headers = name === 'Diary' && diaryPassword
      ? { 'x-diary-password': diaryPassword }
      : undefined;
    api.get(`/posts?category=${encodeURIComponent(name)}&page=${page}`, { headers }).then((res) => {
      setPosts(res.data.posts);
      setPages(res.data.pages);
    }).catch((err) => {
      setPosts([]);
      setError(err.response?.status === 401 ? 'Enter the diary password to continue.' : 'Unable to load this category.');
    });
  }, [name, page, diaryPassword]);

  const unlockDiary = (e) => {
    e.preventDefault();
    api.get(`/posts?category=Diary&page=1`, {
      headers: { 'x-diary-password': passwordInput },
    }).then((res) => {
      sessionStorage.setItem('diaryPassword', passwordInput);
      setDiaryPassword(passwordInput);
      setPosts(res.data.posts);
      setPages(res.data.pages);
      setPasswordInput('');
    }).catch(() => {
      setError('Incorrect diary password.');
    });
  };

  return (
    <div className="category-page">
      <h1 style={{ '--cat-color': categoryColor(name) }}>{name}</h1>
      {name === 'Diary' && error && (
        <form className="auth-form" onSubmit={unlockDiary}>
          <p>{error}</p>
          <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Diary password" required />
          <button type="submit">Unlock Diary</button>
        </form>
      )}
      {name !== 'Diary' && error && <p className="error">{error}</p>}
      {posts.length === 0 ? (
        <p className="loading-note">No stories in {name} yet.</p>
      ) : (
        <div className="category-page-grid">
          {posts.map((post) => (
            <StoryCard key={post._id} post={post} size="large" />
          ))}
        </div>
      )}
      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span>Page {page} of {pages || 1}</span>
        <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}
