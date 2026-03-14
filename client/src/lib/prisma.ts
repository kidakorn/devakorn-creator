import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// 🟢 1. บังคับบอก TypeScript ว่า URL มีค่าแน่นอน (as string)
const connectionString = process.env.DATABASE_URL as string;
const pool = new Pool({ connectionString });

// 🟢 2. ใส่ as any เพื่อข้ามการเช็ค Type ที่ขัดแย้งกันของตัวแพ็กเกจ
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 🟢 3. ยัด Adapter เข้าไป
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;