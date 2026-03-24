/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),

	session: {
		strategy: "jwt",
		maxAge: 30 * 60,
	},

	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" }
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Please enter both email and password");
				}
				const user = await prisma.user.findUnique({ where: { email: credentials.email } });
				if (!user || !user.password) {
					throw new Error("Invalid email or password");
				}
				const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
				if (!isPasswordValid) {
					throw new Error("Invalid email or password");
				}
				return {
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
					role: user.role,
					coinBalance: user.coinBalance,
				} as any;
			}
		})
	],

	callbacks: {
		// 🟢 1. ดักจับการล็อกอิน ถ้าโดนแบนให้เตะกลับ
		async signIn({ user }) {
			if (user?.email) {
				const dbUser = await prisma.user.findUnique({
					where: { email: user.email },
					select: { isBanned: true }
				});
				if (dbUser?.isBanned) {
					return "/login?error=banned"; // ส่ง parameter กลับไปหน้าล็อกอิน
				}
			}
			return true;
		},
		async jwt({ token, user, trigger, session }) {
			if (user) {
				token.role = (user as any).role;
				token.coinBalance = (user as any).coinBalance;
			}

			if (trigger === "update" && session?.coinBalance !== undefined) {
				token.coinBalance = session.coinBalance;
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				(session.user as any).role = token.role;
				(session.user as any).coinBalance = token.coinBalance;
			}
			return session;
		}
	},

	pages: { signIn: "/login" },
	secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };