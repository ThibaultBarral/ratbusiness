"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { createClient } from "../../../../../../utils/supabase/client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";

interface Sale {
    id: string;
    sale_price: number;
    sale_date: string;
}

interface Article {
    id: string;
    name: string;
    purchase_price_total: number;
    quantity: number;
    sales: Sale[];
}

export default function ArticleSalesPage() {
    const supabase = createClient();
    const params = useParams();
    const articleId = params?.id as string;

    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            const { data, error } = await supabase
                .from("articles")
                .select("id, name, purchase_price_total, quantity, sales(id, sale_price, sale_date, article_id)")
                .eq("id", articleId)
                .single();

            if (error) {
                console.error("Erreur récupération article:", error.message);
            } else {
                setArticle(data);
            }
            setLoading(false);
        };

        if (articleId) fetchSales();
    }, [articleId]);

    const handleDeleteSale = async (saleId: string) => {
        const { error } = await supabase.from("sales").delete().eq("id", saleId);
        if (error) {
            console.error("Erreur suppression vente :", error.message);
            return;
        }
        setArticle((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                sales: prev.sales.filter((s) => s.id !== saleId),
            };
        });
    };

    const unitCost = article ? article.purchase_price_total / article.quantity : 0;

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Ventes de l&apos;article</h2>
                {loading ? (
                    <p>Chargement...</p>
                ) : article ? (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">{article.name}</h3>
                        <div className="mb-4 p-3 bg-gray-100 rounded-md">
                            {(() => {
                                const totalBenefit = article.sales.reduce((acc, sale) => acc + (sale.sale_price - unitCost), 0);
                                const averageMargin = (totalBenefit / (unitCost * article.sales.length)) * 100;
                                return (
                                    <>
                                        <p className="text-sm font-medium">💰 Bénéfice total : {totalBenefit.toFixed(2)} €</p>
                                        <p className="text-sm font-medium">
                                            📈 Marge moyenne : {averageMargin.toFixed(1)}% (x{(1 + averageMargin / 100).toFixed(2)})
                                        </p>
                                    </>
                                );
                            })()}
                        </div>
                        {article.sales.length > 0 ? (
                            <ul className="space-y-2">
                                {article.sales
                                    .sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime())
                                    .map((sale) => {
                                        const benefit = sale.sale_price - unitCost;
                                        const margin = (benefit / unitCost) * 100;

                                        return (
                                            <li key={sale.id} className="border p-3 rounded-md space-y-1">
                                                <p className="text-sm">Prix de vente : {sale.sale_price.toFixed(2)} €</p>
                                                <p className="text-sm">Prix d&apos;achat : {unitCost.toFixed(2)} €</p>
                                                <p className="text-sm">Bénéfice : {benefit.toFixed(2)} €</p>
                                                <p className="text-sm">Marge : {margin.toFixed(1)}% (x{(1 + margin / 100).toFixed(2)})</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Date : {format(new Date(sale.sale_date), "dd/MM/yyyy")}
                                                </p>
                                                <button
                                                    className="mt-2 px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                                                    onClick={() => handleDeleteSale(sale.id)}
                                                >
                                                    Supprimer
                                                </button>
                                            </li>
                                        );
                                    })}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">Aucune vente enregistrée.</p>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-red-500">Article introuvable.</p>
                )}
            </div>
        </DashboardLayout>
    );
}
