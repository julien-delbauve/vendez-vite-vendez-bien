import type { Metadata } from "next";
import LeadGateWrapper from "@/components/LeadGateWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "vendezvitevendezbien.fr — Prix immobiliers dans le Sud-Ouest",
  description:
    "Découvrez les prix de vente moyens dans votre quartier. Données officielles DVF du gouvernement français.",
  openGraph: {
    title: "vendezvitevendezbien.fr — Prix immobiliers dans le Sud-Ouest",
    description:
      "Découvrez les prix de vente moyens dans votre quartier. Données officielles DVF.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>
        <LeadGateWrapper>{children}</LeadGateWrapper>
      </body>
    </html>
  );
}
