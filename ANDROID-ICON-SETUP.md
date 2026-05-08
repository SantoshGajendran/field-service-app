# Android App Icon Setup Guide

## Quick Setup (Recommended)

The easiest way to generate Android app icons is to use an online tool or Android Studio's Image Asset Studio.

### Option 1: Using Android Studio (Recommended)

1. Open your project in Android Studio:
   ```bash
   npx cap open android
   ```

2. Right-click on `app/src/main/res` folder
3. Select **New > Image Asset**
4. Choose **Launcher Icons (Adaptive and Legacy)**
5. Select **Image** as Source Asset Type
6. Browse to: `src/assets/logo-icon-flat.svg`
7. Adjust padding if needed (recommended: 10-15%)
8. Click **Next** then **Finish**

This will automatically generate all required icon sizes!

### Option 2: Using Online Tool

1. Go to: https://icon.kitchen/ or https://easyappicon.com/
2. Upload: `src/assets/logo-icon-flat.svg`
3. Select **Android** platform
4. Download the generated icons
5. Extract and copy to `android/app/src/main/res/`

### Option 3: Manual PNG Generation (if you have ImageMagick)

Run the script I created:
```bash
chmod +x generate-android-icons.sh
./generate-android-icons.sh
```

## Required Icon Sizes

| Density | Size | Location |
|---------|------|----------|
| ldpi | 36x36 | mipmap-ldpi/ic_launcher.png |
| mdpi | 48x48 | mipmap-mdpi/ic_launcher.png |
| hdpi | 72x72 | mipmap-hdpi/ic_launcher.png |
| xhdpi | 96x96 | mipmap-xhdpi/ic_launcher.png |
| xxhdpi | 144x144 | mipmap-xxhdpi/ic_launcher.png |
| xxxhdpi | 192x192 | mipmap-xxxhdpi/ic_launcher.png |

## Adaptive Icon (Android 8.0+)

The adaptive icon system uses two layers:
- **Background**: Solid color (#0ea5e9)
- **Foreground**: Logo icon (wrench + pin)

Already configured in:
- `mipmap-anydpi-v26/ic_launcher.xml`
- `mipmap-anydpi-v26/ic_launcher_round.xml`

## After Generating Icons

1. Sync Capacitor:
   ```bash
   npx cap sync android
   ```

2. Build APK:
   ```bash
   cd android && ./gradlew assembleDebug && cd ..
   ```

3. Your APK will be at:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

## Testing the Icon

Install the APK on your device and check:
- Home screen icon
- App drawer icon
- Recent apps screen
- Settings > Apps

## Troubleshooting

**Icons not updating?**
- Uninstall the old app completely
- Clear Android Studio cache
- Rebuild the project

**Icons look blurry?**
- Ensure you're using the correct density folder
- Use PNG files, not JPG
- Verify the source SVG is high quality

## Current Logo Files

- `src/assets/logo-icon.svg` - Gradient version
- `src/assets/logo-icon-flat.svg` - Flat version (use this for Android)
- `src/assets/logo-icon-mono.svg` - Monochrome version
- `src/assets/logo-full.svg` - Full logo with text

## Brand Colors

```xml
<!-- Add to android/app/src/main/res/values/colors.xml -->
<color name="ic_launcher_background">#0ea5e9</color>
<color name="colorPrimary">#0ea5e9</color>
<color name="colorPrimaryDark">#0284c7</color>
<color name="colorAccent">#f59e0b</color>
```
