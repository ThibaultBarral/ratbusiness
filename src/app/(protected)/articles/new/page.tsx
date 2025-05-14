"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../../utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useUserPlan } from "@/contexts/UserPlanContext";
import { usePlanAction } from "@/components/PlanProtection";

export default function NewArticlePage() {
    const router = useRouter();
    const supabase = createClient();
    const { plan, isLoading } = useUserPlan();
    const { handleAction } = usePlanAction();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: "",
        brand: "",
        size: "",
        purchase_price_total: "",
        quantity: "",
        purchase_date: "",
        platform: "",
    });

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            // Vérifier si l'utilisateur a un plan
            if (!isLoading && !plan) {
                alert("Vous devez souscrire à un plan pour ajouter des articles.");
                router.push("/billing");
                return;
            }
        };

        checkAuth();
    }, [supabase, router, plan, isLoading]);

    // Si l'utilisateur n'a pas de plan, ne rien afficher
    if (!isLoading && !plan) {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        handleAction(async () => {
            setLoading(true);

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (!user || userError) {
                alert("Erreur : Utilisateur non connecté.");
                setLoading(false);
                return;
            }

            // Vérifier le nombre d'articles pour les utilisateurs du plan starter
            if (plan === "starter") {
                const { data: articles, error: countError } = await supabase
                    .from("articles")
                    .select("id")
                    .eq("user_id", user.id);

                if (countError) {
                    alert("Erreur lors de la vérification du nombre d'articles.");
                    setLoading(false);
                    return;
                }

                if (articles && articles.length >= 20) {
                    alert("Vous avez atteint la limite de 20 articles du plan Starter. Passez au plan Pro pour ajouter plus d'articles.");
                    setLoading(false);
                    return;
                }
            }

            let imageUrl = "";

            if (imageFile) {
                let finalFile = imageFile;

                if (imageFile.type === "image/heic" || imageFile.name.endsWith(".heic")) {
                    try {
                        const heic2any = (await import('heic2any')).default;
                        const convertedBlob = await heic2any({ blob: imageFile, toType: "image/jpeg" });
                        finalFile = new File(
                            [Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob],
                            imageFile.name.replace(/\.heic$/i, ".jpg"),
                            { type: "image/jpeg" }
                        );
                    } catch (error) {
                        alert("Erreur conversion HEIC : " + (error as Error).message);
                        setLoading(false);
                        return;
                    }
                }

                const filePath = `${user.id}/${Date.now()}-${finalFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from("article-images")
                    .upload(filePath, finalFile);

                if (uploadError) {
                    alert("Erreur upload image : " + uploadError.message);
                    setLoading(false);
                    return;
                }

                const { data: signedUrlData, error: urlError } = await supabase.storage
                    .from("article-images")
                    .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 an

                if (urlError) {
                    alert("Erreur URL signée : " + urlError.message);
                    setLoading(false);
                    return;
                }

                imageUrl = signedUrlData?.signedUrl || "";
            }

            const { error: insertError } = await supabase.from("articles").insert({
                ...form,
                purchase_price_total: parseFloat(form.purchase_price_total),
                quantity: parseInt(form.quantity),
                image_url: imageUrl,
                user_id: user.id, // ✅ Important pour SaaS
            });

            if (insertError) {
                alert("Erreur enregistrement article : " + insertError.message);
                setLoading(false);
                return;
            }

            router.push("/articles");
        });
    };

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold mb-6">Ajouter un article</h2>
            <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl">
                <div>
                    <Label htmlFor="name">Nom *</Label>
                    <Input name="name" required value={form.name} onChange={handleChange} />
                </div>

                <div>
                    <Label htmlFor="description">Description</Label>
                    <Input name="description" value={form.description} onChange={handleChange} />
                </div>

                <div>
                    <Label htmlFor="brand">Marque</Label>
                    <Input name="brand" value={form.brand} onChange={handleChange} />
                </div>

                <div>
                    <Label htmlFor="size">Taille</Label>
                    <Input name="size" value={form.size} onChange={handleChange} />
                </div>

                <div>
                    <Label htmlFor="purchase_price_total">Prix d&apos;achat total (€) *</Label>
                    <Input
                        name="purchase_price_total"
                        type="number"
                        step="0.01"
                        required
                        value={form.purchase_price_total}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label htmlFor="quantity">Quantité *</Label>
                    <Input
                        name="quantity"
                        type="number"
                        required
                        value={form.quantity}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label htmlFor="purchase_date">Date d&apos;achat *</Label>
                    <Input
                        name="purchase_date"
                        type="date"
                        required
                        value={form.purchase_date}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label htmlFor="platform">Plateforme</Label>
                    <Input name="platform" value={form.platform} onChange={handleChange} />
                </div>

                <div>
                    <Label htmlFor="image">Image *</Label>
                    <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setImageFile(file);
                        }}
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? "Enregistrement en cours..." : "Enregistrer"}
                </Button>
            </form>
        </DashboardLayout>
    );
}
