// src/app/layout.js
import "@app/globals.css";
import "leaflet/dist/leaflet.css";  
import  Navbar  from "@components/Navbar";
import  Footer  from "@components/Footer";


  export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <head>
          <title>BizLinker | Connect with Services Near You</title>
          <meta name="description" content="Find and compare service businesses around you with BizLinker." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow container mx-auto p-4">{children}</main>
          <Footer />
        </body>
      </html>
    );
  }

