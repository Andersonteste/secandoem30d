import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipeId, recipeName, recipeCategory, recipeIngredients } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const authHeader = req.headers.get('Authorization');
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Verify user is admin
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if user is admin
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (!roles || roles.length === 0) {
      throw new Error("User is not authorized to generate images");
    }

    console.log(`Generating image for recipe: ${recipeName} (${recipeCategory})`);

    // Build a descriptive prompt for the food image
    const ingredientsList = Array.isArray(recipeIngredients) 
      ? recipeIngredients.slice(0, 5).join(', ')
      : '';
    
    const categoryPrompts: Record<string, string> = {
      'Cafe': 'breakfast table setting, morning light, cozy atmosphere',
      'Almoco': 'lunch plate, elegant presentation, natural daylight',
      'Jantar': 'dinner setting, warm ambient lighting, sophisticated plating',
      'Lanche': 'snack presentation, casual setting, appetizing',
      'Doces': 'dessert photography, sweet treats, elegant presentation',
      'Salgados': 'savory snacks, appetizing presentation, Brazilian food',
      'Sucos': 'fresh juice, vibrant colors, refreshing drink photography',
      'Chás': 'tea photography, cozy setting, steam rising, relaxing atmosphere'
    };

    const categoryStyle = categoryPrompts[recipeCategory] || 'food photography, appetizing presentation';

    const prompt = `Professional food photography of ${recipeName}. ${categoryStyle}. The dish contains ${ingredientsList}. High-quality, appetizing, vibrant colors, shallow depth of field, natural lighting, clean background, 4K quality, Instagram-worthy food photography style. Ultra high resolution.`;

    console.log("Image generation prompt:", prompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageData) {
      throw new Error("No image in AI response");
    }

    // Upload image to Supabase Storage
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    const fileName = `recipe-${recipeId}-${Date.now()}.webp`;
    
    // Use service role for storage upload
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if bucket exists, create if not
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'recipe-images');
    
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket('recipe-images', {
        public: true,
        allowedMimeTypes: ['image/webp', 'image/png', 'image/jpeg']
      });
      console.log("Created recipe-images bucket");
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from('recipe-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('recipe-images')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log("Image uploaded successfully:", publicUrl);

    // Update recipe with new image URL
    const { error: updateError } = await supabaseAdmin
      .from('recipes')
      .update({ photo_url: publicUrl })
      .eq('id', recipeId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error(`Failed to update recipe: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, imageUrl: publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error generating recipe image:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Erro ao gerar imagem" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
