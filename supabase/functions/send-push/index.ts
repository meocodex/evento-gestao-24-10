import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, title, body, url } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar subscriptions do usuário
    const { data: subscriptions, error } = await supabaseClient
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId);

    if (error) throw error;
    if (!subscriptions || subscriptions.length === 0) {
      return new Response('No subscriptions found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    const payload = JSON.stringify({ title, body, url });
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');

    if (!VAPID_PRIVATE_KEY || !VAPID_PUBLIC_KEY) {
      throw new Error('VAPID keys not configured');
    }

    // Enviar para todas as subscriptions
    const promises = subscriptions.map(async (sub) => {
      try {
        const subscription = sub.subscription as any;
        
        const response = await fetch(subscription.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TTL': '86400',
            'Content-Encoding': 'aes128gcm',
          },
          body: payload
        });

        if (!response.ok) {
          console.error('Push failed:', await response.text());
        }
      } catch (error) {
        console.error('Error sending push:', error);
      }
    });

    await Promise.all(promises);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-push:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
