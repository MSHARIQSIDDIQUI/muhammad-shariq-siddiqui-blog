import { Link } from 'react-router-dom';
import StoryCard from './StoryCard';
import { categoryColor } from '../data/categories';

export default function CategorySection({ category, posts }) {
  if (!posts || posts.length === 0) return null;
  return (
    <section className="category-section">
      <div className="category-section-head">
        <h2 style={{ '--cat-color': categoryColor(category) }}>{category}</h2>
        <Link to={`/category/${category}`} className="more-link">More in {category}</Link>
      </div>
      <div className="category-row">
        {posts.map((post) => (
          <StoryCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}
