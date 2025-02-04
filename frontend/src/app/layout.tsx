import { ReactNode } from "react";
import Navbar from "@/app/components/Navbar";
import { AuthProvider } from "@/app/context/AuthContext";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto p-6 min-h-screen">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}