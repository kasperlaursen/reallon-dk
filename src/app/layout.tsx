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

export const metadata: Metadata = {
  title: "Realløn.dk - Se din løns reelle købekraft",
  description: "Følg din løns udvikling i forhold til inflationen og se hvordan din købekraft har ændret sig over tid. Beregn din realløn baseret på Danmarks Statistiks forbrugerprisindeks.",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      }
    ],
  },
  openGraph: {
    title: "Realløn.dk - Se din løns reelle købekraft",
    description: "Følg din løns udvikling i forhold til inflationen og se hvordan din købekraft har ændret sig over tid.",
    url: "https://reallon.dk",
    siteName: "Realløn.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
