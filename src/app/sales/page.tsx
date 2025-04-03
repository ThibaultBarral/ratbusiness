"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import { format, subDays, startOfMonth, endOfMonth, isAfter, isBefore } from "date-fns";
import { Button } from "@/components/ui/button";

type Sale = {
    id: string;
    sale_price: number;
    sale_date: string;
    status: string;
    articles: {
        name: string;
        unit_cost: number;
    };
};

export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient(); // Create the Supabase client instance
    const [filter, setFilter] = useState("all");

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
        .sort((a, b) => (b.sale_price - b.articles.unit_cost) - (a.sale_price - a.articles.unit_cost))
        .slice(0, 10);

    const displayedSales = filter === "bestSales" ? bestSales : filteredSales;

    const totalSales = sales.reduce((acc, sale) => acc + sale.sale_price, 0);

    useEffect(() => {
        const fetchSales = async () => {
            const { data, error } = await supabase
                .from("sales")
                .select("id, sale_price, sale_date, status, articles (name, unit_cost)")
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
            <div className="mb-4 flex space-x-2">
                <Button onClick={() => setFilter("all")}>Toutes</Button>
                <Button onClick={() => setFilter("last7days")}>7 derniers jours</Button>
                <Button onClick={() => setFilter("lastMonth")}>Mois dernier</Button>
                <Button onClick={() => setFilter("bestSales")}>Meilleures ventes</Button>
            </div>
            <p>Total cumulé : {totalSales.toFixed(2)} €</p>
            {loading ? (
                <p>Chargement...</p>
            ) : displayedSales.length === 0 ? (
                <p className="text-muted-foreground">Aucune vente enregistrée pour le moment.</p>
            ) : (
                <div className="grid gap-4 mt-4">
                    {displayedSales.map((sale) => {
                        const benefit = sale.sale_price - sale.articles.unit_cost;
                        return (
                            <div
                                key={sale.id}
                                className="border rounded-md p-4 bg-white text-black shadow-sm"
                            >
                                <h3 className="font-semibold text-lg">{sale.articles.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Date : {format(new Date(sale.sale_date), "dd/MM/yyyy")}
                                </p>
                                <p className="text-sm">Prix d&apos;achat : {sale.articles.unit_cost.toFixed(2)} €</p>
                                <p className="text-sm">Prix de vente : {sale.sale_price.toFixed(2)} €</p>
                                <p className={`text-sm font-medium ${benefit < 0 ? "text-red-600" : "text-green-600"}`}>
                                    Bénéfice : {benefit.toFixed(2)} €
                                </p>
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
                        );
                    })}
                </div>
            )}
        </DashboardLayout>
    );
}