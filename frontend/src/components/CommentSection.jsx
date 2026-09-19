import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  const loadComments = () => {
    api.get(`/comments/post/${postId}`).then((res) => setComments(res.data.comments));
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await api.post(`/comments/post/${postId}`, { content: text });
    setText('');
    loadComments();
  };

  const handleDelete = async (id) => {
    await api.delete(`/comments/${id}`);
    loadComments();
  };

  return (
    <section className="comments">
      <h3>Comments</h3>
      {user && (
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
          />
          <button type="submit">Post Comment</button>
        </form>
      )}
      <ul>
        {comments.map((c) => (
          <li key={c._id}>
            <strong>{c.author?.name}</strong>: {c.content}
            {user && (user.id === c.author?._id || user.role === 'admin') && (
              <button onClick={() => handleDelete(c._id)}>Delete</button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
