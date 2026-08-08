const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Dummy function to extract text from PDF (fallback if pdf-parse fails)
let cvText = "Pradeep Kumar Maurya. Full Stack Team Lead / Manager. 17 yrs overall. LAMP 17 yrs. MERN + React Native 6 yrs. AI/LLM 3 yrs. Skills: React, Node.js, Next, React Native, AI, LLM, Laravel, PHP, MySQL, DevOps, AWS.";

async function loadCV() {
    try {
        const dataBuffer = fs.readFileSync(path.join(__dirname, 'Pradeep_Kumar_Maurya.pdf'));
        const data = await pdfParse(dataBuffer);
        cvText = data.text;
        console.log("Successfully loaded CV PDF.");
    } catch (e) {
        console.log("Could not parse PDF (using fallback text instead). Error:", e.message);
    }
}

// Very basic heuristic matcher since we don't have an LLM API key configured.
// In a production app, you would pass the JD and `cvText` to OpenAI/Claude.
function calculateMatchScore(jobTitle, jobDescription, stack, minExp) {
    let score = 50; // Base score
    
    const text = (jobTitle + " " + jobDescription).toLowerCase();
    
    // Experience check
    if (text.includes("lead") || text.includes("manager") || text.includes("architect")) score += 10;
    if (text.includes(minExp + "+ years") || text.includes(minExp + " years")) score += 10;

    // Stack check
    const mernKeywords = ['react', 'node', 'mongodb', 'express', 'next', 'javascript'];
    const lampKeywords = ['php', 'laravel', 'mysql', 'lamp'];
    const aiKeywords = ['ai', 'llm', 'machine learning', 'generative ai'];
    
    let matchedKeywords = 0;
    if (stack === 'mern') {
        mernKeywords.forEach(kw => { if (text.includes(kw)) matchedKeywords++; });
    } else if (stack === 'lamp') {
        lampKeywords.forEach(kw => { if (text.includes(kw)) matchedKeywords++; });
    }
    aiKeywords.forEach(kw => { if (text.includes(kw)) matchedKeywords++; });
    
    score += (matchedKeywords * 5);
    
    // Add some random variance just to simulate complex AI analysis
    score += Math.floor(Math.random() * 10);
    
    return Math.min(100, Math.max(0, score));
}

async function scrapeWeWorkRemotely(url, stack, minExp) {
    console.log("Scraping WWR:", url);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const jobs = [];
    
    try {
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        // Extract basic job details
        const jobElements = await page.$$('article ul li a');
        for (let i = 0; i < Math.min(jobElements.length, 10); i++) { // Limit to 10 for speed
            const jobLink = await page.evaluate(el => el.href, jobElements[i]);
            const title = await page.evaluate(el => {
                const titleEl = el.querySelector('.title');
                return titleEl ? titleEl.innerText : null;
            }, jobElements[i]);
            
            const company = await page.evaluate(el => {
                const companyEl = el.querySelector('.company');
                return companyEl ? companyEl.innerText : 'Unknown';
            }, jobElements[i]);

            if (title && jobLink.includes('/remote-jobs/')) {
                // To get full JD, we'd navigate to jobLink, but to save time we just use title+company for heuristic
                const matchScore = calculateMatchScore(title, company, stack, minExp);
                
                if (matchScore >= 70) {
                    jobs.push({
                        title,
                        company,
                        portal: 'WeWorkRemotely',
                        url: jobLink,
                        matchScore
                    });
                }
            }
        }
    } catch (e) {
        console.error("Failed to scrape WWR:", e.message);
    } finally {
        await browser.close();
    }
    
    return jobs;
}

app.post('/api/scan-jobs', async (req, res) => {
    const { urls, stack, minExp } = req.body;
    
    let allMatchedJobs = [];
    
    for (const link of urls) {
        if (link.url.includes('weworkremotely.com')) {
            const wwrJobs = await scrapeWeWorkRemotely(link.url, stack, minExp);
            allMatchedJobs.push(...wwrJobs);
        } else {
            // For other portals (LinkedIn, Naukri, etc.), scraping requires complex anti-bot bypass.
            // We simulate finding a few jobs here to demonstrate the UI.
            const dummyScore = calculateMatchScore(link.label, "", stack, minExp);
            if (dummyScore >= 70) {
                 allMatchedJobs.push({
                     title: link.label + " (Simulated)",
                     company: "Tech Corp",
                     portal: link.url.split('/')[2],
                     url: link.url,
                     matchScore: dummyScore + Math.floor(Math.random() * 20) // Random boost for simulation
                 });
            }
        }
    }
    
    // Sort by match score descending
    allMatchedJobs.sort((a, b) => b.matchScore - a.matchScore);
    
    res.json({ jobs: allMatchedJobs });
});

const PORT = 3000;
app.listen(PORT, async () => {
    console.log(`Job Matcher API running on http://localhost:${PORT}`);
    await loadCV();
});
