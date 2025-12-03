# Cuddles App - React Native Dating Application

## Overview
Cuddles is a React Native dating application built with Expo Router. The app features user authentication via Supabase, profile management, matching system, messaging, and scheduled dates functionality.

## Tech Stack
- **Framework**: React Native with Expo SDK 54
- **Routing**: Expo Router v6
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Backend**: Supabase (Authentication & Database)
- **State Management**: React Hooks
- **Platform**: Web (can be extended to iOS/Android)

## Project Structure
```
app/
  (auth)/              - Authentication screens (login, register, onboarding)
    (onboarding)/      - Multi-step onboarding flow
  (main)/              - Main app screens (home, matches, messages)
  (screens)/           - Additional screens (profile, settings, dates, chat)
components/            - Reusable React components
lib/                   - Utilities and helpers (Supabase client, location, etc.)
assets/                - Images and static files
```

## Recent Setup (December 3, 2025)
- Configured for Replit environment with Expo web server on port 5000
- Fixed babel configuration (removed deprecated expo-router/babel plugin)
- Fixed missing default exports in route files (Likes.tsx, match.tsx)
- Added missing React imports (useState, useEffect)
- Configured deployment for static build to `web-build` directory

## Development

### Running the App
The app runs automatically via the workflow "Start application" which executes:
```bash
npm run web
```

This starts Expo Metro bundler on port 5000 for web development.

### Environment Configuration
Supabase credentials are configured in `app.json` under `expo.extra`:
- `SUPABASE_URL`: https://hjoyrbecacivlfcnvnwc.supabase.co
- `SUPABASE_ANON_KEY`: Configured in app.json
- `BYPASS_AUTH`: Currently set to true for development

### Key Features
1. **Authentication Flow**: Login, registration, and password reset
2. **Onboarding**: Multi-step profile setup (name, gender, interests)
3. **Matching System**: Swipe-based matching with favorites
4. **Messaging**: Real-time chat functionality
5. **Scheduled Dates**: Create and manage date schedules
6. **Profile Management**: Edit profile and preferences
7. **Location-based**: Uses Expo Location for proximity features

## Configuration Files
- `app.json`: Expo configuration with platform-specific settings
- `babel.config.js`: Babel preset for Expo with NativeWind support
- `metro.config.js`: Metro bundler configuration with NativeWind integration
- `tailwind.config.js`: TailwindCSS configuration with custom theme
- `package.json`: Dependencies and scripts

## Known Issues & Warnings
- Some package versions are slightly outdated (see npm warnings during install)
- Node.js version is slightly below recommended (20.19.3 vs 20.19.4)
- Firebase has peer dependency conflict with AsyncStorage version
- Image resizeMode prop deprecation warning

## Deployment
The app is configured for static deployment:
- Build command: `npx expo export --platform web --output-dir web-build`
- Output directory: `web-build`
- Deployment type: Static site

## Dependencies
Main dependencies include:
- expo ~54.0.9
- react-native 0.81.4
- @supabase/supabase-js ^2.76.1
- expo-router ~6.0.13
- nativewind ^4.2.1
- react-native-reanimated ^4.1.3
- And many more (see package.json)

## Notes
- This is a web-focused build using Expo's web support
- The app uses Metro bundler (not Webpack) for Expo SDK 54+
- NativeWind provides TailwindCSS styling for React Native components
- Authentication can be bypassed in development mode via BYPASS_AUTH flag
