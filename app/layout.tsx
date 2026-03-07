import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://simplesurvey.vercel.app";
const FAVICON_VERSION = "2";

export const metadata: Metadata = {
  title: "Simple Survey — Create and run surveys",
  description: "Simple Survey - Create and run surveys",
  metadataBase: new URL(BASE_URL),
  icons: {
    icon: [
      { url: `/favicon.png?v=${FAVICON_VERSION}`, sizes: "any" },
      { url: `/favicon.png?v=${FAVICON_VERSION}`, sizes: "192x192", type: "image/png" },
    ],
    apple: `/favicon.png?v=${FAVICON_VERSION}`,
  },
  openGraph: {
    title: "Simple Survey — Create and run surveys",
    description: "Simple Survey - Create and run surveys",
    images: [`/favicon.png?v=${FAVICON_VERSION}`],
  },
  twitter: {
    card: "summary",
    title: "Simple Survey — Create and run surveys",
    images: [`/favicon.png?v=${FAVICON_VERSION}`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
