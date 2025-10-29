const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function compressImage(inputPath, outputPath, options = {}) {
  const { quality = 85, maxWidth = 1920 } = options;

  try {
    const fileSize = fs.statSync(inputPath).size;
    console.log(`\n📸 ${path.basename(inputPath)}`);
    console.log(`   Original: ${(fileSize / 1024).toFixed(0)} KB`);

    const ext = path.extname(inputPath).toLowerCase();
    let pipeline = sharp(inputPath);

    // Resize if too large
    const metadata = await pipeline.metadata();
    if (metadata.width > maxWidth) {
      pipeline = pipeline.resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }

    // Compress based on format
    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ quality, compressionLevel: 9 });
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({ quality });
    }

    // Save compressed image
    await pipeline.toFile(outputPath + '.tmp');

    const newSize = fs.statSync(outputPath + '.tmp').size;
    const savings = ((1 - newSize / fileSize) * 100).toFixed(1);

    console.log(`   Compressed: ${(newSize / 1024).toFixed(0)} KB`);
    console.log(`   ✅ Saved ${savings}% (${((fileSize - newSize) / 1024).toFixed(0)} KB)`);

    // Replace original with compressed version
    fs.renameSync(outputPath + '.tmp', outputPath);

    return true;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🗜️  Compressing banner images...\n');
  console.log('Quality: 85% (excellent quality, good compression)');
  console.log('Max width: 1920px (HD displays)\n');

  const publicDir = path.join(__dirname, 'public');

  const images = [
    { file: 'Tech-Week-rooftop.jpg', quality: 85, maxWidth: 1920 },
    { file: 'People-networking-1.png', quality: 85, maxWidth: 1920 },
    { file: 'People-networking-2.png', quality: 85, maxWidth: 1920 },
    { file: 'People-networking-3.png', quality: 85, maxWidth: 1920 },
    { file: 'My-phone.jpg', quality: 85, maxWidth: 1200 },
    { file: 'My-phone-2.jpg', quality: 85, maxWidth: 1200 },
    { file: 'My-phone-blurry.jpg', quality: 85, maxWidth: 1200 },
    { file: 'My-phone-blurry-tall.jpg', quality: 85, maxWidth: 800 },
    { file: 'My-phone-blurry-tall-2.jpg', quality: 85, maxWidth: 800 }
  ];

  for (const img of images) {
    const inputPath = path.join(publicDir, img.file);
    if (fs.existsSync(inputPath)) {
      await compressImage(inputPath, inputPath, {
        quality: img.quality,
        maxWidth: img.maxWidth
      });
    } else {
      console.log(`\n⚠️  ${img.file} not found, skipping...`);
    }
  }

  console.log('\n✨ Compression complete!\n');
}

main().catch(console.error);
