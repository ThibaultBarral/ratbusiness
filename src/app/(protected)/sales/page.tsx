"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { createClient } from "../../../../utils/supabase/client";
import { format, subDays, startOfMonth, endOfMonth, isAfter, isBefore } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ArticleImage from "@/components/ArticleImage";
import { useUserPlan } from "@/contexts/UserPlanContext";
import { ProLock } from "@/components/ui/pro-lock";

type Sale = {
    id: string;
    sale_price: number;
    sale_date: string;
    status: string;
    articles: {
        id: string;
        name: string;
        unit_cost: number;
        image_url: string;
    }[];
    ads_cost?: number;
};

export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient(); // Create the Supabase client instance
    const [filter, setFilter] = useState("all");
    const { plan } = useUserPlan();

    const filteredSales = sales.filter((sale) => {
        const saleDate = new Date(sale.sale_date);
        if (filter === "last7days") {
            return isAfter(saleDate, subDays(new Date(), 7));
        } else if (filter === "lastMonth") {
            const start = startOfMonth(subDays(new Date(), 30));
            const end = endOfMonth(subDays(new Date(), 30));
            return isAfter(saleDate, start) && isBefore(saleDate, end);
        }
        return true;
    });

    const bestSales = [...sales]
        .sort((a, b) => {
            const aCost = a.articles[0]?.unit_cost || 0;
            const bCost = b.articles[0]?.unit_cost || 0;
            return (b.sale_price - bCost - (b.ads_cost || 0)) - (a.sale_price - aCost - (a.ads_cost || 0));
        })
        .slice(0, 10);

    const displayedSales = filter === "bestSales" ? bestSales : filteredSales;

    const totalSales = displayedSales.reduce((acc, sale) => acc + sale.sale_price, 0);

    useEffect(() => {
        const fetchSales = async () => {
            const { data, error } = await supabase
                .from("sales")
                .select(`
                    id,
                    sale_price,
                    sale_date,
                    status,
                    articles (
                        id,
                        name,
                        unit_cost,
                        image_url
                    ),
                    ads_cost
                `)
                .order("sale_date", { ascending: false });

            if (error) {
                console.error("Erreur récupération ventes :", error.message);
            } else {
                console.log("Données des ventes:", data);
                setSales(data || []);
            }
            setLoading(false);
        };

        fetchSales();
    }, []);

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold mb-6">Historique des ventes</h2>
            <div className="mb-4 flex space-x-2 items-center">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    onClick={() => setFilter("all")}
                >
                    Toutes
                </Button>
                {plan !== "starter" ? (
                    <div className="flex space-x-2">
                        <Button
                            variant={filter === "last7days" ? "default" : "outline"}
                            onClick={() => setFilter("last7days")}
                        >
                            7 derniers jours
                        </Button>
                        <Button
                            variant={filter === "lastMonth" ? "default" : "outline"}
                            onClick={() => setFilter("lastMonth")}
                        >
                            Mois dernier
                        </Button>
                        <Button
                            variant={filter === "bestSales" ? "default" : "outline"}
                            onClick={() => setFilter("bestSales")}
                        >
                            Meilleures ventes
                        </Button>
                    </div>
                ) : (
                    <ProLock
                        isPro={false}
                        inline
                        title="Débloquez les filtres avancés"
                        description="Visualisez l'évolution de vos ventes et prenez de meilleures décisions"
                        buttonText="Passer au plan Pro"
                    >
                        <></>
                    </ProLock>
                )}
            </div>
            <p>Total cumulé : {totalSales.toFixed(2)} €</p>
            {loading ? (
                <p>Chargement...</p>
            ) : displayedSales.length === 0 ? (
                <p className="text-muted-foreground">Aucune vente enregistrée pour le moment.</p>
            ) : (
                <div className="grid gap-4 mt-4">
                    {displayedSales.map((sale) => {
                        const article = Array.isArray(sale.articles) ? sale.articles[0] : sale.articles;
                        const purchasePrice = article?.unit_cost || 0;
                        const benefit = sale.sale_price - purchasePrice - (sale.ads_cost || 0);
                        return (
                            <div
                                key={sale.id}
                                className="border rounded-md p-4 bg-white text-black shadow-sm"
                            >
                                <div className="flex gap-4">
                                    <ArticleImage url={article?.image_url} />
                                    <div>
                                        <Link
                                            href={`/articles/${article?.id}/sales`}
                                            className="font-semibold text-lg hover:underline"
                                        >
                                            {article?.name || 'Article inconnu'}
                                        </Link>
                                        <p className="text-sm text-muted-foreground">
                                            Date : {format(new Date(sale.sale_date), "dd/MM/yyyy")}
                                        </p>
                                        <p className="text-sm">Prix d&apos;achat : {purchasePrice.toFixed(2)} €</p>
                                        <p className="text-sm">Prix de vente : {sale.sale_price.toFixed(2)} €</p>
                                        {sale.ads_cost != null && <p className="text-sm">Coût publicitaire : {sale.ads_cost.toFixed(2)} €</p>}
                                        <p className={`text-sm font-medium ${benefit < 0 ? "text-red-600" : "text-green-600"}`}>
                                            Bénéfice : {benefit.toFixed(2)} €
                                        </p>
                                        {sale.status === "returned" && (
                                            <p className="text-sm text-orange-600 mt-2 font-medium">Vente retournée</p>
                                        )}
                                        {sale.status !== "returned" && (
                                            <button
                                                onClick={async () => {
                                                    const { error } = await supabase.from("sales").update({ is_returned: true }).eq("id", sale.id);
                                                    if (!error) {
                                                        setSales((prev) =>
                                                            prev.map((s) =>
                                                                s.id === sale.id ? { ...s, status: "returned" } : s
                                                            )
                                                        );
                                                    } else {
                                                        alert("Erreur lors de la mise à jour : " + error.message);
                                                    }
                                                }}
                                                className="mt-2 text-sm text-blue-600 underline mr-4"
                                            >
                                                Marquer comme retour
                                            </button>
                                        )}
                                        <button
                                            onClick={async () => {
                                                const { error } = await supabase.from("sales").delete().eq("id", sale.id);
                                                if (!error) setSales((prev) => prev.filter((s) => s.id !== sale.id));
                                                else alert("Erreur lors de la suppression : " + error.message);
                                            }}
                                            className="mt-2 text-sm text-red-600 underline"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </DashboardLayout>
    );
}