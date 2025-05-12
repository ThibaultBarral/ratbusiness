// components/layout/DashboardLayout.tsx

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
    Layout,
    LayoutContent,
    LayoutSidebar,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Home, Package, ShoppingCart, BarChart2, LogOut, Settings, Book, Menu, Bell, CreditCard, ChevronUp, Gift, Share2, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = createClient();
    const router = useRouter();

    const [userDisplayName, setUserDisplayName] = useState("");
    const [userEmail, setUserEmail] = useState("");
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
                setUserEmail(user.email || "");
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
            <Button variant="ghost" className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <Menu className="w-6 h-6" />
            </Button>


            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-30 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <div className="flex flex-1">
                <div className={`${isSidebarOpen ? "block" : "hidden"} md:block w-64 h-screen bg-white border-r`}>
                    <LayoutSidebar className="w-64 h-full fixed flex flex-col px-4 py-6">
                        <div className="flex justify-center items-center mb-8 gap-3">
                            <Image
                                src="/assets/img/logo-ratbusiness.png"
                                alt="Logo Ratbusiness"
                                width={45}
                                height={45}
                                className="rounded-full"
                            />
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
                            <Link href="/logistics">
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start text-sm font-medium hover:bg-accent hover:text-accent-foreground transition ${pathname === "/logistics" ? "bg-accent text-accent-foreground" : ""
                                        }`}
                                >
                                    <Truck className="w-4 h-4 mr-2" /> Logistique
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
                        <div className="mt-auto">
                            <div className="space-y-2 mb-4">
                                <Link href="/billing">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-sm font-medium hover:bg-accent hover:text-accent-foreground transition"
                                    >
                                        <CreditCard className="w-4 h-4 mr-2" /> Tarifs
                                    </Button>
                                </Link>
                                <Link href="/free-month">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-sm font-medium hover:bg-accent hover:text-accent-foreground transition"
                                    >
                                        <Gift className="w-4 h-4 mr-2" /> Obtenir 1 mois offert
                                    </Button>
                                </Link>
                                <Link href="/affiliate">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-sm font-medium hover:bg-accent hover:text-accent-foreground transition"
                                    >
                                        <Share2 className="w-4 h-4 mr-2" /> Parrainage
                                    </Button>
                                </Link>
                            </div>
                            <div className="w-full pt-2 border-t bg-white">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="w-full hover:bg-transparent cursor-pointer !px-0 justify-between text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-muted rounded-full h-8 w-8 flex items-center justify-center font-semibold">
                                                    {userDisplayName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col items-start overflow-hidden">
                                                    <span className="text-sm font-medium">{userDisplayName}</span>
                                                    <span className="text-xs text-muted-foreground max-w-[140px] truncate block">
                                                        {userEmail}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronUp className="w-4 h-4 ml-2" />
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="start" side="top" className="w-64">
                                        <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">
                                            Mon compte
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <Bell className="w-4 h-4 mr-2" /> Notifications
                                        </DropdownMenuItem>
                                        <Link href="/settings">
                                            <DropdownMenuItem asChild>
                                                <button className="w-full text-left flex items-center">
                                                    <Settings className="w-4 h-4 mr-2" /> Paramètres
                                                </button>
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href="/billing">
                                            <DropdownMenuItem asChild>
                                                <button className="w-full text-left flex items-center">
                                                    <CreditCard className="w-4 h-4 mr-2" /> Paiement
                                                </button>
                                            </DropdownMenuItem>
                                        </Link>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                                            <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </LayoutSidebar>
                </div>

                <LayoutContent className="flex-1 px-6 py-8 bg-muted/50">
                    {children}
                </LayoutContent>
            </div>
        </Layout>
    );
}