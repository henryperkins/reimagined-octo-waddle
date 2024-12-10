const fs = require('fs');
const path = require('path');

// Read the current version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = packageJson.version;

// Update manifest.json
const manifestPath = path.join(process.cwd(), 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.version = currentVersion;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, '\t'));

// Update versions.json
const versionsPath = path.join(process.cwd(), 'versions.json');
let versions = {};
if (fs.existsSync(versionsPath)) {
  versions = JSON.parse(fs.readFileSync(versionsPath, 'utf8'));
}

const minAppVersion = manifest.minAppVersion;
versions[currentVersion] = minAppVersion;

fs.writeFileSync(versionsPath, JSON.stringify(versions, null, '\t'));

console.log(`Updated to version ${currentVersion}`);