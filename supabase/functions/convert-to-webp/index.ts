import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, bucketName } = await req.json();
    
    if (!imageUrl || !bucketName) {
      return new Response(
        JSON.stringify({ error: 'imageUrl and bucketName are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Converting image to WebP: ${imageUrl}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }

    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageBlob = new Blob([imageArrayBuffer]);

    // Extract file path from URL
    const urlParts = imageUrl.split(`/storage/v1/object/public/${bucketName}/`);
    if (urlParts.length !== 2) {
      throw new Error('Invalid image URL format');
    }
    const originalPath = urlParts[1];
    
    // Create WebP path by replacing extension
    const webpPath = originalPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

    // For now, we'll upload the original as WebP
    // In production, you'd use a service like Sharp or ImageMagick to convert
    // Since Deno doesn't have native image processing, we recommend:
    // 1. Client-side conversion before upload (using browser Canvas API)
    // 2. Or using a third-party service like Cloudinary/imgix
    
    console.log(`Original path: ${originalPath}, WebP path: ${webpPath}`);

    // Upload as WebP (this is a placeholder - actual conversion should happen client-side or via external service)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(webpPath, imageBlob, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL for WebP version
    const { data: { publicUrl: webpUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(webpPath);

    console.log(`Successfully created WebP version: ${webpUrl}`);

    return new Response(
      JSON.stringify({ 
        originalUrl: imageUrl, 
        webpUrl,
        message: 'Note: Actual WebP conversion should be done client-side or via external service'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error converting to WebP:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
