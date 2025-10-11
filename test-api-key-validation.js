// Test script to verify API key validation is working
// You can run this to test if your API key validation is working correctly

const http = require('http')

const VALIDATE_API_URL = 'http://localhost:3000/api/validate-api-key'
const GITHUB_API_URL = 'http://localhost:3000/api/github-summarizer'

// Test 1: GET request to validate-api-key endpoint (should return API info)
console.log('=== Test 1: GET request to validate-api-key ===')
const getValidateReq = http.request(VALIDATE_API_URL, { method: 'GET' }, (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => {
    console.log('Status:', res.statusCode)
    try {
      const response = JSON.parse(data)
      console.log('Response:', JSON.stringify(response, null, 2))
    } catch (e) {
      console.log('Raw response:', data)
    }
  })
})

getValidateReq.on('error', (err) => {
  console.error('GET request to validate-api-key failed:', err.message)
})

getValidateReq.end()

// Test 2: POST request to validate-api-key without API key (should return 400)
console.log('\n=== Test 2: POST request to validate-api-key without API key ===')
const postValidateData = JSON.stringify({})

const postValidateReq = http.request(VALIDATE_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postValidateData)
  }
}, (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => {
    console.log('Status:', res.statusCode)
    try {
      const response = JSON.parse(data)
      console.log('Response:', JSON.stringify(response, null, 2))
    } catch (e) {
      console.log('Raw response:', data)
    }
  })
})

postValidateReq.on('error', (err) => {
  console.error('POST request to validate-api-key failed:', err.message)
})

postValidateReq.write(postValidateData)
postValidateReq.end()

// Test 3: POST request to validate-api-key with invalid API key (should return 401)
console.log('\n=== Test 3: POST request to validate-api-key with invalid API key ===')
const postValidateInvalid = JSON.stringify({
  apiKey: 'invalid-api-key-12345'
})

const postValidateInvalidReq = http.request(VALIDATE_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postValidateInvalid)
  }
}, (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => {
    console.log('Status:', res.statusCode)
    try {
      const response = JSON.parse(data)
      console.log('Response:', JSON.stringify(response, null, 2))
    } catch (e) {
      console.log('Raw response:', data)
    }
  })
})

postValidateInvalidReq.on('error', (err) => {
  console.error('POST request to validate-api-key failed:', err.message)
})

postValidateInvalidReq.write(postValidateInvalid)
postValidateInvalidReq.end()

// Test 4: GET request to github-summarizer endpoint (should return API info)
console.log('\n=== Test 4: GET request to github-summarizer ===')
const getGithubReq = http.request(GITHUB_API_URL, { method: 'GET' }, (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => {
    console.log('Status:', res.statusCode)
    try {
      const response = JSON.parse(data)
      console.log('Response:', JSON.stringify(response, null, 2))
    } catch (e) {
      console.log('Raw response:', data)
    }
  })
})

getGithubReq.on('error', (err) => {
  console.error('GET request to github-summarizer failed:', err.message)
})

getGithubReq.end()

// Test 5: POST request to github-summarizer without API key (should return 400)
console.log('\n=== Test 5: POST request to github-summarizer without API key ===')
const postGithubData = JSON.stringify({})

const postGithubReq = http.request(GITHUB_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postGithubData)
  }
}, (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => {
    console.log('Status:', res.statusCode)
    try {
      const response = JSON.parse(data)
      console.log('Response:', JSON.stringify(response, null, 2))
    } catch (e) {
      console.log('Raw response:', data)
    }
  })
})

postGithubReq.on('error', (err) => {
  console.error('POST request to github-summarizer failed:', err.message)
})

postGithubReq.write(postGithubData)
postGithubReq.end()

// Test 6: POST request to github-summarizer with invalid API key (should return 401)
console.log('\n=== Test 6: POST request to github-summarizer with invalid API key ===')
const postGithubInvalid = JSON.stringify({
  apiKey: 'invalid-api-key-12345'
})

const postGithubInvalidReq = http.request(GITHUB_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postGithubInvalid)
  }
}, (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => {
    console.log('Status:', res.statusCode)
    try {
      const response = JSON.parse(data)
      console.log('Response:', JSON.stringify(response, null, 2))
    } catch (e) {
      console.log('Raw response:', data)
    }
  })
})

postGithubInvalidReq.on('error', (err) => {
  console.error('POST request to github-summarizer failed:', err.message)
})

postGithubInvalidReq.write(postGithubInvalid)
postGithubInvalidReq.end()
