import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Placeholders for local fonts until font files are verified and provided.
const clashDisplayPlaceholder = Space_Grotesk({ subsets: ["latin"], variable: "--font-clash" });
const switzerPlaceholder = Inter({ subsets: ["latin"], variable: "--font-switzer" });
const ibmPlexMono = IBM_Plex_Mono({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-ibm-plex-mono" });

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://riotbrewing.co"),
  title: "RIOT BREWING CO. // THE KINETIC BAZAAR",
  description: "A meticulously curated brutalist gallery space interrupted by flashes of vibrant kinetic energy. 05 Beers / 05 Worlds.",
  keywords: ["Riot Brewing Co.", "Kinetic Bazaar", "Craft Beer", "Brutalist Design", "IPA", "Bengal Tiger", "Mumbai"],
  authors: [{ name: "Riot Brewing Co." }],
  openGraph: {
    title: "RIOT BREWING CO. // THE KINETIC BAZAAR",
    description: "A meticulously curated brutalist gallery space interrupted by flashes of vibrant kinetic energy. 05 Beers / 05 Worlds.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/kinetic-poster.jpg",
        width: 1200,
        height: 630,
        alt: "Riot Brewing Co. — The Kinetic Bazaar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RIOT BREWING CO. // THE KINETIC BAZAAR",
    description: "A meticulously curated brutalist gallery space interrupted by flashes of vibrant kinetic energy. 05 Beers / 05 Worlds.",
    images: ["/kinetic-poster.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${clashDisplayPlaceholder.variable} ${switzerPlaceholder.variable} ${ibmPlexMono.variable} font-body bg-paper-white text-ink-black`}>
        {/* Minimal Global Header */}
        <header className="fixed top-0 w-full h-16 border-b border-ink-black flex items-center px-4 sm:px-6 z-50 bg-paper-white select-none">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Riot Brewing Co." 
              className="h-10 w-auto object-contain shrink-0" 
            />
            <div className="font-display font-bold text-lg sm:text-xl tracking-tight uppercase">
              Riot Brewing Co.
            </div>
          </div>
        </header>
        
        {/* Main Canvas */}
        <main className="pt-16 min-h-[calc(100dvh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
