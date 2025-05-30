"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { createClient } from "../../../../utils/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { format } from "date-fns";
import ArticleImage from "@/components/ArticleImage";
import { useUserPlan } from "@/contexts/UserPlanContext";
import { usePlanAction } from "@/components/PlanProtection";
import { ProLock } from "@/components/ui/pro-lock";

interface LogisticsItem {
    id: string;
    user_id: string;
    name: string;
    unit_price: number;
    quantity: number;
    used_per_sale: number;
    created_at: string;
    purchase_date: string;
    purchase_link?: string;
}

export default function StatisticsPage() {
    const supabase = createClient();
    const { plan } = useUserPlan();
    const { handleAction } = usePlanAction();

    const [overview, setOverview] = useState<{
        revenue: number;
        profit: number;
        investedAmount: number;
        totalSales: number;
        totalSoldUnits: number;
        totalRemainingUnits: number;
        totalArticles: number;
        averageSaleTime: number;
        averageLogisticsCostPerSale: number;
        averageMarginPerArticle: number;
        stockTurnoverRate: number;
        currentStockValue: number;
        averageSalesPerDay: number;
    } | null>(null);
    const [ranking, setRanking] = useState<
        { id: string; name: string; totalProfit: number; salesCount: number }[]
    >([]);
    const [fastestSelling, setFastestSelling] = useState<
        { id: string; name: string; avgDays: number; salesCount: number }[]
    >([]);
    const [lowStockArticles, setLowStockArticles] = useState<
        { id: string; name: string; remaining: number }[]
    >([]);
    const [, setAverageSaleTime] = useState<number | null>(null);
    const [, setLogisticsCost] = useState(0);

    const [filteredStats, setFilteredStats] = useState<{ revenue: number; profit: number } | null>(null);
    const [filteredSales, setFilteredSales] = useState<Array<{
        id: string;
        name: string;
        sale_price: number;
        sale_date: string;
        unit_cost: number;
        image_url: string;
    }>>([]);
    const [dateRange, setDateRange] = useState({
        start: "",
        end: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!plan) return;

            handleAction(async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: sales } = await supabase
                    .from("sales")
                    .select("sale_price, sale_date, article:article_id(unit_cost, user_id, purchase_date)")
                    .eq("article.user_id", user.id);

                if (!sales) return;

                const { data: logisticsItems } = await supabase
                    .from("logistics_items")
                    .select("*")
                    .eq("user_id", user.id);

                const logisticsCost = logisticsItems?.reduce((acc: number, item: LogisticsItem) => {
                    return acc + (item.unit_price ?? 0);
                }, 0) || 0;
                setLogisticsCost(logisticsCost);

                const { data: articles } = await supabase
                    .from("articles")
                    .select("id, unit_cost, quantity, name")
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
                let totalMargin = 0;
                let marginCount = 0;
                let currentStockValue = 0;

                for (const sale of sales) {
                    const price = sale.sale_price ?? 0;
                    const articleData = sale.article as { unit_cost?: number } | null;
                    const cost = articleData?.unit_cost ?? 0;
                    revenue += price;
                    profit += price - cost;

                    if (cost > 0) {
                        totalMargin += (price - cost) / cost;
                        marginCount++;
                    }
                }

                let totalSoldUnits = 0;
                let totalRemainingUnits = 0;
                let totalArticles = 0;
                const totalSales = sales.length;

                for (const article of articles || []) {
                    const soldQty = salesMap[article.id] || 0;
                    const remainingQty = article.quantity - soldQty;
                    const articleValue = remainingQty * article.unit_cost;
                    currentStockValue += articleValue;
                    investedAmount += articleValue;
                    totalSoldUnits += soldQty;
                    totalRemainingUnits += remainingQty;
                    totalArticles += article.quantity;
                }

                let totalDaysOnSale = 0;
                let countedSales = 0;
                let firstSaleDate: Date | null = null;
                let lastSaleDate: Date | null = null;

                for (const sale of sales) {
                    const saleDate = new Date(sale.sale_date);
                    if (!firstSaleDate || saleDate < firstSaleDate) {
                        firstSaleDate = saleDate;
                    }
                    if (!lastSaleDate || saleDate > lastSaleDate) {
                        lastSaleDate = saleDate;
                    }

                    const articleData = sale.article as { purchase_date?: string | null };
                    const purchaseDate = new Date(articleData?.purchase_date ?? "");
                    if (!isNaN(purchaseDate.getTime()) && !isNaN(saleDate.getTime())) {
                        const daysDiff = Math.floor((saleDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
                        totalDaysOnSale += daysDiff;
                        countedSales++;
                    }
                }

                const avgSaleTime = countedSales > 0 ? Math.round(totalDaysOnSale / countedSales) : 0;
                const averageLogisticsCostPerSale = totalSales > 0 ? logisticsCost / totalSales : 0;
                const averageMarginPerArticle = marginCount > 0 ? (totalMargin / marginCount) * 100 : 0;
                const stockTurnoverRate = totalArticles > 0 ? (totalSoldUnits / totalArticles) * 100 : 0;

                // Calcul des ventes par jour en moyenne
                let averageSalesPerDay = 0;
                if (firstSaleDate && lastSaleDate) {
                    const daysDiff = Math.max(1, Math.floor((lastSaleDate.getTime() - firstSaleDate.getTime()) / (1000 * 60 * 60 * 24)));
                    averageSalesPerDay = totalSales / daysDiff;
                }

                setOverview({
                    revenue,
                    profit,
                    investedAmount,
                    totalSales,
                    totalSoldUnits,
                    totalRemainingUnits,
                    totalArticles,
                    averageSaleTime: avgSaleTime,
                    averageLogisticsCostPerSale,
                    averageMarginPerArticle,
                    stockTurnoverRate,
                    currentStockValue,
                    averageSalesPerDay
                });

                setAverageSaleTime(avgSaleTime);

                const { data: salesWithAllDates } = await supabase
                    .from("sales")
                    .select("article_id, sale_date, article:article_id(name, purchase_date)")
                    .eq("article.user_id", user.id);

                const articleSalesMap = new Map<
                    string,
                    { name: string; totalDays: number; count: number }
                >();

                for (const sale of salesWithAllDates || []) {
                    const articleData = sale.article as { name?: string; purchase_date?: string | null };
                    const articleId = sale.article_id;
                    const purchaseDate = new Date(articleData.purchase_date ?? "");
                    const saleDate = new Date(sale.sale_date);
                    if (!articleId || isNaN(purchaseDate.getTime()) || isNaN(saleDate.getTime())) continue;

                    const name = articleData.name ?? "Inconnu";
                    const diff = Math.floor((saleDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

                    if (!articleSalesMap.has(articleId)) {
                        articleSalesMap.set(articleId, { name, totalDays: 0, count: 0 });
                    }

                    const entry = articleSalesMap.get(articleId)!;
                    entry.totalDays += diff;
                    entry.count += 1;
                }

                const rankedFastest = Array.from(articleSalesMap.entries())
                    .map(([id, entry]) => ({
                        id,
                        name: entry.name,
                        avgDays: Math.round(entry.totalDays / entry.count),
                        salesCount: entry.count,
                    }))
                    .sort((a, b) => a.avgDays - b.avgDays)
                    .slice(0, 5);

                setFastestSelling(rankedFastest);

                const { data: salesForRanking } = await supabase
                    .from("sales")
                    .select("article_id, sale_price, article:article_id(name, unit_cost, user_id)")
                    .eq("article.user_id", user.id);

                if (!salesForRanking) return;

                const profitMap = new Map<
                    string,
                    { name: string; totalProfit: number; salesCount: number }
                >();

                for (const sale of salesForRanking) {
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

                const { data: articlesForLowStock } = await supabase
                    .from("articles")
                    .select("id, name, quantity")
                    .eq("user_id", user.id);

                const { data: salesForLowStock } = await supabase.from("sales").select("article_id");

                if (!articlesForLowStock || !salesForLowStock) return;

                const salesCount = salesForLowStock.reduce((acc, sale) => {
                    acc[sale.article_id] = (acc[sale.article_id] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                const lowStock = articlesForLowStock
                    .map((article) => {
                        const sold = salesCount[article.id] || 0;
                        const remaining = article.quantity - sold;
                        return {
                            id: article.id,
                            name: article.name,
                            remaining,
                        };
                    })
                    .filter((item) => item.remaining < 3 && item.remaining > 0);

                setLowStockArticles(lowStock);
            });
        };

        fetchData();
    }, [plan, handleAction]);

    const handleDateFilter = async () => {
        if (!plan) return;

        handleAction(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !dateRange.start || !dateRange.end) return;

            const { data: sales } = await supabase
                .from("sales")
                .select("id, sale_price, sale_date, article:article_id(name, unit_cost, image_url, user_id)")
                .eq("article.user_id", user.id)
                .gte("sale_date", dateRange.start)
                .lte("sale_date", dateRange.end);

            if (!sales) return;

            let revenue = 0;
            let profit = 0;

            const formattedSales = sales.map(sale => {
                const price = sale.sale_price ?? 0;
                const articleData = sale.article as { unit_cost?: number; name?: string; image_url?: string } | null;
                const cost = articleData?.unit_cost ?? 0;
                revenue += price;
                profit += price - cost;

                return {
                    id: sale.id,
                    name: articleData?.name ?? "Inconnu",
                    sale_price: price,
                    sale_date: sale.sale_date,
                    unit_cost: cost,
                    image_url: articleData?.image_url ?? "",
                };
            });

            setFilteredStats({ revenue, profit });
            setFilteredSales(formattedSales);
        });
    };

    return (
        <DashboardLayout>
            <ProLock
                isPro={plan === "pro"}
                title="Statistiques Pro"
                description="Passez au plan Pro pour accéder à toutes vos statistiques détaillées"
            >
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
                                        <CardHeader><CardTitle>Bénéfice brut</CardTitle></CardHeader>
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

                                    <Card className="shadow-sm">
                                        <CardHeader><CardTitle>Temps moyen de vente</CardTitle></CardHeader>
                                        <CardContent>
                                            <p className="text-2xl font-bold">{overview?.averageSaleTime ?? 0} jours</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="shadow-sm">
                                        <CardHeader><CardTitle>Coût logistique moyen/vente</CardTitle></CardHeader>
                                        <CardContent>
                                            <p className="text-2xl font-bold">{overview?.averageLogisticsCostPerSale.toFixed(2) ?? "0.00"} €</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="shadow-sm">
                                        <CardHeader><CardTitle>Marge moyenne par article</CardTitle></CardHeader>
                                        <CardContent>
                                            <p className="text-2xl font-bold">{overview?.averageMarginPerArticle.toFixed(1) ?? "0.0"}%</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="shadow-sm">
                                        <CardHeader><CardTitle>Taux de rotation du stock</CardTitle></CardHeader>
                                        <CardContent>
                                            <p className="text-2xl font-bold">{overview?.stockTurnoverRate.toFixed(1) ?? "0.0"}%</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="shadow-sm">
                                        <CardHeader><CardTitle>Valeur du stock actuel</CardTitle></CardHeader>
                                        <CardContent>
                                            <p className="text-2xl font-bold">{overview?.currentStockValue.toFixed(2) ?? "0.00"} €</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="shadow-sm">
                                        <CardHeader><CardTitle>Ventes par jour (moy.)</CardTitle></CardHeader>
                                        <CardContent>
                                            <p className="text-2xl font-bold">{overview?.averageSalesPerDay.toFixed(1) ?? "0.0"}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
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
                                    <Input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) =>
                                            setDateRange((prev) => ({ ...prev, start: e.target.value }))
                                        }
                                    />
                                    <Input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) =>
                                            setDateRange((prev) => ({ ...prev, end: e.target.value }))
                                        }
                                    />
                                    <Button
                                        onClick={handleDateFilter}
                                        variant="default"
                                    >
                                        Filtrer
                                    </Button>
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

                                {filteredSales.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold mb-4">Articles vendus pendant cette période</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {filteredSales.map((sale) => {
                                                const benefit = sale.sale_price - sale.unit_cost;
                                                const margin = (benefit / sale.unit_cost) * 100;

                                                return (
                                                    <Card key={sale.id} className="p-4">
                                                        <div className="flex items-start gap-4">
                                                            <ArticleImage className="w-20 h-20 relative" url={sale.image_url} />
                                                            <div className="flex-1">
                                                                <h4 className="font-medium mb-2">{sale.name}</h4>
                                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                                    <p>Prix de vente : {sale.sale_price.toFixed(2)} €</p>
                                                                    <p>Prix d&apos;achat : {sale.unit_cost.toFixed(2)} €</p>
                                                                    <p>Bénéfice : {benefit.toFixed(2)} €</p>
                                                                    <p>Marge : {margin.toFixed(1)}% (x{(1 + margin / 100).toFixed(2)})</p>
                                                                    <p className="text-muted-foreground">
                                                                        Date : {format(new Date(sale.sale_date), "dd/MM/yyyy")}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                        </div>
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
                                    <table className="w-full text-sm mt-4 border border-border">
                                        <thead>
                                            <tr className="bg-muted">
                                                <th className="text-left p-2 border-b border-border">Article</th>
                                                <th className="text-left p-2 border-b border-border">Ventes</th>
                                                <th className="text-left p-2 border-b border-border">Bénéfice total (€)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ranking.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="p-2 border-b border-border">
                                                        <Link href={`/articles/${item.id}/sales`} className="text-primary hover:text-primary/90 hover:underline">
                                                            {item.name}
                                                        </Link>
                                                    </td>
                                                    <td className="p-2 border-b border-border">{item.salesCount}</td>
                                                    <td className="p-2 border-b border-border">
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
                        <Card className="mt-10">
                            <CardHeader>
                                <CardTitle>Top 5 des articles les plus rapides à vendre</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {fastestSelling.length > 0 ? (
                                    <table className="w-full text-sm mt-4 border border-border">
                                        <thead>
                                            <tr className="bg-muted">
                                                <th className="text-left p-2 border-b border-border">Article</th>
                                                <th className="text-left p-2 border-b border-border">Ventes</th>
                                                <th className="text-left p-2 border-b border-border">Temps moyen (jours)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fastestSelling.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="p-2 border-b border-border">
                                                        <Link href={`/articles/${item.id}/sales`} className="text-primary hover:text-primary/90 hover:underline">
                                                            {item.name}
                                                        </Link>
                                                    </td>
                                                    <td className="p-2 border-b border-border">{item.salesCount}</td>
                                                    <td className="p-2 border-b border-border">{item.avgDays}</td>
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
                                                <Link href={`/articles/${article.id}/sales`} className="text-primary hover:text-primary/90 hover:underline">
                                                    {article.name}
                                                </Link> — Stock restant :{" "}
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
            </ProLock>
        </DashboardLayout>
    );
}