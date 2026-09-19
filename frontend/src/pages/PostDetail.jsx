import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import CommentSection from '../components/CommentSection';
import StoryCard from '../components/StoryCard';
import AdSlot from '../components/AdSlot';
import { categoryColor } from '../data/categories';

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    api.get(`/posts/${slug}`).then((res) => {
      const p = res.data.post;
      setPost(p);
      api.get(`/posts?category=${p.category}&limit=4`).then((r) => {
        setRelated(r.data.posts.filter((x) => x._id !== p._id).slice(0, 3));
      });
    });
  }, [slug]);

  if (!post) return <p className="loading-note">Loading story…</p>;

  return (
    <article className="article-page">
      <span className="category-tag" style={{ '--cat-color': categoryColor(post.category) }}>
        {post.category}
      </span>
      <h1>{post.title}</h1>
      {post.excerpt && <p className="article-standfirst">{post.excerpt}</p>}
      <div className="byline article-byline">
        <span>By {post.author?.name}</span>
        <span className="byline-divider" />
        <span>{new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        <span className="byline-divider" />
        <span>{post.views} reads</span>
      </div>

      {post.videoUrl && post.mediaType === 'video' ? (
        <div className="article-media article-media--video">
          <video src={post.videoUrl} controls playsInline />
        </div>
      ) : post.videoUrl ? (
        <div className="article-media article-media--video">
          <iframe
            src={post.videoUrl}
            title={post.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        post.coverImage && (
          <div className="article-media">
            <img src={post.coverImage} alt={post.title} />
          </div>
        )
      )}

      <div className="article-body">
        {post.content.split('\n').filter(Boolean).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <div className="article-ad-wrap">
        <AdSlot size="banner" />
      </div>

      <CommentSection postId={post._id} />

      {related.length > 0 && (
        <section className="related-section">
          <h2>More in {post.category}</h2>
          <div className="category-row">
            {related.map((r) => (
              <StoryCard key={r._id} post={r} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
