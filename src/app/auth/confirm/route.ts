import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    let type = searchParams.get('type') as EmailOtpType | null;
    const next = searchParams.get('next') ?? '/login?confirmed=true';

    if (token_hash && type) {
        const supabase = await createClient();

        if (type !== 'signup' && type !== 'email') {
            type = 'email';
        }

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        });

        if (!error) {
            redirect(next);
        } else {
            console.error(error);
        }
    }

    redirect('/error');
}