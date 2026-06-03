'use client';
import { usePathname } from "next/navigation";
import "./globals.css";
import Navigation from "@/Components/Navigation";
import { Roboto, Work_Sans } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${workSans.variable}`}>
        {/* {pathname !== "/about" && <Navigation />} */}
        {children}
      </body>
    </html>
  );
}
