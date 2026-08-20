import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ✅ VÉRIFICATION FORCÉE POUR VOIR CE QUI MANQUE
if (!url || !key) {
  console.error("🚨 ERREUR CRITIQUE : Variables d'environnement manquantes !");
  console.error("1. Vérifie que le fichier s'appelle bien '.env.local' (avec le point au début)");
  console.error("2. Vérifie qu'il est à la RACINE du dossier afrifan-admin (à côté de package.json)");
  console.error("Valeur URL lue :", url);
  console.error("Valeur KEY lue :", key);
  throw new Error("Supabase URL ou Key manquante. Vérifie ton fichier .env.local");
}

// Client normal
export const supabase = createClient(url, key)

// Client ADMIN
export const supabaseAdmin = createClient(
  url,
  serviceKey || key, // Fallback pour éviter le crash en local si la clé service est absente
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)