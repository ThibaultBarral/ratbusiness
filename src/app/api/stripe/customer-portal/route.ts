// /app/api/stripe/customer-portal/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil",
});

export async function POST() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: subscription } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (!subscription?.stripe_customer_id) {
        return NextResponse.json({ error: "No customer ID found" }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: "https://ratbusiness.fr/dashboard",
    });

    return NextResponse.json({ url: session.url });
}