export { default } from "next-auth/middleware";

export const config = {
  // 🟢 matcher คือการกำหนดว่าหน้าไหน "ต้องล็อกอิน" ถึงจะเข้าได้บ้าง
  // โค้ดด้านล่างนี้หมายถึง: "ล็อคทุกหน้า ยกเว้นหน้า /login, /register, /api และไฟล์ระบบพื้นฐาน"
  matcher: [
    "/((?!login|register|api|_next/static|_next/image|favicon.ico).*)"
  ],
};