import { validateApiKey } from '@/lib/auth'
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from '@langchain/google-genai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
import { createRetrievalChain } from 'langchain/chains/retrieval'
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts'
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever'
import { HumanMessage, AIMessage } from '@langchain/core/messages'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { Document } from 'langchain/document'
import 'isomorphic-fetch'

export const runtime = 'nodejs'

// ---------- Model choices ----------
const CHAT_MODEL = 'gemini-2.5-pro'   // best quality for your task
// If you want speed > quality: const CHAT_MODEL = 'gemini-2.5-flash'
const EMBEDDING_MODEL = 'text-embedding-004'

// ---------- Safe LLM + Embeddings init ----------
let llm, embeddings
if (process.env.GOOGLE_API_KEY) {
  llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: CHAT_MODEL,            // IMPORTANT: use `model`, not `modelName`
    temperature: 0.2,
  })

  embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: EMBEDDING_MODEL,
  })
} else {
  console.warn(
    'GOOGLE_API_KEY is not set. The GitHub summarization feature will not work.'
  )
}

// ---------- Helpers ----------
function sanitizeRepo(repo) {
  // strip trailing .git and slashes
  return repo.replace(/\.git$/i, '').replace(/\/+$/, '');
}

function parseOwnerRepo(githubUrl) {
  try {
    const u = new URL(githubUrl);
    if (!u.hostname.endsWith('github.com')) return null;

    // Split the path and filter out empty segments
    const parts = u.pathname.split('/').filter(Boolean);

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

async function fetchReadme(owner, repo) {
  const roots = [
    'README.md',
    'Readme.md',
    'readme.md',
    'README.MD'
  ];
  const branches = ['main', 'master'];

  for (const branch of branches) {
    for (const fname of roots) {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${fname}`;
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim()) {
          return { url, text };
        }
      }
    }
  }

  return null;
}


/**
 * POST /api/github-summarizer
 */
// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map()

function checkRateLimit(apiKeyId) {
  const now = Date.now()
  const windowMs = 60000 // 1 minute
  const maxRequests = 10 // 10 requests per minute per API key

  if (!rateLimitMap.has(apiKeyId)) {
    rateLimitMap.set(apiKeyId, { count: 1, resetTime: now + windowMs })
    return true
  }

  const userLimit = rateLimitMap.get(apiKeyId)

  if (now > userLimit.resetTime) {
    // Reset window
    userLimit.count = 1
    userLimit.resetTime = now + windowMs
    return true
  }

  if (userLimit.count >= maxRequests) {
    return false
  }

  userLimit.count++
  return true
}

export async function POST(request) {
  try {
    // 1) Validate API key
    const authResult = await validateApiKey(request, { requireBody: false })
    if (!authResult.success) {
      return Response.json(
        { error: authResult.error, message: authResult.message },
        { status: authResult.status }
      )
    }

    // 2) Check rate limiting
    const apiKeyId = authResult.apiKey.id
    if (!checkRateLimit(apiKeyId)) {
      return Response.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
        },
        { status: 429 }
      )
    }

    // 3) Check model availability
    if (!llm || !embeddings) {
      return Response.json(
        {
          error: 'Service Unavailable',
          message:
            'Summarization service not configured. Set GOOGLE_API_KEY and restart the server.',
        },
        { status: 503 }
      )
    }

    // 4) Parse body
    let body = {}
    try {
      body = await request.json()
    } catch {
      // ignore — body is optional except for githubUrl
    }

    const { githubUrl } = body
    if (!githubUrl) {
      return Response.json(
        {
          error: 'GitHub URL is required',
          message: 'Provide a GitHub URL in the request body: { "githubUrl": "https://github.com/OWNER/REPO" }',
        },
        { status: 400 }
      )
    }

    // 5) Extract owner/repo
    const parsed = parseOwnerRepo(githubUrl)
    if (!parsed) {
      return Response.json(
        {
          error: 'Invalid GitHub URL',
          message:
            'Expected format: https://github.com/OWNER/REPO',
        },
        { status: 400 }
      )
    }
    const { owner, repo } = parsed

    // 6) Fetch README (main -> master)
    const readme = await fetchReadme(owner, repo)
    if (!readme) {
      return Response.json(
        {
          error: 'README not found',
          message:
            'README.md not found on branch main or master. Make sure it exists.',
        },
        { status: 404 }
      )
    }

    // 7) Create docs and split
    const docs = [new Document({ pageContent: readme.text, metadata: { source: readme.url } })]
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 20 })
    const splitDocs = await splitter.splitDocuments(docs)

    // 8) In-memory vector store + retriever
    const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings)
    const retriever = vectorStore.asRetriever({ k: 2 })

    // 9) History-aware retriever
    const historyAwarePrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder('chat_history'),
      ['user', '{input}'],
      [
        'user',
        'Given the above conversation, generate a search query to look up in order to get information relevant to the conversation',
      ],
    ])

    const historyAwareRetriever = await createHistoryAwareRetriever({
      llm,
      retriever,
      rephrasePrompt: historyAwarePrompt,
    })

    // 10) QA over retrieved context
    const ragPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        "You are a senior engineer. Summarize the project's README precisely and comprehensively using only this context:\n\n{context}",
      ],
      new MessagesPlaceholder('chat_history'),
      ['user', '{input}'],
    ])

    const combineDocs = await createStuffDocumentsChain({ llm, prompt: ragPrompt })
    const conversationalRag = await createRetrievalChain({
      retriever: historyAwareRetriever,
      combineDocsChain: combineDocs,
    })

    const result = await conversationalRag.invoke({
      chat_history: [
        new HumanMessage('Human: Summarize this Readme file in detail.'),
        new AIMessage('AI: Okay, I will summarize the Readme file in detail.'),
      ],
      input: 'Summarize this Readme file in detail.',
    })

    return Response.json({
      success: true,
      message: 'Repository summarized successfully.',
      modelUsed: CHAT_MODEL,
      readmeSource: readme.url,
      githubSummary: result?.answer ?? null,
    })
  } catch (error) {
    console.error('Error in github-summarizer API:', error)
    return Response.json(
      {
        error: 'Internal server error',
        message: error?.message ?? 'Unexpected error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/github-summarizer
 */
export async function GET() {
  return Response.json({
    name: 'GitHub Repository Summarizer API',
    version: '1.1.0',
    description: 'Summarizes a GitHub repo README using Gemini 2.5 + embeddings.',
    authentication: {
      required: true,
      methods: [
        'Authorization: Bearer <api_key>',
        'apikey: <api_key>',
        'x-api-key: <api_key>',
        'JSON body: { "apiKey": "<api_key>" }',
      ],
    },
    parameters: {
      githubUrl: 'GitHub repository URL, e.g. https://github.com/OWNER/REPO',
    },
    models: {
      chat: CHAT_MODEL,
      embeddings: EMBEDDING_MODEL,
    },
  })
}
