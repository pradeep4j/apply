# MEMORY.md — Apply Web Dashboard & Job Matcher System

> **Recovery Note for AI Assistant**: Read this file to instantly restore full context of the `/home/pradeep/Projects/apply` root web application after system restarts, Windows updates, or BSOD events.

---

## 1. Candidate Profile & Project Core
* **Candidate**: Pradeep Kumar Maurya
* **Experience**: 17+ Years Overall (LAMP 17 yrs, MERN & React Native 6 yrs, AI/LLM & GenAI 3 yrs)
* **Primary Role Targets**: Full Stack Team Lead, Engineering Manager, AI/LLM Architect
* **Project Directory**: `/home/pradeep/Projects/apply`
* **Purpose**: Interactive local Web Dashboard for searching, filtering, and scoring live job listings across 12+ major portals against candidate CV (`Pradeep_Kumar_Maurya.pdf`).

---

## 2. Architecture & File Structure

```
/home/pradeep/Projects/apply/
├── index.html                    # Main HTML5 UI Dashboard (Portals, Stack Tags, Filters)
├── script.js                     # Frontend Logic (Portal URL Generator, API Fetcher, UI Rendering)
├── style.css                     # Dark Mode Styling (Glassmorphism, Responsive Controls)
├── server.js                     # Express API Backend (Port 3000, PDF Parsing, Puppeteer Scraper)
├── Pradeep_Kumar_Maurya.pdf      # Candidate Resume PDF (Parsed on server boot)
├── Apply_System_Context.docx     # Architecture & Implementation System Context Document
├── package.json                  # Dependencies: express, cors, dotenv, pdf-parse, puppeteer
├── Dockerfile                    # Containerization with Chromium for Puppeteer
├── docker-compose.yml            # Docker Compose setup for local container execution
└── .github/workflows/deploy.yml # GitHub Actions CI workflow (Build & PDF verification)
```

---

## 3. Why Node.js (`server.js`) is Required
Client-side browser JavaScript (`index.html`) cannot read binary PDF files (`Pradeep_Kumar_Maurya.pdf`) from local disk due to browser security sandboxing (CORS / file origin restrictions). `server.js` was introduced to:
1. Parse `Pradeep_Kumar_Maurya.pdf` on server startup via `pdf-parse`.
2. Host `http://localhost:3000/api/scan-jobs` endpoint.
3. Run Puppeteer headless Chrome scraper for portals like WeWorkRemotely.
4. Calculate match scores (0–100%) and return formatted JSON to `index.html`.

---

## 4. Key Implementation Components

### A. `server.js` (Backend API on Port 3000)
* **PDF Reader**: Uses `pdf-parse` inside `loadCV()` to parse `Pradeep_Kumar_Maurya.pdf`. Fallback profile string used if PDF read fails.
* **Scraper**: `scrapeWeWorkRemotely(url, stack, minExp)` launches Puppeteer in headless mode, extracts job titles, companies, links.
* **Scoring Function**: `calculateMatchScore(title, description, stack, minExp)` checks:
  - Lead / Manager / Architect keywords (+10 points)
  - Experience requirement matching (+10 points)
  - Stack keywords (MERN: react, node, mongodb, express, next | LAMP: php, laravel, mysql | AI: llm, ai, generative ai) (+5 points per match)
* **Endpoint `POST /api/scan-jobs`**: Receives target URLs array, stack tag, minimum experience; returns sorted matched jobs list.

### B. `index.html` & `script.js` (Frontend Control Panel)
* **Supported Portals**: Naukri, Foundit (Monster), LinkedIn Jobs, Indeed India, Hirist, TimesJobs, Shine, Glassdoor India, iimjobs, Cutshort, Instahyre, Wellfound, WeWorkRemotely, Remote OK, Upwork, Freelancer.com.
* **Boolean vs Literal Syntax Handling**: Portals labeled `boolean` parse quotes and AND/OR/NOT syntax; portals labeled `literal` rely on native site filters.
* **Batch Tab Opener**: Opens match links in batches of 10 (`BATCH_SIZE = 10`) to prevent browser popup blockers from blocking tabs.

---

## 5. Separation from Subproject (`MCP_job_search`)
* **`/Projects/apply/` (This project)**: Interactive local web UI dashboard on port 3000 for manual search, instant links, and on-screen visualization.
* **`/Projects/apply/MCP_job_search/` (Subproject)**: Background automated cron service running every 6 hours using BullMQ + Redis + ChromaDB RAG vector deduplication + Yahoo Nodemailer application email dispatcher with PDF CV attachment.

## 6. GitHub Actions Secrets & Variables Matrix

| Secret / Variable | Value for Local PC | Value for Cloud Server (VPS) | Brief Explanation |
|---|---|---|---|
| **`VPS_HOST`** | Not Needed (Private `192.168.x.x` from `ipconfig` cannot be reached by GitHub) | Public Server IP (e.g. `142.93.xxx.xxx`) | The target server IP where your code deploys. |
| **`VPS_USER`** | `pradeep` | `root` or `ubuntu` | The SSH username on the target server. |
| **`VPS_SSH_KEY`** | Generated via `ssh-keygen` | Content of `~/.ssh/id_rsa` | Private SSH key allowing passwordless login. |
| **`PORT`** | `3000` | `3000` | The web server port configured in `server.js`. |

> **Key Takeaway**: For local development (`node server.js` -> `http://localhost:3000`), you only need GitHub to store your code. You do not need SSH cloud deployment secrets unless you buy a cloud VPS server in the future!

---

## 7. How to Run & Troubleshoot in WSL / Linux

### Permission Fix (Run first if permissions error occurs):
```bash
sudo chown -R $USER:$USER ~/Projects/apply
```

### Running Directly via Node:
```bash
cd ~/Projects/apply
npm install
node server.js
# Access in browser at: http://localhost:3000
```

### Running via Docker Compose:
```bash
cd ~/Projects/apply
docker compose up --build
# Access in browser at: http://localhost:3000
```

### Testing API Endpoint:
```bash
curl -X POST http://localhost:3000/api/scan-jobs \
  -H "Content-Type: application/json" \
  -d '{"urls":[{"url":"https://weworkremotely.com/categories/remote-full-stack-programming-jobs","label":"Full Stack"}],"stack":"mern","minExp":15}'
```

---

## 7. Current Project State & Next Steps
- ✅ Ownership restored to user `pradeep`.
- ✅ Node dependencies installed cleanly.
- ✅ Dockerfile & GitHub Actions local CI configured.
- ✅ System context document `Apply_System_Context.docx` generated.

---

## 8. Git Repository Isolation Command
To unstage the nested `MCP_job_search` sub-repository and ignore it cleanly:
```bash
git rm --cached -f MCP_job_search
echo "MCP_job_search" >> .gitignore
git add .
git commit -m "Initial commit for apply web dashboard"
```

