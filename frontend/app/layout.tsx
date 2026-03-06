import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "ShipNovo | 4PL Logistics Command Center",
  description: "Orchestrating multi-modal freight, customs, and warehousing with precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full antialiased font-sans bg-background text-foreground transition-colors duration-300">
        <ErrorBoundary>
          <I18nProvider>
            <QueryProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </QueryProvider>
          </I18nProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
