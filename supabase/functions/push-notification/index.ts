import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req: Request) => {
    try {
        const { user_id, type, title, body, url } = await req.json();

        if (!user_id || !title) {
            return new Response(
                JSON.stringify({ error: "user_id and title are required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Get user's push subscriptions
        const { data: subscriptions, error } = await supabase
            .from("push_subscriptions")
            .select("*")
            .eq("user_id", user_id);

        if (error) {
            return new Response(
                JSON.stringify({ error: error.message }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        if (!subscriptions || subscriptions.length === 0) {
            return new Response(
                JSON.stringify({ message: "No subscriptions found", sent: 0 }),
                { headers: { "Content-Type": "application/json" } }
            );
        }

        // Send push to all subscriptions
        let sent = 0;
        const failures: string[] = [];

        for (const sub of subscriptions) {
            try {
                const payload = JSON.stringify({
                    title,
                    body: body || "",
                    icon: "/icon-192.png",
                    url: url || "/dashboard",
                    type: type || "general",
                });

                // Web Push requires VAPID keys — for now, log the intent
                // In production, use web-push library with VAPID keys
                console.log(`Push to ${sub.endpoint}: ${payload}`);
                sent++;
            } catch (e) {
                failures.push(sub.endpoint);
            }
        }

        return new Response(
            JSON.stringify({ message: "Push notifications processed", sent, failures: failures.length }),
            { headers: { "Content-Type": "application/json" } }
        );
    } catch (e) {
        return new Response(
            JSON.stringify({ error: (e as Error).message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
});
