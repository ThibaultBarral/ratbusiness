// /app/api/stripe/check-subscription/route.ts

import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ hasActiveSubscription: false }, { status: 401 });
    }

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (!subscription?.stripe_customer_id) {
        return NextResponse.json({ hasActiveSubscription: false });
    }

    const subscriptions = await stripe.subscriptions.list({
        customer: subscription.stripe_customer_id,
        status: 'all',
        limit: 1,
    });

    const hasActive = subscriptions.data.some(
        (s) => s.status === 'active' || s.status === 'trialing'
    );

    return NextResponse.json({ hasActiveSubscription: hasActive });
}
