"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createClient } from "../../../../utils/supabase/client";
import { SalesChart } from "@/components/charts/SalesChart";
import Link from "next/link";

interface ArticleProfit {
    id: string;
    name: string;
    totalProfit: number;
}

interface StockAlert {
    id: string;
    name: string;
    remaining: number;
}

export default function DashboardPage() {
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [totalStock, setTotalStock] = useState(0);
    const [listedItems, setListedItems] = useState(0);
    const [averageMargin, setAverageMargin] = useState(0);
    const [topProfitableArticles, setTopProfitableArticles] = useState<ArticleProfit[]>([]);
    const [criticalStockArticles, setCriticalStockArticles] = useState<StockAlert[]>([]);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data: articles, error: articlesError } = await supabase
                .from("articles")
                .select("id, name, unit_cost, quantity")
                .eq("user_id", user.id);

            const { data: sales, error: salesError } = await supabase
                .from("sales")
                .select("article_id, sale_price");

            if (articlesError) console.error("[ERROR] Articles fetch:", articlesError);
            if (salesError) console.error("[ERROR] Sales fetch:", salesError);
            if (!articles || !sales) return;

            const salesByArticle = sales.reduce((acc, sale) => {
                if (!acc[sale.article_id]) acc[sale.article_id] = [];
                acc[sale.article_id].push(sale);
                return acc;
            }, {});

            let revenue = 0;
            let profit = 0;
            let stock = 0;
            let totalMarginPercent = 0;
            let marginCount = 0;
            const profitByArticle: ArticleProfit[] = [];
            const criticalStock: StockAlert[] = [];

            for (const article of articles) {
                const unitCost = article.unit_cost ?? 0;
                const quantity = article.quantity ?? 0;
                const salesForArticle = salesByArticle[article.id] || [];

                const soldQty = salesForArticle.length;
                const remainingStock = quantity - soldQty;

                stock += remainingStock;

                let articleProfit = 0;
                for (const sale of salesForArticle) {
                    if (sale.sale_price !== null && unitCost !== null) {
                        revenue += sale.sale_price;
                        const margin = sale.sale_price - unitCost;
                        profit += margin;
                        articleProfit += margin;
                        if (unitCost > 0) {
                            totalMarginPercent += (margin / unitCost) * 100;
                            marginCount++;
                        }
                    }
                }

                profitByArticle.push({
                    id: article.id,
                    name: article.name,
                    totalProfit: articleProfit,
                });

                if (remainingStock < 3) {
                    criticalStock.push({
                        id: article.id,
                        name: article.name,
                        remaining: remainingStock,
                    });
                }
            }

            const averageMarginPercent = marginCount > 0 ? totalMarginPercent / marginCount : 0;
            const top5 = profitByArticle
                .sort((a, b) => b.totalProfit - a.totalProfit)
                .slice(0, 5);

            setTotalRevenue(revenue);
            setTotalProfit(profit);
            setTotalStock(stock);
            setAverageMargin(averageMarginPercent);
            setTopProfitableArticles(top5);
            setCriticalStockArticles(criticalStock);
        };

        fetchData();
    }, []);

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Tableau de bord</h2>
                <Link href="/articles">
                    <Button variant="default">📤 Mettre en vente un article</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Chiffre d&apos;affaires</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Bénéfice total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">€{totalProfit.toFixed(2)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Stock restant</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{totalStock}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Articles en vente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{listedItems}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Marge moyenne</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{averageMargin.toFixed(1)}%</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <SalesChart />
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 produits les plus rentables</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside text-sm">
                            {topProfitableArticles.map((article) => (
                                <li key={article.id}>
                                    {article.name} — <strong>{article.totalProfit.toFixed(2)} €</strong>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>🛑 Stock critique (&lt; 3)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {criticalStockArticles.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Aucun article en stock critique.</p>
                        ) : (
                            <ul className="list-disc list-inside text-sm text-red-600">
                                {criticalStockArticles.map((article) => (
                                    <li key={article.id}>
                                        {article.name} — <strong>{article.remaining}</strong> restant(s)
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
