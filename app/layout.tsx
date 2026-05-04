import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Silver Creek Logistics LLC | Aggregate Delivery — Twin Falls, ID",
    template: "%s | Silver Creek Logistics LLC",
  },
  description:
    "Reliable aggregate delivery across Magic Valley, Idaho. Topsoil, gravel, road base, sand, and fill dirt — hauled by our Mack super dump and side dump. Serving Twin Falls, Jerome, Burley, and surrounding areas.",
  keywords: [
    "aggregate delivery Twin Falls Idaho",
    "gravel delivery Magic Valley",
    "topsoil delivery Twin Falls ID",
    "road base hauling Idaho",
    "dump truck rental Twin Falls",
    "fill dirt delivery Jerome Idaho",
    "trucking company Magic Valley",
    "Silver Creek Logistics",
  ],
  openGraph: {
    siteName: "Silver Creek Logistics LLC",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
