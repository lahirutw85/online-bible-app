const fs = require('fs');
const path = require('path');

const audioDir = process.argv[2];
if (!audioDir) {
  console.error("Please specify the path to your audio folder containing MP3 files.");
  console.error("Example: node scripts/generate_audio_map.js \"C:\\Users\\lahir\\Downloads\\BibleAudio\"");
  process.exit(1);
}

const targetJsonPath = path.join(__dirname, '..', 'src', 'data', 'audio_map.json');
console.log(`Scanning directory: ${audioDir}`);
console.log(`Target JSON: ${targetJsonPath}`);

const audioMap = {};

function scanDir(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (stat.isFile() && item.toLowerCase().endsWith('.mp3')) {
      const nameWithoutExt = path.basename(item, path.extname(item));
      // Normalize name to upper case to match app keys (e.g. GEN_1_1, GEN_FULL_CH_1)
      audioMap[nameWithoutExt.toUpperCase()] = true;
    }
  }
}

try {
  if (!fs.existsSync(audioDir)) {
    console.error(`Directory not found: ${audioDir}`);
    process.exit(1);
  }
  scanDir(audioDir);
  
  fs.writeFileSync(targetJsonPath, JSON.stringify(audioMap, null, 2), 'utf8');
  console.log(`Successfully generated audio_map.json with ${Object.keys(audioMap).length} indexed audio files!`);
} catch (err) {
  console.error("Error generating audio map:", err.message);
}
