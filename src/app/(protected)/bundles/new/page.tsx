"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../../utils/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface Article {
    id: string;
    name: string;
    quantity: number;
    unit_cost: number;
    sales: { id: string }[];
}

export default function NewBundlePage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
    const [totalPrice, setTotalPrice] = useState("");
    const [saleDate, setSaleDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [loading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchArticles = async () => {
            const { data, error } = await supabase
                .from("articles")
                .select("id, name, quantity, unit_cost, sales(id)");

            if (error) {
                alert("Erreur lors du chargement des articles");
                return;
            }

            setArticles(data || []);
        };

        fetchArticles();
    }, []);

    const handleQuantityChange = (articleId: string, quantity: number) => {
        setSelectedItems({ ...selectedItems, [articleId]: quantity });
    };

    const handleSubmit = async () => {
        const selectedArticles = Object.entries(selectedItems)
            .filter(([_, quantity]) => quantity > 0)
            .map(([articleId, quantity]) => ({ articleId, quantity }));

        if (!saleDate || !totalPrice || selectedArticles.length === 0) return;

        const { data: bundle, error: bundleError } = await supabase
            .from("bundles")
            .insert([{ sale_date: saleDate, total_price: parseFloat(totalPrice) }])
            .select()
            .single();

        if (bundleError || !bundle) {
            alert("Erreur lors de l'enregistrement du bundle");
            return;
        }

        const items = selectedArticles.map((item) => ({
            bundle_id: bundle.id,
            article_id: item.articleId,
            quantity: item.quantity,
        }));

        const { error: itemsError } = await supabase.from("bundle_items").insert(items);

        if (itemsError) {
            alert("Erreur lors de l'enregistrement des articles du bundle");
            return;
        }

        router.push("/articles");
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Créer une vente en bundle</h2>

                <div className="space-y-6">
                    <div className="grid gap-2">
                        <Label>Prix total (€)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={totalPrice}
                            onChange={(e) => setTotalPrice(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Date de vente</Label>
                        <Input
                            type="date"
                            value={saleDate}
                            onChange={(e) => setSaleDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <Label className="block mb-2">Articles à inclure</Label>
                        <div className="space-y-3">
                            {articles.map((article) => {
                                const soldQty = article.sales?.length || 0;
                                const remaining = article.quantity - soldQty;

                                return (
                                    <div
                                        key={article.id}
                                        className="border p-4 rounded-md shadow-sm flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="font-medium">{article.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {remaining} restants à {article.unit_cost.toFixed(2)} €
                                            </p>
                                        </div>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={remaining}
                                            className="w-24"
                                            value={selectedItems[article.id] || ""}
                                            onChange={(e) =>
                                                handleQuantityChange(article.id, parseInt(e.target.value) || 0)
                                            }
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <Button className="w-full mt-6" onClick={handleSubmit} disabled={loading}>
                        Enregistrer la vente en bundle
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}