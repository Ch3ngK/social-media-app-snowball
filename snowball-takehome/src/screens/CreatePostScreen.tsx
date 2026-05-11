import { router } from 'expo-router';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { usePosts } from '../lib/posts-store';
import { MAX_TITLE_LENGTH, getCharacterCount, validatePostTitle, validateRequiredField } from '@/src/lib/validation';

export default function CreatePostScreen() {
  const { addPost } = usePosts();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleCount = getCharacterCount(title);

  const handlePickImage = async () => {
    setError('');

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('Photo library permission is needed to attach an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const titleError = validatePostTitle(title);

    if (titleError) {
      setError(titleError);
      return;
    }

    const authorError = validateRequiredField(author, 'Author');

    if (authorError) {
      setError(authorError);
      return;
    }

    setIsSubmitting(true);

    try {
      await addPost({
        title: title.trim(),
        author: author.trim(),
        description: description.trim() || undefined,
        image: imageUri || undefined,
      });

      setTitle('');
      setAuthor('');
      setDescription('');
      setImageUri('');
      setError('');

      Alert.alert('Post created', 'Your post has been added to the feed.');
      router.navigate('/(tabs)');
    } catch {
      setError('We could not save your post right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>Share something new</Text>
          <Text style={styles.title}>Create Post</Text>
          <Text style={styles.subtitle}>
            Title and author are required. Posts appear at the top of the feed as soon as you submit.
          </Text>

          <View style={styles.form}>
            <View>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Title</Text>
                <Text style={styles.helperText}>
                  {titleCount}/{MAX_TITLE_LENGTH}
                </Text>
              </View>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="What is this post about?"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                maxLength={MAX_TITLE_LENGTH}
              />
            </View>

            <View>
              <Text style={styles.label}>Author</Text>
              <TextInput
                value={author}
                onChangeText={setAuthor}
                placeholder="Your name or username"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </View>

            <View>
              <Text style={styles.label}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add some context if you want"
                placeholderTextColor="#94A3B8"
                style={[styles.input, styles.textArea]}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View>
              <Text style={styles.label}>Image</Text>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => void handlePickImage()}
                disabled={isSubmitting}
              >
                <Text style={styles.secondaryButtonText}>
                  {imageUri ? 'Change Image' : 'Choose Image'}
                </Text>
              </Pressable>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.previewImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.helperText}>Optional. Supports common image formats.</Text>
              )}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
              onPress={() => void handleSubmit()}
              disabled={isSubmitting}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Creating Post...' : 'Create Post'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
  form: {
    marginTop: 24,
    gap: 18,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    color: '#64748B',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DEE7',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 120,
  },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  previewImage: {
    marginTop: 12,
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
