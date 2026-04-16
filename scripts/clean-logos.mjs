// Temporary script to clean logo images - remove black background, trim, and crop
// Uses sharp (bundled with Next.js)

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Manually set the env var sharp expects
process.env.npm_package_config_libvips = '8.14.5';

const sharp = require('sharp');
const path = require('path');

const publicDir = path.resolve('public');

async function processImage(inputFile, outputFile, opts = {}) {
  const img = sharp(path.join(publicDir, inputFile));
  const meta = await img.metadata();
  console.log(`${inputFile}: ${meta.width}x${meta.height}`);

  const { data, info } = await img.raw().ensureAlpha().toBuffer({ resolveWithObject: true });

  // Make near-black pixels transparent
  const threshold = opts.blackThreshold || 40;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r < threshold && g < threshold && b < threshold) {
      data[i + 3] = 0;
    }
  }

  // Remove star artifact in bottom-right quadrant
  const starY = Math.floor(info.height * 0.70);
  const starX = Math.floor(info.width * 0.70);
  for (let y = starY; y < info.height; y++) {
    for (let x = starX; x < info.width; x++) {
      const idx = (y * info.width + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      // Make dark/gray pixels transparent (the star is gray)
      if (r < 180 && g < 180 && b < 180) {
        data[idx + 3] = 0;
      }
    }
  }

  const result = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 5 })
    .toFile(path.join(publicDir, outputFile));

  console.log(`  → ${outputFile}: ${result.width}x${result.height}`);
  return result;
}

async function processLettermark(inputFile, outputFile) {
  const img = sharp(path.join(publicDir, inputFile));
  const meta = await img.metadata();
  console.log(`${inputFile}: ${meta.width}x${meta.height}`);

  const { data, info } = await img.raw().ensureAlpha().toBuffer({ resolveWithObject: true });

  // Make near-black pixels transparent
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r < 40 && g < 40 && b < 40) {
      data[i + 3] = 0;
    }
  }

  // Remove low-saturation pixels (thin white/gray decorative lines & dots)
  // Keep only the colorful purple/blue gradient content
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue; // skip already transparent
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max - min;
    // Gray/white pixels have low saturation difference
    if (saturation < 25) {
      data[i + 3] = 0;
    }
  }

  const result = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 5 })
    .toFile(path.join(publicDir, outputFile));

  console.log(`  → ${outputFile}: ${result.width}x${result.height}`);
}

async function main() {
  await processImage('logo.png', 'logo-clean.png');
  await processLettermark('logo_letter.png', 'logo-letter-clean.png');
  console.log('Done!');
}

main().catch(console.error);
