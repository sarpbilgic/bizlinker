import "@app/globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BizLinker",
  description: "Find and compare local services near you",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 text-gray-800 flex flex-col min-h-screen`}>
        <Navbar />
        <main className="container mx-auto flex-1 flex flex-col lg:flex-row py-6 gap-6 px-4">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
