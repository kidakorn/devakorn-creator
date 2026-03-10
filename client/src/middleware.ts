import { withAuth } from "next-auth/middleware";

export default withAuth({
	pages: {
		signIn: "/login", // ถ้ายังไม่ล็อกอิน ให้เด้งไปหน้า /login
	},
});

// กำหนดว่าจะให้ยามเฝ้าหน้าไหนบ้าง
export const config = {
	// บังคับล็อกอินทุกหน้า ยกเว้นหน้า /login และ api 
	matcher: [
		"/((?!login|api|_next/static|_next/image|favicon.ico).*)",
	],
};