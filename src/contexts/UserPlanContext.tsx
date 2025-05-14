"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type UserPlan = "starter" | "pro" | "business" | null;

interface UserPlanContextType {
    plan: UserPlan;
    isLoading: boolean;
}

const UserPlanContext = createContext<UserPlanContextType>({
    plan: null,
    isLoading: true,
});

export function UserPlanProvider({ children }: { children: React.ReactNode }) {
    const [plan, setPlan] = useState<UserPlan>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchPlan = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setPlan(null);
                setIsLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("subscriptions")
                .select("plan")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (error || !data?.plan) {
                setPlan(null);
            } else {
                setPlan(data.plan.includes("pro")
                    ? "pro"
                    : data.plan.includes("business")
                        ? "business"
                        : "starter");
            }
            setIsLoading(false);
        };
        fetchPlan();
    }, [supabase]);

    return (
        <UserPlanContext.Provider value={{ plan, isLoading }}>
            {children}
        </UserPlanContext.Provider>
    );
}

export function useUserPlan() {
    const context = useContext(UserPlanContext);
    if (context === undefined) {
        throw new Error("useUserPlan must be used within a UserPlanProvider");
    }
    return context;
} 