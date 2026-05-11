import { memo } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import type { Post } from '@/src/types/Post';

export type PostCardProps = {
  post: Post;
};

function PostCard({ post }: PostCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.author}>by {post.author}</Text>
      </View>

      {post.description ? <Text style={styles.description}>{post.description}</Text> : null}

      {post.image ? (
        <Image
          source={{ uri: post.image }}
          style={styles.image}
          contentFit="cover"
          transition={150}
        />
      ) : null}
    </View>
  );
}

export default memo(PostCard, (previousProps, nextProps) => {
  return previousProps.post === nextProps.post;
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  description: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 21,
    color: '#374151',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginTop: 14,
    backgroundColor: '#E5E7EB',
  },
});
