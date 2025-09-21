/**
 * Interface for API key search operations
 */
export class ApiKeySearchService {
  /**
   * Search for an API key by its value
   * @param {string} keyValue - The API key value to search for
   * @returns {Promise<Object|null>} - The API key data or null if not found
   * @throws {Error} - If search fails
   */
  async searchApiKey(keyValue) {
    throw new Error('Method not implemented');
  }
}

/**
 * Supabase implementation of API key search service
 */
export class SupabaseApiKeySearchService extends ApiKeySearchService {
  constructor(supabaseClient) {
    super();
    this.supabase = supabaseClient;
  }

  async searchApiKey(keyValue) {
    if (!keyValue || typeof keyValue !== 'string') {
      throw new Error('API key value is required and must be a string');
    }

    try {
      const { data, error } = await this.supabase
        .from('api_keys')
        .select('*')
        .eq('key_value', keyValue.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error searching API key:', error);
      throw new Error(`Failed to search API key: ${error.message}`);
    }
  }
}

/**
 * Mock implementation for testing or fallback scenarios
 */
export class MockApiKeySearchService extends ApiKeySearchService {
  constructor(mockData = []) {
    super();
    this.mockData = mockData;
  }

  async searchApiKey(keyValue) {
    if (!keyValue || typeof keyValue !== 'string') {
      throw new Error('API key value is required and must be a string');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const trimmedKey = keyValue.trim();
    return this.mockData.find(key => key.key_value === trimmedKey) || null;
  }
}
