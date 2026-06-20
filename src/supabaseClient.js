import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bohlxagrtpjvqrgkonlo.supabase.co";
const supabaseAnonKey = "AQUI_PEGARAS_LA_PUBLISHABLE_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
