// ROMANOV RECORDS — root layout
// Fonts loaded via @font-face in globals.css (next/font incompatible with Babel)
import type { Metadata } from "next";
import "./globals.css";
import DevBrowserGuard from "@/components/DevBrowserGuard";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Romanov Records",
  description:
    "Профессиональная студия звукозаписи. Москва, ул. Тимура Фрунзе 16, 5 минут от метро Парк Культуры.",
  applicationName: "Romanov Records",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
    title: "Romanov Records — Студия звукозаписи в Москве",
    description:
      "Профессиональная студия звукозаписи. Москва, ул. Тимура Фрунзе 16, 5 минут от метро Парк Культуры.",
    siteName: "Romanov Records — Студия звукозаписи в Москве",
    images: [{ url: "/og-image.png", width: 1200, height: 1200 }],
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Romanov Records — Студия звукозаписи в Москве",
    description: "Профессиональная студия звукозаписи в Москве",
    images: ["/og-image.png"],
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: "Romanov Records — Студия звукозаписи в Москве",
  alternateName: "Romanov Records",
  url: siteUrl,
  description:
    "Профессиональная студия звукозаписи. Москва, ул. Тимура Фрунзе 16, 5 минут от метро Парк Культуры.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "ул. Тимура Фрунзе, 16",
    addressLocality: "Москва",
    addressCountry: "RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <head>
        <DevBrowserGuard />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body style={{ position: "relative" }}>
        <div aria-hidden="true" className="site-background" />
        {children}
      </body>
    </html>
  );
}
