const fs = require('fs');
const path = require('path');

const targetJsonPath = path.join(__dirname, '..', 'src', 'data', 'audio_map.json');
const apiUrl = 'https://api.github.com/repos/lahirutw85/online-bible-app/releases/tags/audio-assets';

console.log("Fetching release assets from:", apiUrl);

fetch(apiUrl, {
  headers: {
    'User-Agent': 'NodeJS-Fetch'
  }
})
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    if (!data.assets || !Array.isArray(data.assets)) {
      throw new Error("Invalid response format: 'assets' array not found");
    }

    const audioMap = {};
    data.assets.forEach(asset => {
      if (asset.name.toLowerCase().endsWith('.mp3')) {
        const nameWithoutExt = path.basename(asset.name, path.extname(asset.name));
        audioMap[nameWithoutExt.toUpperCase()] = true;
      }
    });

    fs.writeFileSync(targetJsonPath, JSON.stringify(audioMap, null, 2), 'utf8');
    console.log(`Successfully generated audio_map.json with ${Object.keys(audioMap).length} assets from GitHub Release!`);
  })
  .catch(err => {
    console.error("Error syncing release assets:", err.message);
    process.exit(1);
  });
