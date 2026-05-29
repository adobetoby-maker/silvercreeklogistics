import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import PwaInstall from "@/components/PwaInstall";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

const inter = Inter({ subsets: ["latin"] });

const BASE_URL = "https://silvercreeklogistics.worker-bee.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
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
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    siteName: "Silver Creek Logistics LLC",
    locale: "en_US",
    type: "website",
    url: BASE_URL,
    title: "Silver Creek Logistics LLC | Aggregate Delivery — Twin Falls, ID",
    description:
      "Reliable aggregate delivery across Magic Valley, Idaho. Topsoil, gravel, road base, sand, and fill dirt. Serving Twin Falls, Jerome, Burley, and surrounding areas.",
    images: [
      {
        url: `${BASE_URL}/images/hero.jpg`,
        width: 1200,
        height: 630,
        alt: "Silver Creek Logistics — Aggregate Delivery Twin Falls Idaho",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Silver Creek Logistics LLC | Aggregate Delivery — Twin Falls, ID",
    description:
      "Reliable aggregate delivery across Magic Valley, Idaho. Topsoil, gravel, road base, sand, and fill dirt.",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Silver Creek Logistics LLC",
  description:
    "Reliable aggregate delivery across Magic Valley, Idaho. Topsoil, gravel, road base, sand, and fill dirt.",
  url: BASE_URL,
  telephone: "+1-208-555-0100",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Twin Falls",
    addressRegion: "ID",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 42.5629,
    longitude: -114.4609,
  },
  areaServed: ["Twin Falls, ID", "Jerome, ID", "Burley, ID", "Magic Valley, ID"],
  serviceType: ["Aggregate Delivery", "Topsoil Delivery", "Gravel Delivery", "Road Base Hauling"],
  image: `${BASE_URL}/images/hero.jpg`,
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Silver Creek Logistics LLC",
  url: BASE_URL,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <meta name="theme-color" content="#1a2744" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SCL Dispatch" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <PwaInstall />
        {children}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
