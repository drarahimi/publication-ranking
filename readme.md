# 📊 GitHub-Hosted Journal Rank API

This repository acts as a **Static API** for journal quartile rankings (**Q1–Q4**) based on the **SCImago Journal Rank (SJR)** dataset.

Because it's hosted purely on **GitHub Pages** using static JSON files, it is:

* ⚡ Lightning-fast
* 💰 $0 to run
* 📚 Supports historical tracking across multiple years

---

# 🚀 How to Set This Up

## 1️⃣ Build the Data

### Step 1: Download SCImago Data

Download the CSV datasets from SCImago.
You may download multiple years if desired.

Rename them using this format:

```
scimagojr-2023.csv
scimagojr-2022.csv
scimagojr-2021.csv
```

Place all CSV files in the same folder as your build script.

---

### Step 2: Install Node.js

Make sure **Node.js** is installed on your computer.

---

### Step 3: Run the Builder Script

Open your terminal and run:

```bash
node build-api.js
```

This will:

* Process all available CSV years
* Generate an `api/` folder
* Automatically calculate `latest_year`
* Create a `meta.json` file

---

## 2️⃣ Host on GitHub

1. Commit and push the generated files (including the `api/` folder) to your GitHub repository.
2. Go to **Settings → Pages** in your repository.
3. Under **Build and deployment**:

   * Select **Deploy from a branch**
   * Choose your `main` branch
   * Click **Save**

GitHub will generate a URL like:

```
https://yourusername.github.io/your-repo-name/
```

---

# 📡 How to Use the API

---

## 1️⃣ Find the Latest Available Year

Before querying a journal, fetch `meta.json` to discover:

* The latest available year
* All available years
* Last update timestamp

### Request

```http
GET https://yourusername.github.io/your-repo-name/api/meta.json
```

### Response

```json
{
  "latest_year": "2023",
  "available_years": [
    "2023",
    "2022",
    "2021"
  ],
  "last_updated": "2026-02-19T21:05:00.000Z"
}
```

---

## 2️⃣ Fetch Journal Data by ISSN

Once you know the year (or dynamically use `latest_year`), query by ISSN.

### Endpoint Format

```http
GET https://yourusername.github.io/your-repo-name/api/{YEAR}/issn/{ISSN}.json
```

---

# 💻 Example (JavaScript / React)

This function:

1. Fetches `meta.json`
2. Detects the latest year
3. Retrieves the journal’s ranking

```javascript
const getLatestJournalRank = async (issn) => {
  const baseUrl = 'https://yourusername.github.io/your-repo-name/api';
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

// Test with Nature's ISSN
getLatestJournalRank('00280836');
```

---

# 📄 Example Journal Response

```json
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
```

---

# ✅ Summary

You now have a:

* Static
* Free
* Fast
* Versioned
* Historical

Journal ranking API powered entirely by **GitHub Pages**.
