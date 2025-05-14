'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function SubscribeButton({ plan, label = "Commencer gratuitement" }: { plan: string; label?: string }) {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            // Vérifie si l'utilisateur a déjà un abonnement actif
            const checkRes = await fetch('/api/stripe/check-subscription', { method: 'GET' });
            const checkData = await checkRes.json();

            let url = "";

            if (checkData.hasActiveSubscription) {
                const portalRes = await fetch('/api/stripe/customer-portal', { method: 'POST' });
                const portalData = await portalRes.json();
                url = portalData.url;
            } else {
                console.log("🧾 Plan envoyé au checkout :", plan);

                const checkoutRes = await fetch('/api/stripe/create-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plan }),
                });
                const checkoutData = await checkoutRes.json();
                url = checkoutData.url;
            }

            if (url) window.location.href = url;
        } catch (err) {
            alert(`Erreur lors de la redirection vers Stripe: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full"
            variant={label === "Gérer mon abonnement" ? "outline" : "default"}
        >
            {loading ? 'Redirection...' : label}
        </Button>
    );
}