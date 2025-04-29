import { cn } from "@/lib/utils";

export function Layout({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    return <div className={cn("flex flex-col", className)} {...props} />;
}

export function LayoutTitle({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    return <h1 className={cn("text-lg font-semibold", className)} {...props} />;
}

export function LayoutSidebar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    return <aside className={cn("bg-white", className)} {...props} />;
}

export function LayoutContent({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    return <main className={cn("flex-1", className)} {...props} />;
}
