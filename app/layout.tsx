import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_URL, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

/** Site-wide defaults. Pages override title, description and canonical. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.bio,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // next-themes sets the theme class on <html> before hydration.
    <html
      lang="en"
      className={cn("font-sans antialiased", geistSans.variable, geistMono.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-svh flex-col">
        <ThemeProvider>
          <SkipLink />
          <SiteHeader />
          {/* Pages set their own width: max-w-content (reading) or max-w-wide (grids). */}
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
