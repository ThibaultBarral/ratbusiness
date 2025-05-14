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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NewArticlePage() {
    const router = useRouter();
    const supabase = createClient();
    const { plan, isLoading } = useUserPlan();
    const { handleAction } = usePlanAction();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState<string[]>([]);
    const [platforms, setPlatforms] = useState<string[]>([]);
    const [, setSizes] = useState<string[]>([]);
    const [form, setForm] = useState({
        name: "",
        description: "",
        brand: "",
        new_brand: "",
        category: "",
        size: "",
        new_size: "",
        purchase_price_total: "",
        quantity: "",
        purchase_date: "",
        platform: "",
        new_platform: "",
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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

            // Récupérer les marques existantes
            const { data: existingBrands, error: brandsError } = await supabase
                .from("articles")
                .select("brand")
                .not("brand", "is", null)
                .order("brand");

            if (brandsError) {
                console.error("Erreur lors de la récupération des marques:", brandsError);
                return;
            }

            // Extraire les marques uniques et les trier
            const uniqueBrands = [...new Set(existingBrands.map(item => item.brand))].filter(Boolean);
            setBrands(uniqueBrands);

            const { data: existingSizes, error: sizesError } = await supabase
                .from("articles")
                .select("size")
                .not("size", "is", null)
                .order("size");

            if (sizesError) {
                console.error("Erreur lors de la récupération des tailles:", sizesError);
                return;
            }

            const uniqueSizes = [...new Set(existingSizes.map(item => item.size))].filter(Boolean);
            setSizes(uniqueSizes);

            const { data: existingPlatforms, error: platformsError } = await supabase
                .from("articles")
                .select("platform")
                .not("platform", "is", null)
                .order("platform");

            if (platformsError) {
                console.error("Erreur lors de la récupération des plateformes:", platformsError);
            } else {
                const uniquePlatforms = [...new Set(existingPlatforms.map(item => item.platform))].filter(Boolean);
                setPlatforms(uniquePlatforms);
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

    const standardSizes = form.category === "chaussures"
        ? ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"]
        : form.category === "vêtements"
            ? ["XS", "S", "M", "L", "XL", "XXL"]
            : [];

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

            const finalBrand = form.new_brand?.trim() !== "" ? form.new_brand : form.brand;
            const finalSize = form.new_size?.trim() !== "" ? form.new_size : form.size;
            const finalPlatform = form.new_platform?.trim() !== "" ? form.new_platform : form.platform;

            const { error: insertError } = await supabase.from("articles").insert({
                name: form.name,
                description: form.description,
                brand: finalBrand,
                category: form.category,
                size: finalSize,
                purchase_price_total: parseFloat(form.purchase_price_total),
                quantity: parseInt(form.quantity),
                purchase_date: form.purchase_date,
                platform: finalPlatform,
                image_url: imageUrl,
                user_id: user.id,
            });

            if (insertError) {
                alert("Erreur enregistrement article : " + insertError.message);
                setLoading(false);
                return;
            }

            router.push("/articles");
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };


    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold mb-6">Ajouter un article</h2>
            <form onSubmit={handleSubmit} className="grid gap-8 max-w-3xl">
                {/* Infos générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">Nom *</Label>
                        <Input name="name" required value={form.name} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Input name="description" value={form.description} onChange={handleChange} />
                    </div>
                </div>
                {/* Marque et Catégorie */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="brand">Marque (liste existante)</Label>
                        <Select onValueChange={(value) => setForm(prev => ({ ...prev, brand: value }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une marque" />
                            </SelectTrigger>
                            <SelectContent>
                                {brands.map((brand) => (
                                    <SelectItem key={brand} value={brand}>
                                        {brand}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Label htmlFor="new_brand" className="mt-2">Ou entrez une nouvelle marque</Label>
                        <Input
                            id="new_brand"
                            placeholder="Nouvelle marque"
                            value={form.new_brand || ""}
                            onChange={(e) => setForm(prev => ({ ...prev, new_brand: e.target.value }))}
                        />
                    </div>
                    <div>
                        <Label htmlFor="category">Catégorie</Label>
                        <Select
                            value={form.category}
                            onValueChange={(value) => setForm((prev) => ({ ...prev, category: value, size: "", new_size: "" }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="vêtements">Vêtements</SelectItem>
                                <SelectItem value="chaussures">Chaussures</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {/* Taille si catégorie */}
                {form.category && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="size">Taille (liste standard)</Label>
                            <Select onValueChange={(value) => setForm(prev => ({ ...prev, size: value }))} value={form.size}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une taille" />
                                </SelectTrigger>
                                <SelectContent>
                                    {standardSizes.map((size) => (
                                        <SelectItem key={size} value={size}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Label htmlFor="new_size" className="mt-2">Ou entrez une nouvelle taille</Label>
                            <Input
                                id="new_size"
                                placeholder="Nouvelle taille"
                                value={form.new_size || ""}
                                onChange={(e) => setForm(prev => ({ ...prev, new_size: e.target.value }))}
                            />
                        </div>
                    </div>
                )}
                {/* Prix, quantité, date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>
                {/* Plateforme */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="platform">Plateforme (liste existante)</Label>
                        <Select onValueChange={(value) => setForm(prev => ({ ...prev, platform: value }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une plateforme" />
                            </SelectTrigger>
                            <SelectContent>
                                {platforms.map((p) => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Label htmlFor="new_platform" className="mt-2">Ou entrez une nouvelle plateforme</Label>
                        <Input
                            id="new_platform"
                            placeholder="Nouvelle plateforme"
                            value={form.new_platform || ""}
                            onChange={(e) => setForm(prev => ({ ...prev, new_platform: e.target.value }))}
                        />
                    </div>
                </div>
                {/* Image */}
                <div className="flex flex-col gap-2 max-w-xs">
                    <Label htmlFor="image">Image *</Label>
                    <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        required={!imagePreview}
                        onChange={handleImageChange}
                    />
                    <span className="text-xs text-gray-500">Formats acceptés : JPG, PNG, HEIC. Taille max : 5 Mo.</span>
                    {imagePreview && (
                        <div className="relative mt-2">
                            <img src={imagePreview} alt="Aperçu" className="w-32 h-32 object-cover rounded border" />
                        </div>
                    )}
                </div>
                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    {loading ? "Enregistrement en cours..." : "Enregistrer"}
                </Button>
            </form>
        </DashboardLayout>
    );
}
