import "./globals.css";
import { ReactNode } from "react";
import Navbar from "./components/Navbar";
import { Inter } from "next/font/google";

const roboto = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "Voter Portal",
  description: "A minimalist portal for multi election voting",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} font-mono bg-gray-50 text-gray-800`}
    >
      <body>
        <Navbar />
        <main className="w-full min-h-[calc(100vh-72px)]">{children}</main>
      </body>
    </html>
  );
}
