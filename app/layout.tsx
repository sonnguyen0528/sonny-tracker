import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { NavSidebar } from "@/components/nav-sidebar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Sonny Performance Tracker",
  description: "Track workouts, nutrition, and health metrics",
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
        <NavSidebar />
        <main className="md:ml-64 min-h-screen p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
