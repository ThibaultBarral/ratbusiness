"use client";

import { useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
    const supabase = createClient();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
                    data: { username }, // Stocke dans metadata
                },
            });

            if (error) {
                setError(error.message);
            } else {
                router.push("/login?signupSuccess=1");
            }
        } catch (err) {
            console.error("Unexpected error during signup:", err);
            setError("Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md bg-white rounded-xl p-8 shadow">
                <h1 className="text-2xl font-bold mb-6 text-center">Créer un compte</h1>

                <form onSubmit={handleSignUp} className="space-y-4">
                    <Input
                        type="email"
                        placeholder="Adresse email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Input
                        type="text"
                        placeholder="Pseudo"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Création du compte..." : "S'inscrire"}
                    </Button>
                </form>
            </div>
        </div>
    );
}