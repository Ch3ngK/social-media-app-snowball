# Snowball Social

React Native + Expo take-home assignment for a simple social media app with local authentication, a seeded feed, and post creation.

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the Expo dev server

   ```bash
   npx expo start
   ```

3. Run the app locally

   ```bash
   npm run android
   ```

   You can also press `w` in the Expo terminal to run the web build locally.

## Demo Login

- Biometric login is the preferred path when supported by the device
- Email: `demo@snowball.app`
- Password: `password123`

## Testing

- Run lint:

  ```bash
  npx expo lint
  ```

- Optional web verification:

  ```bash
  npx expo export --platform web
  ```

- Manual checks:
  - Log in with biometrics or the demo email/password
  - Confirm the seeded feed loads
  - Create a new post and verify it appears immediately in the feed
  - Pick an image from the device and confirm it renders in the new post

## Seed Data Optimization

1. `FlatList` is used instead of `ScrollView` so only visible rows and a small buffer are rendered.
2. `expo-image` is used for better image performance and images are rendered only when a post includes one.
3. In development mode, React Native may log `VirtualizedList: You have a large list that is slow to update` because the seeded dataset is large. This is a development performance warning rather than a functional error, and the feed was optimized with `FlatList`, memoized post cards, and stable list callbacks to reduce unnecessary re-renders.

## Devices Tested

1. Android emulator via Android Studio
2. Web export verified locally on Windows

## Authentication and Security Notes

1. Preferred login path is device biometrics via `expo-local-authentication`, with local email/password as the fallback.
2. Sessions are stored in `expo-secure-store`, expire after 12 hours, and corrupted or expired sessions are cleared automatically.
3. Password logins are rate-limited locally: after 5 failed attempts, login is locked for 5 minutes.
4. After each app launch, stored biometric sessions require re-authentication before access is restored. Users can use their biometrics or PIN to re-authenticate. 
5. Authentication is intentionally local-only for the take-home assignment. No third-party OAuth providers are used.
