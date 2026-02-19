const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'api');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Find all CSV files matching the scimagojr-yyyy.csv pattern
const files = fs.readdirSync(__dirname);
const csvFiles = files.filter(f => /^scimagojr-\d{4}\.csv$/.test(f));

if (csvFiles.length === 0) {
  console.error('No datasets found. Please ensure your files are named like "scimagojr-2023.csv"');
  process.exit(1);
}

let availableYears = [];

console.log('Starting API Generation...\n');

csvFiles.forEach(file => {
  // Extract the year from the filename
  const year = file.match(/^scimagojr-(\d{4})\.csv$/)[1];
  availableYears.push(year);
  console.log(`Processing dataset for year: ${year}...`);

  // Create the directory structure: api/yyyy/issn/
  const yearDir = path.join(OUTPUT_DIR, year, 'issn');
  if (!fs.existsSync(yearDir)) fs.mkdirSync(yearDir, { recursive: true });

  const csvData = fs.readFileSync(file, 'utf-8');
  const lines = csvData.split('\n');
  
  if (lines.length < 2) return;

  const headerLine = lines[0];
  const delimiter = (headerLine.split(';').length > headerLine.split(',').length) ? ';' : ',';
  const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));

  let processedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const rowString = lines[i];
    const rowValues = [];
    let inQuotes = false;
    let currentValue = '';

    for (let j = 0; j < rowString.length; j++) {
      const char = rowString[j];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === delimiter && !inQuotes) {
        rowValues.push(currentValue);
        currentValue = '';
      } else currentValue += char;
    }
    rowValues.push(currentValue);

    const row = {};
    headers.forEach((header, index) => {
      row[header] = rowValues[index] ? rowValues[index].trim().replace(/^"|"$/g, '') : '';
    });

    const journalData = {
      title: row['title'] || 'Unknown',
      issns: (row['issn'] || '').split(',').map(i => i.trim()).filter(Boolean),
      quartile: row['sjr best quartile'] || row['quartile'] || '-',
      sjr: row['sjr'] || '0',
      h_index: row['h index'] || row['h-index'] || '0',
      type: row['type'] || 'Journal',
      categories: row['categories'] || '',
      year: year
    };

    journalData.issns.forEach(issn => {
      const cleanIssn = issn.replace(/[^a-zA-Z0-9]/g, ''); 
      if (cleanIssn) {
        fs.writeFileSync(
          path.join(yearDir, `${cleanIssn}.json`),
          JSON.stringify(journalData, null, 2)
        );
      }
    });

    processedCount++;
  }
  
  console.log(`  -> Generated ${processedCount} entries for ${year}`);
});

// Sort years in descending order so the highest year is first
availableYears.sort((a, b) => b - a);

// Create the meta.json file
const metaData = {
  latest_year: availableYears[0],
  available_years: availableYears,
  last_updated: new Date().toISOString()
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'meta.json'),
  JSON.stringify(metaData, null, 2)
);

console.log(`\nSuccess! Created API endpoints for ${availableYears.length} different years.`);
console.log(`Latest available year mapped is: ${metaData.latest_year}.`);
console.log(`Ready to push the 'api/' folder to GitHub!`);