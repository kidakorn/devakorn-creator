import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
	// 🟢 Session ต้องเป็น jwt เท่านั้นเมื่อมีการใช้ Credentials (Login ปกติ)
	session: {
		strategy: "jwt",
	},
	providers: [
		// 1. ระบบ Google Login
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		}),

		// 2. ระบบ Email / Password ปกติ
		CredentialsProvider({
			name: "Email and Password",
			credentials: {
				email: { label: "Email", type: "email", placeholder: "you@example.com" },
				password: { label: "Password", type: "password" }
			},
			// ฟังก์ชัน authorize จะถูกเรียกตอนผู้ใช้กดปุ่ม Login
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
				}

				// 🚧 ตรงนี้คือจุดที่เราจะเอาไว้เขียนเช็คกับ Database จริงๆ (Prisma) ใน Module 2
				// ตอนนี้ผมทำ Mockup "บัญชีแอดมินจำลอง" ให้คุณเทสระบบไปก่อนครับ
				if (credentials.email === "admin@devakorn.com" && credentials.password === "123456") {
					// ถ้าล็อกอินผ่าน ให้ส่งข้อมูล User กลับไป
					return {
						id: "999",
						name: "Kidakorn (Admin)",
						email: "admin@devakorn.com",
						image: "https://ui-avatars.com/api/?name=Admin&background=random"
					};
				}

				// ถ้าอีเมลหรือรหัสไม่ตรง
				return null;
			}
		})
	],
	callbacks: {
		async session({ session, token }) {
			if (session?.user) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(session.user as any).id = token.sub;
			}
			return session;
		},
	},
	// 🟢 เพิ่มโค้ดบล็อกนี้เข้าไป เพื่อบอกว่าหน้า Login เราอยู่ที่ /login
	pages: {
		signIn: '/login',
	},
	secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };