// src/app/api/stripe/create-link/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { prices } from "@/lib/stripe/prices";

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-04-30.basil",
});

type PlanType = keyof typeof prices;
type Period = keyof typeof prices[PlanType];

export async function POST(req: NextRequest) {
    try {
        console.log("🚀 Début de la création du lien de paiement");

        const supabase = await createClient();
        const body = await req.json();
        const { plan } = body;

        console.log("📦 Plan reçu:", plan);
        console.log("📦 Configuration des prix:", prices);

        const {
            data: { user },
        } = await supabase.auth.getUser();
        const customerEmail = user?.email;

        if (!user) {
            console.log("❌ Utilisateur non authentifié");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("👤 Utilisateur authentifié:", user.id);

        // Extraire le type de plan et la période du plan (ex: "pro_yearly" -> "pro" et "yearly")
        const [planType, period] = plan.split('_') as [PlanType, Period];

        console.log("🔍 Plan type:", planType);
        console.log("🔍 Période:", period);
        console.log("🔍 Prix disponible:", prices[planType]);

        // Récupérer le price_id depuis notre configuration
        const priceId = prices[planType]?.[period];

        console.log("💰 Price ID trouvé:", priceId);

        if (!priceId) {
            console.error("❌ Aucun price_id trouvé pour le plan :", plan);
            return NextResponse.json({ error: "Prix introuvable pour ce plan." }, { status: 400 });
        }

        console.log("🔄 Création de la session Stripe...");

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            metadata: {
                user_id: user.id,
                plan,
            },
            customer_email: customerEmail,
            allow_promotion_codes: true,
            success_url: `https://ratbusiness.fr/dashboard?success=true`,
            cancel_url: `https://ratbusiness.fr/pricing?cancelled=true`,
        });

        console.log("✅ Session Stripe créée avec succès");

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("❌ Erreur lors de la création du lien de paiement:", error);
        if (error instanceof Error) {
            console.error("Message d'erreur:", error.message);
            console.error("Stack trace:", error.stack);
        }
        return NextResponse.json(
            {
                error: "Une erreur est survenue lors de la création du lien de paiement.",
                details: error instanceof Error ? error.message : "Erreur inconnue"
            },
            { status: 500 }
        );
    }
}