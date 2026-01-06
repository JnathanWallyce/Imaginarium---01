
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

console.log("Testing Supabase Connection...");
console.log("URL:", url);
console.log("Key:", key ? key.substring(0, 5) + "..." : "MISSING");

if (!url || !key) {
    console.error("Missing URL or Key");
    process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error("Connection Error:", error.message);
        } else {
            console.log("Connection Successful! Session can be retrieved (even if null).");
        }
    } catch (e: any) {
        console.error("Unexpected Error:", e.message);
    }
}

test();
