# Firebase Cloud Messaging - Quick Setup Guide

## 🚀 5-Minute Firebase Setup

### Step 1: Create Firebase Project (2 minutes)

1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Enter project name: **"Field Service App"**
4. Click **Continue**
5. Disable Google Analytics (optional)
6. Click **"Create project"**
7. Wait for project creation
8. Click **"Continue"**

---

### Step 2: Add Android App (2 minutes)

1. In Firebase Console, click **"Add app"** → Select **Android** icon
2. Fill in the form:
   - **Android package name**: `com.saazvat.fieldservice`
   - **App nickname**: `Field Service App`
   - **Debug signing certificate SHA-1**: (optional, skip for now)
3. Click **"Register app"**
4. **Download `google-services.json`**
5. Place the file here:
   ```
   android/app/google-services.json
   ```

---

### Step 3: Configure Android Build Files (1 minute)

#### File 1: `android/build.gradle`
Add this to the `dependencies` section:
```gradle
buildscript {
    dependencies {
        // ... existing dependencies
        classpath 'com.google.gms:google-services:4.4.0'  // Add this line
    }
}
```

#### File 2: `android/app/build.gradle`
Add this at the **very bottom** of the file:
```gradle
apply plugin: 'com.google.gms.google-services'
```

---

### Step 4: Rebuild and Test

```bash
# Sync Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android

# Build APK
# In Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
```

---

## 🧪 Testing Push Notifications

### Test 1: Check FCM Token Registration

1. Install APK on device
2. Open app and login
3. Grant notification permission
4. Check Android Logcat for:
   ```
   Push registration success, token: [YOUR_FCM_TOKEN]
   ```
5. Copy the token for testing

### Test 2: Send Test Notification from Firebase Console

1. Go to Firebase Console → **Cloud Messaging**
2. Click **"Send your first message"**
3. Fill in:
   - **Notification title**: "Test Notification"
   - **Notification text**: "This is a test from Firebase"
4. Click **"Next"**
5. Select **"Field Service App"**
6. Click **"Next"** → **"Next"** → **"Review"**
7. Click **"Publish"**
8. Check your device for notification!

### Test 3: Send to Specific Device (Using Token)

1. In Firebase Console → Cloud Messaging
2. Click **"Send your first message"**
3. Enter title and body
4. Click **"Send test message"**
5. Paste the FCM token from Test 1
6. Click **"Test"**
7. Notification should appear immediately!

---

## 📱 What You'll See

### When Notification Arrives:
1. **App in foreground**: Toast message appears
2. **App in background**: System notification appears
3. **Tap notification**: App opens to relevant screen
4. **Badge updates**: Red badge shows unread count
5. **Notification center**: New notification in list

---

## 🔧 Troubleshooting

### Issue: google-services.json not found
**Solution:** 
- Verify file is in `android/app/google-services.json`
- Run `npx cap sync android`
- Rebuild in Android Studio

### Issue: No FCM token in logs
**Solution:**
- Check notification permission granted
- Verify google-services.json is correct
- Check internet connection
- Restart app

### Issue: Notifications not appearing
**Solution:**
- Check device notification settings
- Verify app has notification permission
- Test with Firebase Console first
- Check battery optimization settings

### Issue: Build errors after adding Firebase
**Solution:**
- Clean build: `cd android && ./gradlew clean`
- Sync Capacitor: `npx cap sync android`
- Rebuild in Android Studio

---

## 📋 Checklist

Before testing, ensure:
- [ ] Firebase project created
- [ ] Android app added to Firebase
- [ ] google-services.json downloaded
- [ ] google-services.json placed in android/app/
- [ ] build.gradle files updated
- [ ] Capacitor synced
- [ ] APK built and installed
- [ ] Notification permission granted
- [ ] FCM token appears in logs

---

## 🎯 Next Steps After Firebase Setup

### 1. Store FCM Tokens in Supabase
Update the push notification service to save tokens:
```typescript
private async saveFCMToken(token: string): Promise<void> {
  localStorage.setItem('fcm_token', token);
  
  // Save to Supabase
  const userId = this.authService.getCurrentUser()?.id;
  if (userId) {
    await this.supabase.updateProfile(userId, { fcm_token: token });
  }
}
```

### 2. Create Supabase Edge Function
Create a function to send push notifications:
```bash
supabase functions new send-push-notification
```

### 3. Add Notification Triggers
Automatically send notifications when:
- Work order assigned
- Status changed
- Priority updated
- Admin sends message

### 4. Test End-to-End
- Assign work order → Notification sent
- Change status → Notification sent
- Verify badge updates
- Test navigation

---

## 📚 Resources

- **Firebase Console**: https://console.firebase.google.com/
- **Capacitor Push Docs**: https://capacitorjs.com/docs/apis/push-notifications
- **FCM Documentation**: https://firebase.google.com/docs/cloud-messaging
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions

---

**Estimated Time:** 5-10 minutes  
**Difficulty:** Easy  
**Status:** Ready to implement  

Once Firebase is set up, your push notifications will be fully functional! 🎉
