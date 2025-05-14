"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "../../../../utils/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, differenceInDays, parseISO, subDays } from "date-fns";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import ArticleImage from "@/components/ArticleImage";
import { useUserPlan } from "@/contexts/UserPlanContext";
import { Badge } from "@/components/ui/badge";

interface Article {
    id: string;
    name: string;
    brand: string;
    quantity: number;
    unit_cost: number;
    platform: string;
    sales: { id: string; sale_date: string; sale_price: number }[];
    image_url?: string;
    purchase_date?: string;
}

// Calcule la valeur totale du stock restant
function calculateStockValue(articles: { quantity: number; unit_cost: number; sales: { sale_date: string }[] }[]) {
    return articles.reduce((total, article) => {
        const soldQty = article.sales?.length || 0;
        const remainingQty = article.quantity - soldQty;
        return total + remainingQty * article.unit_cost;
    }, 0);
}

function ArticlesTabs({
    articles,
    archivedArticles,
    loading,
    openDialog,
    handleDeleteArticle,
}: {
    articles: Article[];
    archivedArticles: Article[];
    loading: boolean;
    openDialog: (id: string) => void;
    handleDeleteArticle: (id: string) => void;
}) {
    const [tabValue, setTabValue] = useState("actifs");
    const [badgeFilter, setBadgeFilter] = useState<"all" | "top" | "flash">("all");
    const { plan } = useUserPlan();
    const isPro = plan !== "starter";

    return (
        <Tabs value={tabValue} onValueChange={setTabValue} className="w-full mt-6">
            <TabsList className="mb-4">
                <TabsTrigger value="actifs" className="text-muted-foreground data-[state=active]:text-primary">Actifs</TabsTrigger>
                <TabsTrigger value="archives" className="text-muted-foreground data-[state=active]:text-primary">Archivés</TabsTrigger>
            </TabsList>
            <TabsContent value="actifs">
                {loading ? (
                    <div className="rounded-md border border-muted p-4 text-sm text-muted-foreground">Chargement des articles...</div>
                ) : articles.length === 0 ? (
                    <div className="rounded-md border border-muted p-4 text-sm text-muted-foreground">
                        Aucun article trouvé.
                    </div>
                ) : (
                    <>
                        <div className="flex gap-2 mb-2">
                            <Button variant={badgeFilter === "all" ? "default" : "outline"} onClick={() => setBadgeFilter("all")}>
                                Tous
                            </Button>
                            <div className="relative group">
                                <Button
                                    variant="outline"
                                    disabled={!isPro}
                                    onClick={() => isPro && setBadgeFilter("top")}
                                    className={!isPro ? "opacity-60 cursor-not-allowed" : ""}
                                >
                                    🏅 Top Seller
                                    {!isPro && <Badge variant="secondary" className="ml-2">PRO</Badge>}
                                </Button>
                                {!isPro && (
                                    <div className="absolute z-10 left-0 top-full mt-1 text-xs text-muted-foreground bg-white border rounded shadow px-2 py-1 opacity-0 group-hover:opacity-100 transition">
                                        Passez au plan Pro pour utiliser ce filtre
                                    </div>
                                )}
                            </div>
                            <div className="relative group">
                                <Button
                                    variant="outline"
                                    disabled={!isPro}
                                    onClick={() => isPro && setBadgeFilter("flash")}
                                    className={!isPro ? "opacity-60 cursor-not-allowed" : ""}
                                >
                                    ⚡ Flash Sale
                                    {!isPro && <Badge variant="secondary" className="ml-2">PRO</Badge>}
                                </Button>
                                {!isPro && (
                                    <div className="absolute z-10 left-0 top-full mt-1 text-xs text-muted-foreground bg-white border rounded shadow px-2 py-1 opacity-0 group-hover:opacity-100 transition">
                                        Passez au plan Pro pour utiliser ce filtre
                                    </div>
                                )}
                            </div>
                        </div>
                        {(() => {
                            const filteredArticles = articles.filter((article) => {
                                // Si l'utilisateur est sur le plan starter, on ignore les filtres
                                if (!isPro) return true;

                                const totalBenefit = article.sales?.reduce((sum, sale) => sum + (sale.sale_price - article.unit_cost), 0) || 0;
                                const isTopSeller = totalBenefit > 30;
                                const isQuickSale = article.purchase_date && article.sales.length > 0
                                    ? article.sales.some((sale) => {
                                        const purchaseDate = parseISO(article.purchase_date!);
                                        const saleDate = parseISO(sale.sale_date);
                                        const days = differenceInDays(saleDate, purchaseDate);
                                        return days >= 0 && days <= 7;
                                    })
                                    : false;
                                if (badgeFilter === "top") return isTopSeller;
                                if (badgeFilter === "flash") return isQuickSale;
                                return true;
                            });
                            return (
                                <div className="grid gap-4">
                                    {filteredArticles.map((article) => {
                                        const totalSales = article.sales?.length || 0;
                                        const remaining = article.quantity - totalSales;
                                        // Dates de vente triées
                                        const saleDates = article.sales?.map(sale => parseISO(sale.sale_date)).sort((a, b) => a.getTime() - b.getTime()) || [];
                                        // Vitesse moyenne entre ventes (en jours)
                                        const timeDiffs = saleDates.length > 1
                                            ? saleDates.slice(1).map((date, i) => differenceInDays(date, saleDates[i]))
                                            : [];
                                        const avgDaysBetweenSales = timeDiffs.length > 0
                                            ? timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length
                                            : null;
                                        // Total bénéfice et bénéfice/jour
                                        const totalBenefit = article.sales && article.sales.length > 0
                                            ? article.sales.reduce((sum, sale) => sum + (sale.sale_price - article.unit_cost), 0)
                                            : 0;
                                        // Ajout des variables isTopSeller et isQuickSale
                                        const isTopSeller = totalBenefit > 30;
                                        const isQuickSale = article.purchase_date && article.sales.length > 0
                                            ? article.sales.some((sale) => {
                                                const purchaseDate = parseISO(article.purchase_date!);
                                                const saleDate = parseISO(sale.sale_date);
                                                const days = differenceInDays(saleDate, purchaseDate);
                                                return days >= 0 && days <= 7;
                                            })
                                            : false;
                                        const daysSincePurchaseForBenefit = article.purchase_date
                                            ? differenceInDays(new Date(), parseISO(article.purchase_date))
                                            : null;
                                        const benefitPerDay = (daysSincePurchaseForBenefit && daysSincePurchaseForBenefit > 0)
                                            ? totalBenefit / daysSincePurchaseForBenefit
                                            : 0;
                                        // Marge moyenne réelle sur les ventes
                                        const averageMargin = article.sales.length > 0
                                            ? article.sales.reduce((sum, sale) => sum + (sale.sale_price - article.unit_cost), 0) / article.sales.length
                                            : 0;
                                        // Score de marge (max 100)
                                        const marginScore = article.unit_cost > 0
                                            ? Math.min((averageMargin / article.unit_cost) * 100, 100)
                                            : 0;
                                        // Score vitesse (plus c'est rapide, plus le score est haut)
                                        let speedScore = 0;
                                        if (avgDaysBetweenSales !== null) {
                                            if (avgDaysBetweenSales <= 2) speedScore = 100;
                                            else if (avgDaysBetweenSales <= 5) speedScore = 80;
                                            else if (avgDaysBetweenSales <= 10) speedScore = 60;
                                            else if (avgDaysBetweenSales <= 30) speedScore = 40;
                                            else speedScore = 20;
                                        } else if (article.sales.length === 0 && daysSincePurchaseForBenefit !== null) {
                                            if (daysSincePurchaseForBenefit > 90) speedScore = 10;
                                            else if (daysSincePurchaseForBenefit > 30) speedScore = 30;
                                            else speedScore = 50;
                                        }
                                        // Score rentabilité (€/jour)
                                        let rentabilityScore = 0;
                                        if (benefitPerDay >= 3) rentabilityScore = 100;
                                        else if (benefitPerDay >= 2) rentabilityScore = 80;
                                        else if (benefitPerDay >= 1) rentabilityScore = 60;
                                        else if (benefitPerDay > 0) rentabilityScore = 40;
                                        // Score global (pondération : marge 30%, vitesse 30%, rentabilité 40%)
                                        const score = Math.round(marginScore * 0.3 + speedScore * 0.3 + rentabilityScore * 0.4);
                                        let scoreColor = "text-muted-foreground";
                                        if (score >= 80) scoreColor = "text-green-600";
                                        else if (score >= 50) scoreColor = "text-yellow-600";
                                        else scoreColor = "text-red-600";

                                        // Assistant Pricing
                                        const baseMultiplier = 3;
                                        const minMultiplier = 1.5;
                                        let defaultMultiplier = baseMultiplier;
                                        if (article.sales.length === 0) {
                                            if (daysSincePurchaseForBenefit && daysSincePurchaseForBenefit > 90) {
                                                defaultMultiplier = minMultiplier;
                                            }
                                        } else {
                                            defaultMultiplier = (article.sales.reduce((sum, s) => sum + s.sale_price, 0) / article.sales.length) / article.unit_cost;
                                        }
                                        const suggestedPrice = (article.unit_cost * defaultMultiplier).toFixed(2);

                                        return (
                                            <div
                                                key={article.id}
                                                className="border rounded-md p-4 bg-white shadow-sm flex gap-4 items-center"
                                            >
                                                <ArticleImage url={article.image_url} />
                                                <div className="flex-1 relative">
                                                    <h3 className="text-lg font-semibold">{article.name}</h3>
                                                    <div className="flex gap-2 mt-1 absolute top-0 right-0">
                                                        {isPro && isTopSeller && (
                                                            <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                                                                🏅 Top Seller
                                                            </span>
                                                        )}
                                                        {isPro && isQuickSale && (
                                                            <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                                                                ⚡ Flash Sale
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm mt-1">Coût unitaire : {article.unit_cost.toFixed(2)} €</p>
                                                    <p className="text-sm mt-1 font-medium">
                                                        Stock restant : {remaining} / {article.quantity}
                                                    </p>
                                                    {article.purchase_date && (
                                                        <p className="text-sm mt-1 text-muted-foreground">
                                                            Acheté il y a {differenceInDays(new Date(), parseISO(article.purchase_date))} jour(s)
                                                        </p>
                                                    )}
                                                    {isPro ? (
                                                        <>
                                                            <p className="text-sm mt-1 text-green-700">
                                                                💰 Prix conseillé (x3) : {((article.unit_cost * 3).toFixed(2))} €
                                                            </p>
                                                            <p className="text-sm mt-1 text-orange-600">
                                                                💡 Prix minimum (x1.5) : {(article.unit_cost * 1.5).toFixed(2)} €
                                                            </p>
                                                            <p className="text-sm mt-1 text-blue-700">
                                                                🧠 Assistant Pricing : Prix recommandé :{" "}
                                                                <strong>{suggestedPrice} €</strong>
                                                            </p>
                                                            <details className={`text-sm mt-1 font-medium ${scoreColor}`}>
                                                                <summary>
                                                                    🔥 Score de rentabilité : {score} / 100
                                                                </summary>
                                                                <div className="mt-2 pl-4 text-muted-foreground">
                                                                    <p>🧮 <strong>Composé de :</strong></p>
                                                                    <ul className="list-disc ml-4">
                                                                        <li>Marge moyenne réelle sur les ventes ➜ <strong>{marginScore.toFixed(0)} / 100</strong></li>
                                                                        <li>Vitesse moyenne entre ventes ➜ <strong>{speedScore.toFixed(0)} / 100</strong></li>
                                                                        <li>Rentabilité (€/jour) ➜ <strong>{rentabilityScore.toFixed(0)} / 100</strong></li>
                                                                    </ul>
                                                                </div>
                                                            </details>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center border rounded-md bg-gray-50 p-4 mt-2">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="font-semibold">Analyse de rentabilité</span>
                                                                <Badge variant="secondary" className="text-xs">PRO</Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mb-2">
                                                                Accédez aux analyses détaillées de rentabilité et aux recommandations de prix
                                                            </p>
                                                            <Button variant="default" onClick={() => window.location.href = "/billing"}>
                                                                Passer au Pro
                                                            </Button>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-row gap-2 mt-4">
                                                        <Button onClick={() => openDialog(article.id)}>
                                                            Ajouter une vente
                                                        </Button>
                                                        <Link href={`/articles/${article.id}/edit`}>
                                                            <Button variant="secondary">
                                                                Modifier
                                                            </Button>
                                                        </Link>
                                                        {article.sales && article.sales.length > 0 && (
                                                            <Link href={`/articles/${article.id}/sales`}>
                                                                <Button variant="outline">
                                                                    Voir les ventes ({article.sales.length})
                                                                </Button>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </>
                )}
            </TabsContent>
            <TabsContent value="archives">
                {archivedArticles.length > 0 ? (
                    <div className="grid gap-4">
                        {archivedArticles.map((article) => (
                            <div
                                key={article.id}
                                className="border rounded-md p-4 bg-gray-100 shadow-sm flex gap-4 items-center opacity-75"
                            >
                                <ArticleImage url={article.image_url} />
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{article.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {article.brand} – {article.quantity} unité(s) – {article.platform}
                                    </p>
                                    <p className="text-sm mt-1 text-muted-foreground italic">
                                        Article archivé (stock épuisé)
                                    </p>
                                    <Button
                                        variant="destructive"
                                        className="mt-2"
                                        onClick={() => handleDeleteArticle(article.id)}
                                    >
                                        Supprimer
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-md border border-muted p-4 text-sm text-muted-foreground">
                        Aucun article archivé.
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}

export default function ArticlesPage() {
    // Redirection si l'utilisateur n'est pas authentifié
    const supabase = createClient();
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = "/login";
            }
        };
        checkUser();
    }, []);
    const [articles, setArticles] = useState<Article[]>([]);
    const [archivedArticles, setArchivedArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
    const [salePrice, setSalePrice] = useState("");
    const [saleDate, setSaleDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [stockValueGrowthPercent, setStockValueGrowthPercent] = useState<number | null>(null);

    // Récupération des articles (actifs et archivés)
    const fetchArticles = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("articles")
            .select("id, name, brand, quantity, unit_cost, platform, image_url, purchase_date, sales(id, sale_date, sale_price)");
        if (error) {
            console.error("Erreur récupération articles :", error.message);
            setLoading(false);
            return;
        }
        const activeArticles = (data || [])
            .filter(article => {
                const soldQty = article.sales?.length || 0;
                return article.quantity - soldQty > 0;
            })
            .sort((a, b) => {
                if (!a.purchase_date || !b.purchase_date) return 0;
                return new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime();
            });
        const archivedArticles = (data || [])
            .filter(article => {
                const soldQty = article.sales?.length || 0;
                return article.quantity - soldQty === 0;
            })
            .sort((a, b) => {
                if (!a.purchase_date || !b.purchase_date) return 0;
                return new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime();
            });
        setArticles(activeArticles);
        setArchivedArticles(archivedArticles);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const openDialog = (articleId: string) => {
        setSelectedArticleId(articleId);
        setSalePrice("");
        setSaleDate(format(new Date(), "yyyy-MM-dd"));
        setShowDialog(true);
    };

    const handleAddSale = async () => {
        if (!selectedArticleId || !salePrice) return;

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            alert("Erreur récupération utilisateur : " + (userError?.message || "Utilisateur non connecté"));
            return;
        }

        // Récupérer le user mappé (users.id) à partir de l'auth_id
        const { data: mappedUser } = await supabase
            .from("users")
            .select("id")
            .eq("auth_id", user.id)
            .single();

        const { error } = await supabase.from("sales").insert([
            {
                article_id: selectedArticleId,
                sale_price: parseFloat(salePrice),
                sale_date: saleDate,
                user_id: user.id, // conserve l'ancien champ pour compatibilité
                user_mapped_id: mappedUser?.id, // nouvelle référence vers users.id
            },
        ]);

        if (error) {
            alert("Erreur lors de l'enregistrement : " + error.message);
        } else {
            setShowDialog(false);
            fetchArticles();
        }
    };

    const handleDeleteArticle = async (articleId: string) => {
        const confirmDelete = confirm("Supprimer définitivement cet article ?");
        if (!confirmDelete) return;
        const { error } = await supabase.from("articles").delete().eq("id", articleId);
        if (error) {
            alert("Erreur lors de la suppression : " + error.message);
        } else {
            fetchArticles();
        }
    };

    // Calcule la valeur du stock restant
    const stockValue = calculateStockValue(articles);

    // Calcul de la croissance de la valeur du stock sur la semaine passée
    useEffect(() => {
        async function fetchPastStockValue() {
            const { data, error } = await supabase
                .from("articles")
                .select("id, quantity, unit_cost, sales(sale_date)")
                .lte("purchase_date", format(new Date(), "yyyy-MM-dd"));
            if (!error && data) {
                // On simule le stock d'il y a 7 jours (en retirant les ventes des 7 derniers jours)
                const pastArticles = data.map((article: { id: string; quantity: number; unit_cost: number; sales: { sale_date: string }[] }) => {
                    const salesBefore = article.sales?.filter((s: { sale_date: string }) => {
                        const saleDate = parseISO(s.sale_date);
                        return saleDate < subDays(new Date(), 7);
                    }) || [];
                    return {
                        ...article,
                        sales: salesBefore,
                    };
                });
                const pastValue = calculateStockValue(pastArticles);
                const growth = pastValue !== 0 ? ((stockValue - pastValue) / Math.abs(pastValue)) * 100 : null;
                if (growth !== null) setStockValueGrowthPercent(growth);
            }
        }
        fetchPastStockValue();
    }, [stockValue, supabase]);

    // Loader au niveau layout pour éviter de charger inutilement les tabs
    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <span className="text-muted-foreground">Chargement...</span>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Mes articles</h2>
                <div className="flex gap-2">
                    <Link href="/articles/new">
                        <Button>Ajouter un article</Button>
                    </Link>
                </div>
            </div>
            <ArticlesTabs
                articles={articles}
                archivedArticles={archivedArticles}
                loading={false}
                openDialog={openDialog}
                handleDeleteArticle={handleDeleteArticle}
            />
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter une vente</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Prix de vente (€)
                            </Label>
                            <Input
                                id="price"
                                value={salePrice}
                                onChange={(e) => setSalePrice(e.target.value)}
                                type="number"
                                step="0.01"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">
                                Date
                            </Label>
                            <Input
                                id="date"
                                value={saleDate}
                                onChange={(e) => setSaleDate(e.target.value)}
                                type="date"
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddSale}>Enregistrer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="fixed bottom-6 right-6 z-50">
                <div className="bg-white border shadow-lg rounded-xl px-4 py-3 text-sm text-muted-foreground w-64">
                    <div className="flex justify-between items-center mb-2">
                        <span>💼 Stock restant :</span>
                        <span className="font-semibold text-black">{stockValue.toFixed(2)} €</span>
                    </div>
                    {stockValueGrowthPercent !== null && (
                        <div className="mt-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>
                                    Valeur du stock :{" "}
                                    {stockValueGrowthPercent > 0
                                        ? "⬆️ (augmentation)"
                                        : stockValueGrowthPercent < 0
                                            ? "⬇️ (baisse)"
                                            : "➡️ (stable)"}
                                </span>
                                <span>{Math.abs(stockValueGrowthPercent).toFixed(1)}%</span>
                            </div>
                            {/* Barre d'évolution stock, styles uniformes pour Safari/Chrome */}
                            <div className="relative w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div
                                    className={`absolute left-0 top-0 h-2 rounded-full transition-all duration-300 ${stockValueGrowthPercent > 0
                                        ? "bg-blue-500"
                                        : stockValueGrowthPercent < 0
                                            ? "bg-orange-500"
                                            : "bg-gray-500"
                                        }`}
                                    style={{
                                        width: `${Math.min(Math.abs(stockValueGrowthPercent), 100)}%`,
                                        minWidth: "0.5rem",
                                        maxWidth: "100%",
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
