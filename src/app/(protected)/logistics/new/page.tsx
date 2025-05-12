"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/layout/DashboardLayout";

const AddLogisticsItem = () => {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            }
        };

        checkAuth();
    }, [supabase, router]);

    const [form, setForm] = useState({
        name: "",
        unit_price: "",
        quantity: "1",
        used_per_sale: "",
        purchase_link: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "quantity" || name === "unit_price" || name === "used_per_sale") {
            const numValue = parseFloat(value);
            if (numValue < 0) return;
        }
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!user || userError) {
            alert("Erreur : Utilisateur non connecté.");
            setLoading(false);
            return;
        }

        const unitPrice = parseFloat(form.unit_price);
        const quantity = parseInt(form.quantity);
        const usedPerSale = form.used_per_sale ? parseFloat(form.used_per_sale) : null;

        if (isNaN(unitPrice) || unitPrice < 0) {
            alert("Le prix unitaire doit être un nombre positif");
            setLoading(false);
            return;
        }

        if (isNaN(quantity) || quantity < 0) {
            alert("La quantité doit être un nombre positif");
            setLoading(false);
            return;
        }

        if (usedPerSale !== null && (isNaN(usedPerSale) || usedPerSale < 0)) {
            alert("La quantité utilisée par vente doit être un nombre positif");
            setLoading(false);
            return;
        }

        const { error } = await supabase.from("logistics_items").insert({
            name: form.name,
            unit_price: unitPrice,
            quantity: quantity,
            used_per_sale: usedPerSale,
            purchase_link: form.purchase_link || null,
            user_id: user.id
        });

        if (error) {
            console.error(error);
            alert("Erreur à l'ajout : " + error.message);
            setLoading(false);
            return;
        }

        router.push("/logistics");
    };

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold mb-6">Ajouter un élément logistique</h2>
            <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl">
                <div>
                    <Label htmlFor="name">Nom de l&apos;article *</Label>
                    <Input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="unit_price">Prix unitaire (€) *</Label>
                    <Input
                        id="unit_price"
                        name="unit_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.unit_price}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="quantity">Quantité en stock</Label>
                    <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="0"
                        value={form.quantity}
                        onChange={handleChange}
                        placeholder="1"
                    />
                </div>

                <div>
                    <Label htmlFor="used_per_sale">
                        Quantité utilisée par vente
                        <span className="text-sm text-gray-500 ml-1">(optionnel)</span>
                    </Label>
                    <Input
                        id="used_per_sale"
                        name="used_per_sale"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.used_per_sale}
                        onChange={handleChange}
                        placeholder="1"
                    />
                </div>

                <div>
                    <Label htmlFor="purchase_link">
                        Lien d&apos;achat
                        <span className="text-sm text-gray-500 ml-1">(optionnel)</span>
                    </Label>
                    <Input
                        id="purchase_link"
                        name="purchase_link"
                        type="url"
                        value={form.purchase_link}
                        onChange={handleChange}
                        placeholder="https://..."
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? "Enregistrement en cours..." : "Ajouter l'article"}
                </Button>
            </form>
        </DashboardLayout>
    );
};

export default AddLogisticsItem;
