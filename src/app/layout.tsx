import type { Metadata } from "next";
import { Inter, Alice } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/ui/provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const alice = Alice({
  variable: "--font-alice",
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Affillia Sports | Elite Football Agency",
  description: "Elite representation for elite performers in football",
  icons: {
    icon: [
      { url: '/images/logos/favicon.svg', type: 'image/svg+xml' },
      { url: '/images/logos/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/logos/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/images/logos/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logos/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${inter.variable} ${alice.variable} antialiased`}
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
