/* eslint-disable no-console */
/**
 * Strip image fields from seed spots JSON.
 * Input:  data/seedSpots.v1.2.json
 * Output: data/seedSpots.v1.2.noimage.json
 */
const fs = require('fs');
const path = require('path');

const inputPath = path.resolve(__dirname, '..', 'data', 'seedSpots.v1.2.json');
const outputPath = path.resolve(__dirname, '..', 'data', 'seedSpots.v1.2.noimage.json');

const raw = fs.readFileSync(inputPath, 'utf8');
const data = JSON.parse(raw);

if (!Array.isArray(data)) {
  console.error('Expected an array of spots in seedSpots.v1.2.json');
  process.exit(1);
}

const stripped = data.map((spot) => {
  const { image, ...rest } = spot || {};
  return rest;
});

fs.writeFileSync(outputPath, JSON.stringify(stripped, null, 2));
console.log(`✅ Wrote ${stripped.length} spots to ${outputPath}`);
