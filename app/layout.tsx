import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CartProvider } from "@/lib/cart/CartProvider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const DESCRIPTION = "Supermarché en ligne livré à Paris et en Île-de-France : les meilleurs produits, aux meilleurs prix";

export const metadata: Metadata = {
  // URL publique du site (obligatoire pour que les images de partage soient en URL absolue).
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Marché de Yama",
  description: DESCRIPTION,
  // L'image de partage vient de app/opengraph-image.png et app/twitter-image.png.
  openGraph: { type: "website", siteName: "Marché de Yama", title: "Marché de Yama", description: DESCRIPTION, locale: "fr_FR" },
  twitter: { card: "summary_large_image", title: "Marché de Yama", description: DESCRIPTION },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
