require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });

  const docs = await Post.find({ status: 'published' }).sort({ createdAt: 1 }).lean();
  const groups = new Map();

  for (const post of docs) {
    const key = `${(post.title || '').trim()}::${(post.category || '').trim()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(post);
  }

  let deletedTotal = 0;
  for (const group of groups.values()) {
    if (group.length <= 1) continue;

    const keep = group[group.length - 1]._id.toString();
    const toDelete = group
      .filter((post) => post._id.toString() !== keep)
      .map((post) => post._id);

    if (toDelete.length > 0) {
      const result = await Post.deleteMany({ _id: { $in: toDelete } });
      deletedTotal += result.deletedCount || toDelete.length;
      console.log('Kept:', keep, 'Deleted:', toDelete.length);
    }
  }

  console.log('Deleted total:', deletedTotal);
  await mongoose.disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
