require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase connection...');
console.log('🌍 Environment variables:');
console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Loaded' : '❌ Missing');
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY length:', supabaseAnonKey?.length || 0);

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Environment variables not loaded properly');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n📊 Testing database connection...');

    // Test basic connection
    const { data, error } = await supabase
      .from('api_keys')
      .select('count', { count: 'exact' });

    if (error) {
      console.error('❌ Database connection error:', error.message);
      console.error('Error details:', error);
      return false;
    }

    console.log('✅ Database connected successfully!');
    console.log('📊 Current API keys count:', data?.length || 0);

    // Test creating a test API key
    console.log('\n🔧 Testing API key creation...');
    const testKeyData = {
      name: 'Test Key - Connection Test',
      description: 'Testing connection',
      key: 'test-' + Math.random().toString(36).substr(2, 16)
    };

    const { data: insertData, error: insertError } = await supabase
      .from('api_keys')
      .insert([{
        name: testKeyData.name,
        description: testKeyData.description,
        key_value: testKeyData.key,
        usage_count: 0,
        created_at: new Date().toISOString(),
        is_active: true
      }])
      .select()
      .single();

    if (insertError) {
      console.error('❌ API key creation error:', insertError.message);
      console.error('Error details:', insertError);
      return false;
    }

    console.log('✅ API key created successfully!');
    console.log('🆔 Created key ID:', insertData.id);

    // Clean up - delete the test key
    await supabase
      .from('api_keys')
      .delete()
      .eq('id', insertData.id);

    console.log('🗑️ Test key cleaned up');
    return true;

  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    console.error('Full error:', err);
    return false;
  }
}

testConnection();
