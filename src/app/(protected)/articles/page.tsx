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

type Article = {
    id: string;
    name: string;
    brand: string;
    quantity: number;
    unit_cost: number;
    platform: string;
    sales: { id: string }[];
};

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
            .select("id, name, brand, quantity, unit_cost, platform, sales(id)");

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
            alert("Erreur lors de l’enregistrement : " + error.message);
        } else {
            setShowDialog(false);
            fetchArticles();
        }
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Mes articles</h2>
                <Link href="/articles/new">
                    <Button>Ajouter un article</Button>
                </Link>
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
                                className="border rounded-md p-4 bg-white shadow-sm"
                            >
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
        </DashboardLayout>
    );
}
