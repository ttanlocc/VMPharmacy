import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';
import { Outfit } from "next/font/google";
import './globals.css';
import { CheckoutProvider } from './context/CheckoutContext';

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: 'swap',
});


export const metadata: Metadata = {
  title: "Pharmacy Fast Order",
  description: "Visual-first prescription template system for retail pharmacists",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0EA5E9",
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
      <body
        className={`${outfit.variable} antialiased bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 min-h-screen`}
      >
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#0f172a',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            },
          }}
        />
        <CheckoutProvider>
          {children}
        </CheckoutProvider>
      </body>
    </html>
  );
}
