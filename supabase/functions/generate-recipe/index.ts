
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients } = await req.json();

    if (!ingredients || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No ingredients provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ingredientsList = ingredients.join(', ');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional chef assistant. Generate creative and practical recipes using the provided ingredients. Return the response in JSON format with title, description, ingredients (as array), instructions, prep_time, cook_time, servings, and difficulty.'
          },
          {
            role: 'user',
            content: `Create a recipe using these ingredients: ${ingredientsList}. You can suggest additional common ingredients if needed. Make it delicious and practical for home cooking.`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Try to parse the JSON response from OpenAI
    let recipe;
    try {
      recipe = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      recipe = {
        title: "AI Generated Recipe",
        description: "Recipe created based on your selected ingredients",
        ingredients: ingredients,
        instructions: content,
        prep_time: 15,
        cook_time: 30,
        servings: 4,
        difficulty: "medium"
      };
    }

    return new Response(JSON.stringify({ recipe }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-recipe function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate recipe', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
