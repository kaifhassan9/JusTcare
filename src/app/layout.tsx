import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "JusTcare",
  description: "Your Online Pharmacy Store",
  icons: {
    icon: "/favicon.svg", 
  },
};

export default function RootLayout({
  children,
  loginModal,
}: {
  children: React.ReactNode;
  loginModal: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className={`${poppins.variable} ${roboto.variable}`}>
        <CartProvider>
          {children}
          {loginModal}
        </CartProvider>
      </body>
    </html>
  );
}