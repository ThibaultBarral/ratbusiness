"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createClient } from "../../../../utils/supabase/client";
import { ProLock, ProLockButton } from "@/components/ui/pro-lock";

// Type pour les opérations logistiques
interface LogisticsItem {
    id: string;
    user_id: string;
    name: string;
    unit_price: number;
    quantity: number;
    used_per_sale: number;
    created_at: string;
    purchase_date: string;
    purchase_link?: string;
}

export default function LogisticsPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [items, setItems] = useState<LogisticsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProUser, setIsProUser] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const checkPlan = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: subscription } = await supabase
                .from("subscriptions")
                .select("plan")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            setIsProUser(subscription?.plan === "pro");
        };

        checkPlan();
    }, []);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('logistics_items')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setItems(data || []);
            } catch (error) {
                console.error('Error fetching logistics items:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (!isProUser) {
            router.push("/billing");
            return;
        }

        if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
            return;
        }

        try {
            const { error } = await supabase
                .from('logistics_items')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setItems(items.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting logistics item:', error);
            alert("Une erreur est survenue lors de la suppression de l'article.");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Logistique</h1>
                    <ProLockButton
                        isPro={isProUser}
                        onClick={() => router.push("/logistics/new")}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvel Article
                    </ProLockButton>
                </div>

                <ProLock
                    isPro={isProUser}
                    title="Gestion Logistique Pro"
                    description="Passez au plan Pro pour gérer vos articles logistiques"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Articles Logistiques</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher un article..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nom</TableHead>
                                            <TableHead>Prix unitaire</TableHead>
                                            <TableHead>Quantité</TableHead>
                                            <TableHead>Utilisé par vente</TableHead>
                                            <TableHead>Date d&apos;achat</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center">
                                                    Chargement...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredItems.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center">
                                                    Aucun article trouvé
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                    <TableCell>{item.unit_price.toFixed(2)}€</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>{item.used_per_sale}</TableCell>
                                                    <TableCell>
                                                        {item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            {item.purchase_link && (
                                                                <a
                                                                    href={item.purchase_link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 underline text-sm"
                                                                >
                                                                    Réapprovisionner
                                                                </a>
                                                            )}
                                                            {isProUser && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDelete(item.id)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </ProLock>
            </div>
        </DashboardLayout>
    );
} 