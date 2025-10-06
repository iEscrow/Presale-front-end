import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import NavBar from "../components/Navbar";
import '@rainbow-me/rainbowkit/styles.css';
import ProvidersWrapper from "./ProvidersWrapper";

export const metadata: Metadata = {
  title: "iEscrow - Presale",
  description: "Join the iEscrow token presale, an ERC-20 token on Ethereum",
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`relative ${poppins.variable} bg-black antialiased w-auto overflow-x-clip`}
      >
        <ProvidersWrapper>
          <NavBar />
          {children}
        </ProvidersWrapper>
      </body>
    </html>
  );
}
