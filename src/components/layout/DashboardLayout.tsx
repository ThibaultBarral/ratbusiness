// components/layout/DashboardLayout.tsx
import Link from "next/link";
import {
    Layout,
    LayoutHeader,
    LayoutTitle,
    LayoutContent,
    LayoutSidebar,
    LayoutFooter,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Home, Package, ShoppingCart, BarChart2, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

    return (
        <Layout className="min-h-screen">
            <LayoutHeader className="border-b px-4 py-2 flex items-center justify-between">
                <LayoutTitle className="text-xl font-bold">Ratbusiness</LayoutTitle>
                <Link href="/auth/signout">
                    <Button variant="ghost">
                        <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                    </Button>
                </Link>
            </LayoutHeader>

            <div className="flex flex-1">
                <LayoutSidebar className="w-64 border-r px-4 py-6">
                    <nav className="space-y-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" className="w-full justify-start">
                                <Home className="w-4 h-4 mr-2" /> Dashboard
                            </Button>
                        </Link>
                        <Link href="/articles">
                            <Button variant="ghost" className="w-full justify-start">
                                <Package className="w-4 h-4 mr-2" /> Articles
                            </Button>
                        </Link>
                        <Link href="/sales">
                            <Button variant="ghost" className="w-full justify-start">
                                <ShoppingCart className="w-4 h-4 mr-2" /> Ventes
                            </Button>
                        </Link>
                        <Link href="/statistics">
                            <Button variant="ghost" className="w-full justify-start">
                                <BarChart2 className="w-4 h-4 mr-2" /> Statistiques
                            </Button>
                        </Link>
                    </nav>
                </LayoutSidebar>

                <LayoutContent className="flex-1 px-6 py-8 bg-muted/50">
                    {children}
                </LayoutContent>
            </div>

            <LayoutFooter className="border-t px-4 py-2 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Ratbusiness. Tous droits réservés.
            </LayoutFooter>
        </Layout>
    );
}