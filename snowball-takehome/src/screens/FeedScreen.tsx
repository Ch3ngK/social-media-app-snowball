import { useCallback } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View, type ListRenderItem } from 'react-native';
import { router } from 'expo-router';

import PostCard from '@/src/components/PostCard';
import { useAuth } from '@/src/lib/auth-store';
import { usePosts } from '../lib/posts-store';
import type { Post } from '@/src/types/Post';

const keyExtractor = (item: Post) => item.id;

const renderItem: ListRenderItem<Post> = ({ item }) => <PostCard post={item} />;

export default function FeedScreen() {
  const { isHydrated, posts } = usePosts();
  const { logout, session } = useAuth();
  const emptyMessage = isHydrated
    ? 'No posts yet. Create one to get the feed started.'
    : 'Loading posts...';

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace('/login');
  }, [logout]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.eyebrow}>Snowball Social</Text>
          <Pressable style={styles.logoutButton} onPress={() => void handleLogout()}>
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>Feed</Text>
        <Text style={styles.subtitle}>
          Browse posts from every user. New posts appear here immediately after they are created.
        </Text>
        <Text style={styles.sessionText}>Signed in as {session?.email}</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{emptyMessage}</Text>
          </View>
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        windowSize={7}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#0F766E',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  sessionText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  logoutButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
  },
});
