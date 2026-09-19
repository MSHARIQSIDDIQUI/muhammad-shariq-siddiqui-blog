import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../data/categories';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="masthead">
      <div className="masthead-top">
        <span className="masthead-date">{today}</span>
        <div className="masthead-actions">
          {user ? (
            <>
              <Link to="/create">Write a story</Link>
              <Link to="/dashboard">My desk</Link>
              <button onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
      <div className="masthead-brand">
        <Link to="/" className="brand">Muhammad Shariq Siddiqui</Link>
      </div>
      <nav className="category-strip">
        {CATEGORIES.map((c) => (
          <Link key={c.key} to={`/category/${c.key}`} style={{ '--cat-color': c.color }}>
            {c.key}
          </Link>
        ))}
      </nav>
    </header>
  );
}
