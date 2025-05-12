"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from "@/components/ui/button";

const navItems = [
    {
        id: 1,
        text: "Fonctionnalités",
        link: "#features"
    },
    {
        id: 2,
        text: "Tarifs",
        link: "#pricing"
    },
    {
        id: 3,
        text: "Témoignages",
        link: "#testimonials"
    },
    {
        id: 4,
        text: "FAQ",
        link: "#faq"
    },
    {
        id: 5,
        text: "Contact",
        link: "#contact"
    },
];

const Navbar = () => {
    const [openNavbar, setOpenNavbar] = useState(false);
    const toggleNavbar = () => {
        setOpenNavbar(openNavbar => !openNavbar);
    };
    return (
        <>
            <header className="absolute left-0 top-0 w-full flex items-center h-24 z-40">
                <nav className="relative mx-auto lg:max-w-7xl w-full px-5 sm:px-10 md:px-12 lg:px-5 flex gap-x-5 justify-between items-center">
                    <div className="flex items-center min-w-max relative">
                        <Link href="#" className="font-semibold flex items-center gap-x-2">
                            <Image
                                src="/assets/img/logo-ratbusiness.png"
                                alt="Logo Ratbusiness"
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                            <span className="text-lg text-white">Ratbusiness</span>
                        </Link>
                    </div>
                    <div className={`
            fixed inset-x-0 h-[100dvh] lg:h-max top-0 lg:opacity-100 left-0 bg-[#0f1c16] lg:!bg-transparent py-32 lg:py-0 px-5 sm:px-10 md:px-12 lg:px-0 w-full lg:top-0 lg:relative lg:flex lg:justify-between duration-300 ease-linear
            ${openNavbar ? "" : "-translate-y-10 opacity-0 invisible lg:visible lg:translate-y-0"}
          `}>
                        <ul className="flex flex-col lg:flex-row gap-6 lg:items-center text-white lg:w-full lg:pl-10">
                            {navItems.map(navItem => (
                                <li key={navItem.id}>
                                    <Link href={navItem.link} className="relative py-2.5 duration-300 ease-linear hover:text-green-400">
                                        {navItem.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:min-w-max mt-10 lg:mt-0">
                            <Button asChild variant="outline" size="lg" className="w-full sm:w-max text-primary">
                                <Link href="/login">
                                    Se connecter
                                </Link>
                            </Button>
                            <Button asChild size="lg" className="w-full sm:w-max">
                                <Link href="/dashboard">
                                    Créer un compte
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center lg:hidden">
                        <button onClick={() => { toggleNavbar() }} className="outline-none border-l border-l-gray-700 pl-3 relative py-3">
                            <span className="sr-only">Toggle navbar</span>
                            <span aria-hidden="true" className={`
                flex h-0.5 w-6 rounded bg-gray-300 transition duration-300
                ${openNavbar ? "rotate-45 translate-y-[0.33rem]" : ""}
              `} />
                            <span aria-hidden="true" className={`
                flex mt-2 h-0.5 w-6 rounded bg-gray-300 transition duration-300
                ${openNavbar ? "-rotate-45 -translate-y-[0.33rem]" : ""}
              `} />
                        </button>
                    </div>
                </nav>
            </header>
        </>
    );
};

export default function HeroSection() {
    const [] = useState(false);


    return (
        <>
            <Navbar />
            <section className="min-h-screen lg:h-screen">
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-br from-green-400 opacity-90 blur-lg dark:from-green-600 dark:blur-xl dark:opacity-40" />
                <div className="w-full h-full flex items-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-2/5 aspect-[2/0.5] bg-gradient-to-br from-green-500 to-green-400 rounded-full opacity-50 blur-2xl" />
                    <div className="min-h-max relative mx-auto pt-32 lg:pt-0 lg:max-w-7xl w-full px-5 sm:px-10 md:px-12 lg:px-5 text-center space-y-10">
                        <Link href="/login" className="flex items-center gap-x-2 text-gray-300 mx-auto w-max px-2 pr-1 py-1 rounded-full bg-gray-800 border border-gray-700">
                            Ratbusiness v1.0 est disponible
                            <span className="px-1 rounded-full bg-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z" clipRule="evenodd" />
                                </svg>
                            </span>
                        </Link>
                        <h1 className="text-white mx-auto max-w-5xl font-semibold text-4xl/tight sm:text-5xl/tight lg:text-6xl/tight">
                            L&apos;app qui booste ton business<br />Vinted 🚀
                        </h1>
                        <p className="text-gray-300 mx-auto max-w-2xl">
                            Visualise tes performances, suis tes ventes, gère ton stock.
                            <br className="hidden sm:block" />
                            Simple. Rapide. Efficace.
                        </p>
                        {/* <div className="flex sm:flex-row flex-col gap-5 w-full mx-auto max-w-lg">
                            <form action="#" className="py-1 pl-6 w-full pr-1 flex gap-3 items-center text-gray-300 shadow-lg shadow-gray-900/20
              border border-gray-700 bg-gray-800 rounded-full ease-linear focus-within:bg-gray-900 focus-within:border-green-500">
                                <input type="email" name="" id="" placeholder="ton@email.com" className="w-full py-3 outline-none bg-transparent" />
                                <button onClick={handleClick} disabled={loading} className="flex text-black justify-center items-center w-max min-w-max sm:w-max px-6 h-12 rounded-full outline-none relative overflow-hidden border duration-300 ease-linear
                after:absolute after:inset-x-0 after:aspect-square after:scale-0 after:opacity-70 after:origin-center after:duration-300 after:ease-linear after:top-0 after:left-0 after:bg-green-400 hover:after:opacity-100 hover:after:scale-[2.5] bg-green-500 border-transparent hover:border-green-400">
                                    <span className="hidden sm:flex relative z-[5]">
                                        {loading ? 'Chargement...' : 'Lancer mon dashboard'}
                                    </span>
                                    <span className="flex sm:hidden relative z-[5]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                        </svg>
                                    </span>
                                </button>
                            </form>
                        </div> */}
                    </div>
                </div>
            </section>
        </>
    );
} 