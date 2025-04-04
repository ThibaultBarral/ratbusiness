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

interface MonthlyStats {
    month: string;
    revenue: number;
    profit: number;
}

const chartConfig = {
    revenue: {
        label: "Chiffre d'affaires",
        color: "hsl(var(--chart-1))",
    },
    profit: {
        label: "Bénéfice",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

export function SalesChart() {
    const [chartData, setChartData] = useState<MonthlyStats[]>([]);
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
                .select("sale_price, sale_date, article:article_id(unit_cost, user_id)")
                .eq("article.user_id", user.id);

            if (error || !sales) return;

            const today = new Date();
            const filteredSales = sales.filter((sale) => {
                const saleDate = new Date(sale.sale_date);
                if (filter === "7days") return isAfter(saleDate, subDays(today, 7));
                if (filter === "30days") return isAfter(saleDate, subDays(today, 30));
                if (filter === "month") return isSameMonth(saleDate, today);
                if (filter === "year") return isSameYear(saleDate, today);
                return true;
            });

            const monthlyMap = new Map<string, { revenue: number; profit: number }>();

            for (const sale of filteredSales) {
                const date = new Date(sale.sale_date);
                const month = format(date, "MMMM");
                const revenue = sale.sale_price || 0;
                const cost = sale.article?.[0]?.unit_cost || 0;
                const profit = revenue - cost;

                if (!monthlyMap.has(month)) {
                    monthlyMap.set(month, { revenue: 0, profit: 0 });
                }

                const current = monthlyMap.get(month)!;
                current.revenue += revenue;
                current.profit += profit;
            }

            const data: MonthlyStats[] = Array.from(monthlyMap.entries()).map(
                ([month, stats]) => ({
                    month,
                    revenue: parseFloat(stats.revenue.toFixed(2)),
                    profit: parseFloat(stats.profit.toFixed(2)),
                })
            );

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
                    className="w-full overflow-x-auto max-h-[420px]"
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
                            dataKey="month"
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
                            type="natural"
                            fill="url(#fillRevenue)"
                            stroke="var(--color-revenue)"
                            stackId="a"
                        />
                        <Area
                            dataKey="profit"
                            type="natural"
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
