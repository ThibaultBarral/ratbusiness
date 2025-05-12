"use client";

import HeroSection from "@/components/HeroSection";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Image from "next/image";
import Head from "next/head";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Ratbusiness - Gestion de business Vinted | Suivi des ventes et bénéfices</title>
        <meta name="description" content="Ratbusiness est l'application de gestion de business Vinted qui vous permet de suivre vos ventes, calculer vos bénéfices et optimiser votre activité. Essayez gratuitement pendant 14 jours." />
        <meta name="keywords" content="Vinted, gestion business, suivi ventes, calcul bénéfices, gestion inventaire, statistiques ventes, business Vinted" />
        <link rel="canonical" href="https://ratbusiness.fr" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ratbusiness.fr" />
        <meta property="og:title" content="Ratbusiness - Gestion de business Vinted | Suivi des ventes et bénéfices" />
        <meta property="og:description" content="Ratbusiness est l'application de gestion de business Vinted qui vous permet de suivre vos ventes, calculer vos bénéfices et optimiser votre activité." />
        <meta property="og:image" content="/assets/img/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ratbusiness - Gestion de business Vinted" />
        <meta name="twitter:description" content="Ratbusiness est l'application de gestion de business Vinted qui vous permet de suivre vos ventes, calculer vos bénéfices et optimiser votre activité." />
        <meta name="twitter:image" content="/assets/img/og-image.jpg" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-[#0f1c16] via-[#1a2e24] to-[#0d1411] text-white">
        <HeroSection />

        {/* Fonctionnalités */}
        <section id="features" className="min-h-screen lg:h-screen flex flex-col justify-center border-t border-gray-700" aria-label="Fonctionnalités">
          <div className="max-w-7xl mx-auto px-6 py-16 lg:py-0">
            <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Tout ce dont vous avez besoin
              </span>
              <br />
              pour gérer votre business Vinted
            </h2>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-12">
                {/* Feature 1 */}
                <article className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center" aria-hidden="true">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Gestion d&apos;inventaire avancée</h3>
                    <p className="text-gray-300">
                      Suivez chaque article avec précision : prix d&apos;achat, état, catégorie, marque, taille.
                      Ajoutez des photos et des notes pour une organisation optimale.
                    </p>
                  </div>
                </article>

                {/* Feature 2 */}
                <article className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center" aria-hidden="true">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Analyses et statistiques détaillées</h3>
                    <p className="text-gray-300">
                      Visualisez vos performances en temps réel : chiffre d&apos;affaires, marge bénéficiaire,
                      meilleurs produits, tendances de vente et prévisions.
                    </p>
                  </div>
                </article>

                {/* Feature 3 */}
                <article className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center" aria-hidden="true">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Suivi financier automatisé</h3>
                    <p className="text-gray-300">
                      Calculez automatiquement vos bénéfices, frais de port, commissions Vinted.
                      Exportez vos données pour votre comptabilité.
                    </p>
                  </div>
                </article>

                {/* Feature 4 */}
                <article className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center" aria-hidden="true">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Automatisation intelligente</h3>
                    <p className="text-gray-300">
                      Générez des rapports automatiquement.
                      Gagnez du temps sur les tâches répétitives.
                    </p>
                  </div>
                </article>
              </div>

              {/* Features Preview */}
              <div className="relative lg:block">
                <div className="relative w-full rounded-2xl overflow-hidden border border-gray-800">
                  <div className="absolute inset-0" />
                  <Image
                    src="/assets/img/dashboard-preview.png"
                    alt="Aperçu du tableau de bord Ratbusiness montrant les statistiques et analyses de ventes"
                    width={600}
                    height={600}
                    className="object-cover"
                    priority
                  />
                </div>
                {/* Stats Overlay */}
                <div className="absolute -bottom-6 -right-6 bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center" aria-hidden="true">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Croissance moyenne</p>
                      <p className="text-2xl font-bold text-white">+127%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tarifs */}
        <section id="pricing" className="min-h-screen lg:h-screen flex items-center border-t border-gray-700" aria-label="Tarifs">
          <div className="max-w-6xl mx-auto px-6 py-20 lg:py-0">
            <h2 className="text-3xl font-bold text-center mb-4">Tarifs adaptés à vos besoins</h2>
            <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              Choisissez le plan qui correspond le mieux à votre activité. Tous nos plans incluent un essai gratuit de 14 jours.
              Économisez 20% avec la facturation annuelle.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Plan Starter */}
              <article className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <p className="text-gray-400 mb-4">Pour démarrer</p>
                <div className="text-3xl font-bold mb-6">
                  9€<span className="text-gray-400 text-base font-normal">/mois</span>
                  <span className="text-sm text-green-400 ml-2">(annuel)</span>
                </div>
                <div className="text-sm text-gray-400 mb-6">ou 11€/mois (mensuel)</div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" aria-hidden="true" />
                    <span>Jusqu&apos;à 20 articles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" aria-hidden="true" />
                    <span>Calcul du bénéfice</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" aria-hidden="true" />
                    <span>Stats basiques</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" aria-hidden="true" />
                    <span>Support par email</span>
                  </li>
                </ul>
                <Button className="w-full bg-gray-800 hover:bg-gray-700">Commencer</Button>
              </article>

              {/* Plan Pro */}
              <article className="bg-gray-900 rounded-2xl p-8 border-2 border-green-500 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-black px-4 py-1 rounded-full text-sm font-semibold">
                  Populaire
                </div>
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <p className="text-gray-400 mb-4">Pour les vendeurs actifs</p>
                <div className="text-3xl font-bold mb-6">
                  19€<span className="text-gray-400 text-base font-normal">/mois</span>
                  <span className="text-sm text-green-400 ml-2">(annuel)</span>
                </div>
                <div className="text-sm text-gray-400 mb-6">ou 24€/mois (mensuel)</div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" aria-hidden="true" />
                    <span>Articles illimités</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" aria-hidden="true" />
                    <span>Export CSV</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" aria-hidden="true" />
                    <span>Alertes de stock</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" aria-hidden="true" />
                    <span>Support prioritaire</span>
                  </li>
                </ul>
                <Button className="w-full bg-green-500 text-black hover:bg-green-400">Commencer</Button>
              </article>

              {/* Plan Business */}
              <article className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
                <h3 className="text-xl font-bold mb-2">Business</h3>
                <p className="text-gray-400 mb-4">Pour les professionnels</p>
                <div className="text-3xl font-bold mb-6">
                  39€<span className="text-gray-400 text-base font-normal">/mois</span>
                  <span className="text-sm text-green-400 ml-2">(annuel)</span>
                </div>
                <div className="text-sm text-gray-400 mb-6">ou 49€/mois (mensuel)</div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" aria-hidden="true" />
                    <span>Assistant IA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" aria-hidden="true" />
                    <span>Support prioritaire</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" aria-hidden="true" />
                    <span>Multi-utilisateur</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" aria-hidden="true" />
                    <span>API & Webhooks</span>
                  </li>
                </ul>
                <Button className="w-full bg-gray-800 hover:bg-gray-700">Commencer</Button>
              </article>
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section id="testimonials" className="min-h-screen lg:h-screen flex items-center border-t border-gray-700" aria-label="Témoignages">
          <div className="max-w-4xl mx-auto px-6 py-20 lg:py-0">
            <h2 className="text-3xl font-bold text-center mb-10">Ils utilisent Ratbusiness</h2>
            <div className="grid gap-8 sm:grid-cols-2 text-sm text-gray-300">
              <blockquote className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                <p className="italic">&quot;Ratbusiness m&apos;a permis de suivre enfin mes bénéfices sans me prendre la tête.&quot;</p>
                <footer className="mt-4 text-right">— Julie, vendeuse pro sur Vinted</footer>
              </blockquote>
              <blockquote className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                <p className="italic">&quot;J&apos;ai gagné en clarté. Les stats sont claires, je recommande.&quot;</p>
                <footer className="mt-4 text-right">— Mehdi, étudiant revendeur</footer>
              </blockquote>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="min-h-screen lg:h-screen flex items-center border-t border-gray-700" aria-label="Questions fréquentes">
          <div className="max-w-4xl mx-auto px-6 py-20 lg:py-0">
            <h2 className="text-3xl font-bold text-center mb-10">Questions fréquentes</h2>
            <div className="space-y-6">
              <article className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold mb-2">Comment fonctionne l&apos;essai gratuit ?</h3>
                <p className="text-gray-300">Vous pouvez essayer toutes les fonctionnalités de Ratbusiness pendant 14 jours sans engagement. Aucune carte bancaire n&apos;est requise.</p>
              </article>
              <article className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold mb-2">Est-ce que mes données sont sécurisées ?</h3>
                <p className="text-gray-300">Oui, toutes vos données sont chiffrées et stockées de manière sécurisée. Nous respectons le RGPD et ne partageons jamais vos informations.</p>
              </article>
              <article className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold mb-2">Puis-je annuler mon abonnement ?</h3>
                <p className="text-gray-300">Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace client. Aucun frais supplémentaire ne sera facturé.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="min-h-screen lg:h-screen flex items-center border-t border-gray-700" aria-label="Contact">
          <div className="max-w-4xl mx-auto px-6 py-20 lg:py-0">
            <h2 className="text-3xl font-bold text-center mb-10">Contactez-nous</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold mb-4">Besoin d&apos;aide ?</h3>
                <p className="text-gray-300 mb-6">
                  Notre équipe est là pour vous aider à tirer le meilleur parti de Ratbusiness.
                  N&apos;hésitez pas à nous contacter pour toute question.
                </p>
                <div className="space-y-4">
                  <p className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <a href="mailto:support@ratbusiness.fr" className="hover:text-green-400">support@ratbusiness.fr</a>
                  </p>
                </div>
              </div>
              <form className="space-y-4" aria-label="Formulaire de contact">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                  <input type="text" id="name" name="name" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input type="email" id="email" name="email" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500" required />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                  <textarea id="message" name="message" rows={4} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500" required></textarea>
                </div>
                <Button type="submit" className="w-full bg-green-500 text-black hover:bg-green-400">Envoyer</Button>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-700 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Ratbusiness</h3>
                <p className="text-gray-400">L&apos;app qui booste ton business Vinted</p>
              </div>
              <nav aria-label="Navigation produit">
                <h4 className="text-sm font-semibold mb-4">Produit</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="#features">Fonctionnalités</Link></li>
                  <li><Link href="#pricing">Tarifs</Link></li>
                  <li><Link href="#testimonials">Témoignages</Link></li>
                </ul>
              </nav>
              <nav aria-label="Navigation support">
                <h4 className="text-sm font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="#faq">FAQ</Link></li>
                  <li><Link href="#contact">Contact</Link></li>
                  <li><Link href="#">Centre d&apos;aide</Link></li>
                </ul>
              </nav>
              <nav aria-label="Navigation légal">
                <h4 className="text-sm font-semibold mb-4">Légal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="#">Mentions légales</Link></li>
                  <li><Link href="#">Politique de confidentialité</Link></li>
                  <li><Link href="#">CGU</Link></li>
                </ul>
              </nav>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} Ratbusiness. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}