export { default } from "next-auth/middleware";

export const config = {
  // 🟢 เติม forgot-password และ reset-password เข้าไปในกลุ่มข้อยกเว้น
  matcher: [
    "/((?!login|register|forgot-password|reset-password|api|_next/static|_next/image|favicon.ico|$).*)"
  ],
};