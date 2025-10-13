/**
 * GitHub URL parsing and README fetching utilities
 * Following SOLID principles - Single Responsibility: Handle GitHub-specific operations
 */

/**
 * Sanitizes repository name by removing .git extension and trailing slashes
 * @param {string} repo - Repository name to sanitize
 * @returns {string} Sanitized repository name
 */
export function sanitizeRepo(repo) {
  return repo.replace(/\.git$/i, '').replace(/\/+$/, '');
}

/**
 * Parses GitHub URL to extract owner and repository name
 * Supports various GitHub URL formats including with .git, branches, and file paths
 * @param {string} githubUrl - GitHub repository URL
 * @returns {{owner: string, repo: string} | null} Parsed owner and repo, or null if invalid
 */
export function parseOwnerRepo(githubUrl) {
  try {
    const url = new URL(githubUrl);
    if (!url.hostname.endsWith('github.com')) return null;

    // Split the path and filter out empty segments
    const parts = url.pathname.split('/').filter(Boolean);

    // Accept forms like:
    // /owner/repo
    // /owner/repo.git
    // /owner/repo/
    // /owner/repo/tree/main
    // /owner/repo/blob/main/README.md
    const owner = parts[0];
    let repo = parts[1];

    if (!owner || !repo) return null;

    repo = sanitizeRepo(repo);
    return { owner, repo };
  } catch {
    return null;
  }
}

/**
 * Fetches README file from GitHub repository
 * Tries multiple common README filenames and branches (main, master)
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<{url: string, text: string} | null>} README content and URL, or null if not found
 */
export async function fetchReadme(owner, repo) {
  const roots = [
    'README.md',
    'Readme.md',
    'readme.md',
    'README.MD'
  ];
  const branches = ['main', 'master'];

  for (const branch of branches) {
    for (const filename of roots) {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filename}`;
      const response = await fetch(url, { method: 'GET' });

      if (response.ok) {
        const text = await response.text();
        if (text && text.trim()) {
          return { url, text };
        }
      }
    }
  }

  return null;
}

/**
 * Validates if a URL is a valid GitHub repository URL
 * @param {string} githubUrl - URL to validate
 * @returns {boolean} True if valid GitHub repository URL
 */
export function isValidGitHubUrl(githubUrl) {
  return parseOwnerRepo(githubUrl) !== null;
}

/**
 * Fetches repository metadata from GitHub API
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<{stars: number, latestVersion: string, license: string, websiteUrl: string} | null>} Repository metadata or null if failed
 */
export async function fetchRepositoryMetadata(owner, repo) {
  try {
    // Fetch basic repository info
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Summarizer/1.0'
      }
    });

    if (!repoResponse.ok) {
      console.warn(`Failed to fetch repo metadata: ${repoResponse.status}`);
      return null;
    }

    const repoData = await repoResponse.json();

    // Fetch latest release/tag
    let latestVersion = 'N/A';
    try {
      const releasesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Summarizer/1.0'
        }
      });

      if (releasesResponse.ok) {
        const releaseData = await releasesResponse.json();
        latestVersion = releaseData.tag_name || releaseData.name || 'N/A';
      }
    } catch (releaseError) {
      console.warn('Failed to fetch latest release:', releaseError);
    }

    // Extract license and website information
    const license = repoData.license?.name || 'Not specified';
    const websiteUrl = repoData.homepage || 'Not specified';

    return {
      stars: repoData.stargazers_count || 0,
      latestVersion,
      license,
      websiteUrl
    };
  } catch (error) {
    console.error('Error fetching repository metadata:', error);
    return null;
  }
}
