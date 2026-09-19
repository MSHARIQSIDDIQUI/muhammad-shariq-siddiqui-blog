import { Link } from 'react-router-dom';
import { categoryColor } from '../data/categories';

export default function StoryCard({ post, size = 'normal' }) {
  return (
    <article className={`story-card story-card--${size}`}>
      <Link to={`/posts/${post.slug}`} className="story-card-media">
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title} />
        ) : (
          <div className="story-card-media-fallback" />
        )}
        {post.videoUrl && <span className="play-badge">▶</span>}
      </Link>
      <div className="story-card-body">
        <span className="category-tag" style={{ '--cat-color': categoryColor(post.category) }}>
          {post.category}
        </span>
        <h3>
          <Link to={`/posts/${post.slug}`}>{post.title}</Link>
        </h3>
        {post.excerpt && <p className="excerpt">{post.excerpt}</p>}
        <div className="byline">
          <span>{post.author?.name}</span>
          <span className="byline-divider" />
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </article>
  );
}
