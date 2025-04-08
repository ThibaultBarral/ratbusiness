"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { createClient } from "../../../../utils/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface Article {
    id: string;
    name: string;
    brand: string;
    quantity: number;
    unit_cost: number;
    platform: string;
    sales: { id: string }[];
    image_url?: string;
}

function ArticleImage({ url }: { url?: string }) {
    const supabase = createClient();
    const [signedUrl, setSignedUrl] = useState<string>("");

    useEffect(() => {
        const getSignedUrl = async () => {
            if (!url) return;

            // Si `url` est une URL complète signée, on essaie d'en extraire le chemin interne
            const match = url.match(/article-images\/(.+?)\?/);
            const path = match?.[1];

            if (!path) return;

            const { data, error } = await supabase.storage
                .from("article-images")
                .createSignedUrl(path, 3600);
            if (error) {
                console.error("Error creating signed URL:", error);
                return;
            }
            if (data?.signedUrl) {
                setSignedUrl(data.signedUrl);
            }
        };
        getSignedUrl();
    }, [url]);

    if (!url || !signedUrl) return null;

    return <img src={signedUrl} alt="Article" className="w-20 h-20 object-cover rounded" />;
}

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
    const [salePrice, setSalePrice] = useState("");
    const [saleDate, setSaleDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const supabase = createClient();

    const fetchArticles = async () => {
        const { data, error } = await supabase
            .from("articles")
            .select("id, name, brand, quantity, unit_cost, platform, image_url, sales(id)");

        if (error) {
            console.error("Erreur récupération articles :", error.message);
        } else {
            setArticles(data || []);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const openDialog = (articleId: string) => {
        setSelectedArticleId(articleId);
        setSalePrice("");
        setSaleDate(format(new Date(), "yyyy-MM-dd"));
        setShowDialog(true);
    };

    const handleAddSale = async () => {
        if (!selectedArticleId || !salePrice) return;

        const { error } = await supabase.from("sales").insert([
            {
                article_id: selectedArticleId,
                sale_price: parseFloat(salePrice),
                sale_date: saleDate,
            },
        ]);

        if (error) {
            alert("Erreur lors de l'enregistrement : " + error.message);
        } else {
            setShowDialog(false);
            fetchArticles();
        }
    };

    const stockValue = articles.reduce((total, article) => {
        const soldQty = article.sales?.length || 0;
        const remainingQty = article.quantity - soldQty;
        return total + remainingQty * article.unit_cost;
    }, 0);

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Mes articles</h2>
                <div className="flex gap-2">
                    <Link href="/articles/new">
                        <Button>Ajouter un article</Button>
                    </Link>
                    <Link href="/bundles/new">
                        <Button variant="secondary">Créer un bundle</Button>
                    </Link>
                </div>
            </div>

            {loading ? (
                <p>Chargement des articles...</p>
            ) : articles.length === 0 ? (
                <div className="rounded-md border border-muted p-4 text-sm text-muted-foreground">
                    Aucun article trouvé.
                </div>
            ) : (
                <div className="grid gap-4">
                    {articles.map((article) => {
                        const soldQty = article.sales?.length || 0;
                        const remaining = article.quantity - soldQty;

                        return (
                            <div
                                key={article.id}
                                className="border rounded-md p-4 bg-white shadow-sm flex gap-4 items-center"
                            >
                                <ArticleImage url={article.image_url} />
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{article.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {article.brand} – {article.quantity} unité(s) – {article.platform}
                                    </p>
                                    <p className="text-sm mt-1">Coût unitaire : {article.unit_cost.toFixed(2)} €</p>
                                    <p className="text-sm mt-1 font-medium">
                                        Stock restant : {remaining} / {article.quantity}
                                    </p>
                                    <Button className="mt-4" onClick={() => openDialog(article.id)}>
                                        Ajouter une vente
                                    </Button>
                                    {' '}
                                    <Link href={`/articles/${article.id}/edit`}>
                                        <Button variant="secondary" className="mt-2">
                                            Modifier
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

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
                <div className="bg-white border shadow-lg rounded-xl px-4 py-3 text-sm text-muted-foreground">
                    💼 Stock restant : <span className="font-semibold text-black">{stockValue.toFixed(2)} €</span>
                </div>
            </div>
        </DashboardLayout>
    );
}
