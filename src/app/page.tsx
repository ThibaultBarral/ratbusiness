"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "../../utils/supabase/client";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const supabase = createClient(); // Create the Supabase client instance

  const handleClick = async () => {
    setLoading(true);
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f1c16] via-[#1a2e24] to-[#0d1411] text-white">
      {/* Hero section fullscreen sans image */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-6">
        {/* Logo en haut à gauche */}
        <div className="absolute top-6 left-6">
          <Image
            src="/assets/img/logo-ratbusiness.png"
            alt="Logo Ratbusiness"
            width={72}
            height={72}
            className="rounded-full"
          />
        </div>

        <div className="max-w-5xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 text-green-400">
            Ratbusiness
          </h1>
          <h2 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
            L&apos;app qui booste ton business<br />Vinted 🚀
          </h2>
          <p className="text-base sm:text-lg text-gray-300 mb-10">
            Visualise tes performances, suis tes ventes, gère ton stock.
            <br className="hidden sm:block" />
            Simple. Rapide. Efficace.
          </p>
          <Link href="/dashboard">
            <Button onClick={handleClick} disabled={loading} size="lg" className="bg-green-500 text-black font-semibold hover:bg-green-400">
              {loading ? 'Chargement...' : 'Lancer mon dashboard'}
            </Button>
          </Link>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="max-w-4xl mx-auto py-16 border-t border-gray-700 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">Fonctionnalités clés</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-gray-300">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">📦 Gestion des articles</h3>
            <p>Ajoutez, modifiez et suivez chaque article que vous vendez sur Vinted.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">💸 Suivi des ventes</h3>
            <p>Gardez une trace de chaque vente et calculez automatiquement vos profits.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">📊 Statistiques dynamiques</h3>
            <p>Visualisez votre chiffre d&apos;affaires, votre marge moyenne et vos stocks restants.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">🔒 Sécurité & confidentialité</h3>
            <p>Vos données sont protégées et accessibles uniquement à vous.</p>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="max-w-4xl mx-auto py-20 border-t border-gray-700 text-center px-6">
        <h2 className="text-3xl font-bold mb-10">Comment ça marche ?</h2>
        <div className="grid sm:grid-cols-3 gap-8 text-gray-300">
          <div>
            <h3 className="text-5xl font-bold text-green-400 mb-2">1</h3>
            <p>Ajoutez vos articles à votre inventaire avec leur prix d&apos;achat.</p>
          </div>
          <div>
            <h3 className="text-5xl font-bold text-green-400 mb-2">2</h3>
            <p>Enregistrez chaque vente avec son prix de revente et la date.</p>
          </div>
          <div>
            <h3 className="text-5xl font-bold text-green-400 mb-2">3</h3>
            <p>Consultez vos bénéfices et votre performance en temps réel.</p>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="max-w-4xl mx-auto py-20 border-t border-gray-700 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">Ils utilisent Ratbusiness</h2>
        <div className="grid gap-8 sm:grid-cols-2 text-sm text-gray-300">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
            <p className="italic">&quot;Ratbusiness m&apos;a permis de suivre enfin mes bénéfices sans me prendre la tête.&quot;</p>
            <p className="mt-4 text-right">— Julie, vendeuse pro sur Vinted</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
            <p className="italic">&quot;J&apos;ai gagné en clarté. Les stats sont claires, je recommande.&quot;</p>
            <p className="mt-4 text-right">— Mehdi, étudiant revendeur</p>
          </div>
        </div>
      </section>

      {/* À propos */}
      <section className="max-w-3xl mx-auto py-16 border-t border-gray-700 text-center px-6">
        <h2 className="text-3xl font-bold mb-4">À propos</h2>
        <p className="text-gray-300">
          Ratbusiness est né de la volonté d&apos;aider les revendeurs à gérer leurs activités plus facilement, plus
          intelligemment et avec plaisir. Fini les tableurs, place à une interface claire et pensée pour vous.
        </p>
      </section>

      {/* Call to action final */}
      <section className="max-w-3xl mx-auto py-20 border-t border-gray-700 text-center px-6">
        <h2 className="text-3xl font-bold mb-4">Prêt à booster ton activité ?</h2>
        <p className="mb-6 text-gray-300">Rejoins Ratbusiness dès maintenant et prends le contrôle de tes ventes.</p>
        <Link href="/dashboard">
          <Button size="lg" className="bg-green-500 text-black font-semibold hover:bg-green-400">
            Lancer mon dashboard
          </Button>
        </Link>
      </section>
    </main>
  );
}