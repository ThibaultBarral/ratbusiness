'use client';

import React from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AffiliatePage() {
    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Deviens affilié Ratbusiness
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Partage ton code promo de -10% et gagne 50% de commission à vie sur chaque abonnement.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 text-center mb-16">
                    <Card className="hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">🎁 Réduction pour tes filleuls</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">-10% pour chaque personne qui utilise ton lien ou code personnalisé.</p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">💸 Commissions à vie</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Tu gagnes 50% tous les mois, tant que ton filleul reste abonné.</p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">📊 Suivi transparent</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Dashboard personnel pour suivre tes ventes et commissions.</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mb-16">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">Comment ça fonctionne ?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="list-decimal list-inside space-y-4 text-muted-foreground max-w-2xl mx-auto">
                            <li>Tu t&apos;inscris en tant qu&apos;affilié.</li>
                            <li>Tu reçois un lien + un code promo personnalisé.</li>
                            <li>Tu partages le lien à ton audience ou tes amis.</li>
                            <li>Tu touches 50% de commission à chaque abonnement généré.</li>
                        </ol>
                    </CardContent>
                </Card>

                <Card className="mb-16 bg-muted">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Exemple concret :</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Tu recommandes Ratbusiness à 5 personnes. Elles s&apos;abonnent à 9€/mois. <br />
                            👉 Tu gagnes 22,50€/mois, chaque mois, tant qu&apos;elles restent abonnées.
                        </p>
                    </CardContent>
                </Card>

                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Prêt à te lancer ?</h2>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link href="/dashboard">
                            Rejoindre le programme affilié
                        </Link>
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
