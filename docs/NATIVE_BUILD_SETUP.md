# Native Build Setup Guide

This guide walks you through preparing the Cuddles app for native builds on iOS and Android using Expo Application Services (EAS).

## Prerequisites

- [ ] Supabase project configured (with RLS policies enabled)
- [ ] Production Supabase credentials ready
- [ ] Google Play Developer Account (for Android)
- [ ] Apple Developer Account (for iOS, optional but recommended)
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Expo account created

## Part 1: EAS Setup

### 1.1 Initialize EAS

```bash
eas init
```

This will:
- Create `.easrc` file with your EAS credentials
- Register your app with Expo
- Set up build configuration

### 1.2 Configure EAS Secrets

Store your production Supabase credentials securely:

```bash
eas secret:push --scope project --name SUPABASE_URL_PROD
eas secret:push --scope project --name SUPABASE_ANON_KEY_PROD
eas secret:push --scope project --name ENVIRONMENT
```

When prompted, enter:
- `SUPABASE_URL_PROD`: Your production Supabase URL
- `SUPABASE_ANON_KEY_PROD`: Your production anon key
- `ENVIRONMENT`: `production`

## Part 2: Android Build Setup

### 2.1 Google Play Console Setup

1. Go to [Google Play Console](https://play.console.google.com/)
2. Create a new project
3. Fill in app details:
   - App name: "Cuddles"
   - Default language: English (US)
   - App category: Dating
4. Accept the declaration of compliance with children's policies if applicable
5. Accept Google Play policies

### 2.2 Create Signing Key

Generate a new signing key (EAS will handle this):

```bash
eas build --platform android --latest
```

On first run, EAS will ask if you want it to create a signing key. **Say yes** - EAS will manage it securely.

### 2.3 Update Android Configuration in app.json

The `package` field should match your app:
```json
"android": {
  "package": "com.cuddlesapp.mobile"
}
```

Update the version code for each new build:
```json
"android": {
  "versionCode": 1
}
```

### 2.4 Build for Android

#### Test Build (APK)
```bash
eas build --platform android --profile preview
```

This creates an APK for testing on your device.

#### Production Build (AAB)
```bash
eas build --platform android
```

This creates an Android App Bundle for Google Play.

### 2.5 Submit to Google Play

1. Go to Google Play Console
2. Create a new release in Internal Testing
3. Upload the built AAB file
4. Review the app:
   - App name
   - Screenshots
   - Category
   - Content rating questionnaire
   - Privacy policy (required)
   - Target audience
5. Submit for review (review takes 2-4 hours typically)

**Google Play Submission Checklist:**
- [ ] App icon uploaded
- [ ] Screenshots (minimum 2-5 per screen size)
- [ ] Feature graphic
- [ ] Privacy policy URL
- [ ] Content rating form completed
- [ ] Target audience specified
- [ ] App description and short description

## Part 3: iOS Build Setup

### 3.1 Apple Developer Account

1. Enroll in Apple Developer Program ($99/year)
2. Create an Apple ID
3. Go to [App Store Connect](https://appstoreconnect.apple.com/)

### 3.2 Create App on App Store Connect

1. Go to "My Apps" → "+" → "New App"
2. Select "iOS"
3. Fill in:
   - App Name: "Cuddles"
   - Platform: iOS
   - Primary Language: English
   - Bundle ID: `com.cuddlesapp.mobile`
   - SKU: `com.cuddlesapp.mobile` (can be same as bundle ID)
4. Click "Create"

### 3.3 Update iOS Configuration in app.json

```json
"ios": {
  "bundleIdentifier": "com.cuddlesapp.mobile",
  "buildNumber": "1",
  "deploymentTarget": "13.0"
}
```

### 3.4 Create Signing Certificates (First Time Only)

```bash
eas build --platform ios --latest
```

On first run, EAS will prompt you to create signing certificates. Follow the prompts to:
- Create an App ID
- Create distribution and development certificates
- Create provisioning profiles

EAS manages these securely in the cloud.

### 3.5 Build for iOS

#### Test Build (Simulator)
```bash
eas build --platform ios --profile preview
```

#### Ad Hoc Build (Testing on real devices)
```bash
eas build --platform ios --profile preview
```

#### Production Build (App Store)
```bash
eas build --platform ios
```

### 3.6 Submit to App Store

**Option A: Using EAS Submit (Recommended)**

```bash
eas submit --platform ios
```

EAS will:
- Ask for your credentials
- Submit to App Store Connect
- Manage the submission process

**Option B: Manual Submission**

1. Download the `.ipa` file from EAS
2. Open Xcode → Organizer
3. Select your app
4. Click "Distribute App"
5. Follow the App Store submission flow

**App Store Submission Checklist:**
- [ ] App icon (1024×1024)
- [ ] Screenshots (minimum 2 per orientation)
- [ ] Preview video (optional)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] App category
- [ ] Content rating questionnaire
- [ ] COPPA certification (if targeting children)
- [ ] Keyboard capability declaration
- [ ] Export compliance information

## Part 4: Environment Configuration

### 4.1 Development Build

For local development, use development credentials:

```bash
# .env.local (gitignored)
ENVIRONMENT=development
SUPABASE_URL_DEV=https://your-dev-project.supabase.co
SUPABASE_ANON_KEY_DEV=your-dev-key
```

### 4.2 Production Build

Production builds automatically use EAS Secrets:

```bash
# Configured in EAS
ENVIRONMENT=production
SUPABASE_URL_PROD=<set via eas secret:push>
SUPABASE_ANON_KEY_PROD=<set via eas secret:push>
```

## Part 5: Testing Before Release

### Android Testing

1. **Internal Testing:**
   ```bash
   eas build --platform android --profile preview
   ```
   - Install APK on device or emulator
   - Test all core features:
     - Login/Registration
     - Profile completion
     - Swiping/Matching
     - Messaging
     - Date scheduling
   - Test permissions (location, photos, camera)
   - Test error states (no internet, etc.)

2. **Alpha/Beta:**
   - Upload to Google Play
   - Select testers via email
   - Get feedback for 1-2 weeks
   - Fix any issues
   - Promote to wider beta if needed

### iOS Testing

1. **Development Build:**
   ```bash
   eas build --platform ios --profile preview
   ```
   - Test on physical device via TestFlight
   - Run through feature checklist

2. **TestFlight Beta:**
   - Upload build to TestFlight
   - Add testers
   - Gather feedback
   - Fix issues

## Part 6: Deployment Checklist

### Pre-Release

- [ ] All environment variables configured in EAS secrets
- [ ] RLS policies enabled and tested in Supabase
- [ ] Privacy Policy and Terms of Service finalized
- [ ] App icons and splash screens added
- [ ] Tested on real Android and iOS devices
- [ ] All critical user flows tested (auth, matching, messaging)
- [ ] Error handling tested (network failures, etc.)
- [ ] App version and build numbers set correctly

### Android Release

- [ ] Create release notes
- [ ] Upload AAB to Google Play
- [ ] Fill in store listing:
  - Screenshots
  - Feature graphic
  - Description
  - Category
  - Content rating
- [ ] Review compliance requirements
- [ ] Submit for review
- [ ] Wait for approval (2-4 hours typical)
- [ ] Publish

### iOS Release

- [ ] Create app record in App Store Connect
- [ ] Upload build
- [ ] Fill in app information:
  - Screenshots
  - Description
  - Keywords
  - Support URL
  - Privacy policy
- [ ] Submit for review
- [ ] Wait for approval (24-48 hours typical)
- [ ] Publish when approved

## Part 7: Version Management

### Version Numbering

- **version** in app.json: `1.0.0` (semantic versioning for public releases)
- **Android versionCode**: Incremental number (1, 2, 3, ...)
- **iOS buildNumber**: Incremental number (1, 2, 3, ...)

### Incrementing for New Releases

```json
{
  "version": "1.0.1",
  "android": {
    "versionCode": 2
  },
  "ios": {
    "buildNumber": "2"
  }
}
```

## Part 8: Monitoring & Updates

### After Release

1. Monitor app crashes via Supabase logs
2. Monitor user feedback in app store reviews
3. Respond to reviews and feedback
4. Plan updates based on feedback

### Over-the-Air Updates

The app is configured for EAS Updates:

```json
"updates": {
  "url": "https://u.expo.dev/cuddles-app-prod",
  "enabled": true,
  "checkOnLaunch": "always"
}
```

**To Deploy an Update:**

1. Make code changes
2. Increment version if needed
3. Publish update:
   ```bash
   eas update --message "Fixed matching bug"
   ```
4. Update will be available to users on next app launch

## Troubleshooting

**Build Fails with "Credentials Needed"**
```bash
eas build --platform android --clear-cache
```

**Signing Issues on iOS**
- Re-authorize your Apple credentials: `eas credentials`
- Update signing certificates if expired

**App Won't Install from Google Play**
- Ensure bundle ID matches signing certificate
- Check minSdkVersion compatibility
- Test on device with that SDK version

**TestFlight Not Receiving Build**
- Check build status: `eas build:list`
- Verify AppleID has correct permissions
- Manually upload if EAS submit fails

## References

- [Expo EAS Documentation](https://docs.expo.dev/eas/)
- [EAS Build Configuration](https://docs.expo.dev/eas-update/build-configuration/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
