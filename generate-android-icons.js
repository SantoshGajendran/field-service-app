const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SOURCE_SVG = 'src/assets/logo-icon-flat.svg';
const ANDROID_RES = 'android/app/src/main/res';

// Icon sizes for Android
const SIZES = {
  'mipmap-ldpi': 36,
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

console.log('='.repeat(50));
console.log('Android Icon Generator');
console.log('='.repeat(50));
console.log();

// Check if source exists
if (!fs.existsSync(SOURCE_SVG)) {
  console.error(`Error: Source SVG not found: ${SOURCE_SVG}`);
  process.exit(1);
}

// Check for ImageMagick
let hasImageMagick = false;
try {
  execSync('magick --version', { stdio: 'ignore' });
  hasImageMagick = true;
  console.log('Using ImageMagick to generate icons');
} catch (e) {
  console.log('ImageMagick not found. Please use Android Studio instead:');
  console.log('  1. npx cap open android');
  console.log('  2. Right-click res -> New -> Image Asset');
  console.log('  3. Upload: src/assets/logo-icon-flat.svg');
  process.exit(1);
}

console.log();

// Generate icons
let success = 0;
let failed = 0;
const total = Object.keys(SIZES).length;

for (const [density, size] of Object.entries(SIZES)) {
  const outputDir = path.join(ANDROID_RES, density);

  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, 'ic_launcher.png');
  const outputRound = path.join(outputDir, 'ic_launcher_round.png');

  try {
    console.log(`[${success + failed + 1}/${total}] Generating ${size}x${size}px for ${density}...`);

    // Generate ic_launcher.png
    execSync(`magick convert -background none -resize ${size}x${size} "${SOURCE_SVG}" "${outputFile}"`, { stdio: 'ignore' });

    // Generate ic_launcher_round.png
    execSync(`magick convert -background none -resize ${size}x${size} "${SOURCE_SVG}" "${outputRound}"`, { stdio: 'ignore' });

    console.log(`  ✓ Created ${density}/ic_launcher.png`);
    success++;
  } catch (e) {
    console.error(`  ✗ Failed: ${e.message}`);
    failed++;
  }
}

console.log();
console.log('='.repeat(50));
console.log('Generation Complete!');
console.log('='.repeat(50));
console.log(`Success: ${success}/${total}`);
console.log(`Failed: ${failed}/${total}`);
console.log();

if (success > 0) {
  console.log('Next steps:');
  console.log('  1. npx cap sync android');
  console.log('  2. cd android && ./gradlew assembleDebug && cd ..');
  console.log();
}

process.exit(failed > 0 ? 1 : 0);
