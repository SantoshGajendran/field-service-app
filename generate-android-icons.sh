#!/bin/bash

# Android App Icon Generator
# Generates all required mipmap sizes from the logo SVG

echo "Generating Android app icons..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install it first:"
    echo "  Windows: choco install imagemagick"
    echo "  Mac: brew install imagemagick"
    echo "  Linux: sudo apt-get install imagemagick"
    exit 1
fi

# Source SVG
SOURCE_SVG="src/assets/logo-icon-flat.svg"
ANDROID_RES="android/app/src/main/res"

# Icon sizes for Android
declare -A SIZES=(
    ["mipmap-ldpi"]=36
    ["mipmap-mdpi"]=48
    ["mipmap-hdpi"]=72
    ["mipmap-xhdpi"]=96
    ["mipmap-xxhdpi"]=144
    ["mipmap-xxxhdpi"]=192
)

# Generate PNG icons
for dir in "${!SIZES[@]}"; do
    size=${SIZES[$dir]}
    output_dir="$ANDROID_RES/$dir"

    echo "Generating ${size}x${size}px icon for $dir..."

    # Create directory if it doesn't exist
    mkdir -p "$output_dir"

    # Convert SVG to PNG
    convert -background none -resize ${size}x${size} "$SOURCE_SVG" "$output_dir/ic_launcher.png"
    convert -background none -resize ${size}x${size} "$SOURCE_SVG" "$output_dir/ic_launcher_round.png"

    echo "  ✓ Created $output_dir/ic_launcher.png"
done

echo ""
echo "✓ All Android app icons generated successfully!"
echo ""
echo "Next steps:"
echo "1. Run: npx cap sync android"
echo "2. Build your APK"
echo ""
