import { Lock } from "lucide-react";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import { Badge } from "./badge";

interface ProLockProps {
    children: React.ReactNode;
    isPro: boolean;
    title?: string;
    description?: string;
    buttonText?: string;
    className?: string;
    inline?: boolean;
}

export function ProLock({
    children,
    isPro,
    title = "Débloquez cette fonctionnalité",
    description = "Visualisez l'évolution de vos ventes et prenez de meilleures décisions",
    buttonText = "Passer au plan Pro",
    className = "",
    inline = false,
}: ProLockProps) {
    const router = useRouter();

    if (isPro) {
        return <>{children}</>;
    }

    if (inline) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <Badge variant="secondary" className="text-xs">PRO</Badge>
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{title}</span>
                <Button size="sm" variant="default" onClick={() => router.push("/billing")}>{buttonText}</Button>
            </div>
        );
    }

    return (
        <div className="relative min-h-52">
            <div className="blur-sm pointer-events-none">
                {children}
            </div>
            <div className={`absolute inset-0 border rounded-xl bg-white/30 backdrop-blur-sm shadow-md flex flex-col items-center justify-center p-6 text-center ${className}`}>
                <Lock className="w-8 h-8 mx-auto text-primary mb-2" />
                <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <Badge variant="secondary" className="text-xs">PRO</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{description}</p>
                <Button variant="default" className="w-full" onClick={() => router.push("/billing")}>{buttonText}</Button>
            </div>
        </div>
    );
}

export function ProLockButton({
    children,
    isPro,
    onClick,
    className = "",
}: {
    children: React.ReactNode;
    isPro: boolean;
    onClick: () => void;
    className?: string;
}) {
    const router = useRouter();

    return (
        <Button
            onClick={() => isPro ? onClick() : router.push("/billing")}
            className={`relative ${className}`}
        >
            {!isPro && (
                <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">PRO</Badge>
                    <Lock className="w-3 h-3 text-muted-foreground" />
                </div>
            )}
            {children}
        </Button>
    );
} 