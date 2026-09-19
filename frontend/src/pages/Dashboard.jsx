import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);

  const loadPosts = () => {
    api.get('/posts/mine').then((res) => setPosts(res.data.posts));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    await api.delete(`/posts/${id}`);
    loadPosts();
  };

  return (
    <div className="dashboard">
      <h1>My Posts</h1>
      <Link to="/create" className="new-post-btn">
        + New Post
      </Link>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Views</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post._id}>
              <td>
                <Link to={`/posts/${post.slug}`}>{post.title}</Link>
              </td>
              <td>{post.status}</td>
              <td>{post.views}</td>
              <td>
                <button onClick={() => handleDelete(post._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
