export type Post = {
  id: string;
  title: string;
  author: string;
  description?: string;
  image?: string;
};

export type SeedPost = Omit<Post, 'id'>;
