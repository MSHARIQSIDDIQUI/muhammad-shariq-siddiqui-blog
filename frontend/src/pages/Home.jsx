import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import CategorySection from '../components/CategorySection';
import AdSlot from '../components/AdSlot';
import { categoryColor } from '../data/categories';

export default function Home() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts/front-page').then((res) => {
      setSections(res.data.sections);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="loading-note">Gathering today's stories…</p>;

  const dedupeByKey = (post) => `${(post?.title || '').trim().toLowerCase()}::${(post?.category || '').trim().toLowerCase()}`;
  const allPosts = Array.from(
    new Map(
      sections
        .flatMap((s) => s.posts)
        .map((post) => [dedupeByKey(post), post])
    ).values()
  );
  const lead = allPosts[0];
  const secondary = allPosts.filter((post) => post._id !== lead?._id).slice(0, 3);
  const usedKeys = new Set(
    lead ? [dedupeByKey(lead), ...secondary.map((post) => dedupeByKey(post)).filter(Boolean)] : []
  );
  const remainingSections = sections
    .map((s) => ({
      ...s,
      posts: s.posts.filter((post) => !usedKeys.has(dedupeByKey(post))),
    }))
    .filter((s) => s.posts.length > 0);

  if (!lead) {
    return (
      <div className="empty-front-page">
        <h1>No stories published yet</h1>
        <p>Once posts are published across categories, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="front-page">
      <section className="lead-grid">
        <article className="lead-story">
          <Link to={`/posts/${lead.slug}`} className="lead-story-media">
            {lead.coverImage ? <img src={lead.coverImage} alt={lead.title} /> : <div className="story-card-media-fallback" />}
            {lead.videoUrl && <span className="play-badge">▶</span>}
          </Link>
          <span className="category-tag" style={{ '--cat-color': categoryColor(lead.category) }}>
            {lead.category}
          </span>
          <h1><Link to={`/posts/${lead.slug}`}>{lead.title}</Link></h1>
          <p className="excerpt">{lead.excerpt}</p>
          <div className="byline">
            <span>{lead.author?.name}</span>
            <span className="byline-divider" />
            <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
          </div>
        </article>
        <aside className="secondary-list">
          {secondary.map((post) => (
            <article key={post._id} className="secondary-item">
              <span className="category-tag category-tag--small" style={{ '--cat-color': categoryColor(post.category) }}>
                {post.category}
              </span>
              <h3><Link to={`/posts/${post.slug}`}>{post.title}</Link></h3>
              <div className="byline">
                <span>{post.author?.name}</span>
              </div>
            </article>
          ))}
        </aside>
      </section>

      <div className="sidebar-ad-wrap">
        <AdSlot size="rectangle" />
      </div>

      {remainingSections.map((s, i) => (
        <Fragment key={s.category}>
          <CategorySection category={s.category} posts={s.posts} />
          {i === 1 && (
            <div className="ad-banner-wrap">
              <AdSlot size="banner" />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
