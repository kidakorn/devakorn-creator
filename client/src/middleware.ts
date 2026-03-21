export { default } from "next-auth/middleware";

export const config = {
  // 🟢 เติม |$ เข้าไป เพื่อยกเว้นหน้าแรก (/) ให้โชว์ Landing Page ได้
  matcher: [
    "/((?!login|register|api|_next/static|_next/image|favicon.ico|$).*)"
  ],
};