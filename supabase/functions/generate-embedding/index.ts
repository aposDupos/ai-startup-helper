import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const model = new Supabase.ai.Session('gte-small');

interface WebhookPayload {
    type: 'INSERT' | 'UPDATE';
    table: string;
    record: {
        id: string;
        content: string;
        embedding: string | null;
    };
    old_record: null | {
        id: string;
        content: string;
    };
}

Deno.serve(async (req: Request) => {
    try {
        const payload: WebhookPayload = await req.json();
        const { content, id } = payload.record;

        if (!content) {
            return new Response('No content to embed', { status: 400 });
        }

        // Generate embedding using built-in gte-small model (384 dimensions)
        const embedding = await model.run(content, {
            mean_pool: true,
            normalize: true,
        });

        // Store embedding in database
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        );

        const { error } = await supabase
            .from('knowledge_chunks')
            .update({ embedding: JSON.stringify(embedding) })
            .eq('id', id);

        if (error) {
            console.error('Error storing embedding:', error.message);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: true, id }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('Edge function error:', err);
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
