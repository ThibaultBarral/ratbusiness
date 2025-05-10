'use client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CheckIcon, MinusIcon, StarIcon, UsersIcon, ShieldIcon, ClockIcon } from "lucide-react";
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface PlanFeature {
    type: string;
    features: {
        name: string;
        starter: boolean;
        pro: boolean;
        business: boolean;
    }[];
}

const planFeatures: PlanFeature[] = [
    {
        type: "Articles & ventes",
        features: [
            { name: "Articles illimités", starter: false, pro: true, business: true },
            { name: "Gestion des bundles", starter: false, pro: true, business: true },
            { name: "Calcul automatique des bénéfices", starter: true, pro: true, business: true },
            { name: "Suivi des coûts cachés", starter: false, pro: false, business: true },
            { name: "Historique des prix", starter: false, pro: true, business: true },
            { name: "Analyse de la concurrence", starter: false, pro: false, business: true },
        ],
    },
    {
        type: "Fonctionnalités avancées",
        features: [
            { name: "Tableau de bord analytique", starter: true, pro: true, business: true },
            { name: "Export CSV", starter: false, pro: true, business: true },
            { name: "Assistant IA de pricing", starter: false, pro: false, business: true },
            { name: "Alertes de stock", starter: false, pro: true, business: true },
            { name: "API d'intégration", starter: false, pro: false, business: true },
            { name: "Webhooks", starter: false, pro: false, business: true },
        ],
    },
    {
        type: "Support & collaboration",
        features: [
            { name: "Support classique", starter: true, pro: true, business: false },
            { name: "Support prioritaire", starter: false, pro: false, business: true },
            { name: "Multi-utilisateur", starter: false, pro: false, business: true },
            { name: "Formation personnalisée", starter: false, pro: false, business: true },
            { name: "Accès aux mises à jour en avant-première", starter: false, pro: false, business: true },
        ],
    },
];

const trustBadges = [
    { icon: ShieldIcon, text: "Sécurité de niveau entreprise" },
    { icon: ClockIcon, text: "99.9% de disponibilité" },
    { icon: UsersIcon, text: "Plus de 1000 vendeurs satisfaits" },
    { icon: StarIcon, text: "4.9/5 sur les stores" },
];

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(true);

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Des tarifs adaptés à votre croissance
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Choisissez le plan qui correspond à vos besoins. Tous nos plans incluent une période d&apos;essai de 14 jours.
                    </p>
                </div>

                <div className="flex justify-center items-center mb-12">
                    <Label htmlFor="payment-schedule" className="mr-3 text-lg">Mensuel</Label>
                    <Switch id="payment-schedule" checked={isAnnual} onCheckedChange={setIsAnnual} />
                    <Label htmlFor="payment-schedule" className="ml-3 relative text-lg">
                        Annuel
                        <Badge className="absolute -top-8 right-0 bg-primary text-primary-foreground">Économisez 20%</Badge>
                    </Label>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Starter */}
                    <Card className="flex flex-col border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="mb-6 text-2xl">Starter</CardTitle>
                            <div className="relative">
                                <span className="font-bold text-5xl">
                                    {isAnnual ? "9€" : "11€"}
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
                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                                Commencer gratuitement
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Pro */}
                    <Card className="border-2 border-primary flex flex-col relative hover:shadow-xl transition-all duration-300">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-primary text-primary-foreground px-4 py-1">Populaire</Badge>
                        </div>
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="mb-6 text-2xl">Pro</CardTitle>
                            <div className="relative">
                                <span className="font-bold text-5xl">
                                    {isAnnual ? "19€" : "24€"}
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
                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                                Commencer gratuitement
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Business */}
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
                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                                Commencer gratuitement
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Trust Badges */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {trustBadges.map((badge, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                            <badge.icon className="w-8 h-8 text-primary mb-2" />
                            <p className="text-sm text-muted-foreground">{badge.text}</p>
                        </div>
                    ))}
                </div>

                {/* Table de comparaison */}
                <div className="mt-20">
                    <h2 className="text-3xl font-semibold mb-8 text-center">Comparer les fonctionnalités</h2>
                    <Table className="hidden md:table">
                        <TableHeader>
                            <TableRow className="bg-muted">
                                <TableHead>Fonctionnalités</TableHead>
                                <TableHead className="text-center">Starter</TableHead>
                                <TableHead className="text-center">Pro</TableHead>
                                <TableHead className="text-center">Business</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {planFeatures.map((section) => (
                                <React.Fragment key={section.type}>
                                    <TableRow className="bg-muted/50">
                                        <TableCell colSpan={4} className="font-bold text-lg">{section.type}</TableCell>
                                    </TableRow>
                                    {section.features.map((f) => (
                                        <TableRow key={f.name} className="hover:bg-muted/30">
                                            <TableCell>{f.name}</TableCell>
                                            <TableCell className="text-center">
                                                {f.starter ? <CheckIcon className="mx-auto w-5 h-5 text-primary" /> : <MinusIcon className="mx-auto w-5 h-5 text-muted-foreground" />}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {f.pro ? <CheckIcon className="mx-auto w-5 h-5 text-primary" /> : <MinusIcon className="mx-auto w-5 h-5 text-muted-foreground" />}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {f.business ? <CheckIcon className="mx-auto w-5 h-5 text-primary" /> : <MinusIcon className="mx-auto w-5 h-5 text-muted-foreground" />}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>

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