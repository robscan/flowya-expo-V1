/* eslint-disable no-console */
/**
 * Convert seedSpots.v1.2.noimage.json to CSV for Supabase import.
 * Output: data/seedSpots.v1.2.noimage.csv
 */
const fs = require('fs');
const path = require('path');

const inputPath = path.resolve(__dirname, '..', 'data', 'seedSpots.v1.2.noimage.json');
const outputPath = path.resolve(__dirname, '..', 'data', 'seedSpots.v1.2.noimage.csv');

const raw = fs.readFileSync(inputPath, 'utf8');
const data = JSON.parse(raw);

if (!Array.isArray(data)) {
  console.error('Expected an array in seedSpots.v1.2.noimage.json');
  process.exit(1);
}

const header = [
  'id',
  'name',
  'type',
  'lat',
  'lng',
  'city',
  'country',
  'shortDescription',
  'hasGeneratedContent',
  'createdAt',
  'updatedAt',
].join(',');

const escapeCsv = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const rows = data.map((spot) => {
  const loc = spot.location || {};
  return [
    spot.id,
    spot.name,
    spot.type,
    loc.lat,
    loc.lng,
    loc.city,
    loc.country,
    spot.shortDescription,
    spot.hasGeneratedContent,
    spot.createdAt,
    spot.updatedAt,
  ].map(escapeCsv).join(',');
});

fs.writeFileSync(outputPath, [header, ...rows].join('\n'));
console.log(`✅ Wrote ${rows.length} rows to ${outputPath}`);
