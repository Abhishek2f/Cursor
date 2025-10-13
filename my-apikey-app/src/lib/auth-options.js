import GoogleProvider from "next-auth/providers/google"
import { UserService } from "@/lib/userService"

/**
 * NextAuth configuration options
 * Shared across auth route and other API routes that need session verification
 */
export const authOptions = {
  // Enhanced security configuration
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'consent',
          access_type: 'offline',
          // Additional security parameters
          response_type: 'code',
        },
      },
      // Enhanced security checks
      checks: ['pkce'], // Enable PKCE for enhanced security
    }),
  ],
  pages: {
    signIn: '/',
    error: '/',
  },
  // Enhanced session security configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  // Enhanced cookie security for production
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // 1 hour
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // 1 hour
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Save or update user in database on successful sign in
        if (user && account?.provider === 'google') {
          const userData = {
            email: user.email,
            name: user.name,
            image: user.image,
            id: user.id,
          }

          // Try to save user data - don't block authentication if it fails
          try {
            const result = await UserService.findOrCreateUser(userData)
            if (result) {
              console.log('✅ User data saved successfully to database')
            } else {
              console.log('⚠️ User data not saved (user may already exist)')
            }
          } catch (dbError) {
            console.error('❌ Error saving user to database (continuing with auth):', dbError.message)
            // Don't re-throw the error - continue with authentication
            // This ensures authentication works even if database is temporarily unavailable
          }
        }
        return true
      } catch (error) {
        console.error('❌ Error in signIn callback:', error)
        // Don't block sign in if callback fails
        return true
      }
    },
    async session({ session, token, user }) {
      // Add user id to session and ensure image is included
      if (session?.user) {
        session.user.id = token.sub
        // If we have user data from the token, ensure image is included
        if (token.picture) {
          session.user.image = token.picture
        }
      }
      return session
    },
    async jwt({ token, user, account, profile }) {
      // Add user id and profile data to token on sign in
      if (user) {
        token.sub = user.id
        token.picture = user.image
        token.name = user.name
        token.email = user.email
      }
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET,

  // Enhanced security settings
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, ...message) {
      console.error(`[NextAuth Error] ${code}:`, ...message);
    },
    warn(code, ...message) {
      console.warn(`[NextAuth Warning] ${code}:`, ...message);
    },
    debug(code, ...message) {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[NextAuth Debug] ${code}:`, ...message);
      }
    },
  },

  // Enhanced security: Use secure defaults
  useSecureCookies: process.env.NODE_ENV === 'production',
  trustHost: process.env.NODE_ENV === 'production' ? true : false,

  // Additional security settings
  events: {
    async signIn(message) {
      console.log(`[NextAuth] User signed in:`, message.user?.email);
    },
    async signOut(message) {
      console.log(`[NextAuth] User signed out:`, message.token?.email);
    },
  },
}

