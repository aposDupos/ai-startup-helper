import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const model = new Supabase.ai.Session('gte-small');

Deno.serve(async (req: Request) => {
    try {
        // CORS headers
        if (req.method === 'OPTIONS') {
            return new Response('ok', {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
                },
            });
        }

        const { search, match_count = 3, match_threshold = 0.7 } = await req.json();

        if (!search) {
            return new Response(
                JSON.stringify({ error: 'Please provide a search param' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Generate embedding for search query using gte-small (384 dimensions)
        const embedding = await model.run(search, {
            mean_pool: true,
            normalize: true,
        });

        // Query similar documents via match_documents RPC
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        );

        const { data: results, error } = await supabase
            .rpc('match_documents', {
                query_embedding: JSON.stringify(embedding),
                match_threshold,
                match_count,
            });

        if (error) {
            console.error('RPC error:', error.message);
            return new Response(
                JSON.stringify({ error: error.message }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ search, results: results ?? [] }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
    } catch (err) {
        console.error('Search error:', err);
        return new Response(
            JSON.stringify({ error: String(err) }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
