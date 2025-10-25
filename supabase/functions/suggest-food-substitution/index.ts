import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { food, quantity } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log('Generating food substitutions with AI...');

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
            content: `Você é um nutricionista especializado. Sugira substituições saudáveis para o seguinte alimento:
            
            Alimento: ${food}
            Quantidade: ${quantity}
            
            Retorne APENAS um objeto JSON válido (sem markdown, sem explicações extras) com este formato exato:
            {
              "substituicoes": [
                {
                  "nome": "Nome do alimento substituto",
                  "quantidade": "quantidade equivalente com unidade",
                  "motivo": "breve explicação do por que é uma boa substituição (máximo 50 caracteres)",
                  "calorias": "comparação calórica em relação ao original (ex: 'Similar', '+20%', '-15%')"
                }
              ]
            }
            
            Forneça 4-5 substituições variadas, considerando:
            - Equivalência nutricional (calorias e macros similares)
            - Disponibilidade comum no Brasil
            - Variação de tipos (integral, proteína alternativa, etc.)
            - Benefícios específicos de cada substituição
            
            Seja preciso nas quantidades equivalentes.`
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

    let substitutionData;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      substitutionData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error("Failed to parse substitution data from AI");
    }

    return new Response(
      JSON.stringify({ success: true, data: substitutionData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error generating food substitutions:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Erro ao gerar substituições" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
