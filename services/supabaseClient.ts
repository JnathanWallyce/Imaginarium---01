
import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Authentication features will not work.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Updates the user's stored Gemini API Key in their metadata.
 * We use user_metadata to store this securely attached to the user profile.
 */
export const updateUserApiKey = async (apiKey: string) => {
    const { data, error } = await supabase.auth.updateUser({
        data: { gemini_api_key: apiKey }
    });

    if (error) throw error;
    return data;
};

/**
 * Retrieves the user's stored Gemini API Key from metadata.
 */
export const getUserApiKey = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return user.user_metadata?.gemini_api_key || null;
};
