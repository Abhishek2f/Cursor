import { supabase } from '@/lib/supabase'

export class UserService {
  /**
   * Find or create a user based on email and provider data
   * @param {Object} userData - User data from authentication provider
   * @returns {Object} User record from database
   */
  static async findOrCreateUser(userData) {
    if (!supabase) {
      console.warn('Supabase not configured. Skipping user tracking.')
      return null
    }

    try {
      const { email, name, image, id: providerId } = userData
      console.log('Attempting to save user:', email)

      // First, try to find existing user
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle()

      if (findError) {
        console.error('Error finding user:', findError)
        // Don't throw error - continue with creation attempt
        console.log('Continuing with user creation despite find error')
        // For RLS errors, we might want to continue anyway
        if (findError.code === '42501') {
          console.log('RLS policy error - this might be expected during registration')
        }
      }

      if (existingUser) {
        console.log('Updating existing user:', email)
        // Update existing user with latest info and increment login count
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            name,
            image,
            provider_id: providerId,
            last_login: new Date().toISOString(),
            login_count: (existingUser.login_count || 0) + 1,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('email', email)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating user:', updateError)
          // Don't throw error - return existing user data
          console.log('❌ User update failed, but returning existing user data')
          // For RLS errors, this might be expected
          if (updateError.code === '42501') {
            console.log('RLS policy blocking update - returning existing data')
          }
          return existingUser
        }

        console.log('✅ User updated successfully:', updatedUser.email)
        return updatedUser
      } else {
        console.log('Creating new user:', email)
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email,
            name,
            image,
            provider_id: providerId,
            provider: 'google',
            plan: 'Free',
            first_login: new Date().toISOString(),
            last_login: new Date().toISOString(),
            login_count: 1,
            is_active: true
          })
          .select()
          .single()

        if (createError) {
          console.error('❌ Error creating user:', createError)
          // Don't throw error - return null so authentication can continue
          console.log('❌ User creation failed, but continuing with authentication')
          // For RLS errors, this is expected during registration
          if (createError.code === '42501') {
            console.log('RLS policy blocking creation - this should be fixed by updated policies')
          }
          return null
        }

        console.log('✅ New user created successfully:', newUser.email)
        return newUser
      }
    } catch (error) {
      console.error('❌ Error in findOrCreateUser:', error)
      // Don't throw error - return null so authentication can continue
      console.log('Returning null to allow authentication to continue')
      return null
    }
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Object|null} User record or null
   */
  static async getUserByEmail(email) {
    if (!supabase) {
      console.warn('Supabase not configured. Cannot fetch user.')
      return null
    }

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // User not found
        }
        console.error('Error fetching user:', error)
        return null
      }

      return user
    } catch (error) {
      console.error('Error in getUserByEmail:', error)
      return null
    }
  }

  /**
   * Get all users (for admin purposes)
   * @returns {Array} Array of user records
   */
  static async getAllUsers() {
    if (!supabase) {
      console.warn('Supabase not configured. Cannot fetch users.')
      return []
    }

    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('last_login', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        return []
      }

      return users || []
    } catch (error) {
      console.error('Error in getAllUsers:', error)
      return []
    }
  }

  /**
   * Update user information
   * @param {string} email - User email
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated user record or null
   */
  static async updateUser(email, updates) {
    if (!supabase) {
      console.warn('Supabase not configured. Cannot update user.')
      return null
    }

    try {
      const { data: user, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select()
        .single()

      if (error) {
        console.error('Error updating user:', error)
        return null
      }

      return user
    } catch (error) {
      console.error('Error in updateUser:', error)
      return null
    }
  }

  /**
   * Update user information by ID
   * @param {string} userId - User ID (UUID)
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated user record or null
   */
  static async updateUserById(userId, updates) {
    if (!supabase) {
      console.warn('Supabase not configured. Cannot update user.')
      return null
    }

    try {
      const { data: user, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user by ID:', error)
        return null
      }

      return user
    } catch (error) {
      console.error('Error in updateUserById:', error)
      return null
    }
  }
}
