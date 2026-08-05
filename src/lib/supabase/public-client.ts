import "server-only";

import { createClient } from "@supabase/supabase-js";

let publicClient: ReturnType<typeof createClient> | null = null;

export function getPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url && !publishableKey) {
    return null;
  }

  if (!url || !publishableKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY를 함께 설정해야 합니다.");
  }

  publicClient ??= createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return publicClient;
}

export function getMediaPublicUrl(storagePath: string) {
  const client = getPublicSupabaseClient();

  if (!client) {
    return storagePath;
  }

  const bucket = process.env.SUPABASE_MEDIA_BUCKET?.trim() || "media";
  return client.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
}
