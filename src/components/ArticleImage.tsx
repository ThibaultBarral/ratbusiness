"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import Image from "next/image";

interface ArticleImageProps {
    url?: string;
    className?: string;
}

export default function ArticleImage({ url, className = "w-24 h-24 object-cover rounded-md" }: ArticleImageProps) {
    const supabase = createClient();
    const [signedUrl, setSignedUrl] = useState<string>("");

    useEffect(() => {
        const getSignedUrl = async () => {
            if (!url) return;
            const match = url.match(/article-images\/(.+?)\?/);
            const path = match?.[1];
            if (!path) return;
            const { data, error } = await supabase.storage
                .from("article-images")
                .createSignedUrl(path, 3600);
            if (error) {
                console.error("Error creating signed URL:", error);
                return;
            }
            if (data?.signedUrl) {
                setSignedUrl(data.signedUrl);
            }
        };
        getSignedUrl();
    }, [url]);

    if (!url || !signedUrl) return null;
    return (
        <div className={className}>
            <Image
                src={signedUrl}
                alt="Article"
                className="object-cover rounded-md"
                unoptimized // Pour les URLs signées
                width={100}
                height={100}
            />
        </div>
    );
} 