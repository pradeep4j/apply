import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';

const tempDir = path.join(os.tmpdir(), 'mcp_docx_builder');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

fs.mkdirSync(path.join(tempDir, 'word', '_rels'), { recursive: true });
fs.mkdirSync(path.join(tempDir, '_rels'), { recursive: true });

const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function makeParagraph(text, isHeading = false, isSubheading = false) {
  if (isHeading) {
    return `<w:p><w:pPr><w:pStyle w:val="Heading1"/><w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="1F497D"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="1F497D"/></w:rPr><w:t>${escapeXml(text)}</w:t></w:r></w:p>`;
  }
  if (isSubheading) {
    return `<w:p><w:pPr><w:pStyle w:val="Heading2"/><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="595959"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="595959"/></w:rPr><w:t>${escapeXml(text)}</w:t></w:r></w:p>`;
  }
  return `<w:p><w:r><w:t>${escapeXml(text)}</w:t></w:r></w:p>`;
}

const paragraphs = [
  makeParagraph("MCP AUTOMATED JOB SEARCH & EMAIL APPLICATION SYSTEM", true),
  makeParagraph("System Context & Production Architecture Documentation", true),
  makeParagraph("Candidate: Pradeep Kumar Maurya (17+ Years Experience | Full-Stack Lead & GenAI Engineer)"),
  makeParagraph("--------------------------------------------------------------------------------------------------"),
  
  makeParagraph("1. EXECUTIVE OVERVIEW & CANDIDATE PROFILE", false, true),
  makeParagraph("This system is an automated, Model Context Protocol (MCP)-compliant job search engine and application dispatcher built for Pradeep Kumar Maurya."),
  makeParagraph("Candidate Core Profile:"),
  makeParagraph("• Candidate Name: Pradeep Kumar Maurya"),
  makeParagraph("• Experience Level: 17+ Years Industry Experience"),
  makeParagraph("• Core Roles: Full-Stack Lead (MERN & LAMP Stack), GenAI & LLM Application Engineer, AI-Augmented Software Architect"),
  makeParagraph("• Key Technical Skills: React, Next.js, Node.js, Express, Laravel, Core PHP, MySQL, MongoDB, Anthropic Claude, Google Gemini Pro 3.6, OpenAI, RAG, ChromaDB, Tool Calling, Agentic Workflows, AWS (EC2, S3), GCP, Docker, Nginx, Linux Server Administration."),
  
  makeParagraph("2. TARGET PORTALS & MULTI-WORK-TYPE SCOPE", false, true),
  makeParagraph("The search engine aggregates live job listings across 13+ global portals covering Onsite, Hybrid, Remote, and Freelancing/Contract positions:"),
  makeParagraph("• Remote & Global Portals: Remote.co, We Work Remotely, Remote OK, Remotive, ProtocolJobs.ai, Wellfound (AngelList)."),
  makeParagraph("• Indian & Regional Portals: Instahyre, Naukri.com, Hirist.tech, Indeed.com, Foundit.com."),
  makeParagraph("• Freelance & Contract Marketplaces: Upwork, FlexJobs, A.Team."),
  makeParagraph("• Work Types Supported: Onsite, Hybrid (Delhi NCR / India / Global), Remote (Global Timezones), Freelance Contract ($60-$90/hr)."),
  makeParagraph("• AI Prioritization Logic: Roles combining GenAI/LLM capabilities with Full-Stack MERN & LAMP architecture receive a 100% match score."),

  makeParagraph("3. RECURRING 6-HOUR BULLMQ + REDIS SCHEDULER", false, true),
  makeParagraph("• Scheduler Engine: Built using BullMQ on top of Redis 7."),
  makeParagraph("• Cron Schedule: 0 */6 * * * (Runs every 6 hours automatically: 00:00, 06:00, 12:00, 18:00 UTC/IST)."),
  makeParagraph("• Task Workflow:"),
  makeParagraph("  a) Fetches fresh jobs from all target portals."),
  makeParagraph("  b) Deduplicates against Redis database to prevent duplicate emails."),
  makeParagraph("  c) Scores candidate skills against job requirements."),
  makeParagraph("  d) Pushes qualified leads (Score >= 75%) to EmailQueue."),
  makeParagraph("  e) Dispatches emails via Nodemailer with exponential backoff and rate-limiting."),

  makeParagraph("4. YAHOO SMTP AUTOMATED EMAIL APPLICATION MODULE", false, true),
  makeParagraph("• Transport Protocol: Yahoo SSL SMTP (smtp.mail.yahoo.com:465)."),
  makeParagraph("• Sender Account: pradeepmaurya@yahoo.com"),
  makeParagraph("• App Password Authentication: Secures SMTP transport with Yahoo App Password."),
  makeParagraph("• Attachment: Automatically attaches Pradeep_Kumar_Maurya.pdf (171 KB) to every email."),
  makeParagraph("• Sent Folder Verification: All sent application emails automatically reflect in Yahoo Webmail Sent folder."),
  makeParagraph("• Email Body Template:"),
  makeParagraph("  Hello Hiring Team,"),
  makeParagraph("  Results-driven Full-stack lead with MERN and LAMP and GenAI/LLM application engineer who ships LLM-powered products end to end. 17+ years architecting and leading enterprise web platforms across MERN and LAMP. Expert in AI-Augmented Development, aggressively accelerating development cycles by writing production code via Claude(opus 5/fable), Google Gemini pro(3.6), chatgpt(codex), cursor, windsurf, V0 and Bolt etc. Strong on LLM API integration, prompt engineering, retrieval/RAG, tool/function calling, and turning AI capabilities into reliable, paying-user features. Proven track record of integrating third-party APIs, leading cross-functional Agile teams, and deploying scalable applications on AWS and Google Cloud."),
  makeParagraph("  Thanks"),
  makeParagraph("  Pradeep Kumar Maurya"),
  makeParagraph("  Mob No. - +91-7784942637"),

  makeParagraph("5. PRODUCTION DEPLOYMENT STRATEGIES (SEPARATED BY ARCHITECTURE)", false, true),
  makeParagraph("To prevent any technical confusion, this system supports three completely separate deployment options depending on your environment requirements:"),
  makeParagraph(""),
  makeParagraph("--------------------------------------------------------------------------------------------------"),
  makeParagraph("STRATEGY 1: LOCAL DOCKER CONTAINER DEPLOYMENT (CURRENTLY ACTIVE ON YOUR DIGITALOCEAN VPS)"),
  makeParagraph("• Technology Used: Docker Engine (dockerd) + Docker Compose + Systemd."),
  makeParagraph("• Source Code Requirement: REQUIRES SOURCE CODE ON VPS. Source code must exist at /var/www/MCP_job_search (downloaded via git clone / git pull) so Docker can build the image locally on your VPS."),
  makeParagraph("• VPS Execution Command: docker compose up -d --build"),
  makeParagraph("• Status & Management: Docker Daemon (dockerd) manages processes 24/7 with restart: always Policy."),
  makeParagraph("• Monitoring Commands: docker ps | docker logs -f mcp_job_search_worker"),
  makeParagraph(""),
  makeParagraph("--------------------------------------------------------------------------------------------------"),
  makeParagraph("STRATEGY 2: REMOTE DOCKER CONTAINER REGISTRY DEPLOYMENT (GHCR.IO / DOCKER HUB)"),
  makeParagraph("• Technology Used: GitHub Container Registry (ghcr.io) + Docker Engine."),
  makeParagraph("• Source Code Requirement: DOES NOT REQUIRE SOURCE CODE ON VPS. The pre-built Docker container image already contains all source code, dependencies, and Pradeep_Kumar_Maurya.pdf compiled inside it."),
  makeParagraph("• How It Works: The Docker container image is built on your laptop or CI server and pushed to ghcr.io/pradeep4j/mcp-job-search:latest. Any destination VPS simply pulls and runs the image directly."),
  makeParagraph("• Key Feature: Commands like 'git clone' or 'git pull' are 100% NOT required on the destination VPS."),
  makeParagraph("• Laptop Build & Push: docker build -t ghcr.io/pradeep4j/mcp-job-search:latest . && docker push ghcr.io/pradeep4j/mcp-job-search:latest"),
  makeParagraph("• VPS Run Command: docker pull ghcr.io/pradeep4j/mcp-job-search:latest && docker run -d --name mcp_worker --restart always --env-file .env ghcr.io/pradeep4j/mcp-job-search:latest"),
  makeParagraph(""),
  makeParagraph("--------------------------------------------------------------------------------------------------"),
  makeParagraph("STRATEGY 3: PURE GITHUB ACTIONS CI/CD PIPELINE DEPLOYMENT (WITHOUT DOCKER / USING PM2)"),
  makeParagraph("• Technology Used: GitHub Actions Workflow (.github/workflows/deploy.yml) + PM2 + Node.js (Docker is NOT involved)."),
  makeParagraph("• Prerequisite: Stop running Docker containers first via 'docker compose down'."),
  makeParagraph("• Setup: Add secrets (SMTP_PASS, VPS_HOST, VPS_SSH_KEY) under GitHub Repository Settings -> Secrets and variables -> Actions."),
  makeParagraph("• How It Works: When you push code ('git push') or click 'Run workflow' under the Actions tab in GitHub:"),
  makeParagraph("  1. GitHub Actions connects to VPS via SSH."),
  makeParagraph("  2. Pulls latest code and runs npm install."),
  makeParagraph("  3. Restarts application via PM2: pm2 restart job-search-worker || pm2 start src/queues/jobScheduler.js --name 'job-search-worker'."),
  makeParagraph("• Key Feature: 100% automated deployment directly from GitHub without Docker."),

  makeParagraph("7. PRODUCTION VERIFICATION & COMMAND SUMMARY", false, true),
  makeParagraph("• View Live Logs: docker logs -f mcp_job_search_worker"),
  makeParagraph("• Check Running Containers: docker ps"),
  makeParagraph("• Restart Services: docker compose restart"),
  makeParagraph("• Document Location: F:/document_and_other_louderx_files/apply/MCP_Job_Search_System_Context.docx")
];

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs.join('\n')}
  </w:body>
</w:document>`;

fs.writeFileSync(path.join(tempDir, '[Content_Types].xml'), contentTypesXml);
fs.writeFileSync(path.join(tempDir, '_rels', '.rels'), relsXml);
fs.writeFileSync(path.join(tempDir, 'word', '_rels', 'document.xml.rels'), docRelsXml);
fs.writeFileSync(path.join(tempDir, 'word', 'document.xml'), documentXml);

const destZip = path.resolve('F:/document_and_other_louderx_files/apply/MCP_Job_Search_System_Context.zip');
const destDocx = path.resolve('F:/document_and_other_louderx_files/apply/MCP_Job_Search_System_Context.docx');
if (fs.existsSync(destZip)) fs.unlinkSync(destZip);
if (fs.existsSync(destDocx)) fs.unlinkSync(destDocx);

const zipCmd = `powershell -Command "Compress-Archive -Path '${tempDir}/*' -DestinationPath '${destZip}' -Force"`;
execSync(zipCmd);
fs.renameSync(destZip, destDocx);

console.log(`[SUCCESS] .docx Context File Generated Successfully at:\n${destDocx}`);
