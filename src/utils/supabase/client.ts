/**
 * Supabase Browser Client (Vue/Vite)
 *
 * This is the client-side Supabase client for use in Vue components and Pinia stores.
 * Unlike the Next.js SSR pattern, Vite apps run entirely in the browser, so we use
 * the standard `createClient` from @supabase/supabase-js directly.
 *
 * Environment variables must be prefixed with VITE_ in Vite projects.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
      'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
