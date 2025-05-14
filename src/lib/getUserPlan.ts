// lib/getUserPlan.ts
import { createClient } from "@/utils/supabase/server";

export const getUserPlan = async (): Promise<"starter" | "pro" | "business" | null> => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("subscriptions")
        .select("plan")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (error || !data?.plan) return null;

    return data.plan.includes("pro")
        ? "pro"
        : data.plan.includes("business")
            ? "business"
            : "starter";
};