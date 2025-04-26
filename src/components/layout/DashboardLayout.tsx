// components/layout/DashboardLayout.tsx

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
    Layout,
    LayoutHeader,
    LayoutContent,
    LayoutSidebar,
    LayoutFooter,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Home, Package, ShoppingCart, BarChart2, LogOut, Settings, LifeBuoy, Book, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = createClient();
    const router = useRouter();

    const [userDisplayName, setUserDisplayName] = useState("");
    const pathname = usePathname();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleSignOut = async () => {
        await fetch("/auth/signout", {
            method: "POST",
        });
        router.push("/login");
    };

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('users')
                    .select('username')
                    .eq('id', user.id)
                    .single();

                if (error || !data) {
                    console.error("Erreur de récupération du username:", error);
                    setUserDisplayName("Utilisateur");
                    return;
                }

                setUserDisplayName(data.username);
            }
        };
        fetchUser();
    }, []);

    return (
        <Layout className="min-h-screen">
            <LayoutHeader className="border-b px-4 py-2 w-full grid grid-cols-3 items-center">
                <Button variant="ghost" className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <Menu className="w-6 h-6" />
                </Button>
                <div className="flex items-center gap-3">
                    <Image
                        src="/assets/img/logo-ratbusiness.png"
                        alt="Logo Ratbusiness"
                        width={45}
                        height={45}
                        className="rounded-full"
                    />
                </div>
                <span className="text-xl font-bold text-center">Ratbusiness</span>
                <div className="ml-auto">
                    <Button variant="ghost" onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                    </Button>
                </div>
            </LayoutHeader>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-30 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <div className="flex flex-1">
                <div className={`${isSidebarOpen ? "block" : "hidden"} md:block fixed md:static top-0 left-0 z-50 w-64 h-full bg-white border-r shadow-sm`}>
                    <LayoutSidebar className="w-64 px-4 py-6">
                        {/* Avatar utilisateur */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full border flex items-center justify-center text-white bg-black text-xl font-bold">
                                {userDisplayName ? userDisplayName.charAt(0).toUpperCase() : "?"}
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
                </div>

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