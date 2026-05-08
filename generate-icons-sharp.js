const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_IMAGE = 'public/applogo.jpg';
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
console.log('Android Icon Generator (Using Sharp)');
console.log('='.repeat(50));
console.log();

// Check if source exists
if (!fs.existsSync(SOURCE_IMAGE)) {
  console.error(`Error: Source image not found: ${SOURCE_IMAGE}`);
  process.exit(1);
}

// Check if sharp is installed
try {
  require.resolve('sharp');
  console.log('Using Sharp library to generate icons');
} catch (e) {
  console.log('Sharp not installed. Installing...');
  console.log('Run: npm install sharp');
  process.exit(1);
}

console.log();

// Generate icons
async function generateIcons() {
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
      await sharp(SOURCE_IMAGE)
        .resize(size, size, { fit: 'cover' })
        .png()
        .toFile(outputFile);

      // Generate ic_launcher_round.png (with circular mask)
      await sharp(SOURCE_IMAGE)
        .resize(size, size, { fit: 'cover' })
        .composite([{
          input: Buffer.from(`<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}"/></svg>`),
          blend: 'dest-in'
        }])
        .png()
        .toFile(outputRound);

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
}

generateIcons().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
