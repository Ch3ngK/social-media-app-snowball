export const MAX_TITLE_LENGTH = 25;

export function getCharacterCount(value: string) {
  return Array.from(value).length;
}

export function validatePostTitle(title: string) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return 'Title is required.';
  }

  if (getCharacterCount(trimmedTitle) > MAX_TITLE_LENGTH) {
    return `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  return null;
}

export function validateRequiredField(value: string, fieldName: string) {
  if (!value.trim()) {
    return `${fieldName} is required.`;
  }

  return null;
}
