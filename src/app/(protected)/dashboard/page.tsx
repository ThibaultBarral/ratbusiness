"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { createClient } from "../../../../utils/supabase/client";

export default function DashboardPage() {
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [totalStock, setTotalStock] = useState(0);
    const [listedItems, setListedItems] = useState(0);
    const supabase = createClient(); // Create the Supabase client instance

    useEffect(() => {
        const fetchData = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            console.log("[DEBUG] User:", user);
            if (!user) return;

            const { data: articles, error: articlesError } = await supabase
                .from("articles")
                .select("id, unit_cost, quantity")
                .eq("user_id", user.id);
            console.log("[DEBUG] Articles:", articles);
            if (articlesError) console.error("[ERROR] Articles fetch:", articlesError);

            const { data: sales, error: salesError } = await supabase
                .from("sales")
                .select("article_id, sale_price");
            console.log("[DEBUG] Sales:", sales);
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

            for (const article of articles) {
                const unitCost = article.unit_cost ?? 0;
                const quantity = article.quantity ?? 0;
                const salesForArticle = salesByArticle[article.id] || [];

                const soldQty = salesForArticle.length;
                const remainingStock = quantity - soldQty;

                stock += remainingStock;

                for (const sale of salesForArticle) {
                    if (sale.sale_price !== null && unitCost !== null) {
                        revenue += sale.sale_price;
                        profit += sale.sale_price - unitCost;
                    }
                }
            }

            console.log("[DEBUG] Revenue:", revenue);
            console.log("[DEBUG] Profit:", profit);
            console.log("[DEBUG] Stock:", stock);

            setTotalRevenue(revenue);
            setTotalProfit(profit);
            setTotalStock(stock);
        };

        fetchData();
    }, []);

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            </div>
        </DashboardLayout>
    );
}
