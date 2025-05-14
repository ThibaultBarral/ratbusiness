"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../utils/supabase/client";
import { SalesChart } from "@/components/charts/SalesChart";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { isSameMonth, isSameYear, subDays, isAfter } from "date-fns";
import { FomoMessage } from "@/components/ui/fomo-message";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { useUserPlan } from "@/contexts/UserPlanContext";
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
    const [, setTotalStock] = useState(0);
    const [averageMargin, setAverageMargin] = useState(0);
    const [topProfitableArticles, setTopProfitableArticles] = useState<ArticleProfit[]>([]);
    const [criticalStockArticles, setCriticalStockArticles] = useState<StockAlert[]>([]);
    const [growthRate, setGrowthRate] = useState<string | null>(null);
    const [profitGrowthRate, setProfitGrowthRate] = useState<string | null>(null);
    const [marginGrowthRate, setMarginGrowthRate] = useState<string | null>(null);
    const [weeklyProfit, setWeeklyProfit] = useState<number>(0);
    const [projectedRevenue, setProjectedRevenue] = useState<number>(0);
    const [logisticsCost, setLogisticsCost] = useState(0);
    const supabase = createClient();
    const router = useRouter();
    const { plan } = useUserPlan();

    const filterOptions = [
        { value: "7days", label: "7 derniers jours" },
        { value: "30days", label: "30 derniers jours" },
        { value: "month", label: "Mois en cours" },
        { value: "year", label: "Année en cours" },
    ];
    const [filter, setFilter] = useState<"7days" | "30days" | "month" | "year">("30days");

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            }
        };

        checkAuth();
    }, [supabase, router]);

    const [showReport] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("showReport");
            return saved !== null ? JSON.parse(saved) : true;
        }
        return true;
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("showReport", JSON.stringify(showReport));
        }
    }, [showReport]);

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
                .select("article_id, sale_price, sale_date");

            if (articlesError) console.error("[ERROR] Articles fetch:", articlesError);
            if (salesError) console.error("[ERROR] Sales fetch:", salesError);
            if (!articles || !sales) return;

            // Filtrage selon la période pour les métriques (hors stock)
            const today = new Date();
            let filteredSales: typeof sales = [];
            let previousFilteredSales: typeof sales = [];

            if (filter === "7days") {
                filteredSales = sales.filter((sale) => {
                    const saleDate = new Date(sale.sale_date);
                    return isAfter(saleDate, subDays(today, 7));
                });
                previousFilteredSales = sales.filter((sale) => {
                    const saleDate = new Date(sale.sale_date);
                    return isAfter(saleDate, subDays(today, 14)) && isAfter(subDays(today, 7), saleDate);
                });
            } else if (filter === "30days") {
                filteredSales = sales.filter((sale) => {
                    const saleDate = new Date(sale.sale_date);
                    return isAfter(saleDate, subDays(today, 30));
                });
                previousFilteredSales = sales.filter((sale) => {
                    const saleDate = new Date(sale.sale_date);
                    return isAfter(saleDate, subDays(today, 60)) && isAfter(subDays(today, 30), saleDate);
                });
            } else if (filter === "month") {
                filteredSales = sales.filter((sale) => isSameMonth(new Date(sale.sale_date), today));
                previousFilteredSales = sales.filter((sale) => {
                    const saleDate = new Date(sale.sale_date);
                    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    return isSameMonth(saleDate, prevMonth);
                });
            } else if (filter === "year") {
                filteredSales = sales.filter((sale) => isSameYear(new Date(sale.sale_date), today));
                previousFilteredSales = sales.filter((sale) => {
                    const saleDate = new Date(sale.sale_date);
                    const prevYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
                    return isSameYear(saleDate, prevYear);
                });
            } else {
                filteredSales = sales;
                previousFilteredSales = [];
            }

            // Calcul du bénéfice de la semaine en cours
            let profitThisWeek = 0;
            for (const sale of filteredSales) {
                const article = articles.find((a) => a.id === sale.article_id);
                if (!article) continue;
                const unitCost = article.unit_cost ?? 0;
                if (sale.sale_price !== null && unitCost !== null) {
                    profitThisWeek += (sale.sale_price - unitCost);
                }
            }
            setWeeklyProfit(profitThisWeek);

            // Projection de CA mensuel
            const currentMonthSales = sales.filter((sale) => isSameMonth(new Date(sale.sale_date), today));
            const revenueSoFar = currentMonthSales.reduce((sum, sale) => sum + sale.sale_price, 0);
            const daysPassed = today.getDate();
            const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            const projectedRevenue = (revenueSoFar / daysPassed) * totalDays;
            setProjectedRevenue(projectedRevenue);

            // Stock restant (quantity) doit être global, pas filtré
            let stock = 0;
            for (const article of articles) {
                const quantity = article.quantity ?? 0;
                const salesForArticle = sales.filter(sale => sale.article_id === article.id);
                const soldQty = salesForArticle.length;
                const remainingStock = quantity - soldQty;
                stock += remainingStock;
            }

            // Calcul des métriques filtrées
            const salesByArticle = filteredSales.reduce((acc: Record<string, typeof sales>, sale) => {
                if (!acc[sale.article_id]) acc[sale.article_id] = [];
                acc[sale.article_id].push(sale);
                return acc;
            }, {});

            let revenue = 0;
            let profit = 0;
            let totalMarginPercent = 0;
            let marginCount = 0;
            const profitByArticle: ArticleProfit[] = [];
            const criticalStock: StockAlert[] = [];

            for (const article of articles) {
                const unitCost = article.unit_cost ?? 0;
                const salesForArticle = salesByArticle[article.id] || [];

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

                // Stock critique (toujours global)
                const quantity = article.quantity ?? 0;
                const salesForArticleAll = sales.filter(sale => sale.article_id === article.id);
                const soldQtyAll = salesForArticleAll.length;
                const remainingStock = quantity - soldQtyAll;
                if (remainingStock < 3 && remainingStock > 0) {
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

            // === Récupération items logistiques et calcul coût logistique (addition simple des unit_price) ===
            const { data: logisticsItems } = await supabase
                .from("logistics_items")
                .select("*")
                .eq("user_id", user.id);

            const logisticsCost =
                logisticsItems?.reduce((acc: number, item: LogisticsItem) => {
                    if (!item.purchase_date) return acc;

                    const purchaseDate = new Date(item.purchase_date);
                    const isInPeriod =
                        (filter === "7days" && isAfter(purchaseDate, subDays(today, 7))) ||
                        (filter === "30days" && isAfter(purchaseDate, subDays(today, 30))) ||
                        (filter === "month" && isSameMonth(purchaseDate, today)) ||
                        (filter === "year" && isSameYear(purchaseDate, today));

                    return isInPeriod ? acc + (item.unit_price ?? 0) : acc;
                }, 0) || 0;
            setLogisticsCost(logisticsCost);
            // === Fin logistique ===

            // Calcul des indicateurs de croissance selon la période sélectionnée
            // Chiffre d'affaires
            const prevRevenue = previousFilteredSales.reduce((acc, sale) => acc + (sale.sale_price ?? 0), 0) || 1;
            const growthRate = (((revenue - prevRevenue) / prevRevenue) * 100).toFixed(1);

            // Bénéfice
            const prevProfit = previousFilteredSales.reduce((acc, sale) => {
                const article = articles.find((a) => a.id === sale.article_id);
                if (!article) return acc;
                const unitCost = article.unit_cost ?? 0;
                return acc + (sale.sale_price - unitCost);
            }, 0) || 1;
            const profitGrowth = (((profit - prevProfit) / prevProfit) * 100).toFixed(1);

            // Marge moyenne
            let prevTotalMarginPercent = 0;
            let prevMarginCount = 0;
            for (const sale of previousFilteredSales) {
                const article = articles.find((a) => a.id === sale.article_id);
                if (!article) continue;
                const unitCost = article.unit_cost ?? 0;
                if (unitCost > 0) {
                    prevTotalMarginPercent += ((sale.sale_price - unitCost) / unitCost) * 100;
                    prevMarginCount++;
                }
            }
            const prevAverageMarginPercent = prevMarginCount > 0 ? prevTotalMarginPercent / prevMarginCount : 1;
            const marginGrowth = (((averageMarginPercent - prevAverageMarginPercent) / prevAverageMarginPercent) * 100).toFixed(1);

            setGrowthRate(growthRate);
            setProfitGrowthRate(profitGrowth);
            setMarginGrowthRate(marginGrowth);
        };

        fetchData();
    }, [filter]);

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Tableau de bord</h2>
                    <FomoMessage
                        profit={weeklyProfit}
                        filter={filter}
                        growthRate={growthRate}
                        profitGrowthRate={profitGrowthRate}
                        marginGrowthRate={marginGrowthRate}
                    />
                    {/* Projection du chiffre d'affaires ce mois-ci */}
                    {filter === "month" && projectedRevenue > 0 && (
                        <div className="mt-3 p-3 rounded-md bg-indigo-50 text-indigo-800 text-sm font-medium border border-indigo-300 shadow-sm">
                            🔮 Projection du chiffre d&apos;affaires ce mois-ci : {projectedRevenue.toFixed(2)} €
                        </div>
                    )}
                </div>
                <Link href="/articles">
                    <Button variant="default">📤 Mettre en vente un article</Button>
                </Link>
            </div>

            {/* Filtres de période */}
            <div className="flex flex-wrap gap-2 items-center mb-6">
                <span className="font-medium">Période :</span>
                {filterOptions.map((option) => (
                    <Button
                        key={option.value}
                        type="button"
                        variant={filter === option.value ? "default" : "outline"}
                        onClick={() => setFilter(option.value as "7days" | "30days" | "month" | "year")}
                    >
                        {option.label}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Chiffre d&apos;affaires</CardTitle>
                        {growthRate && (
                            <div className={`flex items-center gap-1 text-xs font-medium rounded px-2 py-1 ml-auto w-fit ${parseFloat(growthRate) >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
                                {parseFloat(growthRate) >= 0 ? (
                                    <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                    <ArrowDownRight className="w-3 h-3" />
                                )}
                                {parseFloat(growthRate) >= 0 ? "+" : ""}{growthRate}%
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{totalRevenue.toFixed(2)} €</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Bénéfice brut</CardTitle>
                        {profitGrowthRate && (
                            <div className={`flex items-center gap-1 text-xs font-medium rounded px-2 py-1 ml-auto w-fit ${parseFloat(profitGrowthRate) >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
                                {parseFloat(profitGrowthRate) >= 0 ? (
                                    <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                    <ArrowDownRight className="w-3 h-3" />
                                )}
                                {parseFloat(profitGrowthRate) >= 0 ? "+" : ""}{profitGrowthRate}%
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{totalProfit.toFixed(2)} €</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Marge moyenne</CardTitle>
                        {marginGrowthRate && (
                            <div className={`flex items-center gap-1 text-xs font-medium rounded px-2 py-1 ml-auto w-fit ${parseFloat(marginGrowthRate) >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
                                {parseFloat(marginGrowthRate) >= 0 ? (
                                    <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                    <ArrowDownRight className="w-3 h-3" />
                                )}
                                {parseFloat(marginGrowthRate) >= 0 ? "+" : ""}{marginGrowthRate}%
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{(1 + averageMargin / 100).toFixed(1)}x</p>
                    </CardContent>
                </Card>

                {/* <Card>
                    <CardHeader>
                        <CardTitle>Stock restant</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{totalStock}</p>
                    </CardContent>
                </Card> */}

                {/* Nouvelle carte Bénéfice net */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            Bénéfice net <span className="text-xs opacity-50">(hors log.)</span>
                            {plan === "starter" && (
                                <div className="flex items-center gap-1">
                                    <Badge variant="secondary" className="text-xs">PRO</Badge>
                                    <Lock className="w-3 h-3 text-muted-foreground" />
                                </div>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {plan === "starter" ? (
                            <div className="text-sm text-muted-foreground">
                                Passez au plan Pro pour voir votre bénéfice net
                            </div>
                        ) : (
                            <p className="text-2xl font-bold">{(totalProfit - logisticsCost).toFixed(2)} €</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <ProLock
                    isPro={plan === "pro"}
                    title="Débloquez le graphique complet"
                    description="Visualisez l'évolution de vos ventes et prenez de meilleures décisions"
                >
                    <SalesChart filter={filter} />
                </ProLock>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
                <ProLock
                    isPro={plan === "pro"}
                    title="Top 5 produits les plus rentables"
                    description="Découvrez vos produits les plus rentables et optimisez votre stratégie"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 5 produits les plus rentables</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-sm">
                                {topProfitableArticles.map((article) => (
                                    <li key={article.id}>
                                        <Link href={`/articles/${article.id}/sales`} className="hover:underline">
                                            {article.name} — <strong>{article.totalProfit.toFixed(2)} €</strong>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </ProLock>

                <ProLock
                    isPro={plan === "pro"}
                    title="Stock critique"
                    description="Surveillez votre stock et évitez les ruptures"
                >
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
                                            <Link href={`/articles/${article.id}/sales`} className="hover:underline">
                                                {article.name} — <strong>{article.remaining}</strong> restant(s)
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </ProLock>
            </div>
        </DashboardLayout>
    );
}
