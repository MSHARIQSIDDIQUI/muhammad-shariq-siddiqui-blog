const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    mediaType: { type: String, enum: ['image', 'video', ''], default: '' },
    category: {
      type: String,
      enum: ['Friends', 'Family', 'Books', 'Hobbies', 'My Opinions', 'Gatherings', 'Journeys', 'Diary', 'My Writings'],
      required: true,
    },
    tags: [{ type: String }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.pre('validate', function (next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
