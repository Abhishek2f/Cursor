// Simple debug to load environment variables manually
const fs = require('fs');
const path = require('path');

console.log('🔍 Manual environment loading test...');

// Try to read .env.local file
try {
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');

  console.log('📁 File exists at:', envPath);
  console.log('📝 File content:');
  console.log(envContent);

  // Parse the file manually
  const lines = envContent.split('\n');
  let supabaseUrl = null;
  let supabaseKey = null;

  lines.forEach(line => {
    line = line.trim();
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1];
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1];
    }
  });

  console.log('\n🔍 Parsed values:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY length:', supabaseKey?.length || 0);

  if (supabaseUrl && supabaseKey) {
    console.log('✅ Environment variables loaded successfully!');
  } else {
    console.log('❌ Could not parse environment variables');
  }

} catch (error) {
  console.error('❌ Error reading .env.local file:', error.message);
}
