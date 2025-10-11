# Postman Troubleshooting Guide

## ✅ API is Working Correctly

I've tested your API endpoint directly and it works perfectly with your API key `kvp-sy933zt2neq`. The test shows:

- ✅ API key found and validated
- ✅ Returns 200 status with success message
- ✅ Usage count incremented correctly

## 🔧 Postman Configuration Issues

The "Invalid JSON in request body" error suggests a Postman configuration problem. Here are the most common issues and solutions:

### 1. **HTTP Method**
- ✅ Make sure you're using **POST** method (not GET)
- ❌ Don't use GET - that returns API documentation

### 2. **Headers Configuration**
**Required Headers:**
```
Content-Type: application/json
```

**Optional Headers:**
```
Authorization: Bearer kvp-sy933zt2neq
```

### 3. **Request Body Format**
**Option A: API Key in Body**
```json
{
  "apiKey": "kvp-sy933zt2neq"
}
```

**Option B: API Key in Authorization Header**
```json
{
  "anyOtherData": "value"
}
```
*(with `Authorization: Bearer kvp-sy933zt2neq` header)*

**Option C: Postman API Key Authorization**
- Use "API Key" auth type in Postman
- Key: `apikey`
- Value: `kvp-sy933zt2neq`
- Add to: `Header`

### 4. **Common Postman Mistakes**

#### ❌ **Wrong Body Type**
- Make sure you're using "raw" body with JSON, not "form-data" or "x-www-form-urlencoded"

#### ❌ **Missing Content-Type Header**
- Postman sometimes doesn't set this automatically
- Go to Headers tab and add: `Content-Type: application/json`

#### ❌ **Extra Spaces or Characters**
- Make sure your API key is exactly: `kvp-sy933zt2neq`
- No extra spaces, quotes, or characters

#### ❌ **Copy-Paste Issues**
- The API key might have invisible characters when copied
- Try typing it manually or copy from a plain text source

### 5. **Step-by-Step Postman Setup**

**Method 1: API Key Authorization (Easiest)**
1. **Create New Request**
   - Method: POST
   - URL: `http://localhost:3000/api/github-summarizer`

2. **Set Authorization**
   - Click "Authorization" tab
   - Select "API Key" from dropdown
   - Key: `apikey`
   - Value: `kvp-sy933zt2neq`
   - Add to: `Header`

3. **Send Request**
   - Click "Send"
   - Should return 200 with success message

**Method 2: Bearer Token**
1. **Create New Request**
   - Method: POST
   - URL: `http://localhost:3000/api/github-summarizer`

2. **Set Authorization**
   - Click "Authorization" tab
   - Select "Bearer Token" from dropdown
   - Token: `kvp-sy933zt2neq`

3. **Send Request**
   - Click "Send"
   - Should return 200 with success message

**Method 3: Request Body**
1. **Create New Request**
   - Method: POST
   - URL: `http://localhost:3000/api/github-summarizer`

2. **Add Headers**
   - Click "Headers" tab
   - Add: `Content-Type: application/json`

3. **Add Request Body**
   - Click "Body" tab
   - Select "raw"
   - Select "JSON" from dropdown
   - Enter:
   ```json
   {
     "apiKey": "kvp-sy933zt2neq"
   }
   ```

4. **Send Request**
   - Click "Send"
   - Should return 200 with success message

### 7. **Debugging Steps**

If still getting errors:

1. **Check Console Logs**: Look at your development server console for detailed error messages
2. **Test with curl**:
   ```bash
   curl -X POST http://localhost:3000/api/github-summarizer \
     -H "Content-Type: application/json" \
     -d '{"apiKey":"kvp-sy933zt2neq"}'
   ```
3. **Compare with Working Example**: The direct Node.js test I ran worked perfectly

### 8. **Still Not Working?**

If you're still getting the "Invalid JSON" error after trying all above:

1. **Share your Postman request details**:
   - Screenshot of your Postman configuration
   - The exact error message
   - Any console logs from the server

2. **Try a different API client**:
   - Use VS Code REST Client extension
   - Use curl command
   - Use another API client like Insomnia

## 🎯 Expected Success Response

When working correctly, you should get:
```json
{
  "success": true,
  "message": "API key validated successfully. GitHub summarization feature coming soon.",
  "apiKey": {
    "id": "002ccdb0-5c62-48ef-9f3a-50fc2345c3fa",
    "name": "api key 2",
    "description": "",
    "usage_count": 1,
    "last_used": "2025-09-27T05:26:07.315Z"
  }
}
```

The API is working perfectly - it's just a Postman configuration issue! 🚀
