// Job Search Launcher — Pradeep Kumar Maurya
// Builds search URLs across multiple job portals from a single set of inputs.
//
// One stack (MERN or LAMP) is active at a time. The active stack decides the
// profile list, the experience sent to portals, and the NOT-exclusion list.
//
// ---------------------------------------------------------------------------
// EVERY portal below was researched against its real behaviour in July 2026.
// Findings are recorded inline. The recurring hazard: a wrong parameter is
// SILENTLY IGNORED — the page returns HTTP 200 and looks filtered while doing
// nothing. Several of this file's original parameters were exactly that.
// Do not add a parameter here that has not been observed working.
// ---------------------------------------------------------------------------

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// ---------- helpers ----------

const enc = encodeURIComponent;
const slug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Quote anything a portal's parser could split on — spaces, slashes, +, #.
const term = (t) => (/^[A-Za-z0-9.]+$/.test(t) ? t : `"${t}"`);
const phrase = (kw) => `"${kw}"`;

// ---------- stacks ----------

// AI/LLM profiles carry their own experience regardless of the stack's range.
const AI_EXP = { exp: 3, minExp: 2, maxExp: 3 };

// "DevOps" is deliberately absent: the profile lists search for DevOps lead
// roles, and `"DevOps Lead" NOT DevOps` returns nothing. Dropping it also stops
// MERN/LAMP lead postings that mention CI/CD or AWS being filtered out.
//
// This list is SHORT on purpose. `NOT Java` removes every posting that mentions
// Java *anywhere* — including a genuine MERN Lead role at a company whose stack
// also has Java somewhere in the JD. Stacking a dozen such terms drove LinkedIn
// to zero results. Only technologies that essentially never co-occur with a
// MERN/LAMP lead role belong here. Java/.NET/C#/Python were REMOVED for exactly
// that reason: the quoted phrase already keeps "Java Lead" out, because such a
// posting does not contain the phrase "MERN Stack Lead".
const EXCLUDE_COMMON = ["Salesforce", "SAP", "Mainframe", "Embedded", "Drupal"];

// Strict mode requires the posting to name a real technology from Pradeep's
// stack. "Engineering Manager" alone matches Sales/HR/Ops managers; no Sales
// Manager posting ever says React or Laravel. One positive requirement beats
// thirty NOT terms. VERIFIED on LinkedIn: bare "Engineering Manager" → 2000
// results, quoted → 482, +NOT Java → 349, +AND Java → 177 (349+177≈482, so the
// parser genuinely partitions the set). Full strict string → 45.
const AI_REQUIRE  = ["AI", "LLM", "GenAI", "Generative AI", "RAG", "Claude", "OpenAI", "Machine Learning"];
const OPS_REQUIRE = ["DevOps", "Docker", "AWS", "Kubernetes", "CI/CD", "Nginx", "Linux", "GCP"];

// Per-portal vocabularies. Several portals only accept slugs/tags/IDs from a
// fixed list — free text silently 404s or redirects to their homepage.
const HINTS_AI = {
  remoteok: ["machine-learning"],     // VERIFIED tag
  wellfound: "machine-learning-engineer", // VERIFIED role slug
  freelancer: "python",               // VERIFIED skill slug
  wwr: ["2", "18"],                   // Full-Stack, Back-End
};
const HINTS_OPS = {
  remoteok: ["devops"],
  wellfound: "devops-engineer",
  freelancer: "devops",
  wwr: ["6"],                         // DevOps and Sysadmin
};

const STACKS = {
  mern: {
    label: "MERN + React Native",
    tag: "MERN",
    exp: 6, minExp: 4, maxExp: 6,
    // PHP/Laravel/WordPress are NOT excluded — a MERN lead role that also wants
    // LAMP is a fit, not noise.
    exclude: [...EXCLUDE_COMMON],
    require: ["React", "React Native", "Node.js", "Express", "JavaScript", "TypeScript", "MongoDB", "MERN", "Next.js"],
    hints: {
      remoteok: ["react", "node"],    // VERIFIED tags ("frontend" is dead; "front-end" works)
      wellfound: "full-stack-engineer",
      freelancer: "javascript",       // VERIFIED ("react" is NOT a valid slug; "react-js" is)
      wwr: ["2", "17", "18"],         // Full-Stack, Front-End, Back-End
    },
    profiles: [
      { kw: "MERN Stack Lead", checked: true },
      { kw: "MERN Stack Manager", checked: true },
      { kw: "React Native Lead", checked: true },
      { kw: "React Native Tech Lead", checked: true },
      { kw: "React Node.js Tech Lead", checked: true },
      { kw: "Full Stack JavaScript Lead", checked: true },
      { kw: "Engineering Manager React Node.js", checked: true },
      { kw: "Next.js Tech Lead", checked: false },
      { kw: "JavaScript TypeScript Lead", checked: false },
      { kw: "Frontend Architect React", checked: false },
      { kw: "AI Engineering Lead React Node.js", checked: true, ai: true },
      { kw: "LLM Application Lead JavaScript", checked: true, ai: true },
      { kw: "GenAI Tech Lead Node.js", checked: false, ai: true },
      { kw: "AI Augmented Engineering Manager React", checked: false, ai: true },
      { kw: "DevOps Lead Node.js", checked: true, ops: true },
      { kw: "DevOps Engineering Manager", checked: true, ops: true },
      { kw: "Platform Engineering Lead Node.js", checked: true, ops: true },
      { kw: "Cloud Infrastructure Lead JavaScript", checked: false, ops: true },
    ],
  },

  lamp: {
    label: "LAMP / PHP",
    tag: "LAMP",
    exp: 17, minExp: 17, maxExp: 30,
    // React/Node are NOT excluded — Laravel + React roles are still LAMP roles.
    exclude: [...EXCLUDE_COMMON, "Ruby", "Golang"],
    require: ["PHP", "Laravel", "CodeIgniter", "MySQL", "LAMP", "Blade", "Smarty"],
    hints: {
      remoteok: ["php"],
      wellfound: "backend-developer",
      freelancer: "php",
      wwr: ["2", "18"],
    },
    profiles: [
      { kw: "Laravel PHP Lead", checked: true },
      { kw: "PHP Tech Lead", checked: true },
      { kw: "LAMP Engineering Manager", checked: true },
      { kw: "PHP Architect", checked: true },
      { kw: "Laravel Engineering Manager", checked: true },
      { kw: "PHP Team Lead", checked: true },
      { kw: "Technical Architect PHP Laravel", checked: false },
      { kw: "PHP MySQL Lead", checked: false },
      { kw: "AI Engineering Lead PHP", checked: true, ai: true },
      { kw: "LLM Application Lead PHP Laravel", checked: true, ai: true },
      { kw: "GenAI Tech Lead PHP", checked: false, ai: true },
      { kw: "AI Augmented Engineering Manager PHP", checked: false, ai: true },
      { kw: "DevOps Lead PHP Laravel", checked: true, ops: true },
      { kw: "DevOps Engineering Manager", checked: true, ops: true },
      { kw: "Platform Engineering Lead LAMP", checked: true, ops: true },
      { kw: "Cloud Infrastructure Lead PHP", checked: false, ops: true },
    ],
  },
};

function activeStack() {
  const r = $('input[name="stack"]:checked');
  return STACKS[r ? r.value : "mern"];
}

function hintsFor(profile, stack) {
  if (profile.ai) return HINTS_AI;
  if (profile.ops) return HINTS_OPS;
  return stack.hints;
}

// Python is no longer in EXCLUDE_COMMON, so this drop is currently a no-op —
// kept as a guard because re-adding `NOT Python` would silently zero out every
// AI and DevOps search (Python is the default language for both).
function excludeBoolean(stack, profile) {
  const drop = profile && (profile.ai || profile.ops) ? ["Python"] : [];
  return stack.exclude
    .filter((t) => !drop.includes(t))
    .map((t) => ` NOT ${term(t)}`)
    .join("");
}

function requireListFor(profile, stack) {
  if (profile.ai) return AI_REQUIRE;
  if (profile.ops) return OPS_REQUIRE;
  return stack.require;
}

// Full keyword for a portal whose parser really understands boolean:
//   "MERN Stack Lead" AND (React OR Node.js OR ...) NOT Salesforce ...
//
// The AND-group is SKIPPED when the title already names a required technology.
// "MERN Stack Lead" AND (MERN OR React OR ...) is a tautology — the phrase match
// already guarantees it — but it still compounds with every NOT term and helped
// drive LinkedIn to zero results. The group only earns its place on titles like
// "Engineering Manager", which genuinely need a technology anchor to avoid
// matching Sales/HR managers.
// Strict off → bare quoted phrase, nothing else. That alone is the main defence:
// a "Java Lead" posting does not contain the phrase "MERN Stack Lead".
function booleanKeyword(kw, stack, profile, strict) {
  const out = phrase(kw);
  if (!strict) return out;

  const req = requireListFor(profile || {}, stack);
  const redundant = req.some((t) =>
    new RegExp(`(^|[^A-Za-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^A-Za-z0-9]|$)`, "i").test(kw)
  );
  const group = req.length && !redundant ? ` AND (${req.map(term).join(" OR ")})` : "";
  return out + group + excludeBoolean(stack, profile);
}

// ---------- Naukri department code ----------
// VERIFIED: `functionAreaIdGid` is the real param (Naukri labels it "Department").
// Its IT value could NOT be verified — Naukri's robots.txt disallows automated
// agents, and the taxonomy is served by a recaptcha-gated API. Guessing an ID
// returns the wrong vertical silently, so it is left blank until the user
// supplies it from their own browser. Persisted in localStorage.
const NAUKRI_FN_KEY = "naukriFunctionAreaId";

function naukriFnId() {
  const v = ($("#naukriFn") && $("#naukriFn").value || "").trim();
  return /^\d+$/.test(v) ? v : "";
}

// ---------- dates ----------

function defaultDates() { applyQuickRange(7); }

function setActiveQuick(days) {
  $$(".quick button").forEach((b) => {
    b.classList.toggle("active", parseInt(b.dataset.days, 10) === days);
  });
}

function applyQuickRange(days) {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - days);
  $("#fromDate").value = from.toISOString().slice(0, 10);
  $("#toDate").value = to.toISOString().slice(0, 10);
  setActiveQuick(days);
}

function daysSinceFromDate() {
  const f = $("#fromDate").value;
  if (!f) return 7;
  return Math.max(1, Math.ceil((Date.now() - new Date(f).getTime()) / 86400000));
}

function snap(days, supported) {
  return supported.reduce((best, n) => (Math.abs(n - days) < Math.abs(best - days) ? n : best), supported[0]);
}

// ---------- location maps ----------
// Each portal wants a different shape. Verified notes:
//   foundit   — lowercased display name
//   shine     — display name, hyphens BREAK it ("new-delhi" ✗, "delhi" ✓)
//   hirist    — city name, not an ID; single value only; "Remote" is a location
//   iimjobs   — city name (same codebase as hirist)
//   wellfound — fixed slug vocabulary; "delhi-ncr" is NOT real, "new-delhi" is
//   glassdoor — locT/locId pair; only India (115) is verified

const LOC = {
  "delhi-ncr": { display: "Delhi NCR", naukri: "delhi-ncr", linkedin: "Delhi, India", indeed: "Delhi, Delhi", foundit: "delhi", shine: "delhi", timesjobs: "Delhi", hirist: "Delhi", iimjobs: "Delhi", wellfound: "new-delhi", instahyre: "delhi" },
  "delhi":     { display: "Delhi", naukri: "delhi", linkedin: "Delhi, India", indeed: "Delhi", foundit: "delhi", shine: "delhi", timesjobs: "Delhi", hirist: "Delhi", iimjobs: "Delhi", wellfound: "new-delhi", instahyre: "delhi" },
  "noida":     { display: "Noida", naukri: "noida", linkedin: "Noida, India", indeed: "Noida, Uttar Pradesh", foundit: "noida", shine: "noida", timesjobs: "Noida", hirist: "Noida", iimjobs: "Noida", wellfound: "noida", instahyre: "noida" },
  "gurgaon":   { display: "Gurgaon", naukri: "gurgaon", linkedin: "Gurgaon, India", indeed: "Gurgaon, Haryana", foundit: "gurgaon", shine: "gurgaon", timesjobs: "Gurgaon", hirist: "Gurgaon", iimjobs: "Gurgaon", wellfound: "gurgaon", instahyre: "gurgaon" },
  "ghaziabad": { display: "Ghaziabad", naukri: "ghaziabad", linkedin: "Ghaziabad, India", indeed: "Ghaziabad", foundit: "ghaziabad", shine: "ghaziabad", timesjobs: "Ghaziabad", hirist: "Ghaziabad", iimjobs: "Ghaziabad", wellfound: "ghaziabad", instahyre: "ghaziabad" },
  "bangalore": { display: "Bangalore", naukri: "bangalore", linkedin: "Bengaluru, India", indeed: "Bengaluru, Karnataka", foundit: "bangalore", shine: "bangalore", timesjobs: "Bangalore", hirist: "Bangalore", iimjobs: "Bangalore", wellfound: "bangalore-urban", instahyre: "bangalore" },
  "hyderabad": { display: "Hyderabad", naukri: "hyderabad", linkedin: "Hyderabad, India", indeed: "Hyderabad, Telangana", foundit: "hyderabad", shine: "hyderabad", timesjobs: "Hyderabad", hirist: "Hyderabad", iimjobs: "Hyderabad", wellfound: "hyderabad", instahyre: "hyderabad" },
  "pune":      { display: "Pune", naukri: "pune", linkedin: "Pune, India", indeed: "Pune, Maharashtra", foundit: "pune", shine: "pune", timesjobs: "Pune", hirist: "Pune", iimjobs: "Pune", wellfound: "pune", instahyre: "pune" },
  "mumbai":    { display: "Mumbai", naukri: "mumbai", linkedin: "Mumbai, India", indeed: "Mumbai, Maharashtra", foundit: "mumbai", shine: "mumbai", timesjobs: "Mumbai", hirist: "Mumbai", iimjobs: "Mumbai", wellfound: "mumbai", instahyre: "mumbai" },
  "india":     { display: "India", naukri: "india", linkedin: "India", indeed: "India", foundit: "india", shine: "india", timesjobs: "India", hirist: "", iimjobs: "", wellfound: "india", instahyre: "india" },
  "anywhere":  { display: "Anywhere", naukri: "", linkedin: "Worldwide", indeed: "", foundit: "", shine: "", timesjobs: "", hirist: "", iimjobs: "", wellfound: "", instahyre: "" },
};

// ---------- portal builders ----------
//
// syntax: how much boolean the portal's search parser actually understands.
//   "full"  → quotes + AND/OR/NOT + parentheses. VERIFIED by result-count deltas.
//   "plain" → keyword matched literally; boolean is stripped as noise or returns
//             zero. Narrow these with their own native filters instead.

const PORTALS = {
  naukri: {
    label: "Naukri.com", syntax: "plain",
    note: "India's biggest · department filter needs your one-time lookup",
    // VERIFIED param allow-list, read from Naukri's own SRP bundle:
    //   jobAge, wfhType, cityTypeGid, ctcFilter, experience, jobTypeFilter,
    //   jobPostType, industryTypeIdGid, functionAreaIdGid, roleTypeFilterGid, ...
    // NOTE: `jobType` is NOT in that list — the original code's jobType=0/1/2
    // was a fake param, silently ignored. Removed. `roleId` is also not real.
    build: ({ kw, loc, exp, days, jobType }) => {
      const slugLoc = loc.naukri || "india";
      const params = new URLSearchParams({
        k: kw,                                   // literal; no boolean support
        l: slugLoc,
        experience: String(Math.max(0, Math.min(30, exp))), // single value only
        jobAge: String(snap(days, [1, 3, 7, 15, 30])),      // VERIFIED values
      });
      // wfhType param is VERIFIED real; its codes are API-driven and UNCERTAIN.
      // 2=remote is the widely-reported value.
      if (jobType === "remote") params.set("wfhType", "2");
      // Department. Blank unless the user supplied their looked-up ID.
      const fn = naukriFnId();
      if (fn) params.set("functionAreaIdGid", fn);
      return `https://www.naukri.com/${slug(kw)}-jobs-in-${slugLoc}?${params.toString()}`;
    }
  },

  foundit: {
    label: "Foundit (ex-Monster)", syntax: "plain",
    note: "IT-filtered at source · functions=it verified",
    // VERIFIED: ?query=engineering manager&locations=bangalore → 6150 results;
    // adding &functions=it → 639, all IT roles. Their own docs claim quotes give
    // exact phrases — measured false: quotes/AND/OR/NOT are stripped as noise.
    build: ({ kw, loc, minExp, maxExp, days, jobType }) => {
      const params = new URLSearchParams({
        query: kw,                                  // plain only
        locations: loc.foundit || "",
        functions: "it",                            // VERIFIED IT restrictor
        experienceRanges: `${minExp}~${maxExp}`,    // tilde mandatory; hyphen breaks
        jobFreshness: String(snap(days, [1, 3, 7, 15, 30, 60])),
      });
      // VERIFIED: no dedicated remote param; remote is a jobTypes value.
      // "full time"/"part time" return 0 — only permanent/contract are real.
      // fulltime deliberately sends NO jobTypes: permanent is already the bulk of
      // the corpus, and stacking it on top of functions=it + a 4~6 experience
      // window + freshness was narrow enough to return nothing.
      if (jobType === "remote") params.set("jobTypes", "work from home");
      else if (jobType === "contract" || jobType === "freelance") params.set("jobTypes", "contract");
      return `https://www.foundit.in/srp/results?${params.toString()}`;
    }
  },

  linkedin: {
    label: "LinkedIn Jobs", syntax: "full",
    note: "Real boolean · keywords are the only category lever",
    // VERIFIED by result counts: quotes/AND/OR/NOT/parens all parse.
    // f_F (job function) is DEAD — f_F=eng, f_F=it and garbage f_F=zzzzz all
    // return the identical unfiltered count. Do not re-add it. f_I and f_T were
    // also inert when logged out.
    build: ({ bkw, loc, days, jobType }) => {
      const params = new URLSearchParams({
        keywords: bkw,
        location: loc.linkedin || "India",
        f_TPR: days <= 1 ? "r86400" : days <= 7 ? "r604800" : "r2592000",
        f_E: "4,5,6", // VERIFIED 1=Intern … 4=Mid-Senior, 5=Director, 6=Executive
      });
      if (jobType === "fulltime") params.set("f_JT", "F");
      else if (jobType === "parttime") params.set("f_JT", "P");
      else if (jobType === "contract" || jobType === "freelance") params.set("f_JT", "C");
      if (jobType === "remote") params.set("f_WT", "2"); // VERIFIED 1=On-site,2=Remote,3=Hybrid
      return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
    }
  },

  indeed: {
    label: "Indeed India", syntax: "full",
    note: "Real boolean + title: operator",
    // VERIFIED: q supports AND/OR/NOT/quotes/parens plus title:"..." — the best
    // category proxy, since no job-function param exists.
    build: ({ kw, bkw, loc, days, jobType }) => {
      const params = new URLSearchParams({
        q: `title:${phrase(kw)} ${bkw}`,
        l: loc.indeed || "India",
        fromage: String(snap(days, [1, 3, 7, 14])),
        explvl: "senior_level", // VERIFIED: entry_level | mid_level | senior_level
      });
      if (jobType === "fulltime") params.set("jt", "fulltime");
      else if (jobType === "parttime") params.set("jt", "parttime");
      else if (jobType === "contract" || jobType === "freelance") params.set("jt", "contract");
      // VERIFIED: remotejob is a GUID, NOT "1". The old remotejob=1 silently
      // did nothing — every "remote" Indeed link was unfiltered.
      if (jobType === "remote") params.set("remotejob", "032b3046-06a3-4876-8dfd-474eb5e7ed11");
      return `https://in.indeed.com/jobs?${params.toString()}`;
    }
  },

  hirist: {
    label: "Hirist.tech", syntax: "plain",
    note: "IT-only by design · no function filter needed",
    // VERIFIED: the old /search?keyword=&location=&experience=4-6 returned a
    // 32KB empty SPA shell that never rendered, and experience=4-6 was ignored.
    // Real format is a path slug + loc/minexp/maxexp/posting.
    build: ({ kw, loc, minExp, maxExp, days, jobType }) => {
      const params = new URLSearchParams();
      // VERIFIED: remote is a *location* value, not a flag. Single value only.
      const city = jobType === "remote" ? "Remote" : (loc.hirist || "");
      if (city) params.set("loc", city);
      params.set("minexp", String(minExp));
      params.set("maxexp", String(maxExp));
      params.set("posting", String(snap(days, [1, 3, 7, 15, 30])));
      return `https://www.hirist.tech/search/${slug(kw)}-jobs?${params.toString()}`;
    }
  },

  iimjobs: {
    label: "iimjobs", syntax: "plain",
    note: "Mgmt roles · carries Sales/HR/Finance too",
    // VERIFIED SILENT CORRUPTION: the old .html URL 301'd while rewriting the
    // city — bangalore→Chennai, mumbai→Chennai, delhi→Kolkata — and dropped the
    // experience range entirely. It returned 200 the whole time.
    build: ({ kw, loc, minExp, maxExp, days }) => {
      const params = new URLSearchParams();
      if (loc.iimjobs) params.set("loc", loc.iimjobs);
      params.set("minexp", String(minExp));
      params.set("maxexp", String(maxExp));
      params.set("posting", String(snap(days, [1, 3, 7, 15, 30])));
      return `https://www.iimjobs.com/search/${slug(kw)}-jobs?${params.toString()}`;
    }
  },

  shine: {
    label: "Shine.com", syntax: "plain",
    note: "findustry=18 restricts to IT · no date filter exists",
    // VERIFIED: ?q= is ignored on the SRP (keyword comes from the slug), and
    // q="engineering manager" returns the ENTIRE 110,315-job corpus rather than
    // zero. findustry=18 is the real IT restrictor; farea=1301 alone is a
    // mis-tagged catch-all covering 93% of jobs (still yields Area Sales Manager).
    build: ({ kw, loc, exp, jobType }) => {
      const params = new URLSearchParams({ findustry: "18", farea: "1301" });
      if (loc.shine) params.set("loc", loc.shine); // hyphens break this
      params.set("minexp", String(exp));
      if (jobType === "fulltime") params.set("job_type", "1");
      else if (jobType === "parttime") params.set("job_type", "2");
      if (jobType === "remote") params.set("emp_type", "4"); // VERIFIED WFH
      // VERIFIED: no date/freshness param exists. sort=1 = newest first.
      params.set("sort", "1");
      return `https://www.shine.com/job-search/${slug(kw)}-jobs-in-${slug(loc.shine || "india")}?${params.toString()}`;
    }
  },

  timesjobs: {
    label: "TimesJobs", syntax: "full",
    note: "Real boolean — but defaults to OR, so phrases must be quoted",
    // VERIFIED via their public API: java AND python = 8955, java NOT python =
    // 4443, and 8955+4443 = 13398 = `java` exactly. Malformed syntax → HTTP 500,
    // proving a real parser. Default operator is OR, so an unquoted phrase
    // returns Sales Managers. The old searchType/from params are vestigial.
    build: ({ bkw, loc, exp }) => {
      const params = new URLSearchParams({
        txtKeywords: bkw,
        cboPresFuncArea: "35", // VERIFIED: IT Software — Software Products & Services
      });
      if (loc.timesjobs) params.set("txtLocation", loc.timesjobs);
      params.set("cboWorkExp1", String(exp)); // single int; ranges ignored
      return `https://www.timesjobs.com/job-search?${params.toString()}`;
    }
  },

  glassdoor: {
    label: "Glassdoor India", syntax: "plain",
    note: "Nation-level only · no verified function filter",
    // VERIFIED: locT/locId pair (N=nation, locId=115=India). The old
    // locKeyword param was not verified. jobType as a URL param is UNCERTAIN —
    // most sources for it are Apify scraper schemas, not Glassdoor URLs — so it
    // is deliberately omitted rather than shipped unproven.
    build: ({ kw, days, jobType }) => {
      const params = new URLSearchParams({
        "sc.keyword": kw,
        locT: "N",
        locId: "115",
        fromAge: String(snap(days, [1, 3, 7, 14, 30])),
      });
      if (jobType === "remote") params.set("remoteWorkType", "1"); // VERIFIED
      return `https://www.glassdoor.co.in/Job/jobs.htm?${params.toString()}`;
    }
  },

  cutshort: {
    label: "Cutshort", syntax: "plain",
    note: "No query filters · city slugs omitted (they soft-404)",
    // VERIFIED: no query filtering of any kind; ?experience= is stripped by the
    // canonical. City slugs must be exact ("bangalore-bengaluru", not
    // "bangalore") and a wrong slug soft-404s with HTTP 200 — undetectable. The
    // city is therefore omitted rather than guessed. Remote is a slug prefix.
    build: ({ kw, jobType }) =>
      jobType === "remote"
        ? `https://cutshort.io/jobs/remote-${slug(kw)}-jobs`
        : `https://cutshort.io/jobs/${slug(kw)}-jobs`
  },

  instahyre: {
    label: "Instahyre", syntax: "plain",
    note: "Path-based · carries sales/marketing roles too",
    // VERIFIED: keyword/city_name/min_exp/max_exp were INVENTED — no evidence
    // any of them exist. Only ?page=N is real. Path-slug based.
    build: ({ kw, loc, jobType }) => {
      if (jobType === "remote") return `https://www.instahyre.com/remote-${slug(kw)}-jobs/`;
      return loc.instahyre
        ? `https://www.instahyre.com/${slug(kw)}-jobs-in-${loc.instahyre}/`
        : `https://www.instahyre.com/${slug(kw)}-jobs/`;
    }
  },

  wellfound: {
    label: "Wellfound (AngelList)", syntax: "plain",
    note: "Fixed role vocabulary · role IS the filter",
    // VERIFIED: the old ?q=&l=&remote= params were unverifiable, and
    // "delhi-ncr" is not a real slug. Public SEO routes work logged out:
    //   /role/{role} · /role/r/{role} (remote) · /role/l/{role}/{location}
    // Role slugs come from a fixed ~50-item vocabulary — free text will not work,
    // so the profile's keyword is mapped to a verified slug.
    build: ({ loc, jobType, hints }) => {
      const role = hints.wellfound;
      if (jobType === "remote") return `https://wellfound.com/role/r/${role}`;
      return loc.wellfound
        ? `https://wellfound.com/role/l/${role}/${loc.wellfound}`
        : `https://wellfound.com/role/${role}`;
    }
  },

  weworkremotely: {
    label: "We Work Remotely", syntax: "plain",
    note: "Free text + real engineering categories · best remote board",
    // VERIFIED from WWR's own form markup: action="/remote-jobs/search",
    // name="term", categories[] numeric IDs (2=Full-Stack, 17=Front-End,
    // 18=Back-End, 6=DevOps). Sales & Marketing is 9 — excluded by omission.
    build: ({ kw, hints }) => {
      const params = new URLSearchParams({ term: kw });
      for (const c of hints.wwr) params.append("categories[]", c);
      return `https://weworkremotely.com/remote-jobs/search?${params.toString()}`;
    }
  },

  remoteok: {
    label: "Remote OK", syntax: "plain",
    note: "Tag-only · multi-word phrases redirect to homepage",
    // VERIFIED: there is NO free-text search. ?q= and ?search= are silently
    // ignored, and remote-engineering-manager-jobs 301s to the HOMEPAGE — so
    // every multi-word link this file used to build was dumping the user on the
    // front page. Only verified tags work; multi-tag joins with "+".
    // Dead tags to avoid: frontend (use front-end), vue, rust, sre, qa, architect.
    build: ({ hints }) => `https://remoteok.com/remote-${hints.remoteok.join("+")}-jobs`
  },

  freelancer: {
    label: "Freelancer.com", syntax: "plain",
    note: "Free-text path search · ?keyword= was a no-op",
    // VERIFIED BROKEN: /jobs/?keyword=react is byte-identical (same md5) to bare
    // /jobs/ — the param did nothing at all. Real free-text search lives at
    // /job-search/{hyphenated-slug}/.
    build: ({ kw }) => `https://www.freelancer.com/job-search/${slug(kw)}/`
  },

  upwork: {
    label: "Upwork", syntax: "full",
    note: "Boolean confirmed by official docs · uppercase operators",
    // VERIFIED via Upwork's own help docs: AND/OR/NOT (uppercase), quoted
    // phrases, parentheses, * wildcard. category2_uid is real but its
    // engineering UID is UNKNOWN — omitted rather than invented. sort=recency
    // was UNCERTAIN and is dropped.
    build: ({ bkw }) => `https://www.upwork.com/nx/search/jobs/?${new URLSearchParams({ q: bkw })}`
  },
};

// ---------- profile rendering ----------

function renderProfiles() {
  const stack = activeStack();
  const box = $("#profiles");
  box.innerHTML = "";
  for (const p of stack.profiles) {
    const label = document.createElement("label");
    if (p.ai) label.className = "ai";
    else if (p.ops) label.className = "ops";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = p.kw;
    cb.checked = p.checked;
    cb.dataset.ai = p.ai ? "1" : "";
    cb.dataset.ops = p.ops ? "1" : "";
    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + p.kw));
    if (p.ai || p.ops) {
      const b = document.createElement("span");
      b.className = p.ai ? "ai-badge" : "ops-badge";
      b.textContent = `${p.ai ? AI_EXP.exp : stack.exp}y`;
      label.appendChild(b);
    }
    box.appendChild(label);
  }
  $("#stackTag").textContent = stack.tag;
  $("#minExp").value = stack.minExp;
  $("#maxExp").value = stack.maxExp;
}

function renderExpNotes() {
  $$(".exp-note").forEach((el) => {
    const s = STACKS[el.dataset.exp];
    el.textContent = `${s.minExp}–${s.maxExp} yrs · AI/LLM ${AI_EXP.exp} yrs`;
  });
  $("#aiExpNote").textContent = `${AI_EXP.exp} yrs`;
}

// ---------- read state ----------

function locKey() { return $("#location").value; }
function getChecked(sel) { return $$(sel + " input:checked").map((i) => i.value); }

function readState() {
  const lk = locKey();
  const stack = activeStack();
  const profiles = $$("#profiles input:checked").map((i) => ({
    kw: i.value,
    ai: i.dataset.ai === "1",
    ops: i.dataset.ops === "1",
  }));
  return {
    stack,
    days: daysSinceFromDate(),
    loc: { ...LOC[lk], key: lk },
    minExp: parseInt($("#minExp").value, 10) || 0,
    maxExp: parseInt($("#maxExp").value, 10) || 30,
    jobTypes: getChecked("#jobTypes"),
    profiles,
    portals: getChecked("#portals"),
    strict: $("#strict").checked,
  };
}

// ---------- generate ----------

async function generate() {
  const s = readState();
  if (!s.profiles.length) return alert("Pick at least one search profile.");
  if (!s.portals.length) return alert("Pick at least one portal.");
  if (!s.jobTypes.length) s.jobTypes = ["fulltime"];

  const container = $("#results");
  container.innerHTML = "";
  $("#loadingIndicator").style.display = "inline";

  const allUrls = [];

  for (const portalKey of s.portals) {
    const portal = PORTALS[portalKey];
    if (!portal) continue;

    const seen = new Set();
    for (const p of s.profiles) {
      const exp = p.ai ? AI_EXP.exp : Math.min(Math.max(s.stack.exp, s.minExp), s.maxExp);
      const minExp = p.ai ? AI_EXP.minExp : s.minExp;
      const maxExp = p.ai ? AI_EXP.maxExp : s.maxExp;
      const hints = hintsFor(p, s.stack);

      const bkw = portal.syntax === "full"
        ? booleanKeyword(p.kw, s.stack, p, s.strict)
        : p.kw;

      for (const jt of s.jobTypes) {
        const url = portal.build({
          kw: p.kw, bkw, loc: s.loc, exp, minExp, maxExp,
          days: s.days, jobType: jt, stack: s.stack, hints,
        });
        if (seen.has(url)) continue;
        seen.add(url);
        allUrls.push({ url, label: `${p.kw} · ${jt}` });
      }
    }
  }

  try {
    const response = await fetch('http://localhost:3000/api/scan-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: allUrls, stack: s.stack.tag.toLowerCase(), minExp: s.minExp })
    });
    
    const data = await response.json();
    
    if (data.jobs && data.jobs.length > 0) {
      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.innerHTML = `
        <thead>
          <tr style="border-bottom: 1px solid #ccc;">
            <th style="text-align: left; padding: 8px;">Match %</th>
            <th style="text-align: left; padding: 8px;">Job Title</th>
            <th style="text-align: left; padding: 8px;">Company</th>
            <th style="text-align: left; padding: 8px;">Portal</th>
            <th style="text-align: left; padding: 8px;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${data.jobs.map(job => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold; color: ${job.matchScore >= 85 ? 'green' : (job.matchScore >= 75 ? 'orange' : 'black')}">${job.matchScore}%</td>
              <td style="padding: 8px;">${job.title}</td>
              <td style="padding: 8px;">${job.company}</td>
              <td style="padding: 8px;">${job.portal}</td>
              <td style="padding: 8px;"><a href="${job.url}" target="_blank" rel="noopener noreferrer">Apply</a></td>
            </tr>
          `).join('')}
        </tbody>
      `;
      container.appendChild(table);
    } else {
      container.innerHTML = "<p>No jobs found with 70%+ match.</p>";
    }
  } catch (e) {
    console.error(e);
    container.innerHTML = "<p>Error connecting to backend scanner. Is the server running?</p>";
  } finally {
    $("#loadingIndicator").style.display = "none";
  }

  $("#resultsTag").textContent = s.stack.tag;
  $("#resultsCard").hidden = false;
  resetOpenQueue();
  $("#resultsCard").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- open in tabs ----------

// Browsers cap how many tabs one click may spawn. Open in batches and keep the
// window.open calls synchronous inside the handler — no confirm(), no await —
// or the click's transient user activation expires and every tab gets blocked.
const BATCH_SIZE = 10;
let openQueue = [];

function resetOpenQueue() {
  openQueue = [];
  $("#openAll").textContent = "Open all in new tabs";
  $("#popupTip").hidden = true;
}

function openAll() {
  if (!openQueue.length) {
    const links = $$("#results a");
    if (!links.length) return alert("Generate links first.");
    openQueue = links.map((a) => a.href);
  }

  const batch = openQueue.splice(0, BATCH_SIZE);
  let blocked = 0;
  for (const url of batch) {
    // Passing "noopener" as windowFeatures makes the browser return null even on
    // success, which made the old blocked-count always wrong. Sever opener manually.
    const w = window.open(url, "_blank");
    if (w) w.opener = null;
    else blocked++;
  }

  const btn = $("#openAll");
  btn.textContent = openQueue.length
    ? `Open next ${Math.min(BATCH_SIZE, openQueue.length)} (${openQueue.length} left)`
    : "Open all in new tabs";
  if (!openQueue.length) setTimeout(resetOpenQueue, 100);

  const tip = $("#popupTip");
  if (blocked) {
    tip.hidden = false;
    tip.innerHTML = `<strong>${blocked} of ${batch.length}</strong> tabs were blocked.
      On <code>file://</code> Chrome won't take an allowlist entry from the address bar —
      add <code>file:///*</code> under <code>chrome://settings/content/popups</code>,
      or use <strong>Copy all links</strong>, which can never be blocked.`;
  } else {
    tip.hidden = true;
  }
}

async function copyAll() {
  const links = $$("#results a");
  if (!links.length) return alert("Generate links first.");
  const text = links.map((a) => `${a.textContent}\n${a.href}`).join("\n\n");
  const btn = $("#copyAll");
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  btn.textContent = `Copied ${links.length} links`;
  setTimeout(() => (btn.textContent = "Copy all links"), 1800);
}

function reset() {
  defaultDates();
  $("#location").value = "delhi-ncr";
  $('input[name="stack"][value="mern"]').checked = true;
  renderProfiles();
  $("#results").innerHTML = "";
  $("#resultsCard").hidden = true;
  resetOpenQueue();
}

// ---------- events ----------

document.addEventListener("DOMContentLoaded", () => {
  defaultDates();
  renderExpNotes();
  renderProfiles();

  // Naukri department ID persists across sessions once looked up.
  const saved = localStorage.getItem(NAUKRI_FN_KEY);
  if (saved) $("#naukriFn").value = saved;
  $("#naukriFn").addEventListener("input", (e) => {
    localStorage.setItem(NAUKRI_FN_KEY, e.target.value.trim());
  });

  $("#generate").addEventListener("click", generate);
  $("#reset").addEventListener("click", reset);

  $$('input[name="stack"]').forEach((r) =>
    r.addEventListener("change", () => {
      renderProfiles();
      $("#results").innerHTML = "";
      $("#resultsCard").hidden = true;
      resetOpenQueue();
    })
  );

  $$(".quick button").forEach((b) =>
    b.addEventListener("click", () => applyQuickRange(parseInt(b.dataset.days, 10)))
  );

  ["#fromDate", "#toDate"].forEach((sel) =>
    $(sel).addEventListener("input", () => setActiveQuick(null))
  );
});
