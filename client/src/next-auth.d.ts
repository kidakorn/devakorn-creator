/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      // 🟢 ลงทะเบียนให้ระบบรู้จัก role และ coinBalance ทั่วทั้งโปรเจกต์
      role?: string;
      coinBalance?: number;
    } & DefaultSession["user"]
  }

  interface User {
    role?: string;
    coinBalance?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    coinBalance?: number;
  }
}