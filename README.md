# GitVault - Secure API Key Management

A Next.js application that provides secure API key management with Google authentication and GitHub repository summarization using AI (Gemini 2.5 Pro) and Supabase for data storage.

## Features

- 🔐 **API Key Management**: Secure API key creation and validation
- 🤖 **AI-Powered Summarization**: Summarize GitHub repositories using Gemini 2.5 Pro
- 📊 **Usage Analytics**: Track API key usage and analytics
- 🚀 **Production Ready**: Optimized for deployment with security best practices

## Quick Start

### Prerequisites

- Node.js 18+
- A Supabase project
- A Google AI API key (for Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd my-apikey-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor

4. **Configure Google OAuth (Required for Authentication)**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Google+ API
   - Go to "APIs & Services" → "OAuth consent screen"
   - Configure for "External" users and fill in required details
   - Add yourself as a test user
   - Go to "APIs & Services" → "Credentials"
   - Create "OAuth 2.0 Client ID" with type "Web application"
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy the Client ID and Client Secret

5. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:
   ```env
   # Google OAuth (Required)
   NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>

   # Supabase (Optional - for dashboard features)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

   # Google AI (Required for GitHub summarization)
   GOOGLE_API_KEY=your-google-gemini-api-key

   # GitHub (Recommended - increases rate limit)
   GITHUB_TOKEN=your-github-token-here
   ```

   > **⚠️ GitHub Token Setup (Highly Recommended)**
   >
   > To avoid rate limiting, set up a GitHub Personal Access Token:
   > 1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
   > 2. Click "Generate new token (classic)"
   > 3. Select scope: `public_repo`
   > 4. Copy the token and add it to your `.env.local` file
   >
   > This increases your rate limit from 60 to 5,000 requests per hour!

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Dashboard: http://localhost:3000
   - API Keys Management: http://localhost:3000/api-keys

## API Documentation

### GitHub Summarizer API

**Endpoint:** `POST /api/github-summarizer`

**Authentication:** Bearer token with your API key

**Request Body:**
```json
{
  "githubUrl": "https://github.com/owner/repository"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Repository summarized successfully.",
  "modelUsed": "gemini-2.0-flash-lite",
  "readmeSource": "https://raw.githubusercontent.com/owner/repo/main/README.md",
  "githubSummary": "Detailed summary of the repository...",
  "cool_facts": [
    "Interesting fact 1 about the project",
    "Notable feature or achievement"
  ],
  "tools_used": [
    "JavaScript",
    "React",
    "Node.js",
    "PostgreSQL"
  ],
  "stars": 1234,
  "latest_version": "v2.1.0",
  "license_type": "MIT License",
  "website_url": "https://example.com",
  "usage": {
    "usage": 15,
    "limit": 100,
    "remaining": 85
  }
}
```

### API Key Management

**Create API Key:** `POST /api-keys` (through web interface)

## Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   vercel --prod
   ```

2. **Set Environment Variables** in Vercel dashboard:
   - `NEXTAUTH_SECRET` (generate new secret for production)
   - `NEXTAUTH_URL` (your production domain)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_API_KEY`
   - `GITHUB_TOKEN` (⚠️ **Highly Recommended** - prevents rate limiting)
   - `NEXT_PUBLIC_SUPABASE_URL` (optional)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional)

   > **⚠️ Important: GitHub Token Setup**
   >
   > To avoid "README not found" errors due to rate limiting:
   > 1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
   > 2. Generate a Personal Access Token with `public_repo` scope
   > 3. Add `GITHUB_TOKEN=your_token_here` in Vercel environment variables
   > 4. This increases rate limit from 60 to 5,000 requests/hour!

3. **Update Google OAuth Settings** for production:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Update your OAuth client with production redirect URI: `https://yourdomain.com/api/auth/callback/google`
   - Submit for verification if needed (for production apps)

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- **Railway**
- **Render**
- **Netlify**
- **AWS Amplify**
- **Self-hosted**

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_SECRET` | NextAuth.js secret for session encryption | ✅ |
| `NEXTAUTH_URL` | Base URL of your application | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ✅ |
| `GOOGLE_API_KEY` | Google AI API key for Gemini | ✅ |
| `GITHUB_TOKEN` | GitHub personal access token (recommended) | ⚠️ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (optional) | ❌ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (optional) | ❌ |

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── github-summarizer/
│   │   └── validate-api-key/
│   ├── api-keys/          # API key management page
│   ├── dashboard/         # Main dashboard
│   └── ...
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
└── lib/                   # Utility libraries
    ├── auth.js            # API key validation
    ├── supabase.js        # Database client
    └── apiKeyService.js   # API key operations
```

## Security Features

- ✅ **API Key Authentication**: Secure token-based authentication
- ✅ **Rate Limiting**: 10 requests per minute per API key
- ✅ **Input Validation**: Comprehensive URL and input validation
- ✅ **Error Handling**: Proper error responses without information leakage
- ✅ **Environment Variables**: Sensitive data not hardcoded
- ✅ **Security Headers**: XSS protection, content type validation

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini 2.5 Pro
- **Language:** TypeScript/JavaScript
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (recommended)

## Troubleshooting

### Common Issues

1. **"Invalid API key"**: Ensure your API key exists in the database and is active
2. **"README not found"**: Check if the GitHub repository exists and has a README.md file
3. **"Rate limited by GitHub API"**: This happens when you exceed GitHub's API rate limit (60 requests/hour without authentication). Configure `GITHUB_TOKEN` environment variable for higher limits (5,000 requests/hour)
4. **Build errors**: Run `npm install` to ensure all dependencies are installed

### Logs

Check the console logs for detailed error information. The app provides comprehensive logging for debugging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
