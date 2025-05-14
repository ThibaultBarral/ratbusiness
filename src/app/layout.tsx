import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";

import { Toaster } from 'sonner';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { UserPlanProvider } from "@/contexts/UserPlanContext";

export const metadata: Metadata = {
  title: "Ratbusiness - Gestion de business Vinted | Suivi des ventes et bénéfices",
  description: "Ratbusiness est l'application de gestion de business Vinted qui vous permet de suivre vos ventes, calculer vos bénéfices et optimiser votre activité. Essayez gratuitement pendant 14 jours.",
  keywords: "Vinted, gestion business, suivi ventes, calcul bénéfices, gestion inventaire, statistiques ventes, business Vinted",
  authors: [{ name: "Ratbusiness" }],
  creator: "Ratbusiness",
  publisher: "Ratbusiness",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ratbusiness.fr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://ratbusiness.fr',
    title: 'Ratbusiness - Gestion de business Vinted | Suivi des ventes et bénéfices',
    description: 'Ratbusiness est l\'application de gestion de business Vinted qui vous permet de suivre vos ventes, calculer vos bénéfices et optimiser votre activité.',
    siteName: 'Ratbusiness',
    images: [
      {
        url: '/assets/img/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ratbusiness - Gestion de business Vinted',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ratbusiness - Gestion de business Vinted',
    description: 'Ratbusiness est l\'application de gestion de business Vinted qui vous permet de suivre vos ventes, calculer vos bénéfices et optimiser votre activité.',
    images: ['/assets/img/og-image.jpg'],
    creator: '@ratbusiness',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon/safari-pinned-tab.svg',
        color: '#5bbad5'
      }
    ]
  },
  manifest: '/favicon/site.webmanifest'
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
      </head>
      <body>
        <UserPlanProvider>
          {children}
        </UserPlanProvider>
        <Toaster richColors position="top-center" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}