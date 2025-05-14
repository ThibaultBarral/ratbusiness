// src/app/api/stripe/create-link/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { prices } from "@/lib/stripe/prices";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil",
});

type PlanType = keyof typeof prices;
type Period = keyof typeof prices[PlanType];

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const body = await req.json();
    const { plan } = body;

    const {
        data: { user },
    } = await supabase.auth.getUser();
    const customerEmail = user?.email;

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Extraire le type de plan et la période du plan (ex: "pro_yearly" -> "pro" et "yearly")
    const [planType, period] = plan.split('_') as [PlanType, Period];

    // Récupérer le price_id depuis notre configuration
    const priceId = prices[planType]?.[period];

    if (!priceId) {
        console.error("❌ Aucun price_id trouvé pour le plan :", plan);
        return NextResponse.json({ error: "Prix introuvable pour ce plan." }, { status: 400 });
    }

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

    return NextResponse.json({ url: session.url });
}