# Cuddles App - Pre-Launch Verification Checklist

Complete this checklist before launching Cuddles to the App Store and Google Play.

## Security & Compliance (CRITICAL)

### Authentication & Credentials
- [ ] **Supabase credentials removed from app.json** - Verify hardcoded keys are gone
- [ ] **Production Supabase project created** - Separate from development
- [ ] **Environment variables configured in EAS Secrets**:
  - [ ] SUPABASE_URL_PROD
  - [ ] SUPABASE_ANON_KEY_PROD
  - [ ] ENVIRONMENT=production
- [ ] **GitHub Actions workflow tested** - Credentials properly injected at build time
- [ ] **BYPASS_AUTH disabled** - Set to false in production config

### Data Protection
- [ ] **RLS policies enabled on all Supabase tables**:
  - [ ] profiles
  - [ ] likes
  - [ ] matches
  - [ ] messages
  - [ ] scheduled_dates
  - [ ] blocks (if implemented)
- [ ] **Storage bucket policies configured**:
  - [ ] avatars (private upload, public read)
  - [ ] gallery (private upload, public read)
  - [ ] dates (private upload, public read)
- [ ] **RLS policies tested** - Test with multiple user accounts
- [ ] **No sensitive data logged** - Remove/redact console.log statements

### Privacy & Legal
- [ ] **Privacy Policy screen complete** - Comprehensive and production-ready
- [ ] **Terms of Service screen complete** - Comprehensive and production-ready
- [ ] **GDPR compliance documentation** - DataPrivacyGDPR screen finalized
- [ ] **T&S and Privacy links functional** - Links work in Register screen
- [ ] **Privacy policy URL configured** - Ready for app store submission
- [ ] **Terms of service URL configured** - Ready for app store submission
- [ ] **Support email configured** - privacy@cuddles-app.com mentioned in policies
- [ ] **Data deletion process documented** - Users can delete accounts and data

## Code Quality & Error Handling

### Error Handling
- [ ] **Auth flow errors handled** - Graceful failures in login/register
- [ ] **Network errors handled** - User-friendly messages displayed
- [ ] **File upload errors handled** - Image uploads fail gracefully
- [ ] **Supabase query errors handled** - No crashes on DB errors
- [ ] **Loading states display correctly** - Users see feedback during operations
- [ ] **Error messages are user-friendly** - No technical jargon

### Image Uploads & Storage
- [ ] **Avatar uploads work** - ProfileName, EditProfile, MyProfile
- [ ] **Gallery uploads work** - MyProfile can add multiple images
- [ ] **Date image uploads work** - ScheduleDate screen functions
- [ ] **Image deletion works** - Users can delete photos
- [ ] **Image deletion from storage works** - Files actually removed from Supabase
- [ ] **No Cloudinary references remain** - Completely migrated to Supabase Storage

### Code Issues
- [ ] **No unused imports** - Clean up imports
- [ ] **No console errors** - Test console is clean
- [ ] **No console.error logs** - Remove debug logging
- [ ] **No hardcoded URLs** - Use environment variables
- [ ] **Dependencies audited** - Run `npm audit` and fix vulnerabilities
  - [ ] Firebase removed if not used
  - [ ] All dependencies are necessary

## Functionality Testing

### Authentication Flow
- [ ] **User registration works**
  - [ ] Email validation works
  - [ ] Password strength checked
  - [ ] Terms/Privacy acceptance required
- [ ] **User login works**
  - [ ] Valid credentials accepted
  - [ ] Invalid credentials rejected
  - [ ] Error messages display correctly
- [ ] **Password reset works**
  - [ ] Reset email sent
  - [ ] Password update successful
  - [ ] Can login with new password
- [ ] **Session persistence works**
  - [ ] User stays logged in after app close
  - [ ] Session survives app restart
- [ ] **Logout works** - User is properly signed out

### Onboarding Flow
- [ ] **Profile picture upload works**
  - [ ] Image picker opens
  - [ ] Cropping works
  - [ ] Image uploads to Supabase
  - [ ] Public URL returned
- [ ] **Name, birthday validation works** - 18+ age check enforced
- [ ] **Location picker works** - Can select location
- [ ] **All onboarding screens complete**
  - [ ] ProfileName screen
  - [ ] Gender screen
  - [ ] Interests screen
  - [ ] Preferences screen (if any)
- [ ] **Profile completion flow works** - User redirected to main app after onboarding

### Matching & Discovery
- [ ] **Swipe/matching interface works**
  - [ ] Cards display profile info
  - [ ] Like/pass buttons functional
  - [ ] Swipe gestures respond
- [ ] **Matching logic works**
  - [ ] Likes are recorded
  - [ ] Mutual likes create matches
- [ ] **Match notifications work** (if implemented)
  - [ ] Users are notified of new matches
  - [ ] Match appears in matches list
- [ ] **Filters work** (if implemented)
  - [ ] Age filter applies
  - [ ] Distance filter applies
  - [ ] Gender filter applies

### Messaging
- [ ] **Messaging interface works**
  - [ ] Messages display correctly
  - [ ] New messages highlighted
  - [ ] Message history loads
- [ ] **Send message works**
  - [ ] Message appears in conversation
  - [ ] Message stored in database
  - [ ] Recipient can read message
- [ ] **Real-time updates work** - Messages appear without refresh
- [ ] **Typing indicators work** (if implemented)

### Profile Management
- [ ] **Edit profile works**
  - [ ] Profile information updates
  - [ ] Avatar can be changed
  - [ ] Gallery images can be added/removed
  - [ ] Changes persist after app close
- [ ] **Settings work**
  - [ ] Privacy settings apply
  - [ ] Notification settings apply
  - [ ] Block/report functionality works

### Date Management (if implemented)
- [ ] **Create date works** - Users can post dates
- [ ] **Date images upload** - Images store and display correctly
- [ ] **View dates works** - Users can browse scheduled dates
- [ ] **Delete dates works** - Users can remove their own dates
- [ ] **Edit dates works** - Users can modify their dates

## Platform-Specific Testing

### Android
- [ ] **Tested on Android 6.0+**
- [ ] **Permissions work**:
  - [ ] Location permission request works
  - [ ] Camera permission request works
  - [ ] Photos permission request works
- [ ] **Back button works** - Navigation correct on back press
- [ ] **Notch/safe area handled** - UI not obscured on notch devices
- [ ] **Landscape orientation works** - UI adapts (if supported)
- [ ] **Screen sizes** - Tested on various screen sizes
- [ ] **Performance** - App doesn't lag or crash
- [ ] **Battery usage** - Location tracking optimized

### iOS
- [ ] **Tested on iOS 13.0+**
- [ ] **Permissions work**:
  - [ ] Location permission request works
  - [ ] Camera permission request works
  - [ ] Photos permission request works
- [ ] **Safe area handled** - UI not obscured under notch
- [ ] **Face ID/Touch ID** - Works if implemented
- [ ] **Status bar** - Displays correctly
- [ ] **Screen sizes** - Tested on iPhone and iPad
- [ ] **Performance** - App doesn't lag or crash

## Network & Performance

### Offline Handling
- [ ] **No internet message displays** - User knows why operations fail
- [ ] **App doesn't crash** - Handles network errors gracefully
- [ ] **Data cached where possible** - Some features work offline

### Performance
- [ ] **App launch time** - Under 3 seconds
- [ ] **Image load speed** - Optimized and reasonably fast
- [ ] **Message load speed** - Scrolling is smooth
- [ ] **Database queries optimized** - Not loading excess data
- [ ] **Memory usage reasonable** - Doesn't consume excessive RAM

### Supabase Configuration
- [ ] **Realtime subscriptions working** - Messages update in real-time
- [ ] **Database connections stable** - No unexpected disconnects
- [ ] **Query performance good** - No N+1 queries
- [ ] **Row Level Security working** - Only authorized data visible

## App Store Preparation

### App Metadata
- [ ] **App name finalized** - "Cuddles"
- [ ] **App description written** - Compelling and accurate
- [ ] **App icon created** - 1024×1024 PNG
- [ ] **Splash screen ready** - Attractive loading screen
- [ ] **Screenshots captured**:
  - [ ] At least 2 for each screen size (phone/tablet)
  - [ ] High-quality and representative
  - [ ] Localized if supporting multiple languages

### Regulatory Compliance
- [ ] **COPPA compliant** - No children's data collection (if applicable)
- [ ] **Privacy policy link works** - Points to privacy policy
- [ ] **Terms of service link works** - Points to T&S
- [ ] **Support email configured** - support@cuddles-app.com
- [ ] **Content rating form completed** - Answers honestly
- [ ] **Age verification** - 18+ restriction enforced

### Android Specifics
- [ ] **Google Play package name correct** - com.cuddlesapp.mobile
- [ ] **Signing key configured** - EAS managed
- [ ] **Version code incremented** - Each new build increases
- [ ] **Minimum SDK appropriate** - minSdkVersion: 23
- [ ] **App size reasonable** - Not excessively large
- [ ] **No junk files in APK** - Clean build

### iOS Specifics
- [ ] **Apple bundle ID correct** - com.cuddlesapp.mobile
- [ ] **Provisioning profile valid** - Certificates not expired
- [ ] **Build number incremented** - Each new build increases
- [ ] **Deployment target correct** - iOS 13.0+
- [ ] **App size reasonable** - Not excessively large
- [ ] **No junk files in IPA** - Clean build

## Final Pre-Launch Steps

### 48 Hours Before Launch
- [ ] **Final build test on real devices** - Android and iOS
- [ ] **Manual testing of complete user flow**:
  - [ ] Register new account
  - [ ] Complete onboarding
  - [ ] Try matching feature
  - [ ] Send message to test user
  - [ ] Update profile
  - [ ] Check settings
  - [ ] Test logout and login
- [ ] **Verify production Supabase is configured** - Right project selected
- [ ] **All documentation reviewed** - RLS config, native build guide, etc.

### Day of Launch
- [ ] **Verify build status** - EAS build completed successfully
- [ ] **App Store listing reviewed** - All screenshots and text correct
- [ ] **Privacy policy live** - URL works
- [ ] **Support email monitored** - Ready for user issues
- [ ] **Team notified** - Everyone knows launch time
- [ ] **Marketing content ready** - If announcing launch

### Post-Launch (First Week)
- [ ] **Monitor app crashes** - Check Supabase logs
- [ ] **Respond to reviews** - Acknowledge feedback
- [ ] **Monitor performance** - Check loading times, errors
- [ ] **Monitor user signups** - Ensure onboarding works
- [ ] **Be available for support** - Address user issues quickly
- [ ] **Plan hotfixes** - Address any critical bugs immediately

## Known Issues & Limitations

Document any known issues that couldn't be fixed before launch:

- [ ] Issue 1: Description and expected workaround
- [ ] Issue 2: Description and expected workaround

## Approval Tips

### For Google Play
- **Average review time**: 2-4 hours
- **Common rejection reasons**: 
  - Inappropriate content
  - Privacy policy missing/unclear
  - Misleading screenshots
  - Terms of service missing
- **Improve approval chance by**: 
  - Clear, honest app description
  - Professional screenshots
  - Complete legal documents
  - Transparent permissions usage

### For App Store
- **Average review time**: 24-48 hours
- **Common rejection reasons**:
  - Crashes on startup
  - Incomplete information
  - Misleading functionality
  - Privacy issues
- **Improve approval chance by**:
  - Thorough testing before submission
  - Clear app metadata
  - Obvious test credentials provided (if needed)
  - Professional presentation

## Sign-Off

**Launch Manager**: _____________________ Date: _________

**Technical Lead**: _____________________ Date: _________

**Product Manager**: _____________________ Date: _________

---

## Notes

Use this section for any additional notes or issues:

```
[Add any additional notes or blockers here]
```

---

**Status**: Ready for Launch ✅ / Blocked ❌

If blocked, document the blocking issues and estimated resolution date.
