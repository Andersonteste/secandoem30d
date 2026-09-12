import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { guardAi } from "../_shared/admin.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const authHeader = req.headers.get('Authorization');
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Get user info
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    );

    const guard = await guardAi(req, "suggest-recipes-from-ingredients", corsHeaders);
    if (guard.deny) return guard.deny;
    const user = guard.user;

    console.log('Generating recipes with AI for ingredients:', ingredients);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: `Você é um nutricionista especializado em receitas fitness. Com base nestes ingredientes disponíveis: ${ingredients}

Crie EXATAMENTE 3 receitas fitness completas e saudáveis. Para cada receita, forneça:
- Nome atrativo e criativo
- Lista completa de ingredientes com quantidades
- Modo de preparo passo a passo (numerado)
- Tempo de preparo aproximado
- Calorias estimadas por porção
- Macronutrientes (proteínas, carboidratos, gorduras)
- Rendimento (quantas porções)

IMPORTANTE: 
- Use principalmente os ingredientes fornecidos
- Se precisar adicionar ingredientes básicos (sal, azeite, água), pode incluir
- Priorize receitas que combinem com emagrecimento e alimentação saudável
- Varie os tipos de receita (ex: uma principal, uma lanche, uma sobremesa fit)

Retorne APENAS um objeto JSON válido (sem markdown, sem explicações extras) com este formato exato:
{
  "receitas": [
    {
      "nome": "Nome da Receita",
      "ingredientes": [
        "100g de ingrediente 1",
        "2 colheres de ingrediente 2"
      ],
      "modo_preparo": [
        "Passo 1 detalhado",
        "Passo 2 detalhado"
      ],
      "tempo_preparo_minutos": 30,
      "calorias_por_porcao": 350,
      "macros": {
        "proteinas": "25g",
        "carboidratos": "40g",
        "gorduras": "8g"
      },
      "rendimento": "2 porções"
    }
  ]
}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de uso excedido. Tente novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log('AI response:', content);

    let recipesData;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      recipesData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error("Failed to parse recipes data from AI");
    }

    // Save to database
    const { error: insertError } = await supabaseClient
      .from('receitas_geradas_ia')
      .insert({
        user_id: user.id,
        ingredientes_input: ingredients,
        receitas_geradas: recipesData,
        favorita: false
      });

    if (insertError) {
      console.error('Error saving recipes:', insertError);
      // Continue even if save fails
    }

    return new Response(
      JSON.stringify({ success: true, data: recipesData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error generating recipes:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Erro ao gerar receitas" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
