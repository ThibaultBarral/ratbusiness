"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../utils/supabase/client";

export function GoalWidget() {
    const supabase = createClient();
    const [userId, setUserId] = useState<string | null>(null);
    const [goalType, setGoalType] = useState<"revenue" | "profit">("revenue");
    const [goal, setGoal] = useState<number | null>(null);
    const [currentValue, setCurrentValue] = useState<number>(0);
    const [newGoal, setNewGoal] = useState("");
    const [showGoal, setShowGoal] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("showGoal");
        if (stored !== null) {
            setShowGoal(stored === "true");
        }
    }, []);

    useEffect(() => {
        const fetchGoalsAndData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            const { data: goals } = await supabase
                .from("goals")
                .select("revenue_target, profit_target")
                .eq("user_id", user.id)
                .single();

            if (goals) {
                setGoal(goals[`${goalType}_target`]);
            }

            const { data: sales } = await supabase
                .from("sales")
                .select("sale_price, sale_date, article:article_id(unit_cost, user_id)")
                .eq("article.user_id", user.id);

            if (sales) {
                const currentMonth = new Date().getMonth();
                const filteredSales = sales.filter(s => new Date(s.sale_date).getMonth() === currentMonth);
                const total = filteredSales.reduce((sum, s) => {
                    const unitCost = s.article?.unit_cost || 0;
                    return sum + (goalType === "profit" ? s.sale_price - unitCost : s.sale_price);
                }, 0);
                setCurrentValue(total);
            }
        };

        fetchGoalsAndData();
    }, [goalType]);

    const toggleShowGoal = () => {
        setShowGoal(prev => {
            const newVal = !prev;
            localStorage.setItem("showGoal", newVal.toString());
            return newVal;
        });
    };

    const handleSetGoal = async () => {
        if (!userId || !newGoal) return;
        const parsed = parseFloat(newGoal);
        if (isNaN(parsed)) return;

        const update = goalType === "revenue"
            ? { revenue_target: parsed }
            : { profit_target: parsed };

        await supabase
            .from("goals")
            .upsert({ user_id: userId, ...update }, { onConflict: "user_id" });

        setGoal(parsed);
        setNewGoal("");
    };

    return (
        <Card className="mb-6 relative">
            <CardHeader>
                <div>
                    <CardTitle>🎯 Objectif du mois</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">Suivez votre progression mensuelle</CardDescription>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleShowGoal}
                    className="text-xs absolute top-4 right-4"
                >
                    {showGoal ? "Masquer" : "Afficher"}
                </Button>
            </CardHeader>

            {showGoal && (
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="goalType" className="text-sm">Type d'objectif :</label>
                        <select
                            id="goalType"
                            value={goalType}
                            onChange={(e) => setGoalType(e.target.value as "revenue" | "profit")}
                            className="text-sm px-2 py-1 rounded border text-black"
                        >
                            <option value="revenue">Chiffre d'affaires</option>
                            <option value="profit">Bénéfice</option>
                        </select>
                    </div>

                    {goal !== null ? (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Objectif actuel ({goalType === "revenue" ? "CA" : "Bénéfice"}) : <strong className="text-foreground">{goal.toFixed(2)} €</strong>
                            </p>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-green-500 h-2"
                                    style={{ width: `${Math.min((currentValue / goal) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Progression : <strong>{currentValue.toFixed(2)} €</strong>
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Modifier l'objectif"
                                    value={newGoal}
                                    onChange={(e) => setNewGoal(e.target.value)}
                                />
                                <Button onClick={handleSetGoal}>Mettre à jour</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Aucun objectif défini pour ce mois.</p>
                            <Input
                                placeholder="Ex: 500"
                                value={newGoal}
                                onChange={(e) => setNewGoal(e.target.value)}
                                className="w-full"
                            />
                            <Button onClick={handleSetGoal}>Définir l'objectif</Button>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}