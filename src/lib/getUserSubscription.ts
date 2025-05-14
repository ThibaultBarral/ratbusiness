// lib/getUserSubscription.ts
import { createClient } from "@/utils/supabase/server";

export const getUserSubscription = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (error) return null;
    return data;
};