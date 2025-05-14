// app/(protected)/layout.tsx
import { createClient } from '../../../utils/supabase/server';
import { redirect } from 'next/navigation';
import { PlanProtection } from '@/components/PlanProtection';

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();
    const {
        data: { user },
    } = await (await supabase).auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <PlanProtection>
            {children}
        </PlanProtection>
    );
}