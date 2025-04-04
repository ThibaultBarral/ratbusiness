import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Ratbusiness",
  description: "Dashboard de gestion des ventes et bénéfices sur Vinted.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/assets/img/logo-ratbusiness.png" type="image/png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
      </head>
      <body>{children}</body>
    </html>
  );
}