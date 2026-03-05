# Cuddles Launch - Quick Start Guide

**Ready to launch Cuddles to production?** Follow this quick reference guide.

---

## 🚀 Pre-Launch Checklist (30 mins)

### 1. Verify Supabase Production Setup
```bash
# ✓ Production Supabase project exists
# ✓ Different from development project
# ✓ Have the URL and anon key ready
```

### 2. Configure EAS Secrets (5 mins)
```bash
npm install -g eas-cli
eas init  # If not done yet

# Push production secrets
eas secret:push --scope project --name SUPABASE_URL_PROD
eas secret:push --scope project --name SUPABASE_ANON_KEY_PROD
eas secret:push --scope project --name ENVIRONMENT
# When prompted, enter the production Supabase URL and key
```

### 3. Verify Configuration
```bash
# Check that app.json has been updated
cat app.json | grep -A 5 "extra"

# Should NOT contain hardcoded SUPABASE_URL or SUPABASE_ANON_KEY
# Should only have "eas": { "projectId": "..." }
```

---

## 🧪 Testing (1-2 hours)

### Quick Feature Test
1. **Open the app in development**
   ```bash
   npm run dev
   ```

2. **Test critical flow**
   - [ ] Register new account
   - [ ] Complete profile setup
   - [ ] Try swiping/matching
   - [ ] Send test message
   - [ ] Edit profile
   - [ ] Logout and login

### Test on Real Devices
```bash
# Android
eas build --platform android --profile preview
# Test APK on Android device

# iOS
eas build --platform ios --profile preview
# Test on iOS simulator/device
```

---

## 📦 Building for Production (20 mins)

### Build Android AAB (for Google Play)
```bash
eas build --platform android
# Wait for build to complete (~10-15 mins)
# Download AAB file
```

### Build iOS IPA (for App Store)
```bash
eas build --platform ios
# Wait for build to complete (~15-20 mins)
# Download IPA file
```

### Check Build Status
```bash
eas build:list
```

---

## 🌐 Publishing to App Stores

### Google Play (Android)
**Time: ~30 mins setup + 2-4 hours review**

1. Go to [Google Play Console](https://play.console.google.com/)
2. Create new app → Upload AAB
3. Fill in:
   - App name: "Cuddles"
   - Category: Dating
   - Privacy policy URL: [Your privacy policy URL]
   - Screenshots (minimum 2-5)
4. Submit for review
5. Wait for approval (typically 2-4 hours)

### App Store (iOS)
**Time: ~30 mins setup + 24-48 hours review**

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Create new app (if not already created)
3. Upload build via:
   - Option A: `eas submit --platform ios` (easiest)
   - Option B: Manual upload via Xcode
4. Fill in:
   - App privacy policy
   - Screenshots
   - App description
5. Submit for review
6. Wait for approval (typically 24-48 hours)

---

## ✅ Verification Before Launch

### Security
- [ ] No hardcoded credentials in code
- [ ] EAS secrets configured
- [ ] RLS policies enabled in Supabase (see `docs/SUPABASE_RLS_CONFIGURATION.md`)
- [ ] Privacy Policy and Terms of Service in app

### Functionality
- [ ] Auth flow works (register, login, password reset)
- [ ] Profile creation works
- [ ] Matching features work
- [ ] Messaging works
- [ ] All error messages are user-friendly

### App Store Readiness
- [ ] App icon is professional (1024×1024)
- [ ] Splash screen is set
- [ ] Screenshots are taken and uploaded
- [ ] Privacy policy is finalized
- [ ] Terms of service is finalized
- [ ] Support email is configured (support@cuddles-app.com)

---

## 📋 Supabase RLS Configuration (30 mins)

**Important**: Enable Row Level Security on all tables.

```bash
# Copy SQL from docs/SUPABASE_RLS_CONFIGURATION.md
# Paste into Supabase SQL Editor
# Run each policy
```

The following tables need RLS:
- `profiles`
- `likes`
- `matches`
- `messages`
- `scheduled_dates`
- `blocks` (if implemented)

And storage buckets:
- `avatars`
- `gallery`
- `dates`

---

## 🔍 Post-Launch (First 24 Hours)

### Monitor
- [ ] Check Supabase logs for errors
- [ ] Monitor app crash reports
- [ ] Watch for user feedback in app store
- [ ] Check that new users can register

### Respond
- [ ] Reply to early reviews (thank users, address concerns)
- [ ] Fix any critical bugs immediately
- [ ] Have support email monitored

### Document
- [ ] Note any issues for future updates
- [ ] Collect user feedback
- [ ] Track new feature requests

---

## 📞 Support & Help

### Documentation
- **Full RLS Guide**: `docs/SUPABASE_RLS_CONFIGURATION.md`
- **Build & Deploy**: `docs/NATIVE_BUILD_SETUP.md`
- **Pre-Launch Checklist**: `docs/PRE_LAUNCH_CHECKLIST.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`

### Key Contacts
- **Supabase Issues**: [Supabase Support](https://supabase.com/support)
- **Expo Issues**: [Expo Docs](https://docs.expo.dev)
- **Google Play**: [Google Play Help](https://support.google.com/googleplay/)
- **App Store**: [App Store Help](https://help.apple.com/app-store-connect/)

---

## 🎯 Timeline

| Phase | Time | Status |
|-------|------|--------|
| Pre-launch verification | 30 mins | ✓ Ready |
| Testing (dev + devices) | 1-2 hours | ✓ Ready |
| Android build | 15 mins | ✓ Ready |
| iOS build | 20 mins | ✓ Ready |
| Google Play submission | 30 mins | ⏳ Ready |
| App Store submission | 30 mins | ⏳ Ready |
| Google Play approval | 2-4 hours | ⏳ Wait |
| App Store approval | 24-48 hours | ⏳ Wait |
| **Total** | **~2-3 days** | |

---

## ⚠️ Common Issues & Fixes

### Build Fails
```bash
eas build --clear-cache
eas build --platform android
```

### RLS Permissions Issues
Verify:
1. RLS is enabled on tables: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
2. Policies use `auth.uid()` correctly
3. Test with multiple user accounts

### Images Not Uploading
Check:
1. Supabase Storage bucket exists
2. Storage RLS policies are correct
3. Bucket is publicly readable

### App Won't Build
```bash
npm install
npm audit fix
npm run build
eas build --platform android --profile preview
```

---

## 🎉 Launch Success Checklist

**You're launched when:**
- ✅ App appears on Google Play
- ✅ App appears on App Store
- ✅ Users can install it
- ✅ First users can register
- ✅ No critical crashes in logs

**You're winning when:**
- ✅ 4+ star average rating
- ✅ Users actively matching
- ✅ Positive reviews coming in
- ✅ Feature requests/feedback

---

## 📱 What's Next?

After launch, track:
1. User signups
2. Feature usage (matching, messaging)
3. App crashes and errors
4. User feedback and reviews
5. Performance metrics

Then prioritize:
- Photo verification system
- Better matching algorithm
- Push notifications
- User retention features

---

**Status**: ✅ Ready to Launch

**Questions?** Check the full documentation in `docs/` folder or `IMPLEMENTATION_SUMMARY.md`.

Good luck! 🚀
