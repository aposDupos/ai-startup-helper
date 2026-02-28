"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(data: { email: string; password: string }) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}

export async function register(data: {
    name: string;
    email: string;
    password: string;
}) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                display_name: data.name,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    // Don't redirect to dashboard — redirect to email confirmation page
    revalidatePath("/", "layout");
    redirect("/register/confirm");
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
}
