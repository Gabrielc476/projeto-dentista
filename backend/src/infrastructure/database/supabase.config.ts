import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseConfig {
    private static instance: SupabaseClient;

    static getInstance(): SupabaseClient {
        if (!this.instance) {
            const supabaseUrl = process.env.SUPABASE_URL || '';
            const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Supabase URL and Anon Key must be provided');
            }

            this.instance = createClient(supabaseUrl, supabaseKey);
        }

        return this.instance;
    }
}
