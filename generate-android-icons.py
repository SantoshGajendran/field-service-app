#!/usr/bin/env python3
"""
Android Icon Generator
Generates all required mipmap sizes from SVG logo
"""

import os
import subprocess
from pathlib import Path

# Configuration
SOURCE_SVG = "src/assets/logo-icon-flat.svg"
ANDROID_RES = "android/app/src/main/res"

# Icon sizes for Android
SIZES = {
    "mipmap-ldpi": 36,
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

def check_inkscape():
    """Check if Inkscape is installed"""
    try:
        subprocess.run(["inkscape", "--version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def check_imagemagick():
    """Check if ImageMagick is installed"""
    try:
        # Try magick command (ImageMagick 7+)
        subprocess.run(["magick", "--version"], capture_output=True, check=True)
        return "magick"
    except (subprocess.CalledProcessError, FileNotFoundError):
        try:
            # Try convert command (ImageMagick 6)
            result = subprocess.run(["convert", "-version"], capture_output=True, check=True, text=True)
            if "ImageMagick" in result.stdout:
                return "convert"
        except (subprocess.CalledProcessError, FileNotFoundError):
            pass
    return None

def generate_with_inkscape(svg_path, output_path, size):
    """Generate PNG using Inkscape"""
    cmd = [
        "inkscape",
        svg_path,
        "--export-type=png",
        f"--export-filename={output_path}",
        f"--export-width={size}",
        f"--export-height={size}"
    ]
    subprocess.run(cmd, check=True, capture_output=True)

def generate_with_imagemagick(svg_path, output_path, size, command):
    """Generate PNG using ImageMagick"""
    if command == "magick":
        cmd = ["magick", "convert"]
    else:
        cmd = ["convert"]

    cmd.extend([
        "-background", "none",
        "-resize", f"{size}x{size}",
        svg_path,
        output_path
    ])
    subprocess.run(cmd, check=True, capture_output=True)

def main():
    print("=" * 50)
    print("Android Icon Generator")
    print("=" * 50)
    print()

    # Check if source SVG exists
    if not os.path.exists(SOURCE_SVG):
        print(f"❌ Error: Source SVG not found: {SOURCE_SVG}")
        return 1

    # Check available tools
    has_inkscape = check_inkscape()
    imagemagick_cmd = check_imagemagick()

    if not has_inkscape and not imagemagick_cmd:
        print("❌ Error: Neither Inkscape nor ImageMagick found!")
        print()
        print("Please install one of the following:")
        print("  - Inkscape: https://inkscape.org/release/")
        print("  - ImageMagick: https://imagemagick.org/script/download.php")
        print()
        print("Or use Android Studio's Image Asset tool:")
        print("  npx cap open android")
        print("  Right-click res → New → Image Asset")
        return 1

    tool = "Inkscape" if has_inkscape else f"ImageMagick ({imagemagick_cmd})"
    print(f"✓ Using {tool} to generate icons")
    print()

    # Generate icons
    total = len(SIZES)
    success = 0
    failed = 0

    for density, size in SIZES.items():
        output_dir = os.path.join(ANDROID_RES, density)
        os.makedirs(output_dir, exist_ok=True)

        output_file = os.path.join(output_dir, "ic_launcher.png")
        output_round = os.path.join(output_dir, "ic_launcher_round.png")

        try:
            print(f"[{success + failed + 1}/{total}] Generating {size}x{size}px for {density}...", end=" ")

            if has_inkscape:
                generate_with_inkscape(SOURCE_SVG, output_file, size)
                generate_with_inkscape(SOURCE_SVG, output_round, size)
            else:
                generate_with_imagemagick(SOURCE_SVG, output_file, size, imagemagick_cmd)
                generate_with_imagemagick(SOURCE_SVG, output_round, size, imagemagick_cmd)

            print("✓")
            success += 1

        except subprocess.CalledProcessError as e:
            print(f"✗ Failed")
            print(f"  Error: {e}")
            failed += 1
        except Exception as e:
            print(f"✗ Failed")
            print(f"  Error: {e}")
            failed += 1

    print()
    print("=" * 50)
    print(f"✓ Generation Complete!")
    print("=" * 50)
    print(f"Success: {success}/{total}")
    print(f"Failed: {failed}/{total}")
    print()

    if success > 0:
        print("Next steps:")
        print("  1. npx cap sync android")
        print("  2. cd android && ./gradlew assembleDebug && cd ..")
        print()

    return 0 if failed == 0 else 1

if __name__ == "__main__":
    exit(main())
