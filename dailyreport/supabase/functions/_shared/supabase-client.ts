// Supabase client for server-side (Edge Functions)
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://xheemzuzvxizyenbcvub.supabase.co';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZWVtenV6dnhpenllbmJjdnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NDc1NzUsImV4cCI6MjA2MzEyMzU3NX0.hZV8_y0Ep-mRwgkr-hbSm35dmbG7j69M7ypvqYjsZAA';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Create and export Supabase client
export const createSupabaseClient = (authHeader?: string) => {
  // Use passed in authHeader or supabase service role key
  const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  const options = authHeader
    ? {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    : undefined;

  return createClient(SUPABASE_URL, supabaseKey, options);
};

// Export the admin supabase client
export const createAdminClient = () =>
  createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || ''); 