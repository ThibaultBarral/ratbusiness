import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { prices } from "@/lib/stripe/prices";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

if (!endpointSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET n'est pas défini dans les variables d'environnement");
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    console.log("🚀 Webhook Stripe reçu");

    const body = await req.text();
    const sig = (await headers()).get("stripe-signature");

    console.log("📝 Headers reçus:", Object.fromEntries((await headers()).entries()));

    if (!sig) {
        console.error("❌ Aucune signature Stripe trouvée dans les headers");
        return new NextResponse("No signature found", { status: 400 });
    }

    if (!endpointSecret) {
        console.error("❌ STRIPE_WEBHOOK_SECRET n'est pas défini");
        return new NextResponse("Webhook secret not configured", { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
        console.log("✅ Signature vérifiée avec succès pour l'événement:", event.type);
        console.log("📝 Données de l'événement:", JSON.stringify(event.data.object, null, 2));
    } catch (err: unknown) {
        console.error("❌ Erreur de vérification Stripe :", {
            error: err instanceof Error ? err.message : String(err),
            signature: sig,
            body: body.substring(0, 100) + "..." // Log only the beginning of the body
        });
        return new NextResponse(`Webhook Error: ${err instanceof Error ? err.message : String(err)}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("✅ Session reçue", {
            metadata: session.metadata,
            customer: session.customer,
            subscription: session.subscription
        });

        const user_id = session.metadata?.user_id;
        const plan = session.metadata?.plan;

        if (!user_id || !plan) {
            console.error("❌ user_id ou plan manquant dans la session.metadata", { user_id, plan });
            return new NextResponse("Missing metadata", { status: 400 });
        }

        const subscription_id = session.subscription as string;
        console.log("📝 Récupération de la subscription", { subscription_id });

        try {
            const subscription = await stripe.subscriptions.retrieve(subscription_id) as Stripe.Subscription;
            console.log("📝 Subscription récupérée", { subscription });

            console.log("📝 Tentative d'insertion dans Supabase avec les données:", {
                user_id,
                stripe_customer_id: session.customer,
                stripe_subscription_id: subscription_id,
                plan,
                status: "active"
            });

            const { data, error } = await supabase.from("subscriptions").insert({
                user_id,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscription_id,
                plan,
                status: "active",
            }).select();

            if (error) {
                console.error("❌ Erreur lors de l'insertion dans Supabase :", error);
                return new NextResponse(`Database Error: ${error.message}`, { status: 500 });
            }

            console.log("✅ Données insérées avec succès dans Supabase:", data);
        } catch (err) {
            console.error("❌ Erreur inattendue pendant le traitement de checkout.session.completed :", err);
            return new NextResponse("Internal Server Error", { status: 500 });
        }
    }

    if (event.type === "customer.subscription.created") {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("✅ Nouvelle subscription créée:", subscription);

        // Récupérer le customer pour obtenir l'email
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        console.log("👤 Customer récupéré:", customer);

        if (!customer || customer.deleted) {
            console.error("❌ Customer non trouvé ou supprimé");
            return new NextResponse("Customer not found", { status: 400 });
        }

        // Trouver l'utilisateur dans Supabase par email
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("email", customer.email)
            .single();

        if (userError || !userData) {
            console.error("❌ Utilisateur non trouvé dans Supabase:", userError);
            return new NextResponse("User not found", { status: 400 });
        }

        // Trouver le plan correspondant au price_id
        const priceId = subscription.items.data[0]?.price.id;
        const planName = getPriceKeyByStripeId(priceId);

        if (!planName) {
            console.error("❌ Plan non trouvé pour le price_id:", priceId);
            return new NextResponse("Plan not found", { status: 400 });
        }

        console.log("📝 Tentative d'insertion dans Supabase avec les données:", {
            user_id: userData.id,
            stripe_customer_id: subscription.customer,
            stripe_subscription_id: subscription.id,
            plan: planName,
            status: subscription.status
        });

        const { data, error } = await supabase.from("subscriptions").insert({
            user_id: userData.id,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            plan: planName,
            status: subscription.status,
        }).select();

        if (error) {
            console.error("❌ Erreur lors de l'insertion dans Supabase :", error);
            return new NextResponse(`Database Error: ${error.message}`, { status: 500 });
        }

        console.log("✅ Données insérées avec succès dans Supabase:", data);
    }

    if (event.type === "customer.subscription.updated") {
        const subscription = event.data.object as unknown as { customer: string; items: { data: { price: { id: string } }[] } };

        const stripePriceId = subscription.items.data[0]?.price.id;
        console.log("📝 ID Stripe reçu:", stripePriceId);

        // Trouver le nom du plan correspondant à l'ID Stripe
        console.log("📝 Recherche du plan correspondant dans:", prices);

        const planName = getPriceKeyByStripeId(stripePriceId);

        if (!planName) {
            console.warn(`⚠️ Aucun plan trouvé pour le prix Stripe ID: ${stripePriceId}`);
            return new NextResponse("Unknown price ID", { status: 400 });
        }

        console.log("✅ Plan trouvé et sélectionné:", planName);

        const { error } = await supabase
            .from("subscriptions")
            .update({
                plan: planName,
            })
            .eq("stripe_customer_id", subscription.customer);

        if (error) {
            console.error("❌ Erreur lors de la mise à jour du plan dans Supabase :", error);
        } else {
            console.log("✅ Plan mis à jour avec succès :", planName);
        }
    }

    if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription;

        const { error } = await supabase
            .from("subscriptions")
            .update({ status: "cancelled" })
            .eq("stripe_customer_id", subscription.customer as string);

        if (error) {
            console.error("❌ Erreur lors de l'annulation du plan dans Supabase :", error);
        } else {
            console.log("✅ Abonnement annulé et mis à jour dans Supabase");
        }
    }

    return new NextResponse(null, { status: 200 });
}

// Fonction utilitaire pour trouver la clé du plan à partir de l'ID Stripe Price
function getPriceKeyByStripeId(stripePriceId: string): string | null {
    for (const [plan, periods] of Object.entries(prices)) {
        for (const [period, id] of Object.entries(periods)) {
            if (id === stripePriceId) {
                return `${plan}_${period}`;
            }
        }
    }
    return null;
}