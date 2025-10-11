# API Testing Guide - GitHub Summarizer

## Overview
The `/api/github-summarizer` endpoint validates API keys and is ready for GitHub repository summarization.

## How to Test in Postman

### 1. GET Request (API Documentation)
- **Method**: GET
- **URL**: `http://localhost:3000/api/github-summarizer`
- **Headers**: None required
- **Body**: None
- **Expected Response**: API information and documentation

### 2. POST Request (API Key Validation)

**Method**: POST
**URL**: `http://localhost:3000/api/github-summarizer`

#### Option A: API Key in Authorization Header
- **Headers**:
  - `Authorization`: `Bearer YOUR_API_KEY_HERE`
  - `Content-Type`: `application/json`
- **Body**: Empty or any JSON (API key is read from header)

#### Option B: API Key in Request Body
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
  "apiKey": "YOUR_API_KEY_HERE"
}
```

### Expected Responses

#### Success (200) - Valid API Key
```json
{
  "success": true,
  "message": "API key validated successfully. GitHub summarization feature coming soon.",
  "apiKey": {
    "id": "...",
    "name": "API Key Name",
    "description": "API Key Description",
    "usage_count": 1,
    "last_used": "2025-09-27T10:35:00.000Z"
  }
}
```

#### Error (400) - Missing API Key
```json
{
  "error": "API key is required",
  "message": "Please provide an API key in the Authorization header (Bearer token) or in the request body as apiKey"
}
```

#### Error (401) - Invalid API Key
```json
{
  "error": "Invalid API key",
  "message": "The provided API key was not found or is invalid"
}
```

## Debugging Tips

1. **Check HTTP Method**: Make sure you're sending a POST request, not GET
2. **Check Console Logs**: The server logs detailed information about each request
3. **Verify API Key Exists**: Ensure your API key exists in the database
4. **Check Content-Type**: Use `application/json` for POST requests with body

## Troubleshooting

### Getting GET Response When Expecting POST Error?
This means you're accidentally sending a GET request. In Postman:
1. Check the HTTP method dropdown (should be POST)
2. Make sure the request isn't saved as a GET request
3. Try creating a new request

### API Key Not Found?
1. Check if the API key exists in your Supabase `api_keys` table
2. Verify the key value matches exactly (case-sensitive)
3. Check if the API key is marked as active (`is_active: true`)

## Running the Test Script

You can also run the provided test script:
```bash
node test-api-key-validation.js
```

This will test all scenarios and show you the expected behavior.
