# 📱 Android Studio - Generate App Icons (Step-by-Step)

## Android Studio is now opening...

Once Android Studio opens, follow these steps:

---

## Step 1: Wait for Project to Load
- Android Studio will index and sync the project
- Wait for "Gradle sync" to complete (bottom status bar)
- This may take 1-2 minutes

---

## Step 2: Open Image Asset Studio

### Method A (Recommended):
1. In the **Project** panel (left side), find: `app/src/main/res`
2. **Right-click** on the `res` folder
3. Select: **New → Image Asset**

### Method B (Alternative):
1. Go to menu: **File → New → Image Asset**

---

## Step 3: Configure the Icon

In the **Image Asset Studio** window:

### 1. Icon Type
- Select: **Launcher Icons (Adaptive and Legacy)**

### 2. Foreground Layer
- **Source Asset Type**: Choose **Image**
- **Path**: Click **Browse** button
- Navigate to: `C:\Santosh\Development\FieldServiceApp\field-service-app\src\assets\logo-icon-flat.svg`
- Select the file and click **Open**

### 3. Background Layer
- **Source Asset Type**: Choose **Color**
- **Color**: Enter `#0ea5e9` (your brand sky blue)

### 4. Scaling
- **Resize**: Keep at **100%** or adjust to **90-95%** if needed
- **Trim**: Leave **unchecked**
- **Padding**: Adjust if needed (0-10% recommended)

### 5. Shape
- **Legacy Icon**: Choose **Circle** or **Square** (Circle recommended)
- **Preview**: Check all the preview icons on the right

---

## Step 4: Generate Icons

1. Click **Next** button (bottom right)
2. Review the files that will be created:
   - `mipmap-ldpi/ic_launcher.png` (36x36)
   - `mipmap-mdpi/ic_launcher.png` (48x48)
   - `mipmap-hdpi/ic_launcher.png` (72x72)
   - `mipmap-xhdpi/ic_launcher.png` (96x96)
   - `mipmap-xxhdpi/ic_launcher.png` (144x144)
   - `mipmap-xxxhdpi/ic_launcher.png` (192x192)
   - Adaptive icon XML files

3. Click **Finish**

---

## Step 5: Verify Icons Created

1. In Project panel, expand: `app/src/main/res`
2. Check each `mipmap-*` folder
3. You should see:
   - `ic_launcher.png`
   - `ic_launcher_round.png`
   - `ic_launcher_foreground.png` (in some folders)
   - `ic_launcher_background.png` (in some folders)

---

## Step 6: Sync and Build

### In Android Studio:
1. Click **File → Sync Project with Gradle Files**
2. Wait for sync to complete

### Or in Terminal:
```bash
npx cap sync android
```

---

## Step 7: Build APK

### Option A - In Android Studio:
1. Go to: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for build to complete (2-5 minutes)
3. Click **locate** link in the notification
4. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option B - In Terminal:
```bash
cd android
./gradlew assembleDebug
cd ..
```

APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Step 8: Install on Your Phone

### Method A - Using ADB:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Method B - Manual Transfer:
1. Copy `app-debug.apk` to your phone
2. Open the file on your phone
3. Allow installation from unknown sources if prompted
4. Install the app

---

## ✅ Verification

After installation, check:
- **Home screen icon** - Should show your new logo
- **App drawer** - Should show your new logo
- **Recent apps** - Should show your new logo
- **Settings → Apps** - Should show your new logo

---

## 🎨 Your Logo Details

**File Used**: `src/assets/logo-icon-flat.svg`
- Sky blue background (#0ea5e9)
- White location pin
- Amber wrench (#f59e0b)

**Design**: Location pin + wrench = Field service mobility

---

## 🔧 Troubleshooting

**Icons not showing?**
- Uninstall old app completely first
- Clear Android Studio cache: File → Invalidate Caches → Restart
- Rebuild project

**Can't find Image Asset option?**
- Make sure you right-clicked on the `res` folder
- Try: File → New → Image Asset

**Build fails?**
- Run: `./gradlew clean` in android folder
- Sync project again
- Rebuild

---

## 📞 Need Help?

If you encounter any issues, let me know at which step you're stuck!

---

**Created**: May 3, 2026
**Logo Files**: `src/assets/logo-*.svg`
