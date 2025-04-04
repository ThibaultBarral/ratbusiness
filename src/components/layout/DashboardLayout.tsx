// components/layout/DashboardLayout.tsx

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Layout,
    LayoutHeader,
    LayoutContent,
    LayoutSidebar,
    LayoutFooter,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Home, Package, ShoppingCart, BarChart2, LogOut, Settings, LifeBuoy, Book } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = createClient();
    const [userInitial, setUserInitial] = useState("");
    const pathname = usePathname();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                setUserInitial(user.email.charAt(0).toUpperCase());
            }
        };
        fetchUser();
    }, []);

    return (
        <Layout className="min-h-screen">
            <LayoutHeader className="border-b px-4 py-2 w-full grid grid-cols-3 items-center">
                <Image
                    src="/assets/img/logo-ratbusiness.png"
                    alt="Logo Ratbusiness"
                    width={45}
                    height={45}
                    className="rounded-full"
                />
                <span className="text-xl font-bold text-center">Ratbusiness</span>
                <div className="ml-auto">
                    <Link href="/auth/signout">
                        <Button variant="ghost">
                            <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                        </Button>
                    </Link>
                </div>
            </LayoutHeader>

            <div className="flex flex-1">
                <LayoutSidebar className="w-64 border-r bg-white px-4 py-6 shadow-sm">
                    {/* Avatar utilisateur */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-full border flex items-center justify-center text-white bg-black text-xl font-bold">
                            {userInitial || "?"}
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <Link href="/dashboard">
                            <Button
                                variant="ghost"
                                className={`w-full justify-start text-sm font-medium hover:bg-accent hover:text-accent-foreground transition ${pathname === "/dashboard" ? "bg-accent text-accent-foreground" : ""
                                    }`}
                            >
                                <Home className="w-4 h-4 mr-2" /> Dashboard
                            </Button>
                        </Link>
                        <Link href="/articles">
                            <Button
                                variant="ghost"
                                className={`w-full justify-start text-sm font-medium hover:bg-accent hover:text-accent-foreground transition ${pathname === "/articles" ? "bg-accent text-accent-foreground" : ""
                                    }`}
                            >
                                <Package className="w-4 h-4 mr-2" /> Articles
                            </Button>
                        </Link>
                        <Link href="/sales">
                            <Button
                                variant="ghost"
                                className={`w-full justify-start text-sm font-medium hover:bg-accent hover:text-accent-foreground transition ${pathname === "/sales" ? "bg-accent text-accent-foreground" : ""
                                    }`}
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" /> Ventes
                            </Button>
                        </Link>
                        <Link href="/statistics">
                            <Button
                                variant="ghost"
                                className={`w-full justify-start text-sm font-medium hover:bg-accent hover:text-accent-foreground transition ${pathname === "/statistics" ? "bg-accent text-accent-foreground" : ""
                                    }`}
                            >
                                <BarChart2 className="w-4 h-4 mr-2" /> Statistiques
                            </Button>
                        </Link>
                    </nav>

                    <div className="border-t mt-6 pt-4 space-y-2">
                        <Link href="/settings">
                            <Button
                                variant="ghost"
                                className={`w-full justify-start text-sm font-medium hover:bg-accent hover:text-accent-foreground transition ${pathname === "/settings" ? "bg-accent text-accent-foreground" : ""
                                    }`}
                            >
                                <Settings className="w-4 h-4 mr-2" /> Paramètres
                            </Button>
                        </Link>
                        <Link href="/support">
                            <Button
                                variant="ghost"
                                className={`w-full justify-start text-sm font-medium hover:bg-accent hover:text-accent-foreground transition ${pathname === "/support" ? "bg-accent text-accent-foreground" : ""
                                    }`}
                            >
                                <LifeBuoy className="w-4 h-4 mr-2" /> Support
                            </Button>
                        </Link>
                        <Link href="/docs">
                            <Button
                                variant="ghost"
                                className={`w-full justify-start text-sm font-medium hover:bg-accent hover:text-accent-foreground transition ${pathname === "/docs" ? "bg-accent text-accent-foreground" : ""
                                    }`}
                            >
                                <Book className="w-4 h-4 mr-2" /> Documentation
                            </Button>
                        </Link>
                    </div>
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