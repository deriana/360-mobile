const fs = require('fs');
const path = require('path');

function renameDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  let count = 0;
  for (const f of files) {
    if (f.endsWith('.geojson')) {
      const oldPath = path.join(dirPath, f);
      const newPath = path.join(dirPath, f.replace(/\.geojson$/, '.json'));
      fs.renameSync(oldPath, newPath);
      count++;
    }
  }
  return count;
}

const kabDir = path.resolve(__dirname, '../src/data/geo/kabupaten');
const kecDir = path.resolve(__dirname, '../src/data/geo/kecamatan');

const kabCount = renameDir(kabDir);
const kecCount = renameDir(kecDir);

console.log(`Renamed ${kabCount} kabupaten files and ${kecCount} kecamatan files to .json.`);
