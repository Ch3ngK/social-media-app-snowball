import type { Post, SeedPost } from '@/src/types/Post';

type SeedFile = {
  posts: SeedPost[];
};

const seedData = require('@/src/data/seed.json') as SeedFile;

function normalizeText(value: string | undefined) {
  if (!value) {
    return value;
  }

  try {
    return decodeURIComponent(escape(value));
  } catch {
    return value;
  }
}

export function loadSeedPosts(): Post[] {
  return seedData.posts.map((post, index) => ({
    id: `seed-${index}`,
    title: normalizeText(post.title) ?? '',
    author: normalizeText(post.author) ?? '',
    description: normalizeText(post.description),
    image: post.image,
  }));
}
