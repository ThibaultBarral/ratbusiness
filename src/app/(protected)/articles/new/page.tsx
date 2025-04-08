"use client";
import heic2any from "heic2any";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../../utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function NewArticlePage() {
    const router = useRouter();
    const supabase = createClient();
    const [imageFile, setImageFile] = useState<File | null>(null);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        let imageUrl = "";

        if (imageFile) {
            let finalFile = imageFile;

            if (imageFile.type === "image/heic" || imageFile.name.endsWith(".heic")) {
                try {
                    const convertedBlob = await heic2any({ blob: imageFile, toType: "image/jpeg" });
                    finalFile = new File([Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob], imageFile.name.replace(/\.heic$/i, ".jpg"), {
                        type: "image/jpeg",
                    });
                } catch (error) {
                    alert("Erreur lors de la conversion HEIC : " + (error as Error).message);
                    return;
                }
            }

            const filePath = `${user.id}/${Date.now()}-${finalFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from("article-images")
                .upload(filePath, finalFile);

            if (uploadError) {
                alert("Erreur upload image : " + uploadError.message);
                return;
            }

            const { data: signedUrlData, error: urlError } = await supabase.storage
                .from("article-images")
                .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 an

            if (urlError) {
                alert("Erreur génération URL signée : " + urlError.message);
                return;
            }

            imageUrl = signedUrlData?.signedUrl || "";
        }

        const { error } = await supabase.from("articles").insert({
            ...form,
            purchase_price_total: parseFloat(form.purchase_price_total),
            quantity: parseInt(form.quantity),
            image_url: imageUrl,
            user_id: user.id,
        });

        if (!error) {
            router.push("/articles");
        } else {
            alert("Erreur : " + error.message);
        }
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

                <Button type="submit">Enregistrer</Button>
            </form>
        </DashboardLayout>
    );
}
