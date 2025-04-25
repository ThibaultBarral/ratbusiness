"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { createClient } from "../../../utils/supabase/client";
import { format, isSameMonth, isSameYear, subDays, isAfter } from "date-fns";
import { Label } from "@/components/ui/label";

interface ChartStats {
    date: string;
    revenue: number;
    profit: number;
}

const chartConfig = {
    revenue: {
        label: "Chiffre d'affaires",
        color: "lightgreen",
    },
    profit: {
        label: "Bénéfice",
        color: "green",
    },
} satisfies ChartConfig;

export function SalesChart() {
    const [chartData, setChartData] = useState<ChartStats[]>([]);
    const [filter, setFilter] = useState("30days");
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data: sales, error } = await supabase
                .from("sales")
                .select(`
                    id,
                    sale_price,
                    sale_date,
                    status,
                    articles (
                        name,
                        unit_cost,
                        user_id
                    )
                `);

            if (error || !sales) {
                console.error("Erreur récupération ventes :", error?.message);
                return;
            }

            // Filter sales belonging to current user
            const userSales = sales.filter((sale) => {
                const article = Array.isArray(sale.articles) ? sale.articles[0] : sale.articles;
                return article?.user_id === user.id;
            });

            const today = new Date();
            const filteredSales = userSales.filter((sale) => {
                const saleDate = new Date(sale.sale_date);
                if (filter === "7days") return isAfter(saleDate, subDays(today, 7));
                if (filter === "30days") return isAfter(saleDate, subDays(today, 30));
                if (filter === "month") return isSameMonth(saleDate, today);
                if (filter === "year") return isSameYear(saleDate, today);
                return true;
            });

            const map = new Map<string, { revenue: number; profit: number }>();

            for (const sale of filteredSales) {
                const date = new Date(sale.sale_date);
                let key = "";
                if (filter === "year") {
                    key = format(date, "MM/yyyy");
                } else {
                    key = format(date, "dd/MM");
                }

                const revenue = sale.sale_price || 0;
                const article = Array.isArray(sale.articles) ? sale.articles[0] : sale.articles;
                const unitCost = article?.unit_cost || 0;
                const profit = revenue - unitCost;

                if (!map.has(key)) {
                    map.set(key, { revenue: 0, profit: 0 });
                }

                const current = map.get(key)!;
                current.revenue += revenue;
                current.profit += profit;
            }

            let data: ChartStats[] = [];

            if (filter === "month") {
                const today = new Date();
                const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                const daysInMonth = end.getDate();

                for (let day = 1; day <= daysInMonth; day++) {
                    const dateKey = day.toString().padStart(2, "0") + "/" + (today.getMonth() + 1).toString().padStart(2, "0");
                    const stats = map.get(dateKey) || { revenue: 0, profit: 0 };
                    data.push({
                        date: dateKey,
                        revenue: parseFloat(stats.revenue.toFixed(2)),
                        profit: parseFloat(stats.profit.toFixed(2)),
                    });
                }
            } else if (filter === "year") {
                const today = new Date();
                const monthNames = [
                    "Janv", "Févr", "Mars", "Avr", "Mai", "Juin",
                    "Juil", "Août", "Sept", "Oct", "Nov", "Déc"
                ];
                for (let month = 0; month < 12; month++) {
                    const monthStr = (month + 1).toString().padStart(2, "0");
                    const dateKey = monthStr + "/" + today.getFullYear();
                    const stats = map.get(dateKey) || { revenue: 0, profit: 0 };
                    data.push({
                        date: monthNames[month],
                        revenue: parseFloat(stats.revenue.toFixed(2)),
                        profit: parseFloat(stats.profit.toFixed(2)),
                    });
                }
            } else {
                data = Array.from(map.entries()).map(
                    ([date, stats]) => ({
                        date,
                        revenue: parseFloat(stats.revenue.toFixed(2)),
                        profit: parseFloat(stats.profit.toFixed(2)),
                    })
                ).sort((a, b) => {
                    const [dayA, monthA] = a.date.split("/").map(Number);
                    const [dayB, monthB] = b.date.split("/").map(Number);
                    return monthA - monthB || dayA - dayB;
                });
            }

            setChartData(data);
        };

        fetchData();
    }, [filter]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistiques de ventes</CardTitle>
                <CardDescription>
                    Visualisation du chiffre d&apos;affaires et bénéfices
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-end mb-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="filter">Période :</Label>
                        <select
                            id="filter"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="border rounded px-2 py-1 text-sm text-black"
                        >
                            <option value="7days">7 derniers jours</option>
                            <option value="30days">30 derniers jours</option>
                            <option value="month">Mois en cours</option>
                            <option value="year">Année en cours</option>
                        </select>
                    </div>
                </div>

                <ChartContainer
                    config={chartConfig}
                    className="w-full overflow-x-auto max-h-[420px] h-[70vh]"
                >
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ left: 12, right: 12 }}
                        width={600}
                        height={300}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <defs>
                            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-revenue)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-revenue)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-profit)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-profit)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="revenue"
                            type="monotone"
                            fill="url(#fillRevenue)"
                            stroke="var(--color-revenue)"
                            stackId="a"
                        />
                        <Area
                            dataKey="profit"
                            type="monotone"
                            fill="url(#fillProfit)"
                            stroke="var(--color-profit)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            Données filtrées par : <code>{filter}</code>
                        </div>
                        <div className="text-muted-foreground">Basé sur vos ventes récentes</div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
