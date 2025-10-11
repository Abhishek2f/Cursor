require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkApiKeys() {
  console.log('🔍 Checking existing API keys in database...');

  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*');

    if (error) {
      console.error('❌ Error fetching API keys:', error.message);
      return;
    }

    console.log(`📊 Found ${data.length} API key(s):`);
    data.forEach((key, index) => {
      console.log(`\n${index + 1}. Key Info:`);
      console.log(`   ID: ${key.id}`);
      console.log(`   Name: ${key.name}`);
      console.log(`   Key Value: ${key.key_value}`);
      console.log(`   Is Active: ${key.is_active}`);
      console.log(`   Usage Count: ${key.usage_count}`);
      console.log(`   Created: ${key.created_at}`);
    });

    // Check if the user's key exists
    const userKey = 'kvp-sy933zt2neq';
    const keyExists = data.some(key => key.key_value === userKey);

    console.log(`\n🔍 Checking for user's key '${userKey}':`);
    if (keyExists) {
      console.log('✅ Key exists in database!');
    } else {
      console.log('❌ Key NOT found in database!');
      console.log('💡 Available keys:');
      data.forEach(key => {
        console.log(`   - ${key.key_value} (${key.name})`);
      });
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkApiKeys();
