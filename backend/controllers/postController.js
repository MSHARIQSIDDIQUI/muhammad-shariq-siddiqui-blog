const Post = require('../models/Post');
const { v2: cloudinary } = require('cloudinary');

const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const diaryAccessAllowed = (req) => process.env.DIARY_PASSWORD
  && req.get('x-diary-password') === process.env.DIARY_PASSWORD;

const saveUploadedMedia = (mediaData, mediaType) => {
  if (!mediaData) return { coverImage: '', videoUrl: '', mediaType: '' };
  if (!['image/', 'video/'].some((prefix) => mediaType.startsWith(prefix))) {
    const error = new Error('Only image and video files are supported');
    error.status = 400;
    throw error;
  }

  const base64 = mediaData.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length > 50 * 1024 * 1024) {
    const error = new Error('Media files must be 50 MB or smaller');
    error.status = 413;
    throw error;
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    const error = new Error('Cloudinary upload is not configured on the server');
    error.status = 503;
    throw error;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder: 'blog-cms', resource_type: 'auto' },
      (error, result) => {
        if (error) {
          reject(Object.assign(new Error(error.message || 'Cloudinary upload failed'), { status: 502 }));
          return;
        }
        resolve(mediaType.startsWith('video/')
          ? { coverImage: '', videoUrl: result.secure_url, mediaType: 'video' }
          : { coverImage: result.secure_url, videoUrl: '', mediaType: 'image' });
      }
    );
    upload.end(buffer);
  });
};

exports.getPosts = async (req, res) => {
  try {
    const { tag, category, status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (tag) filter.tags = tag;
    if (category) filter.category = category;
    if (category === 'Diary' && !diaryAccessAllowed(req)) {
      return res.status(401).json({ message: 'Diary password required' });
    }
    filter.status = status || 'published';

    const posts = await Post.find(filter)
      .populate('author', 'name avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Post.countDocuments(filter);
    res.json({ posts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// One published post per category, most recent first — powers the homepage sections
exports.getFrontPage = async (req, res) => {
  try {
    const categories = ['Friends', 'Family', 'Books', 'Hobbies', 'My Opinions', 'Gatherings', 'Journeys', 'My Writings'];
    const sections = await Promise.all(
      categories.map(async (category) => {
        const posts = await Post.find({ category, status: 'published' })
          .populate('author', 'name avatar')
          .sort('-createdAt')
          .limit(4);
        return { category, posts };
      })
    );
    res.json({ sections: sections.filter((s) => s.posts.length > 0) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate('author', 'name avatar');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.category === 'Diary' && !diaryAccessAllowed(req)) {
      return res.status(401).json({ message: 'Diary password required' });
    }
    await Post.updateOne({ _id: post._id }, { $inc: { views: 1 } });
    post.views += 1;
    res.json({ post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const {
      title, content, excerpt, coverImage, videoUrl, mediaType, mediaData, mediaName, category, tags, status,
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category are required' });
    }

    const existing = await Post.findOne({
      title: { $regex: `^${escapeRegExp(title.trim())}$`, $options: 'i' },
      category,
      status: 'published',
    }).sort('-createdAt');

    if (existing) {
      return res.status(409).json({ message: 'A story with this title already exists in this category.' });
    }

    const uploadedMedia = await saveUploadedMedia(mediaData, mediaType || '');
    const post = await Post.create({
      title,
      content,
      excerpt,
      coverImage: uploadedMedia.coverImage || coverImage,
      videoUrl: uploadedMedia.videoUrl || videoUrl,
      mediaType: uploadedMedia.mediaType || mediaType || '',
      category,
      tags,
      status,
      author: req.user._id,
    });
    res.status(201).json({ post });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (String(post.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }
    Object.assign(post, req.body);
    await post.save();
    res.json({ post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (String(post.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort('-createdAt');
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
