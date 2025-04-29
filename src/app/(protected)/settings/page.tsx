"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../../utils/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Sale {
    id: string;
    sale_price: number;
    sale_date: string;
    articles: {
        unit_cost: number;
    };
}

interface SupabaseError {
    message: string;
    code?: string;
}

interface ExportData {
    [key: string]: string | number | null;
}

export default function SettingsPage() {
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [exportType, setExportType] = useState("articles");

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email ?? "");
                const { data: userProfile } = await supabase
                    .from("users")
                    .select("username")
                    .eq("id", user.id)
                    .single();
                setUsername(userProfile?.username ?? "");
            }
        };
        fetchUser();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from("users")
            .update({ username })
            .eq("id", user.id);

        setLoading(false);
    };

    const exportToCSV = (data: ExportData[], filename: string) => {
        if (!data.length) {
            toast.error("Erreur d'export : Pas de données à exporter.");
            return;
        }

        const separator = ",";
        const keys = Object.keys(data[0]);
        const csvContent =
            keys.join(separator) +
            "\n" +
            data.map((row) =>
                keys
                    .map((key) => {
                        let cell = row[key] === null || row[key] === undefined ? "" : row[key];
                        cell = cell.toString().replace(/"/g, '""');
                        return `"${cell}"`;
                    })
                    .join(separator)
            )
                .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Export réussi ! 🎉");
    };

    const handleExport = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Erreur : Utilisateur non connecté.");
            return;
        }

        if (exportType === "statistics") {
            // Export statistiques dynamiques
            const { data: sales, error: salesError } = await supabase
                .from("sales")
                .select(`
                    id,
                    sale_price,
                    sale_date,
                    articles (
                        unit_cost
                    )
                `)
                .eq("user_id", user.id) as { data: Sale[] | null, error: SupabaseError | null };

            if (salesError) {
                toast.error(`Erreur de récupération : ${salesError.message}`);
                return;
            }

            if (!sales || sales.length === 0) {
                toast.error("Aucune vente trouvée pour les statistiques.");
                return;
            }

            let totalRevenue = 0;
            let totalProfit = 0;
            const totalSales = sales.length;
            let totalMarginPercent = 0;
            let earliestSaleDate = new Date();
            let latestSaleDate = new Date(0);

            sales.forEach((sale) => {
                totalRevenue += sale.sale_price;
                const unitCost = sale.articles?.unit_cost || 0;
                const profit = sale.sale_price - unitCost;
                totalProfit += profit;

                const marginPercent = unitCost > 0 ? ((sale.sale_price - unitCost) / unitCost) * 100 : 0;
                totalMarginPercent += marginPercent;

                const saleDate = new Date(sale.sale_date);
                if (saleDate < earliestSaleDate) earliestSaleDate = saleDate;
                if (saleDate > latestSaleDate) latestSaleDate = saleDate;
            });

            const averageMargin = totalMarginPercent / totalSales;

            const statsData = [{
                "Chiffre d'affaires (€)": totalRevenue.toFixed(2),
                "Bénéfice total (€)": totalProfit.toFixed(2),
                "Marge moyenne (%)": averageMargin.toFixed(2),
                "Nombre de ventes": totalSales,
                "Période": `${earliestSaleDate.toLocaleDateString()} ➔ ${latestSaleDate.toLocaleDateString()}`,
            }];

            exportToCSV(statsData, "mes-statistiques");

        } else {
            // Export normal
            let tableName = "";
            let filename = "";

            if (exportType === "articles") {
                tableName = "articles";
                filename = "mes-articles";
            } else if (exportType === "sales") {
                tableName = "sales";
                filename = "mes-ventes";
            } else if (exportType === "bundles") {
                tableName = "bundles";
                filename = "mes-bundles";
            } else {
                toast.error("Erreur : Type d'exportation non supporté.");
                return;
            }

            const { data, error } = await supabase
                .from(tableName)
                .select("*")
                .eq("user_id", user.id);

            if (error) {
                toast.error(`Erreur de récupération depuis ${tableName} : ${error.message}`);
                return;
            }

            if (!data || data.length === 0) {
                toast.error("Aucune donnée à exporter pour ce type.");
                return;
            }

            if (data) {
                exportToCSV(data, filename);
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-xl mx-auto space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Paramètres du compte</CardTitle>
                        <CardDescription>
                            Mets à jour ton profil ou modifie tes préférences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium">
                                    Adresse email
                                </label>
                                <Input id="email" value={email} disabled />
                            </div>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium">
                                    Nom d&apos;utilisateur
                                </label>
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Ton pseudo"
                                />
                            </div>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Enregistrement..." : "Mettre à jour"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Exporter mes données</CardTitle>
                        <CardDescription>
                            Choisis ce que tu veux exporter en CSV.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Type de données</Label>
                            <Select value={exportType} onValueChange={setExportType}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sélectionner un type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="articles">Articles</SelectItem>
                                    <SelectItem value="sales">Ventes</SelectItem>
                                    <SelectItem value="bundles">Bundles</SelectItem>
                                    <SelectItem value="statistics">Statistiques</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleExport}>
                            📄 Exporter
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}