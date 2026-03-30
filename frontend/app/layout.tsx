import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "ShipNovo | 4PL Logistics Command Center",
  description: "Orchestrating multi-modal freight, customs, and warehousing with precision.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="h-full antialiased font-sans bg-background text-foreground transition-colors duration-300" suppressHydrationWarning>
        <ErrorBoundary>
          <I18nProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              enableColorScheme={false}
              disableTransitionOnChange
            >
              <QueryProvider>
                <AuthProvider>
                  {children}
                </AuthProvider>
              </QueryProvider>
            </ThemeProvider>
          </I18nProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
