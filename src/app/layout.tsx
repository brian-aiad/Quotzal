import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Quotzal — Insurance Intake, Simplified",
    template: "%s | Quotzal",
  },
  description:
    "Send a link. Get everything you need. Quotzal helps insurance brokers collect client info with smart intake forms.",
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: "Quotzal — Insurance Intake, Simplified",
    description:
      "Stop chasing clients for info. One link collects everything you need to quote — organized, instant, professional.",
    url: "https://quotzal.com",
    siteName: "Quotzal",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
