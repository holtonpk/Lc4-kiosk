import type { Metadata, Viewport } from "next";
import RemoteNav from "@/components/RemoteNav";
import DebugOverlay from "@/components/DebugOverlay";
import TouchGuards from "@/components/TouchGuards";
import "./globals.css";

export const metadata: Metadata = {
  title: "LC4 — La Casita 4",
  description: "La Casita 4 — There is no substitute.",
};

// Fixed kiosk: lay out at the device width and never pinch-zoom.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black text-white antialiased">
        {children}
        <RemoteNav />
        <TouchGuards />
        <DebugOverlay />
      </body>
    </html>
  );
}
