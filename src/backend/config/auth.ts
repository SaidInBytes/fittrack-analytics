import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/backend/config/db'
import UserModel from '@/backend/models/User'

const resolvedAuthSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET
const devSharedAccess = {
  id: '000000000000000000000001',
  email: process.env.DEMO_USER_EMAIL ?? 'shared-access@fittrack.app',
  password: process.env.DEMO_USER_PASSWORD ?? 'shared-access-only',
  name: process.env.DEMO_USER_NAME ?? 'Shared Access',
}

if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`
}

if (process.env.NODE_ENV === 'production' && !resolvedAuthSecret) {
  throw new Error('Missing NEXTAUTH_SECRET (or AUTH_SECRET) for NextAuth in production.')
}

// NextAuth credentials strategy with JWT session enrichment for user id.
export const authOptions: NextAuthOptions = {
  secret: resolvedAuthSecret,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // Verifies email/password against MongoDB and returns the session identity.
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials')
        }

        const email = credentials.email.trim().toLowerCase()
        const password = credentials.password

        if (
          process.env.NODE_ENV !== 'production' &&
          email === devSharedAccess.email &&
          password === devSharedAccess.password
        ) {
          return {
            id: devSharedAccess.id,
            name: devSharedAccess.name,
            email: devSharedAccess.email,
          }
        }

        await connectDB()
        const user = await UserModel.findOne({ email }).select('+password')

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // Persists user id into the JWT at sign-in time.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    // Exposes token id on session.user for authenticated route handlers.
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
      }
      return session
    },
  },
}
