import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CohortBuy | Wholesale, reinvented.",
  description: "A new way to shop and sell. Better prices for buyers. Guaranteed demand for sellers.",
  keywords: ["group buying", "collective purchasing", "wholesale prices", "cohort buying", "B2B", "B2C"],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "CohortBuy | Wholesale, reinvented.",
    description: "A new way to shop and sell. Better prices for buyers. Guaranteed demand for sellers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
