# Android APK Build Guide

**Date:** May 2, 2026  
**Status:** ✅ Ready to Build

---

## Build Status

✅ Production build completed successfully  
✅ Capacitor sync completed  
✅ Android project updated with latest changes  
✅ All web assets copied to Android  

---

## Quick Build Steps

### Option 1: Using Android Studio (Recommended)

1. **Open Android Studio**
   ```bash
   npx cap open android
   ```

2. **Wait for Gradle sync to complete**
   - Android Studio will automatically sync the project
   - This may take a few minutes on first run

3. **Build APK**
   - Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Or use keyboard shortcut: `Ctrl+Shift+A` and type "Build APK"

4. **Locate the APK**
   - After build completes, click "locate" in the notification
   - Default location: `android/app/build/outputs/apk/debug/app-debug.apk`

5. **Install on your phone**
   - Transfer the APK to your phone
   - Enable "Install from Unknown Sources" in phone settings
   - Open the APK file and install

---

### Option 2: Using Command Line

1. **Navigate to android folder**
   ```bash
   cd android
   ```

2. **Build debug APK**
   ```bash
   ./gradlew assembleDebug
   ```

3. **Build release APK (signed)**
   ```bash
   ./gradlew assembleRelease
   ```

4. **Locate the APK**
   - Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Release: `android/app/build/outputs/apk/release/app-release.apk`

---

## Complete Build Process

### Step 1: Build Web Assets

```bash
# Production build
npm run build

# Output: dist/field-service-app/browser/
```

**What this does:**
- Compiles TypeScript to JavaScript
- Bundles all code and assets
- Minifies and optimizes
- Creates production-ready files

**Build Output:**
- Main bundle: 428.97 kB (104.28 kB gzipped)
- Styles: 6.86 kB (1.77 kB gzipped)
- Total: 444.86 kB (109.33 kB gzipped)

### Step 2: Sync with Capacitor

```bash
# Sync web assets to Android
npx cap sync android
```

**What this does:**
- Copies web assets to `android/app/src/main/assets/public`
- Updates Capacitor plugins
- Creates capacitor.config.json in Android project
- Updates Android dependencies

### Step 3: Build APK

**Using Android Studio:**
```bash
# Open Android Studio
npx cap open android

# Then: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

**Using Gradle:**
```bash
cd android
./gradlew assembleDebug
```

### Step 4: Install on Device

**Method 1: USB Cable**
```bash
# Connect phone via USB
# Enable USB debugging on phone
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Method 2: File Transfer**
1. Copy APK to phone (USB, email, cloud)
2. Open APK file on phone
3. Allow installation from unknown sources
4. Install

---

## Build Variants

### Debug Build
**Command:** `./gradlew assembleDebug`

**Characteristics:**
- Not optimized
- Includes debug symbols
- Larger file size
- Easier to debug
- Not signed for Play Store

**Use for:**
- Development testing
- Internal testing
- Debugging issues

### Release Build
**Command:** `./gradlew assembleRelease`

**Characteristics:**
- Fully optimized
- Minified code
- Smaller file size
- Requires signing key
- Ready for Play Store

**Use for:**
- Production deployment
- Play Store submission
- Public distribution

---

## Signing the Release APK

### Generate Signing Key (First Time Only)

```bash
keytool -genkey -v -keystore field-service-app.keystore -alias field-service -keyalg RSA -keysize 2048 -validity 10000
```

**Save this information:**
- Keystore password
- Key alias
- Key password

### Configure Signing in Android

1. **Create `android/key.properties`:**
   ```properties
   storePassword=YOUR_KEYSTORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=field-service
   storeFile=../field-service-app.keystore
   ```

2. **Update `android/app/build.gradle`:**
   ```gradle
   android {
       signingConfigs {
           release {
               def keystorePropertiesFile = rootProject.file("key.properties")
               def keystoreProperties = new Properties()
               keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

               keyAlias keystoreProperties['keyAlias']
               keyPassword keystoreProperties['keyPassword']
               storeFile file(keystoreProperties['storeFile'])
               storePassword keystoreProperties['storePassword']
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
           }
       }
   }
   ```

3. **Build signed release:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

---

## Troubleshooting

### Issue: Gradle sync failed

**Solution:**
1. Check internet connection
2. Update Android Studio
3. Invalidate caches: File → Invalidate Caches / Restart
4. Delete `.gradle` folder and sync again

### Issue: Build failed with errors

**Solution:**
1. Check Android Studio error messages
2. Ensure Java JDK is installed (JDK 17 recommended)
3. Update Gradle: `./gradlew wrapper --gradle-version=8.0`
4. Clean build: `./gradlew clean`

### Issue: APK not installing on phone

**Solution:**
1. Enable "Install from Unknown Sources"
2. Check if old version is installed (uninstall first)
3. Ensure phone has enough storage
4. Try different transfer method

### Issue: App crashes on startup

**Solution:**
1. Check Android Studio Logcat for errors
2. Rebuild with: `npm run build && npx cap sync android`
3. Clear app data on phone
4. Reinstall the app

### Issue: Changes not appearing in APK

**Solution:**
1. **Always run these commands in order:**
   ```bash
   npm run build
   npx cap sync android
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   ```
2. Uninstall old version from phone
3. Install new APK

---

## APK Locations

### Debug APK
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK
```
android/app/build/outputs/apk/release/app-release.apk
```

### Bundle (for Play Store)
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## Testing on Device

### Before Installing

1. **Enable Developer Options:**
   - Settings → About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging:**
   - Settings → Developer Options
   - Enable "USB Debugging"

3. **Allow Unknown Sources:**
   - Settings → Security
   - Enable "Install from Unknown Sources"

### After Installing

**Test these features:**
- ✅ Login with credentials
- ✅ Navigate between pages
- ✅ View work orders
- ✅ Edit work order details
- ✅ Toggle checklist items
- ✅ Switch theme (light/dark)
- ✅ Logout functionality
- ✅ Offline functionality
- ✅ Sync queue

---

## Build Optimization

### Current Build Size
- Main bundle: 428.97 kB (104.28 kB gzipped)
- Excellent size for mobile app

### Further Optimization (Optional)

1. **Enable Lazy Loading:**
   ```typescript
   {
     path: 'admin',
     loadComponent: () => import('./features/admin/admin.component')
   }
   ```

2. **Enable Service Worker:**
   ```bash
   ng add @angular/pwa
   ```

3. **Optimize Images:**
   - Use WebP format
   - Compress images
   - Use appropriate sizes

---

## Continuous Deployment

### Automated Build Script

Create `build-android.sh`:

```bash
#!/bin/bash

echo "Building Field Service App for Android..."

# Step 1: Build web assets
echo "Step 1: Building web assets..."
npm run build

# Step 2: Sync with Capacitor
echo "Step 2: Syncing with Capacitor..."
npx cap sync android

# Step 3: Build APK
echo "Step 3: Building APK..."
cd android
./gradlew assembleDebug

# Step 4: Copy APK to root
echo "Step 4: Copying APK..."
cp app/build/outputs/apk/debug/app-debug.apk ../field-service-app.apk

echo "✅ Build complete! APK: field-service-app.apk"
```

**Usage:**
```bash
chmod +x build-android.sh
./build-android.sh
```

---

## Play Store Deployment

### Prepare for Play Store

1. **Build signed release bundle:**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

2. **Output:** `android/app/build/outputs/bundle/release/app-release.aab`

3. **Upload to Play Console:**
   - Go to Google Play Console
   - Create new app
   - Upload AAB file
   - Fill in store listing
   - Submit for review

### Required Assets

- App icon (512x512 PNG)
- Feature graphic (1024x500 PNG)
- Screenshots (at least 2)
- Privacy policy URL
- App description
- Category selection

---

## Version Management

### Update Version

**In `package.json`:**
```json
{
  "version": "1.0.1"
}
```

**In `android/app/build.gradle`:**
```gradle
android {
    defaultConfig {
        versionCode 2
        versionName "1.0.1"
    }
}
```

**Version Code Rules:**
- Increment by 1 for each release
- Must be higher than previous version
- Used by Play Store for updates

---

## Summary

✅ **Build Process:**
1. `npm run build` - Build web assets
2. `npx cap sync android` - Sync to Android
3. `npx cap open android` - Open Android Studio
4. Build → Build APK(s)

✅ **APK Location:**
`android/app/build/outputs/apk/debug/app-debug.apk`

✅ **Install:**
Transfer to phone and install

✅ **All latest changes included:**
- Authentication system
- Admin dashboard
- Theme toggle
- Updated navigation
- All UI improvements

---

**Android APK Build Guide**  
*Version 1.0.0 - May 2, 2026*  
*Field Service Application*
