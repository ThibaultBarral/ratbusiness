"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { createClient } from "../../../../utils/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function StatisticsPage() {
    const supabase = createClient();

    const [overview, setOverview] = useState<{
        revenue: number;
        profit: number;
        investedAmount: number;
        totalSales: number;
        totalSoldUnits: number;
        totalRemainingUnits: number;
        totalArticles: number;
    } | null>(null);
    const [ranking, setRanking] = useState<
        { id: string; name: string; totalProfit: number; salesCount: number }[]
    >([]);
    const [lowStockArticles, setLowStockArticles] = useState<
        { id: string; name: string; remaining: number }[]
    >([]);

    const [filteredStats, setFilteredStats] = useState<{ revenue: number; profit: number } | null>(null);
    const [dateRange, setDateRange] = useState({
        start: "",
        end: "",
    });

    useEffect(() => {
        const fetchOverview = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data: sales } = await supabase
                .from("sales")
                .select("sale_price, article:article_id(unit_cost, user_id)")
                .eq("article.user_id", user.id);

            if (!sales) return;

            const { data: articles } = await supabase
                .from("articles")
                .select("id, unit_cost, quantity")
                .eq("user_id", user.id);

            const { data: allSales } = await supabase
                .from("sales")
                .select("article_id");

            const salesMap = allSales?.reduce((acc, sale) => {
                acc[sale.article_id] = (acc[sale.article_id] || 0) + 1;
                return acc;
            }, {} as Record<string, number>) ?? {};

            let revenue = 0;
            let profit = 0;
            let investedAmount = 0;

            for (const sale of sales) {
                const price = sale.sale_price ?? 0;
                const articleData = sale.article as { unit_cost?: number } | null;
                const cost = articleData?.unit_cost ?? 0;
                revenue += price;
                profit += price - cost;
            }

            let totalSoldUnits = 0;
            let totalRemainingUnits = 0;
            let totalArticles = 0;
            const totalSales = sales.length;

            for (const article of articles || []) {
                const soldQty = salesMap[article.id] || 0;
                const remainingQty = article.quantity - soldQty;
                investedAmount += remainingQty * article.unit_cost;
                totalSoldUnits += soldQty;
                totalRemainingUnits += remainingQty;
                totalArticles += article.quantity;
            }

            setOverview({
                revenue,
                profit,
                investedAmount,
                totalSales,
                totalSoldUnits,
                totalRemainingUnits,
                totalArticles,
            });

        };

        fetchOverview();
    }, []);

    useEffect(() => {
        const fetchRanking = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data: sales } = await supabase
                .from("sales")
                .select("article_id, sale_price, article:article_id(name, unit_cost, user_id)")
                .eq("article.user_id", user.id);

            if (!sales) return;

            const profitMap = new Map<
                string,
                { name: string; totalProfit: number; salesCount: number }
            >();

            for (const sale of sales) {
                const articleId = sale.article_id;
                const articleData = sale.article as { name?: string; unit_cost?: number } | null;
                const name = articleData?.name ?? "Inconnu";
                const unitCost = articleData?.unit_cost ?? 0;
                const profit = sale.sale_price - unitCost;

                if (!profitMap.has(articleId)) {
                    profitMap.set(articleId, { name, totalProfit: 0, salesCount: 0 });
                }

                const entry = profitMap.get(articleId)!;
                entry.totalProfit += profit;
                entry.salesCount += 1;
            }

            const ranked = Array.from(profitMap.entries())
                .map(([id, entry]) => ({ id, ...entry }))
                .sort((a, b) => b.totalProfit - a.totalProfit)
                .slice(0, 5);

            setRanking(ranked);
        };

        fetchRanking();
    }, []);

    useEffect(() => {
        const fetchLowStockArticles = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data: articles } = await supabase
                .from("articles")
                .select("id, name, quantity")
                .eq("user_id", user.id);

            const { data: sales } = await supabase.from("sales").select("article_id");

            if (!articles || !sales) return;

            const salesCount = sales.reduce((acc, sale) => {
                acc[sale.article_id] = (acc[sale.article_id] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const lowStock = articles
                .map((article) => {
                    const sold = salesCount[article.id] || 0;
                    const remaining = article.quantity - sold;
                    return {
                        id: article.id,
                        name: article.name,
                        remaining,
                    };
                })
                .filter((item) => item.remaining < 3);

            setLowStockArticles(lowStock);
        };

        fetchLowStockArticles();
    }, []);

    const handleDateFilter = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user || !dateRange.start || !dateRange.end) return;

        const { data: sales } = await supabase
            .from("sales")
            .select("sale_price, sale_date, article:article_id(unit_cost, user_id)")
            .eq("article.user_id", user.id)
            .gte("sale_date", dateRange.start)
            .lte("sale_date", dateRange.end);

        if (!sales) return;

        let revenue = 0;
        let profit = 0;

        for (const sale of sales) {
            const price = sale.sale_price ?? 0;
            const articleData = sale.article as { unit_cost?: number } | null;
            const cost = articleData?.unit_cost ?? 0;
            revenue += price;
            profit += price - cost;
        }

        setFilteredStats({ revenue, profit });
    };

    return (
        <DashboardLayout>
            <Tabs defaultValue="overview" className="w-full space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Vue globale</TabsTrigger>
                    <TabsTrigger value="period">Analyse par période</TabsTrigger>
                    <TabsTrigger value="ranking">Classements</TabsTrigger>
                    <TabsTrigger value="lowstock">Articles faibles</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vue globale</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                                <Card className="shadow-sm">
                                    <CardHeader><CardTitle>Chiffre d&apos;affaires total</CardTitle></CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{overview?.revenue.toFixed(2) ?? "0.00"} €</p>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardHeader><CardTitle>Bénéfice net</CardTitle></CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{overview?.profit.toFixed(2) ?? "0.00"} €</p>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardHeader><CardTitle>Investissement restant</CardTitle></CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{overview?.investedAmount.toFixed(2) ?? "0.00"} €</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                                <Card className="shadow-sm">
                                    <CardHeader><CardTitle>Articles achetés</CardTitle></CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{overview?.totalArticles ?? 0}</p>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardHeader><CardTitle>Articles restants</CardTitle></CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{overview?.totalRemainingUnits ?? 0}</p>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardHeader><CardTitle>Articles vendus</CardTitle></CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{overview?.totalSoldUnits ?? 0}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                                <Card className="shadow-sm">
                                    <CardHeader><CardTitle>Nombre de ventes réalisées</CardTitle></CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{overview?.totalSales ?? 0}</p>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardHeader><CardTitle>Bénéfice moyen / vente</CardTitle></CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">
                                            {overview && overview.totalSales > 0
                                                ? `${(overview.profit / overview.totalSales).toFixed(2)} €`
                                                : "0.00 €"}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardHeader><CardTitle>Marge estimée sur stock restant</CardTitle></CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">
                                            {overview && overview.totalRemainingUnits > 0
                                                ? `${(((overview.revenue / overview.totalSoldUnits) * overview.totalRemainingUnits - overview.investedAmount) / overview.investedAmount * 100).toFixed(1)} %`
                                                : "0.0 %"}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>                    </Card>
                </TabsContent>

                <TabsContent value="period">
                    <Card>
                        <CardHeader>
                            <CardTitle>Analyse par période</CardTitle>
                            <CardDescription>
                                Filtrez les ventes entre deux dates pour voir les performances
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                <input
                                    type="date"
                                    className="border rounded px-3 py-2 text-sm"
                                    value={dateRange.start}
                                    onChange={(e) =>
                                        setDateRange((prev) => ({ ...prev, start: e.target.value }))
                                    }
                                />
                                <input
                                    type="date"
                                    className="border rounded px-3 py-2 text-sm"
                                    value={dateRange.end}
                                    onChange={(e) =>
                                        setDateRange((prev) => ({ ...prev, end: e.target.value }))
                                    }
                                />
                                <button
                                    onClick={handleDateFilter}
                                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm"
                                >
                                    Filtrer
                                </button>
                            </div>

                            {filteredStats && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Chiffre d&apos;affaires</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-2xl font-bold">
                                                {filteredStats.revenue.toFixed(2)} €
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Bénéfice total</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-2xl font-bold">
                                                {filteredStats.profit.toFixed(2)} €
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ranking">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 5 des articles les plus rentables</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {ranking.length > 0 ? (
                                <table className="w-full text-sm mt-4 border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="text-left p-2 border-b">Article</th>
                                            <th className="text-left p-2 border-b">Ventes</th>
                                            <th className="text-left p-2 border-b">Bénéfice total (€)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ranking.map((item) => (
                                            <tr key={item.id}>
                                                <td className="p-2 border-b">{item.name}</td>
                                                <td className="p-2 border-b">{item.salesCount}</td>
                                                <td className="p-2 border-b">
                                                    {item.totalProfit.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-muted-foreground mt-2">Aucune donnée disponible.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="lowstock">
                    <Card>
                        <CardHeader>
                            <CardTitle>🛑 Stock critique</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lowStockArticles.length > 0 ? (
                                <ul className="text-sm text-muted-foreground list-disc list-inside">
                                    {lowStockArticles.map((article) => (
                                        <li key={article.id}>
                                            {article.name} — Stock restant :{" "}
                                            <strong>{article.remaining}</strong>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">
                                    Aucun article en stock critique.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    );
}