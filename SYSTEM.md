# SYSTEM.md — PRODUCTION SYSTEM ARCHITECTURE & TECHNICAL SPECIFICATION

## 1. System Overview
This system is an automated job search engine and application dispatcher tailored for Pradeep Kumar Maurya (17+ Years Full-Stack Lead & GenAI Architect). It features a BullMQ 6-hour scheduler, persistent Redis deduplication, Google Gemini vector embeddings, ChromaDB RAG semantic filtering, Yahoo Nodemailer application dispatching, and Docker/CI-CD deployment workflows.

---

## 2. RAG & CI/CD Production Architecture

```
 ┌─────────────────────────────────────────────────────────────┐
 │               DEVELOPMENT & DEPLOYMENT PIPELINE            │
 └─────────────────────────────────────────────────────────────┘
  Developer (Git Push) ──► GitHub / Google Source Repositories
                                 │
                                 ▼
                     Google Cloud Build (CI/CD)
                       │  • Runs unit tests & linter
                       │  • Builds Docker image (with ChromaDB client)
                       │  • Pushes container image to Google Artifact Registry
                                 │
                                 ▼
             Deploy to Target Environment (GCP Compute Engine / Cloud Run / DigitalOcean VPS)

 ┌─────────────────────────────────────────────────────────────┐
 │                RAG PIPELINE RUNTIME WORKFLOW                │
 └─────────────────────────────────────────────────────────────┘
   [ BullMQ 6-Hour Cron ] ──► Fetch Live Jobs (Scrapers / RSS)
                                  │
                                  ▼
                    Gemini 1.5/2.0 Embeddings API
                     (Generates 768-dim Vector Embeddings)
                                  │
                                  ▼
                         ChromaDB Vector Store
              ├── Deduplication Query (Cosine Similarity > 0.95)
              └── Candidate Match Query (Resume Vector vs Job Vector)
                                  │
                                  ▼
                      Gemini / Claude LLM RAG
              (Generates Tailored Application Email & Digest)
                                  │
                                  ▼
                         Yahoo Nodemailer Dispatch
```

---

## 3. Core Component Specifications

### 3.1 Live Scraper Aggregator (`src/scrapers/jobFetchers.js`)
- Aggregates live RSS and search query feeds across **Instahyre, Naukri.com, Hirist.tech, Indeed, Foundit, LinkedIn, WeWorkRemotely, Wellfound, and Upwork**.
- Uses `crypto.createHash('md5')` on `source-title-company` to maintain persistent IDs.

### 3.2 Redis & BullMQ Queue Manager (`src/queues/jobScheduler.js`)
- **Cron Pattern:** `0 */6 * * *` (Every 6 hours).
- **Redis Set `processed_jobs_set`:** Checks `sismember` before queuing/sending emails to prevent duplicate emails across runs.

### 3.3 ChromaDB Vector Store & RAG Deduplication
- Embeds job postings and candidate resume using Google Gemini `text-embedding-004`.
- Prevents reposted job duplicates with Cosine Similarity > 0.95.

### 3.4 Email Application Module (`src/services/emailer.js`)
- Yahoo SSL SMTP (`smtp.mail.yahoo.com:465`).
- Sender: `pradeepmaurya@yahoo.com`.
- Automatically attaches `Pradeep_Kumar_Maurya.pdf` (171 KB).
- Sends summary alert digests to candidate email.

---

## 4. VPS Management Commands

```bash
# Deployment & Container Startup
git pull origin main
docker compose down
docker compose up -d --build

# Monitoring
docker ps
docker logs -f job_search_worker
```
