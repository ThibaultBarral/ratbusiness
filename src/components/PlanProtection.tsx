"use client";

import { useUserPlan } from "@/contexts/UserPlanContext";
import { useEffect } from "react";

export function PlanProtection({ children }: { children: React.ReactNode }) {
    const { plan, isLoading } = useUserPlan();

    useEffect(() => {
        if (!isLoading && !plan) {
            console.log("Utilisateur sans plan - accès en lecture seule");
        }
    }, [plan, isLoading]);

    if (isLoading) {
        return <div>Chargement...</div>;
    }

    return <>{children}</>;
}

export function usePlanAction() {
    const { plan, isLoading } = useUserPlan();

    const isActionAllowed = () => {
        if (isLoading) return false;
        return !!plan;
    };

    const handleAction = (action: () => void) => {
        if (!isActionAllowed()) {
            alert("Vous devez souscrire à un plan pour effectuer cette action.");
            return;
        }
        action();
    };

    return { isActionAllowed, handleAction };
} 