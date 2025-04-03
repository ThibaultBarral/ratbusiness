"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../../utils/supabase/client";

export default function SettingsPage() {
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email ?? "");
                // Tu peux ajouter un champ "username" dans ta base Supabase si tu veux gérer ça.
                const { data: userProfile } = await supabase
                    .from("users")
                    .select("username")
                    .eq("id", user.id)
                    .single();

                setUsername(userProfile?.username ?? "");
            }
        };
        fetchUser();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from("users")
            .update({ username })
            .eq("id", user.id);

        setLoading(false);
    };

    return (
        <DashboardLayout>
            <div className="max-w-xl mx-auto space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Paramètres du compte</CardTitle>
                        <CardDescription>
                            Mets à jour ton profil ou modifie tes préférences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium">
                                    Adresse email
                                </label>
                                <Input id="email" value={email} disabled />
                            </div>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium">
                                    Nom d'utilisateur
                                </label>
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Ton pseudo"
                                />
                            </div>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Enregistrement..." : "Mettre à jour"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}