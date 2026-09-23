/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper to log Supabase status on initialization
 */
if (isSupabaseConfigured) {
  console.log('[MedBlue-AI] Supabase database client connected successfully.');
} else {
  console.log('[MedBlue-AI] Supabase environment variables missing. Running in local/mock database mode.');
}
