# App Logo Change Guide

**Date:** May 2, 2026  
**Status:** Ready to Update

---

## Current Logo Setup

The app currently uses the default Capacitor/Android logo. The logo appears in:
- App icon on home screen
- App launcher
- Recent apps screen
- Splash screen

---

## Logo Requirements

### Android Icon Sizes

You need to provide icons in multiple sizes:

| Density | Size | Location |
|---------|------|----------|
| mdpi | 48x48 | mipmap-mdpi |
| hdpi | 72x72 | mipmap-hdpi |
| xhdpi | 96x96 | mipmap-xhdpi |
| xxhdpi | 144x144 | mipmap-xxhdpi |
| xxxhdpi | 192x192 | mipmap-xxxhdpi |

### Source Image Requirements

**Recommended:**
- **Size:** 1024x1024 pixels (minimum)
- **Format:** PNG with transparency
- **Shape:** Square
- **Safe area:** Keep important content within center 80%
- **Background:** Transparent or solid color

---

## Method 1: Using Online Icon Generator (Easiest)

### Step 1: Prepare Your Logo

1. Create or obtain your logo (1024x1024 PNG)
2. Ensure it looks good at small sizes

### Step 2: Generate Icons

Use one of these free tools:

**Option A: Android Asset Studio**
- URL: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
- Upload your 1024x1024 logo
- Adjust padding and background
- Download the generated zip file

**Option B: Icon Kitchen**
- URL: https://icon.kitchen/
- Upload your logo
- Customize as needed
- Download Android icons

**Option C: App Icon Generator**
- URL: https://www.appicon.co/
- Upload your logo
- Select Android
- Download icons

### Step 3: Replace Icons

1. **Extract the downloaded zip file**

2. **Copy to Android project:**
   ```
   Replace files in:
   android/app/src/main/res/
   ├── mipmap-mdpi/
   ├── mipmap-hdpi/
   ├── mipmap-xhdpi/
   ├── mipmap-xxhdpi/
   └── mipmap-xxxhdpi/
   ```

3. **Rebuild the app:**
   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```

---

## Method 2: Manual Replacement

### Step 1: Resize Your Logo

Use an image editor (Photoshop, GIMP, Figma) to create these sizes:

- 48x48 (mdpi)
- 72x72 (hdpi)
- 96x96 (xhdpi)
- 144x144 (xxhdpi)
- 192x192 (xxxhdpi)

### Step 2: Replace Files

Replace these files with your logo:

```
android/app/src/main/res/mipmap-mdpi/ic_launcher.png (48x48)
android/app/src/main/res/mipmap-hdpi/ic_launcher.png (72x72)
android/app/src/main/res/mipmap-xhdpi/ic_launcher.png (96x96)
android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png (144x144)
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png (192x192)
```

Also replace the round versions:
```
android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
```

### Step 3: Rebuild

```bash
npm run build
npx cap sync android
cd android
./gradlew clean
./gradlew assembleDebug
```

---

## Method 3: Using Capacitor Assets (Recommended)

### Step 1: Install Capacitor Assets Plugin

```bash
npm install @capacitor/assets --save-dev
```

### Step 2: Create Resources Folder

```bash
mkdir -p resources
```

### Step 3: Add Your Logo

Place your logo as:
```
resources/icon.png (1024x1024 minimum)
```

### Step 4: Generate All Icons

```bash
npx capacitor-assets generate --android
```

This will automatically:
- Generate all required sizes
- Place them in correct folders
- Update Android configuration

### Step 5: Sync and Build

```bash
npx cap sync android
npx cap open android
```

---

## Adaptive Icons (Android 8.0+)

Modern Android uses adaptive icons with foreground and background layers.

### Structure

```
Foreground layer: Your logo (transparent background)
Background layer: Solid color or pattern
```

### Files to Update

**Foreground:**
```
android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png
android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png
android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png
android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png
```

**Background Color:**
Edit `android/app/src/main/res/values/ic_launcher_background.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0ea5e9</color>
</resources>
```

---

## Splash Screen Logo

### Update Splash Screen

1. **Create splash screen image:**
   - Size: 2732x2732 pixels
   - Format: PNG with transparency
   - Logo centered

2. **Place in resources:**
   ```
   resources/splash.png
   ```

3. **Generate splash screens:**
   ```bash
   npx capacitor-assets generate --android
   ```

---

## Quick Steps Summary

### If You Have a 1024x1024 Logo Ready

1. **Use online generator:**
   - Go to https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
   - Upload your logo
   - Download generated icons

2. **Replace files:**
   - Extract zip
   - Copy all mipmap folders to `android/app/src/main/res/`
   - Overwrite existing files

3. **Rebuild:**
   ```bash
   npm run build
   npx cap sync android
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   ```

4. **Install new APK on phone**

---

## Testing Your New Logo

### Check These Places

After installing the new APK:

✅ Home screen icon  
✅ App drawer icon  
✅ Recent apps screen  
✅ Settings → Apps  
✅ Notification icon (if applicable)  
✅ Splash screen  

### Different Android Versions

Test on:
- Android 8.0+ (adaptive icons)
- Android 7.0 and below (standard icons)

---

## Troubleshooting

### Logo looks blurry

**Solution:**
- Use higher resolution source image (2048x2048)
- Ensure PNG is not compressed
- Use proper image resizing tool

### Logo has white background

**Solution:**
- Save PNG with transparency
- Update background color in `ic_launcher_background.xml`

### Logo not updating after rebuild

**Solution:**
```bash
# Clean everything
cd android
./gradlew clean

# Clear Android Studio cache
# File → Invalidate Caches / Restart

# Rebuild
./gradlew assembleDebug

# Uninstall old app from phone
# Install new APK
```

### Logo looks different on different devices

**Solution:**
- This is normal for adaptive icons
- Test safe area (center 80% of icon)
- Adjust padding in icon generator

---

## Design Tips

### Best Practices

✅ **Simple design** - Recognizable at small sizes  
✅ **High contrast** - Stands out on any background  
✅ **No text** - Unless it's part of the brand  
✅ **Centered** - Important elements in safe area  
✅ **Consistent** - Matches your brand identity  

### Avoid

❌ Too much detail  
❌ Thin lines  
❌ Small text  
❌ Complex gradients  
❌ Photos or realistic images  

---

## Example: Field Service App Logo

### Suggested Design

**Concept:** Layers icon (representing organization/structure)

**Colors:**
- Primary: #0ea5e9 (Sky Blue)
- Accent: #8b5cf6 (Purple)
- Background: #0f172a (Dark Slate)

**Style:**
- Glassmorphism effect
- Neon glow
- Modern and professional

### Implementation

1. Create 1024x1024 icon with:
   - Three stacked layers (like the admin icon)
   - Gradient from blue to purple
   - Subtle glow effect
   - Transparent background

2. Use icon generator to create all sizes

3. Set background color to dark slate (#0f172a)

---

## Files Checklist

After updating, verify these files exist:

```
✅ android/app/src/main/res/mipmap-mdpi/ic_launcher.png
✅ android/app/src/main/res/mipmap-hdpi/ic_launcher.png
✅ android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
✅ android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
✅ android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

✅ android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
✅ android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
✅ android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
✅ android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
✅ android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

✅ android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png
✅ android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png
✅ android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png
✅ android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png
✅ android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png
```

---

## Summary

**Easiest Method:**
1. Create 1024x1024 PNG logo
2. Use https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
3. Download and replace files
4. Rebuild app

**Files to Replace:**
- All `ic_launcher.png` files in mipmap folders
- All `ic_launcher_round.png` files
- All `ic_launcher_foreground.png` files
- Update `ic_launcher_background.xml` for background color

**After Replacement:**
```bash
npm run build
npx cap sync android
cd android
./gradlew clean
./gradlew assembleDebug
```

---

**App Logo Change Guide**  
*Version 1.0.0 - May 2, 2026*  
*Field Service Application*
