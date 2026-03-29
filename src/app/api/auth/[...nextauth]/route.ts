import NextAuth from 'next-auth'
import { authOptions } from '@/backend/config/auth'

// Reuses the same NextAuth handler for both GET and POST auth callbacks.
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
