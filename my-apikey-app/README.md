# GitHub Repository Summarizer API

A Next.js application that provides API key management and GitHub repository summarization using AI (Gemini 2.5 Pro) and Supabase for data storage.

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

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   GOOGLE_API_KEY=your-google-gemini-api-key
   ```

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
  "modelUsed": "gemini-2.5-pro",
  "readmeSource": "https://raw.githubusercontent.com/owner/repo/main/README.md",
  "githubSummary": "Detailed summary of the repository..."
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
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_API_KEY`

3. **Deploy**
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
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ |
| `GOOGLE_API_KEY` | Google AI API key for Gemini | ✅ |

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
3. **Build errors**: Run `npm install` to ensure all dependencies are installed

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
