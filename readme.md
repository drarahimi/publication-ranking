GitHub-Hosted Journal Rank API

This repository acts as a Static API for journal quartile rankings (Q1-Q4) based on the SCImago Journal Rank (SJR) dataset.

Because it's hosted purely on GitHub Pages via static JSON files, it is lightning-fast, costs $0 to run, and supports historical tracking across multiple years.

How to Set This Up

1. Build the Data

Download the CSV datasets from SCImago. You can download multiple years if you wish.

Ensure the files are named with their corresponding year, like scimagojr-2023.csv, scimagojr-2022.csv, etc., and place them in the same folder as the script.

Make sure you have Node.js installed on your computer.

Run the builder script in your terminal:

node build-api.js


(This will process all years, generate an api/ folder, and automatically calculate the latest_year in a meta.json file).

2. Host on GitHub

Commit and push the generated files (including the api/ folder) to your GitHub repository.

On GitHub, go to your repository Settings -> Pages.

Under "Build and deployment", set the source to Deploy from a branch, select your main branch, and save.

GitHub will give you a URL (e.g., https://yourusername.github.io/your-repo-name/).

How to Use the API

1. Find the Latest Available Year

Before querying a specific journal, you can fetch meta.json to see which years are available and automatically find the latest data.

GET https://yourusername.github.io/your-repo-name/api/meta.json

Response:

{
  "latest_year": "2023",
  "available_years": [
    "2023",
    "2022",
    "2021"
  ],
  "last_updated": "2026-02-19T21:05:00.000Z"
}


2. Fetch Journal Data by ISSN

Once you know the year you want (or by using the latest_year dynamically), pass the journal's ISSN to the endpoint URL.

Endpoint URL Format:
GET https://yourusername.github.io/your-repo-name/api/{YEAR}/issn/{ISSN}.json

Example Request (JavaScript/React)

This script first fetches the meta.json file to identify the latest year, and then queries that specific year's folder for the journal's ranking.

const getLatestJournalRank = async (issn) => {
  const baseUrl = '[https://yourusername.github.io/your-repo-name/api](https://yourusername.github.io/your-repo-name/api)';
  const cleanIssn = issn.replace(/-/g, ''); // Remove dashes from ISSN
  
  try {
    // 1. Get the latest available year
    const metaResponse = await fetch(`${baseUrl}/meta.json`);
    const metaData = await metaResponse.json();
    const latestYear = metaData.latest_year;
    
    // 2. Fetch the journal data for that specific year
    const journalResponse = await fetch(`${baseUrl}/${latestYear}/issn/${cleanIssn}.json`);
    
    if (!journalResponse.ok) {
      throw new Error(`Journal not found for year ${latestYear}`);
    }
    
    const data = await journalResponse.json();
    console.log(`[${data.year}] The quartile for ${data.title} is ${data.quartile}`);
    return data;
    
  } catch (error) {
    console.error(error);
  }
};

// Test it with Nature's ISSN
getLatestJournalRank('00280836');


Example Journal Response

{
  "title": "Nature",
  "issns": [
    "00280836",
    "14764687"
  ],
  "quartile": "Q1",
  "sjr": "18.3",
  "h_index": "1200",
  "type": "journal",
  "categories": "Multidisciplinary (Q1)",
  "year": "2023"
}
