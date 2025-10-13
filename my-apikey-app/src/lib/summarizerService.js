/**
 * SummarizerService - Handles repository summarization using Transformers.js
 * Includes built-in GitHub API probes (stars, license, homepage, latest_version, languages, README, manifests).
 * Keep SOLID: the model-based summarization is isolated; probes are helpers in the same module for convenience.
 */

const SUMMARIZATION_MODEL = 'Xenova/distilbart-cnn-6-6';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''; // optional but recommended
const DEFAULT_OLLAMA_MODEL = 'llama3.2:3b-instruct'; // unused here; kept for future parity

/* -------------------------------------------------------------------------- */
/*                               GitHub helpers                               */
/* -------------------------------------------------------------------------- */

function ghHeaders(extra = {}) {
  const h = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'readme-summarizer',
  };
  if (GITHUB_TOKEN) h.Authorization = `Bearer ${GITHUB_TOKEN}`;
  return { ...h, ...extra };
}

async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message && error.message.includes('403') && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i); // Exponential backoff
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

async function ghGetJson(url) {
  return retryWithBackoff(async () => {
  const res = await fetch(url, { headers: ghHeaders() });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${url}`);
  return res.json();
  });
}

function parseRepoUrl(input) {
  try {
    const u = new URL(input);
    if (u.hostname !== 'github.com') throw new Error('Expected https://github.com/<owner>/<repo>');
    const parts = u.pathname.replace(/^\/+|\/+$/g, '').split('/');
    if (parts.length < 2) throw new Error('Invalid GitHub URL path');
    const [owner, repoRaw] = parts;
    return { owner, repo: repoRaw.replace(/\.git$/,'') };
  } catch (error) {
    throw new Error(`Invalid GitHub URL: ${input}. Expected format: https://github.com/owner/repo`);
  }
}

async function fetchRepoMeta(owner, repo) {
  // Add delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    const j = await ghGetJson(`https://api.github.com/repos/${owner}/${repo}`);
    return {
      stars: j.stargazers_count ?? 0,
      license_type: j.license?.spdx_id || j.license?.key || null,
      website_url: j.homepage || null,
      default_branch: j.default_branch || 'main',
      description: j.description || null,
      topics: j.topics || [],
      language: j.language || null,
      forks: j.forks_count ?? 0,
      open_issues: j.open_issues_count ?? 0,
      watchers: j.watchers_count ?? 0,
      created_at: j.created_at || null,
      updated_at: j.updated_at || null,
    };
  } catch (error) {
    console.error(`Error fetching repo metadata for ${owner}/${repo}:`, error);
    return {
      stars: 0,
      license_type: null,
      website_url: null,
      default_branch: 'main',
      description: null,
      topics: [],
      language: null,
      forks: 0,
      open_issues: 0,
      watchers: 0,
      created_at: null,
      updated_at: null,
    };
  }
}

async function fetchLatestVersion(owner, repo) {
  // Add delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 100));

  // releases/latest may 404 if none
  try {
    const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, { headers: ghHeaders() });
    if (r.status === 200) {
      const j = await r.json();
      return j.tag_name || j.name || null;
    }
  } catch (error) {
    console.error(`Error fetching latest release for ${owner}/${repo}:`, error);
  }
  // tags fallback
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    const tags = await ghGetJson(`https://api.github.com/repos/${owner}/${repo}/tags?per_page=1`);
    if (Array.isArray(tags) && tags.length) return tags[0].name || null;
  } catch (error) {
    console.error(`Error fetching tags for ${owner}/${repo}:`, error);
  }
  return null;
}

async function fetchLanguages(owner, repo) {
  // Add delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    const j = await ghGetJson(`https://api.github.com/repos/${owner}/${repo}/languages`);
    return Object.keys(j || {});
  } catch (error) {
    console.error(`Error fetching languages for ${owner}/${repo}:`, error);
    return [];
  }
}

async function fetchReadme(owner, repo, ref) {
  // Add a small delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 100));

  // Prefer the /readme endpoint (returns base64 content + download_url)
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/readme${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`;
    const res = await fetch(url, { headers: ghHeaders() });

    if (res.status === 200) {
      const j = await res.json();
      const content = j.content ? Buffer.from(j.content, 'base64').toString('utf8') : '';
      return { text: content, download_url: j.download_url, path: j.path };
    } else if (res.status === 403) {
      // If we hit rate limiting, throw a more specific error
      throw new Error(`Rate limited by GitHub API. Try again later or use authentication.`);
    } else if (res.status === 404) {
      throw new Error(`README not found in repository ${owner}/${repo}`);
    }
  } catch (error) {
    if (error.message.includes('Rate limited')) {
      throw error; // Re-throw rate limit errors
    }
    console.error(`Error fetching README via API endpoint for ${owner}/${repo}:`, error);
  }

  // Simplified fallback: try common README filenames directly
  const commonReadmeNames = ['README.md', 'README.txt', 'README', 'readme.md', 'readme.txt'];

  for (const readmeName of commonReadmeNames) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200)); // Longer delay for fallback
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(readmeName)}${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`;
      const res = await fetch(url, { headers: ghHeaders() });

      if (res.status === 200) {
        const j = await res.json();
    const content = j.content ? Buffer.from(j.content, 'base64').toString('utf8') : '';
        return { text: content, download_url: j.download_url, path: j.path };
      }
  } catch (error) {
      console.error(`Error fetching ${readmeName} for ${owner}/${repo}:`, error);
    }
  }

  throw new Error(`README not found in repository ${owner}/${repo}`);
}

async function fetchOptionalText(owner, repo, path, ref) {
  // Add delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`;
    const res = await fetch(url, { headers: ghHeaders() });
    if (!res.ok) return null;
    const j = await res.json();
    return j.content ? Buffer.from(j.content, 'base64').toString('utf8') : null;
  } catch (error) {
    console.error(`Error fetching optional text ${path} for ${owner}/${repo}:`, error);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                           README parsing (improved)                         */
/* -------------------------------------------------------------------------- */

const SECTION_TITLES = {
  FEATURES: [
    'features', 'key features', 'highlights', 'capabilities',
    'what it does', 'overview', 'about', 'description'
  ],
  TOOLS: [
    'tools', 'technologies', 'stack', 'tech stack', 'built with',
    'requirements', 'dependencies', 'setup', 'installation'
  ],
};

const BULLET_RE = /^\s*(?:[-*+]\s+|\d+\.\s+)(.+)$/gm;
const HEADING_RE = /^#{2,6}\s+(.+?)\s*$|^([A-Z][A-Za-z\s]*):?$|^([A-Z\s]{3,})$/;

function norm(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[.:!?()[\]]/g, '')
    .trim();
}
function isTitleMatch(heading, targetList) {
  const h = norm(heading);
  return targetList.some(t => h.includes(norm(t)));
}
function splitLines(md) { return md.replace(/\r/g, '').split('\n'); }
function stripBadges(md) {
  return md
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')   // ![alt](url)
    .replace(/<img[^>]*>/gi, '');          // <img ...>
}
function firstMeaningfulParagraph(md) {
  const blocks = md.replace(/\r/g, '').split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
  for (const b of blocks) {
    if (b.startsWith('#')) continue;
    // Clean markdown links and other formatting
    const cleaned = b.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
                     .replace(/[#*`_~\[\]()]/g, '')
                     .replace(/\s+/g, ' ')
                     .trim();
    if (cleaned.length >= 40) return cleaned.slice(0, 600);
  }
  // Fallback to first non-header block
  const firstBlock = blocks.find(b => !b.startsWith('#'));
  if (firstBlock) {
    return firstBlock.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
                    .replace(/[#*`_~\[\]()]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .slice(0, 600);
  }
  return '';
}
function collectBulletsUnderHeadings(md, headings, max = 8) {
  const lines = splitLines(md);
  const out = [];
  let capturing = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const hm = line.match(HEADING_RE);
    if (hm) {
      // Extract heading text from the appropriate capture group
      const headingText = hm[1] || hm[2] || hm[3] || '';
      capturing = isTitleMatch(headingText, headings);
      continue;
    }

    if (capturing) {
      if (line.match(/^#{1,6}\s+/) || line.match(/^([A-Z][A-Za-z\s]*):?$/) || line.match(/^([A-Z\s]{3,})$/)) {
        capturing = false;
        continue;
      }
      let m;
      BULLET_RE.lastIndex = 0;
      while ((m = BULLET_RE.exec(line)) && out.length < max) {
        const text = (m[1] || '').trim();
        if (text.length > 2) out.push(text);
      }
    }
  }
  return out.slice(0, max);
}
function extractWebsiteFromReadme(md) {
  const urls = [];

  // Look for labeled website URLs (most reliable)
  const labeledPatterns = [
    /\b(?:Website|Demo|Docs?|Homepage|Site|Project)\b[^:\n]*:\s*(https?:\/\/[^\s)]+)\)?/gi,
    /\[.*?\]\((https?:\/\/[^\s)]+)\)/g,  // Markdown links
    /https?:\/\/[^\s<>"']+/g  // Any HTTP/HTTPS URLs
  ];

  labeledPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(md)) !== null) {
      const url = match[1] || match[0];
      if (url && isValidWebsiteUrl(url)) {
        urls.push(url);
      }
    }
  });

  // Remove duplicates and filter out non-website URLs
  const uniqueUrls = [...new Set(urls)];

  // Prioritize non-GitHub URLs, then any valid website URL
  for (const url of uniqueUrls) {
    if (!url.includes('github.com') && !url.includes('githubusercontent.com')) {
      return url;
    }
  }

  // If no non-GitHub URLs found, return the first valid one
  return uniqueUrls.length > 0 ? uniqueUrls[0] : null;
}

function isValidWebsiteUrl(url) {
  try {
    const parsed = new URL(url);
    // Basic validation - should be http/https and not localhost/IP
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
           !parsed.hostname.includes('localhost') &&
           !/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|127\.)/.test(parsed.hostname);
  } catch {
    return false;
  }
}

function generateFallbackSummary(readmeText, repoHints) {
  const parts = [];

  // Use repository description if available (most reliable)
  if (repoHints?.description && repoHints.description.length > 10) {
    parts.push(repoHints.description);
  }

  // Use README intro if available and not already used
  const cleanedMd = stripBadges(readmeText);
  const intro = firstMeaningfulParagraph(cleanedMd);
  if (intro && intro.length > 30 && !parts.some(p => p.includes(intro.slice(0, 50)))) {
    const cleanIntro = intro.replace(/[#*`_~\[\]()]/g, '').trim();
    if (cleanIntro.length > 20) {
      parts.push(cleanIntro);
    }
  }

  // Use topics as additional context
  if (repoHints?.topics && repoHints.topics.length > 0) {
    const topicStr = repoHints.topics.slice(0, 3).join(', ');
    const topicDesc = `A ${repoHints.language || 'programming'} project related to: ${topicStr}`;
    if (!parts.some(p => p.toLowerCase().includes(topicStr.toLowerCase()))) {
      parts.push(topicDesc);
    }
  }

  // Use primary language and stars for popularity
  if (repoHints?.language && parts.length === 0) {
    const langDesc = `A ${repoHints.language} project${repoHints.stars ? ` with ${repoHints.stars} stars on GitHub` : ''}`;
    parts.push(langDesc);
  }

  // Extract key features from README
  if (parts.length < 2) {
    const features = collectBulletsUnderHeadings(cleanedMd, SECTION_TITLES.FEATURES, 3);
    features.forEach(feature => {
      if (feature.length > 15 && !/install|setup|clone|download|prerequisite|requirement/i.test(feature)) {
        const cleanFeature = feature.replace(/[#*`_~\[\]()]/g, '').trim();
        if (cleanFeature.length > 10 && !parts.some(p => p.includes(cleanFeature.slice(0, 30)))) {
          parts.push(cleanFeature);
        }
      }
    });
  }

  // Fallback to generic description
  if (parts.length === 0) {
    parts.push('A software project hosted on GitHub');
  }

  // Combine parts into a coherent summary (limit to 2 parts for better quality)
  const summary = parts.slice(0, 2).join('. ').trim();
  return summary.endsWith('.') ? summary : summary + '.';
}
function normalizeToolName(t) { return t.replace(/`/g, '').trim(); }
function extractToolsUsed(md, hints) {
  const tools = new Set();

  // Clean the markdown first to avoid extracting markdown artifacts
  const cleanedMd = stripBadges(md);

  // Primary languages from GitHub API (most reliable)
  if (hints?.languages && Array.isArray(hints.languages)) {
    hints.languages.forEach(lang => {
      if (lang && typeof lang === 'string') {
        tools.add(lang.toLowerCase());
      }
    });
  }

  // Tools-ish sections from README - avoid installation instructions
  collectBulletsUnderHeadings(cleanedMd, SECTION_TITLES.TOOLS, 15).forEach(b => {
    // Skip installation and setup instructions
    if (!/install|setup|clone|download|git clone|npm install|pip install|prerequisite|requirement|step|guide/i.test(b)) {
      b.split(/\s*[;,]\s*/).forEach(x => {
        const normalized = normalizeToolName(x);
        if (normalized && normalized.length > 2 && !/^(and|or|with|using|via|for|the|this|that|these|those|set up|export|store|\.env)$/i.test(normalized)) {
          tools.add(normalized);
        }
      });
    (b.match(/`([^`]+)`/g) || []).forEach(code => {
      const c = code.replace(/`/g, '').trim();
        if (c.length > 2 && !/^(and|or|with|using|via|for|the|this|that|these|those|\.env)$/i.test(c)) {
          tools.add(c);
        }
    });
    }
  });

  // Enhanced keyword sweep with more comprehensive detection
  const low = cleanedMd.toLowerCase();
  const frameworks = {
    'react': ['react', 'react.js', 'reactjs'],
    'vue': ['vue', 'vue.js', 'vuejs'],
    'angular': ['angular', 'angular.js', 'angularjs'],
    'next.js': ['next.js', 'nextjs'],
    'nuxt': ['nuxt', 'nuxt.js', 'nuxtjs'],
    'svelte': ['svelte'],
    'express': ['express', 'express.js', 'expressjs'],
    'fastapi': ['fastapi', 'fast-api'],
    'flask': ['flask'],
    'django': ['django'],
    'spring': ['spring', 'spring boot', 'spring-boot'],
    'laravel': ['laravel'],
    'tensorflow': ['tensorflow', 'tf'],
    'pytorch': ['pytorch', 'torch'],
    'pandas': ['pandas'],
    'numpy': ['numpy'],
    'scikit-learn': ['scikit-learn', 'sklearn'],
    'opencv': ['opencv', 'open-cv'],
    'docker': ['docker', 'dockerfile'],
    'kubernetes': ['kubernetes', 'k8s'],
    'mongodb': ['mongodb', 'mongo'],
    'postgresql': ['postgresql', 'postgres', 'psql'],
    'mysql': ['mysql'],
    'redis': ['redis'],
    'nginx': ['nginx'],
    'apache': ['apache'],
    'tailwind': ['tailwind', 'tailwindcss', 'tailwind css'],
    'bootstrap': ['bootstrap'],
    'sass': ['sass', 'scss'],
    'webpack': ['webpack'],
    'vite': ['vite'],
    'jest': ['jest'],
    'cypress': ['cypress'],
    'selenium': ['selenium'],
    'puppeteer': ['puppeteer'],
    'electron': ['electron'],
    'tesseract': ['tesseract'],
    'opencv': ['opencv'],
    'pillow': ['pillow', 'pil'],
    'requests': ['requests'],
    'beautifulsoup': ['beautifulsoup', 'beautiful soup', 'bs4'],
    'selenium': ['selenium'],
    'chromedriver': ['chromedriver'],
    'geckodriver': ['geckodriver'],
    'webdriver': ['webdriver']
  };

  Object.entries(frameworks).forEach(([tool, keywords]) => {
    if (keywords.some(k => low.includes(k))) {
      tools.add(tool);
    }
  });

  // Cloud services and platforms
  const clouds = ['aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel', 'netlify', 'firebase', 'supabase'];
  clouds.forEach(cloud => {
    if (low.includes(cloud)) tools.add(cloud);
  });

  // Operating systems and hardware
  const platforms = ['linux', 'windows', 'macos', 'ubuntu', 'centos', 'debian', 'raspberry pi', 'arduino', 'esp32', 'raspbian'];
  platforms.forEach(platform => {
    if (low.includes(platform)) tools.add(platform);
  });

  // Manifest files provide concrete dependencies
  const req = hints?.manifests?.requirementsTxt;
  if (req) {
    req.split('\n').forEach(line => {
      const cleaned = line.trim().replace(/[#].*$/, '');
      if (!cleaned || cleaned.startsWith('-')) return;
      const pkg = cleaned.split(/[<>=!~]=?/)[0].trim().toLowerCase();
      if (pkg && pkg.length > 1 && !/^(python|pip|setuptools|wheel)$/i.test(pkg)) {
        tools.add(pkg);
      }
    });
  }

  // Package.json dependencies
  const pkgjson = hints?.manifests?.packageJson;
  if (pkgjson && typeof pkgjson === 'object') {
    ['dependencies', 'devDependencies', 'peerDependencies'].forEach(key => {
      if (pkgjson[key] && typeof pkgjson[key] === 'object') {
        Object.keys(pkgjson[key]).forEach(dep => {
          const cleanDep = dep.toLowerCase();
          if (cleanDep.length > 1 && !/^(react|react-dom|next|vue|angular)$/i.test(cleanDep)) {
            tools.add(cleanDep);
          }
        });
      }
    });
  }

  // Filter out generic words and limit results
  const filteredTools = Array.from(tools)
    .filter(t => !/^(and|or|with|using|via|for|the|this|that|these|those|and|but|with|for|from|into|onto|upon|within|without|through|throughout|among|between|during|before|after|above|below|under|over|beside|besides|except|regarding|concerning|considering|including|excluding|plus|minus|times|divided|equals|plus|minus|equal|greater|less|more|less|most|least|many|much|few|little|big|small|large|long|short|wide|narrow|tall|high|low|fast|slow|quick|easy|hard|simple|complex|basic|advanced|new|old|good|bad|better|worse|best|worst|first|last|next|previous|current|recent|ancient|modern|traditional|contemporary|classic|standard|common|rare|unique|special|particular|general|specific|various|different|similar|same|other|another|such|so|very|quite|rather|pretty|fairly|extremely|incredibly|amazingly|surprisingly|interestingly|fortunately|unfortunately|luckily|hopefully|clearly|obviously|apparently|evidently|seemingly|presumably|allegedly|supposedly|reportedly|arguably|potentially|possibly|probably|likely|unlikely|certainly|definitely|absolutely|completely|totally|entirely|fully|partially|partly|mostly|mainly|primarily|chiefly|principally|essentially|basically|fundamentally|originally|initially|finally|ultimately|eventually|previously|formerly|recently|lately|nowadays|currently|presently|immediately|instantly|quickly|rapidly|slowly|gradually|suddenly|unexpectedly|surprisingly|amazingly|incredibly|remarkably|notably|significantly|substantially|considerably|markedly|dramatically|sharply|steeply|slightly|marginally|minimally|barely|scarcely|hardly|rarely|seldom|occasionally|sometimes|frequently|often|usually|normally|generally|typically|commonly|regularly|always|never|ever|already|yet|still|just|only|even|also|too|as|well|so|therefore|thus|hence|consequently|accordingly|furthermore|moreover|additionally|besides|further|also|too|either|neither|both|all|some|any|no|none|each|every|much|many|little|few|less|more|most|least|enough|sufficient|adequate|inadequate|proper|appropriate|inappropriate|correct|incorrect|right|wrong|true|false|yes|no|ok|okay|fine|good|bad|better|worse|best|worst|happy|sad|angry|excited|calm|peaceful|anxious|nervous|confident|sure|uncertain|positive|negative|optimistic|pessimistic|realistic|practical|theoretical|abstract|concrete|literal|figurative|metaphorical|symbolic|allegorical|ironic|sarcastic|humorous|funny|serious|grave|light|heavy|dark|bright|colorful|plain|simple|complex|fancy|elegant|beautiful|ugly|pretty|handsome|attractive|repulsive|appealing|unappealing|interesting|boring|fascinating|dull|exciting|monotonous|stimulating|tedious|engaging|dreary|compelling|unconvincing|convincing|persuasive|unpersuasive|effective|ineffective|useful|useless|helpful|unhelpful|beneficial|harmful|advantageous|disadvantageous|profitable|unprofitable|successful|unsuccessful|victorious|defeated|winning|losing|triumphant|tragic|joyful|sorrowful|cheerful|mournful|jubilant|despondent|ecstatic|depressed|elated|disheartened|thrilled|disappointed|delighted|displeased|satisfied|dissatisfied|content|discontent|pleased|displeased|gratified|frustrated|fulfilled|unfulfilled|accomplished|unaccomplished|achieved|unachieved|realized|unrealized|attained|unattained|obtained|unobtained|gained|lost|won|defeated|earned|spent|saved|wasted|invested|divested|accumulated|dissipated|collected|dispersed|gathered|scattered|assembled|disassembled|built|destroyed|created|eliminated|established|abolished|founded|dissolved|organized|disorganized|arranged|disarranged|ordered|disordered|planned|unplanned|intended|unintended|deliberate|accidental|purposeful|aimless|meaningful|meaningless|significant|insignificant|important|unimportant|crucial|vital|essential|inessential|necessary|unnecessary|required|optional|mandatory|voluntary|compulsory|elective|obligatory|voluntary|forced|willing|reluctant|eager|hesitant|enthusiastic|apathetic|passionate|indifferent|zealous|lukewarm|ardent|cool|fervent|tepid|fanatical|moderate|extreme|mild|severe|intense|moderate|radical|conservative|liberal|progressive|reactionary|revolutionary|traditional|innovative|conventional|unconventional|orthodox|unorthodox|standard|nonstandard|normal|abnormal|regular|irregular|usual|unusual|common|uncommon|ordinary|extraordinary|typical|atypical|standard|customary|habitual|unusual|peculiar|strange|weird|odd|bizarre|eccentric|quirky|unconventional|unorthodox|nonconformist|individualistic|unique|distinctive|characteristic|special|particular|specific|general|universal|global|local|national|international|domestic|foreign|native|alien|indigenous|exotic|familiar|unfamiliar|known|unknown|recognized|unrecognized|acknowledged|ignored|famous|infamous|celebrated|notorious|renowned|obscure|prominent|insignificant|distinguished|ordinary|illustrious|prestigious|modest|pretentious|arrogant|humbl|confident|insecure|self-assured|self-conscious|assertive|passive|aggressive|defensive|offensive|protective|vulnerable|invulnerable|resilient|fragile|strong|weak|powerful|powerless|influential|insignificant|authoritative|submissive|dominant|subordinate|superior|inferior|equal|unequal|equivalent|different|similar|dissimilar|identical|distinct|comparable|incomparable|analogous|dissimilar|parallel|divergent|convergent|corresponding|contrasting|complementary|opposing|conflicting|harmonious|discordant|compatible|incompatible|consistent|inconsistent|coherent|incoherent|logical|illogical|rational|irrational|reasonable|unreasonable|sensible|nonsensical|practical|impractical|feasible|infeasible|possible|impossible|probable|improbable|likely|unlikely|certain|uncertain|sure|unsure|definite|indefinite|clear|unclear|obvious|subtle|explicit|implicit|direct|indirect|straightforward|complicated|simple|complex|easy|difficult|hard|soft|tough|gentle|rough|smooth|coarse|fine|thick|thin|wide|narrow|broad|slim|fat|skinny|large|small|huge|tiny|massive|minute|enormous|microscopic|giant|dwarf|colossal|petite|immense|minuscule|vast|meager|abundant|scarce|plentiful|sparse|copious|meager|profuse|lavish|frugal|extravagant|economical|wasteful|thrifty|squandering|generous|stingy|liberal|conservative|open-handed|tight-fisted|magnanimous|parsimonious|benevolent|malevolent|kind|cruel|compassionate|heartless|sympathetic|unsympathetic|empathetic|unempathetic|caring|uncaring|considerate|inconsiderate|thoughtful|thoughtless|mindful|mindless|attentive|inattentive|observant|unobservant|alert|drowsy|vigilant|negligent|careful|careless|meticulous|sloppy|precise|imprecise|accurate|inaccurate|exact|inexact|perfect|imperfect|flawless|flawed|pristine|tainted|pure|impure|clean|dirty|sterile|contaminated|sanitary|unsanitary|hygenic|unhygenic|healthy|unhealthy|sick|well|ill|diseased|robust|frail|vigorous|weak|energetic|languid|dynamic|static|active|passive|proactive|reactive|initiative|responsive|interactive|isolated|connected|linked|unlinked|associated|dissociated|related|unrelated|relevant|irrelevant|pertinent|impertinent|applicable|inapplicable|appropriate|inappropriate|suitable|unsuitable|fitting|unfitting|proper|improper|correct|incorrect|right|wrong|true|false|valid|invalid|legitimate|illegitimate|authentic|fake|genuine|counterfeit|original|copy|real|artificial|natural|synthetic|organic|inorganic|biological|mechanical|chemical|physical|mental|emotional|psychological|spiritual|religious|secular|divine|earthly|heavenly|celestial|terrestrial|worldly|otherworldly|supernatural|natural|paranormal|normal|abnormal|extraordinary|ordinary|miraculous|mundane|magical|prosaic|enchanting|dull|thrilling|boring|exciting|monotonous|stimulating|tedious|engaging|dreary|compelling|unconvincing|convincing|persuasive|unpersuasive|effective|ineffective|useful|useless|helpful|unhelpful|beneficial|harmful|advantageous|disadvantageous|profitable|unprofitable|successful|unsuccessful|victorious|defeated|winning|losing|triumphant|tragic|joyful|sorrowful|cheerful|mournful|jubilant|despondent|ecstatic|depressed|elated|disheartened|thrilled|disappointed|delighted|displeased|satisfied|dissatisfied|content|discontent|pleased|displeased|gratified|frustrated|fulfilled|unfulfilled|accomplished|unaccomplished|achieved|unachieved|realized|unrealized|attained|unattained|obtained|unobtained|gained|lost|won|defeated|earned|spent|saved|wasted|invested|divested|accumulated|dissipated|collected|dispersed|gathered|scattered|assembled|disassembled|built|destroyed|created|eliminated|established|abolished|founded|dissolved|organized|disorganized|arranged|disarranged|ordered|disordered|planned|unplanned|intended|unintended|deliberate|accidental|purposeful|aimless|meaningful|meaningless|significant|insignificant|important|unimportant|crucial|vital|essential|inessential|necessary|unnecessary|required|optional|mandatory|voluntary|compulsory|elective|obligatory|voluntary|forced|willing|reluctant|eager|hesitant|enthusiastic|apathetic|passionate|indifferent|zealous|lukewarm|ardent|cool|fervent|tepid|fanatical|moderate|extreme|mild|severe|intense|moderate|radical|conservative|liberal|progressive|reactionary|revolutionary|traditional|innovative|conventional|unconventional|orthodox|unorthodox|standard|nonstandard|normal|abnormal|regular|irregular|usual|unusual|common|uncommon|ordinary|extraordinary|typical|atypical|standard|customary|habitual|unusual|peculiar|strange|weird|odd|bizarre|eccentric|quirky|unconventional|unorthodox|nonconformist|individualistic|unique|distinctive|characteristic|special|particular|specific|general|universal|global|local|national|international|domestic|foreign|native|alien|indigenous|exotic|familiar|unfamiliar|known|unknown|recognized|unrecognized|acknowledged|ignored|famous|infamous|celebrated|notorious|renowned|obscure|prominent|insignificant|distinguished|ordinary|illustrious|prestigious|modest|pretentious|arrogant|humbl|confident|insecure|self-assured|self-conscious|assertive|passive|aggressive|defensive|offensive|protective|vulnerable|invulnerable|resilient|fragile|strong|weak|powerful|powerless|influential|insignificant|authoritative|submissive|dominant|subordinate|superior|inferior|equal|unequal|equivalent|different|similar|dissimilar|identical|distinct|comparable|incomparable|analogous|dissimilar|parallel|divergent|convergent|corresponding|contrasting|complementary|opposing|conflicting|harmonious|discordant|compatible|incompatible|consistent|inconsistent|coherent|incoherent|logical|illogical|rational|irrational|reasonable|unreasonable|sensible|nonsensical|practical|impractical|feasible|infeasible|possible|impossible|probable|improbable|likely|unlikely|certain|uncertain|sure|unsure|definite|indefinite|clear|unclear|obvious|subtle|explicit|implicit|direct|indirect|straightforward|complicated|simple|complex|easy|difficult|hard|soft|tough|gentle|rough|smooth|coarse|fine|thick|thin|wide|narrow|broad|slim|fat|skinny|large|small|huge|tiny|massive|minute|enormous|microscopic|giant|dwarf|colossal|petite|immense|minuscule|vast|meager|abundant|scarce|plentiful|sparse|copious|meager|profuse|lavish|frugal|extravagant|economical|wasteful|thrifty|squandering|generous|stingy|liberal|conservative|open-handed|tight-fisted|magnanimous|parsimonious|benevolent|malevolent|kind|cruel|compassionate|heartless|sympathetic|unsympathetic|empathetic|unempathetic|caring|uncaring|considerate|inconsiderate|thoughtful|thoughtless|mindful|mindless|attentive|inattentive|observant|unobservant|alert|drowsy|vigilant|negligent|careful|careless|meticulous|sloppy|precise|imprecise|accurate|inaccurate|exact|inexact|perfect|imperfect|flawless|flawed|pristine|tainted|pure|impure|clean|dirty|sterile|contaminated|sanitary|unsanitary|hygenic|unhygenic|healthy|unhealthy|sick|well|ill|diseased|robust|frail|vigorous|weak|energetic|languid|dynamic|static|active|passive|proactive|reactive|initiative|responsive|interactive|isolated|connected|linked|unlinked|associated|dissociated|related|unrelated|relevant|irrelevant|pertinent|impertinent|applicable|inapplicable|appropriate|inappropriate|suitable|unsuitable|fitting|unfitting|proper|improper|correct|incorrect|right|wrong|true|false|valid|invalid|legitimate|illegitimate|authentic|fake|genuine|counterfeit|original|copy|real|artificial|natural|synthetic|organic|inorganic|biological|mechanical|chemical|physical|mental|emotional|psychological|spiritual|religious|secular|divine|earthly|heavenly|celestial|terrestrial|worldly|otherworldly|supernatural|natural|paranormal|normal|abnormal|extraordinary|ordinary|miraculous|mundane|magical|prosaic|enchanting|dull|thrilling|boring|exciting|monotonous|stimulating|tedious|engaging|dreary|compelling|unconvincing|convincing|persuasive|unpersuasive|effective|ineffective|useful|useless|helpful|unhelpful|beneficial|harmful|advantageous|disadvantageous|profitable|unprofitable|successful|unsuccessful|victorious|defeated|winning|losing|triumphant|tragic|joyful|sorrowful|cheerful|mournful|jubilant|despondent|ecstatic|depressed|elated|disheartened|thrilled|disappointed|delighted|displeased|satisfied|dissatisfied|content|discontent|pleased|displeased|gratified|frustrated|fulfilled|unfulfilled|accomplished|unaccomplished|achieved|unachieved|realized|unrealized|attained|unattained|obtained|unobtained|gained|lost|won|defeated|earned|spent|saved|wasted|invested|divested|accumulated|dissipated|collected|dispersed|gathered|scattered|assembled|disassembled|built|destroyed|created|eliminated|established|abolished|founded|dissolved|organized|disorganized|arranged|disarranged|ordered|disordered|planned|unplanned|intended|unintended|deliberate|accidental|purposeful|aimless|meaningful|meaningless|significant|insignificant|important|unimportant|crucial|vital|essential|inessential|necessary|unnecessary|required|optional|mandatory|voluntary|compulsory|elective|obligatory|voluntary|forced|willing|reluctant|eager|hesitant|enthusiastic|apathetic|passionate|indifferent|zealous|lukewarm|ardent|cool|fervent|tepid|fanatical|moderate|extreme|mild|severe|intense|moderate|radical|conservative|liberal|progressive|reactionary|revolutionary|traditional|innovative|conventional|unconventional|orthodox|unorthodox|standard|nonstandard|normal|abnormal|regular|irregular|usual|unusual|common|uncommon|ordinary|extraordinary|typical|atypical|standard|customary|habitual|unusual|peculiar|strange|weird|odd|bizarre|eccentric|quirky|unconventional|unorthodox|nonconformist|individualistic|unique|distinctive|characteristic|special|particular|specific|general|universal|global|local|national|international|domestic|foreign|native|alien|indigenous|exotic|familiar|unfamiliar|known|unknown|recognized|unrecognized|acknowledged|ignored|famous|infamous|celebrated|notorious|renowned|obscure|prominent|insignificant|distinguished|ordinary|illustrious|prestigious|modest|pretentious|arrogant|humbl|confident|insecure|self-assured|self-conscious|assertive|passive|aggressive|defensive|offensive|protective|vulnerable|invulnerable|resilient|fragile|strong|weak|powerful|powerless|influential|insignificant|authoritative|submissive|dominant|subordinate|superior|inferior|equal|unequal|equivalent|different|similar|dissimilar|identical|distinct|comparable|incomparable|analogous|dissimilar|parallel|divergent|convergent|corresponding|contrasting|complementary|opposing|conflicting|harmonious|discordant|compatible|incompatible|consistent|inconsistent|coherent|incoherent|logical|illogical|rational|irrational|reasonable|unreasonable|sensible|nonsensical|practical|impractical|feasible|infeasible|possible|impossible|probable|improbable|likely|unlikely|certain|uncertain|sure|unsure|definite|indefinite|clear|unclear|obvious|subtle|explicit|implicit|direct|indirect|straightforward|complicated|simple|complex|easy|difficult|hard|soft|tough|gentle|rough|smooth|coarse|fine|thick|thin|wide|narrow|broad|slim|fat|skinny|large|small|huge|tiny|massive|minute|enormous|microscopic|giant|dwarf|colossal|petite|immense|minuscule|vast|meager|abundant|scarce|plentiful|sparse|copious|meager|profuse|lavish|frugal|extravagant|economical|wasteful|thrifty|squandering|generous|stingy|liberal|conservative|open-handed|tight-fisted|magnanimous|parsimonious|benevolent|malevolent|kind|cruel|compassionate|heartless|sympathetic|unsympathetic|empathetic|unempathetic|caring|uncaring|considerate|inconsiderate|thoughtful|thoughtless|mindful|mindless|attentive|inattentive|observant|unobservant|alert|drowsy|vigilant|negligent|careful|careless|meticulous|sloppy|precise|imprecise|accurate|inaccurate|exact|inexact|perfect|imperfect|flawless|flawed|pristine|tainted|pure|impure|clean|dirty|sterile|contaminated|sanitary|unsanitary|hygenic|unhygenic|healthy|unhealthy|sick|well|ill|diseased|robust|frail|vigorous|weak|energetic|languid|dynamic|static|active|passive|proactive|reactive|initiative|responsive|interactive|isolated|connected|linked|unlinked|associated|dissociated|related|unrelated|relevant|irrelevant|pertinent|impertinent|applicable|inapplicable|appropriate|inappropriate|suitable|unsuitable|fitting|unfitting|proper|improper|correct|incorrect|right|wrong|true|false|valid|invalid|legitimate|illegitimate|authentic|fake|genuine|counterfeit|original|copy|real|artificial|natural|synthetic|organic|inorganic|biological|mechanical|chemical|physical|mental|emotional|psychological|spiritual|religious|secular|divine|earthly|heavenly|celestial|terrestrial|worldly|otherworldly|supernatural|natural|paranormal|normal|abnormal|extraordinary|ordinary|miraculous|mundane|magical|prosaic|enchanting|dull|thrilling|boring|exciting|monotonous|stimulating|tedious|engaging|dreary|compelling|unconvincing|convincing|persuasive|unpersuasive|effective|ineffective|useful|useless|helpful|unhelpful|beneficial|harmful|advantageous|disadvantageous|profitable|unprofitable|successful|unsuccessful|victorious|defeated|winning|losing|triumphant|tragic|joyful|sorrowful|cheerful|mournful|jubilant|despondent|ecstatic|depressed|elated|disheartened|thrilled|disappointed|delighted|displeased|satisfied|dissatisfied|content|discontent|pleased|displeased|gratified|frustrated|fulfilled|unfulfilled|accomplished|unaccomplished|achieved|unachieved|realized|unrealized|attained|unattained|obtained|unobtained|gained|lost|won|defeated|earned|spent|saved|wasted|invested|divested|accumulated|dissipated|collected|dispersed|gathered|scattered|assembled|disassembled|built|destroyed|created|eliminated|established|abolished|founded|dissolved|organized|disorganized|arranged|disarranged|ordered|disordered|planned|unplanned|intended|unintended|deliberate|accidental|purposeful|aimless|meaningful|meaningless|significant|insignificant|important|unimportant|crucial|vital|essential|inessential|necessary|unnecessary|required|optional|mandatory|voluntary|compulsory|elective|obligatory|voluntary|forced|willing|reluctant|eager|hesitant|enthusiastic|apathetic|passionate|indifferent|zealous|lukewarm|ardent|cool|fervent|tepid|fanatical|moderate|extreme|mild|severe|intense|moderate|radical|conservative|liberal|progressive|reactionary|revolutionary|traditional|innovative|conventional|unconventional|orthodox|unorthodox|standard|nonstandard|normal|abnormal|regular|irregular|usual|unusual|common|uncommon|ordinary|extraordinary|typical|atypical|standard|customary|habitual|unusual|peculiar|strange|weird|odd|bizarre|eccentric|quirky|unconventional|unorthodox|nonconformist|individualistic|unique|distinctive|characteristic|special|particular|specific|general|universal|global|local|national|international|domestic|foreign|native|alien|indigenous|exotic|familiar|unfamiliar|known|unknown|recognized|unrecognized|acknowledged|ignored|famous|infamous|celebrated|notorious|renowned|obscure|prominent|insignificant|distinguished|ordinary|illustrious|prestigious|modest|pretentious|arrogant|humbl|confident|insecure|self-assured|self-conscious|assertive|passive|aggressive|defensive|offensive|protective|vulnerable|invulnerable|resilient|fragile|strong|weak|powerful|powerless|influential|insignificant|authoritative|submissive|dominant|subordinate|superior|inferior|equal|unequal|equivalent|different|similar|dissimilar|identical|distinct|comparable|incomparable|analogous|dissimilar|parallel|divergent|convergent|corresponding|contrasting|complementary|opposing|conflicting|harmonious|discordant|compatible|incompatible|consistent|inconsistent|coherent|incoherent|logical|illogical|rational|irrational|reasonable|unreasonable|sensible|nonsensical|practical|impractical|feasible|infeasible|possible|impossible|probable|improbable|likely|unlikely|certain|uncertain|sure|unsure|definite|indefinite|clear|unclear|obvious|subtle|explicit|implicit|direct|indirect|straightforward|complicated|simple|complex|easy|difficult|hard|soft|tough|gentle|rough|smooth|coarse|fine|thick|thin|wide|narrow|broad|slim|fat|skinny|large|small|huge|tiny|massive|minute|enormous|microscopic|giant|dwarf|colossal|petite|immense|minuscule|vast|meager|abundant|scarce|plentiful|sparse|copious|meager|profuse|lavish|frugal|extravagant|economical|wasteful|thrifty|squandering|generous|stingy|liberal|conservative|open-handed|tight-fisted|magnanimous|parsimonious|benevolent|malevolent|kind|cruel|compassionate|heartless|sympathetic|unsympathetic|empathetic|unempathetic|caring|uncaring|considerate|inconsiderate|thoughtful|thoughtless|mindful|mindless|attentive|inattentive|observant|unobservant|alert|drowsy|vigilant|negligent|careful|careless|meticulous|sloppy|precise|imprecise|accurate|inaccurate|exact|inexact|perfect|imperfect|flawless|flawed|pristine|tainted|pure|impure|clean|dirty|sterile|contaminated|sanitary|unsanitary|hygenic|unhygenic|healthy|unhealthy|sick|well|ill|diseased|robust|frail|vigorous|weak|energetic|languid|dynamic|static|active|passive|proactive|reactive|initiative|responsive|interactive|isolated|connected|linked|unlinked|associated|dissociated|related|unrelated|relevant|irrelevant|pertinent|impertinent|applicable|inapplicable|appropriate|inappropriate|suitable|unsuitable|fitting|unfitting|proper|improper|correct|incorrect|right|wrong|true|false|valid|invalid|legitimate|illegitimate|authentic|fake|genuine|counterfeit|original|copy|real|artificial|natural|synthetic|organic|inorganic|biological|mechanical|chemical|physical|mental|emotional|psychological|spiritual|religious|secular|divine|earthly|heavenly|celestial|terrestrial|worldly|otherworldly|supernatural|natural|paranormal|normal|abnormal|extraordinary|ordinary|miraculous|mundane|magical|prosaic|enchanting|dull|thrilling|boring|exciting|monotonous|stimulating|tedious|engaging|dreary|compelling|unconvincing|convincing|persuasive|unpersuasive|effective|ineffective|useful|useless|helpful|unhelpful|beneficial|harmful|advantageous|disadvantageous|profitable|unprofitable|successful|unsuccessful|victorious|defeated|winning|losing|triumphant|tragic|joyful|sorrowful|cheerful|mournful|jubilant|despondent|ecstatic|depressed|elated|disheartened|thrilled|disappointed|delighted|displeased|satisfied|dissatisfied|content|discontent|pleased|displeased|gratified|frustrated|fulfilled|unfulfilled|accomplished|unaccomplished|achieved|unachieved|realized|unrealized|attained|unattained|obtained|unobtained|gained|lost|won|defeated|earned|spent|saved|wasted|invested|divested|accumulated|dissipated|collected|dispersed|gathered|scattered|assembled|disassembled|built|destroyed|created|eliminated|established|abolished|founded|dissolved|organized|disorganized|arranged|disarranged|ordered|disordered|planned|unplanned|intended|unintended|deliberate|accidental|purposeful|aimless|meaningful|meaningless|significant|insignificant|important|unimportant|crucial|vital|essential|inessential|necessary|unnecessary|required|optional|mandatory|voluntary|compulsory|elective|obligatory|voluntary|forced|willing|reluctant|eager|hesitant|enthusiastic|apathetic|passionate|indifferent|zealous|lukewarm|ardent|cool|fervent|tepid|fanatical|moderate|extreme|mild|severe|intense|moderate|radical|conservative|liberal|progressive|reactionary|revolutionary|traditional|innovative|conventional|unconventional|orthodox|unorthodox|standard|nonstandard|normal|abnormal|regular|irregular|usual|unusual|common|uncommon|ordinary|extraordinary|typical|atypical|standard|customary|habitual|unusual|peculiar|strange|weird|odd|bizarre|eccentric|quirky|unconventional|unorthodox|nonconformist|individualistic|unique|distinctive|characteristic|special|particular|specific|general|universal|global|local|national|international|domestic|foreign|native|alien|indigenous|exotic|familiar|unfamiliar|known|unknown|recognized|unrecognized|acknowledged|ignored|famous|infamous|celebrated|notorious|renowned|obscure|prominent|insignificant|distinguished|ordinary|illustrious|prestigious|modest|pretentious|arrogant|humbl|confident|insecure|self-assured|self-conscious|assertive|passive|aggressive|defensive|offensive|protective|vulnerable|invulnerable|resilient|fragile|strong|weak|powerful|powerless|influential|insignificant|authoritative|submissive|dominant|subordinate|superior|inferior|equal|unequal|equivalent|different|similar|dissimilar|identical|distinct|comparable|incomparable|analogous|dissimilar|parallel|divergent|convergent|corresponding|contrasting|complementary|opposing|conflicting|harmonious|discordant|compatible|incompatible|consistent|inconsistent|coherent|incoherent|logical|illogical|rational|irrational|reasonable|unreasonable|sensible|nonsensical|practical|impractical|feasible|infeasible|possible|impossible|probable|improbable|likely|unlikely|certain|uncertain|sure|unsure|definite|indefinite|clear|unclear|obvious|subtle|explicit|implicit|direct|indirect|straightforward|complicated|simple|complex|easy|difficult|hard|soft|tough|gentle|rough|smooth|coarse|fine|thick|thin|wide|narrow|broad|slim|fat|skinny|large|small|huge|tiny|massive|minute|enormous|microscopic|giant|dwarf|colossal|petite|immense|minuscule|vast|meager|abundant|scarce|plentiful|sparse|copious|meager|profuse|lavish|frugal|extravagant|economical|wasteful|thrifty|squandering|generous|stingy|liberal|conservative|open-handed|tight-fisted|magnanimous|parsimonious|benevolent|malevolent|kind|cruel|compassionate|heartless|sympathetic|unsympathetic|empathetic|unempathetic|caring|uncaring|considerate|inconsiderate|thoughtful|thoughtless|mindful|mindless|attentive|inattentive|observant|unobservant|alert|drowsy|vigilant|negligent|careful|careless|meticulous|sloppy|precise|imprecise|accurate|inaccurate|exact|inexact|perfect|imperfect|flawless|flawed|pristine|tainted|pure|impure|clean|dirty|sterile|contaminated|sanitary|unsanitary|hygenic|unhygenic|healthy|unhealthy|sick|well|ill|diseased|robust|frail|vigorous|weak|energetic|languid|dynamic|static|active|passive|proactive|reactive|initiative|responsive|interactive|isolated|connected|linked|unlinked|associated|dissociated|related|unrelated|relevant|irrelevant|pertinent|impertinent|applicable|inapplicable|appropriate|inappropriate|suitable|unsuitable|fitting|unfitting|proper|improper|correct|incorrect|right|wrong|true|false|valid|invalid|legitimate|illegitimate|authentic|fake|genuine|counterfeit|original|copy|real|artificial|natural|synthetic|organic|inorganic|biological|mechanical|chemical|physical|mental|emotional|psychological|spiritual|religious|secular|divine|earthly|heavenly|celestial|terrestrial|worldly|otherworldly|supernatural|natural|paranormal|normal|abnormal|extraordinary|ordinary|miraculous|mundane|magical|prosaic|enchanting|dull|thrilling|boring|exciting|monotonous|stimulating|tedious|engaging|dreary|compelling|unconvincing|convincing|persuasive|unpersuasive|effective|ineffective|useful|useless|helpful|unhelpful|beneficial|harmful|advantageous|disadvantageous|profitable|unprofitable|successful|unsuccessful|victorious|defeated|winning|losing|triumphant|tragic|joyful|sorrowful|cheerful|mournful|jubilant|despondent|ecstatic|depressed|elated|disheartened|thrilled|disappointed|delighted|displeased|satisfied|dissatisfied|content|discontent|pleased|displeased|gratified|frustrated|fulfilled|unfulfilled|accomplished|unaccomplished|achieved|unachieved|realized|unrealized|attained|unattained|obtained|unobtained|gained|lost|won|defeated|earned|spent|saved|wasted|invested|divested|accumulated|dissipated|collected|dispersed|gathered|scattered|assembled|disassembled|built|destroyed|created|eliminated|established|abolished|founded|dissolved|organized|disorganized|arranged|disarranged|ordered|disordered|planned|unplanned|intended|unintended|deliberate|accidental|purposeful|aimless|meaningful|meaningless|significant|insignificant|important|unimportant|crucial|vital|essential|inessential|necessary|unnecessary|required|optional|mandatory|voluntary|compulsory|elective|obligatory|voluntary|forced|willing|reluctant|eager|hesitant|enthusiastic|apathetic|passionate|indifferent|zealous|lukewarm|ardent|cool|fervent|tepid|fanatical|moderate|extreme|mild|severe|intense|moderate|radical|conservative|liberal|progressive|reactionary|revolutionary|traditional|innovative|conventional|unconventional|orthodox|unorthodox|standard|nonstandard|normal|abnormal|regular|irregular|usual|unusual|common|uncommon|ordinary|extraordinary|typical|atypical|standard|customary|habitual|unusual|peculiar|strange|weird|odd|bizarre|eccentric|quirky|unconventional|unorthodox|nonconformist|individualistic|unique|distinctive|characteristic|special|particular|specific|general|universal|global|local|national|international|domestic|foreign|native|alien|indigenous|exotic|familiar|unfamiliar|known|unknown|recognized|unrecognized|acknowledged|ignored|famous|infamous|celebrated|notorious|renowned|obscure|prominent|insignificant|distinguished|ordinary|illustrious|prestigious|modest|pretentious|arrogant|humbl|confident|insecure|self-assured|self-conscious|assertive|passive|aggressive|defensive|offensive|protective|vulnerable|invulnerable|resilient|fragile|strong|weak|powerful|powerless|influential|insignificant|authoritative|submissive|dominant|subordinate|superior|inferior|equal|unequal|equivalent|different|similar|dissimilar|identical|distinct|comparable|incomparable|analogous|dissimilar|parallel|divergent|convergent|corresponding|contrasting|complementary|opposing|conflicting|harmonious|discordant|compatible|incompatible|consistent|inconsistent|coherent|incoherent|logical|illogical|rational|irrational|reasonable|unreasonable|sensible|nonsensical|practical|impractical|feasible|infeasible|possible|impossible|probable|improbable|likely|unlikely|certain|uncertain|sure|unsure|definite|indefinite|clear|unclear|obvious|subtle|explicit|implicit|direct|indirect|straightforward|complicated|simple|complex|easy|difficult|hard|soft|tough|gentle|rough|smooth|coarse|fine|thick|thin|wide|narrow|broad|slim|fat|skinny|large|small|huge|tiny|massive|minute|enormous|microscopic|giant|dwarf|colossal|petite|immense|minuscule|vast|meager|abundant|scarce|plentiful|sparse|copious|meager|profuse|lavish|frugal|extravagant|economical|wasteful|thrifty|squandering|generous|stingy|liberal|conservative|open-handed|tight-fisted|magnanimous|parsimonious|benevolent|malevolent|kind|cruel|compassionate|heartless|sympathetic|unsympathetic|empathetic|unempathetic|caring|uncaring|considerate|inconsiderate|thoughtful|thoughtless|mindful|mindless|attentive|inattentive|observant|unobservant|alert|drowsy|vigilant|negligent|careful|careless|meticulous|sloppy|precise|imprecise|accurate|inaccurate|exact|inexact|perfect|imperfect|flawless|flawed|pristine|tainted|pure|impure|clean|dirty|sterile|contaminated|sanitary|unsanitary|hygenic|unhygenic|healthy|unhealthy|sick|well|ill|diseased|robust|frail|vigorous|weak|energetic|languid|dynamic|static|active|passive|proactive|reactive|initiative|responsive|interactive|isolated|connected|linked|unlinked|associated|dissociated|related|unrelated|relevant|irrelevant|pertinent|impertinent|applicable|inapplicable|appropriate|inappropriate|suitable|unsuitable|fitting|unfitting|proper|improper|correct|incorrect|right|wrong|true|false|valid|invalid|legitimate|illegitimate|authentic|fake|genuine|counterfeit|original|copy|real|artificial|natural|synthetic|organic|inorganic|biological|mechanical|chemical|physical|mental|emotional|psychological|spiritual|religious|secular|divine|earthly|heavenly|celestial|terrestrial|worldly|otherworldly|supernatural|natural|paranormal|normal|abnormal|extraordinary|ordinary|miraculous|mundane|magical|prosaic|enchanting|dull|thrilling|boring|exciting|monotonous|stimulating|tedious|engaging|dreary|compelling|unconvincing|convincing|persuasive|unpersuasive|effective|ineffective|useful|useless|helpful|unhelpful|beneficial|harmful|advantageous|disadvantageous|profitable|unprofitable|successful|unsuccessful|victorious|defeated|winning|losing|triumphant|tragic|joyful|sorrowful|cheerful|mournful|jubilant|despondent|ecstatic|depressed|elated|disheartened|thrilled|disappointed|delighted|displeased|satisfied|dissatisfied|content|discontent|pleased|displeased|gratified|frustrated|fulfilled|unfulfilled|accomplished|unaccomplished|achieved|unachieved|realized|unrealized|attained|unattained|obtained|unobtained|gained|lost|won|defeated|earned|spent|saved|wasted|invested|divested|accumulated|dissipated|collected|dispersed|gathered|scattered|assembled|disassembled|built|destroyed|created|eliminated|established|abolished|founded|dissolved|organized|disorganized|arranged|disarranged|ordered|disordered|planned|unplanned|intended|unintended|deliberate|accidental|purposeful|aimless|meaningful|meaningless|significant|insignificant|important|unimportant|crucial|vital|essential|inessential|necessary|unnecessary|required|optional|mandatory|voluntary|compulsory|elective|obligatory|voluntary|forced|willing|reluctant|eager|hesitant|enthusiastic|apathetic|passionate|indifferent|zealous|lukewarm|ardent|cool|fervent|tepid|fanatical|moderate|extreme|mild|severe|intense|moderate|radical|conservative|liberal|progressive|reactionary|revolutionary|traditional|innovative|conventional|unconventional|orthodox|unorthodox|standard|nonstandard|normal|abnormal|regular|irregular|usual|unusual|common|uncommon|ordinary|extraordinary|typical|atypical|standard|customary|habitual|unusual|peculiar|strange|weird|odd|bizarre|eccentric|quirky|unconventional|unorthodox|nonconformist|individualistic|unique|distinctive|characteristic|special|particular|specific|general|universal|global|local|national|international|domestic|foreign|native|alien|indigenous|exotic|familiar|unfamiliar|known|unknown|recognized|unrecognized|acknowledged|ignored|famous|infamous|celebrated|notorious|renowned|obscure|prominent|insignificant|distinguished|ordinary|illustrious|prestigious|modest|pretentious|arrogant|humbl|confident|insecure|self-assured|self-conscious|assertive|passive|aggressive|defensive|offensive|protective|vulnerable|invulnerable|resilient|fragile|strong|weak|powerful|powerless|influential|insignificant|authoritative|submissive|dominant|subordinate|superior|inferior|equal|unequal|equivalent|different|similar|dissimilar|identical|distinct|comparable|incomparable|analogous|dissimilar|parallel|divergent|convergent|corresponding|contrasting|complementary|opposing|conflicting|harmonious|discordant|compatible|incompatible|consistent|inconsistent|coherent|incoherent|logical|illogical|rational|irrational|reasonable|unreasonable|sensible|nonsensical|practical|impractical|feasible|infeasible|possible|impossible|probable|improbable|likely|unlikely|certain|uncertain|sure|unsure|definite|indefinite|clear|unclear|obvious|subtle|explicit|implicit|direct|indirect|straightforward|complicated|simple|complex|easy|difficult|hard|soft|tough|gentle|rough|smooth|coarse|fine|thick|thin|wide|narrow|broad|slim|fat|skinny|large|small|huge|tiny|massive|minute|enormous|microscopic|giant|dwarf|colossal|petite|immense|minuscule|vast|meager|abundant|scarce|plentiful|sparse|copious|meager|profuse|lavish|frugal|extravagant|economical|wasteful|thrifty|squandering|generous|stingy|liberal|conservative|open-handed|tight-fisted|magnanimous|parsimonious|benevolent|malevolent|kind|cruel|compassionate|heartless|sympathetic|unsympathetic|empathetic|unempathetic|caring|uncaring|considerate|inconsiderate|thoughtful|thoughtless|mindful|mindless|attentive|inattentive|observant|unobservant|alert|drowsy|vigilant|negligent|careful|careless|meticulous|sloppy|precise|imprecise|accurate|inaccurate|exact|inexact|perfect|imperfect|flawless|flawed|pristine|tainted|pure|impure|clean|dirty|sterile|contaminated|sanitary|unsanitary|hygenic|unhygenic|healthy|unhealthy|sick|well|ill|diseased|robust|frail|vigorous|weak|energetic|languid|dynamic|static|active|passive|proactive|reactive|initiative|responsive|interactive|isolated|connected|linked|unlinked|associated|dissociated|related|unrelated|relevant|irrelevant|pertinent|impertinent|applicable|inapplicable|appropriate|inappropriate|suitable|unsuitable|fitting|unfitting|proper|improper|correct|incorrect|right|wrong|true|false|valid|invalid|legitimate|illegitimate|authentic|fake|genuine|counterfeit|original|copy|real|artificial|natural|synthetic|organic|inorganic|biological|mechanical|chemical|physical|mental|emotional|psychological|spiritual|religious|secular|divine|earthly|heavenly|celestial|terrestrial|worldly|otherworldly|supernatural|natural|paranormal|normal|abnormal|extraordinary|ordinary|miraculous|mundane|magical|prosaic|enchanting|dull|thrilling|boring|exciting|monotonous|stimulating|tedious|engaging|dreary|compelling|unconvincing|convincing|persuasive|unpersuasive|effective|ineffective|useful|useless|helpful|unhelpful|beneficial|harmful|advantageous|disadvantageous|profitable|unprofitable|successful|unsuccessful|victorious|defeated|winning|losing|triumphant|tragic|joyful|sorrowful|cheerful|mournful|jubilant|despondent|ecstatic|depressed|elated|disheartened|thrilled|disappointed|delighted|displeased|satisfied|dissatisfied|content|discontent|pleased|displeased|gratified|frustrated|fulfilled|unfulfilled|accomplished|unaccomplished|achieved|unachieved|realized|unrealized|attained|unattained|obtained|unobtained|gained|lost|won|defeated|earned|spent|saved|wasted|invested|divested|accumulated|dissipated|collected|dispersed|gathered|scattered|assembled|disassembled|built|destroyed|created|eliminated|established|abolished|founded|dissolved|organized|disorganized|arranged|disarranged|ordered|disordered|planned|unplanned|intended|unintended|deliberate|accidental|purposeful|aimless|meaningful|meaningless|significant|insignificant|important|unimportant|crucial|vital|essential|inessential|necessary|unnecessary|required|optional|mandatory|voluntary|compulsory|elective|obligatory|voluntary|forced|willing|reluctant|eager|hesitant|enthusiastic|apathetic|passionate|indifferent|zealous|lukewarm|ardent|cool|fervent|tepid|fanatical|moderate|extreme|mild|severe|intense|moderate|radical|conservative|liberal|progressive|reactionary|revolutionary|traditional|innovative|conventional|unconventional|orthodox|unorthodox|standard|nonstandard|normal|abnormal|regular|irregular|usual|unusual|common|uncommon|ordinary|extraordinary|typical|atypical|standard|customary|habitual|unusual|peculiar|strange|weird|odd|bizarre|eccentric|quirky|unconventional|unorthodox|nonconformist|individualistic|unique|distinctive|characteristic|special|particular|specific|general|universal|global|local|national|international|domestic|foreign|native|alien|indigenous|exotic|familiar|unfamiliar|known|unknown|recognized|unrecognized|acknowledged|ignored|famous|infamous|celebrated|notorious|renowned|obscure|prominent|insignificant|distinguished|ordinary|illustrious|prestigious|modest|pretentious|arrogant|humbl|confident|insecure|self-assured|self-conscious|assertive|passive|aggressive|defensive|offensive|protective|vulnerable|invulnerable|resilient|fragile|strong|weak|powerful|powerless|influential|insignificant|authoritative|submissive|dominant|subordinate|superior|inferior|equal|unequal|equivalent|different|similar|dissimilar|identical|distinct|comparable|incomparable|analogous|dissimilar|parallel|divergent|convergent|corresponding|contrasting|complementary|opposing|conflicting|harmonious|discordant|compatible|incompatible|consistent|inconsistent|coherent|incoherent|logical|illogical|rational|irrational|reasonable|unreasonable|sensible|nonsensical|practical|impractical|feasible|infeasible|possible|impossible|probable|improbable|likely|unlikely|certain|uncertain|sure|unsure|definite|indefinite|clear|unclear|obvious|subtle|explicit|implicit|direct|indirect|straightforward|complicated|simple|complex|easy|difficult|hard|soft|tough|gentle|rough|smooth|coarse|fine|thick|thin|wide|narrow|broad|slim|fat|skinny|large|small|huge|tiny|massive|minute|enormous|microscopic|giant|dwarf|colossal|petite|immense|minuscule|vast|meager|abundant|scarce|plentiful|sparse|copious|meager|profuse|lavish|frugal|extravagant|economical|wasteful|thrifty|squandering|generous|stingy|liberal|conservative|open-handed|tight-fisted|magnanimous|parsimonious|benevolent|malevolent|kind|cruel|compassionate|heartless|sympathetic|unsympathetic|empathetic|unempathetic|caring|uncaring|considerate|inconsiderate|thoughtful|thoughtless|mindful|mindless|attentive|inattentive|observant|unobservant|alert|drowsy|vigilant|negligent|careful|careless|meticulous|sloppy|precise|imprecise|accurate|inaccurate|exact|inexact|perfect|imperfect|flawless|flawed|pristine|tainted|pure|impure|clean|dirty|sterile|contaminated|sanitary|unsanitary|hygenic|unhygenic|healthy|unhealthy|sick|well|ill|diseased|robust|frail|vigorous|weak|energetic|languid|dynamic|static|active|passive|proactive|reactive|initiative|responsive|interactive|isolated|connected|linked|unlinked|associated|dissociated|related|unrelated|relevant|irrelevant|pertinent|impertinent|applicable|inapplicable|appropriate|inappropriate|suitable|unsuitable|fitting|unfitting|proper|improper|correct|incorrect|right|wrong|true|false|valid|invalid|legitimate|illegitimate|authentic|fake|genuine|counterfeit|original|copy|real|artificial|natural|synthetic|organic|inorganic|biological|mechanical|chemical|physical|mental|emotional|psychological|spiritual|religious|secular|divine|earthly|heavenly|celestial|terrestrial|worldly|otherworldly|supernatural|natural|paranormal|normal|abnormal|extraordinary|ordinary|miraculous|mundane|magical|prosaic|enchanting|dull|thrilling|boring|exciting|monotonous|stimulating|tedious|engaging|dreary|compelling|unconvincing|convincing|persuasive|unpersuasive|effective|ineffective|useful|useless|helpful|unhelpful|beneficial|harmful|advantageous|disadvantageous|profitable|unprofitable|successful|unsuccessful|victorious|defeated|winning|losing|triumphant|tragic|joyful|sorrowful|cheerful|mournful|jubilant|despondent|ecstatic|depressed|elated|disheartened|thrilled|disappointed|delighted|displeased|satisfied|dissatisfied|content|discontent|pleased|displeased|gratified|frustrated|fulfilled|unfulfilled|accomplished|unaccomplished|achieved|unachieved|realized|unrealized|attained|unattained|obtained|unobtained|gained|lost|won|defeated|earned|spent|saved|wasted|invested|divested|accumulated|dissipated|collected|dispersed|gathered|scattered|assembled|disassembled|built|destroyed|created|eliminated|established|abolished|founded|dissolved|organized|disorganized|arranged|disarranged|ordered|disordered|planned|unplanned|intended|unintended|deliberate|accidental|purposeful|aimless|meaningful|meaningless|significant|insignificant|important|unimportant|crucial|vital|essential|inessential|necessary|unnecessary|required|optional|mandatory|voluntary|compulsory|elective|obligatory|voluntary|forced|willing|reluctant|eager|hesitant|enthusiastic|apathetic|passionate|indifferent|zealous|lukewarm|ardent|cool|fervent|tepid|fanatical|moderate|extreme|mild|severe|intense|moderate|radical|conservative|liberal|progressive|reactionary|revolutionary|traditional|innovative|conventional|unconventional|orthodox|unorthodox|standard|nonstandard|normal|abnormal|regular|irregular|usual|unusual|common|uncommon|ordinary|extraordinary|typical|atypical|standard|customary|habitual|unusual|peculiar|strange|weird|odd|bizarre|eccentric|quirky|unconventional|unorthodox|nonconformist|individualistic|unique|distinctive|characteristic|special|particular|specific|general|universal|global|local|national|international|domestic|foreign|native|alien|indigenous|exotic|familiar|unfamiliar|known|unknown|recognized|unrecognized|acknowledged|ignored|famous|infamous|celebrated|notorious|renowned|obscure|prominent|insignificant|distinguished|ordinary|illustrious|prestigious|modest|pretentious|arrogant|humbl|confident|insecure|self-assured|self-conscious|assertive|passive|aggressive|defensive|offensive|protective|vulnerable|invulnerable|resilient|fragile|strong|weak|powerful|powerless|influential|insignificant|authoritative|submissive|dominant|subordinate|superior|inferior|equal|unequal|equivalent|different|similar|dissimilar|identical|distinct|comparable|incomparable|analogous|dissimilar|parallel|divergent|convergent|corresponding|contrasting|complementary|opposing|conflicting|harmonious|discordant|compatible|incompatible|consistent|inconsistent|coherent|incoherent|logical|illogical|rational|irrational|reasonable|unreasonable|sensible|nonsensical|practical|impractical|feasible|infeasible|possible|impossible|probable|improbable|likely|unlikely|certain|uncertain|sure|unsure|definite|indefinite|clear|unclear|obvious|subtle|explicit|implicit|direct|indirect|straightforward|complicated|simple|complex|easy|difficult|hard|soft|tough|gentle|rough|smooth|coarse|fine|thick|thin|wide|narrow|broad|slim|fat|skinny|large|small|huge|tiny|massive|minute|enormous|microscopic|giant|dwarf|colossal|petite|immense|minuscule|vast|meager|abundant|scarce|plentiful|sparse|copious|meager|profuse|lavish|frugal|extravagant|economical|wasteful|thrifty|squandering|generous|stingy|liberal|conservative|open-handed|tight-fisted|magnanimous|parsimonious|benevolent|malevolent|kind|cruel|compassionate|heartless|sympathetic|unsympathetic|empathetic|unempathetic|caring|uncaring|considerate|inconsiderate|thoughtful|thoughtless|mindful|mindless|attentive|inattentive|observant|unobservant|alert|drowsy|vigilant|negligent|careful|careless|meticulous|sloppy|precise|imprecise|accurate|inaccurate|exact|inexact|perfect|imperfect|flawless|flawed|pristine|tainted|pure|impure|clean|dirty|sterile|contaminated|sanitary|unsanitary|hygenic|unhygenic|healthy|unhealthy|sick|well|ill|diseased|robust|frail|vigorous|weak|energetic|languid|dynamic|static|active|passive|proactive|reactive|initiative|responsive|interactive|isolated|connected|linked|unlinked|associated|dissociated|related|unrelated|relevant|irrelevant|pertinent|impertinent|applicable|inapplicable|appropriate|inappropriate|suitable|unsuitable|fitting|unfitting|proper|improper|correct|incorrect|right|wrong|true|false|valid|invalid|legitimate|illegitimate|authentic|fake|genuine|counterfeit|original|copy|real|artificial|natural|synthetic|organic|inorganic|biological|mechanical|chemical|physical|mental|emotional|psychological|spiritual|religious|secular|divine|earthly|heavenly|celestial|terrestrial|worldly|otherworldly|supernatural|natural|paranormal|normal|abnormal|extraordinary|ordinary|miraculous|mundane|magical|prosaic|enchanting|dull|thrilling|boring|exciting|monotonous|stimulating|tedious|engaging|dreary|compelling|unconvincing|convincing|persuasive|unpersuasive|effective|ineffective|useful|useless|helpful|unhelpful|beneficial|harmful|advantageous|disadvantageous|profitable|unprofitable|successful|unsuccessful|victorious|defeated|winning|losing|triumphant|tragic|joyful|sorrowful|cheerful|mournful|jubilant|despondent|ecstatic|depressed|elated|disheartened|thrilled|disappointed|delighted|displeased|satisfied|dissatisfied|content|discontent|pleased|displeased|gratified|frustrated|fulfilled|unfulfilled|accomplished|unaccomplished|achieved|unachieved|realized|unrealized|attained|unattained|obtained|unobtained|gained|lost|won|defeated|earned|spent|saved|wasted|invested|divested|accumulated|dissipated|collected|dispersed|gathered|scattered|assembled|disassembled|built|destroyed|created|eliminated|established|abolished|founded|dissolved|organized|disorganized|arranged|disarranged|ordered|disordered|planned|unplanned|intended|unintended|deliberate|accidental|purposeful|aimless|meaningful|meaningless|significant|insignificant|important|unimportant|crucial|vital|essential|inessential|necessary|unnecessary|required|optional|mandatory|voluntary|compulsory|elective|obligatory|voluntary|forced|willing|reluctant|eager|hesitant|enthusiastic|apathetic|passionate|indifferent|zealous|lukewarm|ardent|cool|fervent|tepid|fanatical|moderate|extreme|mild|severe|intense|moderate|radical|conservative|liberal|progressive|reactionary|revolutionary|traditional|innovative|conventional|unconventional|orthodox|unorthodox|standard|nonstandard|normal|abnormal|regular|irregular|usual|unusual|common|uncommon|ordinary|extraordinary|typical|atypical|standard|customary|habitual|unusual|peculiar|strange|weird|odd|bizarre|eccentric|quirky|unconventional|unorthodox|nonconformist|individualistic|unique|distinctive|characteristic|special|particular|specific|general|universal|global|local|national|international|domestic|foreign|native|alien|indigenous|exotic|familiar|unfamiliar|known|unknown|recognized|unrecognized|acknowledged|ignored|famous|infamous|celebrated|notorious|renowned|obscure|prominent|insignificant|distinguished|ordinary|illustrious|prestigious|modest|pretentious|arrogant|humbl|confident|insecure|self-assured|self-conscious|assertive|passive|aggressive|defensive|offensive|protective|vulnerable|invulnerable|resilient|fragile|strong|weak|powerful|powerless|influential|insignificant|authoritative|submissive|dominant|subordinate|superior|inferior|equal|unequal|equivalent|different|similar|dissimilar|identical|distinct|comparable|incomparable|analogous|dissimilar|parallel|divergent|convergent|corresponding|contrasting|complementary|opposing|conflicting|harmonious|discordant|compatible|incompatible|consistent|inconsistent|coherent|incoherent|logical|illogical|rational|irrational|reasonable|unreasonable|sensible|nonsensical|practical|impractical|feasible|infeasible|possible|impossible|probable|improbable|likely|unlikely|certain|uncertain|sure|unsure|definite|indefinite|clear|unclear|obvious|subtle|explicit|implicit|direct|indirect|straightforward|complicated|simple|complex|easy|difficult|hard|soft|tough|gentle|rough|smooth|coarse|fine|thick|thin|wide|narrow|broad|slim|fat|skinny|large|small|huge|tiny|massive|minute|enormous|microscopic|giant|dwarf|colossal|petite|immense|minuscule|vast|meager|abundant|scarce|plentiful|sparse|copious|meager|profuse|lavish|frugal|extravagant|economical|wasteful|thrifty|squandering|generous|stingy|liberal|conservative|open-handed|tight-fisted|magnanimous|parsimonious|benevolent|malevolent|kind|cruel|compassionate|heartless|sympathetic|unsympathetic|empathetic|unempathetic|caring|uncaring|considerate|inconsiderate|thoughtful|thoughtless|mindful|mindless|attentive|inattentive|observant|unobservant|alert|drowsy|vigilant|negligent|careful|careless|meticulous|sloppy|precise|imprecise|accurate|inaccurate|exact|inexact|perfect|imperfect|flawless|flawed|pristine|tainted|pure|impure|clean|dirty|sterile|contaminated|sanitary|unsanitary|hygenic|unhygenic|healthy|unhealthy|sick|well|ill|diseased|robust|frail|vigorous|weak|energetic|languid|dynamic|static|active|passive|proactive|reactive|initiative|responsive|interactive|isolated|connected|linked|unlinked|associated|dissociated|related|unrelated|relevant|irrelevant|pertinent|impertinent|applicable|inapplicable|appropriate|inappropriate|suitable|unsuitable|fitting|unfitting|proper|improper|correct|incorrect|right|wrong|true|false|valid|invalid|legitimate|illegitimate|authentic|fake|genuine|counterfeit|original|copy|real|artificial|natural|synthetic|organic|inorganic|biological|mechanical|chemical|physical|mental|emotional|psychological|spiritual|religious|secular|divine|earthly|heavenly|celestial|terrestrial|worldly|otherworldly|supernatural|natural|paranormal|normal|abnormal|extraordinary|ordinary|miraculous|mundane|magical|prosaic|enchanting|dull|thrilling|boring|exciting|monotonous|stimulating|tedious|engaging|dreary|compelling|unconvincing|convincing|persuasive|unpersuasive|effective|ineffective|useful|useless|helpful|unhelpful|beneficial|harmful|advantageous|disadvantageous|profitable|unprofitable|successful|unsuccessful|victorious|defeated|winning|losing|triumphant|tragic|joyful|sorrowful|cheerful|mournful|jubilant|despondent|ecstatic|depressed|elated|disheartened|thrilled|disappointed|delighted|displeased|satisfied|dissatisfied|content|discontent|pleased|displeased|gratified|frustrated|fulfilled|unfulfilled|accomplished|unaccomplished|achieved|unachieved|realized|unrealized|attained|unattained|obtained|unobtained|gained|lost|won|defeated|earned|spent|saved|wasted|invested|divested|accumulated|dissipated|collected|dispersed|gathered|scattered|assembled|disassembled|built|destroyed|created|eliminated|established|abolished|founded|dissolved|organized|disorganized|arranged|disarranged|ordered|disordered|planned|unplanned|intended|unintended|deliberate|accidental|purposeful|aimless|meaningful|meaningless|significant|insignificant|important|unimportant|crucial|vital|essential|inessential|necessary|unnecessary|required|optional|mandatory|voluntary|compulsory|elective|obligatory|voluntary|forced|willing|reluctant|eager|hesitant|enthusiastic|apathetic|passionate|indifferent|zealous|lukewarm|ardent|cool|fervent|tepid|fanatical|moderate|extreme|mild|severe|intense|moderate|radical|conservative|liberal|progressive|reactionary|revolutionary|traditional|innovative|conventional|unconventional|orthodox|unorthodox|standard|nonstandard|normal|abnormal|regular|irregular|usual|unusual|common|uncommon|ordinary|extraordinary|typical|atypical|standard|customary|habitual|unusual|peculiar|strange|weird|odd|bizarre|eccentric|quirky|unconventional|unorthodox|nonconformist|individualistic|unique|distinctive|characteristic|special|particular|specific|general|universal|global|local|national|international|domestic|foreign|native|alien|indigenous|exotic|familiar|unfamiliar|known|unknown|recognized|unrecognized|acknowledged|ignored|famous|infamous|celebrated|notorious|renowned|obscure|prominent|insignificant|distinguished|ordinary|illustrious|prestigious|modest|pretentious|arrogant|humbl|confident|insecure|self-assured|self-conscious|assertive|passive|aggressive|defensive|offensive|protective|vulnerable|invulnerable|resilient|fragile|strong|weak|powerful|powerless|influential|insignificant|authoritative|submissive|dominant|subordinate|superior|inferior|equal|unequal|equivalent|different|similar|dissimilar|identical|distinct|comparable|incomparable|analogous|dissimilar|parallel|divergent|convergent|corresponding|contrasting|complementary|opposing|conflicting|harmonious|discordant|compatible|incompatible|consistent|inconsistent|coherent|incoherent|logical|illogical|rational|irrational|reasonable|unreasonable|sensible|nonsensical|practical|impractical|feasible|infeasible|possible|impossible|probable|improbable|likely|unlikely|certain|uncertain|sure|unsure|definite|indefinite|clear|unclear|obvious|subtle|explicit|implicit|direct|indirect|straightforward|complicated|simple|complex|easy|difficult|hard|soft|tough|gentle|rough|smooth|coarse|fine|thick|thin|wide|narrow|broad|slim|fat|skinny|large|small|huge|tiny|massive|minute|enormous|microscopic|giant|dwarf|colossal|petite|immense|minuscule|vast|meager|abundant|scarce|plentiful|sparse|copious|meager|profuse|lavish|frugal|extravagant|economical|wasteful|thrifty|squandering|generous|stingy|liberal|conservative|open-handed|tight-fisted|magnanimous|parsimonious|benevolent|malevolent|kind|cruel|compassionate|heartless|sympathetic|unsympathetic|empathetic|unempathetic|caring|uncaring|considerate|inconsiderate|thoughtful|thoughtless|mindful|mindless|attentive|inattentive|observant|unobservant|alert|drowsy|vigilant|negligent|careful|careless|meticulous|sloppy|precise|imprecise|accurate|inaccurate|exact|inexact|perfect|imperfect|flawless|flawed|pristine|tainted|pure|impure|clean|dirty|sterile|contaminated|sanitary|unsanitary|hygenic|unhygenic|healthy|unhealthy|sick|well|ill|diseased|robust|frail|vigorous|weak|energetic|languid|dynamic|static|active|passive|proactive|reactive|initiative|responsive|interactive|isolated|connected|linked|unlinked|associated|dissociated|related|unrelated|relevant|irrelevant|pertinent|impertinent|applicable|inapplicable|appropriate|inappropriate|suitable|unsuitable|fitting|unfitting|proper|improper|correct|incorrect|right|wrong|true|false|valid|invalid|legitimate|illegitimate|authentic|fake|genuine|counterfeit|original|copy|real|artificial|natural|synthetic|organic|inorganic|biological|mechanical|chemical|physical|mental|emotional|psychological|spiritual|religious|secular|divine|earthly|heavenly|celestial|terrestrial|worldly|otherworldly|supernatural|natural|paranormal|normal|abnormal|extraordinary|ordinary|miraculous|mundane|magical|prosaic|enchanting|dull|thrilling|boring|exciting|monotonous|stimulating|tedious|engaging|dreary|compelling|unconvincing|convincing|persuasive|unpersuasive|effective|ineffective|useful|useless|helpful|unhelpful|beneficial|harmful|advantageous|disadvantageous|profitable|unprofitable|successful|unsuccessful|victorious|defeated|winning|losing|triumphant|tragic|joyful|sorrowful|cheerful|mournful|jubilant|despondent|ecstatic|depressed|elated|disheartened|thrilled|disappointed|delighted|displeased|satisfied|dissatisfied|content|discontent|pleased|displeased|gratified|frustrated|fulfilled|unfulfilled|accomplished|unaccomplished|achieved|unachieved|realized|unrealized|attained|unattained|obtained|unobtained|gained|lost|won|defeated|earned|spent|saved|wasted|invested|divested|accumulated|dissipated|collected|dispers|gather|scatter|assembl|disassembl|built|destroy|creat|elimin|establish|abolish|found|dissolv|organiz|disorganiz|arrang|disarrang|order|disorder|plan|unplan|int|unintend|deliber|accident|purpose|aimless|meaning|meaningless|signific|insignific|important|unimportant|crucial|vital|essential|inessential|necess|unnecess|requir|option|mandat|volunt|compuls|elect|obligat|volunt|forc|will|reluct|eag|hesit|enthusiast|apathet|passion|indiffer|zeal|lukewarm|ardent|cool|fervent|tepid|fanatic|moderat|extrem|mild|sever|intens|moderat|radic|conserv|liber|progress|reaction|revolution|tradit|innov|convent|unconvent|orthodox|unorthodox|standard|nonstandard|norm|abnorm|regul|irregul|usual|unusual|common|uncommon|ordin|extraordin|typ|atyp|standard|custom|habit|unusual|peculi|strange|weird|odd|bizar|eccentr|quirky|unconvent|unorthodox|nonconform|individualist|unique|distinct|characterist|special|particul|specif|gener|univers|glob|loc|nation|internation|domest|foreign|nat|alien|indigen|exot|familiar|unfamiliar|known|unknown|recogniz|unrecogniz|acknowledg|ignor|famous|infamous|celebr|notori|renown|obscur|prominent|insignific|distinguish|ordin|illustri|prestigi|modest|pretenti|arrog|humbl)$/i.test(t));

  // If we still don't have enough tools from the above methods, add some fallback tools based on project type
  if (filteredTools.length < 3) {
    const fallbackTools = [];

    // Add tools based on project characteristics
    if (hints?.languages && hints.languages.length > 0) {
      // Common tools for specific languages
      const lang = hints.languages[0]?.toLowerCase();
      if (lang === 'javascript' || lang === 'typescript') {
        fallbackTools.push('npm', 'yarn', 'webpack', 'vite');
      } else if (lang === 'python') {
        fallbackTools.push('pip', 'virtualenv', 'pytest');
      } else if (lang === 'java') {
        fallbackTools.push('maven', 'gradle');
      } else if (lang === 'go') {
        fallbackTools.push('go mod');
      }
    }

    // Add generic development tools if we still need more
    if (fallbackTools.length < 3) {
      const genericTools = ['git', 'docker', 'make', 'bash', 'curl', 'wget'];
      fallbackTools.push(...genericTools.slice(0, 3 - fallbackTools.length));
    }

    filteredTools.push(...fallbackTools);
  }

  return filteredTools.slice(0, 15);
}
function extractCoolFacts(md, hints) {
  const facts = new Set();

  // Clean the markdown first to avoid extracting markdown artifacts
  const cleanedMd = stripBadges(md);

  // First, extract facts from README content

  // README-based facts as fallback/supplement
  // Intro sentences
  const intro = firstMeaningfulParagraph(cleanedMd);
  if (intro && intro.length > 30) {
    const sentences = intro.split(/[.!?]\s+/).filter(s => s.trim().length > 20 && !s.includes('['));
    sentences.slice(0, 2).forEach(s => {
      const clean = s.trim().replace(/[#*`_~]/g, '').trim();
      if (clean.length > 15) facts.add(clean);
    });
  }

  // Feature bullets - collect from features sections
  const features = collectBulletsUnderHeadings(cleanedMd, SECTION_TITLES.FEATURES, 6);
  features.forEach(b => {
    if (!/installation|license|requirement|depend|prerequisite|guide|tutorial|doc/i.test(b) && b.length > 15 && !b.includes('[')) {
      const clean = b.trim().replace(/[#*`_~]/g, '').trim();
      if (clean.length > 10) {
        facts.add(clean);
      }
    }
  });

  // Unique capabilities from README
  if (facts.size < 3) {
    const capabilities = [];
    const low = cleanedMd.toLowerCase();

    // Look for automation, integration, AI, etc.
    if (low.includes('automation') || low.includes('automate')) {
      capabilities.push('🤖 Provides automation capabilities');
    }
    if (low.includes('integration') || low.includes('integrate')) {
      capabilities.push('🔗 Offers integration features');
    }
    if (low.includes('artificial intelligence') || low.includes('machine learning') || low.includes('ai') || low.includes('ml')) {
      capabilities.push('🧠 Uses artificial intelligence/machine learning');
    }
    if (low.includes('real-time') || low.includes('real time')) {
      capabilities.push('⚡ Real-time processing capabilities');
    }
    if (low.includes('api') && low.includes('rest')) {
      capabilities.push('🌐 REST API available');
    }
    if (low.includes('webhook') || low.includes('hook')) {
      capabilities.push('🔗 Webhook support');
    }
    if (low.includes('docker') || low.includes('container')) {
      capabilities.push('🐳 Docker/container support');
    }
    if (low.includes('raspberry pi') || low.includes('rpi')) {
      capabilities.push('🍓 Raspberry Pi compatible');
    }

    capabilities.forEach(cap => facts.add(cap));
  }

  // Fallback: API endpoints or key features
  if (facts.size < 2) {
    const endpoints = cleanedMd.match(/(?:\/[a-z][a-z0-9/_-]*)(?=[^\w/]|$)/gi);
    if (endpoints) {
      Array.from(new Set(endpoints)).slice(0, 3).forEach(x => facts.add(`🔌 Provides endpoint: ${x}`));
    }
  }

  // Additional fallback facts from README content analysis
  if (facts.size < 3) {
    const low = cleanedMd.toLowerCase();

    // Check for common project types and features
    const projectTypes = {
      'automation': '🤖 Automation project',
      'bot': '🤖 Bot/Automation tool',
      'scraper': '🕷️ Web scraping tool',
      'crawler': '🕷️ Web crawler',
      'parser': '📝 Parser tool',
      'generator': '⚙️ Code generator',
      'template': '📋 Template engine',
      'framework': '🏗️ Framework',
      'library': '📚 Library',
      'tool': '🛠️ Development tool',
      'utility': '🔧 Utility tool',
      'cli': '💻 Command-line interface',
      'gui': '🖥️ Graphical user interface',
      'web app': '🌐 Web application',
      'mobile app': '📱 Mobile application',
      'desktop app': '💻 Desktop application',
      'game': '🎮 Game',
      'plugin': '🔌 Plugin/Extension',
      'theme': '🎨 Theme',
      'widget': '🧩 Widget',
      'component': '🧱 Component',
      'module': '📦 Module',
      'package': '📦 Package',
      'sdk': '🔧 Software Development Kit',
      'api': '🔌 API',
      'service': '🔧 Service',
      'daemon': '⚙️ Background service',
      'microservice': '🏗️ Microservice',
      'monorepo': '📁 Monorepo',
      'tutorial': '📚 Tutorial/Educational',
      'example': '💡 Example/Demo',
      'sample': '💡 Sample code',
      'reference': '📖 Reference implementation'
    };

    for (const [keyword, description] of Object.entries(projectTypes)) {
      if (low.includes(keyword) && facts.size < 5) {
        facts.add(description);
      }
    }
  }

  return Array.from(facts).slice(0, 6);
}
function smartTruncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastPara = truncated.lastIndexOf('\n\n');
  return lastPara > 0 ? truncated.slice(0, lastPara) : truncated;
}

function isGibberish(text) {
  if (!text || text.length < 50) return true;

  // Check for repetitive patterns (common in model hallucinations)
  const words = text.toLowerCase().split(/\s+/);
  const wordCounts = {};
  words.forEach(word => {
    if (word.length > 3) { // Only check longer words
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });

  // If any word appears more than 3 times, it's likely gibberish
  const hasRepetitiveWords = Object.values(wordCounts).some(count => count > 3);

  // Check for nonsensical phrases
  const nonsensicalPatterns = [
    /the (author|book|writer|reader|world|united states|international|daily discussion)/i,
    /says the (book|author|writer|reader)/i,
    /published in the book/i,
    /contents?\.?\s+the book/i,
    /the book of (the )*book/i
  ];

  const hasNonsensicalPhrases = nonsensicalPatterns.some(pattern => pattern.test(text));

  // Check for very low information density (too many common words)
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const commonCount = words.filter(word => commonWords.includes(word.toLowerCase())).length;
  const informationDensity = (words.length - commonCount) / words.length;

  return hasRepetitiveWords || hasNonsensicalPhrases || informationDensity < 0.3;
}

/* -------------------------------------------------------------------------- */
/*                             Summarizer Service                              */
/* -------------------------------------------------------------------------- */

export class SummarizerService {
  /** @type {import('@huggingface/transformers').Pipeline | null} */
  #summarizer = null;

  async #getSummarizer() {
    if (!this.#summarizer) {
      const { pipeline } = await import('@huggingface/transformers');
      try {
        this.#summarizer = await pipeline('summarization', SUMMARIZATION_MODEL, { dtype: 'q8' });
      } catch {
        this.#summarizer = await pipeline('summarization', SUMMARIZATION_MODEL);
      }
    }
    return this.#summarizer;
  }

  /**
   * Summarize README + extract structured info using optional repo hints.
   * @param {string} readmeText
   * @param {Object=} repoHints - GitHub API data and metadata
   * @returns {Promise<{githubSummary:string, cool_facts:string[], tools_used:string[], website_url:string}>}
   */
  async summarizeRepository(readmeText, repoHints = undefined) {
    if (typeof readmeText !== 'string' || readmeText.trim().length === 0) {
      throw new Error('Valid non-empty README text is required for summarization');
    }

    const cleaned = stripBadges(readmeText);

    // Model summary with graceful fallback and gibberish detection
    let githubSummary = '';
    try {
      const summarizer = await this.#getSummarizer();
      // Use more content for better summarization but still limit for AI model
      const truncated = smartTruncate(cleaned, 12000);
      const out = await summarizer(truncated, {
        max_length: 250,
        min_length: 60,
        do_sample: false,
        clean_up_tokenization_spaces: true,
      });
      const text = Array.isArray(out) ? out[0]?.summary_text : out?.summary_text;
      githubSummary = (text || '').trim();

      // Check if the AI output is gibberish and force fallback if so
      if (isGibberish(githubSummary)) {
        console.warn('AI summarization produced gibberish, using fallback');
        githubSummary = generateFallbackSummary(cleaned, repoHints);
      }
    } catch (error) {
      console.error('AI summarization failed:', error);
      githubSummary = generateFallbackSummary(cleaned, repoHints);
    }

    // Final fallback if we still don't have a good summary
    if (!githubSummary || githubSummary.length < 50 || isGibberish(githubSummary)) {
      githubSummary = generateFallbackSummary(cleaned, repoHints);
    }

    // Enhanced extraction using GitHub API data (use full content for extraction)
    const cool_facts = extractCoolFacts(cleaned, repoHints);
    const tools_used = extractToolsUsed(cleaned, repoHints);
    const website_from_readme = extractWebsiteFromReadme(cleaned);
    const website_url = (repoHints && repoHints.homepage) || website_from_readme || 'Not specified';

    return { githubSummary, cool_facts, tools_used, website_url };
  }

  /**
   * Full pipeline: Given a GitHub URL, probe API (stars/license/homepage/languages/releases/tags/README/manifests),
   * then summarize and return your final response object.
   * @param {string} githubUrl
   * @returns {Promise<object>} JSON ready for your API response
   */
  async summarizeFromGitHubUrl(githubUrl) {
    if (!githubUrl) throw new Error('githubUrl is required');
    const { owner, repo } = parseRepoUrl(githubUrl);

    // Probe repo meta (required for basic info and branch detection)
    const meta = await fetchRepoMeta(owner, repo);

    // Try to get additional metadata, but don't fail if rate limited
    let latest_version = 'N/A';
    let languages = [];
    let requirementsTxt = null;

    try {
      latest_version = await fetchLatestVersion(owner, repo);
    } catch (error) {
      console.warn('Could not fetch latest version (likely rate limited):', error.message);
    }

    try {
      languages = await fetchLanguages(owner, repo);
    } catch (error) {
      console.warn('Could not fetch languages (likely rate limited):', error.message);
    }

    // README (with fallback) and manifests - these are essential
    const readme = await fetchReadme(owner, repo, meta.default_branch);

    try {
      requirementsTxt = await fetchOptionalText(owner, repo, 'requirements.txt', meta.default_branch);
    } catch (error) {
      console.warn('Could not fetch requirements.txt (likely rate limited):', error.message);
    }

    // Summarize with hints - pass ALL GitHub API metadata for extraction
    let extraction = await this.summarizeRepository(readme.text, {
      languages,
      homepage: meta.website_url,
      license: meta.license_type,
      stars: meta.stars,
      forks: meta.forks,
      topics: meta.topics,
      language: meta.language,
      description: meta.description,
      open_issues: meta.open_issues,
      watchers: meta.watchers,
      created_at: meta.created_at,
      updated_at: meta.updated_at,
      manifests: {
        requirementsTxt,
        // packageJson
      }
    });

    // The extraction functions are working well, so we'll use their results as-is
    // No need for fail-safe logic since README extraction is finding good content

    // Supplement tools with languages if we have them (but don't override extracted tools)
    if (Array.isArray(extraction.tools_used) && extraction.tools_used.length < 3 && languages.length > 0) {
      const baseTools = languages.map(l => String(l).toLowerCase());
      const existingTools = extraction.tools_used || [];
      extraction.tools_used = [...existingTools, ...baseTools.slice(0, 5)].slice(0, 10);
    } else if (!Array.isArray(extraction.tools_used) || extraction.tools_used.length === 0) {
      // Fallback if no tools extracted at all
      extraction.tools_used = Array.isArray(languages) ? languages.map(l => String(l).toLowerCase()).slice(0, 5) : [];
    }

    return {
      success: true,
      message: 'Repository summarized successfully.',
      modelUsed: this.getModelName(),
      readmeSource: readme.download_url || `https://raw.githubusercontent.com/${owner}/${repo}/${meta.default_branch}/${readme.path || 'README.md'}`,
      githubSummary: extraction.githubSummary,
      cool_facts: extraction.cool_facts,
      tools_used: extraction.tools_used,
      stars: meta.stars,
      latest_version: latest_version || 'N/A',
      license_type: meta.license_type,
      website_url: extraction.website_url || meta.website_url || 'Not specified',
    };
  }

  getModelName() { return SUMMARIZATION_MODEL; }
  dispose() { this.#summarizer = null; }
}

export const summarizerService = new SummarizerService();
