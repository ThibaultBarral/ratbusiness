"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "../../../../../../utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/layout/DashboardLayout";

type ArticleUpdateFields = {
    name: string;
    quantity: number;
    purchase_price_total: number;
    platform: string | null;
    image_url?: string;
};

export default function EditArticlePage() {
    const router = useRouter();
    const params = useParams();
    const supabase = createClient();
    const [userId, setUserId] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [purchasePriceTotal, setPurchasePriceTotal] = useState(0);
    const [platform, setPlatform] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [newImage, setNewImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUserId(user?.id || null);
        };

        fetchUser();
        fetchArticle();
    }, []);

    const fetchArticle = async () => {
        const { data, error } = await supabase
            .from("articles")
            .select("*")
            .eq("id", params.id)
            .single();

        if (error) {
            console.error("Erreur lors du chargement de l'article", error);
        } else {
            setName(data.name);
            setQuantity(data.quantity);
            setPurchasePriceTotal(data.purchase_price_total);
            setPlatform(data.platform || "");
            if (data.image_url) {
                const filePath = data.image_url?.split("/article-images/")[1]?.split("?")[0];
                const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                    .from("article-images")
                    .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 jours

                if (signedUrlData?.signedUrl) {
                    setImageUrl(signedUrlData.signedUrl);
                } else {
                    console.error("Erreur lors de la génération de l’URL signée", signedUrlError);
                }
            }
        }

        setLoading(false);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const updatedFields: ArticleUpdateFields = {
            name,
            quantity,
            purchase_price_total: purchasePriceTotal,
            platform: platform || null,
        };

        if (newImage) {
            const oldPath = imageUrl.split("/article-images/")[1]?.split("?")[0];
            if (oldPath) {
                await supabase.storage.from("article-images").remove([oldPath]);
            }

            const filePath = `${userId}/${Date.now()}-${newImage.name}`;
            const { error: uploadError } = await supabase.storage
                .from("article-images")
                .upload(filePath, newImage, {
                    cacheControl: "3600",
                    upsert: false,
                    metadata: { owner: userId || "" },
                });

            if (uploadError) {
                alert("Erreur lors de l\u2019upload de la nouvelle image : " + uploadError.message);
                return;
            }

            const { data: signedUrlData } = await supabase.storage
                .from("article-images")
                .createSignedUrl(filePath, 60 * 60 * 24 * 7);

            updatedFields.image_url = signedUrlData?.signedUrl;
        }

        const { error } = await supabase.from("articles").update(updatedFields).eq("id", params.id);

        if (error) {
            alert("Erreur lors de la mise à jour : " + error.message);
        } else {
            router.push("/articles");
        }
    };

    const handleDelete = async () => {
        const confirm = window.confirm("Es-tu sûr de vouloir supprimer cet article ?");
        if (!confirm) return;

        const { error } = await supabase.from("articles").delete().eq("id", params.id);
        if (error) {
            alert("Erreur lors de la suppression : " + error.message);
        } else {
            router.push("/articles");
        }
    };

    if (loading) return <p>Chargement...</p>;

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold mb-6">Modifier l&apos;article</h2>
            <form onSubmit={handleUpdate} className="grid gap-4">
                <div>
                    <Label htmlFor="name">Nom</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div>
                    <Label htmlFor="quantity">Quantité</Label>
                    <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        required
                        min={1}
                    />
                </div>

                <div>
                    <Label htmlFor="purchase_price_total">Prix total (€)</Label>
                    <Input
                        id="purchase_price_total"
                        type="number"
                        step="0.01"
                        value={purchasePriceTotal}
                        onChange={(e) => setPurchasePriceTotal(Number(e.target.value))}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="platform">Plateforme</Label>
                    <Input
                        id="platform"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                    />
                </div>

                {imageUrl && (
                    <div className="mb-4">
                        <Label>Image actuelle</Label>
                        <img src={imageUrl} alt="Image actuelle" className="w-32 h-32 object-cover rounded border" />
                    </div>
                )}

                <div>
                    <Label htmlFor="image">Nouvelle image</Label>
                    <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setNewImage(file);
                            }
                        }}
                    />
                </div>

                <div className="flex gap-4 mt-4">
                    <Button type="submit">Mettre à jour</Button>
                    <Button type="button" variant="destructive" onClick={handleDelete}>
                        Supprimer
                    </Button>
                </div>
            </form>
        </DashboardLayout>
    );
}
