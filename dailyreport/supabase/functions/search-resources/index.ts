import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface SearchRequest {
  query: string
  category?: string
  limit?: number
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
  error?: {
    code: number
    message: string
    status: string
  }
}

Deno.serve(async (req) => {
  const functionStartTime = Date.now();
  console.log(`🚀 [${new Date().toISOString()}] Edge Function started`);

  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    let requestBody: SearchRequest;
    try {
      requestBody = await req.json();
      console.log('📝 Request received:', JSON.stringify(requestBody, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError.message,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { query, category = 'general', limit = 10 } = requestBody;

    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      console.error('❌ Invalid query parameter:', query);
      return new Response(
        JSON.stringify({ 
          error: 'Search query is required and must be a non-empty string',
          received: { query, type: typeof query },
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    console.log('🔧 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseAnonKey: !!supabaseAnonKey,
      hasGeminiApiKey: !!geminiApiKey,
      supabaseUrlStart: supabaseUrl?.substring(0, 20) + '...'
    });

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error',
          details: 'Missing Supabase configuration',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    console.log('🔗 Initializing Supabase client...');
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Search existing resources in database
    console.log(`🔍 Searching database for: "${query}" in category: "${category}"`);
    let existingResources: any[] = [];
    
    try {
      const { data: dbData, error: dbError } = await supabaseClient
        .from('resources')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
        .limit(limit);

      if (dbError) {
        console.error('❌ Database search error:', dbError);
        throw new Error(`Database search failed: ${dbError.message}`);
      }

      existingResources = dbData || [];
      console.log(`✅ Database search completed. Found ${existingResources.length} existing resources`);
    } catch (dbSearchError) {
      console.error('❌ Database search exception:', dbSearchError);
      return new Response(
        JSON.stringify({ 
          error: 'Database search failed',
          details: dbSearchError.message,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get Gemini API suggestions for additional resources
    let aiSuggestions: any[] = [];
    
    if (!geminiApiKey) {
      console.warn('⚠️ GEMINI_API_KEY not found, skipping AI suggestions');
    } else {
      console.log('🤖 Calling Gemini API for AI suggestions...');
      
      try {
        const prompt = `As an educational resource curator for Culture Bridge Program 2025, suggest ${limit} high-quality, accessible resources related to "${query}" in the "${category}" category. Focus on:
        - SDGs (Sustainable Development Goals)
        - Cross-cultural communication
        - Japanese culture
        - International exchange
        - Volunteer opportunities
        - Educational materials

        For each resource, provide:
        1. Title
        2. URL (prefer real, accessible URLs)
        3. Description (50-100 words)
        4. Type (article, video, document, website)
        5. Tags (3-5 relevant keywords)

        Format as JSON array with these fields: title, url, description, type, tags[]`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;
        
        console.log('📡 Making Gemini API request...');
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        });

        console.log(`📡 Gemini API response status: ${geminiResponse.status}`);

        if (!geminiResponse.ok) {
          const errorText = await geminiResponse.text();
          console.error('❌ Gemini API HTTP error:', {
            status: geminiResponse.status,
            statusText: geminiResponse.statusText,
            body: errorText
          });
          
          // Don't fail the entire request for AI suggestions failure
          console.warn('⚠️ Continuing without AI suggestions due to Gemini API error');
        } else {
          const geminiData: GeminiResponse = await geminiResponse.json();
          console.log('✅ Gemini API response received');
          
          if (geminiData.error) {
            console.error('❌ Gemini API returned error:', geminiData.error);
          } else {
            const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
            console.log(`📝 AI response length: ${aiText.length} characters`);
            
            // Try to extract JSON from AI response
            const jsonMatch = aiText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              try {
                aiSuggestions = JSON.parse(jsonMatch[0]);
                console.log(`✅ Parsed ${aiSuggestions.length} AI suggestions`);
              } catch (parseError) {
                console.error('❌ Failed to parse AI suggestions JSON:', parseError);
                console.log('Raw AI text:', aiText.substring(0, 500) + '...');
              }
            } else {
              console.warn('⚠️ No JSON array found in AI response');
              console.log('AI response sample:', aiText.substring(0, 200) + '...');
            }
          }
        }
      } catch (geminiError) {
        console.error('❌ Gemini API request exception:', geminiError);
        // Continue without AI suggestions
      }
    }

    // Combine results
    const results = {
      query,
      category,
      existingResources,
      aiSuggestions: aiSuggestions.slice(0, Math.max(0, limit - existingResources.length)),
      total: existingResources.length + Math.min(aiSuggestions.length, Math.max(0, limit - existingResources.length)),
      timestamp: new Date().toISOString(),
      debug: {
        executionTime: Date.now() - functionStartTime,
        dbResourcesFound: existingResources.length,
        aiSuggestionsFound: aiSuggestions.length,
        hasGeminiKey: !!geminiApiKey
      }
    };

    console.log(`✅ [${new Date().toISOString()}] Edge Function completed successfully`);
    console.log(`📊 Results summary:`, {
      totalResults: results.total,
      dbResults: existingResources.length,
      aiResults: aiSuggestions.length,
      executionTime: results.debug.executionTime + 'ms'
    });

    return new Response(
      JSON.stringify(results),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (globalError) {
    console.error('🔴 Edge Function global error:', {
      name: globalError.name,
      message: globalError.message,
      stack: globalError.stack,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: globalError.message,
        timestamp: new Date().toISOString(),
        debug: {
          errorName: globalError.name,
          executionTime: Date.now() - functionStartTime
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}) 