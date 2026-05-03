# Firebase Setup - Next Steps

## After you add google-services.json file:

### Step 1: Sync Capacitor
```bash
npx cap sync android
```

### Step 2: Open in Android Studio
```bash
npx cap open android
```

### Step 3: Build APK
In Android Studio:
- Build > Build Bundle(s) / APK(s) > Build APK(s)
- Wait for build to complete
- Install APK on device

### Step 4: Test Push Notifications

#### Test 1: Check FCM Token
1. Install APK on device
2. Open app and login
3. Grant notification permission when prompted
4. Check Android Logcat for:
   ```
   Push registration success, token: [YOUR_FCM_TOKEN]
   ```
5. Copy this token for testing

#### Test 2: Send Test Notification
1. Go to Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Enter:
   - Title: "Test Notification"
   - Text: "This is a test from Firebase"
4. Click "Next"
5. Select "Field Service App"
6. Click "Next" → "Next" → "Review" → "Publish"
7. Check your device - notification should appear!

#### Test 3: Send to Specific Device
1. Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Enter title and body
4. Click "Send test message"
5. Paste the FCM token from Test 1
6. Click "Test"
7. Notification appears immediately!

## What You'll See:

### When notification arrives:
- ✅ System notification appears
- ✅ Tap notification → App opens
- ✅ Notification appears in notification center
- ✅ Red badge shows unread count
- ✅ Toast message if app is open

### In the app:
- Navigate to "Alerts" tab
- See all notifications
- Tap to open work order
- Mark as read/delete

## Troubleshooting:

### No FCM token in logs?
- Check notification permission granted
- Verify google-services.json is in android/app/
- Restart app
- Check internet connection

### Notifications not appearing?
- Check device notification settings
- Verify app has notification permission
- Test with Firebase Console first
- Check battery optimization settings

### Build errors?
- Clean build: `cd android && ./gradlew clean`
- Sync: `npx cap sync android`
- Rebuild in Android Studio

## Next: Backend Integration

Once push notifications work, integrate with your backend:

1. Store FCM tokens in Supabase profiles table
2. Create Supabase Edge Function to send notifications
3. Add triggers for work order events
4. Test end-to-end flow

See: docs/PUSH_NOTIFICATIONS.md for backend integration details
