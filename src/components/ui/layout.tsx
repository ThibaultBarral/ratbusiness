import { cn } from "@/lib/utils";

export function Layout({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    return <div className={cn("flex flex-col", className)} {...props} />;
}

export function LayoutHeader({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    return <header className={cn("border-b bg-white px-6 py-4", className)} {...props} />;
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

export function LayoutFooter({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    return <footer className={cn("bg-white px-6 py-4 border-t", className)} {...props} />;
}
