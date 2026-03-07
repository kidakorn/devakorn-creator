import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Import Component ที่เราเพิ่งสร้าง
import DashboardLayout from "@/components/DashboardLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Devakorn Creator AI",
  description: "Your Ultimate AI Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* โยนหน้าที่คลุมหน้าเว็บทั้งหมดไปให้ DashboardLayout จัดการ */}
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}