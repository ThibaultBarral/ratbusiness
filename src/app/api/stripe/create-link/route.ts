// src/app/api/stripe/create-link/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil",
});

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const body = await req.json();
    const { plan } = body;

    const {
        data: { user },
    } = await supabase.auth.getUser();
    const customerEmail = user?.email;

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Recherche du price_id via lookup_key
    const priceLookup = await stripe.prices.list({ lookup_keys: [plan], expand: ["data.product"] });
    console.log("🔍 Lookup demandé :", plan);
    console.log("🔎 Résultat trouvé :", priceLookup.data);
    const priceId = priceLookup.data?.[0]?.id;

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