import { cn } from "@/lib/utils";
import { useState } from "react";

interface FomoMessageProps {
    profit: number;
    filter: "7days" | "30days" | "month" | "year";
    growthRate: string | null;
    profitGrowthRate: string | null;
    marginGrowthRate: string | null;
    className?: string;
}

const formatPeriod = (filter: string) => {
    switch (filter) {
        case "7days":
            return "cette semaine";
        case "30days":
            return "ce mois";
        case "month":
            return "ce mois";
        case "year":
            return "cette année";
        default:
            return "cette période";
    }
};

const getGrowthMessage = (profit: number, filter: string, growthRate: string | null, profitGrowthRate: string | null, marginGrowthRate: string | null) => {
    const growth = parseFloat(growthRate || "0");
    const profitGrowth = parseFloat(profitGrowthRate || "0");
    const marginGrowth = parseFloat(marginGrowthRate || "0");

    // Si tous les indicateurs sont positifs
    if (growth > 0 && profitGrowth > 0 && marginGrowth > 0) {
        return `Performance exceptionnelle ! +${growth}% CA, +${profitGrowth}% bénéfice, +${marginGrowth}% marge 💫`;
    }

    // Si le CA et le bénéfice sont positifs
    if (growth > 0 && profitGrowth > 0) {
        return `Excellent ! +${growth}% CA et +${profitGrowth}% bénéfice 🚀`;
    }

    // Si le bénéfice et la marge sont positifs
    if (profitGrowth > 0 && marginGrowth > 0) {
        return `Super ! +${profitGrowth}% bénéfice et +${marginGrowth}% marge ⭐`;
    }

    // Si seul le bénéfice est positif
    if (profitGrowth > 0) {
        return `Continue comme ça ! +${profitGrowth}% de bénéfice 💸`;
    }

    // Si seul le CA est positif
    if (growth > 0) {
        return `CA en hausse de +${growth}% ! 🎯`;
    }

    // Si seule la marge est positive
    if (marginGrowth > 0) {
        return `Marge en hausse de +${marginGrowth}% ! 🎯`;
    }

    // Message par défaut si aucun indicateur n'est positif
    return `+${profit.toFixed(2)}€ de bénéfice ${formatPeriod(filter)}. Continue comme ça ! 💸`;
};

const messages = {
    "7days": [
        "Tu viens de faire {profit}€ cette semaine. T’es dans le game 💥",
        "Encore {profit}€ cette semaine… et si tu doublais ça la prochaine ? 👀",
        "{profit}€ de bénéfice en 7 jours, c’est plus que beaucoup en 1 mois 💸",
        "🔥 Cette semaine, t’as transformé des stocks en {profit}€ cash",
        "Tu construis un vrai business. +{profit}€ cette semaine 🙌",
        "{profit}€ de gagné cette semaine. Et ce n’est que le début 🚀"
    ],
    "30days": [
        "Un mois. {profit}€ de bénéfice. Tu avances fort 💼",
        "Ce mois-ci, t’as généré {profit}€. Next step : les 1k ? 👊",
        "Encore {profit}€ ce mois. Tu commences à être dangereux 🔥",
        "{profit}€ en un mois. Gère ton stock comme un pro 📈",
        "Ce mois, t’as transformé ton armoire en cash : +{profit}€ 💰",
        "{profit}€ ce mois. T’es clairement pas là pour jouer 👑"
    ],
    "month": [
        "Un mois. {profit}€ de bénéfice. Tu avances fort 💼",
        "Ce mois-ci, t’as généré {profit}€. Next step : les 1k ? 👊",
        "Encore {profit}€ ce mois. Tu commences à être dangereux 🔥",
        "{profit}€ en un mois. Gère ton stock comme un pro 📈",
        "Ce mois, t’as transformé ton armoire en cash : +{profit}€ 💰",
        "{profit}€ ce mois. T’es clairement pas là pour jouer 👑"
    ],
    "year": [
        "{profit}€ cette année. C’est plus qu’un hobby, c’est un business 🧠",
        "Tu peux être fier : {profit}€ depuis janvier, ça rigole plus 💪",
        "Une année, {profit}€ de bénéfice. Et c’est pas fini… 📆",
        "{profit}€ cumulés cette année. Tu deviens redoutable 💥",
        "Chaque vente t’a rapproché de ces {profit}€. Continue 💸",
        "{profit}€ cette année. T’es en train de construire quelque chose de grand 🚀"
    ],
};

const getMessageIndex = (filter: string) => {
    if (typeof window === 'undefined') return 0;
    const storedIndex = localStorage.getItem(`fomo-message-index-${filter}`);
    if (storedIndex === null) {
        const newIndex = Math.floor(Math.random() * messages[filter as keyof typeof messages].length);
        localStorage.setItem(`fomo-message-index-${filter}`, newIndex.toString());
        return newIndex;
    }
    return parseInt(storedIndex);
};

export function FomoMessage({ profit, filter, growthRate, profitGrowthRate, marginGrowthRate, className }: FomoMessageProps) {
    const [messageIndex] = useState(() => getMessageIndex(filter));

    if (profit <= 0) return null;

    // Afficher un message de croissance uniquement si les indicateurs sont significatifs, sinon un message standard aléatoire
    const growth = parseFloat(growthRate || "0");
    const profitGrowth = parseFloat(profitGrowthRate || "0");
    const marginGrowth = parseFloat(marginGrowthRate || "0");

    const shouldShowGrowthMessage = growth > 0 || profitGrowth > 0 || marginGrowth > 0;

    const message = shouldShowGrowthMessage
        ? getGrowthMessage(profit, filter, growthRate, profitGrowthRate, marginGrowthRate)
        : messages[filter][messageIndex].replace('{profit}', profit.toFixed(2));

    return (
        <div
            className={cn(
                "mt-2 mb-4 p-3 rounded-md text-sm font-medium border shadow-sm",
                "bg-accent/10 text-accent-foreground border-accent/20",
                "dark:bg-accent/20 dark:border-accent/30",
                "animate-in fade-in slide-in-from-top-2 duration-300",
                className
            )}
        >
            {message}
        </div>
    );
} 