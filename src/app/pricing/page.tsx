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
import { CheckIcon, MinusIcon } from "lucide-react";
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
        ],
    },
    {
        type: "Fonctionnalités avancées",
        features: [
            { name: "Tableau de bord analytique", starter: true, pro: true, business: true },
            { name: "Export CSV", starter: false, pro: true, business: true },
            { name: "Assistant IA de pricing", starter: false, pro: false, business: true },
            { name: "Alertes de stock", starter: false, pro: true, business: true },
        ],
    },
    {
        type: "Support & collaboration",
        features: [
            { name: "Support classique", starter: true, pro: true, business: false },
            { name: "Support prioritaire", starter: false, pro: false, business: true },
            { name: "Multi-utilisateur", starter: false, pro: false, business: true },
        ],
    },
];

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(true);

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold mb-2">Abonnement Ratbusiness</h1>
                    <p className="text-muted-foreground">Des plans pensés pour chaque vendeur, du débutant au professionnel.</p>
                </div>

                <div className="flex justify-center items-center mb-8">
                    <Label htmlFor="payment-schedule" className="mr-3">Mensuel</Label>
                    <Switch id="payment-schedule" checked={isAnnual} onCheckedChange={setIsAnnual} />
                    <Label htmlFor="payment-schedule" className="ml-3 relative">
                        Annuel
                        <Badge className="absolute -top-8 right-0">Économisez 20%</Badge>
                    </Label>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Starter */}
                    <Card className="flex flex-col">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="mb-6">Starter</CardTitle>
                            <span className="font-bold text-4xl">
                                {isAnnual ? "9€" : "11€"}
                            </span>
                            <p className="text-sm text-muted-foreground">
                                /mois {isAnnual ? "(facturation annuelle)" : "(facturation mensuelle)"}
                            </p>
                        </CardHeader>
                        <CardDescription className="text-center">Parfait pour débuter</CardDescription>
                        <CardContent className="flex-1">
                            <ul className="mt-6 space-y-2.5 text-sm">
                                <li className="flex items-center"><CheckIcon className="w-4 h-4 mr-2" />20 articles max</li>
                                <li className="flex items-center"><CheckIcon className="w-4 h-4 mr-2" />Calcul du bénéfice</li>
                                <li className="flex items-center"><CheckIcon className="w-4 h-4 mr-2" />Stats basiques</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">
                                Choisir Starter ({isAnnual ? "9€/mois" : "11€/mois"})
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Pro */}
                    <Card className="border-primary flex flex-col">
                        <CardHeader className="text-center pb-2">
                            <Badge className="self-center mb-3">Populaire</Badge>
                            <CardTitle className="mb-6">Pro</CardTitle>
                            <span className="font-bold text-4xl">
                                {isAnnual ? "19€" : "24€"}
                            </span>
                            <p className="text-sm text-muted-foreground">
                                /mois {isAnnual ? "(facturation annuelle)" : "(facturation mensuelle)"}
                            </p>
                        </CardHeader>
                        <CardDescription className="text-center">Pour vendre régulièrement</CardDescription>
                        <CardContent className="flex-1">
                            <ul className="mt-6 space-y-2.5 text-sm">
                                <li className="flex items-center"><CheckIcon className="w-4 h-4 mr-2" />Articles illimités</li>
                                <li className="flex items-center"><CheckIcon className="w-4 h-4 mr-2" />Export CSV</li>
                                <li className="flex items-center"><CheckIcon className="w-4 h-4 mr-2" />Alertes de stock</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">
                                Choisir Pro ({isAnnual ? "19€/mois" : "24€/mois"})
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Business */}
                    <Card className="flex flex-col">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="mb-6">Business</CardTitle>
                            <span className="font-bold text-4xl">
                                {isAnnual ? "39€" : "49€"}
                            </span>
                            <p className="text-sm text-muted-foreground">
                                /mois {isAnnual ? "(facturation annuelle)" : "(facturation mensuelle)"}
                            </p>
                        </CardHeader>
                        <CardDescription className="text-center">Pour scaler efficacement</CardDescription>
                        <CardContent className="flex-1">
                            <ul className="mt-6 space-y-2.5 text-sm">
                                <li className="flex items-center"><CheckIcon className="w-4 h-4 mr-2" />Assistant IA</li>
                                <li className="flex items-center"><CheckIcon className="w-4 h-4 mr-2" />Support prioritaire</li>
                                <li className="flex items-center"><CheckIcon className="w-4 h-4 mr-2" />Multi-utilisateur</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">
                                Choisir Business ({isAnnual ? "39€/mois" : "49€/mois"})
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Table de comparaison */}
                <div className="mt-20">
                    <h2 className="text-2xl font-semibold mb-6 text-center">Comparer les fonctionnalités</h2>
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
                                        <TableCell colSpan={4} className="font-bold">{section.type}</TableCell>
                                    </TableRow>
                                    {section.features.map((f) => (
                                        <TableRow key={f.name}>
                                            <TableCell>{f.name}</TableCell>
                                            <TableCell className="text-center">
                                                {f.starter ? <CheckIcon className="mx-auto w-5 h-5" /> : <MinusIcon className="mx-auto w-5 h-5" />}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {f.pro ? <CheckIcon className="mx-auto w-5 h-5" /> : <MinusIcon className="mx-auto w-5 h-5" />}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {f.business ? <CheckIcon className="mx-auto w-5 h-5" /> : <MinusIcon className="mx-auto w-5 h-5" />}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DashboardLayout>
    );
}