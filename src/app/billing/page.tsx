'use client';
import { Badge } from "@/components/ui/badge";
import SubscribeButton from "@/components/ui/SubscribeButton";
import { createClient } from "@/utils/supabase/client";
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CheckIcon, StarIcon, UsersIcon, ShieldIcon, ClockIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const trustBadges = [
    { icon: ShieldIcon, text: "Protection des données RGPD" },
    { icon: ClockIcon, text: "Support réactif sous 24h" },
    { icon: UsersIcon, text: "Solution 100% française" },
    { icon: StarIcon, text: "Période d'essai de 14 jours" },
];

export default function BillingPage() {
    const [isAnnual, setIsAnnual] = useState(true);
    const [userPlan, setUserPlan] = useState<string | null>(null);
    const [subscription, setSubscription] = useState<{
        plan?: string;
        status?: string;
        stripe_customer_id?: string;
        stripe_subscription_id?: string;
    } | null>(null);

    useEffect(() => {
        const fetchPlan = async () => {
            console.log("🔍 Début de fetchPlan");
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            console.log("👤 User data:", user);

            if (!user) {
                console.log("❌ Pas d'utilisateur connecté");
                return;
            }

            console.log("🔍 Recherche de l'abonnement pour l'utilisateur:", user.id);

            // D'abord, vérifions si la table existe et ses données
            const { data: allSubscriptions, error: tableError } = await supabase
                .from("subscriptions")
                .select("*")
                .limit(5);

            console.log("📋 Tous les abonnements:", allSubscriptions);
            console.log("❌ Erreur table:", tableError);

            // Ensuite, cherchons l'abonnement spécifique
            const { data: subscriptionData, error } = await supabase
                .from("subscriptions")
                .select("plan, status, stripe_customer_id, stripe_subscription_id")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            console.log("🟢 Résultat maybeSingle:", subscriptionData, error);

            if (error) {
                console.error("❌ Erreur détaillée:", {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
            }

            setUserPlan(subscriptionData?.plan ?? null);
            setSubscription(subscriptionData ?? null);
        };

        fetchPlan();
    }, []);

    // Ajout d'un useEffect pour surveiller les changements d'état
    useEffect(() => {
        console.log("🔄 UserPlan updated:", userPlan);
        console.log("🔄 Subscription state updated:", subscription);
    }, [userPlan, subscription]);

    // Fonction pour ouvrir le portail Stripe (à adapter selon ton backend)
    const handleManageBilling = async () => {
        console.log("🔗 Tentative d'ouverture du portail Stripe");
        const res = await fetch("/api/stripe/customer-portal", { method: "POST" });
        const data = await res.json();
        console.log("🔗 Réponse du portail Stripe:", data);
        if (data?.url) {
            window.location.href = data.url;
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4">
                        Des tarifs adaptés à votre croissance
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Choisissez le plan qui correspond à vos besoins. Tous nos plans incluent une période d&apos;essai de 14 jours.
                    </p>
                </div>

                <div className="flex justify-center items-center mb-12">
                    <Label htmlFor="payment-schedule" className="mr-3 text-lg">Mensuel</Label>
                    <Switch id="payment-schedule" checked={isAnnual} onCheckedChange={setIsAnnual} />
                    <Label htmlFor="payment-schedule" className="ml-3 relative text-lg flex items-center gap-2">
                        Annuel
                        <span className="text-sm font-semibold bg-primary absolute left-full translate-x-2 text-white px-3 py-1 rounded-full shadow-sm">-20%</span>
                    </Label>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                    {/* Starter */}
                    <Card className="flex flex-col border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="mb-6 text-2xl">Starter</CardTitle>
                            {userPlan?.includes("starter") && (
                                <div className="mb-2 absolute">
                                    <Badge className="text-xs bg-green-100 text-green-800">
                                        Plan actif
                                    </Badge>
                                </div>
                            )}
                            <div className="relative">
                                <span className="font-bold text-5xl">
                                    {isAnnual ? "5,6€" : "7€"}
                                </span>
                                <p className="text-sm text-muted-foreground mt-2">
                                    /mois {isAnnual ? "(facturation annuelle)" : "(facturation mensuelle)"}
                                </p>
                            </div>
                        </CardHeader>
                        <CardDescription className="text-center text-base">Parfait pour débuter</CardDescription>
                        <CardContent className="flex-1">
                            <ul className="mt-6 space-y-3 text-sm">
                                <li className="flex items-center"><CheckIcon className="w-5 h-5 mr-2 text-primary" />20 articles max</li>
                                <li className="flex items-center"><CheckIcon className="w-5 h-5 mr-2 text-primary" />Calcul du bénéfice</li>
                                <li className="flex items-center"><CheckIcon className="w-5 h-5 mr-2 text-primary" />Stats basiques</li>
                                <li className="flex items-center"><CheckIcon className="w-5 h-5 mr-2 text-primary" />Support par email</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <SubscribeButton
                                plan={isAnnual ? "starter_yearly" : "starter_monthly"}
                                label={
                                    userPlan?.includes("starter")
                                        ? "Gérer mon abonnement"
                                        : userPlan
                                            ? "Changer d'abonnement"
                                            : "Commencer gratuitement"
                                }
                            />
                        </CardFooter>
                    </Card>

                    {/* Pro */}
                    <Card className="border-2 border-primary flex flex-col relative hover:shadow-xl transition-all duration-300">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-primary text-primary-foreground px-4 py-1">Populaire</Badge>
                        </div>
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="mb-6 text-2xl">Pro</CardTitle>
                            {userPlan?.includes("pro") && (
                                <div className="mb-2 absolute">
                                    <Badge className="text-xs bg-green-100 text-green-800">
                                        Plan actif
                                    </Badge>
                                </div>
                            )}
                            <div className="relative">
                                <span className="font-bold text-5xl">
                                    {isAnnual ? "11,2€" : "14€"}
                                </span>
                                <p className="text-sm text-muted-foreground mt-2">
                                    /mois {isAnnual ? "(facturation annuelle)" : "(facturation mensuelle)"}
                                </p>
                            </div>
                        </CardHeader>
                        <CardDescription className="text-center text-base">Pour vendre régulièrement</CardDescription>
                        <CardContent className="flex-1">
                            <ul className="mt-6 space-y-3 text-sm">
                                <li className="flex items-center"><CheckIcon className="w-5 h-5 mr-2 text-primary" />Articles illimités</li>
                                <li className="flex items-center"><CheckIcon className="w-5 h-5 mr-2 text-primary" />Export CSV</li>
                                <li className="flex items-center"><CheckIcon className="w-5 h-5 mr-2 text-primary" />Alertes de stock</li>
                                <li className="flex items-center"><CheckIcon className="w-5 h-5 mr-2 text-primary" />Support prioritaire</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <SubscribeButton
                                plan={isAnnual ? "pro_yearly" : "pro_monthly"}
                                label={
                                    userPlan?.includes("pro")
                                        ? "Gérer mon abonnement"
                                        : userPlan
                                            ? "Changer d'abonnement"
                                            : "Commencer gratuitement"
                                }
                            />
                        </CardFooter>
                    </Card>

                    {/* 
                    <Card className="flex flex-col border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="mb-6 text-2xl">Business</CardTitle>
                            <div className="relative">
                                <span className="font-bold text-5xl">
                                    {isAnnual ? "39€" : "49€"}
                                </span>
                                <p className="text-sm text-muted-foreground mt-2">
                                    /mois {isAnnual ? "(facturation annuelle)" : "(facturation mensuelle)"}
                                </p>
                                {isAnnual && (
                                    <span className="absolute -top-2 -right-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                        -20%
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardDescription className="text-center text-base">Pour scaler efficacement</CardDescription>
                        <CardContent className="flex-1">
                            <ul className="mt-6 space-y-3 text-sm">
                                <li className="flex items-center"><CheckIcon className="w-5 h-5 mr-2 text-primary" />Assistant IA</li>
                                <li className="flex items-center"><CheckIcon className="w-5 h-5 mr-2 text-primary" />Support prioritaire</li>
                                <li className="flex items-center"><CheckIcon className="w-5 h-5 mr-2 text-primary" />Multi-utilisateur</li>
                                <li className="flex items-center"><CheckIcon className="w-5 h-5 mr-2 text-primary" />API & Webhooks</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <SubscribeButton
                                plan={isAnnual ? "business_yearly" : "business_monthly"}
                                label={
                                    userPlan?.includes("business")
                                        ? "Gérer mon abonnement"
                                        : userPlan
                                            ? "Changer d'abonnement"
                                            : "Commencer gratuitement"
                                }
                            />
                        </CardFooter>
                    </Card>
                    */}
                </div>

                {/* Trust Badges */}
                <div className="mt-16 mb-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {trustBadges.map((badge, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                            <badge.icon className="w-8 h-8 text-primary mb-2" />
                            <p className="text-sm text-muted-foreground">{badge.text}</p>
                        </div>
                    ))}
                </div>

                {/* Détail de l'abonnement actuel */}
                {subscription && (
                    <div className="border rounded-lg p-6 bg-white shadow flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center mb-2">
                                <span className="text-2xl font-semibold mr-2">{subscription?.plan ? subscription.plan.split('_')[0].charAt(0).toUpperCase() + subscription.plan.split('_')[0].slice(1) : ""}</span>
                                {subscription?.status === "active" && (
                                    <span className="ml-2 px-2 py-1 text-xs rounded bg-green-100 text-green-800">Actif</span>
                                )}
                            </div>
                            <div className="text-muted-foreground mb-2">Votre abonnement est en cours et se renouvellera automatiquement.</div>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-col gap-2">
                            <button
                                className="px-4 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition"
                                onClick={handleManageBilling}
                            >
                                Gérer / Annuler l&apos;abonnement
                            </button>
                        </div>
                    </div>
                )}


                {/* FAQ Section */}
                <div className="mt-20 text-center">
                    <h2 className="text-3xl font-semibold mb-8">Questions fréquentes</h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="text-left">
                            <h3 className="font-semibold mb-2">Puis-je changer de plan à tout moment ?</h3>
                            <p className="text-muted-foreground">Oui, vous pouvez passer à un plan supérieur à tout moment. Le changement sera effectif immédiatement.</p>
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold mb-2">Y a-t-il des frais cachés ?</h3>
                            <p className="text-muted-foreground">Non, tous nos prix sont transparents et incluent toutes les fonctionnalités listées.</p>
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold mb-2">Comment fonctionne la période d&apos;essai ?</h3>
                            <p className="text-muted-foreground">Vous avez 14 jours pour tester toutes les fonctionnalités sans engagement.</p>
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold mb-2">Quels moyens de paiement acceptez-vous ?</h3>
                            <p className="text-muted-foreground">Nous acceptons les cartes de crédit, PayPal et les virements bancaires.</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}