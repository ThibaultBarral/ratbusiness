import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { prices } from "@/lib/stripe/prices";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = (await headers()).get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: unknown) {
        console.error("❌ Erreur de vérification Stripe :", err instanceof Error ? err.message : String(err));
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



            const { error } = await supabase.from("subscriptions").insert({
                user_id,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscription_id,
                plan,
                status: "active",
            });

            if (error) {
                console.error("❌ Erreur lors de l'insertion dans Supabase :", error);
                return new NextResponse(`Database Error: ${error.message}`, { status: 500 });
            }

            console.log("✅ Données insérées avec succès dans Supabase");
        } catch (err) {
            console.error("❌ Erreur inattendue pendant le traitement de checkout.session.completed :", err);
            return new NextResponse("Internal Server Error", { status: 500 });
        }
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