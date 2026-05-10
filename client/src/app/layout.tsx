/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/AuthProvider";
import LanguageWrapper from "@/components/LanguageWrapper";
import Script from "next/script"; // 🟢 เพิ่ม import Script จาก Next.js

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

// 🟢 อัปเดต Metadata แบบครบถ้วนสำหรับ SEO และ Open Graph (เวลาแชร์ลิงก์)
export const metadata: Metadata = {
  title: "Devakorn Creator AI | สร้างรูปภาพและวิดีโอระดับมืออาชีพด้วย AI",
  description: "แพลตฟอร์ม AI สร้างสรรค์ผลงานสำหรับนักออกแบบและคอนเทนต์ครีเอเตอร์ รวดเร็ว สวยงาม และใช้งานง่าย",
  keywords: "AI, Image Generation, Video Generation, Devakorn AI, สร้างรูป AI, สร้างวิดีโอ AI",
  openGraph: {
    title: "Devakorn Creator AI",
    description: "แพลตฟอร์ม AI สำหรับสร้างรูปภาพและวิดีโอระดับมืออาชีพในไม่กี่วินาที",
    url: "https://www.devakorn.com",
    siteName: "Devakorn AI",
    images: [
      {
        url: "https://www.devakorn.com/og-image.jpg", // คำแนะนำ: หารูปแบนเนอร์เว็บขนาด 1200x630 เซฟชื่อ og-image.jpg ไปใส่ไว้ในโฟลเดอร์ public ครับ
        width: 1200,
        height: 630,
      },
    ],
    locale: "th_TH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* 🟢 โค้ด Google AdSense เตรียมพร้อมใช้งาน (ตอนนี้ Comment ไว้ก่อน รอขออนุมัติผ่านค่อยเอาออกครับ) */}
        {/* <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        /> */}
      </head>
      <body className={`${inter.variable} font-sans bg-gray-50 text-text-main antialiased`}>
        <Toaster position="top-center" reverseOrder={false} />
        <AuthProvider>
          <LanguageWrapper>
            {children}
          </LanguageWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}