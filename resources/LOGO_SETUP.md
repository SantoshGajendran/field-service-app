# Logo Setup Instructions

**Date:** May 2, 2026  
**Status:** ✅ Logo Created

---

## Your New Logo

I've created a custom logo for your Field Service app at:
```
resources/icon.svg
```

**Design Features:**
- Three stacked layers (representing organization/structure)
- Gradient from sky blue (#0ea5e9) to purple (#8b5cf6)
- Neon glow effects
- Dark slate background (#0f172a)
- Matches your app's glassmorphism theme

---

## Next Steps to Apply the Logo

### Step 1: Convert SVG to PNG

You need to convert the SVG to a 1024x1024 PNG. Use one of these methods:

**Method A: Online Converter (Easiest)**
1. Go to: https://cloudconvert.com/svg-to-png
2. Upload `resources/icon.svg`
3. Set output size to 1024x1024
4. Download the PNG
5. Save as `resources/icon.png`

**Method B: Using Inkscape (Free Software)**
1. Download Inkscape: https://inkscape.org/
2. Open `resources/icon.svg`
3. File → Export PNG Image
4. Set width/height to 1024
5. Export as `resources/icon.png`

**Method C: Using Figma (Free Online)**
1. Go to figma.com
2. Create new file
3. Import `resources/icon.svg`
4. Select the icon
5. Export as PNG at 1024x1024
6. Save as `resources/icon.png`

### Step 2: Generate All Icon Sizes

Once you have `resources/icon.png`:

**Option A: Using Capacitor Assets (Automated)**
```bash
# Install if not already installed
npm install @capacitor/assets --save-dev

# Generate all Android icon sizes
npx capacitor-assets generate --android
```

**Option B: Using Online Generator**
1. Go to: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
2. Upload `resources/icon.png`
3. Adjust settings:
   - Padding: 10%
   - Background: #0f172a
4. Download the zip
5. Extract and copy mipmap folders to `android/app/src/main/res/`

### Step 3: Rebuild the App

```bash
# Build web assets
npm run build

# Sync with Android
npx cap sync android

# Clean and rebuild APK
cd android
./gradlew clean
./gradlew assembleDebug
```

### Step 4: Install on Phone

The new APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

Transfer to your phone and install.

---

## Preview the Logo

To see what the logo looks like:

1. **Open in browser:**
   - Right-click `resources/icon.svg`
   - Open with browser (Chrome, Firefox, Edge)

2. **Open in image viewer:**
   - After converting to PNG, open `resources/icon.png`

---

## Customize the Logo (Optional)

If you want to adjust the logo, edit `resources/icon.svg`:

**Change colors:**
- Line 15-17: Gradient colors
- Line 19-21: Second gradient
- Line 23-25: Third gradient

**Change background:**
- Line 5: Background color

**Adjust glow:**
- Line 10: Change `stdDeviation` value (higher = more glow)

**Adjust size:**
- Lines 30-50: Adjust path coordinates

---

## Troubleshooting

### SVG not displaying correctly

**Solution:**
- Open in Chrome or Firefox
- Some viewers don't support SVG filters

### PNG conversion looks blurry

**Solution:**
- Ensure output size is exactly 1024x1024
- Use high-quality export settings
- Try a different converter

### Logo not updating in app

**Solution:**
```bash
# Clean everything
cd android
./gradlew clean

# Delete build folder
rm -rf app/build

# Rebuild
./gradlew assembleDebug

# Uninstall old app from phone first
# Then install new APK
```

---

## What the Logo Represents

**Three Layers:**
- Organization and structure
- Multiple levels of service
- Systematic approach

**Blue to Purple Gradient:**
- Technology and innovation (blue)
- Creativity and quality (purple)
- Professional and modern

**Neon Glow:**
- Cutting-edge technology
- Visibility and clarity
- Matches app's UI theme

---

## Summary

✅ Logo created: `resources/icon.svg`  
⏳ Next: Convert to PNG (1024x1024)  
⏳ Then: Generate all sizes  
⏳ Finally: Rebuild and install  

Follow the steps above to apply your new logo!

---

**Logo Setup Instructions**  
*Created: May 2, 2026*  
*Field Service Application*
