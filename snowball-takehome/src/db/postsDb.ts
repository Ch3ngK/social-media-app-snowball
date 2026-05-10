import type { SQLiteDatabase } from 'expo-sqlite';

import type { Post, SeedPost } from '@/src/types/Post';

type SeedFile = {
  posts: SeedPost[];
};

type PostRow = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  image: string | null;
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

function mapRowToPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    description: row.description ?? undefined,
    image: row.image ?? undefined,
  };
}

function getSeedPosts(): Post[] {
  return seedData.posts.map((post, index) => ({
    id: `seed-${index}`,
    title: normalizeText(post.title) ?? '',
    author: normalizeText(post.author) ?? '',
    description: normalizeText(post.description),
    image: post.image,
  }));
}

export async function initializePostsDb(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      description TEXT,
      image TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM posts');
  const postCount = result?.count ?? 0;

  if (postCount > 0) {
    return;
  }

  const seedPosts = getSeedPosts();

  await db.withTransactionAsync(async () => {
    for (const [index, post] of seedPosts.entries()) {
      await db.runAsync(
        `INSERT INTO posts (id, title, author, description, image, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        post.id,
        post.title,
        post.author,
        post.description ?? null,
        post.image ?? null,
        seedPosts.length - index
      );
    }
  });
}

export async function getPosts(db: SQLiteDatabase): Promise<Post[]> {
  const rows = await db.getAllAsync<PostRow>(
    `SELECT id, title, author, description, image
     FROM posts
     ORDER BY created_at DESC`
  );

  return rows.map(mapRowToPost);
}

export async function createPost(
  db: SQLiteDatabase,
  post: Omit<Post, 'id'>
): Promise<Post> {
  const createdAt = Date.now();
  const id = `local-${createdAt}-${Math.random().toString(36).slice(2, 8)}`;

  await db.runAsync(
    `INSERT INTO posts (id, title, author, description, image, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    id,
    post.title,
    post.author,
    post.description ?? null,
    post.image ?? null,
    createdAt
  );

  return {
    id,
    title: post.title,
    author: post.author,
    description: post.description,
    image: post.image,
  };
}
