import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { evmNetworks } from "./config/evmNetworks";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrueCanvas",
  description: "ETH SF 2024",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
      <DynamicContextProvider
        settings={{
          environmentId: '1fe0ea7d-b86c-4201-899a-8c4ce19c45c3',
          walletConnectors: [EthereumWalletConnectors],
          overrides: {evmNetworks},
        }}
      >
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </DynamicContextProvider>
      </body>
    </html>
  );
}